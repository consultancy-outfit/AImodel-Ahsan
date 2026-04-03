"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
} from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Settings,
  MoreHorizontal,
  Send,
  Paperclip,
  ImageIcon,
  ShoppingBag,
  Bot,
  BookOpen,
  Wand2,
  DollarSign,
  BarChart2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Square,
  X,
  Loader2,
  Volume2,
  VolumeX,
  PhoneOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MODELS, AIModel } from "@/lib/models-data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Attachment {
  id: string;
  name: string;
  type: "image" | "file";
  url: string;
  size: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
  attachments?: Attachment[];
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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getBadgeStyle(badge: AIModel["badge"]): string {
  switch (badge) {
    case "Live": return "bg-green-500/20 text-green-400 border border-green-500/30";
    case "New":  return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "Hot":  return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    default:     return "";
  }
}

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className={i > 0 ? "mt-1" : ""}>
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j}>{part.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </p>
    );
  });
}

const MOCK_RESPONSES = [
  (q: string) =>
    `Great question! Based on my analysis, here's what I found about "${q.slice(0, 30)}...".\n\nThis is a complex topic that involves multiple considerations. Let me break it down for you systematically.`,
  () =>
    `I've processed your request. Here are the key insights:\n\n1. The primary approach would involve...\n2. Consider the trade-offs between...\n3. For optimal results, you should...`,
  (q: string) =>
    `Absolutely! Here's a comprehensive response to your query about "${q.slice(0, 20)}...":\n\nThe most effective strategy involves understanding the core requirements first, then building incrementally towards your goal.`,
  () =>
    `That's an interesting challenge. Let me help you think through this step by step:\n\n**Analysis**: Your request touches on several important areas...\n**Recommendation**: I suggest starting with the fundamentals...`,
];

// ─── Voice Wave ───────────────────────────────────────────────────────────────

function VoiceWave({ active }: { active: boolean }) {
  return (
    <span className="flex items-end gap-[2px] h-4">
      {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-full transition-all", active ? "bg-purple-400" : "bg-slate-500")}
          style={{
            height: active ? `${h * 3}px` : "3px",
            animation: active ? `vwave 0.8s ${i * 0.07}s ease-in-out infinite alternate` : "none",
          }}
        />
      ))}
      <style>{`@keyframes vwave{from{transform:scaleY(.3)}to{transform:scaleY(1.5)}}`}</style>
    </span>
  );
}

// ─── Icon button ──────────────────────────────────────────────────────────────

function IBtn({
  children, onClick, active = false, title, activeCls = "", className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
  activeCls?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "w-8 h-8 rounded-xl border flex items-center justify-center transition-all shrink-0",
        active
          ? cn("border text-white", activeCls)
          : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700",
        className
      )}
    >
      {children}
    </button>
  );
}

// ─── Left Sidebar ─────────────────────────────────────────────────────────────

interface ModelSidebarProps {
  selectedModel: AIModel;
  setSelectedModel: (m: AIModel) => void;
  modelSearch: string;
  setModelSearch: (s: string) => void;
}

function ModelSidebar({ selectedModel, setSelectedModel, modelSearch, setModelSearch }: ModelSidebarProps) {
  const filtered = MODELS.filter(
    (m) =>
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.lab.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <div className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-purple-400" />
        <span className="font-semibold text-slate-100">Chat Hub</span>
      </div>
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
                <span className="text-sm font-medium text-slate-100 truncate">{model.name}</span>
                {model.badge && (
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium", getBadgeStyle(model.badge))}>
                    {model.badge}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 truncate">{model.lab} · {model.speed}</div>
            </div>
          </button>
        ))}
      </div>
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

const QUICK_ACTIONS = [
  { label: "Monitor the situation", emoji: "👁️" },
  { label: "Create a prototype",    emoji: "🛠️" },
  { label: "Build a business plan", emoji: "📊" },
  { label: "Create content",        emoji: "✍️" },
  { label: "Analyze & research",    emoji: "🔍" },
  { label: "Learn something",       emoji: "🎓" },
];

interface ChatAreaProps {
  selectedModel: AIModel;
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  isTyping: boolean;
  sendMessage: () => void;
  // media props
  isListening: boolean;
  voiceMode: boolean;
  isSpeaking: boolean;
  transcript: string;
  videoOn: boolean;
  screenOn: boolean;
  pendingAtts: Attachment[];
  onToggleListen: () => void;
  onToggleVoiceMode: () => void;
  onToggleVideo: () => void;
  onToggleScreen: () => void;
  onFileClick: () => void;
  onImageClick: () => void;
  onRemoveAtt: (id: string) => void;
  onStopSpeak: () => void;
  onPlayMsg: (text: string) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  screenRef: React.RefObject<HTMLVideoElement>;
}

function ChatArea({
  selectedModel, messages, input, setInput, isTyping, sendMessage,
  isListening, voiceMode, isSpeaking, transcript,
  videoOn, screenOn, pendingAtts,
  onToggleListen, onToggleVoiceMode, onToggleVideo, onToggleScreen,
  onFileClick, onImageClick, onRemoveAtt, onStopSpeak, onPlayMsg,
  videoRef, screenRef,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

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
      {/* ── Top bar ── */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl w-9 h-9 flex items-center justify-center bg-slate-800 rounded-xl">
            {selectedModel.logo}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-sm">{selectedModel.name}</span>
              <span className="flex items-center gap-1 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Online
              </span>
            </div>
            <div className="text-xs text-slate-400">{selectedModel.lab}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Active media indicators in top bar */}
          {isListening && (
            <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Listening
            </span>
          )}
          {videoOn && (
            <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-1 rounded-full">
              <Video className="w-3 h-3" /> Camera
            </span>
          )}
          {screenOn && (
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-1 rounded-full">
              <Monitor className="w-3 h-3" /> Sharing
            </span>
          )}
          {isSpeaking && (
            <button
              onClick={onStopSpeak}
              className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-1 rounded-full hover:bg-purple-500/20"
            >
              <Volume2 className="w-3 h-3" /> Speaking
              <VolumeX className="w-3 h-3 ml-1" />
            </button>
          )}
          <button className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <Settings className="h-4 w-4 text-slate-400 hover:text-white" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <MoreHorizontal className="h-4 w-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* ── Video / screen preview strip ── */}
      {(videoOn || screenOn) && (
        <div className="flex gap-2 px-4 py-2 bg-slate-900/40 border-b border-slate-800 shrink-0">
          {videoOn && (
            <div className="relative w-36 h-24 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <button onClick={onToggleVideo} className="absolute top-1 right-1 bg-slate-900/80 rounded-full p-0.5 hover:bg-red-600 transition-colors">
                <X className="w-3 h-3 text-white" />
              </button>
              <span className="absolute bottom-1 left-1.5 text-[10px] text-white bg-slate-900/70 px-1.5 py-0.5 rounded-full">Camera</span>
            </div>
          )}
          {screenOn && (
            <div className="relative flex-1 max-w-[280px] h-24 rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
              <video ref={screenRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <button onClick={onToggleScreen} className="absolute top-1 right-1 bg-slate-900/80 rounded-full p-0.5 hover:bg-red-600 transition-colors">
                <X className="w-3 h-3 text-white" />
              </button>
              <span className="absolute bottom-1 left-1.5 text-[10px] text-white bg-slate-900/70 px-1.5 py-0.5 rounded-full">Screen</span>
            </div>
          )}
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <span className="text-6xl">{selectedModel.logo}</span>
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-1">
                Hello! I&apos;m {selectedModel.name}
              </h2>
              <p className="text-slate-400 text-sm">
                Type, speak, share your screen or upload a file — I&apos;m ready!
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => setInput(action.label)}
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
                  <span className="text-xs text-slate-500 self-end">{formatTime(msg.timestamp)}</span>
                  <div className="max-w-[70%] space-y-1.5">
                    {msg.attachments?.map((att) => (
                      <div key={att.id} className="flex justify-end">
                        {att.type === "image" ? (
                          <img src={att.url} alt={att.name} className="max-w-[220px] rounded-2xl border border-slate-700" />
                        ) : (
                          <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-sm">
                            <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-slate-300 truncate max-w-[150px]">{att.name}</span>
                            <span className="text-slate-500 text-xs shrink-0">{att.size}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {msg.content && (
                      <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-2 max-w-[80%]">
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
                    {voiceMode && (
                      <button
                        onClick={() => onPlayMsg(msg.content)}
                        className="mt-1 text-xs text-slate-500 hover:text-purple-400 flex items-center gap-1 transition-colors"
                      >
                        <Volume2 className="w-3 h-3" /> Play
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
            {isTyping && (
              <div className="flex items-start gap-2 max-w-[80%]">
                <span className="text-xl w-8 h-8 flex items-center justify-center bg-slate-700 rounded-full shrink-0 mt-0.5">
                  {selectedModel.logo}
                </span>
                <div>
                  <div className="text-xs text-slate-500 mb-1">{selectedModel.name}</div>
                  <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
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

      {/* ── Input bar ── */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 shrink-0">
        {/* Pending attachments */}
        {pendingAtts.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {pendingAtts.map((att) => (
              <div key={att.id} className="relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                {att.type === "image" ? (
                  <img src={att.url} alt={att.name} className="w-14 h-14 object-cover" />
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-2 text-xs">
                    <Paperclip className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-300 max-w-[100px] truncate">{att.name}</span>
                  </div>
                )}
                <button
                  onClick={() => onRemoveAtt(att.id)}
                  className="absolute top-0.5 right-0.5 bg-slate-900/80 rounded-full p-0.5 hover:bg-red-600 transition-colors"
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Voice transcript preview */}
        {transcript && (
          <div className="mb-2 px-3 py-2 bg-purple-600/10 border border-purple-500/30 rounded-xl text-sm text-purple-300 italic">
            {transcript}…
          </div>
        )}

        {/* Main input row */}
        <div className="flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 focus-within:border-purple-500 transition-colors">
          <textarea
            ref={taRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${selectedModel.name}…`}
            className="bg-transparent flex-1 text-sm text-slate-100 placeholder:text-slate-500 resize-none focus:outline-none max-h-32 py-1 leading-relaxed"
          />

          <div className="flex items-center gap-1 shrink-0 pb-0.5">
            {/* Voice typing */}
            <IBtn
              onClick={onToggleListen}
              active={isListening}
              title={isListening ? "Stop listening" : "Voice typing"}
              activeCls="bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </IBtn>

            {/* Voice conversation */}
            <IBtn
              onClick={onToggleVoiceMode}
              active={voiceMode}
              title="Voice conversation"
              activeCls="bg-purple-500/20 text-purple-400 border-purple-500/40"
            >
              <VoiceWave active={voiceMode} />
            </IBtn>

            {/* Camera */}
            <IBtn
              onClick={onToggleVideo}
              active={videoOn}
              title={videoOn ? "Stop camera" : "Start camera"}
              activeCls="bg-blue-500/20 text-blue-400 border-blue-500/40"
            >
              {videoOn ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </IBtn>

            {/* Screen share */}
            <IBtn
              onClick={onToggleScreen}
              active={screenOn}
              title={screenOn ? "Stop sharing" : "Share screen"}
              activeCls="bg-green-500/20 text-green-400 border-green-500/40"
            >
              {screenOn ? <Square className="w-4 h-4 fill-current" /> : <Monitor className="w-4 h-4" />}
            </IBtn>

            {/* Attach file */}
            <IBtn onClick={onFileClick} title="Attach file">
              <Paperclip className="w-4 h-4" />
            </IBtn>

            {/* Upload image */}
            <IBtn onClick={onImageClick} title="Upload image">
              <ImageIcon className="w-4 h-4" />
            </IBtn>

            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={isTyping || (!input.trim() && pendingAtts.length === 0)}
              title="Send"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 text-center mt-2">
          NexusAI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

// ─── Stats Sidebar ────────────────────────────────────────────────────────────

const QUICK_ACTION_LINKS = [
  { icon: ShoppingBag, label: "Browse Marketplace", href: "/marketplace" },
  { icon: Bot,         label: "Build an Agent",     href: "/agents" },
  { icon: BookOpen,    label: "How to Use Guide",   href: "#" },
  { icon: Wand2,       label: "Prompt Engineering", href: "#" },
  { icon: DollarSign,  label: "View Pricing",       href: "/marketplace" },
  { icon: BarChart2,   label: "AI Models Analysis", href: "/discover" },
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

function StatsSidebar({
  selectedModel, requestCount, costToday,
}: {
  selectedModel: AIModel; requestCount: number; costToday: number;
}) {
  return (
    <div className="w-72 border-l border-slate-800 bg-slate-900 overflow-y-auto shrink-0">
      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Active Model</p>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{selectedModel.logo}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100">{selectedModel.name}</span>
              <span className="flex items-center gap-1 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Active
              </span>
            </div>
            <div className="text-xs text-slate-400">{selectedModel.lab}</div>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Model Stats</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Context",  value: formatContextWindow(selectedModel.contextWindow) },
            { label: "Price/1M", value: `$${selectedModel.outputPrice.toFixed(2)}` },
            { label: "Rating",   value: `⭐${selectedModel.rating}` },
          ].map(row => (
            <div key={row.label} className="bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">{row.label}</p>
              <p className="font-bold text-sm text-slate-100">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Usage Overview</p>
        <div className="space-y-2">
          {[
            { label: "Requests Today", value: String(requestCount) },
            { label: "Avg Latency",    value: "~1.2s" },
            { label: "Cost Today",     value: `$${costToday}` },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{row.label}</span>
              <span className="font-medium text-slate-100">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-1 gap-1">
          {QUICK_ACTION_LINKS.map(({ icon: Icon, label, href }) => (
            <Link key={label} href={href}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-sm text-slate-400 hover:text-slate-100 transition-colors">
              <Icon className="h-4 w-4 shrink-0" /> {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Create &amp; Generate</p>
        <div className="grid grid-cols-1 gap-1">
          {CREATE_ITEMS.map(({ emoji, label }) => (
            <button key={label}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-sm text-slate-400 hover:text-slate-100 transition-colors w-full text-left">
              <span className="w-6 h-6 flex items-center justify-center text-base shrink-0">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Analyze &amp; Write</p>
        <div className="grid grid-cols-1 gap-1">
          {ANALYZE_ITEMS.map(({ emoji, label }) => (
            <button key={label}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-sm text-slate-400 hover:text-slate-100 transition-colors w-full text-left">
              <span className="w-6 h-6 flex items-center justify-center text-base shrink-0">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Voice Conversation Overlay ───────────────────────────────────────────────

function VoiceOverlay({
  model, isListening, isSpeaking, transcript, messages,
  onToggleListen, onStopSpeak, onClose,
}: {
  model: AIModel;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  messages: Message[];
  onToggleListen: () => void;
  onStopSpeak: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <div className="text-6xl mb-3">{model.logo}</div>
        <h2 className="text-2xl font-bold text-slate-100">Voice Conversation</h2>
        <p className="text-slate-400 text-sm mt-1">
          {isSpeaking ? "AI is speaking…" : isListening ? "Listening…" : "Tap mic to speak"}
        </p>
      </div>

      {/* Animated waveform */}
      <div className="flex items-end gap-1 h-14">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className={cn("w-1 rounded-full", isSpeaking || isListening ? "bg-purple-400" : "bg-slate-700")}
            style={{
              height: isSpeaking || isListening ? `${8 + Math.random() * 40}px` : "8px",
              animation:
                isSpeaking || isListening
                  ? `vwave ${0.4 + Math.random() * 0.4}s ${i * 0.04}s ease-in-out infinite alternate`
                  : "none",
            }}
          />
        ))}
      </div>

      {transcript && (
        <p className="text-slate-300 italic max-w-sm text-center">"{transcript}"</p>
      )}

      {messages.length > 0 && (
        <div className="max-w-lg w-full max-h-40 overflow-y-auto space-y-2">
          {messages.slice(-3).map((m) => (
            <div
              key={m.id}
              className={cn(
                "text-sm px-4 py-2 rounded-xl max-w-[85%]",
                m.role === "user"
                  ? "bg-purple-600/30 text-purple-200 ml-auto"
                  : "bg-slate-800 text-slate-200"
              )}
            >
              {m.content.slice(0, 100)}{m.content.length > 100 ? "…" : ""}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onToggleListen}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all",
            isListening ? "bg-red-500 hover:bg-red-400 animate-pulse" : "bg-purple-600 hover:bg-purple-500"
          )}
        >
          {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>
        {isSpeaking && (
          <button
            onClick={onStopSpeak}
            className="w-16 h-16 rounded-full bg-orange-600 hover:bg-orange-500 flex items-center justify-center text-white transition-all"
          >
            <VolumeX className="w-7 h-7" />
          </button>
        )}
        <button
          onClick={onClose}
          className="w-16 h-16 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-all"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
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
  const [pendingAtts, setPendingAtts] = useState<Attachment[]>([]);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Video / screen
  const [videoOn, setVideoOn] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null) as React.MutableRefObject<HTMLVideoElement>;
  const [screenOn, setScreenOn] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const screenRef = useRef<HTMLVideoElement>(null) as React.MutableRefObject<HTMLVideoElement>;

  // File inputs
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  // ── Speech synthesis ──────────────────────────────────────────────────────
  useEffect(() => { synthRef.current = window.speechSynthesis; }, []);

  function speak(text: string) {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ""));
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    synthRef.current.speak(u);
  }
  function stopSpeak() { synthRef.current?.cancel(); setIsSpeaking(false); }

  // ── Speech recognition ────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    type WinSR = { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
    const SR =
      (window as unknown as WinSR).SpeechRecognition ||
      (window as unknown as WinSR).webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported. Use Chrome."); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SR();
    rec.continuous = voiceMode;
    rec.interimResults = true;
    rec.lang = "en-US";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = ""; let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      setTranscript(interim || final);
      if (final && !voiceMode) { setInput((p) => (p ? p + " " : "") + final); setTranscript(""); }
      if (final && voiceMode) { setTranscript(""); void doSend(final, []); }
    };
    rec.onerror = () => { setIsListening(false); setTranscript(""); };
    rec.onend = () => { setIsListening(false); setTranscript(""); };
    recRef.current = rec;
    rec.start();
    setIsListening(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceMode]);

  function stopListening() { recRef.current?.stop(); setIsListening(false); setTranscript(""); }
  function toggleListening() { if (isListening) stopListening(); else startListening(); }

  function toggleVoiceMode() {
    if (voiceMode) { stopListening(); stopSpeak(); setVoiceMode(false); }
    else setVoiceMode(true);
  }

  // ── Video ─────────────────────────────────────────────────────────────────
  async function toggleVideo() {
    if (videoOn) {
      videoStream?.getTracks().forEach((t) => t.stop());
      setVideoStream(null); setVideoOn(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setVideoStream(s); setVideoOn(true);
      } catch { alert("Camera permission denied."); }
    }
  }
  useEffect(() => { if (videoRef.current && videoStream) videoRef.current.srcObject = videoStream; }, [videoStream]);

  // ── Screen share ──────────────────────────────────────────────────────────
  async function toggleScreen() {
    if (screenOn) {
      screenStream?.getTracks().forEach((t) => t.stop());
      setScreenStream(null); setScreenOn(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        s.getVideoTracks()[0].onended = () => { setScreenStream(null); setScreenOn(false); };
        setScreenStream(s); setScreenOn(true);
      } catch { /* cancelled */ }
    }
  }
  useEffect(() => { if (screenRef.current && screenStream) screenRef.current.srcObject = screenStream; }, [screenStream]);

  // ── Files ─────────────────────────────────────────────────────────────────
  function handleFiles(files: FileList | null, type: "image" | "file") {
    if (!files) return;
    Array.from(files).forEach((f) => {
      setPendingAtts((p) => [
        ...p,
        { id: crypto.randomUUID(), name: f.name, type, url: URL.createObjectURL(f), size: formatSize(f.size) },
      ]);
    });
  }

  // ── Send ──────────────────────────────────────────────────────────────────
  async function doSend(content: string, atts: Attachment[]) {
    if (!content.trim() && atts.length === 0) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
      attachments: atts.length ? atts : undefined,
    };
    setMessages((p) => [...p, userMsg]);
    setInput(""); setPendingAtts([]); setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1000));

    const fn = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    const reply = fn(content.trim() || "your attachment");

    setMessages((p) => [
      ...p,
      { id: crypto.randomUUID(), role: "assistant", content: reply, timestamp: new Date(), model: selectedModel.name },
    ]);
    setIsTyping(false);
    setRequestCount((c) => c + 1);
    setCostToday((c) => parseFloat((c + selectedModel.outputPrice * 0.001).toFixed(4)));

    if (voiceMode) speak(reply);
  }

  function sendMessage() { void doSend(input, pendingAtts); }

  // Cleanup on unmount
  useEffect(() => () => {
    videoStream?.getTracks().forEach((t) => t.stop());
    screenStream?.getTracks().forEach((t) => t.stop());
    recRef.current?.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-transition flex flex-col h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-100">
      {/* Voice conversation overlay */}
      {voiceMode && (
        <VoiceOverlay
          model={selectedModel}
          isListening={isListening}
          isSpeaking={isSpeaking}
          transcript={transcript}
          messages={messages}
          onToggleListen={toggleListening}
          onStopSpeak={stopSpeak}
          onClose={toggleVoiceMode}
        />
      )}

      {/* Mobile model picker */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-2 shrink-0">
        <select
          value={selectedModel.id}
          onChange={(e) => { const m = MODELS.find((x) => x.id === e.target.value); if (m) setSelectedModel(m); }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 w-full focus:outline-none focus:border-purple-500"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>{m.logo} {m.name} — {m.lab}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
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
          isListening={isListening}
          voiceMode={voiceMode}
          isSpeaking={isSpeaking}
          transcript={transcript}
          videoOn={videoOn}
          screenOn={screenOn}
          pendingAtts={pendingAtts}
          onToggleListen={toggleListening}
          onToggleVoiceMode={toggleVoiceMode}
          onToggleVideo={toggleVideo}
          onToggleScreen={toggleScreen}
          onFileClick={() => fileRef.current?.click()}
          onImageClick={() => imgRef.current?.click()}
          onRemoveAtt={(id) => setPendingAtts((p) => p.filter((a) => a.id !== id))}
          onStopSpeak={stopSpeak}
          onPlayMsg={speak}
          videoRef={videoRef}
          screenRef={screenRef}
        />

        {/* Right sidebar */}
        <div className="hidden lg:flex">
          <StatsSidebar
            selectedModel={selectedModel}
            requestCount={requestCount}
            costToday={costToday}
          />
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files, "file")} />
      <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files, "image")} />
    </div>
  );
}
