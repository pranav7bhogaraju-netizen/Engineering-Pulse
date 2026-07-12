"""
Domain + track classification for items that don't come with a domain_hint
(e.g. Hacker News, general news feeds).

FREE VERSION: keyword-based matching instead of an LLM call. No API key,
no cost. Trade-off: less accurate than an LLM read of the actual content —
it can miscategorize cleverly-worded titles or miss implicit topics — but
it's $0 to run at any frequency.

If you later want higher accuracy, swap this module for an LLM-based
version (Anthropic, OpenAI, or a local model) using the same
classify_batch(items) interface — nothing else in the pipeline needs to
change.
"""

DOMAIN_KEYWORDS = {
    "ee": [
        "circuit", "voltage", "current", "transistor", "semiconductor",
        "chip", "pcb", "amplifier", "signal processing", "embedded",
        "microcontroller", "fpga", "electrical", "power supply", "sensor",
        "battery", "bms", "capacitor", "resistor", "rf ", "wireless",
        "processor", "cpu", "gpu", "asic", "silicon", "wafer", "arduino",
        "raspberry pi", "iot", "5g", "antenna", "radar", "led", "diode",
        "power grid", "electric vehicle", "ev charging", "solar panel",
        "nvidia", "intel", "amd", "qualcomm", "tsmc",
    ],
    "me": [
        "mechanical", "engine", "gear", "bearing", "actuator", "hydraulic",
        "pneumatic", "robot", "robotics", "cad", "manufacturing", "cnc",
        "3d print", "additive manufacturing", "hvac", "thermodynamic",
        "fluid dynamics", "mechanism", "motor", "turbine", "compressor",
        "prototype", "machining", "welding", "assembly line", "automation",
        "boston dynamics", "humanoid robot", "exoskeleton",
    ],
    "ce": [
        "bridge", "building", "structural", "concrete", "construction",
        "infrastructure", "civil engineering", "seismic", "foundation",
        "highway", "urban planning", "geotechnical", "skyscraper", "dam",
        "tunnel", "road", "transit", "railway", "urban infrastructure",
        "water treatment", "sewer", "flood",
    ],
    "aero": [
        "aircraft", "aerospace", "rocket", "spacecraft", "satellite",
        "drone", "uav", "propulsion", "aerodynamic", "nasa", "spacex",
        "faa", "aviation", "orbital", "launch vehicle", "reentry",
        "space station", "mars mission", "lunar", "jet engine", "airline",
        "boeing", "airbus", "blue origin", "starship", "iss",
    ],
    "chem": [
        "chemical", "polymer", "catalyst", "reaction", "synthesis",
        "chemistry", "molecule", "compound", "petrochemical", "plastic",
        "chemical plant", "refinery", "fertilizer", "pesticide",
        "chemical engineering", "distillation", "chemical reactor",
    ],
    "materials": [
        "materials science", "alloy", "composite", "nanomaterial",
        "coating", "corrosion", "crystalline", "metallurgy", "graphene",
        "ceramic", "superconductor", "nanotechnology", "thin film",
        "semiconductor material", "carbon fiber", "polymer composite",
    ],
    "biomed": [
        "biomedical", "medical device", "prosthetic", "biosensor",
        "diagnostic", "implant", "healthcare technology", "bioengineering",
        "medical imaging", "surgical robot", "wearable health", "fda",
        "clinical trial", "tissue engineering", "drug delivery device",
        "medical", "clinical", "wearable device", "surgical", "pacemaker",
        "prosthesis", "biotech",
    ],
    "cs": [
        "software", "algorithm", "programming", "code", "ai model",
        "machine learning", "neural network", "database", "api",
        "cloud computing", "cybersecurity", "app", "framework", "github",
        "open source", "programming language", "compiler", "operating system",
        "linux", "python", "rust", "javascript", "kubernetes", "docker",
        "llm", "large language model", "data center", "server", "encryption",
        "security vulnerability", "hack", "breach", "startup",
    ],
}

# Titles/excerpts containing these are treated as not engineering-relevant
# even if a keyword happens to match — keeps pure business/politics/lifestyle
# content out of the feed.
EXCLUDE_KEYWORDS = [
    "celebrity", "box office", "recipe", "diet", "horoscope",
]


import re


def _compile_keyword_pattern(keywords: list[str]) -> re.Pattern:
    # \b word-boundary matching prevents false positives like "engine"
    # matching inside "engineering", or "app" matching inside "happen".
    # The optional trailing "s?" lets plurals ("drones", "sensors") still
    # match their singular keyword without needing every entry listed twice.
    escaped = [re.escape(kw.strip()) for kw in keywords]
    return re.compile(r"\b(?:" + "|".join(escaped) + r")s?\b")


_DOMAIN_PATTERNS = None  # built lazily on first use, see _get_patterns()


def _get_patterns():
    global _DOMAIN_PATTERNS
    if _DOMAIN_PATTERNS is None:
        _DOMAIN_PATTERNS = {
            domain: _compile_keyword_pattern(keywords)
            for domain, keywords in DOMAIN_KEYWORDS.items()
        }
    return _DOMAIN_PATTERNS


def classify_item(title: str, excerpt: str) -> dict:
    text = f"{title} {excerpt}".lower()

    if any(term in text for term in EXCLUDE_KEYWORDS):
        return {"domains": [], "is_engineering_relevant": False, "novelty_score": 0}

    matched_domains = []
    for domain, pattern in _get_patterns().items():
        if pattern.search(text):
            matched_domains.append(domain)

    if not matched_domains:
        return {"domains": [], "is_engineering_relevant": False, "novelty_score": 0}

    # Neutral default novelty score — with no LLM read of significance,
    # ranking leans more heavily on recency/engagement for these items
    # (see rank.py's score_technical/score_news weighting).
    return {
        "domains": matched_domains[:2],
        "is_engineering_relevant": True,
        "novelty_score": 50,
    }


def classify_batch(items: list[dict]) -> list[dict]:
    """Mutates each item dict in place with 'domains' and 'novelty_score',
    and drops items with no matching domain keywords."""
    tagged = []
    for item in items:
        result = classify_item(item["title"], item.get("raw_excerpt", ""))
        if not result["is_engineering_relevant"]:
            continue
        item["domains"] = result["domains"]
        item["novelty_score"] = result["novelty_score"]
        tagged.append(item)
    return tagged
