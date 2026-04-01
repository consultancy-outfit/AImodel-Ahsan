"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronDown, Check, X, Copy, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MODELS, AIModel } from "@/lib/models-data";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortBy = "rating" | "price-asc" | "price-desc" | "name";
type DrawerTab = "overview" | "howto" | "pricing" | "prompts" | "agent" | "reviews";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatContext(tokens: number): string {
  if (tokens === 0) return "N/A";
  if (tokens >= 1_000_000) return `${tokens / 1_000_000}M`;
  if (tokens >= 1_000) return `${tokens / 1_000}K`;
  return String(tokens);
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-1">
      <span className="text-yellow-400 text-sm">
        {"★".repeat(full)}
        {half ? "½" : ""}
        {"☆".repeat(5 - full - (half ? 1 : 0))}
      </span>
      <span className="text-xs text-slate-400">{rating.toFixed(1)}</span>
    </span>
  );
}

function SpeedDot({ speed }: { speed: AIModel["speed"] }) {
  const color =
    speed === "Fast"
      ? "bg-green-500"
      : speed === "Medium"
      ? "bg-yellow-500"
      : "bg-red-500";
  return (
    <span className="flex items-center gap-1">
      <span className={cn("inline-block w-2 h-2 rounded-full", color)} />
      <span className="text-xs text-slate-400">{speed}</span>
    </span>
  );
}

function BadgePill({ badge }: { badge: AIModel["badge"] }) {
  if (!badge) return null;
  const styles =
    badge === "Live"
      ? "bg-green-500/20 text-green-400 border border-green-500/30"
      : badge === "New"
      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
      : "bg-orange-500/20 text-orange-400 border border-orange-500/30";
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", styles)}>
      {badge}
    </span>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Language", "Vision", "Code", "Image", "Audio"];
const LABS = [
  "OpenAI",
  "Anthropic",
  "Google",
  "Meta",
  "Mistral",
  "DeepSeek",
  "xAI",
  "NVIDIA",
  "Alibaba",
  "Microsoft",
];
const PRICING_OPTIONS = ["Pay-per-use", "Free tier", "Subscription", "Enterprise"];
const LICENCE_OPTIONS = ["Commercial", "Open source", "Research only"];
const RATING_OPTIONS: { label: string; value: number }[] = [
  { label: "Any", value: 0 },
  { label: "4+", value: 4 },
  { label: "4.5+", value: 4.5 },
  { label: "5", value: 5 },
];

interface SidebarProps {
  category: string;
  setCategory: (v: string) => void;
  selectedLabs: string[];
  setSelectedLabs: (v: string[]) => void;
  pricingModel: string[];
  setPricingModel: (v: string[]) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  licence: string[];
  setLicence: (v: string[]) => void;
  onReset: () => void;
}

function SidebarContent({
  category,
  setCategory,
  selectedLabs,
  setSelectedLabs,
  pricingModel,
  setPricingModel,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  licence,
  setLicence,
  onReset,
}: SidebarProps) {
  const labCounts = LABS.reduce<Record<string, number>>((acc, lab) => {
    acc[lab] = MODELS.filter((m) => m.lab === lab).length;
    return acc;
  }, {});

  function toggleArr(arr: string[], val: string, setter: (v: string[]) => void) {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Categories */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Category
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "text-xs px-3 py-1 rounded-full font-medium transition-colors",
                category === cat
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* AI Labs */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          AI Labs
        </p>
        <div className="flex flex-col gap-1.5">
          {LABS.map((lab) => (
            <label key={lab} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedLabs.includes(lab)}
                onChange={() => toggleArr(selectedLabs, lab, setSelectedLabs)}
                className="accent-purple-500 w-3.5 h-3.5"
              />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors flex-1">
                {lab}
              </span>
              <span className="text-slate-500 text-xs">{labCounts[lab] ?? 0}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Pricing Model */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Pricing Model
        </p>
        <div className="flex flex-col gap-1.5">
          {PRICING_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={pricingModel.includes(opt)}
                onChange={() => toggleArr(pricingModel, opt, setPricingModel)}
                className="accent-purple-500 w-3.5 h-3.5"
              />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                {opt}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Max Price Slider */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Max Price
        </p>
        <p className="text-xs text-slate-400 mb-3">
          {maxPrice < 100 ? `$${maxPrice} / 1M tokens` : "Unlimited"}
        </p>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[maxPrice]}
          onValueChange={(vals) => {
              const v = Array.isArray(vals) ? vals[0] : vals;
              setMaxPrice(v as number);
            }}
          className="mt-2"
        />
      </section>

      {/* Min Rating */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Min Rating
        </p>
        <div className="flex flex-wrap gap-1.5">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setMinRating(opt.value)}
              className={cn(
                "text-xs px-3 py-1 rounded-full font-medium border transition-colors",
                minRating === opt.value
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Licence */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Licence
        </p>
        <div className="flex flex-col gap-1.5">
          {LICENCE_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={licence.includes(opt)}
                onChange={() => toggleArr(licence, opt, setLicence)}
                className="accent-purple-500 w-3.5 h-3.5"
              />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                {opt}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Help Card */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-xl p-4 mt-4">
        <div className="text-xl mb-1">✨</div>
        <p className="text-sm text-slate-300 mb-2">
          Not sure which model fits your needs?
        </p>
        <Link
          href="/hub"
          className="text-purple-400 text-xs hover:text-purple-300 transition-colors font-medium"
        >
          Try guided discovery →
        </Link>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="text-slate-500 text-xs hover:text-slate-300 transition-colors text-left mt-auto pb-2"
      >
        Reset filters
      </button>
    </div>
  );
}

function Sidebar(props: SidebarProps) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-900 border-r border-slate-800 p-4 flex-col gap-5">
      <SidebarContent {...props} />
    </aside>
  );
}

// ─── Model Card ───────────────────────────────────────────────────────────────

interface ModelCardProps {
  model: AIModel;
  onSelect: (m: AIModel) => void;
}

function ModelCard({ model, onSelect }: ModelCardProps) {
  return (
    <div
      onClick={() => onSelect(model)}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 hover:shadow-lg hover:shadow-purple-500/5 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2">
          <span className="text-2xl">{model.logo}</span>
          <div>
            <h3 className="font-bold text-base text-white leading-tight">{model.name}</h3>
            <p className="text-xs text-slate-400">{model.lab}</p>
          </div>
        </div>
        <BadgePill badge={model.badge} />
      </div>

      {/* Specs row */}
      <div className="flex items-center gap-3 my-3 text-xs text-slate-400 flex-wrap">
        <span>
          <span className="text-slate-500">Context:</span>{" "}
          <span className="text-slate-300">{formatContext(model.contextWindow)}</span>
        </span>
        <span className="text-slate-700">|</span>
        <SpeedDot speed={model.speed} />
        {model.multimodal && (
          <>
            <span className="text-slate-700">|</span>
            <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-xs">
              Multimodal
            </span>
          </>
        )}
      </div>

      {/* Prices */}
      <div className="flex items-center gap-4 mb-3">
        <div>
          <span className="text-xs text-slate-500">Input </span>
          <span className="text-sm font-semibold text-slate-200">
            {formatPrice(model.inputPrice)}
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-500">Output </span>
          <span className="text-sm font-semibold text-slate-200">
            {formatPrice(model.outputPrice)}
          </span>
        </div>
        <span className="text-xs text-slate-600">/1M tokens</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <StarRating rating={model.rating} />
        <span className="text-xs text-slate-500 group-hover:text-purple-400 transition-colors">
          View Details →
        </span>
      </div>
    </div>
  );
}

// ─── Model Grid ───────────────────────────────────────────────────────────────

interface ModelGridProps {
  models: AIModel[];
  search: string;
  setSearch: (v: string) => void;
  sortBy: SortBy;
  setSortBy: (v: SortBy) => void;
  onSelect: (m: AIModel) => void;
  onReset: () => void;
  onOpenFilters: () => void;
}

const SORT_LABELS: Record<SortBy, string> = {
  rating: "Best Match",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  name: "Name A–Z",
};

function ModelGrid({
  models,
  search,
  setSearch,
  sortBy,
  setSortBy,
  onSelect,
  onReset,
  onOpenFilters,
}: ModelGridProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      {/* Mobile filters button */}
      <div className="md:hidden mb-3">
        <button
          onClick={onOpenFilters}
          className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>
      {/* Search + Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search models, labs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-colors"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none"
          >
            {SORT_LABELS[sortBy]}
            <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-700 text-slate-200" align="end">
            {(Object.keys(SORT_LABELS) as SortBy[]).map((key) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setSortBy(key)}
                className="hover:bg-slate-700 cursor-pointer flex items-center gap-2"
              >
                {sortBy === key && <Check className="w-3.5 h-3.5 text-purple-400" />}
                <span className={sortBy === key ? "text-purple-300 ml-0" : "ml-5"}>
                  {SORT_LABELS[key]}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Count */}
      <p className="text-sm text-slate-400 mt-3 mb-4">{models.length} model{models.length !== 1 ? "s" : ""} found</p>

      {/* Grid or empty state */}
      {models.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl mb-4">🔍</span>
          <p className="text-lg font-semibold text-slate-300 mb-1">No models match your filters</p>
          <p className="text-sm text-slate-500 mb-4">Try adjusting or resetting your filters</p>
          <Button
            variant="outline"
            onClick={onReset}
            className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {models.map((model) => (
            <ModelCard key={model.id} model={model} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Drawer Tabs Content ──────────────────────────────────────────────────────

function OverviewTab({ model }: { model: AIModel }) {
  const capabilities: Record<AIModel["category"], string[]> = {
    Language: [
      "Advanced natural language understanding and generation",
      "Multi-turn conversational memory",
      "Structured output formatting (JSON, Markdown)",
      "Instruction following and prompt adherence",
    ],
    Vision: [
      "Image description and captioning",
      "Visual question answering",
      "Chart and diagram interpretation",
      "Scene understanding and object detection",
    ],
    Code: [
      "Multi-language code generation and completion",
      "Bug detection and automated fixing",
      "Unit test generation",
      "Code explanation and documentation",
    ],
    Image: [
      "High-fidelity image synthesis",
      "Style transfer and artistic rendering",
      "Image editing and inpainting",
      "Prompt-guided compositional generation",
    ],
    Audio: [
      "High-accuracy speech-to-text transcription",
      "99+ language support",
      "Speaker diarisation",
      "Real-time streaming transcription",
    ],
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-300 leading-relaxed">{model.description}</p>

      {/* Specs grid */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Specifications
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Context Window", value: formatContext(model.contextWindow) },
            { label: "Input Price", value: `${formatPrice(model.inputPrice)} / 1M` },
            { label: "Output Price", value: `${formatPrice(model.outputPrice)} / 1M` },
            { label: "Speed", value: model.speed },
            { label: "Multimodal", value: model.multimodal ? "Yes" : "No" },
            { label: "Category", value: model.category },
          ].map((spec) => (
            <div key={spec.label} className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{spec.label}</p>
              <p className="font-semibold text-slate-100 text-sm">{spec.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Use Cases
        </h4>
        <div className="flex flex-wrap gap-2">
          {model.useCases.map((uc) => (
            <span
              key={uc}
              className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full"
            >
              {uc}
            </span>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Capabilities
        </h4>
        <ul className="space-y-2">
          {capabilities[model.category].map((cap) => (
            <li key={cap} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-purple-400 mt-0.5">•</span>
              {cap}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HowToTab({ model }: { model: AIModel }) {
  const sdkMap: Record<string, { pkg: string; import: string; callCode: string }> = {
    OpenAI: {
      pkg: "openai",
      import: "import OpenAI from 'openai';",
      callCode: `const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.chat.completions.create({
  model: "${model.id}",
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(response.choices[0].message.content);`,
    },
    Anthropic: {
      pkg: "@anthropic-ai/sdk",
      import: "import Anthropic from '@anthropic-ai/sdk';",
      callCode: `const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await client.messages.create({
  model: "${model.id}",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(message.content[0].text);`,
    },
    Google: {
      pkg: "@google/generative-ai",
      import: "import { GoogleGenerativeAI } from '@google/generative-ai';",
      callCode: `const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "${model.id}" });

const result = await model.generateContent("Hello!");
console.log(result.response.text());`,
    },
  };

  const sdk = sdkMap[model.lab] ?? {
    pkg: "openai",
    import: "import OpenAI from 'openai';",
    callCode: `// Use the OpenAI-compatible endpoint for ${model.lab}
const client = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: "https://api.${model.lab.toLowerCase()}.com/v1",
});

const response = await client.chat.completions.create({
  model: "${model.id}",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content);`,
  };

  return (
    <div className="space-y-6">
      <Step number={1} title="Get Your API Key">
        <p className="text-sm text-slate-400">
          Sign up at{" "}
          <a href="#" className="text-purple-400 hover:text-purple-300 underline">
            {model.lab}&apos;s developer portal
          </a>{" "}
          and generate an API key.
        </p>
      </Step>

      <Step number={2} title="Install the SDK">
        <code className="block bg-slate-950 rounded-lg p-3 font-mono text-sm text-green-400 overflow-x-auto">
          npm install {sdk.pkg}
        </code>
      </Step>

      <Step number={3} title="Make Your First Call">
        <p className="text-xs text-slate-500 mb-2">{sdk.import}</p>
        <pre className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto whitespace-pre-wrap break-all">
          {sdk.callCode}
        </pre>
      </Step>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {number}
        </div>
        <div className="w-px bg-slate-800 flex-1 mt-1" />
      </div>
      <div className="pb-6 flex-1">
        <h4 className="font-semibold text-slate-200 mb-2">{title}</h4>
        {children}
      </div>
    </div>
  );
}

function PricingTab({ model }: { model: AIModel }) {
  return (
    <div className="space-y-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left py-2 text-slate-400 font-medium">Tier</th>
            <th className="text-left py-2 text-slate-400 font-medium">Input</th>
            <th className="text-left py-2 text-slate-400 font-medium">Output</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-800/50">
            <td className="py-3 text-slate-200 font-medium">Standard</td>
            <td className="py-3 text-slate-300">{formatPrice(model.inputPrice)} / 1M tokens</td>
            <td className="py-3 text-slate-300">{formatPrice(model.outputPrice)} / 1M tokens</td>
          </tr>
          <tr className="border-b border-slate-800/50">
            <td className="py-3 text-slate-200 font-medium">Batch</td>
            <td className="py-3 text-slate-300">{formatPrice(model.inputPrice * 0.5)} / 1M tokens</td>
            <td className="py-3 text-slate-300">{formatPrice(model.outputPrice * 0.5)} / 1M tokens</td>
          </tr>
        </tbody>
      </table>

      <div className="bg-slate-800/50 rounded-lg p-4 space-y-2 text-sm text-slate-400">
        <p>
          <span className="text-slate-200 font-medium">Context Window:</span>{" "}
          {formatContext(model.contextWindow)} tokens
        </p>
        <p>
          <span className="text-slate-200 font-medium">Batch Pricing:</span> 50% discount available for
          asynchronous batch requests (24h turnaround).
        </p>
        <p>
          <span className="text-slate-200 font-medium">Free Tier:</span> New accounts receive $5 in
          credits to explore the API.
        </p>
      </div>
    </div>
  );
}

function PromptsTab({ model }: { model: AIModel }) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  function getPrompts(m: AIModel): string[] {
    const uc = m.useCases[0] ?? "general tasks";
    return [
      `You are an expert in ${uc}. Given the following context, provide a detailed analysis:\n\n[CONTEXT]\n\nPlease structure your response with: 1) Key findings 2) Recommendations 3) Next steps`,
      `Act as a senior ${m.category} specialist. Review the following and identify any issues or improvements:\n\n[INPUT]\n\nProvide specific, actionable feedback with examples.`,
      `I need help with ${uc}. Here is my current situation:\n\n[SITUATION]\n\nPlease help me ${uc.toLowerCase()} more effectively by suggesting best practices and common pitfalls to avoid.`,
    ];
  }

  const prompts = getPrompts(model);

  function handleCopy(idx: number, text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Example prompts tailored for <span className="text-slate-200">{model.name}</span>:
      </p>
      {prompts.map((prompt, idx) => (
        <div key={idx} className="relative bg-slate-800 rounded-lg p-4">
          <button
            onClick={() => handleCopy(idx, prompt)}
            className="absolute top-2 right-2 text-slate-500 hover:text-slate-200 text-xs flex items-center gap-1 transition-colors"
          >
            {copiedId === idx ? (
              <span className="text-green-400">Copied!</span>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap break-words pr-12">
            {prompt}
          </pre>
        </div>
      ))}
    </div>
  );
}

function AgentTab({ model }: { model: AIModel }) {
  const roleMap: Record<AIModel["category"], string> = {
    Language: "Reasoning Engine",
    Vision: "Visual Perception Layer",
    Code: "Code Generation & Debugging Core",
    Image: "Creative Output Generator",
    Audio: "Speech Interface Layer",
  };

  const steps = [
    {
      title: "Define agent goal",
      desc: `Specify a clear objective for ${model.name} — e.g., "Summarise support tickets and route them."`,
    },
    {
      title: "Attach tools",
      desc: "Connect function-calling tools such as web search, database queries, or code execution to extend capabilities.",
    },
    {
      title: "Configure memory",
      desc: `Leverage ${model.name}'s ${formatContext(model.contextWindow)} token context window to maintain session history and long-term state.`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 rounded-lg p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Suggested Role</p>
        <p className="text-base font-semibold text-purple-300">{roleMap[model.category]}</p>
        <p className="text-sm text-slate-400 mt-1">
          Best suited as the {roleMap[model.category].toLowerCase()} in a multi-agent pipeline.
        </p>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Agent Workflow
        </h4>
        <div className="space-y-0">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full border-2 border-purple-500 text-purple-400 text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                {idx < steps.length - 1 && <div className="w-px bg-slate-800 flex-1 mt-1" />}
              </div>
              <div className={cn("flex-1", idx < steps.length - 1 ? "pb-6" : "")}>
                <p className="font-medium text-slate-200 text-sm">{step.title}</p>
                <p className="text-xs text-slate-400 mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/agents"
        className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
      >
        Build an agent with this model →
      </Link>
    </div>
  );
}

const MOCK_REVIEWS = [
  {
    name: "Sarah K.",
    date: "Mar 2025",
    rating: 5,
    comment:
      "Absolutely incredible model. The reasoning capability far exceeded my expectations for our legal document analysis pipeline.",
  },
  {
    name: "James T.",
    date: "Feb 2025",
    rating: 4,
    comment:
      "Great overall performance and very reliable in production. Latency is occasionally higher than expected during peak hours.",
  },
  {
    name: "Priya M.",
    date: "Jan 2025",
    rating: 5,
    comment:
      "We migrated our entire RAG system to this model and saw a 30% improvement in answer quality. Highly recommended!",
  },
];

function ReviewsTab() {
  return (
    <div className="space-y-5">
      {MOCK_REVIEWS.map((review, idx) => (
        <div key={idx} className="bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {review.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">{review.name}</p>
              <p className="text-xs text-slate-500">{review.date}</p>
            </div>
            <span className="text-yellow-400 text-sm">{"★".repeat(review.rating)}</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Model Drawer ─────────────────────────────────────────────────────────────

interface ModelDrawerProps {
  model: AIModel;
  drawerTab: DrawerTab;
  setDrawerTab: (t: DrawerTab) => void;
  onClose: () => void;
}

const DRAWER_TABS: { id: DrawerTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "howto", label: "How to Use" },
  { id: "pricing", label: "Pricing" },
  { id: "prompts", label: "Prompts" },
  { id: "agent", label: "Agent" },
  { id: "reviews", label: "Reviews" },
];

function ModelDrawer({ model, drawerTab, setDrawerTab, onClose }: ModelDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[520px] lg:w-[600px] bg-slate-900 border-l border-slate-800 z-50 overflow-y-auto shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-start gap-3 mb-3 pr-8">
            <span className="text-3xl">{model.logo}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-white">{model.name}</h2>
                <BadgePill badge={model.badge} />
              </div>
              <p className="text-sm text-slate-400">{model.lab}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-3">
            <span>
              <span className="text-slate-500">Context </span>
              <span className="text-slate-200 font-medium">{formatContext(model.contextWindow)}</span>
            </span>
            <SpeedDot speed={model.speed} />
            {model.multimodal && (
              <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                Multimodal
              </span>
            )}
            <StarRating rating={model.rating} />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-800 mt-4 overflow-x-auto">
            {DRAWER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDrawerTab(tab.id)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium cursor-pointer shrink-0 transition-colors border-b-2",
                  drawerTab === tab.id
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {drawerTab === "overview" && <OverviewTab model={model} />}
          {drawerTab === "howto" && <HowToTab model={model} />}
          {drawerTab === "pricing" && <PricingTab model={model} />}
          {drawerTab === "prompts" && <PromptsTab model={model} />}
          {drawerTab === "agent" && <AgentTab model={model} />}
          {drawerTab === "reviews" && <ReviewsTab />}
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [pricingModel, setPricingModel] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [minRating, setMinRating] = useState<number>(0);
  const [licence, setLicence] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("rating");
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("overview");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleReset = useCallback(() => {
    setSearch("");
    setCategory("All");
    setSelectedLabs([]);
    setPricingModel([]);
    setMaxPrice(100);
    setMinRating(0);
    setLicence([]);
    setSortBy("rating");
  }, []);

  const handleSelect = useCallback((m: AIModel) => {
    setSelectedModel(m);
    setDrawerTab("overview");
  }, []);

  const filtered = MODELS.filter((m) => {
    if (
      search &&
      !m.name.toLowerCase().includes(search.toLowerCase()) &&
      !m.lab.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (category !== "All" && category !== m.category) return false;
    if (selectedLabs.length && !selectedLabs.includes(m.lab)) return false;
    if (maxPrice < 100 && m.inputPrice > maxPrice) return false;
    if (minRating > 0 && m.rating < minRating) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "price-asc") return a.inputPrice - b.inputPrice;
    if (sortBy === "price-desc") return b.inputPrice - a.inputPrice;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const sidebarProps = {
    category,
    setCategory,
    selectedLabs,
    setSelectedLabs,
    pricingModel,
    setPricingModel,
    maxPrice,
    setMaxPrice,
    minRating,
    setMinRating,
    licence,
    setLicence,
    onReset: handleReset,
  };

  return (
    <div className="page-transition flex bg-slate-950 min-h-screen text-slate-100">
      <Sidebar {...sidebarProps} />

      {/* Mobile filters modal */}
      {filtersOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-50 md:hidden"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-2xl max-h-[80vh] overflow-y-auto p-4 z-50 md:hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-slate-100">Filters</span>
              <button
                onClick={() => setFiltersOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent {...sidebarProps} />
            <button
              onClick={() => setFiltersOpen(false)}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold text-sm transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </>
      )}

      <main className="flex-1 overflow-y-auto">
        <ModelGrid
          models={filtered}
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onSelect={handleSelect}
          onReset={handleReset}
          onOpenFilters={() => setFiltersOpen(true)}
        />
      </main>
      {selectedModel && (
        <ModelDrawer
          model={selectedModel}
          drawerTab={drawerTab}
          setDrawerTab={setDrawerTab}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </div>
  );
}
