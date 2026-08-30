import { useState } from "react";
import type { Report } from "../lib/data";
import type { MatchResult } from "../lib/matching";
import { formatDate, scoreTier } from "../lib/matching";
import { IconArrow, IconPin } from "./icons";

const TIER_HEX: Record<string, string> = {
  strong: "#3fae90",
  possible: "#e8b23a",
  weak: "#8b9a90",
};

interface Pair {
  subject: Report;
  match: MatchResult;
}

function MiniCard({
  report,
  side,
  dim,
  onClick,
}: {
  report: Report;
  side: "lost" | "found";
  dim: boolean;
  onClick: () => void;
}) {
  const isLost = side === "lost";
  return (
    <button
      onClick={onClick}
      className={`group/card w-full border bg-card text-left transition-all duration-300 ${
        dim ? "opacity-25" : "opacity-100"
      } ${
        isLost
          ? "border-signal/60 hover:border-signal hover:-translate-y-0.5"
          : "border-cobalt/60 hover:border-cobalt hover:-translate-y-0.5"
      } p-2.5 shadow-[3px_3px_0_rgba(0,0,0,0.35)]`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`font-mono text-[10px] font-semibold tracking-widest ${
            isLost ? "text-signal" : "text-cobalt"
          }`}
        >
          {isLost ? "LOST" : "FOUND"} · {report.id}
        </span>
        <IconArrow
          size={12}
          className={`shrink-0 transition-transform duration-300 group-hover/card:translate-x-0.5 ${
            isLost ? "text-signal" : "text-cobalt"
          }`}
        />
      </div>
      <p className="mt-1 truncate font-display text-[13.5px] font-bold leading-tight text-ink">
        {report.title}
      </p>
      <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-ink-mute">
        <IconPin size={10} className="shrink-0" />
        <span className="truncate">
          {report.location} · {formatDate(report.date)}
        </span>
      </p>
    </button>
  );
}

export default function MatchRadar({
  pairs,
  onOpen,
}: {
  pairs: Pair[];
  onOpen: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const ys = pairs.map((_, i) => 13 + i * 24.5);

  return (
    <div className="relative overflow-hidden border border-ink-soft bg-ink text-paper shadow-lift">
      {/* panel chrome */}
      <div className="dark-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-pine/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-signal/10 blur-2xl" />

      <div className="relative flex items-center justify-between gap-3 border-b border-paper/10 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="pulse-dot h-2 w-2 rounded-full bg-pine" />
          <h2 className="font-mono text-[11px] font-semibold tracking-[0.22em] text-paper">
            LIVE MATCH RADAR
          </h2>
        </div>
        <p className="hidden font-mono text-[10px] tracking-wider text-paper/50 sm:block">
          HYBRID SIMILARITY · 6 SIGNALS · RE-SCANS ON EVERY REPORT
        </p>
      </div>

      {pairs.length === 0 && (
        <div className="relative px-6 py-16 text-center">
          <p className="font-display text-lg font-bold text-paper/80">Radar is quiet.</p>
          <p className="mt-1 font-mono text-[11px] tracking-wide text-paper/45">
            EVERY CASE IS EITHER REUNITED OR WAITING — FILE A REPORT TO WAKE THE ENGINE
          </p>
        </div>
      )}

      {/* desktop: connector board */}
      {pairs.length > 0 && (
      <div className="relative hidden h-[430px] md:block">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {pairs.map((p, i) => {
            const y = ys[i];
            const tier = scoreTier(p.match.score);
            return (
              <path
                key={p.subject.id}
                d={`M 29.5 ${y} C 44 ${y}, 56 ${y}, 70.5 ${y}`}
                fill="none"
                style={{
                  stroke: TIER_HEX[tier],
                  strokeWidth: hovered === i ? 2.4 : 1.3,
                  opacity: hovered === null || hovered === i ? 0.9 : 0.15,
                  vectorEffect: "non-scaling-stroke",
                  transition: "opacity 0.3s, stroke-width 0.3s",
                }}
                className="thread-line"
              />
            );
          })}
        </svg>

        {pairs.map((p, i) => {
          const tier = scoreTier(p.match.score);
          const dim = hovered !== null && hovered !== i;
          return (
            <div key={p.subject.id}>
              <div
                className="absolute left-[1.5%] w-[27%] -translate-y-1/2"
                style={{ top: `${ys[i]}%` }}
              >
                <MiniCard report={p.subject} side="lost" dim={dim} onClick={() => onOpen(p.subject.id)} />
              </div>
              <div
                className="absolute right-[1.5%] w-[27%] -translate-y-1/2"
                style={{ top: `${ys[i]}%` }}
              >
                <MiniCard report={p.match.item} side="found" dim={dim} onClick={() => onOpen(p.subject.id)} />
              </div>
              <button
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onOpen(p.subject.id)}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 border px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider transition-transform duration-200 hover:scale-110"
                style={{
                  top: `${ys[i]}%`,
                  color: TIER_HEX[tier],
                  borderColor: TIER_HEX[tier],
                  background: "rgba(20,35,29,0.92)",
                  opacity: dim ? 0.25 : 1,
                }}
                aria-label={`Open match ${p.subject.id} and ${p.match.item.id}, ${p.match.score} percent`}
              >
                {p.match.score}%
              </button>
              {/* invisible hover zone over the thread */}
              <div
                className="absolute left-[30%] right-[30%] -translate-y-1/2 cursor-pointer"
                style={{ top: `${ys[i]}%`, height: "26px" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onOpen(p.subject.id)}
              />
            </div>
          );
        })}
      </div>
      )}

      {/* mobile: stacked pairs */}
      {pairs.length > 0 && (
      <div className="relative space-y-4 p-4 md:hidden">
        {pairs.map((p, i) => {
          const tier = scoreTier(p.match.score);
          return (
            <div key={p.subject.id}>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <MiniCard report={p.subject} side="lost" dim={false} onClick={() => onOpen(p.subject.id)} />
                <div className="flex flex-col items-center gap-1">
                  <span
                    className="border px-1.5 py-0.5 font-mono text-[10px] font-bold"
                    style={{ color: TIER_HEX[tier], borderColor: TIER_HEX[tier] }}
                  >
                    {p.match.score}%
                  </span>
                  <svg width="26" height="8" viewBox="0 0 26 8" aria-hidden>
                    <path d="M0 4h20m0 0-4-3m4 3-4 3" stroke={TIER_HEX[tier]} strokeWidth="1.4" fill="none" />
                  </svg>
                </div>
                <MiniCard report={p.match.item} side="found" dim={false} onClick={() => onOpen(p.subject.id)} />
              </div>
              <p className="mt-1.5 hidden font-mono text-[10px] text-paper/45 max-[380px]:block">
                {i + 1}. shared: {p.match.sharedTokens.slice(0, 4).join(", ") || "—"}
              </p>
            </div>
          );
        })}
      </div>
      )}

      {/* caption bar */}
      <div className="relative border-t border-paper/10 px-4 py-2.5 sm:px-5">
        <p className="truncate font-mono text-[10.5px] tracking-wide text-paper/60">
          {hovered !== null && pairs[hovered] ? (
            <>
              <span className="font-bold" style={{ color: TIER_HEX[scoreTier(pairs[hovered].match.score)] }}>
                WHY {pairs[hovered].match.score}%
              </span>
              {" — "}
              {pairs[hovered].match.reasons
                .filter((r) => r.positive)
                .slice(0, 3)
                .map((r) => r.detail)
                .join(" · ") || "weak lexical overlap"}
            </>
          ) : (
            "HOVER A THREAD TO SEE WHY THE ENGINE PAIRED THEM · CLICK TO OPEN THE CASE FILE"
          )}
        </p>
      </div>
    </div>
  );
}
