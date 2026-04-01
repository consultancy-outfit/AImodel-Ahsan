"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageSquare, Wand2, Bot, DollarSign, Star, Rss } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODELS } from "@/lib/models-data";

// ---------------------------------------------------------------------------
// Lab metadata
// ---------------------------------------------------------------------------

const LAB_META: Record<string, { logo: string; topModels: string[] }> = {
  OpenAI:    { logo: "🤖", topModels: ["GPT-4o", "o1", "Whisper v3"] },
  Anthropic: { logo: "🌟", topModels: ["Claude 3.5 Sonnet", "Claude 3 Opus"] },
  Google:    { logo: "💎", topModels: ["Gemini 1.5 Pro", "Gemini 1.5 Flash"] },
  xAI:       { logo: "⚡", topModels: ["Grok-2"] },
  DeepSeek:  { logo: "🔵", topModels: ["DeepSeek-V2", "DeepSeek Coder V2"] },
  Meta:      { logo: "🦙", topModels: ["Llama 3.1 405B", "Llama 3.2 Vision"] },
  Alibaba:   { logo: "🔶", topModels: ["Qwen2 72B"] },
  Mistral:   { logo: "🌊", topModels: ["Mistral Large 2", "Codestral"] },
  NVIDIA:    { logo: "🟢", topModels: ["Nemotron-4 340B"] },
  Microsoft: { logo: "🪟", topModels: ["Phi-3.5 Mini"] },
};

// ---------------------------------------------------------------------------
// Computed data (server-side style — no hooks)
// ---------------------------------------------------------------------------

const labCounts: Record<string, number> = {};
for (const model of MODELS) {
  labCounts[model.lab] = (labCounts[model.lab] ?? 0) + 1;
}

const labs = Object.entries(LAB_META).map(([name, meta]) => ({
  name,
  count: labCounts[name] ?? 0,
  ...meta,
}));

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    Icon: MessageSquare,
    title: "Guided Discovery Chat",
    description:
      "Tell us your use case and we'll recommend the best models for your needs",
  },
  {
    Icon: Wand2,
    title: "Prompt Engineering Guide",
    description:
      "Learn to craft prompts that get 10x better results from any model",
  },
  {
    Icon: Bot,
    title: "Agent Builder",
    description:
      "Chain models together to build powerful multi-step AI workflows",
  },
  {
    Icon: DollarSign,
    title: "Flexible Pricing",
    description:
      "From free open-source to enterprise — find models that fit your budget",
  },
  {
    Icon: Star,
    title: "User Reviews & Ratings",
    description:
      "Real ratings from 82K developers who have actually used these models",
  },
  {
    Icon: Rss,
    title: "Research Feed",
    description:
      "Stay current with daily updates on new model releases and benchmarks",
  },
];

const PRICING_TIERS = [
  {
    emoji: "🆓",
    tier: "Free & Open Source",
    examples: "Llama 3.1 405B, Gemma 2 9B, Phi-3.5 Mini",
    count: "8 models available",
  },
  {
    emoji: "💰",
    tier: "Budget · under $0.50/1M",
    examples: "GPT-4o Mini, Gemini Flash, Claude Haiku",
    count: "6 models available",
  },
  {
    emoji: "🎯",
    tier: "Mid-Range · $1–$5/1M",
    examples: "GPT-4o, Claude Sonnet, Mistral Large",
    count: "9 models available",
  },
  {
    emoji: "💎",
    tier: "Premium · $5+/1M",
    examples: "o1, Claude Opus, Grok-2",
    count: "5 models available",
  },
];

const USE_CASES = [
  { emoji: "💻", label: "Code Generation" },
  { emoji: "🎨", label: "Image Generation" },
  { emoji: "🤖", label: "AI Agents" },
  { emoji: "📄", label: "Document Analysis" },
  { emoji: "🎬", label: "Video Generation" },
  { emoji: "🎙️", label: "Voice & Audio" },
  { emoji: "🌍", label: "Multilingual" },
  { emoji: "🔬", label: "Math & Research" },
];

// ---------------------------------------------------------------------------
// Newsletter form (client component — same file)
// ---------------------------------------------------------------------------

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
      <h2 className="text-3xl font-bold text-slate-100">
        New models drop every week
      </h2>
      <p className="text-slate-400 mt-3 text-lg">
        Get notified when new models launch. No spam, unsubscribe anytime.
      </p>

      {submitted ? (
        <p className="mt-8 text-purple-400 font-semibold text-lg">
          ✓ You&apos;re on the list!
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col md:flex-row items-center justify-center gap-3"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 w-full md:w-80"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full md:w-auto"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <main className="page-transition bg-slate-950 text-slate-100 min-h-screen">
      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background radial blob */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,80,255,0.15), transparent)",
          }}
        />

        <div className="container mx-auto px-4 max-w-6xl relative z-10 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-full px-4 py-1.5 text-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            ✨ 347 models live · Updated daily
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Find your perfect AI model
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              with guided discovery
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Compare 500+ models side-by-side. Get personalized recommendations.
            Build smarter AI products faster.
          </p>

          {/* CTA area with floating emojis */}
          <div className="relative inline-block">
            {/* Floating emoji decorations */}
            <span className="hidden md:block absolute -top-10 -left-16 text-4xl opacity-40 blur-[1px] select-none">
              🤖
            </span>
            <span className="hidden md:block absolute -top-6 -right-16 text-4xl opacity-40 blur-[1px] select-none">
              ✨
            </span>
            <span className="hidden md:block absolute bottom-0 -left-20 text-4xl opacity-40 blur-[1px] select-none">
              🚀
            </span>
            <span className="hidden md:block absolute -bottom-4 -right-20 text-4xl opacity-40 blur-[1px] select-none">
              💡
            </span>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/marketplace">
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-4 text-lg rounded-xl font-semibold transition-all">
                  Let&apos;s go →
                </button>
              </Link>
              <Link href="/docs">
                <button className="border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100 px-8 py-4 text-lg rounded-xl font-semibold transition-all bg-transparent">
                  View Docs
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. STATS BAR                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-slate-900 border-y border-slate-800 py-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-8 md:gap-16">
            {[
              { value: "525+", label: "AI Models" },
              { value: "82K", label: "Builders" },
              { value: "28", label: "AI Labs" },
              { value: "4.8 ⭐", label: "Avg Rating" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. FEATURES GRID                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
              Everything you need to find the right model
            </h2>
            <p className="text-slate-400 mt-3 text-lg">
              Powerful tools to discover, compare, and build with AI models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-colors"
              >
                <div className="bg-purple-500/10 text-purple-400 rounded-lg p-2 w-10 h-10 flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. AI LABS SECTION                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 md:py-24 bg-slate-900/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
              Browse by AI Lab
            </h2>
            <p className="text-slate-400 mt-3 text-lg">
              Explore models from the world&apos;s leading AI research labs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {labs.map((lab) => (
              <div
                key={lab.name}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-purple-500/50 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <div className="text-3xl mb-2">{lab.logo}</div>
                <div className="font-semibold text-sm text-slate-100">
                  {lab.name}
                </div>
                <div className="text-xs text-slate-400 mb-2">
                  {lab.count} model{lab.count !== 1 ? "s" : ""}
                </div>
                <div className="flex flex-wrap gap-1">
                  {lab.topModels.map((m) => (
                    <span
                      key={m}
                      className="bg-slate-800 text-slate-400 text-xs px-1.5 py-0.5 rounded"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. PRICING TIERS                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
              Models for every budget
            </h2>
            <p className="text-slate-400 mt-3 text-lg">
              From free open-source to enterprise-grade, there&apos;s a model for every project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING_TIERS.map(({ emoji, tier, examples, count }) => (
              <div
                key={tier}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <div className="text-4xl mb-3">{emoji}</div>
                <div className="font-bold text-base text-slate-100 mb-1">
                  {tier}
                </div>
                <div className="text-slate-500 text-sm">{examples}</div>
                <div className="text-purple-400 text-sm mt-3 hover:text-purple-300 cursor-pointer">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. USE CASES GRID                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 md:py-24 bg-slate-900/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
              Find models by use case
            </h2>
            <p className="text-slate-400 mt-3 text-lg">
              Whatever you&apos;re building, we have models tailored for it.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {USE_CASES.map(({ emoji, label }) => (
              <Link href="/marketplace" key={label}>
                <div
                  className={cn(
                    "bg-slate-900 border border-slate-800 rounded-xl p-5",
                    "hover:border-purple-500/40 hover:bg-slate-800/80 transition-all group cursor-pointer"
                  )}
                >
                  <div className="text-3xl mb-2">{emoji}</div>
                  <div className="font-semibold text-sm text-slate-100">
                    {label}
                  </div>
                  <div className="text-xs text-slate-500 group-hover:text-purple-400 transition-colors mt-1">
                    Explore →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 7. NEWSLETTER SECTION                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <NewsletterForm />
        </div>
      </section>
    </main>
  );
}
