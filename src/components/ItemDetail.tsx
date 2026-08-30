import { useMemo, useState } from "react";
import type { Report } from "../lib/data";
import type { MatchResult, Reason } from "../lib/matching";
import { formatDate, getMatches, scoreTier, TIER_META } from "../lib/matching";
import { useEscape } from "../lib/hooks";
import {
  CategoryIcon,
  IconBolt,
  IconCal,
  IconCheck,
  IconEye,
  IconHandshake,
  IconPin,
  IconSpark,
  IconTag,
  IconX,
} from "./icons";

function ScoreRing({ score }: { score: number }) {
  const tier = scoreTier(score);
  const color = TIER_META[tier].color;
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[52px] w-[52px] shrink-0">
      <svg viewBox="0 0 52 52" className="h-full w-full -rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="var(--color-paper-warm)" strokeWidth="5" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          style={{ stroke: color }}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-mono text-[13px] font-bold"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

function ReasonBars({ reasons }: { reasons: Reason[] }) {
  return (
    <div className="mt-3 space-y-2.5 border-t border-ink/10 pt-3">
      {reasons.map((r) => (
        <div key={r.label}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-ink-mute">
              {r.label.toUpperCase()}
            </span>
            <span className="font-mono text-[10px] text-ink-mute">
              +{r.points.toFixed(1)} / {r.max}
            </span>
          </div>
          <p className="text-[11.5px] leading-snug text-ink-soft">{r.detail}</p>
          <div className="mt-1 h-[4px] w-full bg-paper-warm">
            <div
              className="bar-grow h-full"
              style={{
                width: `${(r.points / r.max) * 100}%`,
                background: r.positive ? "var(--color-pine)" : "var(--color-line)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ItemDetail({
  report,
  reports,
  onClose,
  onOpen,
  onConfirmMatch,
}: {
  report: Report;
  reports: Report[];
  onClose: () => void;
  onOpen: (id: string) => void;
  onConfirmMatch: (lostId: string, foundId: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  useEscape(onClose);

  const matches = useMemo(
    () => (report.status === "active" ? getMatches(report, reports) : []),
    [report, reports],
  );

  const partner = report.matchedWith
    ? reports.find((r) => r.id === report.matchedWith)
    : undefined;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-[3px] sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Case file ${report.id}`}
    >
      <div
        className="modal-in relative max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-ink bg-card shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-ink/15 bg-card/95 px-5 py-3.5 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <span
              className={`border px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.16em] ${
                report.status === "returned"
                  ? "border-pine/50 bg-pine-tint text-pine-deep"
                  : report.type === "lost"
                    ? "border-signal/50 bg-signal-tint text-signal-deep"
                    : "border-cobalt/40 bg-cobalt-tint text-cobalt"
              }`}
            >
              {report.status === "returned" ? "REUNITED" : report.type.toUpperCase()}
            </span>
            <span className="font-mono text-[12px] font-semibold tracking-wider text-ink-mute">
              CASE {report.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="border border-ink/20 p-1.5 text-ink-mute transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            aria-label="Close case file"
          >
            <IconX size={14} />
          </button>
        </div>

        <div className="grid gap-8 p-5 sm:p-7 md:grid-cols-[1.05fr_1fr]">
          {/* left: the report */}
          <div>
            <h2 className="font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink">
              {report.title}
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
              {report.description}
            </p>

            <dl className="mt-5 space-y-2.5 border-t border-ink/10 pt-4 font-mono text-[12px] text-ink-soft">
              <div className="flex items-center gap-2.5">
                <IconPin size={13} className="text-signal" />
                <dt className="w-20 shrink-0 text-ink-mute">WHERE</dt>
                <dd className="font-semibold">{report.location}</dd>
              </div>
              <div className="flex items-center gap-2.5">
                <IconCal size={13} className="text-signal" />
                <dt className="w-20 shrink-0 text-ink-mute">WHEN</dt>
                <dd className="font-semibold">{formatDate(report.date)}</dd>
              </div>
              <div className="flex items-center gap-2.5">
                <CategoryIcon category={report.category} size={13} className="text-signal" />
                <dt className="w-20 shrink-0 text-ink-mute">CATEGORY</dt>
                <dd className="font-semibold">{report.category}</dd>
              </div>
              {report.colors.length > 0 && (
                <div className="flex items-center gap-2.5">
                  <IconSpark size={13} className="text-signal" />
                  <dt className="w-20 shrink-0 text-ink-mute">COLOUR</dt>
                  <dd className="flex flex-wrap gap-1">
                    {report.colors.map((c) => (
                      <span key={c} className="border border-ink/15 bg-paper px-1.5 py-px text-[10.5px] uppercase tracking-wide">
                        {c}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {report.tags.length > 0 && (
                <div className="flex items-start gap-2.5">
                  <IconTag size={13} className="mt-0.5 text-signal" />
                  <dt className="w-20 shrink-0 text-ink-mute">CONTENTS</dt>
                  <dd className="flex flex-wrap gap-1">
                    {report.tags.map((t) => (
                      <span key={t} className="bg-paper-warm px-1.5 py-px text-[10.5px]">
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>

            {/* reporter */}
            <div className="mt-5 border border-ink/15 bg-paper p-3.5">
              <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-ink-mute">
                {report.type === "lost" ? "REPORTED BY" : "FOUND BY"}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-[15px] font-bold text-ink">{report.reporter}</p>
                {revealed ? (
                  <span className="font-mono text-[12px] font-semibold text-pine-deep">
                    {report.contact}
                  </span>
                ) : (
                  <button
                    onClick={() => setRevealed(true)}
                    className="inline-flex items-center gap-1.5 border border-ink/25 px-2.5 py-1 font-mono text-[10.5px] font-semibold tracking-wider text-ink-soft transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                  >
                    <IconEye size={12} /> REVEAL CONTACT
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[11px] leading-snug text-ink-mute">
                Contact stays masked until you reach out — no scraping, no spam.
              </p>
            </div>

            {partner && (
              <div className="mt-4 flex items-center gap-3 border border-pine/40 bg-pine-tint p-3.5">
                <IconHandshake size={20} className="shrink-0 text-pine-deep" />
                <p className="text-[12.5px] font-medium text-pine-deep">
                  Case closed — reunited with{" "}
                  <button
                    onClick={() => onOpen(partner.id)}
                    className="font-mono font-bold underline decoration-2 underline-offset-2 hover:text-ink"
                  >
                    {partner.id} · {partner.title}
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* right: engine matches */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-ink">
                <IconBolt size={13} className="text-signal" /> ENGINE MATCHES
              </h3>
              {matches.length > 0 && (
                <span className="font-mono text-[10.5px] text-ink-mute">
                  {matches.length} CANDIDATE{matches.length > 1 ? "S" : ""}
                </span>
              )}
            </div>

            {report.status === "returned" ? (
              <div className="mt-4 border border-dashed border-pine/40 bg-pine-tint/50 p-5 text-center">
                <IconCheck size={26} className="mx-auto text-pine-deep" />
                <p className="mt-2 font-display text-lg font-bold text-pine-deep">
                  Case closed.
                </p>
                <p className="mt-1 text-[12.5px] text-pine-deep/80">
                  This item has been returned to its owner.
                </p>
              </div>
            ) : matches.length === 0 ? (
              <div className="mt-4 border border-dashed border-ink/25 p-5 text-center">
                <p className="font-display text-lg font-bold text-ink">No confident match yet.</p>
                <p className="mt-1 text-[12.5px] leading-snug text-ink-mute">
                  The engine keeps scanning every new {report.type === "lost" ? "found" : "lost"}{" "}
                  report. Adding contents, brands or initials sharpens future matches.
                </p>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {matches.map((m, idx) => {
                  const tier = scoreTier(m.score);
                  const open = expanded === m.item.id;
                  return (
                    <li
                      key={m.item.id}
                      className="border border-ink/15 bg-paper p-3.5 transition-all hover:border-ink/40"
                    >
                      <div className="flex items-start gap-3">
                        <ScoreRing score={m.score} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold tracking-widest text-ink-mute">
                              #{idx + 1} · {m.item.id}
                            </span>
                            <span
                              className="border px-1.5 py-px font-mono text-[9px] font-bold tracking-[0.14em]"
                              style={{
                                color: TIER_META[tier].color,
                                borderColor: TIER_META[tier].color,
                              }}
                            >
                              {TIER_META[tier].label.toUpperCase()}
                            </span>
                          </div>
                          <button
                            onClick={() => onOpen(m.item.id)}
                            className="mt-1 block truncate text-left font-display text-[15.5px] font-bold text-ink underline-offset-2 hover:underline"
                          >
                            {m.item.title}
                          </button>
                          <p className="mt-0.5 flex items-center gap-1 font-mono text-[10.5px] text-ink-mute">
                            <IconPin size={10} /> {m.item.location} · {formatDate(m.item.date)}
                          </p>
                        </div>
                      </div>

                      {m.sharedTokens.length > 0 && (
                        <p className="mt-2 font-mono text-[10.5px] text-ink-soft">
                          <span className="text-ink-mute">SHARED →</span>{" "}
                          {m.sharedTokens.join(" · ")}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => setExpanded(open ? null : m.item.id)}
                          className="border border-ink/25 px-2.5 py-1.5 font-mono text-[10.5px] font-semibold tracking-wider text-ink-soft transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                        >
                          {open ? "HIDE BREAKDOWN" : "WHY THIS SCORE?"}
                        </button>
                        <button
                          onClick={() =>
                            onConfirmMatch(
                              report.type === "lost" ? report.id : m.item.id,
                              report.type === "found" ? report.id : m.item.id,
                            )
                          }
                          className="inline-flex items-center gap-1.5 bg-pine px-3 py-1.5 font-mono text-[10.5px] font-bold tracking-wider text-white transition-all hover:-translate-y-px hover:bg-pine-deep"
                        >
                          <IconCheck size={12} />
                          {report.type === "lost"
                            ? "IT'S MINE — MARK RETURNED"
                            : "OWNER FOUND — MARK RETURNED"}
                        </button>
                      </div>

                      {open && <ReasonBars reasons={m.reasons} />}
                    </li>
                  );
                })}
              </ul>
            )}

            {report.status === "active" && matches.length > 0 && (
              <p className="mt-4 border-l-2 border-signal pl-3 text-[11.5px] leading-snug text-ink-mute">
                Scores are an estimate, not a verdict. Always verify unique details —
                stickers, initials, lock screens — before handover.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
