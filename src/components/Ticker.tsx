import type { Report } from "../lib/data";
import { topPairs } from "../lib/matching";

export default function Ticker({ reports }: { reports: Report[] }) {
  const pairs = topPairs(reports, 5);
  const reunited = reports.filter((r) => r.status === "returned");

  const items: string[] = [
    ...reunited.map((r) => `REUNITED · ${r.id} ${r.title.toUpperCase()}`),
    ...pairs.map(
      (p) =>
        `POSSIBLE MATCH · ${p.subject.id} ↔ ${p.match.item.id} · ${p.match.score}% SIMILARITY`,
    ),
    `${reports.filter((r) => r.status === "active").length} ACTIVE CASES ON THE BOARD`,
    "SECURITY DESK · ADMIN BLOCK 004 · MON–SAT 9:00–17:00",
    "TIP · MENTION CONTENTS (IDS, STICKERS, INITIALS) — TAGS SHARPEN MATCHES",
  ];

  const row = [...items, ...items];

  return (
    <div className="relative z-10 overflow-hidden border-y border-ink bg-ink py-2.5">
      <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap">
        {row.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-8 font-mono text-[11px] tracking-[0.14em] text-paper/85"
          >
            <span>{t}</span>
            <svg width="7" height="7" viewBox="0 0 8 8" aria-hidden>
              <rect
                x="4"
                y="0"
                width="5.6"
                height="5.6"
                transform="rotate(45 4 0)"
                fill="var(--color-signal)"
              />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
