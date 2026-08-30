import { useMemo, useState } from "react";
import type { Report } from "../lib/data";
import { CATEGORIES, LOCATIONS } from "../lib/data";
import type { MatchResult } from "../lib/matching";
import { formatDate, getMatches, scoreTier, TIER_META } from "../lib/matching";
import { useRevealOn } from "../lib/hooks";
import {
  CategoryIcon,
  IconCal,
  IconCheck,
  IconPin,
  IconPlus,
  IconRadar,
  IconSearch,
  IconTag,
  IconX,
} from "./icons";

type TypeFilter = "all" | "lost" | "found" | "returned";

const TYPE_STYLES: Record<string, string> = {
  lost: "bg-signal-tint text-signal-deep border-signal/50",
  found: "bg-cobalt-tint text-cobalt border-cobalt/40",
  returned: "bg-pine-tint text-pine-deep border-pine/40",
};

function TypeBadge({ report }: { report: Report }) {
  const kind = report.status === "returned" ? "returned" : report.type;
  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.14em] ${TYPE_STYLES[kind]}`}
    >
      {kind === "returned" && <IconCheck size={10} />}
      {kind.toUpperCase()}
    </span>
  );
}

function ItemCard({
  report,
  best,
  onOpen,
}: {
  report: Report;
  best?: MatchResult;
  onOpen: (id: string) => void;
}) {
  const returned = report.status === "returned";
  return (
    <button
      onClick={() => onOpen(report.id)}
      className={`reveal group relative flex flex-col border bg-card p-4 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-ink hover:shadow-lift ${
        returned ? "border-pine/40" : "border-ink/15"
      }`}
    >
      <span
        className={`absolute inset-y-0 left-0 w-[3px] ${
          returned ? "bg-pine" : report.type === "lost" ? "bg-signal" : "bg-cobalt"
        }`}
      />
      <div className="flex items-center justify-between gap-2 pl-2">
        <TypeBadge report={report} />
        <span className="font-mono text-[10.5px] font-medium tracking-wider text-ink-mute">
          {report.id}
        </span>
      </div>

      <h3
        className={`mt-2.5 pl-2 font-display text-[17px] font-bold leading-snug ${
          returned ? "text-ink/55 line-through decoration-pine/60 decoration-2" : "text-ink"
        }`}
      >
        {report.title}
      </h3>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-2 font-mono text-[11px] text-ink-mute">
        <span className="inline-flex items-center gap-1">
          <IconPin size={11} /> {report.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconCal size={11} /> {formatDate(report.date)}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 pl-2 text-ink-mute">
        <CategoryIcon category={report.category} size={13} />
        <span className="text-[11.5px] font-medium">{report.category}</span>
        {report.colors.slice(0, 2).map((c) => (
          <span
            key={c}
            className="ml-1 border border-ink/15 bg-paper px-1 py-px font-mono text-[9.5px] uppercase tracking-wide text-ink-mute"
          >
            {c}
          </span>
        ))}
      </div>

      {report.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1 pl-2">
          {report.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 bg-paper-warm px-1.5 py-0.5 font-mono text-[10px] text-ink-soft"
            >
              <IconTag size={9} /> {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-3 pl-2">
        {returned ? (
          <p className="flex items-center gap-1.5 font-mono text-[10.5px] font-semibold tracking-wide text-pine-deep">
            <IconCheck size={12} /> REUNITED WITH {report.matchedWith ?? "OWNER"}
          </p>
        ) : best ? (
          <div>
            <div className="flex items-center justify-between font-mono text-[10.5px] tracking-wide">
              <span className="text-ink-mute">
                TOP MATCH · {best.item.id}
              </span>
              <span
                className="font-bold"
                style={{ color: TIER_META[scoreTier(best.score)].color }}
              >
                {best.score}%
              </span>
            </div>
            <div className="mt-1 h-[5px] w-full bg-paper-warm">
              <div
                className="bar-grow h-full"
                style={{
                  width: `${best.score}%`,
                  background: TIER_META[scoreTier(best.score)].color,
                }}
              />
            </div>
          </div>
        ) : (
          <p className="flex items-center gap-1.5 font-mono text-[10.5px] tracking-wide text-ink-mute/80">
            <IconRadar size={12} /> NO CONFIDENT MATCH YET — ENGINE KEEPING WATCH
          </p>
        )}
      </div>
    </button>
  );
}

export default function Board({
  reports,
  onOpen,
  onReport,
}: {
  reports: Report[];
  onOpen: (id: string) => void;
  onReport: () => void;
}) {
  const [type, setType] = useState<TypeFilter>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");

  const bestBy = useMemo(() => {
    const m = new Map<string, MatchResult>();
    for (const r of reports) {
      if (r.status === "active") m.set(r.id, getMatches(r, reports)[0]);
    }
    return m;
  }, [reports]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports
      .filter((r) => {
        if (type === "returned") return r.status === "returned";
        if (r.status === "returned") return false;
        if (type !== "all" && r.type !== type) return false;
        if (category !== "all" && r.category !== category) return false;
        if (location !== "all" && r.location !== location) return false;
        if (q) {
          const hay = `${r.title} ${r.description} ${r.tags.join(" ")} ${r.id} ${r.location}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [reports, type, query, category, location]);

  useRevealOn(filtered.length + type + category + location + query);

  const segBtn = (v: TypeFilter, label: string, count: number) => (
    <button
      onClick={() => setType(v)}
      className={`px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.12em] transition-colors duration-200 ${
        type === v
          ? "bg-ink text-paper"
          : "bg-transparent text-ink-mute hover:bg-ink/10 hover:text-ink"
      }`}
    >
      {label} <span className={type === v ? "text-signal" : ""}>{count}</span>
    </button>
  );

  const counts = {
    all: reports.filter((r) => r.status === "active").length,
    lost: reports.filter((r) => r.type === "lost" && r.status === "active").length,
    found: reports.filter((r) => r.type === "found" && r.status === "active").length,
    returned: reports.filter((r) => r.status === "returned").length,
  };

  return (
    <section id="board" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-[0.24em] text-signal">
            02 · THE BOARD
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-[40px] sm:leading-[1.05]">
            Every case file,
            <br />
            scored the moment it lands.
          </h2>
        </div>
        <div className="relative">
          <IconSearch size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search wallets, airpods, ID…"
            className="w-64 border border-ink/25 bg-card py-2.5 pl-9 pr-8 text-sm text-ink placeholder:text-ink-mute/70 outline-none transition-all focus:border-ink focus:shadow-[3px_3px_0_rgba(20,35,29,0.9)]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink"
              aria-label="Clear search"
            >
              <IconX size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="reveal mt-7 flex flex-wrap items-center gap-3">
        <div className="flex border border-ink/25 bg-card p-0.5">
          {segBtn("all", "ALL", counts.all)}
          {segBtn("lost", "LOST", counts.lost)}
          {segBtn("found", "FOUND", counts.found)}
          {segBtn("returned", "REUNITED", counts.returned)}
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-ink/25 bg-card px-2.5 py-2 font-mono text-[11px] tracking-wide text-ink-soft outline-none focus:border-ink"
          aria-label="Filter by category"
        >
          <option value="all">ALL CATEGORIES</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.toUpperCase()}</option>
          ))}
        </select>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border border-ink/25 bg-card px-2.5 py-2 font-mono text-[11px] tracking-wide text-ink-soft outline-none focus:border-ink"
          aria-label="Filter by location"
        >
          <option value="all">ALL LOCATIONS</option>
          {LOCATIONS.map((l) => (
            <option key={l.name} value={l.name}>{l.name.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="reveal mt-12 flex flex-col items-center border border-dashed border-ink/30 bg-card/60 px-6 py-16 text-center">
          <IconRadar size={38} className="text-ink/30" />
          <p className="mt-4 font-display text-xl font-bold text-ink">Nothing on the board here.</p>
          <p className="mt-1 max-w-sm text-sm text-ink-mute">
            Try clearing the filters — or file the report yourself and let the engine start scanning.
          </p>
          <button
            onClick={onReport}
            className="mt-5 inline-flex items-center gap-2 bg-signal px-5 py-2.5 font-mono text-[12px] font-bold tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 hover:bg-signal-deep hover:shadow-lift"
          >
            <IconPlus size={14} /> REPORT AN ITEM
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <ItemCard key={r.id} report={r} best={bestBy.get(r.id)} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}
