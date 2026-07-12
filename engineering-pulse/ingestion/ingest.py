"""
Orchestrator — run on a schedule (cron / GitHub Actions / Vercel Cron).

    python ingest.py

Loop: pull each configured source -> tag domain/track -> score -> upsert
into Postgres. Kept intentionally simple (no async, no queue) since a
few dozen sources polling hourly doesn't need more than that yet.
"""

import os
from datetime import datetime, timezone
from dateutil import parser as dateparser
import psycopg2
import psycopg2.extras

from config import SOURCES
from sources import fetch_arxiv, fetch_hn, fetch_rss
from classify import classify_batch
from rank import score_item

DB_URL = os.environ.get("DATABASE_URL", "postgresql://localhost/engineering_pulse").strip()


def fetch_for_source(source: dict) -> list[dict]:
    if source["kind"] == "arxiv":
        raw = fetch_arxiv(source["query"])
    elif source["kind"] == "hn":
        raw = fetch_hn()
    elif source["kind"] == "rss":
        raw = fetch_rss(source["url"])
    else:
        raise ValueError(f"Unknown source kind: {source['kind']}")

    for item in raw:
        item["track"] = source["track"]
        item["source_name"] = source["name"]
        item["domains"] = source.get("domain_hint")  # may be None -> classify.py fills in
    return raw


def upsert_item(cur, item: dict, score: float):
    cur.execute(
        """
        INSERT INTO items (title, url, external_id, track, published_at,
                            raw_excerpt, engagement_raw, source_name)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (url) DO UPDATE SET
            source_name = EXCLUDED.source_name,
            engagement_raw = EXCLUDED.engagement_raw
        RETURNING id
        """,
        (
            item["title"], item["url"], item.get("external_id"),
            item["track"], item["published_at_parsed"],
            item.get("raw_excerpt", ""),
            psycopg2.extras.Json(item.get("engagement_raw", {})),
            item.get("source_name", "Unknown source"),
        ),
    )
    item_id = cur.fetchone()[0]

    for domain in item.get("domains") or []:
        cur.execute(
            "INSERT INTO item_domains (item_id, domain_slug) VALUES (%s, %s) "
            "ON CONFLICT DO NOTHING",
            (item_id, domain),
        )

    cur.execute(
        """
        INSERT INTO item_scores (item_id, novelty_score, engagement_score, composite_score)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (item_id) DO UPDATE SET composite_score = EXCLUDED.composite_score
        """,
        (item_id, item.get("novelty_score", 50), 0, score),
    )


def run():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    for source in SOURCES:
        print(f"Fetching: {source['name']}")
        items = fetch_for_source(source)

        # Parse dates up front so classify/score both get a real datetime
        for item in items:
            try:
                item["published_at_parsed"] = dateparser.parse(item["published_at"])
                if item["published_at_parsed"].tzinfo is None:
                    item["published_at_parsed"] = item["published_at_parsed"].replace(
                        tzinfo=timezone.utc
                    )
            except (ValueError, TypeError):
                item["published_at_parsed"] = datetime.now(timezone.utc)

        # Split into items that already have a domain (pre-tagged sources
        # like arXiv feeds) and items that need the keyword classifier.
        pre_tagged = [i for i in items if i.get("domains")]
        needs_classification = [i for i in items if not i.get("domains")]

        # classify_batch DROPS items it decides aren't engineering-relevant
        # (returns a shorter list) — using its return value, rather than
        # the original unfiltered list, is what actually enforces that
        # filtering. Previously this return value was discarded, so
        # irrelevant items (empty domains) were being inserted anyway.
        classified = classify_batch(needs_classification) if needs_classification else []
        items = pre_tagged + classified

        for item in items:
            if "novelty_score" not in item:
                item["novelty_score"] = 50  # neutral default for pre-tagged sources
            score = score_item(item, item["published_at_parsed"])
            upsert_item(cur, item, score)

        conn.commit()

    cur.close()
    conn.close()
    print("Ingestion run complete.")


if __name__ == "__main__":
    run()
