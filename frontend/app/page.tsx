"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import {
  MessageSquare, Wand2, Bot, DollarSign, Star, Rss,
  Mic, MicOff, Video, VideoOff, Monitor, Square,
  Paperclip, ImageIcon, Send, X, Loader2,
  Volume2, VolumeX, PhoneOff, Search, Download, Info,
} from "lucide-react";
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
// Home chat input — types & helpers
// ---------------------------------------------------------------------------

interface HMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: HAttachment[];
}

interface HAttachment {
  id: string;
  name: string;
  type: "image" | "file";
  url: string;
  size: string;
}

const HOME_CATEGORIES = [
  { emoji: "🎨", label: "Create image" },
  { emoji: "🎵", label: "Generate Audio" },
  { emoji: "🎬", label: "Create video" },
  { emoji: "📊", label: "Create slides" },
  { emoji: "📈", label: "Create Infographs" },
  { emoji: "❓", label: "Create quiz" },
  { emoji: "📂", label: "Create Flashcards" },
  { emoji: "🧠", label: "Create Mind map" },
  { emoji: "📉", label: "Analyze Data" },
  { emoji: "✍️", label: "Write content" },
  { emoji: "💻", label: "Code Generation" },
  { emoji: "📄", label: "Document Analysis" },
  { emoji: "🌐", label: "Translate" },
  { emoji: "🔭", label: "Just Exploring" },
];

const TABS = [
  {
    id: "recruiting",
    label: "Recruiting",
    icon: "👤",
    suggestions: [
      { icon: "🔍", text: "Monitor job postings at target companies" },
      { icon: "💰", text: "Benchmark salary for a specific role" },
      { icon: "📋", text: "Build a hiring pipeline tracker" },
      { icon: "🤝", text: "Research a candidate before an interview" },
      { icon: "🗺️", text: "Build an interactive talent market map" },
    ],
  },
  {
    id: "prototype",
    label: "Create a prototype",
    icon: "</>",
    suggestions: [
      { icon: "🎨", text: "Design a mobile app wireframe for my idea" },
      { icon: "⚡", text: "Build a landing page prototype in minutes" },
      { icon: "🔧", text: "Create an interactive product demo" },
      { icon: "🧪", text: "Prototype a web app with dummy data" },
      { icon: "📱", text: "Generate a clickable UI mockup" },
    ],
  },
  {
    id: "business",
    label: "Build a business",
    icon: "💼",
    suggestions: [
      { icon: "📊", text: "Write a business plan for my startup" },
      { icon: "📈", text: "Create a financial projection model" },
      { icon: "🎯", text: "Define my target market and customer persona" },
      { icon: "📣", text: "Build a go-to-market strategy" },
      { icon: "💡", text: "Validate my business idea with market research" },
    ],
  },
  {
    id: "learn",
    label: "Help me learn",
    icon: "📖",
    suggestions: [
      { icon: "🤖", text: "Explain how large language models work" },
      { icon: "💻", text: "Teach me Python from scratch" },
      { icon: "📐", text: "Break down machine learning concepts simply" },
      { icon: "🧠", text: "Create a study plan for data science" },
      { icon: "🎓", text: "Quiz me on a topic I am learning" },
    ],
  },
  {
    id: "research",
    label: "Research",
    icon: "🔎",
    suggestions: [
      { icon: "📰", text: "Summarize the latest AI research papers" },
      { icon: "🔬", text: "Compare competing technologies or frameworks" },
      { icon: "🌐", text: "Research market trends in a specific industry" },
      { icon: "📊", text: "Analyze competitor strategies and positioning" },
      { icon: "🗂️", text: "Compile a literature review on a topic" },
    ],
  },
];

const MOCK_REPLIES = [
  (q: string) =>
    `Great! I can help you with "${q.slice(0, 40)}..."\n\nHere's my plan:\n1. Understand your requirements\n2. Generate a solution step by step\n3. Iterate based on feedback\n\nWhat details can you share?`,
  () =>
    `Absolutely! Let me break this down:\n\n**Step 1** — Define your goal clearly\n**Step 2** — Choose the right approach\n**Step 3** — Execute and refine\n\nReady when you are!`,
  (q: string) =>
    `I've analyzed your request about "${q.slice(0, 30)}..."\n\nRecommendation: Start with the fundamentals, then build incrementally.\n\nShall I elaborate on any step?`,
];

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
function renderMsg(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className={i > 0 ? "mt-1" : ""}>
        {parts.map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={j}>{p.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{p}</span>
          )
        )}
      </p>
    );
  });
}

function VoiceWave({ active }: { active: boolean }) {
  return (
    <span className="flex items-end gap-[2px] h-5">
      {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-full transition-all", active ? "bg-purple-400" : "bg-slate-500")}
          style={{
            height: active ? `${h * 4}px` : "4px",
            animation: active ? `hwave 0.8s ${i * 0.07}s ease-in-out infinite alternate` : "none",
          }}
        />
      ))}
      <style>{`@keyframes hwave{from{transform:scaleY(.3)}to{transform:scaleY(1.5)}}`}</style>
    </span>
  );
}

function IBtn({
  children, onClick, active = false, title, activeCls = "",
}: {
  children: React.ReactNode; onClick: () => void;
  active?: boolean; title?: string; activeCls?: string;
}) {
  return (
    <button
      onClick={onClick} title={title}
      className={cn(
        "w-8 h-8 rounded-xl border flex items-center justify-center transition-all",
        active
          ? cn("border text-white", activeCls)
          : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700"
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// HomeChatInput  — the full interactive widget embedded in the hero
// ---------------------------------------------------------------------------

function HomeChatInput() {
  const model = MODELS[0];
  const [messages, setMessages] = useState<HMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAtts, setPendingAtts] = useState<HAttachment[]>([]);
  const [activeTab, setActiveTab] = useState("recruiting");

  // voice
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // video / screen
  const [videoOn, setVideoOn] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [screenOn, setScreenOn] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  // file inputs
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // speech synthesis
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

  // speech recognition
  const startListening = useCallback(() => {
    type WinSR = { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
    const SR = (window as unknown as WinSR).SpeechRecognition || (window as unknown as WinSR).webkitSpeechRecognition;
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
      if (final && !voiceMode) { setInput(p => (p ? p + " " : "") + final); setTranscript(""); }
      if (final && voiceMode) { setTranscript(""); void doSend(final, []); }
    };
    rec.onerror = () => { setIsListening(false); setTranscript(""); };
    rec.onend = () => { setIsListening(false); setTranscript(""); };
    recRef.current = rec;
    rec.start();
    setIsListening(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceMode]);

  function stopListen() { recRef.current?.stop(); setIsListening(false); setTranscript(""); }
  function toggleListen() { if (isListening) stopListen(); else startListening(); }

  function toggleVoiceMode() {
    if (voiceMode) { stopListen(); stopSpeak(); setVoiceMode(false); }
    else setVoiceMode(true);
  }

  // video
  async function toggleVideo() {
    if (videoOn) {
      videoStream?.getTracks().forEach(t => t.stop());
      setVideoStream(null); setVideoOn(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setVideoStream(s); setVideoOn(true);
      } catch { alert("Camera permission denied."); }
    }
  }
  useEffect(() => { if (videoRef.current && videoStream) videoRef.current.srcObject = videoStream; }, [videoStream]);

  // screen
  async function toggleScreen() {
    if (screenOn) {
      screenStream?.getTracks().forEach(t => t.stop());
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

  // files
  function handleFiles(files: FileList | null, type: "image" | "file") {
    if (!files) return;
    Array.from(files).forEach(f => {
      setPendingAtts(p => [...p, { id: crypto.randomUUID(), name: f.name, type, url: URL.createObjectURL(f), size: fmtSize(f.size) }]);
    });
  }

  // send
  async function doSend(content: string, atts: HAttachment[]) {
    if (!content.trim() && atts.length === 0) return;
    const userMsg: HMessage = { id: crypto.randomUUID(), role: "user", content: content.trim(), timestamp: new Date(), attachments: atts.length ? atts : undefined };
    setMessages(p => [...p, userMsg]);
    setInput(""); setPendingAtts([]); setIsTyping(true);
    if (taRef.current) taRef.current.style.height = "auto";
    await new Promise(r => setTimeout(r, 700 + Math.random() * 800));
    const fn = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
    const reply = fn(content.trim() || "your attachment");
    const assistantMsg: HMessage = { id: crypto.randomUUID(), role: "assistant", content: reply, timestamp: new Date() };
    setMessages(p => [...p, assistantMsg]);
    setIsTyping(false);
    if (voiceMode) speak(reply);
  }

  function sendMsg() { void doSend(input, pendingAtts); }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  }

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  // cleanup
  useEffect(() => () => {
    videoStream?.getTracks().forEach(t => t.stop());
    screenStream?.getTracks().forEach(t => t.stop());
    recRef.current?.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMessages = messages.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Voice conversation overlay */}
      {voiceMode && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6 px-4">

          <div className="text-center">
            <div className="text-6xl mb-3">{model.logo}</div>
            <h2 className="text-2xl font-bold text-slate-100">Voice Conversation</h2>
            <p className="text-slate-400 text-sm mt-1">
              {isSpeaking ? "AI is speaking…" : isListening ? "Listening…" : "Tap mic to speak"}
            </p>
          </div>
          <div className="flex items-end gap-1 h-14">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className={cn("w-1 rounded-full", isSpeaking || isListening ? "bg-purple-400" : "bg-slate-700")}
                style={{ height: isSpeaking || isListening ? `${Math.random() * 40 + 8}px` : "8px",
                  animation: isSpeaking || isListening ? `hwave ${0.4 + Math.random() * 0.4}s ${i * 0.04}s ease-in-out infinite alternate` : "none" }} />
            ))}
          </div>
          {transcript && <p className="text-slate-300 italic max-w-sm text-center">"{transcript}"</p>}
          {hasMessages && (
            <div className="max-w-lg w-full max-h-40 overflow-y-auto space-y-2">
              {messages.slice(-3).map(m => (
                <div key={m.id} className={cn("text-sm px-4 py-2 rounded-xl max-w-[85%]",
                  m.role === "user" ? "bg-purple-600/30 text-purple-200 ml-auto" : "bg-slate-800 text-slate-200")}>
                  {m.content.slice(0, 100)}{m.content.length > 100 ? "…" : ""}
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-4">
            <button onClick={toggleListen}
              className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all",
                isListening ? "bg-red-500 hover:bg-red-400 animate-pulse" : "bg-purple-600 hover:bg-purple-500")}>
              {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
            {isSpeaking && (
              <button onClick={stopSpeak} className="w-16 h-16 rounded-full bg-orange-600 hover:bg-orange-500 flex items-center justify-center text-white transition-all">
                <VolumeX className="w-7 h-7" />
              </button>
            )}
            <button onClick={toggleVoiceMode} className="w-16 h-16 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-all">
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}

      {/* Video / screen preview */}
      {(videoOn || screenOn) && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {videoOn && (
            <div className="relative w-36 h-24 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <button onClick={toggleVideo} className="absolute top-1 right-1 bg-slate-900/80 rounded-full p-0.5 hover:bg-red-600 transition-colors">
                <X className="w-3 h-3 text-white" />
              </button>
              <span className="absolute bottom-1 left-1.5 text-[10px] text-white bg-slate-900/70 px-1 py-0.5 rounded-full">Camera</span>
            </div>
          )}
          {screenOn && (
            <div className="relative flex-1 min-w-0 max-w-[260px] h-24 rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
              <video ref={screenRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <button onClick={toggleScreen} className="absolute top-1 right-1 bg-slate-900/80 rounded-full p-0.5 hover:bg-red-600 transition-colors">
                <X className="w-3 h-3 text-white" />
              </button>
              <span className="absolute bottom-1 left-1.5 text-[10px] text-white bg-slate-900/70 px-1 py-0.5 rounded-full">Screen</span>
            </div>
          )}
        </div>
      )}

      {/* Messages (shown below input when started) */}
      {hasMessages && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-4 max-h-72 overflow-y-auto space-y-3">
          {messages.map(msg =>
            msg.role === "user" ? (
              <div key={msg.id} className="flex justify-end items-end gap-2">
                <span className="text-[10px] text-slate-600">{fmtTime(msg.timestamp)}</span>
                <div className="max-w-[75%] space-y-1.5">
                  {msg.attachments?.map(a => (
                    <div key={a.id} className="flex justify-end">
                      {a.type === "image"
                        ? <img src={a.url} alt={a.name} className="max-w-[200px] rounded-xl border border-slate-700" />
                        : <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs flex items-center gap-1.5">
                            <Paperclip className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-300 truncate max-w-[140px]">{a.name}</span>
                          </div>}
                    </div>
                  ))}
                  {msg.content && <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">{msg.content}</div>}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex items-start gap-2 max-w-[85%]">
                <span className="text-lg w-7 h-7 flex items-center justify-center bg-slate-800 rounded-full shrink-0">{model.logo}</span>
                <div>
                  <div className="text-[10px] text-slate-600 mb-0.5">{model.name} · {fmtTime(msg.timestamp)}</div>
                  <div className="bg-slate-800 text-slate-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
                    {renderMsg(msg.content)}
                  </div>
                  {voiceMode && (
                    <button onClick={() => speak(msg.content)} className="mt-1 text-[10px] text-slate-600 hover:text-purple-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Play
                    </button>
                  )}
                </div>
              </div>
            )
          )}
          {isTyping && (
            <div className="flex items-start gap-2">
              <span className="text-lg w-7 h-7 flex items-center justify-center bg-slate-800 rounded-full">{model.logo}</span>
              <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-2.5">
                <span className="flex gap-1">
                  {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {/* ── Search card ── */}
      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        {/* Pending attachments */}
        {pendingAtts.length > 0 && (
          <div className="flex gap-2 flex-wrap px-4 pt-3">
            {pendingAtts.map(a => (
              <div key={a.id} className="relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                {a.type === "image"
                  ? <img src={a.url} alt={a.name} className="w-14 h-14 object-cover" />
                  : <div className="flex items-center gap-1.5 px-3 py-2 text-xs"><Paperclip className="w-3 h-3 text-slate-400" /><span className="text-slate-300 max-w-[100px] truncate">{a.name}</span></div>}
                <button onClick={() => setPendingAtts(p => p.filter(x => x.id !== a.id))} className="absolute top-0.5 right-0.5 bg-slate-900/80 rounded-full p-0.5 hover:bg-red-600">
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Voice transcript */}
        {transcript && (
          <div className="mx-4 mt-3 px-3 py-2 bg-purple-600/10 border border-purple-500/30 rounded-xl text-sm text-purple-300 italic">
            {transcript}…
          </div>
        )}

        {/* Input field */}
        <div className="px-5 pt-5 pb-2">
          <textarea
            ref={taRef}
            rows={1}
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`; }}
            onKeyDown={handleKey}
            placeholder="Click here and type anything — or just say hi! 👋"
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-base resize-none focus:outline-none max-h-32 leading-relaxed"
          />
        </div>

        {/* Action bar */}
        <div className="px-4 pb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Mic */}
            <button onClick={toggleListen} title={isListening ? "Stop listening" : "Voice type"}
              className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                isListening ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-purple-500/20 hover:bg-purple-500/30 text-purple-400")}>
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            {/* Attach file */}
            <button onClick={() => fileRef.current?.click()} title="Attach file"
              className="w-8 h-8 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 flex items-center justify-center transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            {/* Upload image */}
            <button onClick={() => imgRef.current?.click()} title="Upload image"
              className="w-8 h-8 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 flex items-center justify-center transition-colors">
              <ImageIcon className="w-4 h-4" />
            </button>
            {/* Voice conversation */}
            <button onClick={toggleVoiceMode} title="Voice conversation"
              className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                voiceMode ? "bg-purple-500/30 text-purple-300" : "bg-teal-500/20 hover:bg-teal-500/30 text-teal-400")}>
              <VoiceWave active={voiceMode} />
            </button>
            {/* Video */}
            <button onClick={toggleVideo} title={videoOn ? "Stop camera" : "Camera"}
              className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                videoOn ? "bg-red-500/30 text-red-400" : "bg-red-500/20 hover:bg-red-500/30 text-red-400")}>
              {videoOn ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
            {/* Screen share */}
            <button onClick={toggleScreen} title={screenOn ? "Stop sharing" : "Share screen"}
              className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                screenOn ? "bg-green-500/30 text-green-400" : "bg-green-500/20 hover:bg-green-500/30 text-green-400")}>
              {screenOn ? <Square className="w-4 h-4 fill-current" /> : <Monitor className="w-4 h-4" />}
            </button>
            {/* Agent chip */}
            <div className="flex items-center gap-1 border border-slate-600 rounded-full px-3 py-1 text-xs text-slate-400 cursor-pointer hover:bg-slate-800 transition-colors ml-0.5">
              <Monitor className="w-3 h-3" />
              <span>Agent</span>
              <span className="text-slate-500 font-medium">+</span>
            </div>
          </div>

          {/* Let's go button */}
          <button
            onClick={sendMsg}
            disabled={isTyping}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm shrink-0"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Let&apos;s go
          </button>
        </div>

        {/* Tabs + suggestions — only when no messages */}
        {!hasMessages && (
          <>
            {/* Tab bar */}
            <div className="border-t border-slate-800 flex overflow-x-auto scrollbar-none">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0",
                    activeTab === tab.id
                      ? "border-slate-100 text-slate-100"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  )}
                >
                  <span className="text-sm">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Suggestions list */}
            <div>
              {TABS.find(t => t.id === activeTab)?.suggestions.map(s => (
                <button
                  key={s.text}
                  onClick={() => setInput(s.text)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-800 transition-colors text-left group"
                >
                  <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-sm shrink-0 group-hover:bg-slate-700 transition-colors">
                    {s.icon}
                  </span>
                  <span className="text-sm text-slate-300">{s.text}</span>
                </button>
              ))}
            </div>

            {/* Hint footer */}
            <div className="px-5 py-2.5 border-t border-slate-800 flex items-center gap-1.5 text-xs text-slate-500">
              <Info className="w-3 h-3 shrink-0" />
              Click any suggestion to fill the search box, then press{" "}
              <span className="text-orange-400 font-medium">Let&apos;s go</span>
            </div>
          </>
        )}
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-3 mt-2 px-1 min-h-[20px]">
        {isListening && <span className="flex items-center gap-1 text-xs text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />Listening…</span>}
        {videoOn && <span className="flex items-center gap-1 text-xs text-blue-400"><Video className="w-3 h-3" />Camera on</span>}
        {screenOn && <span className="flex items-center gap-1 text-xs text-green-400"><Monitor className="w-3 h-3" />Sharing</span>}
        {isSpeaking && (
          <span className="flex items-center gap-1 text-xs text-purple-400">
            <Volume2 className="w-3 h-3" />Speaking
            <button onClick={stopSpeak}><VolumeX className="w-3 h-3 hover:text-red-400" /></button>
          </span>
        )}
      </div>

      {/* Hidden inputs */}
      <input ref={fileRef} type="file" multiple className="hidden" onChange={e => handleFiles(e.target.files, "file")} />
      <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files, "image")} />

      {/* Category grid */}
      {!hasMessages && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3 mt-6">
          {HOME_CATEGORIES.map(({ emoji, label }) => (
            <button key={label} onClick={() => setInput(`Help me: ${label}`)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 transition-all group">
              <span className="text-2xl">{emoji}</span>
              <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
      {/* 1. HERO — AI Chat Input                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden pt-16 pb-12">
        {/* Background radial blob */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(120,80,255,0.18), transparent)" }}
        />

        <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            ✨ 347 models live · Updated daily
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Find your perfect{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI model
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-8">
            You don&apos;t need to know anything about AI to get started. Just
            click the box below — we&apos;ll do the rest together. ✨
          </p>

          {/* ── Embedded chat input + category grid ── */}
          <HomeChatInput />
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
