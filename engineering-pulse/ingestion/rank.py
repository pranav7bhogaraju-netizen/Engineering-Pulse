"""
Composite scoring, split by track since "important" means different things
for a paper vs. a news item.

Technical track:  weighted toward novelty_score (LLM) + recency.
                   Citation count could be folded in later via Semantic
                   Scholar's API, keyed off the arXiv id.
News track:        weighted toward engagement (HN points/comments, etc.)
                   + recency, with novelty_score as a smaller boost.

Recency uses exponential decay so yesterday's viral post doesn't outrank
this morning's smaller one forever.
"""

import math
from datetime import datetime, timezone


def recency_factor(published_at: datetime, half_life_hours: float = 36) -> float:
    age_hours = (datetime.now(timezone.utc) - published_at).total_seconds() / 3600
    return math.pow(0.5, age_hours / half_life_hours)


def normalize_engagement(engagement_raw: dict) -> float:
    points = engagement_raw.get("points", 0)
    comments = engagement_raw.get("comments", 0)
    # Simple log-scaled combination — tune once you have real distribution data
    return min(100, 10 * math.log1p(points + 2 * comments))


def score_technical(item: dict, published_at: datetime) -> float:
    novelty = item.get("novelty_score", 50)
    return round(0.75 * novelty + 25 * recency_factor(published_at), 2)


def score_news(item: dict, published_at: datetime) -> float:
    engagement = normalize_engagement(item.get("engagement_raw", {}))
    novelty = item.get("novelty_score", 50)
    return round(
        0.6 * engagement + 0.2 * novelty + 20 * recency_factor(published_at), 2
    )


def score_item(item: dict, published_at: datetime) -> float:
    if item["track"] == "technical":
        return score_technical(item, published_at)
    return score_news(item, published_at)
