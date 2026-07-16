"""
Fetchers for each source kind. Each returns a list of normalized dicts:
{title, url, external_id, published_at, raw_excerpt, engagement_raw}
"""

import feedparser
import requests
from datetime import datetime, timezone


def fetch_arxiv(query: str, max_results: int = 25) -> list[dict]:
    base = "http://export.arxiv.org/api/query"
    params = {
        "search_query": query,
        "sortBy": "submittedDate",
        "sortOrder": "descending",
        "max_results": max_results,
    }
    resp = requests.get(base, params=params, timeout=15)
    resp.raise_for_status()
    feed = feedparser.parse(resp.text)

    items = []
    for entry in feed.entries:
        items.append({
            "title": entry.title.replace("\n", " ").strip(),
            "url": entry.link,
            "external_id": entry.id,
            "published_at": entry.published,
            "raw_excerpt": entry.summary[:500],
            "engagement_raw": {},  # arXiv has no engagement signal; novelty
                                    # score will lean on the LLM pass instead
        })
    return items


def fetch_hn(min_points: int = 50, max_results: int = 30) -> list[dict]:
    top_ids = requests.get(
        "https://hacker-news.firebaseio.com/v0/topstories.json", timeout=10
    ).json()[:100]

    items = []
    for story_id in top_ids:
        try:
            story = requests.get(
                f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json",
                timeout=10,
            ).json()
        except requests.exceptions.RequestException:
            # One story's request resetting/timing out shouldn't cost us
            # the other 99 — just skip it and keep going.
            continue

        if not story or story.get("score", 0) < min_points:
            continue
        if "url" not in story:
            continue  # skip Ask HN / text-only posts for the aggregator
        items.append({
            "title": story["title"],
            "url": story["url"],
            "external_id": str(story_id),
            "published_at": datetime.fromtimestamp(
                story["time"], tz=timezone.utc
            ).isoformat(),
            "raw_excerpt": "",
            "engagement_raw": {
                "points": story.get("score", 0),
                "comments": story.get("descendants", 0),
            },
        })
        if len(items) >= max_results:
            break
    return items


def fetch_rss(url: str, max_results: int = 25) -> list[dict]:
    feed = feedparser.parse(url)
    items = []
    for entry in feed.entries[:max_results]:
        items.append({
            "title": entry.get("title", "").strip(),
            "url": entry.get("link", ""),
            "external_id": entry.get("id", entry.get("link", "")),
            "published_at": entry.get("published", ""),
            "raw_excerpt": entry.get("summary", "")[:500],
            "engagement_raw": {},
        })
    return items
