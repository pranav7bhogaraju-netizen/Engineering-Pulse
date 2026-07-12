import { SignalItem, DOMAINS } from "@/lib/mockData";

function domainLabel(slug: string) {
  return DOMAINS.find((d) => d.slug === slug)?.label ?? slug;
}

function timeAgo(iso: string) {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function SignalCard({ item }: { item: SignalItem }) {
  const trackColor = item.track === "technical" ? "text-pcb" : "text-copper";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block border border-paper-dim/20 bg-ink-raised/60 hover:border-copper/50 transition-colors p-5"
    >
      <div className="flex items-center justify-between mb-3 font-mono text-[11px] uppercase tracking-wider">
        <span className={trackColor}>
          {item.track === "technical" ? "◇ Technical" : "○ News"}
        </span>
        <span className="text-paper-dim">{timeAgo(item.publishedAt)}</span>
      </div>

      <h3 className="font-display font-medium text-lg leading-snug mb-2 group-hover:text-copper-bright transition-colors">
        {item.title}
      </h3>

      <p className="text-sm text-paper-dim leading-relaxed mb-4">{item.summary}</p>

      <div className="flex items-center justify-between font-mono text-[11px]">
        <div className="flex flex-wrap gap-1.5">
          {item.domains.map((slug) => (
            <span
              key={slug}
              className="px-2 py-0.5 border border-paper-dim/30 text-paper-dim uppercase tracking-wide"
            >
              {domainLabel(slug)}
            </span>
          ))}
        </div>
        <span className="text-paper-dim">
          {item.source} ·{" "}
          <span className="text-copper-bright">
            {item.score} {item.track === "technical" ? "importance" : "engagement"}
          </span>
        </span>
      </div>
    </a>
  );
}
