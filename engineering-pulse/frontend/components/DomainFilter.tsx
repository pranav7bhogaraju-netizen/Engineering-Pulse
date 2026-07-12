"use client";

import { DOMAINS } from "@/lib/mockData";

interface Props {
  active: string;
  onChange: (slug: string) => void;
}

export default function DomainFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by domain">
      <FilterChip label="All" active={active === "all"} onClick={() => onChange("all")} />
      {DOMAINS.map((d) => (
        <FilterChip
          key={d.slug}
          label={d.label}
          active={active === d.slug}
          onClick={() => onChange(d.slug)}
        />
      ))}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`font-mono text-xs uppercase tracking-wide px-3 py-1.5 rounded-sm border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-copper ${
        active
          ? "bg-copper text-ink border-copper"
          : "bg-transparent text-paper-dim border-paper-dim/30 hover:border-copper/60 hover:text-paper"
      }`}
    >
      {label}
    </button>
  );
}
