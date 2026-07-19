// Lightweight wrapper around Gemini's REST API — no SDK dependency needed,
// just fetch. Uses the free-tier Gemini 2.5 Flash text model for both plain
// text suggestions and SVG "art" generation (SVG is markup/text, so a text
// model can write it directly — no paid image-generation model needed).

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGemini(prompt: string, temperature = 0.7): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
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

  const result = await callGemini(prompt, 1.0);
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

  const result = await callGemini(prompt);

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
