"use client"

import { useState } from "react"
import {
  Bot,
  Plus,
  MessageSquare,
  Search,
  Headphones,
  Code2,
  BarChart2,
  PenLine,
  Globe,
  Terminal,
  Image as ImageIcon,
  Database,
  GitBranch,
  Tag,
  FileText,
  Mail,
  Calendar,
  X,
  CheckCircle2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MODELS } from "@/lib/models-data"
import type { AIModel } from "@/lib/models-data"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Template {
  id: string
  icon: LucideIcon
  title: string
  description: string
  model: string
  tags: string[]
  systemPrompt: string
  tools: string[]
  color: string
}

interface DeployedAgent {
  id: string
  name: string
  description: string
  modelId: string
  tools: string[]
  status: "active" | "idle"
  createdAt: Date
  requestCount: number
}

interface ToolDef {
  id: string
  icon: LucideIcon
  label: string
  description: string
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const TEMPLATES: Template[] = [
  {
    id: "research",
    icon: Search,
    title: "Research Agent",
    description:
      "Autonomously searches the web, summarizes findings, and generates structured research reports.",
    model: "GPT-4o",
    tags: ["Web search", "Reports", "Summarization"],
    systemPrompt:
      "You are a research assistant. When given a topic, search for relevant information, synthesize findings from multiple sources, and produce a well-structured report with citations.",
    tools: ["web-search", "document-reader"],
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    id: "support",
    icon: Headphones,
    title: "Customer Support Agent",
    description:
      "Handles customer inquiries, resolves common issues, and escalates complex cases to human agents.",
    model: "GPT-4o",
    tags: ["Ticketing", "Escalation", "FAQ"],
    systemPrompt:
      "You are a customer support agent. Be empathetic, professional, and solution-focused. Always try to resolve issues within your capabilities before escalating.",
    tools: ["knowledge-base", "ticketing"],
    color: "bg-green-500/20 text-green-400",
  },
  {
    id: "code-review",
    icon: Code2,
    title: "Code Review Agent",
    description:
      "Reviews pull requests, identifies bugs and security issues, and suggests improvements with examples.",
    model: "Claude 3.5 Sonnet",
    tags: ["GitHub", "Security", "Best practices"],
    systemPrompt:
      "You are an expert code reviewer. Analyze code for bugs, security vulnerabilities, performance issues, and style violations. Provide specific, actionable feedback with code examples.",
    tools: ["code-execution", "github"],
    color: "bg-purple-500/20 text-purple-400",
  },
  {
    id: "data-analysis",
    icon: BarChart2,
    title: "Data Analysis Agent",
    description:
      "Analyzes spreadsheets and datasets, generates insights, and creates visualizations from raw data.",
    model: "Gemini 1.5 Pro",
    tags: ["Spreadsheets", "Charts", "Insights"],
    systemPrompt:
      "You are a data analyst. When given data, identify patterns, anomalies, and insights. Generate clear visualizations and provide actionable recommendations based on the data.",
    tools: ["code-execution", "data-analysis"],
    color: "bg-yellow-500/20 text-yellow-400",
  },
  {
    id: "content-writer",
    icon: PenLine,
    title: "Content Writer Agent",
    description:
      "Creates SEO-optimized content, marketing copy, and social media posts tailored to your brand voice.",
    model: "Claude 3.5 Sonnet",
    tags: ["Marketing", "SEO", "Social media"],
    systemPrompt:
      "You are a professional content writer. Create engaging, SEO-optimized content that matches the brand voice. Always include relevant keywords naturally and structure content for readability.",
    tools: ["web-search", "image-gen"],
    color: "bg-pink-500/20 text-pink-400",
  },
]

const TOOLS: ToolDef[] = [
  {
    id: "web-search",
    icon: Globe,
    label: "Web Search",
    description: "Search the internet in real-time",
  },
  {
    id: "code-execution",
    icon: Terminal,
    label: "Code Execution",
    description: "Run Python/JS code and return results",
  },
  {
    id: "image-gen",
    icon: ImageIcon,
    label: "Image Generation",
    description: "Generate images with DALL-E or Stable Diffusion",
  },
  {
    id: "knowledge-base",
    icon: Database,
    label: "Knowledge Base",
    description: "Query your custom documents and data",
  },
  {
    id: "github",
    icon: GitBranch,
    label: "GitHub Integration",
    description: "Read/write to GitHub repos and PRs",
  },
  {
    id: "ticketing",
    icon: Tag,
    label: "Ticketing System",
    description: "Create and manage support tickets",
  },
  {
    id: "data-analysis",
    icon: BarChart2,
    label: "Data Analysis",
    description: "Analyze CSVs, Excel, and databases",
  },
  {
    id: "document-reader",
    icon: FileText,
    label: "Document Reader",
    description: "Parse PDFs, Word docs, and more",
  },
  {
    id: "email",
    icon: Mail,
    label: "Email Integration",
    description: "Send and read emails",
  },
  {
    id: "calendar",
    icon: Calendar,
    label: "Calendar",
    description: "Schedule and manage events",
  },
]

// ─── TemplateCard ─────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onUse,
}: {
  template: Template
  onUse: (t: Template) => void
}) {
  const Icon = template.icon
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 hover:shadow-lg hover:shadow-purple-500/5 transition-all flex flex-col">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          template.color
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-bold text-base mt-3 text-slate-100">{template.title}</p>
      <p className="text-sm text-slate-400 mt-1 line-clamp-2 flex-1">
        {template.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full">
          {template.model}
        </span>
        {template.tags.map((tag) => (
          <span
            key={tag}
            className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      <button
        onClick={() => onUse(template)}
        className="w-full mt-4 bg-slate-800 hover:bg-purple-600/20 hover:border-purple-500/50 border border-slate-700 text-slate-300 hover:text-purple-300 text-sm transition-all rounded-xl py-2"
      >
        Use template →
      </button>
    </div>
  )
}

// ─── AgentModal ───────────────────────────────────────────────────────────────

function AgentModal({
  open,
  step,
  setStep,
  selectedModelId,
  setSelectedModelId,
  agentName,
  setAgentName,
  agentDescription,
  setAgentDescription,
  systemPrompt,
  setSystemPrompt,
  selectedTools,
  setSelectedTools,
  onClose,
  onDeploy,
}: {
  open: boolean
  step: 1 | 2 | 3 | 4
  setStep: (s: 1 | 2 | 3 | 4) => void
  selectedModelId: string
  setSelectedModelId: (id: string) => void
  agentName: string
  setAgentName: (v: string) => void
  agentDescription: string
  setAgentDescription: (v: string) => void
  systemPrompt: string
  setSystemPrompt: (v: string) => void
  selectedTools: string[]
  setSelectedTools: (tools: string[]) => void
  onClose: () => void
  onDeploy: () => void
}) {
  const [categoryFilter, setCategoryFilter] = useState<string>("All")

  if (!open) return null

  const stepTitles: Record<number, string> = {
    1: "Choose Base Model",
    2: "Configure Agent",
    3: "Add Tools",
    4: "Review & Deploy",
  }

  const categories = ["All", "Language", "Code", "Vision"]

  const filteredModels =
    categoryFilter === "All"
      ? MODELS
      : MODELS.filter((m) => m.category === categoryFilter)

  const selectedModel = MODELS.find((m) => m.id === selectedModelId)

  const toggleTool = (toolId: string) => {
    setSelectedTools(
      selectedTools.includes(toolId)
        ? selectedTools.filter((t) => t !== toolId)
        : [...selectedTools, toolId]
    )
  }

  const canContinue =
    step === 1
      ? !!selectedModelId
      : step === 2
      ? !!agentName.trim()
      : true

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-slate-100">
            {stepTitles[step]}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 pb-4">
          <div className="flex items-center">
            {([1, 2, 3, 4] as const).map((s, idx) => {
              const labels: Record<number, string> = {
                1: "Choose Model",
                2: "Configure",
                3: "Add Tools",
                4: "Review",
              }
              const completed = step > s
              const current = step === s
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                        completed
                          ? "bg-purple-600 text-white"
                          : current
                          ? "bg-purple-600/40 border-2 border-purple-500 text-purple-300"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                      )}
                    >
                      {completed ? <CheckCircle2 className="h-4 w-4" /> : s}
                    </div>
                    <span
                      className={cn(
                        "text-xs whitespace-nowrap",
                        current ? "text-purple-300" : "text-slate-400"
                      )}
                    >
                      {labels[s]}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2 mb-4",
                        completed ? "bg-purple-600" : "bg-slate-700"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="px-6 pb-4">
            <p className="text-base font-semibold text-slate-100">
              Choose your base model
            </p>
            <p className="text-sm text-slate-400 mt-1">
              This determines the intelligence and capabilities of your agent
            </p>

            {/* Filter pills */}
            <div className="flex gap-2 mt-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm transition-all",
                    categoryFilter === cat
                      ? "bg-purple-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Model grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-h-80 overflow-y-auto pr-1">
              {filteredModels.map((model: AIModel) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModelId(model.id)}
                  className={cn(
                    "border rounded-xl p-3 cursor-pointer transition-all text-left",
                    selectedModelId === model.id
                      ? "bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/30"
                      : "bg-slate-800 border-slate-700 hover:border-slate-500"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{model.logo}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-100 truncate">
                        {model.name}
                      </p>
                      <p className="text-xs text-slate-400">{model.lab}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    ${model.inputPrice} input · ${model.outputPrice} output / 1M
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="px-6 pb-4 space-y-4">
            <div>
              <p className="text-base font-semibold text-slate-100">
                Configure your agent
              </p>
            </div>

            {/* Selected model pill */}
            {selectedModel && (
              <div className="flex items-center gap-2">
                <span className="bg-slate-800 text-slate-300 text-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span>{selectedModel.logo}</span>
                  <span>{selectedModel.name}</span>
                </span>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  × Change
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Agent Name
              </label>
              <input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="My Research Agent"
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 w-full text-sm text-slate-100 focus:border-purple-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Description
              </label>
              <input
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                placeholder="Describe what this agent does..."
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 w-full text-sm text-slate-100 focus:border-purple-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                System Prompt
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={6}
                placeholder="You are a helpful assistant that..."
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 w-full text-sm text-slate-100 focus:border-purple-500 focus:outline-none placeholder:text-slate-500 resize-none"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="px-6 pb-4">
            <p className="text-base font-semibold text-slate-100">
              Add tools &amp; integrations
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Give your agent superpowers
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {TOOLS.map((tool) => {
                const ToolIcon = tool.icon
                const selected = selectedTools.includes(tool.id)
                return (
                  <div
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                      selected
                        ? "border-purple-500/60 bg-purple-600/10"
                        : "border-slate-700 bg-slate-800 hover:border-slate-600"
                    )}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={selected}
                      className="w-4 h-4 rounded accent-purple-500 shrink-0 mt-0.5 cursor-pointer"
                    />
                    <div className="bg-slate-700 text-slate-300 rounded-lg p-1.5 w-8 h-8 flex items-center justify-center shrink-0">
                      <ToolIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-100">
                        {tool.label}
                      </p>
                      <p className="text-xs text-slate-500">{tool.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="px-6 pb-4">
            <p className="text-base font-semibold text-slate-100">
              Review &amp; deploy your agent
            </p>

            <div className="bg-slate-800 rounded-xl p-5 mt-4">
              <p className="font-bold text-lg text-slate-100">{agentName}</p>
              {agentDescription && (
                <p className="text-sm text-slate-400 mt-1">{agentDescription}</p>
              )}
              {selectedModel && (
                <div className="flex items-center gap-1.5 mt-3">
                  <span>{selectedModel.logo}</span>
                  <span className="text-sm text-slate-300">{selectedModel.name}</span>
                </div>
              )}
              {selectedTools.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedTools.map((toolId) => {
                    const toolDef = TOOLS.find((t) => t.id === toolId)
                    return (
                      <span
                        key={toolId}
                        className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full"
                      >
                        {toolDef?.label ?? toolId}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Estimated cost: depends on usage · Billed per token
            </p>

            <button
              onClick={onDeploy}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white w-full py-3 rounded-xl font-semibold text-base mt-4 transition-all"
            >
              🚀 Deploy Agent
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-slate-800">
          <div>
            {step > 1 && (
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white"
                onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4)}
              >
                ← Back
              </Button>
            )}
          </div>
          {step < 4 && (
            <Button
              disabled={!canContinue}
              onClick={() => setStep((step + 1) as 1 | 2 | 3 | 4)}
              className="bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40"
            >
              Continue →
            </Button>
          )}
          {step === 4 && (
            <Button
              onClick={onDeploy}
              className="bg-purple-600 hover:bg-purple-500 text-white"
            >
              Deploy Agent
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── AgentsPage (default export) ─────────────────────────────────────────────

export default function AgentsPage() {
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Step 1
  const [selectedModelId, setSelectedModelId] = useState<string>("")

  // Step 2
  const [agentName, setAgentName] = useState("")
  const [agentDescription, setAgentDescription] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")

  // Step 3
  const [selectedTools, setSelectedTools] = useState<string[]>([])

  // Deployed agents
  const [deployedAgents, setDeployedAgents] = useState<DeployedAgent[]>([])

  const resetForm = () => {
    setStep(1)
    setSelectedModelId("")
    setAgentName("")
    setAgentDescription("")
    setSystemPrompt("")
    setSelectedTools([])
  }

  const openNewAgent = () => {
    resetForm()
    setModalOpen(true)
  }

  const openFromTemplate = (template: Template) => {
    resetForm()
    // Pre-fill from template
    const matchedModel = MODELS.find(
      (m) => m.name.toLowerCase() === template.model.toLowerCase()
    )
    if (matchedModel) setSelectedModelId(matchedModel.id)
    setSystemPrompt(template.systemPrompt)
    setSelectedTools(template.tools)
    setStep(2)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    resetForm()
  }

  const handleDeploy = () => {
    const newAgent: DeployedAgent = {
      id: crypto.randomUUID(),
      name: agentName,
      description: agentDescription,
      modelId: selectedModelId,
      tools: selectedTools,
      status: "active",
      createdAt: new Date(),
      requestCount: 0,
    }
    setDeployedAgents((prev) => [newAgent, ...prev])
    setModalOpen(false)
    resetForm()
  }

  const deleteAgent = (id: string) => {
    setDeployedAgents((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="page-transition bg-slate-950 text-slate-100 min-h-screen">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-7 w-7 text-purple-400" />
            <h1 className="text-2xl font-bold">Agent Builder</h1>
          </div>
          <Button
            onClick={openNewAgent}
            className="bg-purple-600 hover:bg-purple-500 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Agent
          </Button>
        </div>

        {/* Banner card */}
        <div className="mt-4 mb-8 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/20 rounded-xl p-3 shrink-0">
              <MessageSquare className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-100">
                Not sure where to start?
              </p>
              <p className="text-sm text-slate-400">
                Chat with our AI guide to get personalized agent recommendations
              </p>
            </div>
          </div>
          <a href="/hub">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white text-sm shrink-0">
              Chat with AI Guide →
            </Button>
          </a>
        </div>

        {/* Deployed Agents Section */}
        {deployedAgents.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold">Your Agents</h2>
              <span className="bg-purple-600/30 text-purple-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {deployedAgents.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deployedAgents.map((agent) => {
                const model = MODELS.find((m) => m.id === agent.modelId)
                return (
                  <div
                    key={agent.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3"
                  >
                    {/* Name + status */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-100 leading-tight">
                        {agent.name}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            agent.status === "active"
                              ? "bg-green-400"
                              : "bg-yellow-400"
                          )}
                        />
                        <span className="text-xs text-slate-400 capitalize">
                          {agent.status}
                        </span>
                      </div>
                    </div>

                    {/* Model */}
                    {model && (
                      <p className="text-sm text-slate-300 flex items-center gap-1.5">
                        <span>{model.logo}</span>
                        <span>{model.name}</span>
                      </p>
                    )}

                    {/* Description */}
                    {agent.description && (
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {agent.description}
                      </p>
                    )}

                    {/* Tools */}
                    {agent.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {agent.tools.map((toolId) => {
                          const toolDef = TOOLS.find((t) => t.id === toolId)
                          return (
                            <span
                              key={toolId}
                              className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full"
                            >
                              {toolDef?.label ?? toolId}
                            </span>
                          )
                        })}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="text-xs text-slate-500">
                        {agent.requestCount} requests
                      </span>
                      <div className="flex gap-2">
                        <button className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-slate-800">
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAgent(agent.id)}
                          className="text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Templates Section */}
        <section>
          <h2 className="text-xl font-bold mb-4">Start from a template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={openFromTemplate}
              />
            ))}

            {/* Build from Scratch card */}
            <div
              className="group border-dashed border-2 border-slate-700 bg-transparent hover:border-purple-500/50 hover:bg-slate-900/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
              onClick={openNewAgent}
            >
              <div className="w-14 h-14 rounded-full border border-slate-700 group-hover:border-purple-500/50 flex items-center justify-center mb-3 transition-all">
                <Plus className="h-8 w-8 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </div>
              <p className="font-bold text-base text-slate-300 group-hover:text-slate-100 transition-colors">
                Build from Scratch
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Start with a blank canvas and full control
              </p>
              <button className="w-full mt-4 bg-slate-800 hover:bg-purple-600/20 hover:border-purple-500/50 border border-slate-700 text-slate-300 hover:text-purple-300 text-sm transition-all rounded-xl py-2">
                Get started →
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Modal */}
      <AgentModal
        open={modalOpen}
        step={step}
        setStep={setStep}
        selectedModelId={selectedModelId}
        setSelectedModelId={setSelectedModelId}
        agentName={agentName}
        setAgentName={setAgentName}
        agentDescription={agentDescription}
        setAgentDescription={setAgentDescription}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        selectedTools={selectedTools}
        setSelectedTools={setSelectedTools}
        onClose={handleClose}
        onDeploy={handleDeploy}
      />
    </div>
  )
}
