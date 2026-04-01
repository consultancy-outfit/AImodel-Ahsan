export interface AIModel {
  id: string;
  name: string;
  lab: string;
  category: "Language" | "Vision" | "Code" | "Image" | "Audio";
  contextWindow: number;       // in tokens
  inputPrice: number;          // $ per 1M tokens
  outputPrice: number;         // $ per 1M tokens
  rating: number;              // 1.0–5.0
  speed: "Fast" | "Medium" | "Slow";
  multimodal: boolean;
  description: string;
  useCases: string[];
  badge: "Live" | "New" | "Hot" | null;
  logo: string;                // emoji
}

export const MODELS: AIModel[] = [
  // OpenAI
  {
    id: "gpt-4o",
    name: "GPT-4o",
    lab: "OpenAI",
    category: "Language",
    contextWindow: 128000,
    inputPrice: 5.0,
    outputPrice: 15.0,
    rating: 4.9,
    speed: "Fast",
    multimodal: true,
    description:
      "OpenAI's flagship omni model with native support for text, vision, and audio. Delivers top-tier intelligence at competitive speed.",
    useCases: ["Chatbots", "Document analysis", "Vision tasks", "Code review"],
    badge: "Hot",
    logo: "🤖",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    lab: "OpenAI",
    category: "Language",
    contextWindow: 128000,
    inputPrice: 0.15,
    outputPrice: 0.6,
    rating: 4.6,
    speed: "Fast",
    multimodal: true,
    description:
      "A smaller, faster, and cheaper variant of GPT-4o that still delivers strong multimodal performance for most everyday tasks.",
    useCases: ["Customer support", "Summarisation", "Classification", "RAG"],
    badge: "New",
    logo: "⚡",
  },
  {
    id: "o1",
    name: "o1",
    lab: "OpenAI",
    category: "Language",
    contextWindow: 200000,
    inputPrice: 15.0,
    outputPrice: 60.0,
    rating: 4.8,
    speed: "Slow",
    multimodal: false,
    description:
      "OpenAI's advanced reasoning model that thinks step-by-step before answering, excelling at complex math, science, and coding problems.",
    useCases: ["Mathematical reasoning", "Scientific research", "Complex coding", "Strategy"],
    badge: "Hot",
    logo: "🧠",
  },
  {
    id: "whisper-v3",
    name: "Whisper v3",
    lab: "OpenAI",
    category: "Audio",
    contextWindow: 0,
    inputPrice: 0.006,
    outputPrice: 0.0,
    rating: 4.7,
    speed: "Medium",
    multimodal: false,
    description:
      "State-of-the-art automatic speech recognition supporting 99+ languages with high accuracy transcription and translation.",
    useCases: ["Transcription", "Translation", "Subtitle generation", "Voice assistants"],
    badge: null,
    logo: "🎙️",
  },

  // Anthropic
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    lab: "Anthropic",
    category: "Language",
    contextWindow: 200000,
    inputPrice: 3.0,
    outputPrice: 15.0,
    rating: 4.9,
    speed: "Medium",
    multimodal: true,
    description:
      "Anthropic's most intelligent model yet, combining exceptional reasoning, coding ability, and vision in a fast, affordable package.",
    useCases: ["Complex reasoning", "Code generation", "Data analysis", "Long documents"],
    badge: "Hot",
    logo: "🌟",
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    lab: "Anthropic",
    category: "Language",
    contextWindow: 200000,
    inputPrice: 0.25,
    outputPrice: 1.25,
    rating: 4.5,
    speed: "Fast",
    multimodal: true,
    description:
      "Anthropic's fastest and most compact model, ideal for near-instant responses and high-throughput production workloads.",
    useCases: ["Real-time chat", "Content moderation", "Summarization", "Customer service"],
    badge: null,
    logo: "🍃",
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    lab: "Anthropic",
    category: "Language",
    contextWindow: 200000,
    inputPrice: 15.0,
    outputPrice: 75.0,
    rating: 4.8,
    speed: "Slow",
    multimodal: true,
    description:
      "Anthropic's most powerful model for handling highly complex tasks with state-of-the-art accuracy and nuanced understanding.",
    useCases: ["Research synthesis", "Legal analysis", "Creative writing", "Complex reasoning"],
    badge: null,
    logo: "🏛️",
  },

  // Google
  {
    id: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    lab: "Google",
    category: "Language",
    contextWindow: 1000000,
    inputPrice: 3.5,
    outputPrice: 10.5,
    rating: 4.7,
    speed: "Medium",
    multimodal: true,
    description:
      "Google's best-performing multimodal model with a breakthrough 1M-token context window for long document and video understanding.",
    useCases: ["Long documents", "Video analysis", "Codebase review", "Multi-document QA"],
    badge: "Live",
    logo: "💎",
  },
  {
    id: "gemini-1-5-flash",
    name: "Gemini 1.5 Flash",
    lab: "Google",
    category: "Language",
    contextWindow: 1000000,
    inputPrice: 0.075,
    outputPrice: 0.3,
    rating: 4.5,
    speed: "Fast",
    multimodal: true,
    description:
      "A distilled variant of Gemini 1.5 Pro optimized for speed and efficiency while retaining the massive 1M-token context window.",
    useCases: ["Agentic tasks", "Summarization", "Chat applications", "Data extraction"],
    badge: "New",
    logo: "⚡",
  },
  {
    id: "gemma-2-9b",
    name: "Gemma 2 9B",
    lab: "Google",
    category: "Language",
    contextWindow: 8192,
    inputPrice: 0.2,
    outputPrice: 0.2,
    rating: 4.2,
    speed: "Fast",
    multimodal: false,
    description:
      "A lightweight open-weight model from Google with strong reasoning and safety properties, suitable for on-device deployment.",
    useCases: ["Edge inference", "Fine-tuning", "Research", "Low-latency apps"],
    badge: null,
    logo: "💡",
  },

  // Meta
  {
    id: "llama-3-1-405b",
    name: "Llama 3.1 405B",
    lab: "Meta",
    category: "Language",
    contextWindow: 128000,
    inputPrice: 5.0,
    outputPrice: 15.0,
    rating: 4.7,
    speed: "Slow",
    multimodal: false,
    description:
      "Meta's largest open-source model rivaling frontier closed-source LLMs on reasoning, coding, and multilingual benchmarks.",
    useCases: ["Research", "Enterprise AI", "Fine-tuning base", "Complex reasoning"],
    badge: "Hot",
    logo: "🦙",
  },
  {
    id: "llama-3-2-vision",
    name: "Llama 3.2 Vision",
    lab: "Meta",
    category: "Vision",
    contextWindow: 128000,
    inputPrice: 3.2,
    outputPrice: 3.2,
    rating: 4.4,
    speed: "Medium",
    multimodal: true,
    description:
      "Meta's open multimodal model supporting image understanding alongside text, bringing vision capabilities to the open-source community.",
    useCases: ["Image captioning", "Visual QA", "Chart understanding", "Document parsing"],
    badge: "New",
    logo: "👁️",
  },

  // Mistral
  {
    id: "mistral-large-2",
    name: "Mistral Large 2",
    lab: "Mistral",
    category: "Language",
    contextWindow: 131072,
    inputPrice: 3.0,
    outputPrice: 9.0,
    rating: 4.6,
    speed: "Medium",
    multimodal: false,
    description:
      "Mistral's flagship reasoning model with top-tier multilingual performance, function calling, and long-context understanding.",
    useCases: ["Enterprise chatbots", "Code generation", "Multilingual tasks", "Agentic workflows"],
    badge: null,
    logo: "🌊",
  },
  {
    id: "codestral",
    name: "Codestral",
    lab: "Mistral",
    category: "Code",
    contextWindow: 32768,
    inputPrice: 1.0,
    outputPrice: 3.0,
    rating: 4.6,
    speed: "Fast",
    multimodal: false,
    description:
      "Mistral's dedicated code model trained on 80+ programming languages, optimized for code generation, completion, and debugging.",
    useCases: ["Code completion", "Bug fixing", "Test generation", "Code explanation"],
    badge: "New",
    logo: "💻",
  },

  // DeepSeek
  {
    id: "deepseek-v2",
    name: "DeepSeek-V2",
    lab: "DeepSeek",
    category: "Language",
    contextWindow: 128000,
    inputPrice: 0.14,
    outputPrice: 0.28,
    rating: 4.5,
    speed: "Medium",
    multimodal: false,
    description:
      "An efficient Mixture-of-Experts language model from DeepSeek with 236B total parameters delivering GPT-4-class performance at ultra-low cost.",
    useCases: ["General chat", "Reasoning", "Content generation", "Research"],
    badge: "Hot",
    logo: "🔍",
  },
  {
    id: "deepseek-coder-v2",
    name: "DeepSeek Coder V2",
    lab: "DeepSeek",
    category: "Code",
    contextWindow: 128000,
    inputPrice: 0.14,
    outputPrice: 0.28,
    rating: 4.6,
    speed: "Medium",
    multimodal: false,
    description:
      "DeepSeek's code-specialized MoE model that outperforms GPT-4 Turbo on coding benchmarks across 338 programming languages.",
    useCases: ["Code generation", "Algorithmic problems", "Refactoring", "Code review"],
    badge: null,
    logo: "🛠️",
  },

  // xAI
  {
    id: "grok-2",
    name: "Grok-2",
    lab: "xAI",
    category: "Language",
    contextWindow: 131072,
    inputPrice: 2.0,
    outputPrice: 10.0,
    rating: 4.5,
    speed: "Fast",
    multimodal: true,
    description:
      "xAI's frontier model with real-time X (Twitter) data access, strong reasoning, and vision understanding capabilities.",
    useCases: ["Real-time information", "Social media analysis", "General reasoning", "Image understanding"],
    badge: "Live",
    logo: "🚀",
  },

  // NVIDIA
  {
    id: "nemotron-4-340b",
    name: "Nemotron-4 340B",
    lab: "NVIDIA",
    category: "Language",
    contextWindow: 4096,
    inputPrice: 4.2,
    outputPrice: 4.2,
    rating: 4.4,
    speed: "Slow",
    multimodal: false,
    description:
      "NVIDIA's large open-source model designed for synthetic data generation to train smaller, more efficient AI systems.",
    useCases: ["Synthetic data generation", "Model distillation", "Research", "Enterprise AI"],
    badge: null,
    logo: "🎮",
  },

  // Alibaba
  {
    id: "qwen2-72b",
    name: "Qwen2 72B",
    lab: "Alibaba",
    category: "Language",
    contextWindow: 131072,
    inputPrice: 0.9,
    outputPrice: 0.9,
    rating: 4.5,
    speed: "Medium",
    multimodal: false,
    description:
      "Alibaba's flagship open-weight model with exceptional multilingual capabilities, beating many closed-source models on key benchmarks.",
    useCases: ["Multilingual NLP", "General reasoning", "Code assistance", "Enterprise applications"],
    badge: "New",
    logo: "🏮",
  },

  // Microsoft
  {
    id: "phi-3-5-mini",
    name: "Phi-3.5 Mini",
    lab: "Microsoft",
    category: "Language",
    contextWindow: 128000,
    inputPrice: 0.05,
    outputPrice: 0.1,
    rating: 4.1,
    speed: "Fast",
    multimodal: false,
    description:
      "Microsoft's compact 3.8B parameter model that punches far above its weight class, ideal for edge and mobile deployment.",
    useCases: ["Edge AI", "Mobile apps", "Low-latency inference", "Fine-tuning"],
    badge: null,
    logo: "🪟",
  },
];

export const FEATURED_MODELS: AIModel[] = MODELS.slice(0, 6);

export const NEW_MODELS: AIModel[] = MODELS.filter((m) => m.badge === "New");

export const MODEL_STATS = {
  totalModels: MODELS.length,
  labs: Array.from(new Set(MODELS.map((m) => m.lab))).length,
  categories: Array.from(new Set(MODELS.map((m) => m.category))).length,
  totalDownloads: 4_872_500,
};
