"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Settings,
  MoreHorizontal,
  Send,
  Paperclip,
  ShoppingBag,
  Bot,
  BookOpen,
  Wand2,
  DollarSign,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MODELS, AIModel } from "@/lib/models-data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatContextWindow(v: number): string {
  if (v >= 1_000_000) return `${Math.round(v / 1_000_000)}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
  return String(v);
}

function getBadgeStyle(badge: AIModel["badge"]): string {
  switch (badge) {
    case "Live":
      return "bg-green-500/20 text-green-400 border border-green-500/30";
    case "New":
      return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "Hot":
      return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    default:
      return "";
  }
}

// Render text: split on \n and bold **text** patterns
function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className={i > 0 ? "mt-1" : ""}>
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        })}
      </p>
    );
  });
}

// ─── Mock response logic ───────────────────────────────────────────────────────

const MOCK_RESPONSES = [
  (q: string) =>
    `Great question! Based on my analysis, here's what I found: ${q.slice(0, 30)}... This is a complex topic that involves multiple considerations. Let me break it down for you systematically.`,
  () =>
    `I've processed your request. Here are the key insights:\n\n1. The primary approach would involve...\n2. Consider the trade-offs between...\n3. For optimal results, you should...`,
  (q: string) =>
    `Absolutely! Here's a comprehensive response to your query about "${q.slice(0, 20)}...":\n\nThe most effective strategy involves understanding the core requirements first, then building incrementally towards your goal.`,
  () =>
    `That's an interesting challenge. Let me help you think through this step by step:\n\n**Analysis**: Your request touches on several important areas...\n**Recommendation**: I suggest starting with the fundamentals...`,
];

// ─── Left Sidebar ─────────────────────────────────────────────────────────────

interface ModelSidebarProps {
  selectedModel: AIModel;
  setSelectedModel: (m: AIModel) => void;
  modelSearch: string;
  setModelSearch: (s: string) => void;
}

function ModelSidebar({
  selectedModel,
  setSelectedModel,
  modelSearch,
  setModelSearch,
}: ModelSidebarProps) {
  const filtered = MODELS.filter(
    (m) =>
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.lab.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <div className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-purple-400" />
        <span className="font-semibold text-slate-100">Chat Hub</span>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-800">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search models..."
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm w-full text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Model list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.map((model) => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model)}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors text-left",
              selectedModel.id === model.id
                ? "bg-purple-600/20 border border-purple-500/40"
                : "hover:bg-slate-800 border border-transparent"
            )}
          >
            <span className="text-xl w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg shrink-0">
              {model.logo}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-medium text-slate-100 truncate">
                  {model.name}
                </span>
                {model.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium",
                      getBadgeStyle(model.badge)
                    )}
                  >
                    {model.badge}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {model.lab} · {model.speed}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-800">
        <p className="text-xs text-slate-500 mb-2">Need more models?</p>
        <Link
          href="/marketplace"
          className="block text-center text-xs text-purple-400 hover:text-purple-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg py-1.5 px-3 transition-colors"
        >
          Browse Marketplace →
        </Link>
      </div>
    </div>
  );
}

// ─── Chat Area ────────────────────────────────────────────────────────────────

interface ChatAreaProps {
  selectedModel: AIModel;
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  isTyping: boolean;
  sendMessage: () => void;
}

const QUICK_ACTIONS = [
  { label: "Monitor the situation", emoji: "👁️" },
  { label: "Create a prototype", emoji: "🛠️" },
  { label: "Build a business plan", emoji: "📊" },
  { label: "Create content", emoji: "✍️" },
  { label: "Analyze & research", emoji: "🔍" },
  { label: "Learn something", emoji: "🎓" },
];

function ChatArea({
  selectedModel,
  messages,
  input,
  setInput,
  isTyping,
  sendMessage,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl w-9 h-9 flex items-center justify-center bg-slate-800 rounded-xl">
            {selectedModel.logo}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-sm">
                {selectedModel.name}
              </span>
              <span className="flex items-center gap-1 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Online
              </span>
            </div>
            <div className="text-xs text-slate-400">{selectedModel.lab}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <Settings className="h-4 w-4 text-slate-400 hover:text-white" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <MoreHorizontal className="h-4 w-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <span className="text-6xl">{selectedModel.logo}</span>
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-1">
                Hello! I&apos;m {selectedModel.name}
              </h2>
              <p className="text-slate-400 text-sm">
                How can I help you today?
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    setInput(action.label);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-300 text-sm px-4 py-2.5 rounded-xl cursor-pointer transition-all"
                >
                  {action.emoji} {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="flex justify-end items-end gap-2">
                  <span className="text-xs text-slate-500 mb-1 self-end">
                    {formatTime(msg.timestamp)}
                  </span>
                  <div className="max-w-[70%] bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-2 max-w-[75%]">
                  <span className="text-xl w-8 h-8 flex items-center justify-center bg-slate-700 rounded-full shrink-0 mt-0.5">
                    {selectedModel.logo}
                  </span>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">
                      {msg.model} · {formatTime(msg.timestamp)}
                    </div>
                    <div className="bg-slate-800 text-slate-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
                      {renderContent(msg.content)}
                    </div>
                  </div>
                </div>
              )
            )}
            {isTyping && (
              <div className="flex items-start gap-2 max-w-[75%]">
                <span className="text-xl w-8 h-8 flex items-center justify-center bg-slate-700 rounded-full shrink-0 mt-0.5">
                  {selectedModel.logo}
                </span>
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    {selectedModel.name}
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 shrink-0">
        <div className="flex items-end gap-2">
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl p-3 transition-colors shrink-0">
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${selectedModel.name}...`}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 resize-none focus:outline-none focus:border-purple-500 flex-1 max-h-32"
          />
          <button
            onClick={sendMessage}
            disabled={isTyping || !input.trim()}
            className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl p-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-slate-600 text-center mt-2">
          NexusAI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

// ─── Stats Sidebar ────────────────────────────────────────────────────────────

interface StatsSidebarProps {
  selectedModel: AIModel;
  requestCount: number;
  costToday: number;
}

const QUICK_ACTION_LINKS = [
  { icon: ShoppingBag, label: "Browse Marketplace", href: "/marketplace" },
  { icon: Bot, label: "Build an Agent", href: "/agents" },
  { icon: BookOpen, label: "How to Use Guide", href: "#" },
  { icon: Wand2, label: "Prompt Engineering", href: "#" },
  { icon: DollarSign, label: "View Pricing", href: "/marketplace" },
  { icon: BarChart2, label: "AI Models Analysis", href: "/discover" },
];

const CREATE_ITEMS = [
  { emoji: "🎨", label: "Create Image" },
  { emoji: "🎵", label: "Generate Audio" },
  { emoji: "🎬", label: "Create Video" },
  { emoji: "📊", label: "Create Slides" },
];

const ANALYZE_ITEMS = [
  { emoji: "📈", label: "Analyze Data" },
  { emoji: "✍️", label: "Write Content" },
  { emoji: "💻", label: "Code Generation" },
  { emoji: "📄", label: "Document Analysis" },
];

function StatsSidebar({ selectedModel, requestCount, costToday }: StatsSidebarProps) {
  return (
    <div className="w-72 border-l border-slate-800 bg-slate-900 overflow-y-auto shrink-0">
      {/* Active Model */}
      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Active Model
        </p>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{selectedModel.logo}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100">
                {selectedModel.name}
              </span>
              <span className="flex items-center gap-1 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Active
              </span>
            </div>
            <div className="text-xs text-slate-400">{selectedModel.lab}</div>
          </div>
        </div>
      </div>

      {/* Model Stats */}
      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Model Stats
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Context</p>
            <p className="font-bold text-sm text-slate-100">
              {formatContextWindow(selectedModel.contextWindow)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Price/1M</p>
            <p className="font-bold text-sm text-slate-100">
              ${selectedModel.outputPrice.toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Rating</p>
            <p className="font-bold text-sm text-slate-100">
              ⭐{selectedModel.rating}
            </p>
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Usage Overview
        </p>
        <div className="space-y-2">
          {[
            { label: "Requests Today", value: String(requestCount) },
            { label: "Avg Latency", value: "~1.2s" },
            { label: "Cost Today", value: `$${costToday}` },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-slate-400">{row.label}</span>
              <span className="font-medium text-slate-100">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Quick Actions
        </p>
        <div className="grid grid-cols-1 gap-1">
          {QUICK_ACTION_LINKS.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 cursor-pointer text-sm text-slate-400 hover:text-slate-100 transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Create & Generate */}
      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Create &amp; Generate
        </p>
        <div className="grid grid-cols-1 gap-1">
          {CREATE_ITEMS.map(({ emoji, label }) => (
            <button
              key={label}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 cursor-pointer text-sm text-slate-400 hover:text-slate-100 transition-colors w-full text-left"
            >
              <span className="w-6 h-6 flex items-center justify-center text-base shrink-0">
                {emoji}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Analyze & Write */}
      <div className="p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Analyze &amp; Write
        </p>
        <div className="grid grid-cols-1 gap-1">
          {ANALYZE_ITEMS.map(({ emoji, label }) => (
            <button
              key={label}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 cursor-pointer text-sm text-slate-400 hover:text-slate-100 transition-colors w-full text-left"
            >
              <span className="w-6 h-6 flex items-center justify-center text-base shrink-0">
                {emoji}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HubPage() {
  const [selectedModel, setSelectedModel] = useState<AIModel>(MODELS[0]);
  const [modelSearch, setModelSearch] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [costToday, setCostToday] = useState(0);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const capturedInput = input.trim();
    setInput("");
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1000));

    const replyFn =
      MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    const reply = replyFn(capturedInput);

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
        model: selectedModel.name,
      },
    ]);
    setIsTyping(false);
    setRequestCount((c) => c + 1);
    setCostToday((c) =>
      parseFloat((c + selectedModel.outputPrice * 0.001).toFixed(4))
    );
  }

  return (
    <div className="page-transition flex flex-col h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-100">
      {/* Mobile model picker */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-2 shrink-0">
        <select
          value={selectedModel.id}
          onChange={(e) => {
            const m = MODELS.find((x) => x.id === e.target.value);
            if (m) setSelectedModel(m);
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 w-full focus:outline-none focus:border-purple-500"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.logo} {m.name} — {m.lab}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — hidden on mobile */}
        <div className="hidden md:flex">
          <ModelSidebar
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            modelSearch={modelSearch}
            setModelSearch={setModelSearch}
          />
        </div>

        <ChatArea
          selectedModel={selectedModel}
          messages={messages}
          input={input}
          setInput={setInput}
          isTyping={isTyping}
          sendMessage={sendMessage}
        />

        {/* Right sidebar — hidden on mobile/tablet */}
        <div className="hidden lg:flex">
          <StatsSidebar
            selectedModel={selectedModel}
            requestCount={requestCount}
            costToday={costToday}
          />
        </div>
      </div>
    </div>
  );
}
