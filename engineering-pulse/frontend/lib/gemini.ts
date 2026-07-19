// Lightweight wrapper around Gemini's REST API — no SDK dependency needed,
// just fetch. Uses the free-tier Gemini 2.5 Flash text model.
//
// Each feature area uses its own API key from a separate Google AI Studio
// project, so each has a fully independent daily quota pool — heavy usage
// in one feature can never block another:
//   GEMINI_API_KEY           — fallback, used if a feature-specific key isn't set
//   GEMINI_API_KEY_PROFILE   — profile picture generation + display phrase suggestion
//   GEMINI_API_KEY_REVIEW    — resource submission review
//   GEMINI_API_KEY_OVERVIEW  — feed overviews

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function resolveKey(specific?: string): string | undefined {
  return specific || process.env.GEMINI_API_KEY;
}

async function callGemini(prompt: string, temperature = 0.7, apiKey?: string): Promise<string> {
  const key = apiKey ?? process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text.");
  return text;
}

export async function suggestDisplayPhrase(context: string): Promise<string> {
  const prompt = `Write a short, genuinely catchy display phrase (max 10 words)
for an engineering student's profile on a site called Engineering Pulse.
Base it on this context about their activity on the site:

${context}

Make it punchy and specific, not generic corporate-speak. Favor wit,
wordplay, or a bit of personality over safe/bland phrasing. Some examples
of the TONE to aim for (don't reuse these, just match the energy):
- "Breaking circuits before they break me"
- "Still debugging my sleep schedule"
- "Building things that (mostly) don't explode"

Respond with ONLY the phrase itself — no quotes, no explanation, no markdown.`;

  const result = await callGemini(prompt, 1.0, resolveKey(process.env.GEMINI_API_KEY_PROFILE));
  return result.trim().replace(/^["']|["']$/g, "");
}

export async function generateSvgArt(userPrompt: string): Promise<string> {
  const prompt = `Generate a simple, visually appealing SVG image based on
this request: "${userPrompt}"

Requirements:
- Respond with ONLY raw SVG markup, starting with <svg and ending with </svg>
- No markdown code fences, no explanation, no text before or after
- Use a viewBox of "0 0 200 200" so it renders as a square profile picture
- Keep it abstract/geometric/iconic — shapes, gradients, patterns work best
- No <script> tags, no event handler attributes (onclick, onload, etc.) —
  keep it purely decorative markup
- Use a color palette fitting a technical/engineering aesthetic: navy
  (#0E1A2B), copper/amber (#C77B3B), and muted green (#4C8066) work well`;

  const result = await callGemini(prompt, 0.7, resolveKey(process.env.GEMINI_API_KEY_PROFILE));

  // Strip any markdown fences the model might add despite instructions,
  // and extract just the <svg>...</svg> block defensively.
  const match = result.match(/<svg[\s\S]*<\/svg>/i);
  if (!match) {
    throw new Error("Gemini did not return valid SVG markup.");
  }

  let svg = match[0];

  // Defense in depth: even though the prompt asks for no scripts/handlers,
  // strip anything executable before this ever reaches a browser. This
  // matters because SVG (unlike a raster image) can contain <script> tags
  // and JS event handlers — stripping them here means even a
  // prompt-injected or malformed response can't become a stored XSS risk.
  svg = svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "");

  return svg;
}

const VALID_DOMAINS = ["ee", "me", "ce", "aero", "chem", "materials", "biomed", "cs"];
const VALID_TYPES = ["course", "video", "reference", "tool", "database"];

export interface ResourceClassification {
  relevant: boolean;
  domains: string[];
  resource_type: string;
  description: string;
  reason?: string;
}

interface FetchedPageInfo {
  title: string | null;
  description: string | null;
  textSample: string | null;
  fetchFailed: boolean;
}

// Fetches the actual linked page and extracts its real title/description
// from <title> and Open Graph meta tags — present even on JS-heavy SPAs
// (YouTube, etc.), since platforms rely on them for link-preview cards.
// This is what lets the classifier catch someone claiming a link is about
// one thing when the page is actually about something else entirely.
async function fetchPageInfo(url: string): Promise<FetchedPageInfo> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        // A browser-like UA reduces the chance of being blocked outright;
        // this is only reading public metadata, same as any link-preview
        // bot (Slack, Discord, etc.) would.
        "User-Agent":
          "Mozilla/5.0 (compatible; EngineeringPulseBot/1.0; +https://engineering-pulse.vercel.app)",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return { title: null, description: null, textSample: null, fetchFailed: true };

    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
    const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);

    const title = (ogTitleMatch?.[1] || titleMatch?.[1] || "").trim() || null;
    const description = (ogDescMatch?.[1] || metaDescMatch?.[1] || "").trim() || null;

    // Rough visible-text sample as a fallback signal, stripping tags/scripts
    // crudely — good enough for the model to get a general sense of the
    // page, not meant to be a clean extraction.
    const textSample = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1500);

    return { title, description, textSample: textSample || null, fetchFailed: false };
  } catch {
    return { title: null, description: null, textSample: null, fetchFailed: true };
  }
}

export async function classifyResourceSubmission(
  title: string,
  url: string,
  userDescription: string
): Promise<ResourceClassification> {
  const page = await fetchPageInfo(url);

  const verificationBlock = page.fetchFailed
    ? `Could not fetch the actual page content (it may block bots, require
login, or be a heavy JS app with no server-rendered content). Since you
can't verify the claim against real content, be MORE skeptical than usual
— only approve if the title/URL/description combination is genuinely
plausible and internally consistent, with no red flags.`
    : `Here's what was ACTUALLY found at that URL — use this to verify the
user's claim, don't just trust their title:
Actual page title: ${page.title || "(none found)"}
Actual page description: ${page.description || "(none found)"}
Actual page text sample: ${page.textSample || "(none found)"}

If the user's claimed title/description doesn't genuinely match what's
actually on the page, this is a MISMATCH and must be rejected — this is
the single most important check. A user claiming a video is about
"Thermodynamics" when the actual page is a sports highlights reel is
exactly the kind of submission to reject, with the reason explaining the
mismatch clearly.`;

  const prompt = `You are reviewing a user-submitted resource for an
engineering education site. Evaluate whether it's a genuine, relevant
resource for engineering students/professionals (not spam, not off-topic,
not a broken/placeholder link, and NOT mislabeled/deceptive).

User's claimed title: ${title}
URL: ${url}
User's claimed description: ${userDescription || "(none provided)"}

${verificationBlock}

Respond with ONLY a JSON object, no markdown fences, no other text:
{
  "relevant": true or false,
  "domains": [array of applicable slugs from: ${VALID_DOMAINS.join(", ")} — empty array if not relevant],
  "resource_type": one of ${VALID_TYPES.join(", ")} (best guess),
  "description": a clear 1-sentence description based on the ACTUAL content (use the user's if it's accurate, otherwise write one based on the real page content),
  "reason": if relevant is false, a specific reason why (e.g. "title claims this is about thermodynamics, but the actual page is a sports highlights video")
}

Be reasonably permissive for genuinely relevant, accurately-described
content — err toward "relevant: true" for anything plausibly educational
or useful to an engineer, even if niche. But be strict about mismatches
between what's claimed and what's actually there — that's deceptive
regardless of whether the real content happens to be spam or not.`;

  const result = await callGemini(prompt, 0.2, resolveKey(process.env.GEMINI_API_KEY_REVIEW));
  const match = result.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Gemini did not return valid JSON.");
  }

  const parsed = JSON.parse(match[0]);
  const domains = Array.isArray(parsed.domains)
    ? parsed.domains.filter((d: string) => VALID_DOMAINS.includes(d))
    : [];

  return {
    relevant: Boolean(parsed.relevant) && domains.length > 0,
    domains,
    resource_type: VALID_TYPES.includes(parsed.resource_type) ? parsed.resource_type : "reference",
    description: typeof parsed.description === "string" ? parsed.description : userDescription,
    reason: typeof parsed.reason === "string" ? parsed.reason : undefined,
  };
}

export async function generateFeedOverview(
  track: "technical" | "news",
  sortMode: "top" | "new",
  titles: string[]
): Promise<string> {
  const trackLabel = track === "technical" ? "technical papers" : "engineering news";
  const rankingContext =
    sortMode === "top" ? "ranked highest by engagement/importance" : "the most recently published";
  const bulleted = titles.map((t) => `- ${t}`).join("\n");

  const prompt = `You are writing a brief overview of today's ${rankingContext} ${trackLabel}
on an engineering aggregator site. Here are the headlines:

${bulleted}

Write a 2-3 sentence overview identifying any real patterns or themes
across these items (e.g. a domain that's especially active, a recurring
topic). If there's no clear pattern, just briefly describe the mix of
topics covered instead of forcing a connection. Keep it factual and
concise — no hype, no exclamation points. Respond with ONLY the overview
text, no preamble.`;

  const result = await callGemini(prompt, 0.4, resolveKey(process.env.GEMINI_API_KEY_OVERVIEW));
  return result.trim();
}
