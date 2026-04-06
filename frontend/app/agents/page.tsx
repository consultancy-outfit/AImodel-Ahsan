"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Bot, Plus, Search, Headphones, Code2, BarChart2, PenLine,
  Globe, Terminal, Image as ImageIcon, Database, GitBranch,
  Tag, FileText, Mail, Calendar, X, CheckCircle2, Loader2,
  Trash2, Zap, ChevronRight, Mic, Paperclip, ArrowUp,
  Sparkles, RefreshCw, Users, Briefcase, BarChart, MailOpen,
  Settings2, DollarSign, HelpCircle, Check, Rocket, Wifi,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { MODELS } from "@/lib/models-data"
import type { AIModel } from "@/lib/models-data"
import { fetchAgents, createAgent, deleteAgent, type Agent, type CreateAgentPayload } from "@/lib/agents"
import { getToken } from "@/lib/auth"
import { useRouter } from "next/navigation"

// ─── Static data ──────────────────────────────────────────────────────────────

const AGENT_TYPES = [
  { id: "customer-support",  label: "Customer Support", icon: Headphones },
  { id: "research-data",     label: "Research & Data",  icon: Search },
  { id: "code-dev",          label: "Code & Dev",       icon: Code2 },
  { id: "sales-crm",         label: "Sales & CRM",      icon: DollarSign },
  { id: "content-writing",   label: "Content & Writing",icon: PenLine },
  { id: "operations",        label: "Operations",       icon: Settings2 },
  { id: "finance-reports",   label: "Finance & Reports",icon: BarChart },
  { id: "something-else",    label: "Something else",   icon: HelpCircle },
]

const AUDIENCES = [
  { id: "customers",     label: "Customers",     icon: "👥" },
  { id: "internal-team", label: "Internal team", icon: "🏢" },
  { id: "developers",    label: "Developers",    icon: "💻" },
  { id: "executives",    label: "Executives",    icon: "👔" },
]

const TONES = [
  { id: "professional",  label: "Professional",  icon: "👔" },
  { id: "friendly",      label: "Friendly",      icon: "😊" },
  { id: "short-direct",  label: "Short & direct",icon: "⚡" },
  { id: "thorough",      label: "Thorough",      icon: "📋" },
]

const TASK_SUGGESTIONS = [
  { icon: "🚀", text: "Build a space exploration timeline app" },
  { icon: "📈", text: "Create a real-time stock market tracker" },
  { icon: "🤖", text: "Prototype an AI chatbot demo application" },
  { icon: "📋", text: "Create a project management Kanban board" },
]

const CATEGORY_TABS = [
  "Use cases", "Build a business", "Help me learn",
  "Monitor the situation", "Research", "Create content", "Analyze & research",
]

interface ToolDef { id: string; icon: LucideIcon; label: string; description: string }

const TOOLS: ToolDef[] = [
  { id: "web-search",      icon: Globe,      label: "Web Search",         description: "Search the internet in real-time" },
  { id: "database-lookup", icon: Database,   label: "Database Lookup",    description: "Query your database or vector store" },
  { id: "email-sender",    icon: MailOpen,   label: "Email Sender",       description: "Send emails on behalf of the agent" },
  { id: "calendar-api",    icon: Calendar,   label: "Calendar API",       description: "Read/write calendar events" },
  { id: "slack-webhook",   icon: Wifi,       label: "Slack Webhook",      description: "Post messages to Slack channels" },
  { id: "github",          icon: GitBranch,  label: "GitHub",             description: "Read/write to GitHub repos and PRs" },
  { id: "google-sheets",   icon: BarChart2,  label: "Google Sheets",      description: "Read from and write to spreadsheets" },
  { id: "code-execution",  icon: Terminal,   label: "Code Execution",     description: "Run Python/JS and return results" },
  { id: "image-gen",       icon: ImageIcon,  label: "Image Generation",   description: "Generate images with AI" },
  { id: "document-reader", icon: FileText,   label: "Document Reader",    description: "Parse PDFs, Word docs, and more" },
  { id: "ticketing",       icon: Tag,        label: "Ticketing System",   description: "Create and manage support tickets" },
  { id: "custom-function", icon: Code2,      label: "Custom Function",    description: "Define your own tool with a JSON schema" },
]

const TEST_SCENARIOS = [
  "Normal use case — typical user query",
  "Edge case — unexpected or out-of-scope request",
  "Escalation trigger — billing or security issue",
  "Empty / very short input",
  "Multilingual input",
  "Harmful or adversarial prompt",
  "Follow-up questions needing context",
  "Request for information outside agent scope",
]

interface LibraryAgent {
  id: string; icon: string; name: string; description: string
  model: string; tools: string[]; color: string
}

const LIBRARY_AGENTS: LibraryAgent[] = [
  { id: "research",      icon: "🔍", name: "Research Agent",         description: "Automates web research, synthesises findings from multiple sources, and generates structured reports.",   model: "GPT-4o",              tools: ["Web Search", "Summariser", "Citation Builder"], color: "bg-blue-500/20" },
  { id: "support",       icon: "🎧", name: "Customer Support Agent", description: "Handles product questions, order issues, billing inquiries, and technical support tickets automatically.", model: "Claude Sonnet 4.6",    tools: ["Ticket System", "Knowledge Base", "CRM"],       color: "bg-green-500/20" },
  { id: "code-review",   icon: "💻", name: "Code Review Agent",      description: "Reviews pull requests, flags bugs, suggests improvements, and explains changes to developers.",           model: "Claude Opus 4.6",     tools: ["GitHub API", "AST Parser", "Linter"],           color: "bg-purple-500/20" },
  { id: "data-analysis", icon: "📊", name: "Data Analysis Agent",    description: "Processes spreadsheets, generates insights, creates visualisations, and surfaces actionable trends.",     model: "GPT-4o",              tools: ["CSV Parser", "Chart Builder", "Statistics"],    color: "bg-yellow-500/20" },
  { id: "content",       icon: "✍️", name: "Content Writer Agent",   description: "Creates blog posts, social content, email campaigns, and marketing copy with brand voice.",              model: "Claude Opus 4.6",     tools: ["SEO Optimiser", "Tone Checker", "Plagiarism Scan"], color: "bg-pink-500/20" },
  { id: "sales",         icon: "💰", name: "Sales Outreach Agent",   description: "Automates personalised outreach, follows up with leads, and manages CRM pipeline automatically.",        model: "GPT-4o Turbo",        tools: ["Email Sender", "CRM", "Lead Scorer"],           color: "bg-orange-500/20" },
]

const DEPLOY_OPTIONS = [
  { id: "api",       icon: "🔗", label: "API Endpoint",   description: "Get a REST endpoint. Integrate into any app, website, or backend in minutes.", badge: "Most flexible" },
  { id: "widget",    icon: "💬", label: "Embed Widget",   description: "Drop a chat widget onto your website with one line of JavaScript.",            badge: "No-code option" },
  { id: "slack",     icon: "🤖", label: "Slack Bot",      description: "Deploy as a Slack bot — your team can chat with the agent directly.",          badge: "Internal teams" },
  { id: "whatsapp",  icon: "📱", label: "WhatsApp / SMS", description: "Connect via Twilio to deploy your agent on WhatsApp or SMS.",                  badge: "Consumer reach" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSystemPrompt(data: {
  name: string; agentType: string; mainJob: string
  audience: string; tone: string; restrictions: string; successMetrics: string
}): string {
  const typeLabel = AGENT_TYPES.find(t => t.id === data.agentType)?.label ?? data.agentType
  const audienceLabel = AUDIENCES.find(a => a.id === data.audience)?.label ?? data.audience
  const toneLabel = TONES.find(t => t.id === data.tone)?.label ?? data.tone

  return `You are ${data.name || "AI Assistant"}, an AI agent specialising in ${typeLabel || "general assistance"}.

## Your Role
${data.mainJob || "Help users with their requests"}

## Audience
You are talking to ${audienceLabel || "users"}. Tailor your language and depth accordingly.

## Tone & Style
Be ${toneLabel?.toLowerCase() || "helpful"} and clear. Always be respectful and accurate.
${data.restrictions ? `\n## Restrictions\n${data.restrictions}` : ""}
${data.successMetrics ? `\n## Success Criteria\n${data.successMetrics}` : ""}`
}

// ─── 6-Step Create Modal ──────────────────────────────────────────────────────

const STEP_LABELS = ["Purpose", "System Prompt", "Tools & APIs", "Memory", "Test", "Deploy"]

function StepTabs({ step, setStep, completedSteps }: {
  step: number; setStep: (s: number) => void; completedSteps: Set<number>
}) {
  return (
    <div className="flex items-center gap-0 px-6 pt-5 pb-0 overflow-x-auto">
      {STEP_LABELS.map((label, idx) => {
        const s = idx + 1
        const done = completedSteps.has(s)
        const current = step === s
        return (
          <button
            key={s}
            onClick={() => { if (done || s <= step) setStep(s) }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-all",
              current ? "border-purple-500 text-purple-300" : done ? "border-green-500/50 text-green-400 cursor-pointer" : "border-transparent text-slate-500 cursor-default"
            )}
          >
            {done && !current ? (
              <span className="w-4 h-4 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-[10px]">✓</span>
            ) : (
              <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold", current ? "bg-purple-500/30 text-purple-300" : "bg-slate-800 text-slate-500")}>
                {s}
              </span>
            )}
            {label}
          </button>
        )
      })}
    </div>
  )
}

// Step 1: Purpose
function Step1Purpose({ form, setForm }: {
  form: Partial<CreateAgentPayload>; setForm: (f: Partial<CreateAgentPayload>) => void
}) {
  const presets = [
    "Answer customer questions and escalate unresolved issues",
    "Search the web and write structured research reports",
    "Review code for bugs and suggest improvements",
    "Draft emails, posts, and marketing content",
    "Summarise meetings and extract action items",
  ]
  return (
    <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">STEP 1 OF 6</p>
        <p className="text-sm text-slate-400">Answer a few quick questions — we&apos;ll use your answers to build the perfect agent.</p>
      </div>

      {/* Q1 */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
          <span>👤</span> QUESTION 1 OF 7 — What do you want to call your agent?
        </label>
        <input
          value={form.name ?? ""}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Support Bot, Research Assistant, Code Reviewer..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 placeholder:text-slate-500"
        />
      </div>

      {/* Q2 */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
          <span>🤖</span> QUESTION 2 OF 7 — What kind of agent is this?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AGENT_TYPES.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setForm({ ...form, agentType: t.id })}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left",
                  form.agentType === t.id ? "bg-purple-500/20 border-purple-500 text-purple-300" : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" /> {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Q3 */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
          <span>🎯</span> QUESTION 3 OF 7 — What&apos;s the main job? <span className="text-slate-500 font-normal">(in plain English)</span>
        </label>
        <textarea
          value={form.mainJob ?? ""}
          onChange={e => setForm({ ...form, mainJob: e.target.value })}
          rows={3}
          placeholder="e.g. Answer customer questions, handle returns, and create support tickets for issues we can't resolve."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 placeholder:text-slate-500 resize-none"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {presets.map(p => (
            <button
              key={p}
              onClick={() => setForm({ ...form, mainJob: p })}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-full transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Q4 */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
          <span>👥</span> QUESTION 4 OF 7 — Who will be talking to this agent?
        </label>
        <div className="flex flex-wrap gap-2">
          {AUDIENCES.map(a => (
            <button
              key={a.id}
              onClick={() => setForm({ ...form, audience: a.id })}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                form.audience === a.id ? "bg-purple-500/20 border-purple-500 text-purple-300" : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500"
              )}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Q5 */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
          <span>🎙️</span> QUESTION 5 OF 7 — How should the agent sound?
        </label>
        <div className="flex flex-wrap gap-2">
          {TONES.map(t => (
            <button
              key={t.id}
              onClick={() => setForm({ ...form, tone: t.id })}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                form.tone === t.id ? "bg-purple-500/20 border-purple-500 text-purple-300" : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500"
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Q6 */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
          <span>🚫</span> QUESTION 6 OF 7 — <span className="text-slate-500 font-normal">optional</span> &nbsp;Anything it should never do?
        </label>
        <input
          value={form.restrictions ?? ""}
          onChange={e => setForm({ ...form, restrictions: e.target.value })}
          placeholder="e.g. Never share pricing, never discuss competitors, never give legal advice"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:border-purple-500 focus:outline-none placeholder:text-slate-500"
        />
      </div>

      {/* Q7 */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
          <span>✅</span> QUESTION 7 OF 7 — <span className="text-slate-500 font-normal">optional</span> &nbsp;How will you know it&apos;s doing a good job?
        </label>
        <input
          value={form.successMetrics ?? ""}
          onChange={e => setForm({ ...form, successMetrics: e.target.value })}
          placeholder="e.g. Resolves most questions without human help, always polite, gives a ticket number"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:border-purple-500 focus:outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-3 text-xs text-slate-400">
        <span className="text-purple-300 font-semibold">✨</span> Your answers will <span className="text-purple-300 font-semibold">auto-generate a system prompt</span> in the next step — you can edit or regenerate it any time.
      </div>
    </div>
  )
}

// Step 2: System Prompt
function Step2SystemPrompt({ form, setForm }: {
  form: Partial<CreateAgentPayload>; setForm: (f: Partial<CreateAgentPayload>) => void
}) {
  const [regenerating, setRegenerating] = useState(false)

  const regenerate = () => {
    setRegenerating(true)
    setTimeout(() => {
      setForm({ ...form, systemPrompt: generateSystemPrompt({
        name: form.name ?? "",
        agentType: form.agentType ?? "",
        mainJob: form.mainJob ?? "",
        audience: form.audience ?? "",
        tone: form.tone ?? "",
        restrictions: form.restrictions ?? "",
        successMetrics: form.successMetrics ?? "",
      })})
      setRegenerating(false)
    }, 600)
  }

  return (
    <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-200px)]">
      <div className="mb-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">STEP 2 OF 6</p>
        <p className="text-sm text-slate-400">The system prompt defines the agent&apos;s persona, scope, and behaviour. Be explicit about what it should and shouldn&apos;t do.</p>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-200">System Prompt</span>
        <button onClick={regenerate} disabled={regenerating} className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors border border-purple-500/30 px-3 py-1.5 rounded-lg hover:bg-purple-500/10">
          {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Regenerate from answers
        </button>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-3 text-xs text-green-400">
        ✨ Auto-generated from your Step 1 answers — edit freely below.
      </div>

      <textarea
        value={form.systemPrompt ?? ""}
        onChange={e => setForm({ ...form, systemPrompt: e.target.value })}
        rows={12}
        placeholder="You are a helpful assistant that..."
        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 placeholder:text-slate-500 resize-none"
      />

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1.5"><Check className="w-3 h-3" /> Include</p>
          <ul className="space-y-1 text-xs text-slate-400">
            {["Agent persona & role","Scope (what it handles)","Tone & response length","Escalation rules","What it must never do"].map(i => (
              <li key={i} className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">•</span>{i}</li>
            ))}
          </ul>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1.5"><X className="w-3 h-3" /> Avoid</p>
          <ul className="space-y-1 text-xs text-slate-400">
            {["Vague instructions","Contradictory rules","Unnecessary jargon","Overly long prompts","Missing edge cases"].map(i => (
              <li key={i} className="flex items-start gap-1.5"><span className="text-red-500 mt-0.5">•</span>{i}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Step 3: Tools
function Step3Tools({ form, setForm }: {
  form: Partial<CreateAgentPayload>; setForm: (f: Partial<CreateAgentPayload>) => void
}) {
  const [filter, setFilter] = useState("All")
  const filters = ["All", "Connected", "Available", "Suggested"]

  const toggle = (toolId: string) => {
    const current = form.tools ?? []
    setForm({ ...form, tools: current.includes(toolId) ? current.filter(t => t !== toolId) : [...current, toolId] })
  }

  return (
    <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-200px)]">
      <div className="mb-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">STEP 3 OF 6</p>
        <p className="text-sm text-slate-400">Equip your agent with tools: web search, database lookup, email sender, calendar API, Slack webhook. Click any tool to see configuration steps.</p>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
            filter === f ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          )}>{f}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TOOLS.map(tool => {
          const ToolIcon = tool.icon
          const selected = (form.tools ?? []).includes(tool.id)
          return (
            <div key={tool.id} onClick={() => toggle(tool.id)} className={cn(
              "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
              selected ? "border-purple-500/60 bg-purple-600/10" : "border-slate-700 bg-slate-800/40 hover:border-slate-600"
            )}>
              <input type="checkbox" readOnly checked={selected} className="mt-0.5 w-4 h-4 rounded accent-purple-500 shrink-0 cursor-pointer" />
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", selected ? "bg-purple-500/20 text-purple-400" : "bg-slate-700 text-slate-400")}>
                <ToolIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200">{tool.label}</p>
                <p className="text-xs text-slate-500">{tool.description}</p>
                <button className="text-[11px] text-orange-400 hover:text-orange-300 mt-1 transition-colors" onClick={e => e.stopPropagation()}>
                  ⚙️ How to configure ›
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 border border-dashed border-slate-700 rounded-lg px-4 py-3 text-center">
        <button className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 mx-auto">
          <Plus className="w-3.5 h-3.5" /> Add more tools
        </button>
      </div>

      <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-xs text-slate-400">
        <span className="text-blue-300 font-semibold">GPT-5.4, Claude Opus 4.6, Grok-4</span> all support function calling — define tools in JSON schema and the model will invoke them automatically when needed.
      </div>
    </div>
  )
}

// Step 4: Memory
function Step4Memory({ form, setForm }: {
  form: Partial<CreateAgentPayload>; setForm: (f: Partial<CreateAgentPayload>) => void
}) {
  const options = [
    { id: "none",        icon: "🚫", label: "No Memory",        desc: "Stateless — each conversation starts fresh. Best for simple Q&A agents." },
    { id: "short-term",  icon: "💬", label: "Short-term Only",  desc: "Maintains conversation history within a session. Forgets after the session ends." },
    { id: "long-term",   icon: "🗄️", label: "Short + Long-term",desc: "Persists key facts, preferences, and user data to a vector store across all sessions." },
  ]
  const selected = form.memory ?? "short-term"

  return (
    <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-200px)]">
      <div className="mb-5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">STEP 4 OF 6</p>
        <p className="text-sm text-slate-400">Configure short-term (conversation history) and long-term memory (vector store). Let the agent remember user preferences across sessions.</p>
      </div>

      <div className="space-y-3">
        {options.map(o => (
          <button key={o.id} onClick={() => setForm({ ...form, memory: o.id })} className={cn(
            "w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all",
            selected === o.id ? "border-orange-500/60 bg-orange-500/10" : "border-slate-700 bg-slate-800/40 hover:border-slate-600"
          )}>
            <div className={cn("w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center", selected === o.id ? "border-orange-500" : "border-slate-600")}>
              {selected === o.id && <div className="w-2 h-2 rounded-full bg-orange-500" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{o.icon} {o.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{o.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-xs text-slate-400">
        <span className="text-yellow-300 font-semibold">Pro tip:</span> Long-term memory uses a vector store (Pinecone, Weaviate, or NexusAI managed). Store user preferences, past resolutions, and context summaries — not raw conversation logs.
      </div>
    </div>
  )
}

// Step 5: Test
function Step5Test({ form, setForm }: {
  form: Partial<CreateAgentPayload & { testScenarios?: string[]; customScenarios?: string[] }>
  setForm: (f: typeof form) => void
}) {
  const [customInput, setCustomInput] = useState("")
  const selected: string[] = (form as { testScenarios?: string[] }).testScenarios ?? []
  const custom: string[] = (form as { customScenarios?: string[] }).customScenarios ?? []

  const toggleScenario = (s: string) => {
    const f = form as { testScenarios?: string[] }
    setForm({ ...form, testScenarios: selected.includes(s) ? selected.filter(x => x !== s) : [...selected, s] } as typeof form)
    void f
  }

  const addCustom = () => {
    if (!customInput.trim()) return
    const f = form as { customScenarios?: string[] }
    setForm({ ...form, customScenarios: [...(f.customScenarios ?? []), customInput.trim()] } as typeof form)
    setCustomInput("")
  }

  return (
    <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-200px)]">
      <div className="mb-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">STEP 5 OF 6</p>
        <p className="text-sm text-slate-400">Run the agent through 20+ test scenarios covering edge cases. Refine the system prompt based on failures.</p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-slate-200">Recommended Test Scenarios</p>
        <span className="text-xs text-slate-500">{selected.length} selected</span>
      </div>

      <div className="border border-slate-800 rounded-xl overflow-hidden mb-5">
        {TEST_SCENARIOS.map((s, i) => {
          const checked = selected.includes(s)
          return (
            <div key={s} onClick={() => toggleScenario(s)} className={cn(
              "flex items-center justify-between px-4 py-3 cursor-pointer border-b border-slate-800 last:border-0 transition-colors",
              checked ? "bg-purple-500/10" : "hover:bg-slate-800/40"
            )}>
              <div className="flex items-center gap-3">
                <input type="checkbox" readOnly checked={checked} className="w-4 h-4 rounded accent-purple-500 cursor-pointer" />
                <span className="text-sm text-slate-300">{s}</span>
              </div>
              <span className="text-xs text-slate-600 shrink-0">Scenario {i + 1}</span>
            </div>
          )
        })}
      </div>

      <div className="mb-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Manual Scenarios</p>
        <p className="text-sm font-semibold text-slate-200 mb-1">Add Your Own Test Scenarios</p>
        <p className="text-xs text-slate-500 mb-3">Write a scenario description, then optionally add expected behaviour. Press Enter or click Add.</p>
        <input
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") addCustom() }}
          placeholder="e.g. User asks in a language the agent wasn't trained for..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:border-purple-500 focus:outline-none placeholder:text-slate-500 mb-2"
        />
        <button onClick={addCustom} className="flex items-center gap-1.5 text-xs text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 px-3 py-1.5 rounded-lg transition-all">
          <Plus className="w-3.5 h-3.5" /> Add scenario
        </button>
        {custom.map((c, i) => (
          <div key={i} className="flex items-center gap-2 mt-2 text-sm text-slate-300 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2">
            <Check className="w-3.5 h-3.5 text-green-400 shrink-0" /> {c}
          </div>
        ))}
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-xs text-slate-400 mb-3">
        <span className="text-green-300 font-semibold">Agent Playground:</span> Use the NexusAI Playground to run test conversations, inspect tool calls, and debug failures before deployment. Aim for ≥90% pass rate on your test suite.
      </div>

      <button className="w-full flex items-center justify-center gap-2 border border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/10 text-slate-300 hover:text-purple-300 rounded-xl py-2.5 text-sm font-medium transition-all">
        ▷ Open Playground
      </button>
    </div>
  )
}

// Step 6: Deploy
function Step6Deploy() {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-200px)]">
      <div className="mb-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">STEP 6 OF 6</p>
        <p className="text-sm text-slate-400">Get a shareable endpoint or embed widget. Monitor performance in the NexusAI dashboard — track response quality, latency, token usage, and satisfaction scores.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {DEPLOY_OPTIONS.map(o => (
          <button key={o.id} onClick={() => setSelected(o.id)} className={cn(
            "text-left p-4 rounded-xl border transition-all",
            selected === o.id ? "border-purple-500/60 bg-purple-500/10" : "border-slate-700 bg-slate-800/40 hover:border-slate-600"
          )}>
            <span className="text-2xl mb-2 block">{o.icon}</span>
            <p className="text-sm font-semibold text-slate-200 mb-1">{o.label}</p>
            <p className="text-xs text-slate-400 mb-2">{o.description}</p>
            <span className="text-[10px] font-bold text-orange-400 border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 rounded-full">{o.badge}</span>
          </button>
        ))}
      </div>

      {/* Metrics */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4 text-green-400" />
          <p className="text-sm font-semibold text-slate-200">Dashboard Metrics</p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { val: "94%",     label: "Response Quality" },
            { val: "1.2s",    label: "Avg Latency" },
            { val: "12.4K/day", label: "Token Usage" },
            { val: "4.7 ⭐",  label: "Satisfaction" },
          ].map(m => (
            <div key={m.label} className="text-center">
              <p className="text-lg font-bold text-white">{m.val}</p>
              <p className="text-[10px] text-slate-500">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-5 text-center">
        <span className="text-3xl mb-2 block">🎉</span>
        <p className="font-bold text-slate-100 mb-1">Your agent is ready to deploy!</p>
        <p className="text-sm text-slate-400">Review your configuration in the summary and click Deploy to go live.</p>
      </div>
    </div>
  )
}

// ─── Main Create Modal ─────────────────────────────────────────────────────────

function CreateAgentModal({ open, onClose, onDeploy, deploying }: {
  open: boolean; onClose: () => void
  onDeploy: (payload: CreateAgentPayload) => void
  deploying: boolean
}) {
  const [step, setStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [form, setForm] = useState<Partial<CreateAgentPayload & { testScenarios?: string[]; customScenarios?: string[] }>>({
    memory: "short-term", tools: [],
  })

  // Auto-generate system prompt when entering step 2
  const handleSetStep = (s: number) => {
    if (s === 2 && !form.systemPrompt) {
      setForm(prev => ({ ...prev, systemPrompt: generateSystemPrompt({
        name: prev.name ?? "", agentType: prev.agentType ?? "",
        mainJob: prev.mainJob ?? "", audience: prev.audience ?? "",
        tone: prev.tone ?? "", restrictions: prev.restrictions ?? "",
        successMetrics: prev.successMetrics ?? "",
      })}))
    }
    setCompletedSteps(prev => new Set([...prev, step]))
    setStep(s)
  }

  const handleNext = () => {
    if (step < 6) handleSetStep(step + 1)
  }

  const handleBack = () => { if (step > 1) setStep(step - 1) }

  const handleDeploy = () => {
    const payload: CreateAgentPayload = {
      name: form.name ?? "Untitled Agent",
      description: form.mainJob ?? "",
      modelId: "gpt-4o",
      systemPrompt: form.systemPrompt ?? "",
      tools: form.tools ?? [],
      agentType: form.agentType ?? "",
      mainJob: form.mainJob ?? "",
      audience: form.audience ?? "",
      tone: form.tone ?? "",
      restrictions: form.restrictions ?? "",
      successMetrics: form.successMetrics ?? "",
      memory: form.memory ?? "short-term",
    }
    onDeploy(payload)
  }

  const canContinue = step === 1 ? !!(form.name?.trim()) : true

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl shadow-black/60 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {["Define your agent&apos;s purpose","Write the system prompt","Connect tools & APIs","Set up memory","Test & iterate","Deploy & monitor"][step - 1]}
              </h2>
              <p className="text-xs text-slate-500">Step {step} of 6</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step tabs */}
        <div className="shrink-0 border-b border-slate-800/60">
          <StepTabs step={step} setStep={handleSetStep} completedSteps={completedSteps} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {step === 1 && <Step1Purpose form={form} setForm={setForm} />}
          {step === 2 && <Step2SystemPrompt form={form} setForm={setForm} />}
          {step === 3 && <Step3Tools form={form} setForm={setForm} />}
          {step === 4 && <Step4Memory form={form} setForm={setForm} />}
          {step === 5 && <Step5Test form={form} setForm={setForm} />}
          {step === 6 && <Step6Deploy />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 shrink-0">
          <button onClick={handleBack} disabled={step === 1} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors px-3 py-2 rounded-lg hover:bg-slate-800">
            ← Back
          </button>
          <div className="flex items-center gap-2">
            {/* dot progress */}
            <div className="flex gap-1 mr-2">
              {[1,2,3,4,5,6].map(s => (
                <div key={s} className={cn("w-1.5 h-1.5 rounded-full transition-all", s === step ? "bg-orange-500" : completedSteps.has(s) ? "bg-green-500" : "bg-slate-700")} />
              ))}
            </div>
            {step < 6 ? (
              <button onClick={handleNext} disabled={!canContinue} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all">
                Next →
              </button>
            ) : (
              <button onClick={handleDeploy} disabled={deploying} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all">
                {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                {deploying ? "Deploying…" : "🚀 Deploy Agent"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const TASKS = [
  "Dashboard Layout Adju...",
  "Design agent system pr...",
  "Configure tool integrati...",
]

function HomeSidebar({ onNewAgent }: { onNewAgent: () => void }) {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/60 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Agent Builder</p>
            <p className="text-[11px] text-slate-500 leading-tight">Create powerful AI agents using any model. Pick a template or start from scratch.</p>
          </div>
        </div>
      </div>

      {/* New Agent */}
      <div className="px-3 pt-3">
        <button onClick={onNewAgent} className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm py-2.5 rounded-xl transition-all">
          <Plus className="w-4 h-4" /> New Agent
        </button>
      </div>

      {/* Not sure card */}
      <div className="mx-3 mt-3 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
        <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Not sure where to start?
        </p>
        <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">Chat with our AI guide — describe what you want your agent to do and get a personalised setup plan.</p>
        <a href="/hub" className="text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all inline-block">
          Ask the Hub →
        </a>
      </div>

      {/* Tasks */}
      <div className="px-3 mt-4">
        <button className="w-full flex items-center gap-2 text-sm text-slate-300 hover:text-white border border-dashed border-slate-700 hover:border-slate-600 hover:bg-slate-800/40 rounded-xl py-2 px-3 transition-all">
          <Plus className="w-4 h-4" /> New Task
        </button>
        <div className="mt-2 space-y-1">
          {TASKS.map(t => (
            <div key={t} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-800/40 cursor-pointer group">
              <div className="w-3.5 h-3.5 rounded border border-slate-600 shrink-0" />
              <span className="text-xs text-slate-400 group-hover:text-slate-200 truncate">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

function LibrarySidebar({ agents, loadingAgents, onBack, onCreateCustom, onDeleteAgent }: {
  agents: Agent[]; loadingAgents: boolean
  onBack: () => void; onCreateCustom: () => void
  onDeleteAgent: (id: string) => void
}) {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/60 flex flex-col h-full overflow-hidden">
      {/* My Agents header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <p className="text-sm font-bold text-white">My Agents</p>
        </div>
        <button onClick={onBack} className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Back */}
      <div className="px-3 pt-3 shrink-0">
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-slate-800 flex items-center gap-1">
          ← Back
        </button>
      </div>

      {/* Not sure card */}
      <div className="mx-3 mt-3 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 shrink-0">
        <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Not sure where to start?
        </p>
        <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">Chat with our AI guide — describe what you want your agent to do and get a personalised setup plan.</p>
        <a href="/hub" className="text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all inline-block">
          Ask the Hub →
        </a>
      </div>

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {loadingAgents ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-purple-400" /></div>
        ) : agents.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No agents yet</p>
        ) : (
          agents.map(agent => {
            const model = MODELS.find(m => m.id === agent.modelId)
            return (
              <div key={agent._id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/60 group cursor-pointer border border-transparent hover:border-slate-700/60 transition-all">
                <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{agent.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{model?.name ?? agent.modelId} · {agent.tools.length} tools</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn("w-1.5 h-1.5 rounded-full", agent.status === "active" ? "bg-green-400 animate-pulse" : "bg-yellow-400")} />
                  <button
                    onClick={() => onDeleteAgent(agent._id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Create Custom Agent */}
      <div className="px-3 pb-4 shrink-0">
        <button onClick={onCreateCustom} className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm py-2.5 rounded-xl transition-all">
          <Sparkles className="w-4 h-4" /> Create Custom Agent
        </button>
      </div>
    </aside>
  )
}

// ─── Home main content ────────────────────────────────────────────────────────

function HomeMain({ onNewAgent }: { onNewAgent: () => void }) {
  const [activeCat, setActiveCat] = useState("Use cases")

  return (
    <main className="flex-1 overflow-y-auto px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Agent works <span className="text-orange-400">for you.</span>
        </h1>
        <p className="text-slate-400 text-base">Your AI agent takes care of everything, end to end.</p>
      </div>

      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-lg">
          <input
            placeholder="What should we work on next?"
            className="w-full bg-transparent text-slate-200 text-sm placeholder:text-slate-500 outline-none mb-3"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[
                { icon: Mic, color: "text-pink-400 bg-pink-500/15" },
                { icon: Database, color: "text-yellow-400 bg-yellow-500/15" },
                { icon: Zap, color: "text-blue-400 bg-blue-500/15" },
                { icon: Settings2, color: "text-green-400 bg-green-500/15" },
                { icon: Paperclip, color: "text-orange-400 bg-orange-500/15" },
                { icon: ImageIcon, color: "text-purple-400 bg-purple-500/15" },
                { icon: Plus, color: "text-slate-400 bg-slate-700" },
              ].map(({ icon: Icon, color }, i) => (
                <button key={i} className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all hover:scale-110", color)}>
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Agent</span>
              <button className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-400 flex items-center justify-center transition-all">
                <ArrowUp className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="max-w-2xl mx-auto mb-6 flex flex-wrap gap-2 justify-center">
        {CATEGORY_TABS.map(c => (
          <button key={c} onClick={() => setActiveCat(c)} className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
            activeCat === c ? "bg-slate-100 text-slate-900 border-transparent" : "bg-transparent text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
          )}>{c}</button>
        ))}
      </div>

      {/* Task suggestions */}
      <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-8">
        {TASK_SUGGESTIONS.map((t, i) => (
          <button key={i} className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-800/60 transition-colors border-b border-slate-800 last:border-0 group">
            <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center text-base shrink-0 transition-colors">
              {t.icon}
            </div>
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{t.text}</span>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 ml-auto transition-colors" />
          </button>
        ))}
        <div className="flex items-center justify-between px-5 py-3">
          <button className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            View all suggestions <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Shuffle
          </button>
        </div>
      </div>

      {/* Agent templates strip */}
      <TemplatesStrip onUseTemplate={onNewAgent} />
    </main>
  )
}

// ─── Library main content ─────────────────────────────────────────────────────

function LibraryMain({ onCreateCustom }: { onCreateCustom: () => void }) {
  return (
    <main className="flex-1 overflow-y-auto px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Agent Library</h2>
          <p className="text-sm text-slate-500">Choose a default agent or build your own</p>
        </div>
        <button className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-xl transition-all">
          Default Agents
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {LIBRARY_AGENTS.map(agent => (
          <div key={agent.id} className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-black/30 cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0", agent.color)}>
                {agent.icon}
              </div>
              <p className="font-bold text-sm text-white group-hover:text-slate-100">{agent.name}</p>
            </div>
            <p className="text-xs text-slate-400 mb-3 line-clamp-3 leading-relaxed">{agent.description}</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">{agent.model}</span>
              {agent.tools.slice(0, 2).map(t => (
                <span key={t} className="text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">{t}</span>
              ))}
              {agent.tools.length > 2 && (
                <span className="text-[10px] text-slate-600 px-1">+{agent.tools.length - 2}</span>
              )}
            </div>
          </div>
        ))}

        {/* Build from Scratch */}
        <div
          onClick={onCreateCustom}
          className="border-2 border-dashed border-slate-700 hover:border-orange-500/50 hover:bg-slate-900/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full border-2 border-slate-700 group-hover:border-orange-500/50 flex items-center justify-center mb-3 transition-all">
            <Plus className="w-6 h-6 text-slate-500 group-hover:text-orange-400 transition-colors" />
          </div>
          <p className="font-bold text-sm text-slate-300 group-hover:text-white transition-colors">Build from Scratch</p>
          <p className="text-xs text-slate-600 mt-1">Create a fully custom agent</p>
        </div>
      </div>

      {/* Templates strip */}
      <TemplatesStrip onUseTemplate={onCreateCustom} />
    </main>
  )
}

// ─── Templates strip (shared) ─────────────────────────────────────────────────

interface TemplateStrip { id: string; icon: string; name: string; description: string; model: string; tags: string[] }

const TEMPLATE_STRIPS: TemplateStrip[] = [
  { id: "research",   icon: "🔍", name: "Research Agent",         description: "Automates web research and generates structured reports.",     model: "GPT-5.4",        tags: ["Web search"] },
  { id: "support",    icon: "🎧", name: "Support Agent",          description: "Handles tickets, FAQs, and escalates complex issues.",         model: "GPT-5.4",        tags: ["Ticketing"] },
  { id: "code",       icon: "💻", name: "Code Review Agent",      description: "Reviews PRs, flags bugs, and suggests improvements.",         model: "Claude Opus 4.6",tags: ["GitHub"] },
  { id: "data",       icon: "📊", name: "Data Analysis Agent",    description: "Processes spreadsheets and generates visual insights.",        model: "Gemini",         tags: ["Sheets"] },
  { id: "content",    icon: "✍️", name: "Content Writer Agent",   description: "Creates blog posts and marketing copy with brand voice.",     model: "Claude Opus 4.6",tags: ["Marketing"] },
]

function TemplatesStrip({ onUseTemplate }: { onUseTemplate: () => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Agent Templates</p>
        <span className="text-xs font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">6</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {TEMPLATE_STRIPS.map(t => (
          <div key={t.id} className="min-w-[200px] bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-all cursor-pointer group shrink-0" onClick={onUseTemplate}>
            <p className="text-sm font-bold text-white mb-1 flex items-center gap-2">{t.icon} {t.name}</p>
            <p className="text-xs text-slate-500 mb-2 line-clamp-2">{t.description}</p>
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] font-medium bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">{t.model}</span>
              {t.tags.map(tag => (
                <span key={tag} className="text-[10px] font-medium bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full border border-slate-700">{tag}</span>
              ))}
            </div>
          </div>
        ))}
        {/* Build from Scratch */}
        <div className="min-w-[160px] border-2 border-dashed border-slate-700 hover:border-orange-500/40 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-900/50 transition-all shrink-0 group" onClick={onUseTemplate}>
          <Plus className="w-6 h-6 text-slate-500 group-hover:text-orange-400 transition-colors mb-1" />
          <p className="text-xs font-bold text-slate-400 group-hover:text-orange-400 transition-colors">Build from Scratch</p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [view, setView] = useState<"home" | "library">("home")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(false)
  const redirected = useRef(false)

  // Auth guard — runs client-side after hydration
  useEffect(() => {
    const token = getToken()
    if (!token) {
      if (!redirected.current) {
        redirected.current = true
        router.replace("/auth/login?redirect=/agents")
      }
    } else {
      setIsLoggedIn(true)
      setAuthChecked(true)
    }
  }, [router])

  const loadAgents = useCallback(async () => {
    if (!isLoggedIn) return
    setLoadingAgents(true)
    try {
      const data = await fetchAgents()
      setAgents(data)
    } catch { /* silent */ }
    finally { setLoadingAgents(false) }
  }, [isLoggedIn])

  useEffect(() => { void loadAgents() }, [loadAgents])

  // Show nothing while checking auth (prevents flash)
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center animate-pulse">
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-sm text-slate-500">Checking authentication…</p>
        </div>
      </div>
    )
  }

  const handleNewAgent = () => { setView("library") }
  const handleCreateCustom = () => { setCreateModalOpen(true) }

  const handleDeploy = async (payload: CreateAgentPayload) => {
    setDeploying(true)
    try {
      const newAgent = await createAgent(payload)
      setAgents(prev => [newAgent, ...prev])
      setCreateModalOpen(false)
      setView("library")
    } catch { /* ignore */ }
    finally { setDeploying(false) }
  }

  const handleDeleteAgent = async (id: string) => {
    try {
      await deleteAgent(id)
      setAgents(prev => prev.filter(a => a._id !== id))
    } catch { /* ignore */ }
  }

  return (
    <div className="page-transition bg-slate-950 text-slate-100 flex" style={{ height: "calc(100vh - 56px)" }}>
      {/* Sidebar */}
      {view === "home" ? (
        <HomeSidebar onNewAgent={handleNewAgent} />
      ) : (
        <LibrarySidebar
          agents={agents}
          loadingAgents={loadingAgents}
          onBack={() => setView("home")}
          onCreateCustom={handleCreateCustom}
          onDeleteAgent={handleDeleteAgent}
        />
      )}

      {/* Main content */}
      {view === "home" ? (
        <HomeMain onNewAgent={handleNewAgent} />
      ) : (
        <LibraryMain onCreateCustom={handleCreateCustom} />
      )}

      {/* 6-Step Modal */}
      <CreateAgentModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onDeploy={handleDeploy}
        deploying={deploying}
      />
    </div>
  )
}
