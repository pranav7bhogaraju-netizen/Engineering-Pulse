"""
Generates a short AI overview of the current top items per track
(technical/news), using Gemini's free-tier text API. Called once per
ingestion cycle (hourly), not per page-visit — keeps API usage minimal
and gives every visitor the same current summary.
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


def _build_prompt(track: str, titles: list[str]) -> str:
    track_label = "technical papers" if track == "technical" else "engineering news"
    bulleted = "\n".join(f"- {t}" for t in titles)
    return f"""You are writing a brief overview of today's top {track_label}
on an engineering aggregator site. Here are the current top headlines:

{bulleted}

Write a 2-3 sentence overview identifying any real patterns or themes
across these items (e.g. a domain that's especially active, a recurring
topic). If there's no clear pattern, just briefly describe the mix of
topics covered instead of forcing a connection. Keep it factual and
concise — no hype, no exclamation points. Respond with ONLY the overview
text, no preamble."""


def generate_overviews(cur):
    """Fetch top items per track, generate an overview for each, and
    upsert into feed_overviews. Any failure here is logged and swallowed
    rather than raised — an overview failing shouldn't fail the whole
    ingestion run, since it's a nice-to-have on top of real data."""
    for track in ("technical", "news"):
        try:
            cur.execute(
                """
                SELECT items.title
                FROM items
                LEFT JOIN item_scores ON items.id = item_scores.item_id
                WHERE items.track = %s
                ORDER BY COALESCE(item_scores.composite_score, 0) DESC, items.published_at DESC
                LIMIT 12
                """,
                (track,),
            )
            titles = [row[0] for row in cur.fetchall()]
            if not titles:
                continue

            summary = _call_gemini(_build_prompt(track, titles))

            cur.execute(
                """
                INSERT INTO feed_overviews (track, summary, generated_at)
                VALUES (%s, %s, now())
                ON CONFLICT (track) DO UPDATE SET summary = EXCLUDED.summary, generated_at = now()
                """,
                (track, summary),
            )
            print(f"  Generated {track} overview.")
        except Exception as e:
            print(f"  Skipping {track} overview: {e}")
