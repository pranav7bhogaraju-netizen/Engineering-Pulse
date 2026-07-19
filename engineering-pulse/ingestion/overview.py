"""
Generates a short AI overview of the current top items per (track, sort
mode) combination, using Gemini's free-tier text API. Called once per
ingestion cycle (hourly), not per page-visit — keeps API usage minimal
and gives every visitor the same current summary.

Produces 4 overviews: technical/top, technical/new, news/top, news/new —
so the panel can match whichever sort a visitor has selected instead of
always describing the Top-ranked items regardless of what's shown.
"""

import os
import requests

GEMINI_MODEL = "gemini-flash-latest"  # alias, avoids version-deprecation issues
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"


def _call_gemini(prompt: str) -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set.")

    resp = requests.post(
        f"{GEMINI_URL}?key={api_key}",
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.4},
        },
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    return text.strip()


def _build_prompt(track: str, sort_mode: str, titles: list[str]) -> str:
    track_label = "technical papers" if track == "technical" else "engineering news"
    ranking_context = (
        "ranked highest by engagement/importance"
        if sort_mode == "top"
        else "the most recently published"
    )
    bulleted = "\n".join(f"- {t}" for t in titles)
    return f"""You are writing a brief overview of today's {ranking_context} {track_label}
on an engineering aggregator site. Here are the headlines:

{bulleted}

Write a 2-3 sentence overview identifying any real patterns or themes
across these items (e.g. a domain that's especially active, a recurring
topic). If there's no clear pattern, just briefly describe the mix of
topics covered instead of forcing a connection. Keep it factual and
concise — no hype, no exclamation points. Respond with ONLY the overview
text, no preamble."""


def _fetch_titles(cur, track: str, sort_mode: str) -> list[str]:
    order_clause = (
        "COALESCE(item_scores.composite_score, 0) DESC, items.published_at DESC"
        if sort_mode == "top"
        else "items.published_at DESC"
    )
    cur.execute(
        f"""
        SELECT items.title
        FROM items
        LEFT JOIN item_scores ON items.id = item_scores.item_id
        WHERE items.track = %s
        ORDER BY {order_clause}
        LIMIT 12
        """,
        (track,),
    )
    return [row[0] for row in cur.fetchall()]


def generate_overviews(cur):
    """Generate and upsert overviews for every (track, sort_mode)
    combination. Any single failure is logged and swallowed rather than
    raised — an overview failing shouldn't fail the whole ingestion run."""
    for track in ("technical", "news"):
        for sort_mode in ("top", "new"):
            try:
                titles = _fetch_titles(cur, track, sort_mode)
                if not titles:
                    continue

                summary = _call_gemini(_build_prompt(track, sort_mode, titles))

                cur.execute(
                    """
                    INSERT INTO feed_overviews (track, sort_mode, summary, generated_at)
                    VALUES (%s, %s, %s, now())
                    ON CONFLICT (track, sort_mode)
                    DO UPDATE SET summary = EXCLUDED.summary, generated_at = now()
                    """,
                    (track, sort_mode, summary),
                )
                print(f"  Generated {track}/{sort_mode} overview.")
            except Exception as e:
                print(f"  Skipping {track}/{sort_mode} overview: {e}")
