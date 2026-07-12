"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/pranav-krishna-bhogaraju" },
  { label: "YouTube", href: "https://www.youtube.com/@lazycrazyturtle6294" },
  { label: "GitHub", href: "https://github.com/pranav7bhogaraju-netizen" },
  { label: "Email", href: "mailto:pranav7bhogaraju@gmail.com" },
];

function Headshot() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    // Falls back to an initials circle if /public/headshot.jpg hasn't
    // been added yet, or fails to load for any reason.
    return (
      <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-copper/50 bg-ink-raised flex items-center justify-center font-display font-bold text-3xl text-copper shrink-0">
        PKB
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/headshot.jpg"
      alt="Pranav Krishna Bhogaraju"
      onError={() => setFailed(true)}
      className="w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-copper/50 object-cover shrink-0"
    />
  );
}

export default function About() {
  return (
    <main className="min-h-screen">
      <section className="relative border-b border-paper-dim/20 bg-blueprint bg-blueprint px-6 py-14 md:py-20 overflow-hidden">
        <div className="crop-mark crop-mark--tl m-4" />
        <div className="crop-mark crop-mark--tr m-4" />
        <div className="crop-mark crop-mark--bl m-4" />
        <div className="crop-mark crop-mark--br m-4" />

        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-block font-mono text-xs uppercase tracking-widest text-paper-dim hover:text-copper-bright transition-colors mb-8"
          >
            ← Back to Engineering Pulse
          </Link>

          <div className="flex flex-col sm:flex-row gap-6 sm:items-center mb-10">
            <Headshot />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper mb-2">
                About the builder
              </p>
              <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight">
                Pranav Krishna Bhogaraju
              </h1>
            </div>
          </div>

          <div className="space-y-8 text-paper-dim leading-relaxed">
            <p>
              I'm a rising junior at Rutgers doing an honors degree in
              mechanical engineering. I have a mixed love for aircraft and
              automobiles — I built a drone back in 8th grade, and I'm
              currently working on an automated RC car. Outside of
              engineering, I have a strong passion for music and am a
              trained vocalist, and I run a small YouTube channel at my own
              interest and pace.
            </p>

            <div>
              <h2 className="font-display font-medium text-lg text-paper mb-2">
                Why I built Engineering Pulse
              </h2>
              <p>
                I wanted to see how far I could push my limits with AI while
                still building something that genuinely benefits engineers —
                a single place to catch the papers and news that actually
                matter, across disciplines, without the noise.
              </p>
            </div>

            <div>
              <h2 className="font-display font-medium text-lg text-paper mb-3">
                Find me elsewhere
              </h2>
              <div className="flex flex-wrap gap-2">
                {LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="font-mono text-xs uppercase tracking-wide px-3 py-1.5 border border-paper-dim/30 rounded-sm text-paper-dim hover:text-copper-bright hover:border-copper/50 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
