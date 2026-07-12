"""
Domain + track classification for items that don't come with a domain_hint
(e.g. Hacker News, general news feeds). Uses the Anthropic API with a
structured JSON response.

This is a stub — wire in your ANTHROPIC_API_KEY and test on a small batch
before running it across a full ingestion pass, since this is the main
recurring cost in the pipeline.
"""

import json
import os
import anthropic

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

DOMAIN_SLUGS = ["ee", "me", "ce", "aero", "chem", "materials", "biomed", "cs"]

CLASSIFY_PROMPT = """You are tagging engineering content for an aggregator.
Given the title and excerpt below, respond with ONLY a JSON object, no
other text, no markdown fences:

{{"domains": [list of 1-2 slugs from {domains}], "is_engineering_relevant": true|false, "novelty_score": 0-100}}

novelty_score reflects technical significance/originality, not popularity.

Title: {title}
Excerpt: {excerpt}
"""


def classify_item(title: str, excerpt: str) -> dict:
    prompt = CLASSIFY_PROMPT.format(
        domains=DOMAIN_SLUGS, title=title, excerpt=excerpt[:800]
    )
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = response.content[0].text.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Model occasionally wraps in fences despite instructions — strip and retry once
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)


def classify_batch(items: list[dict]) -> list[dict]:
    """Mutates each item dict in place with 'domains', 'novelty_score',
    and drops items the model flags as not engineering-relevant."""
    tagged = []
    for item in items:
        result = classify_item(item["title"], item.get("raw_excerpt", ""))
        if not result.get("is_engineering_relevant", True):
            continue
        item["domains"] = result.get("domains", [])
        item["novelty_score"] = result.get("novelty_score", 50)
        tagged.append(item)
    return tagged
