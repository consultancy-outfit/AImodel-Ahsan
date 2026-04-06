"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, Loader2, BookOpen, Share2, Bookmark, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Metric {
  value: string;
  label: string;
}

interface Discovery {
  slug: string;
  title: string;
  organization: string;
  date: string;
  category: string;
  snippet: string;
  overview: string;
  arxivId: string;
  authors: string;
  metrics: Metric[];
  keyFindings: string[];
  modelsReferenced: string[];
  impactLevel: string;
  impactDescription: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Reasoning:      "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  Multimodal:     "bg-teal-500/20 text-teal-400 border border-teal-500/30",
  Alignment:      "bg-red-500/20 text-red-400 border border-red-500/30",
  Efficiency:     "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  "Open Weights": "bg-green-500/20 text-green-400 border border-green-500/30",
};

function CategoryTag({ category }: { category: string }) {
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide", CATEGORY_COLORS[category] ?? "bg-slate-700 text-slate-300")}>
      {category}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
  };
}

const FILTERS = ["All", "Reasoning", "Multimodal", "Alignment", "Efficiency", "Open Weights"];

// ─── Left Panel Item ──────────────────────────────────────────────────────────

function DiscoveryListItem({
  discovery,
  isSelected,
  onSelect,
}: {
  discovery: Discovery;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { month, day } = formatDate(discovery.date);
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex gap-3 px-4 py-4 text-left border-b border-slate-800 hover:bg-slate-800/60 transition-colors",
        isSelected && "bg-slate-800 border-l-2 border-l-purple-500"
      )}
    >
      {/* Date */}
      <div className="flex flex-col items-center w-10 shrink-0 pt-0.5">
        <span className="text-[10px] font-semibold text-slate-500 uppercase">{month}</span>
        <span className="text-lg font-bold text-slate-300 leading-tight">{day}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">{discovery.organization}</span>
          <CategoryTag category={discovery.category} />
        </div>
        <p className={cn("text-sm font-semibold leading-snug mb-1", isSelected ? "text-white" : "text-slate-200")}>
          {discovery.title}
        </p>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{discovery.snippet}</p>
      </div>
    </button>
  );
}

// ─── Right Panel ──────────────────────────────────────────────────────────────

function DiscoveryDetail({ discovery }: { discovery: Discovery }) {
  const { month, day } = formatDate(discovery.date);
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-sm font-semibold text-slate-300">{discovery.organization}</span>
        <span className="text-slate-600">·</span>
        <span className="text-sm text-slate-400">{new Date(discovery.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        <CategoryTag category={discovery.category} />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
        {discovery.title}
      </h1>

      <p className="text-xs text-slate-500 mb-6">
        {discovery.arxivId} · {discovery.authors}
      </p>

      {/* Overview */}
      <section className="mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Overview</p>
        <p className="text-sm text-slate-300 leading-relaxed">{discovery.overview}</p>
      </section>

      {/* Metrics */}
      {discovery.metrics.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {discovery.metrics.map((m) => (
            <div key={m.label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-white mb-1">{m.value}</p>
              <p className="text-xs text-slate-400">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Key Findings */}
      <section className="mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Key Findings</p>
        <div className="space-y-2">
          {discovery.keyFindings.map((finding, i) => (
            <div key={i} className="flex gap-3 bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-3">
              <span className="text-purple-400 font-bold text-sm shrink-0">{i + 1}.</span>
              <p className="text-sm text-slate-300 leading-relaxed">{finding}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Models Referenced */}
      {discovery.modelsReferenced.length > 0 && (
        <section className="mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Models Referenced</p>
          <div className="flex flex-wrap gap-2">
            {discovery.modelsReferenced.map((m) => (
              <span key={m} className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full">
                <BookOpen className="w-3 h-3 text-slate-500" />
                {m}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Impact Assessment */}
      <section className="mb-8">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Impact Assessment</p>
        <div className={cn(
          "flex items-start gap-3 rounded-lg px-4 py-3 border",
          discovery.impactLevel === "High"
            ? "bg-orange-500/10 border-orange-500/30"
            : "bg-blue-500/10 border-blue-500/30"
        )}>
          <span className="text-lg shrink-0">{discovery.impactLevel === "High" ? "⚡" : "📊"}</span>
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-white">{discovery.impactLevel}</span>
            {" — "}{discovery.impactDescription}
          </p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/hub"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Discuss in Chat Hub
        </Link>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Bookmark className="w-4 h-4" />
          Save
        </button>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}

// ─── Empty right-panel state ──────────────────────────────────────────────────

function EmptyDetail() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-24">
      <span className="text-5xl mb-4">🔬</span>
      <p className="text-lg font-semibold text-slate-300 mb-1">Select a paper</p>
      <p className="text-sm text-slate-500">Click any item on the left to read the full research summary.</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [selected, setSelected] = useState<Discovery | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscoveries = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (category !== "All") qs.set("category", category);
      const res = await fetch(`${API_URL}/discoveries?${qs.toString()}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const json = await res.json() as { data: Discovery[]; total: number };
      setDiscoveries(json.data);
      // Auto-select first on initial load
      if (category === "All" && !selected && json.data.length > 0) {
        setSelected(json.data[0]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load discoveries");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetchDiscoveries(activeFilter);
  }, [activeFilter, fetchDiscoveries]);

  const thisWeekCount = discoveries.filter((d) => {
    const diff = (Date.now() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  return (
    <div className="page-transition flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      {/* ── Top bar ── */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-4 md:px-6 py-4 flex items-start justify-between gap-4 flex-wrap shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold text-white">AI Research Feed</h1>
            <span className="text-xs text-slate-500">Curated breakthroughs · Updated daily</span>
          </div>
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => { setActiveFilter(f); setSelected(null); }}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors",
                  activeFilter === f
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                )}
              >
                {f === "All" && "⬤ "}
                {f === "Reasoning" && "🧠 "}
                {f === "Multimodal" && "🔮 "}
                {f === "Alignment" && "🛡️ "}
                {f === "Efficiency" && "⚡ "}
                {f === "Open Weights" && "📦 "}
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {thisWeekCount > 0 && (
            <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {thisWeekCount} paper{thisWeekCount !== 1 ? "s" : ""} this week
            </span>
          )}
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-full transition-colors">
            <Bell className="w-3.5 h-3.5" />
            Subscribe
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="w-full md:w-[320px] lg:w-[340px] shrink-0 border-r border-slate-800 overflow-y-auto">
          {error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <span className="text-4xl mb-3">⚠️</span>
              <p className="text-sm text-slate-400">{error}</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            </div>
          ) : discoveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <span className="text-4xl mb-3">📭</span>
              <p className="text-sm text-slate-400">No papers found for this filter.</p>
            </div>
          ) : (
            discoveries.map((d) => (
              <DiscoveryListItem
                key={d.slug}
                discovery={d}
                isSelected={selected?.slug === d.slug}
                onSelect={() => setSelected(d)}
              />
            ))
          )}
        </aside>

        {/* Right panel — hidden on mobile when nothing selected */}
        <main className={cn(
          "flex-1 overflow-hidden",
          !selected && "hidden md:flex"
        )}>
          {selected ? <DiscoveryDetail discovery={selected} /> : <EmptyDetail />}
        </main>
      </div>
    </div>
  );
}
