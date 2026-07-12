"""
Source configuration. Add/remove feeds here — ingest.py loops over this list.

kind:  'arxiv' | 'hn' | 'rss'
track: 'technical' | 'news'
domain_hint: pre-assigned domain slug(s), or None to let classify.py tag it
"""

SOURCES = [
    # --- Technical track ---
    {
        "name": "arXiv eess (Electrical Engineering & Systems Science)",
        "kind": "arxiv",
        "track": "technical",
        "query": "cat:eess.SY OR cat:eess.SP",
        "domain_hint": ["ee"],
    },
    {
        "name": "arXiv cs.AR / cs.RO (Architecture, Robotics)",
        "kind": "arxiv",
        "track": "technical",
        "query": "cat:cs.AR OR cat:cs.RO",
        "domain_hint": ["cs", "me"],
    },
    {
        "name": "arXiv cond-mat.mtrl-sci (Materials Science)",
        "kind": "arxiv",
        "track": "technical",
        "query": "cat:cond-mat.mtrl-sci",
        "domain_hint": ["materials"],
    },
    {
        "name": "arXiv q-bio.TO / eess.IV (Biomedical & Medical Imaging)",
        "kind": "arxiv",
        "track": "technical",
        "query": "cat:q-bio.TO OR cat:eess.IV",
        "domain_hint": ["biomed"],
    },
    {
        "name": "arXiv physics.geo-ph (Geophysics / Civil & Structural)",
        "kind": "arxiv",
        "track": "technical",
        "query": "cat:physics.geo-ph OR abs:\"structural engineering\" OR abs:\"civil engineering\"",
        "domain_hint": ["ce"],
    },
    {
        "name": "arXiv physics.flu-dyn + aerospace keywords",
        "kind": "arxiv",
        "track": "technical",
        "query": "cat:physics.flu-dyn OR abs:aerospace OR abs:aircraft OR abs:aerodynamic",
        "domain_hint": ["aero"],
    },
    {
        "name": "arXiv physics.chem-ph (Chemical Physics / Chemical Engineering)",
        "kind": "arxiv",
        "track": "technical",
        "query": "cat:physics.chem-ph",
        "domain_hint": ["chem"],
    },
    {
        "name": "Digi-Key New Products RSS",
        "kind": "rss",
        "track": "technical",
        "url": "https://www.digikey.com/en/rss/new-products",
        "domain_hint": ["ee"],
    },

    # --- News track ---
    {
        "name": "Hacker News (front page)",
        "kind": "hn",
        "track": "news",
        "domain_hint": None,  # classify.py tags these
    },
    {
        "name": "IEEE Spectrum",
        "kind": "rss",
        "track": "news",
        "url": "https://spectrum.ieee.org/feeds/feed.rss",
        "domain_hint": ["ee"],
    },
    {
        "name": "Hackaday",
        "kind": "rss",
        "track": "news",
        "url": "https://hackaday.com/feed/",
        "domain_hint": None,
    },
    {
        "name": "ASME News",
        "kind": "rss",
        "track": "news",
        "url": "https://www.asme.org/rss-feeds/news",
        "domain_hint": ["me"],
    },
    {
        "name": "Ars Technica",
        "kind": "rss",
        "track": "news",
        "url": "https://feeds.arstechnica.com/arstechnica/index",
        "domain_hint": None,
    },
    {
        "name": "MedTech Dive",
        "kind": "rss",
        "track": "news",
        "url": "https://www.medtechdive.com/feeds/news/",
        "domain_hint": ["biomed"],
    },
    {
        "name": "NASA Breaking News",
        "kind": "rss",
        "track": "news",
        "url": "https://www.nasa.gov/rss/dyn/breaking_news.rss",
        "domain_hint": ["aero"],
    },
    {
        "name": "C&EN Latest News (Chemical & Engineering News)",
        "kind": "rss",
        "track": "news",
        "url": "https://cen.acs.org/feeds/rss/latestnews.xml",
        "domain_hint": ["chem"],
    },
]

# Civil & Structural news: no reliably stable public RSS feed found for ENR
# (Engineering News-Record) at the time this was written — their feed URLs
# appear to require a subscription/wrapper service. If you find a working
# one, add it here the same way as the sources above.

# Note: IEEE Xplore and ACM Digital Library require registered API keys and
# have stricter usage caps — add them here once you have credentials:
# IEEE_API_KEY = os.environ.get("IEEE_API_KEY")
# ACM_API_KEY = os.environ.get("ACM_API_KEY")
