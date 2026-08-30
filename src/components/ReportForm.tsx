import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Report } from "../lib/data";
import { CATEGORIES, COLOR_OPTIONS, LOCATIONS } from "../lib/data";
import type { MatchResult } from "../lib/matching";
import { formatDate, getMatches, scoreTier, TIER_META } from "../lib/matching";
import { useEscape } from "../lib/hooks";
import { IconArrow, IconCheck, IconPlus, IconRadar, IconX } from "./icons";

const SCAN_LINES = [
  "TOKENIZING DESCRIPTION…",
  "EXPANDING SYNONYMS · wallet → purse · id → card · airpods → earbuds…",
  "SCANNING THE BOARD FOR OPPOSITE-TYPE REPORTS…",
  "SCORING 6 SIGNALS · TEXT · CATEGORY · COLOUR · LOCATION · TIMELINE · CONTENTS…",
  "RANKING CANDIDATES…",
];

type Phase = "form" | "scan" | "results";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10.5px] font-semibold tracking-[0.18em] text-ink-mute">
        {label} {required && <span className="text-signal">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full border border-ink/25 bg-paper px-3 py-2.5 text-[14px] text-ink outline-none transition-all placeholder:text-ink-mute/60 focus:border-ink focus:shadow-[3px_3px_0_rgba(20,35,29,0.9)]";

export default function ReportForm({
  reports,
  initialType = "lost",
  onClose,
  onSaved,
  onOpenItem,
}: {
  reports: Report[];
  initialType?: "lost" | "found";
  onClose: () => void;
  onSaved: (draft: Omit<Report, "id" | "createdAt" | "status" | "matchedWith">) => Report;
  onOpenItem: (id: string) => void;
}) {
  useEscape(onClose);

  const [phase, setPhase] = useState<Phase>("form");
  const [type, setType] = useState<"lost" | "found">(initialType);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [reporter, setReporter] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scanStep, setScanStep] = useState(0);
  const [results, setResults] = useState<MatchResult[]>([]);
  const savedRef = useRef<Report | null>(null);

  const boardCount = useMemo(() => reports.length, [reports]);

  /* scan animation */
  useEffect(() => {
    if (phase !== "scan") return;
    setScanStep(0);
    const iv = setInterval(() => {
      setScanStep((s) => {
        if (s >= SCAN_LINES.length) {
          clearInterval(iv);
          return s;
        }
        return s + 1;
      });
    }, 430);
    const done = setTimeout(() => {
      const subject = savedRef.current;
      if (subject) setResults(getMatches(subject, reports).slice(0, 4));
      setPhase("results");
    }, SCAN_LINES.length * 430 + 500);
    return () => {
      clearInterval(iv);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 6) setTags([...tags, t]);
    setTagInput("");
  };

  const submit = () => {
    const errs: Record<string, string> = {};
    if (title.trim().length < 3) errs.title = "Give it at least 3 characters.";
    if (!category) errs.category = "Pick the closest category.";
    if (!location) errs.location = "Where was it lost / found?";
    if (!date) errs.date = "A date sharpens timeline scoring.";
    if (!reporter.trim()) errs.reporter = "So the other side can reach you.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const saved = onSaved({
      type,
      title: title.trim(),
      category,
      colors: colors.length ? colors : ["Not sure"],
      location,
      date,
      description: description.trim() || title.trim(),
      tags,
      reporter: reporter.trim(),
      contact: contact.trim() || `${reporter.trim().split(" ")[0].toLowerCase()}@campus.edu`,
    });
    savedRef.current = saved;
    setPhase("scan");
  };

  const best = results[0];
  const bestTier = best ? scoreTier(best.score) : null;

  const err = (k: string) =>
    errors[k] ? <p className="mt-1 font-mono text-[10.5px] text-signal-deep">{errors[k]}</p> : null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/60 backdrop-blur-[3px] sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="File a report"
    >
      <div
        className="modal-in relative max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-ink bg-card shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/15 bg-card/95 px-5 py-3.5 backdrop-blur">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-signal">
              NEW CASE FILE
            </p>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-ink">
              {phase === "form" ? "Report an item" : phase === "scan" ? "Engine scanning…" : "Scan complete"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="border border-ink/20 p-1.5 text-ink-mute transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            aria-label="Close"
          >
            <IconX size={14} />
          </button>
        </div>

        {phase === "form" && (
          <div className="p-5 sm:p-6">
            {/* type toggle */}
            <div className="grid grid-cols-2 gap-2">
              {(["lost", "found"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`border-2 px-4 py-3 text-left transition-all duration-200 ${
                    type === t
                      ? t === "lost"
                        ? "border-signal bg-signal-tint"
                        : "border-cobalt bg-cobalt-tint"
                      : "border-ink/20 bg-paper hover:border-ink/50"
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] font-bold tracking-[0.2em] ${
                      t === "lost" ? "text-signal-deep" : "text-cobalt"
                    }`}
                  >
                    I {t === "lost" ? "LOST" : "FOUND"} SOMETHING
                  </span>
                  <span className="mt-0.5 block text-[12px] text-ink-mute">
                    {t === "lost"
                      ? "The engine scans found reports"
                      : "The engine scans lost reports"}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label={`WHAT DID YOU ${type === "lost" ? "LOSE" : "FIND"}?`} required>
                  <input
                    className={inputCls}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={type === "lost" ? "Black wallet" : "Black leather wallet"}
                    autoFocus
                  />
                </Field>
                {err("title")}
              </div>

              <Field label="CATEGORY" required>
                <select
                  className={inputCls}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="LOCATION" required>
                <select
                  className={inputCls}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="">Select…</option>
                  {LOCATIONS.map((l) => (
                    <option key={l.name} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="DATE" required>
                <input
                  type="date"
                  className={inputCls}
                  value={date}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                />
                {err("date")}
              </Field>

              <div>
                <Field label="COLOURS">
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {COLOR_OPTIONS.map((c) => {
                      const on = colors.includes(c);
                      return (
                        <button
                          type="button"
                          key={c}
                          onClick={() =>
                            setColors(on ? colors.filter((x) => x !== c) : [...colors, c])
                          }
                          className={`border px-2 py-1 font-mono text-[10.5px] uppercase tracking-wide transition-all duration-150 ${
                            on
                              ? "border-ink bg-ink text-paper"
                              : "border-ink/25 bg-paper text-ink-mute hover:border-ink/60 hover:text-ink"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="DESCRIPTION">
                  <textarea
                    className={`${inputCls} min-h-[74px] resize-y`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      type === "lost"
                        ? "Lost my black wallet somewhere near the library. Contains my college ID…"
                        : "Found a black leather wallet outside the library. Has a student ID inside…"
                    }
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="CONTENTS / DISTINGUISHING TAGS (UP TO 6)">
                  <div className="flex flex-wrap items-center gap-1.5 border border-ink/25 bg-paper px-2 py-1.5 focus-within:border-ink">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 bg-ink px-2 py-0.5 font-mono text-[10.5px] text-paper"
                      >
                        {t}
                        <button
                          onClick={() => setTags(tags.filter((x) => x !== t))}
                          className="hover:text-signal"
                          aria-label={`Remove tag ${t}`}
                        >
                          <IconX size={10} />
                        </button>
                      </span>
                    ))}
                    <input
                      className="min-w-[120px] flex-1 bg-transparent py-1 text-[13.5px] outline-none placeholder:text-ink-mute/60"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addTag();
                        } else if (e.key === "Backspace" && !tagInput && tags.length) {
                          setTags(tags.slice(0, -1));
                        }
                      }}
                      placeholder={tags.length ? "" : "college id, cash, initials…  ⏎ to add"}
                    />
                  </div>
                </Field>
              </div>

              <Field label="YOUR NAME" required>
                <input
                  className={inputCls}
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  placeholder="Aarav Mehta"
                />
                {err("reporter")}
              </Field>

              <Field label="CONTACT (SHOWN ONLY ON REQUEST)">
                <input
                  className={inputCls}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="you@campus.edu"
                />
              </Field>
            </div>

            {errors.category || errors.location ? (
              <p className="mt-3 font-mono text-[10.5px] text-signal-deep">
                {errors.category ?? errors.location}
              </p>
            ) : null}

            <button
              onClick={submit}
              className="group mt-6 flex w-full items-center justify-center gap-2.5 bg-signal px-5 py-3.5 font-mono text-[13px] font-bold tracking-[0.14em] text-white transition-all hover:bg-signal-deep hover:shadow-lift active:translate-y-px"
            >
              FILE REPORT & RUN MATCH SCAN
              <IconArrow size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <p className="mt-2.5 text-center font-mono text-[10px] tracking-wide text-ink-mute">
              {boardCount} REPORTS CURRENTLY INDEXED · SCORING RUNS LOCALLY IN YOUR BROWSER
            </p>
          </div>
        )}

        {phase === "scan" && (
          <div className="flex flex-col items-center px-6 py-12">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                {[44, 32, 20, 8].map((r) => (
                  <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="var(--color-ink)" strokeOpacity="0.18" strokeWidth="1" />
                ))}
                <line x1="50" y1="6" x2="50" y2="94" stroke="var(--color-ink)" strokeOpacity="0.1" />
                <line x1="6" y1="50" x2="94" y2="50" stroke="var(--color-ink)" strokeOpacity="0.1" />
                <g className="radar-sweep">
                  <line x1="50" y1="50" x2="50" y2="8" stroke="var(--color-signal)" strokeWidth="2.5" strokeLinecap="round" />
                </g>
                <circle cx="68" cy="36" r="3.2" fill="var(--color-pine)" className="blip" />
                <circle cx="34" cy="62" r="3.2" fill="var(--color-amber)" className="blip" style={{ animationDelay: "0.6s" }} />
                <circle cx="60" cy="66" r="2.6" fill="var(--color-cobalt)" className="blip" style={{ animationDelay: "1.1s" }} />
              </svg>
            </div>

            <div className="mt-6 w-full max-w-md">
              <div className="h-[5px] w-full bg-paper-warm">
                <div
                  className="h-full bg-signal transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, (scanStep / SCAN_LINES.length) * 100)}%` }}
                />
              </div>
              <ul className="mt-4 space-y-1.5 font-mono text-[11.5px] tracking-wide text-ink-mute">
                {SCAN_LINES.slice(0, scanStep).map((l, i) => (
                  <li key={l} className="toast-in flex items-center gap-2">
                    <IconCheck size={11} className="shrink-0 text-pine" />
                    <span className={i === scanStep - 1 ? "text-ink" : ""}>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {phase === "results" && (
          <div className="p-5 sm:p-6">
            {best && bestTier ? (
              <div
                className="border-l-4 p-4"
                style={{
                  borderColor: TIER_META[bestTier].color,
                  background: "var(--color-paper)",
                }}
              >
                <p className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.18em]" style={{ color: TIER_META[bestTier].color }}>
                  <IconRadar size={14} />
                  {bestTier === "strong"
                    ? `POSSIBLE MATCH FOUND — ${best.score}% SIMILARITY`
                    : bestTier === "possible"
                      ? `WORTH A LOOK — ${best.score}% SIMILARITY`
                      : `CLOSEST CANDIDATE — ${best.score}%`}
                </p>
                <p className="mt-1.5 font-display text-lg font-bold text-ink">
                  {best.item.title}{" "}
                  <span className="font-mono text-[11px] font-medium text-ink-mute">
                    · {best.item.id} · {best.item.location} · {formatDate(best.item.date)}
                  </span>
                </p>
                {best.sharedTokens.length > 0 && (
                  <p className="mt-1 font-mono text-[11px] text-ink-soft">
                    shared → {best.sharedTokens.join(" · ")}
                  </p>
                )}
              </div>
            ) : (
              <div className="border-l-4 border-ink/30 bg-paper p-4">
                <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-ink-mute">
                  NO CONFIDENT MATCH — YET
                </p>
                <p className="mt-1.5 text-[13.5px] text-ink-soft">
                  Your report is live on the board. The engine re-scans it against every new
                  report automatically — most campus items turn up within a few days.
                </p>
              </div>
            )}

            {results.length > 1 && (
              <ul className="mt-4 space-y-2">
                {results.slice(1).map((m) => (
                  <li
                    key={m.item.id}
                    className="flex items-center justify-between gap-3 border border-ink/15 bg-paper px-3 py-2"
                  >
                    <span className="min-w-0 truncate text-[13px] font-semibold text-ink-soft">
                      {m.item.title}
                      <span className="ml-2 font-mono text-[10px] text-ink-mute">{m.item.id}</span>
                    </span>
                    <span
                      className="shrink-0 font-mono text-[12px] font-bold"
                      style={{ color: TIER_META[scoreTier(m.score)].color }}
                    >
                      {m.score}%
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => {
                  onClose();
                  if (best) onOpenItem(savedRef.current?.id ?? best.item.id);
                  else {
                    document.getElementById("board")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 bg-ink px-5 py-3 font-mono text-[12px] font-bold tracking-[0.14em] text-paper transition-all hover:bg-ink-soft hover:shadow-lift"
              >
                {best ? "OPEN CASE FILE" : "VIEW ON THE BOARD"}
                <IconArrow size={14} />
              </button>
              <button
                onClick={onClose}
                className="flex flex-1 items-center justify-center gap-2 border border-ink/30 px-5 py-3 font-mono text-[12px] font-bold tracking-[0.14em] text-ink-soft transition-colors hover:border-ink hover:bg-paper"
              >
                <IconPlus size={14} /> DONE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
