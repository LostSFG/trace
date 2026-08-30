import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { Report } from "./lib/data";
import { loadReports, LS_KEY, nextId, SEED_REPORTS } from "./lib/data";
import { topPairs } from "./lib/matching";
import { useCountUp, useRevealObserver } from "./lib/hooks";
import MatchRadar from "./components/MatchRadar";
import Ticker from "./components/Ticker";
import Board from "./components/Board";
import HowItWorks from "./components/HowItWorks";
import ItemDetail from "./components/ItemDetail";
import ReportForm from "./components/ReportForm";
import { IconArrow, IconBolt, IconCheck, IconRadar, IconSpark, IconX, Logo } from "./components/icons";

type Modal =
  | { kind: "report"; preset: "lost" | "found" }
  | { kind: "detail"; id: string }
  | null;

interface Toast {
  id: number;
  msg: string;
  tone: "success" | "info";
}

function Stat({
  value,
  format,
  label,
  sub,
}: {
  value: number;
  format: (n: number) => string;
  label: string;
  sub: string;
}) {
  const { ref, value: v } = useCountUp(value);
  return (
    <div className="reveal border-l-2 border-signal pl-4">
      <span ref={ref} className="block font-display text-[34px] font-extrabold leading-none tracking-tight text-ink sm:text-[40px]">
        {format(v)}
      </span>
      <p className="mt-1.5 font-mono text-[10.5px] font-bold tracking-[0.18em] text-ink">{label}</p>
      <p className="mt-0.5 text-[11.5px] text-ink-mute">{sub}</p>
    </div>
  );
}

export default function App() {
  const [reports, setReports] = useState<Report[]>(() => loadReports());
  const [modal, setModal] = useState<Modal>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  /* persist */
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(reports));
    } catch {
      /* storage unavailable — session-only mode */
    }
  }, [reports]);

  /* lock scroll under modals */
  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);

  /* keyboard: R opens the report form */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || modal) return;
      if (e.key.toLowerCase() === "r") setModal({ kind: "report", preset: "lost" });
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [modal]);

  useRevealObserver();

  const notify = useCallback((msg: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts, { id, msg, tone }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 4200);
  }, []);

  const pairs = useMemo(() => topPairs(reports, 4), [reports]);
  const activeCount = reports.filter((r) => r.status === "active").length;
  const returnedCount = reports.filter((r) => r.status === "returned").length;

  const addReport = useCallback(
    (draft: Omit<Report, "id" | "createdAt" | "status" | "matchedWith">): Report => {
      const report: Report = {
        ...draft,
        id: nextId(reports, draft.type),
        createdAt: Date.now(),
        status: "active",
        matchedWith: null,
      };
      setReports((rs) => [...rs, report]);
      notify(`Case ${report.id} filed — scanning ${reports.length} reports…`, "info");
      return report;
    },
    [reports, notify],
  );

  const confirmMatch = useCallback(
    (lostId: string, foundId: string) => {
      setReports((rs) =>
        rs.map((r) =>
          r.id === lostId
            ? { ...r, status: "returned", matchedWith: foundId }
            : r.id === foundId
              ? { ...r, status: "returned", matchedWith: lostId }
              : r,
        ),
      );
      notify(`Case closed — ${lostId} reunited via ${foundId}.`);
    },
    [notify],
  );

  const resetDemo = () => {
    localStorage.removeItem(LS_KEY);
    setReports(SEED_REPORTS.map((r) => ({ ...r })));
    notify("Demo data restored to factory seeds.", "info");
  };

  const openDetail = (id: string) => setModal({ kind: "detail", id });
  const detailReport =
    modal?.kind === "detail" ? reports.find((r) => r.id === modal.id) : undefined;

  return (
    <div className="relative min-h-screen font-body text-ink">
      <div className="bg-scene" aria-hidden />

      {/* ---------- header ---------- */}
      <header className="sticky top-0 z-40 border-b border-ink/15 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="leading-none">
              <span className="block font-display text-[19px] font-extrabold tracking-tight">
                TRACE
              </span>
              <span className="block font-mono text-[8.5px] font-semibold tracking-[0.22em] text-ink-mute">
                CAMPUS LOST &amp; FOUND
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#radar" className="font-mono text-[11px] font-semibold tracking-[0.16em] text-ink-mute transition-colors hover:text-ink">
              RADAR
            </a>
            <a href="#board" className="font-mono text-[11px] font-semibold tracking-[0.16em] text-ink-mute transition-colors hover:text-ink">
              BOARD
            </a>
            <a href="#how" className="font-mono text-[11px] font-semibold tracking-[0.16em] text-ink-mute transition-colors hover:text-ink">
              HOW IT SCORES
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 border border-pine/40 bg-pine-tint px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.14em] text-pine-deep lg:inline-flex">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-pine" />
              ENGINE LIVE · {activeCount} INDEXED
            </span>
            <button
              onClick={() => setModal({ kind: "report", preset: "lost" })}
              className="group inline-flex items-center gap-2 bg-signal px-4 py-2.5 font-mono text-[11px] font-bold tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 hover:bg-signal-deep hover:shadow-lift active:translate-y-0"
            >
              <IconBolt size={13} className="transition-transform group-hover:scale-125" />
              REPORT AN ITEM
            </button>
          </div>
        </div>
      </header>

      {/* ---------- opening: radar first ---------- */}
      <main id="top" className="relative z-10">
        <section id="radar" className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:pb-24 lg:pt-16">
          {/* floating case chips */}
          <div className="floaty pointer-events-none absolute right-6 top-6 hidden -rotate-6 border border-ink/20 bg-card px-3 py-2 font-mono text-[9.5px] font-semibold tracking-[0.14em] text-ink-mute shadow-card xl:block" style={{ "--tilt": "-6deg" } as CSSProperties}>
            GYM · KEYS · RED LANYARD
          </div>
          <div className="floaty pointer-events-none absolute left-4 top-40 hidden rotate-3 border border-pine/40 bg-pine-tint px-3 py-2 font-mono text-[9.5px] font-semibold tracking-[0.14em] text-pine-deep shadow-card xl:block" style={{ "--tilt": "3deg", animationDelay: "1.2s" } as CSSProperties}>
            LIBRARY · WALLET · 87% MATCH
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="reveal inline-flex items-center gap-2.5 border border-ink/20 bg-card px-3 py-1.5 font-mono text-[10.5px] font-bold tracking-[0.2em] text-ink-soft">
                <span className="pulse-dot h-2 w-2 rounded-full bg-signal" />
                MATCHING ENGINE v2.1 — ONLINE
              </p>

              <h1 className="reveal mt-5 font-display text-[42px] font-extrabold leading-[0.98] tracking-tight text-ink sm:text-[58px]">
                Lost it on campus?
                <span className="block text-signal">The engine already</span>
                <span className="block">has a lead.</span>
              </h1>

              <p className="reveal mt-5 max-w-md text-[15.5px] leading-relaxed text-ink-mute">
                Skip the WhatsApp broadcast. File one report — TRACE tokenises it, expands
                the synonyms, and pairs it against every opposite report on the board with
                a similarity score you can audit point by point.
              </p>

              <div className="reveal mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => setModal({ kind: "report", preset: "lost" })}
                  className="group inline-flex items-center gap-2.5 bg-ink px-6 py-3.5 font-mono text-[12px] font-bold tracking-[0.14em] text-paper transition-all hover:-translate-y-0.5 hover:bg-ink-soft hover:shadow-lift"
                >
                  <span className="h-2 w-2 bg-signal transition-transform group-hover:scale-150" />
                  I LOST SOMETHING
                </button>
                <button
                  onClick={() => setModal({ kind: "report", preset: "found" })}
                  className="group inline-flex items-center gap-2.5 border-2 border-ink bg-transparent px-6 py-3.5 font-mono text-[12px] font-bold tracking-[0.14em] text-ink transition-all hover:-translate-y-0.5 hover:bg-cobalt-tint hover:border-cobalt hover:text-cobalt"
                >
                  <IconSpark size={15} className="transition-transform duration-300 group-hover:rotate-90" />
                  I FOUND SOMETHING
                </button>
              </div>

              <p className="reveal mt-3 font-mono text-[10px] tracking-[0.14em] text-ink-mute/80">
                PRESS <span className="border border-ink/30 bg-card px-1.5 py-0.5 font-bold text-ink">R</span> ANYWHERE TO FILE A REPORT
              </p>

              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <Stat value={1283 + returnedCount} format={(n) => Math.round(n).toLocaleString("en-GB")} label="ITEMS REUNITED" sub="since pilot semester" />
                <Stat value={4.6} format={(n) => `${n.toFixed(1)}h`} label="MEDIAN TIME-TO-MATCH" sub="loss → first strong hit" />
                <Stat value={92} format={(n) => `${Math.round(n)}%`} label="SCORE PRECISION" sub="verified handovers" />
              </div>
            </div>

            <div className="reveal lg:col-span-7" style={{ transitionDelay: "120ms" }}>
              <MatchRadar pairs={pairs} onOpen={openDetail} />
            </div>
          </div>
        </section>

        <Ticker reports={reports} />

        <Board reports={reports} onOpen={openDetail} onReport={() => setModal({ kind: "report", preset: "lost" })} />

        <HowItWorks />

        {/* ---------- footer ---------- */}
        <footer className="relative z-10 border-t border-paper/10 bg-ink text-paper">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <Logo size={30} />
                <span className="font-display text-lg font-extrabold tracking-tight">TRACE</span>
              </div>
              <p className="mt-3 max-w-sm text-[12.5px] leading-relaxed text-paper/55">
                A student-built lost &amp; found intelligence layer for campus. Every score
                is computed locally in your browser — nothing leaves this page.
              </p>
              <div className="mt-4 flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-paper/40">
                <IconRadar size={13} />
                <span>{activeCount} ACTIVE CASES · {returnedCount} REUNITED ON THIS BOARD</span>
              </div>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:gap-14">
              <div>
                <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-paper/40">NAVIGATE</p>
                <ul className="mt-3 space-y-2 text-[13px] font-medium text-paper/75">
                  <li><a href="#radar" className="transition-colors hover:text-signal">Live match radar</a></li>
                  <li><a href="#board" className="transition-colors hover:text-signal">Case board</a></li>
                  <li><a href="#how" className="transition-colors hover:text-signal">How scoring works</a></li>
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-paper/40">DEMO</p>
                <ul className="mt-3 space-y-2 text-[13px] font-medium text-paper/75">
                  <li>
                    <button onClick={resetDemo} className="inline-flex items-center gap-1.5 transition-colors hover:text-signal">
                      <IconX size={11} /> Reset demo data
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setModal({ kind: "report", preset: "found" })} className="inline-flex items-center gap-1.5 transition-colors hover:text-signal">
                      <IconArrow size={12} /> File a test report
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-paper/10 py-4 text-center font-mono text-[10px] tracking-[0.18em] text-paper/35">
            TRACE · SEMESTER PROJECT · TOKENS, SYNONYMS &amp; SIX SIGNALS — NO BLACK BOXES
          </div>
        </footer>
      </main>

      {/* ---------- modals ---------- */}
      {modal?.kind === "report" && (
        <ReportForm
          reports={reports}
          initialType={modal.preset}
          onClose={() => setModal(null)}
          onSaved={addReport}
          onOpenItem={openDetail}
        />
      )}
      {modal?.kind === "detail" && detailReport && (
        <ItemDetail
          report={detailReport}
          reports={reports}
          onClose={() => setModal(null)}
          onOpen={openDetail}
          onConfirmMatch={confirmMatch}
        />
      )}

      {/* ---------- toasts ---------- */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-in pointer-events-auto flex items-start gap-2.5 border px-4 py-3 shadow-lift ${
              t.tone === "success"
                ? "border-pine bg-pine text-white"
                : "border-ink bg-ink text-paper"
            }`}
          >
            {t.tone === "success" ? (
              <IconCheck size={15} className="mt-0.5 shrink-0" />
            ) : (
              <IconRadar size={15} className="mt-0.5 shrink-0 text-signal" />
            )}
            <p className="font-mono text-[11.5px] font-medium leading-snug tracking-wide">{t.msg}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
