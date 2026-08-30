import type { Report } from "./data";
import { LOCATIONS } from "./data";

/* ---------------- tokenisation ---------------- */

const STOPWORDS = new Set([
  "a", "an", "the", "my", "i", "me", "it", "its", "is", "was", "were", "am",
  "are", "be", "been", "of", "in", "on", "at", "to", "for", "with", "and",
  "or", "but", "left", "lose", "lost", "find", "found", "somewhere", "has",
  "have", "had", "contains", "contain", "containing", "inside", "some",
  "any", "that", "this", "these", "those", "from", "by", "as", "into",
  "onto", "over", "under", "during", "after", "before", "no", "not", "looks",
  "look", "there", "here", "when", "where", "who", "what", "pm", "am",
]);

const SYNONYM_GROUPS: string[][] = [
  ["wallet", "purse", "pocketbook", "billfold"],
  ["id", "identification", "identity", "license"],
  ["college", "student", "university", "campus", "school"],
  ["phone", "smartphone", "iphone", "mobile", "cellphone"],
  ["laptop", "macbook", "computer", "pc", "notebook-computer"],
  ["earbuds", "earphones", "airpods", "headphones", "earpod", "buds"],
  ["bottle", "flask", "thermos", "sipper"],
  ["hoodie", "sweatshirt", "jumper", "pullover"],
  ["bag", "backpack", "satchel", "rucksack"],
  ["key", "keys", "keychain"],
  ["glasses", "spectacles", "specs", "sunglasses", "shades"],
  ["book", "textbook", "books"],
  ["note", "notes", "notebook", "notepad", "diary"],
  ["umbrella", "parasol", "brolly"],
  ["watch", "wristwatch"],
  ["charger", "adapter", "charging"],
  ["calculator", "calc"],
  ["lanyard", "strap"],
  ["cash", "money", "rupees"],
  ["case", "cover", "pouch"],
  ["near", "outside", "beside", "front", "back", "around", "next"],
  ["worn", "scratched", "scuffed", "damaged"],
];

const CANON = new Map<string, string>();
for (const group of SYNONYM_GROUPS) {
  for (const t of group) CANON.set(t, group[0]);
}

export function canonical(token: string): string {
  return CANON.get(token) ?? token;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

interface WeightedToken {
  tok: string;
  w: number;
}

function extractTokens(r: Report): WeightedToken[] {
  const out: WeightedToken[] = [];
  for (const t of tokenize(r.title)) out.push({ tok: canonical(t), w: 2 });
  for (const tag of r.tags)
    for (const t of tokenize(tag)) out.push({ tok: canonical(t), w: 2 });
  for (const t of tokenize(r.description)) out.push({ tok: canonical(t), w: 1 });
  return out;
}

function tagTokens(r: Report): WeightedToken[] {
  const out: WeightedToken[] = [];
  for (const tag of r.tags)
    for (const t of tokenize(tag)) out.push({ tok: canonical(t), w: 2 });
  return out;
}

/* ---------------- fuzzy similarity ---------------- */

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0 || n === 0) return Math.max(m, n);
  const dp = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return dp[n];
}

function fuzzyCredit(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 5 || b.length < 5) return 0;
  const ratio = 1 - levenshtein(a, b) / Math.max(a.length, b.length);
  return ratio >= 0.8 ? 0.85 : 0;
}

/* ---------------- colour normalisation ---------------- */

const COLOR_SYNONYMS: Record<string, string> = {
  navy: "blue",
  darkblue: "blue",
  gray: "grey",
  silver: "grey",
  golden: "yellow",
  maroon: "red",
  crimson: "red",
  offwhite: "white",
};

function normalizeColors(colors: string[]): Set<string> {
  const out = new Set<string>();
  for (const c of colors) {
    const key = c.toLowerCase().replace(/\s+/g, "");
    out.add(COLOR_SYNONYMS[key] ?? key);
  }
  return out;
}

/* ---------------- geo & time ---------------- */

function locCoords(name: string): { x: number; y: number } | null {
  const l = LOCATIONS.find((x) => x.name === name);
  return l ? { x: l.x, y: l.y } : null;
}

export function locationDistance(a: string, b: string): number | null {
  const pa = locCoords(a);
  const pb = locCoords(b);
  if (!pa || !pb) return null;
  return Math.hypot(pa.x - pb.x, pa.y - pb.y);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T12:00:00`).getTime();
  const db = new Date(`${b}T12:00:00`).getTime();
  return Math.round((db - da) / 86_400_000);
}

/* ---------------- scoring ---------------- */

export interface Reason {
  label: string;
  detail: string;
  points: number;
  max: number;
  positive: boolean;
}

export interface MatchResult {
  item: Report;
  score: number;
  reasons: Reason[];
  sharedTokens: string[];
}

export const WEIGHTS = {
  text: 45,
  category: 15,
  color: 12,
  location: 13,
  timeline: 10,
  tags: 5,
};

export function scoreTier(score: number): "strong" | "possible" | "weak" {
  if (score >= 80) return "strong";
  if (score >= 60) return "possible";
  return "weak";
}

export const TIER_META = {
  strong: { label: "Strong match", color: "var(--color-pine)" },
  possible: { label: "Possible match", color: "var(--color-amber)" },
  weak: { label: "Long shot", color: "var(--color-ink-mute)" },
} as const;

/** Compare a report against a candidate of the opposite type. */
export function compareReports(subject: Report, candidate: Report): MatchResult {
  const reasons: Reason[] = [];

  /* --- language overlap (weighted, synonym-aware, fuzzy) --- */
  const A = extractTokens(subject);
  const B = extractTokens(candidate);
  const totalA = A.reduce((s, t) => s + t.w, 0);
  const totalB = B.reduce((s, t) => s + t.w, 0);

  const matchedLabels = new Map<string, number>();
  let overlap = 0;
  for (const a of A) {
    let best = 0;
    for (const b of B) best = Math.max(best, fuzzyCredit(a.tok, b.tok));
    if (best > 0) {
      overlap += a.w * best;
      matchedLabels.set(a.tok, (matchedLabels.get(a.tok) ?? 0) + a.w);
    }
  }
  const jaccard = overlap / Math.max(1, totalA + totalB - overlap);
  const coverage = overlap / Math.max(1, Math.min(totalA, totalB));
  const textSim = 0.3 * jaccard + 0.7 * coverage;
  const textPts = WEIGHTS.text * textSim;

  const sharedTokens = [...matchedLabels.entries()]
    .sort((x, y) => y[1] - x[1])
    .map(([t]) => t)
    .slice(0, 6);

  reasons.push({
    label: "Language overlap",
    detail:
      sharedTokens.length > 0
        ? `Shared meaning: ${sharedTokens.join(" · ")}`
        : "Almost no shared keywords",
    points: textPts,
    max: WEIGHTS.text,
    positive: sharedTokens.length > 0,
  });

  /* --- category --- */
  let catSim = 0;
  let catDetail = `Different categories (${subject.category} vs ${candidate.category})`;
  if (subject.category === candidate.category) {
    catSim = 1;
    catDetail = `Both filed under “${subject.category}”`;
  } else if (subject.category === "Other" || candidate.category === "Other") {
    catSim = 0.45;
    catDetail = `One side is “Other” — partial credit`;
  }
  reasons.push({
    label: "Category",
    detail: catDetail,
    points: WEIGHTS.category * catSim,
    max: WEIGHTS.category,
    positive: catSim > 0.5,
  });

  /* --- colour --- */
  const ca = normalizeColors(subject.colors);
  const cb = normalizeColors(candidate.colors);
  let colorSim = 0.5;
  let colorDetail = "Colour not specified on one side";
  const common = [...ca].filter((c) => cb.has(c));
  if (ca.has("notsure") || cb.has("notsure")) {
    colorSim = 0.6;
    colorDetail = "Colour uncertain on one side";
  } else if (ca.size > 0 && cb.size > 0) {
    if (common.length > 0) {
      colorSim = 1;
      colorDetail = `“${common[0]}” appears in both reports`;
    } else {
      colorSim = 0;
      colorDetail = `Colours differ (${subject.colors[0]} vs ${candidate.colors[0]})`;
    }
  }
  reasons.push({
    label: "Colour",
    detail: colorDetail,
    points: WEIGHTS.color * colorSim,
    max: WEIGHTS.color,
    positive: colorSim >= 0.6,
  });

  /* --- location proximity (map units ≈ 4 m) --- */
  const dist = locationDistance(subject.location, candidate.location);
  let locSim = 0.5;
  let locDetail = "Unknown area on one side";
  if (dist !== null) {
    if (dist === 0) {
      locSim = 1;
      locDetail = `Same spot: ${subject.location}`;
    } else {
      locSim = Math.max(0, 1 - dist / 70);
      locDetail = `≈${Math.round(dist * 4)} m apart: ${subject.location} ↔ ${candidate.location}`;
    }
  }
  reasons.push({
    label: "Location",
    detail: locDetail,
    points: WEIGHTS.location * locSim,
    max: WEIGHTS.location,
    positive: locSim >= 0.7,
  });

  /* --- timeline: found items should come after the loss --- */
  const lost = subject.type === "lost" ? subject : candidate;
  const found = subject.type === "found" ? subject : candidate;
  const gap = daysBetween(lost.date, found.date);
  let timeSim = 0.6;
  let timeDetail = "Dates missing — neutral credit";
  if (!Number.isNaN(gap)) {
    if (gap < 0) {
      timeSim = 0;
      timeDetail = `Reported ${-gap} day(s) before the loss — unlikely`;
    } else if (gap <= 1) {
      timeSim = 1;
      timeDetail =
        gap === 0 ? "Found the same day it was lost" : "Found 1 day after the loss";
    } else {
      timeSim = Math.max(0.15, 1 - (gap - 1) / 14);
      timeDetail = `Found ${gap} days after the loss`;
    }
  }
  reasons.push({
    label: "Timeline",
    detail: timeDetail,
    points: WEIGHTS.timeline * timeSim,
    max: WEIGHTS.timeline,
    positive: timeSim >= 0.8,
  });

  /* --- contents / tags --- */
  const ta = tagTokens(subject);
  const tb = tagTokens(candidate);
  let tagOverlap = 0;
  const sharedTags: string[] = [];
  for (const a of ta) {
    let best = 0;
    for (const b of tb) best = Math.max(best, fuzzyCredit(a.tok, b.tok));
    if (best > 0) {
      tagOverlap += a.w * best;
      if (!sharedTags.includes(a.tok)) sharedTags.push(a.tok);
    }
  }
  const tagTotalA = ta.reduce((s, t) => s + t.w, 0);
  const tagTotalB = tb.reduce((s, t) => s + t.w, 0);
  const tagSim =
    tagTotalA > 0 && tagTotalB > 0
      ? Math.min(1, tagOverlap / Math.max(1, tagTotalA + tagTotalB - tagOverlap))
      : 0.3;
  reasons.push({
    label: "Contents & tags",
    detail:
      sharedTags.length > 0
        ? `Both mention: ${sharedTags.slice(0, 4).join(", ")}`
        : "No shared contents declared",
    points: WEIGHTS.tags * tagSim,
    max: WEIGHTS.tags,
    positive: sharedTags.length > 0,
  });

  const raw =
    textPts +
    WEIGHTS.category * catSim +
    WEIGHTS.color * colorSim +
    WEIGHTS.location * locSim +
    WEIGHTS.timeline * timeSim +
    WEIGHTS.tags * tagSim;

  return {
    item: candidate,
    score: Math.max(2, Math.min(99, Math.floor(raw))),
    reasons,
    sharedTokens,
  };
}

/** Rank all opposite-type reports against `subject`. */
export function getMatches(subject: Report, reports: Report[]): MatchResult[] {
  return reports
    .filter((r) => r.id !== subject.id && r.type !== subject.type && r.status === "active")
    .map((r) => compareReports(subject, r))
    .filter((m) => m.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

/** Best active pairs for the radar board. */
export function topPairs(reports: Report[], limit = 4): { subject: Report; match: MatchResult }[] {
  const out: { subject: Report; match: MatchResult }[] = [];
  const usedFound = new Set<string>();
  const losts = reports
    .filter((r) => r.type === "lost" && r.status === "active")
    .map((r) => ({ r, best: getMatches(r, reports)[0] }))
    .filter((x) => x.best && x.best.score >= 60)
    .sort((a, b) => (b.best?.score ?? 0) - (a.best?.score ?? 0));
  for (const { r, best } of losts) {
    if (!best || usedFound.has(best.item.id)) continue;
    usedFound.add(best.item.id);
    out.push({ subject: r, match: best });
    if (out.length >= limit) break;
  }
  return out;
}

/* ---------------- formatting helpers ---------------- */

export function formatDate(iso: string): string {
  const dt = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function daysAgo(iso: string): string {
  const dt = new Date(`${iso}T12:00:00`).getTime();
  const diff = Math.floor((Date.now() - dt) / 86_400_000);
  if (diff <= 0) return "today";
  if (diff === 1) return "1d ago";
  if (diff < 30) return `${diff}d ago`;
  return `${Math.floor(diff / 30)}mo ago`;
}
