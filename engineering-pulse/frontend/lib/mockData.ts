export type Track = "technical" | "news";

export interface Domain {
  slug: string;
  label: string;
}

export const DOMAINS: Domain[] = [
  { slug: "ee", label: "Electrical & Computer" },
  { slug: "me", label: "Mechanical" },
  { slug: "ce", label: "Civil & Structural" },
  { slug: "aero", label: "Aerospace" },
  { slug: "chem", label: "Chemical" },
  { slug: "materials", label: "Materials Science" },
  { slug: "biomed", label: "Biomedical" },
  { slug: "cs", label: "Software & CS" },
];

export interface SignalItem {
  id: number;
  title: string;
  url: string;
  source: string;
  domains: string[];
  track: Track;
  summary: string;
  score: number;
  publishedAt: string;
}

export const MOCK_ITEMS: SignalItem[] = [
  {
    id: 1,
    title: "Sub-1V bandgap reference achieves 8ppm/°C drift using curvature-compensated trim",
    url: "https://arxiv.org/abs/example1",
    source: "arXiv eess.SY",
    domains: ["ee"],
    track: "technical",
    summary:
      "A new trim technique cancels second-order curvature in a bandgap reference, holding drift under 8ppm/°C across -40 to 125°C without extra calibration steps.",
    score: 91,
    publishedAt: "2026-07-10T14:00:00Z",
  },
  {
    id: 2,
    title: "Boston Dynamics opens Atlas locomotion controller research to select labs",
    url: "https://example.com/atlas-controller",
    source: "IEEE Spectrum",
    domains: ["me", "cs"],
    track: "news",
    summary:
      "Select university labs get early access to Atlas's whole-body controller stack, aimed at accelerating humanoid locomotion research outside Boston Dynamics.",
    score: 87,
    publishedAt: "2026-07-11T09:00:00Z",
  },
  {
    id: 3,
    title: "Topology optimization framework cuts bracket mass 34% while holding fatigue life",
    url: "https://arxiv.org/abs/example2",
    source: "arXiv cs.CE",
    domains: ["me", "materials"],
    track: "technical",
    summary:
      "A gradient-based topology optimization pipeline targets fatigue-critical brackets directly, rather than optimizing for stiffness and checking fatigue after the fact.",
    score: 84,
    publishedAt: "2026-07-09T11:00:00Z",
  },
  {
    id: 4,
    title: "New FAA rule streamlines part 107 waivers for BVLOS drone inspection flights",
    url: "https://example.com/faa-bvlos",
    source: "Aerospace News Wire",
    domains: ["aero"],
    track: "news",
    summary:
      "The FAA's updated waiver process cuts approval time for beyond-visual-line-of-sight inspection flights from months to weeks for operators meeting new sensor requirements.",
    score: 79,
    publishedAt: "2026-07-10T18:30:00Z",
  },
  {
    id: 5,
    title: "Solid-state electrolyte reaches 12 mS/cm ionic conductivity at room temperature",
    url: "https://arxiv.org/abs/example3",
    source: "arXiv cond-mat.mtrl-sci",
    domains: ["materials", "chem"],
    track: "technical",
    summary:
      "A sulfide-based solid electrolyte formulation hits conductivity competitive with liquid electrolytes, narrowing a key gap for solid-state battery adoption.",
    score: 88,
    publishedAt: "2026-07-08T08:00:00Z",
  },
  {
    id: 6,
    title: "Hackaday: open-source e-stop module for e-bike builds passes UL-adjacent bench testing",
    url: "https://example.com/estop-hackaday",
    source: "Hackaday",
    domains: ["ee", "me"],
    track: "news",
    summary:
      "A community-built emergency stop module for DIY e-bikes cuts motor current within 40ms of trigger, tested against informal UL-style bench criteria.",
    score: 76,
    publishedAt: "2026-07-11T06:15:00Z",
  },
];
