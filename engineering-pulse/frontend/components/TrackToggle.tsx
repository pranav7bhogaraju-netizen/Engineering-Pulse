"use client";

interface Props {
  active: "all" | "technical" | "news";
  onChange: (track: "all" | "technical" | "news") => void;
}

const OPTIONS: { value: Props["active"]; label: string }[] = [
  { value: "all", label: "Both" },
  { value: "technical", label: "Technical" },
  { value: "news", label: "News" },
];

export default function TrackToggle({ active, onChange }: Props) {
  return (
    <div className="inline-flex shrink-0 border border-paper-dim/30 rounded-sm overflow-hidden">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          aria-pressed={active === opt.value}
          className={`font-mono text-xs uppercase tracking-wide px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-copper ${
            active === opt.value
              ? "bg-pcb text-ink"
              : "bg-transparent text-paper-dim hover:text-paper"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
