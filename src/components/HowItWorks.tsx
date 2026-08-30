import { useEffect, useRef, useState } from "react";
import { useRevealOn } from "../lib/hooks";

const STEPS = [
  {
    n: "01",
    t: "Report intake",
    d: "A lost or found report lands with a title, category, colours, location pin, date and contents tags.",
  },
  {
    n: "02",
    t: "Normalise language",
    d: "Text is tokenised and expanded through a campus synonym map — “AirPods” meets “earbuds”, “ID” meets “card”, “navy” meets “blue”.",
  },
  {
    n: "03",
    t: "Extract six signals",
    d: "Keywords, category, colour, location distance on the campus map, timeline plausibility, and declared contents.",
  },
  {
    n: "04",
    t: "Pairwise scoring",
    d: "Every lost report is scored against every found report with a weighted hybrid of weighted-Jaccard overlap and fuzzy matching.",
  },
  {
    n: "05",
    t: "Rank & explain",
    d: "Candidates are ranked, tiered, and each score ships with a point-by-point breakdown you can inspect.",
  },
];

const FACTORS = [
  { name: "Language & synonyms", w: 45, color: "var(--color-signal)" },
  { name: "Category", w: 15, color: "var(--color-cobalt)" },
  { name: "Location proximity", w: 13, color: "var(--color-pine)" },
  { name: "Colour", w: 12, color: "var(--color-amber)" },
  { name: "Timeline logic", w: 10, color: "#8fb5a8" },
  { name: "Contents & tags", w: 5, color: "#c96f4a" },
];

const TIERS = [
  {
    range: "≥ 80",
    name: "STRONG",
    color: "#3fae90",
    note: "Surface it immediately — same item family, place and window.",
  },
  {
    range: "60–79",
    name: "POSSIBLE",
    color: "#e8b23a",
    note: "Worth a conversation. Verify one unique detail before handover.",
  },
  {
    range: "40–59",
    name: "LONG SHOT",
    color: "#8b9a90",
    note: "Listed for completeness. Usually a category echo, not a match.",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useRevealOn("how");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="how" className="relative z-10 border-y border-ink bg-ink text-paper">
      <div className="dark-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_400px_at_85%_0%,rgba(244,80,30,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="reveal max-w-2xl">
          <p className="font-mono text-[11px] font-semibold tracking-[0.24em] text-signal">
            03 · UNDER THE HOOD
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-[40px] sm:leading-[1.05]">
            Six signals.
            <br />
            One explainable verdict.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-paper/70">
            No black boxes. Every percentage on this site decomposes into the six weighted
            signals below — and every case file lets you audit the arithmetic line by line.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          {/* pipeline */}
          <div className="lg:col-span-5">
            <p className="mb-4 font-mono text-[10.5px] font-bold tracking-[0.22em] text-paper/50">
              THE PIPELINE
            </p>
            <ol className="space-y-1">
              {STEPS.map((s, i) => (
                <li
                  key={s.n}
                  className="reveal group flex gap-4 border border-paper/10 bg-ink-soft/60 p-4 transition-all duration-300 hover:border-signal/60 hover:bg-ink-soft"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <span className="font-mono text-[13px] font-bold text-signal">{s.n}</span>
                  <div>
                    <p className="font-display text-[16px] font-bold text-paper">{s.t}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-paper/60">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* weights */}
          <div ref={ref} className="lg:col-span-4">
            <p className="mb-4 font-mono text-[10.5px] font-bold tracking-[0.22em] text-paper/50">
              FACTOR WEIGHTS
            </p>
            <div className="space-y-4 border border-paper/10 bg-ink-soft/60 p-5">
              {FACTORS.map((f, i) => (
                <div key={f.name}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] font-semibold text-paper/85">{f.name}</span>
                    <span className="font-mono text-[12px] font-bold" style={{ color: f.color }}>
                      {f.w} pts
                    </span>
                  </div>
                  <div className="mt-1.5 h-[7px] w-full bg-paper/10">
                    <div
                      className="bar-grow h-full"
                      style={{
                        width: inView ? `${(f.w / 45) * 100}%` : "0%",
                        background: f.color,
                        transitionDelay: `${i * 110}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
              <p className="border-t border-paper/10 pt-3 font-mono text-[10.5px] leading-relaxed text-paper/45">
                MAX SCORE = 100 PTS · FUZZY TOKEN MATCHES EARN 85% CREDIT · “NOT SURE”
                COLOURS EARN NEUTRAL CREDIT INSTEAD OF ZERO
              </p>
            </div>
          </div>

          {/* tiers */}
          <div className="lg:col-span-3">
            <p className="mb-4 font-mono text-[10.5px] font-bold tracking-[0.22em] text-paper/50">
              SCORE TIERS
            </p>
            <div className="space-y-3">
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  className="reveal border border-paper/10 bg-ink-soft/60 p-4 transition-colors hover:border-paper/25"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] font-bold tracking-[0.16em]" style={{ color: t.color }}>
                      {t.name}
                    </span>
                    <span className="font-mono text-[11px] text-paper/50">{t.range}</span>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-paper/60">{t.note}</p>
                </div>
              ))}
            </div>
            <div className="reveal mt-4 border-l-2 border-signal bg-ink-soft/40 p-4">
              <p className="font-mono text-[10.5px] font-bold tracking-[0.18em] text-signal">
                WHY NEVER 100%?
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-paper/60">
                Two honest descriptions of the same object never share every word. Capping
                scores keeps “87%” meaningful instead of ceremonial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
