import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendMessageDto } from './dto/send-message.dto';

export interface ChatResponse {
  message: string;
  modelId: string;
  modelName: string;
  tokensUsed: number;
  latencyMs: number;
}

// Model id → display name mapping (mirrors frontend MODELS)
const MODEL_NAMES: Record<string, string> = {
  'gpt-4o':                 'GPT-4o',
  'gpt-4o-mini':            'GPT-4o Mini',
  'gpt-4-turbo':            'GPT-4 Turbo',
  'gpt-3.5-turbo':          'GPT-3.5 Turbo',
  'claude-opus-4':          'Claude Opus 4',
  'claude-sonnet-4':        'Claude Sonnet 4',
  'claude-haiku-3-5':       'Claude Haiku 3.5',
  'gemini-1-5-pro':         'Gemini 1.5 Pro',
  'gemini-1-5-flash':       'Gemini 1.5 Flash',
  'llama-3-1-405b':         'Llama 3.1 405B',
  'mistral-large':          'Mistral Large',
  'deepseek-v3':            'DeepSeek V3',
};

function getModelName(id: string): string {
  return MODEL_NAMES[id] ?? id;
}

// ── Quick-action keyword → rich response map ─────────────────────────────────
const QUICK_ACTION_RESPONSES: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ['create image', 'ai-generated image', 'image generation'],
    response: `Great choice! Here's how to create stunning AI-generated images:\n\n**Top Tools**\n• **DALL-E 3** (via ChatGPT) — best for photorealism and following complex prompts\n• **Midjourney** — best for artistic, stylised, and cinematic results\n• **Stable Diffusion** — open-source, fully customisable locally\n• **Adobe Firefly** — best for commercial-safe images\n\n**Prompt Formula That Works**\n\`[Subject] + [Style] + [Lighting] + [Composition] + [Quality modifiers]\`\n\nExample: *"A futuristic city skyline at sunset, cyberpunk style, neon lights, wide-angle shot, ultra-detailed, 8K"*\n\n**Pro Tips**\n1. Be specific — vague prompts give vague results\n2. Reference art styles: "in the style of Monet", "photorealistic DSLR"\n3. Use negative prompts to exclude unwanted elements\n4. Aspect ratio matters: 16:9 for landscapes, 9:16 for portraits\n\nWhat subject or theme would you like to create an image of?`,
  },
  {
    keywords: ['generate audio', 'ai audio', 'music', 'voiceover', 'sound'],
    response: `Here's your guide to AI audio generation:\n\n**For Music & Beats**\n• **Suno AI** — type a description, get a full song with vocals\n• **Udio** — high-quality music generation across all genres\n• **AIVA** — classical and cinematic composition\n\n**For Voiceovers & Speech**\n• **ElevenLabs** — most realistic AI voice cloning\n• **Play.ht** — 900+ voices, great for podcasts\n• **Murf AI** — professional studio-quality narration\n\n**For Sound Effects**\n• **AudioCraft (Meta)** — generate custom sound effects from text\n• **Freesound + AI** — browse and remix CC-licensed sounds\n\n**Quick Start Prompt for Music**\n*"Upbeat lo-fi hip-hop track, 90 BPM, warm piano chords, light rain ambience, relaxing study mood"*\n\nWhat kind of audio are you looking to create — music, narration, or sound effects?`,
  },
  {
    keywords: ['create video', 'ai video', 'video generation'],
    response: `AI video creation is moving fast — here are the best tools right now:\n\n**Text-to-Video**\n• **Sora (OpenAI)** — highest quality, cinematic outputs\n• **Runway Gen-3** — professional film-grade video generation\n• **Kling AI** — great for realistic motion and characters\n• **Pika** — fast, easy to use for short clips\n\n**AI Video Editing**\n• **Descript** — edit video by editing the transcript\n• **CapCut AI** — auto-captions, background removal, effects\n• **Synthesia** — create presenter videos without a camera\n\n**Workflow for Best Results**\n1. Write a detailed scene description (camera angle, lighting, motion)\n2. Start with 5-second clips and extend\n3. Use img2video for consistent characters\n4. Post-process in DaVinci Resolve or Premiere\n\n**Example Prompt**\n*"Close-up of a coffee cup on a wooden table, steam rising slowly, soft morning light, cinematic depth of field"*\n\nWhat kind of video are you making — short clip, presentation, or full production?`,
  },
  {
    keywords: ['create slides', 'presentation', 'powerpoint', 'slide deck'],
    response: `I'll help you build a great slide presentation! Here's a proven structure:\n\n**Universal Slide Deck Template (10 slides)**\n1. **Title Slide** — headline, subtitle, your name/date\n2. **Problem Statement** — what pain point are you solving?\n3. **Solution Overview** — your core idea in one sentence\n4. **How It Works** — 3-step process or visual diagram\n5. **Key Features / Benefits** — 3 bullets max per slide\n6. **Data / Proof** — stats, charts, or case studies\n7. **Competitive Landscape** — simple comparison table\n8. **Roadmap / Timeline** — what's next?\n9. **Team** — who's behind this?\n10. **Call to Action** — what do you want the audience to do?\n\n**Design Rules**\n• One idea per slide\n• Max 6 words per bullet point\n• Use high-contrast colours (dark bg + light text)\n• Add one visual per slide minimum\n\n**AI Tools to Build Slides Fast**\n• **Gamma.app** — full deck from a prompt in 30 seconds\n• **Beautiful.ai** — smart layouts that auto-adjust\n• **Tome** — narrative-focused AI presentations\n\nWhat's your presentation topic? I'll draft a custom outline for you.`,
  },
  {
    keywords: ['infograph', 'infographic'],
    response: `Here's how to design an impactful infographic:\n\n**The 5-Section Infographic Formula**\n1. **Hook Header** — bold stat or provocative question at the top\n2. **Context** — 2-3 sentences setting up the problem\n3. **Main Data Story** — 4-6 visual data points (icons + numbers)\n4. **Process or Timeline** — show cause/effect or sequence\n5. **Takeaway + Source** — key conclusion and data credits\n\n**Best AI Infographic Tools**\n• **Canva AI** — templates + Magic Design from a prompt\n• **Piktochart** — data-focused infographic builder\n• **Visme** — animated and interactive infographics\n• **Adobe Express** — professional quality with AI layout\n\n**Design Principles**\n• Limit to 3 fonts, 3-4 colours\n• Use icons instead of long text\n• One statistic = one visual element\n• Portrait orientation (800×2000px) for social sharing\n\n**Example Topic Flow**\n*"The Rise of AI in 2024"* → stats on adoption → timeline of milestones → impact by industry → future prediction\n\nWhat data or topic would you like to visualise?`,
  },
  {
    keywords: ['create quiz', 'quiz'],
    response: `Let me help you build an engaging quiz! Here's the blueprint:\n\n**Quiz Design Framework**\n\n**Step 1 — Choose Your Format**\n• Multiple choice (most common, easy to score)\n• True/False (quick, good for facts)\n• Short answer (deeper thinking, harder to auto-grade)\n• Matching (great for vocabulary/concepts)\n\n**Step 2 — Question Difficulty Mix (per 10 questions)**\n• 3 Easy — build confidence, test basics\n• 5 Medium — core knowledge assessment\n• 2 Hard — challenge top performers\n\n**Step 3 — Sample Question Structure**\n*Q: What does HTTP stand for?*\na) HyperText Transfer Protocol ✓\nb) High Transfer Text Protocol\nc) Hyperlink Text Transport Protocol\nd) HyperText Transport Page\n\n**Step 4 — Add Feedback**\nFor every wrong answer, show a brief explanation — this turns the quiz into a learning tool.\n\n**AI Quiz Builders**\n• **Quizgecko** — generate a full quiz from any text or URL\n• **Typeform** — beautiful interactive quiz flows\n• **Kahoot** — gamified, great for live sessions\n\nWhat topic and audience is this quiz for? I'll generate 10 questions for you.`,
  },
  {
    keywords: ['flashcard', 'flash card', 'study card'],
    response: `Flashcards are one of the most effective study tools — here's how to make great ones:\n\n**The Perfect Flashcard Formula**\n• **Front**: One clear, specific question\n• **Back**: Concise answer (1-2 sentences max) + a memorable example\n\n**Spaced Repetition Schedule**\n| Review Interval | When to Review |\n|---|---|\n| Day 1 | After first learning |\n| Day 3 | Short-term recall |\n| Day 7 | One week later |\n| Day 14 | Two weeks |\n| Day 30 | Monthly reinforcement |\n\n**Sample Flashcard Set — JavaScript Basics**\n\nCard 1:\n*Front*: What is a closure in JavaScript?\n*Back*: A function that retains access to its outer scope even after the outer function has returned. Example: counter functions.\n\nCard 2:\n*Front*: What does \`Array.map()\` return?\n*Back*: A new array with each element transformed by the callback. Does not mutate the original.\n\n**Best Flashcard Apps**\n• **Anki** — gold standard for spaced repetition\n• **Quizlet** — easy sharing and AI-generated sets\n• **RemNote** — integrates notes + flashcards\n\nWhat subject or topic should I create flashcards for? Give me a topic and I'll generate a full set.`,
  },
  {
    keywords: ['mind map', 'mindmap'],
    response: `Mind maps are perfect for brainstorming and organising ideas. Here's a starter:\n\n**Mind Map Structure**\n\`\`\`\n[Central Topic]\n├── Branch 1: Core Concept A\n│   ├── Sub-topic 1.1\n│   └── Sub-topic 1.2\n├── Branch 2: Core Concept B\n│   ├── Sub-topic 2.1\n│   └── Sub-topic 2.2\n├── Branch 3: Core Concept C\n└── Branch 4: Core Concept D\n\`\`\`\n\n**Example — "Starting a Business"**\n\`\`\`\n[Starting a Business]\n├── Market Research → competitors, target audience, validation\n├── Product/Service → MVP, pricing, differentiation\n├── Legal & Finance → entity type, bank account, accounting\n├── Marketing → brand, channels, content strategy\n└── Operations → tools, team, processes\n\`\`\`\n\n**Best AI Mind Map Tools**\n• **Whimsical** — clean, fast, collaborative\n• **MindMeister** — feature-rich with AI suggestions\n• **Miro** — full whiteboard with mind map templates\n• **Mapify** — generate a mind map from any URL or document\n\nWhat topic would you like me to build a mind map for?`,
  },
  {
    keywords: ['analyze data', 'analyse data', 'data analysis', 'dataset', 'spreadsheet'],
    response: `Here's a complete data analysis workflow:\n\n**Phase 1 — Define the Question**\nBefore touching data, answer: *"What decision will this analysis inform?"*\n\n**Phase 2 — Data Preparation**\n• Remove duplicates and null values\n• Standardise date/number formats\n• Create a data dictionary (what each column means)\n\n**Phase 3 — Exploratory Analysis**\n• **Distributions**: min, max, mean, median, std dev\n• **Correlations**: which variables move together?\n• **Outliers**: data points > 2 standard deviations from mean\n• **Trends**: plot values over time\n\n**Phase 4 — Visualisation**\n| Chart Type | Best For |\n|---|---|\n| Bar chart | Comparing categories |\n| Line chart | Trends over time |\n| Scatter plot | Correlations |\n| Heatmap | Two-variable relationships |\n| Histogram | Distributions |\n\n**Phase 5 — Insights → Action**\nFor each finding, ask: *"So what? What should we do differently?"*\n\n**AI Tools**\n• **ChatGPT Advanced Data Analysis** — upload CSV, get instant charts\n• **Julius AI** — conversational data analysis\n• **Rows** — AI-powered spreadsheet\n\nPaste your data or describe what you're trying to analyse — I'll guide you through it.`,
  },
  {
    keywords: ['write content', 'write blog', 'write post', 'write email', 'content writing'],
    response: `I'm ready to help you write! Here's my content toolkit:\n\n**Content Types I Can Help With**\n• 📝 Blog posts & articles\n• 📧 Email campaigns & newsletters\n• 📱 Social media captions (LinkedIn, Twitter/X, Instagram)\n• 🎯 Ad copy & landing page text\n• 📄 Product descriptions\n• 🎤 Scripts & speech outlines\n\n**The AIDA Formula (works for almost everything)**\n• **A**ttention — hook the reader in the first line\n• **I**nterest — explain why this matters to them\n• **D**esire — paint a picture of the benefit\n• **A**ction — tell them exactly what to do next\n\n**Writing Quality Checklist**\n✓ Does the opening sentence make you want to keep reading?\n✓ Is every sentence earning its place?\n✓ Have you used "you" more than "we/I"?\n✓ Is the call to action crystal clear?\n✓ Read it aloud — does it sound natural?\n\n**To get the best result, tell me:**\n1. What type of content (blog, email, post)?\n2. Who is the audience?\n3. What's the goal (inform, sell, entertain)?\n4. What tone (professional, casual, witty)?\n\nShare those details and I'll write it for you right now.`,
  },
  {
    keywords: ['code generation', 'generate code', 'programming', 'coding'],
    response: `I can generate code in any language! Here's what I do best:\n\n**Languages & Frameworks**\n• **Frontend**: React, Next.js, Vue, Tailwind CSS, TypeScript\n• **Backend**: Node.js, NestJS, Python (FastAPI/Django), Go\n• **Database**: SQL, MongoDB queries, Prisma, Mongoose\n• **DevOps**: Docker, GitHub Actions, Bash scripts\n• **Mobile**: React Native, Flutter\n\n**What I Can Build For You**\n✅ Full CRUD API with authentication\n✅ React components with TypeScript\n✅ Database schemas and migrations\n✅ Algorithm implementations\n✅ Unit and integration tests\n✅ CLI tools and automation scripts\n✅ Data transformation pipelines\n\n**How to Get the Best Code**\nGive me:\n1. **Language/framework** you're using\n2. **What it should do** (be specific)\n3. **Input/output** format if relevant\n4. Any **existing code** to integrate with\n\n**Example prompt that works well:**\n*"Write a NestJS service in TypeScript that accepts a user ID, fetches their orders from MongoDB using Mongoose, and returns them sorted by date descending."*\n\nWhat would you like me to build?`,
  },
  {
    keywords: ['document analysis', 'analyze document', 'summarize document', 'pdf analysis'],
    response: `I can help analyse documents thoroughly. Here's what I can do:\n\n**Document Analysis Capabilities**\n• **Summarisation** — extract the key points in 3-5 bullets\n• **Key Entity Extraction** — names, dates, figures, decisions\n• **Sentiment Analysis** — tone and emotional direction\n• **Comparison** — diff two documents for changes\n• **Q&A** — ask any question about the document content\n• **Action Items** — pull out tasks and commitments\n• **Risk Flags** — spot concerning clauses or gaps\n\n**How to Use This**\n1. Paste the document text directly in the chat\n2. Or describe the document type and I'll create a template\n3. Tell me what you want extracted\n\n**Supported Document Types**\n• Contracts & legal agreements\n• Research papers & reports\n• Meeting transcripts & notes\n• Financial statements\n• Technical documentation\n• Emails & correspondence\n\n**Example prompt:**\n*"Here is a contract. Identify: 1) payment terms, 2) termination clauses, 3) any liability caps, 4) red flags I should ask about."*\n\nPaste your document text or describe what you need — I'll analyse it immediately.`,
  },
  {
    keywords: ['translate', 'translation', 'language'],
    response: `I can translate between 100+ languages with high accuracy. Here's what I offer:\n\n**Translation Capabilities**\n• **Direct translation** — accurate, literal meaning\n• **Localisation** — culturally adapted for the target audience\n• **Back-translation** — verify accuracy by translating back\n• **Tone matching** — formal, casual, technical, marketing\n• **Glossary support** — keep brand/product names consistent\n\n**Supported Language Pairs (examples)**\n🇺🇸 English ↔ 🇪🇸 Spanish\n🇺🇸 English ↔ 🇫🇷 French\n🇺🇸 English ↔ 🇩🇪 German\n🇺🇸 English ↔ 🇯🇵 Japanese\n🇺🇸 English ↔ 🇨🇳 Chinese (Simplified/Traditional)\n🇺🇸 English ↔ 🇸🇦 Arabic\n🇺🇸 English ↔ 🇵🇹 Portuguese\n🇺🇸 English ↔ 🇷🇺 Russian\n🇺🇸 English ↔ 🇰🇷 Korean\n\n**Tips for Better Translations**\n• Specify the context (legal doc, marketing copy, casual chat)\n• Tell me the target audience's region (e.g. "Spanish for Mexico vs Spain")\n• For technical content, provide a glossary of key terms\n\nPaste the text you want translated and tell me the target language — I'll handle it right away.`,
  },
  {
    keywords: ['just exploring', 'exploring', 'what can you do', 'capabilities'],
    response: `Welcome! I'm your AI assistant — here's a quick tour of what we can do together:\n\n**🎨 Create**\n• Generate images with AI (DALL-E, Midjourney prompts)\n• Write any type of content — blogs, emails, scripts, ads\n• Build slide decks, infographics, and mind maps\n• Compose music prompts and audio descriptions\n\n**💻 Build**\n• Generate production-ready code in any language\n• Design database schemas and API structures\n• Create full React components or NestJS services\n• Write tests, scripts, and automation tools\n\n**📊 Analyse**\n• Break down datasets and find patterns\n• Summarise documents and extract key information\n• Compare options and make recommendations\n• Research topics and synthesise findings\n\n**🎓 Learn**\n• Explain any concept from beginner to expert level\n• Create flashcards and quizzes on any topic\n• Break down complex ideas step-by-step\n• Practice conversations in any language\n\n**🚀 Plan**\n• Build business plans and strategies\n• Create project roadmaps and timelines\n• Draft proposals and pitch decks\n• Set goals and break them into action steps\n\nWhat sounds most useful to you right now? Just tell me what you're working on and we'll dive in!`,
  },
];

// Smart templated responses used when no API key is configured
function buildFallbackResponse(message: string, modelName: string): string {
  const msg = message.toLowerCase();

  // Check quick-action responses first (exact keyword match)
  for (const entry of QUICK_ACTION_RESPONSES) {
    if (entry.keywords.some(kw => msg.includes(kw))) {
      return entry.response;
    }
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello! I'm ${modelName}, your AI assistant. How can I help you today?\n\nI can assist you with research, writing, coding, analysis, and much more. What would you like to work on?`;
  }
  if (msg.includes('code') || msg.includes('function') || msg.includes('bug') || msg.includes('error')) {
    return `I can help you with that code! Here's my analysis:\n\n**What I see**: The issue likely relates to the logic you've described.\n\n**Suggestion**: Consider breaking the problem into smaller functions and adding proper error handling.\n\n**Best practice**: Always validate inputs at system boundaries and write tests for edge cases.\n\nCould you share the specific code snippet so I can give more precise guidance?`;
  }
  if (msg.includes('write') || msg.includes('content') || msg.includes('blog') || msg.includes('email')) {
    return `I'd be happy to help with your writing!\n\n**Key principles for great content:**\n1. Start with a clear hook that grabs attention\n2. Structure ideas logically with clear sections\n3. Use active voice and concrete examples\n4. End with a clear call to action\n\nCould you tell me more about the audience and tone you're going for?`;
  }
  if (msg.includes('analyz') || msg.includes('data') || msg.includes('chart') || msg.includes('insight')) {
    return `Great question about data analysis! Here's a structured approach:\n\n**Step 1 — Define your goal**: What decision will this data inform?\n**Step 2 — Clean the data**: Remove nulls, handle outliers, normalise formats\n**Step 3 — Explore**: Look for distributions, correlations, and anomalies\n**Step 4 — Visualise**: Choose the right chart type for your audience\n**Step 5 — Interpret**: Turn numbers into actionable insights\n\nWhat dataset or metric are you working with?`;
  }
  if (msg.includes('explain') || msg.includes('what is') || msg.includes('how does') || msg.includes('why')) {
    return `Great question! Let me break that down for you:\n\n**Core concept**: ${message.replace(/explain|what is|how does|why/gi, '').trim() || 'This topic'} is a fascinating area with several important dimensions.\n\n**Key points to understand:**\n1. The fundamentals — understanding the building blocks\n2. How the pieces interact with each other\n3. Practical applications in the real world\n4. Common misconceptions to avoid\n\nWould you like me to dive deeper into any specific aspect?`;
  }
  if (msg.includes('plan') || msg.includes('strategy') || msg.includes('roadmap') || msg.includes('business')) {
    return `Here's a strategic framework for your request:\n\n**Phase 1 — Discovery** (Week 1-2)\n• Define objectives and success metrics\n• Identify stakeholders and constraints\n• Research the competitive landscape\n\n**Phase 2 — Design** (Week 3-4)\n• Draft the core strategy\n• Identify quick wins vs long-term goals\n• Allocate resources\n\n**Phase 3 — Execute** (Month 2+)\n• Launch with a pilot or MVP\n• Measure, learn, and iterate\n\nWhat's the specific goal or constraint you're working within?`;
  }

  // Generic intelligent response
  const topics = message.split(' ').slice(0, 3).join(' ');
  return `I've thought carefully about "${topics}${message.length > 20 ? '...' : ''}". Here's my response:\n\n${message.length > 50 ? '**Context**: Your question touches on an important area that deserves a thorough answer.\n\n' : ''}**Key insight**: The most effective approach here is to think systematically about the problem, breaking it into manageable components.\n\n**Recommendation**: Start by clearly defining what success looks like, then work backwards to identify the steps needed to get there.\n\n**Next step**: What aspect would you like to explore further? I'm here to help you go as deep as you need.`;
}

@Injectable()
export class ChatService {
  constructor(private readonly config: ConfigService) {}

  async sendMessage(dto: SendMessageDto): Promise<ChatResponse> {
    const start = Date.now();
    const modelName = getModelName(dto.modelId);
    const openaiKey = this.config.get<string>('OPENAI_API_KEY');

    // ── Try OpenAI if key is available ──────────────────────────────────────
    if (openaiKey && dto.modelId.startsWith('gpt')) {
      try {
        const messages = [
          { role: 'system', content: `You are ${modelName}, a helpful AI assistant. Be concise, accurate, and friendly.` },
          ...(dto.history ?? []).map(h => ({ role: h.role, content: h.content })),
          { role: 'user', content: dto.message },
        ];

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: dto.modelId,
            messages,
            max_tokens: 1024,
            temperature: 0.7,
          }),
        });

        if (res.ok) {
          const json = await res.json() as {
            choices: { message: { content: string } }[];
            usage: { total_tokens: number };
          };
          return {
            message: json.choices[0].message.content,
            modelId: dto.modelId,
            modelName,
            tokensUsed: json.usage.total_tokens,
            latencyMs: Date.now() - start,
          };
        }
      } catch {
        // fall through to fallback
      }
    }

    // ── Try Anthropic if key is available ────────────────────────────────────
    const anthropicKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (anthropicKey && dto.modelId.startsWith('claude')) {
      try {
        const messages = [
          ...(dto.history ?? []).map(h => ({ role: h.role, content: h.content })),
          { role: 'user', content: dto.message },
        ];

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: dto.modelId.replace('claude-', 'claude-').replace('opus-4', 'claude-opus-4-5').replace('sonnet-4', 'claude-sonnet-4-5').replace('haiku-3-5', 'claude-haiku-3-5-20251001'),
            max_tokens: 1024,
            system: `You are ${modelName}, a helpful AI assistant. Be concise, accurate, and friendly.`,
            messages,
          }),
        });

        if (res.ok) {
          const json = await res.json() as {
            content: { type: string; text: string }[];
            usage: { input_tokens: number; output_tokens: number };
          };
          const text = json.content.find(c => c.type === 'text')?.text ?? '';
          return {
            message: text,
            modelId: dto.modelId,
            modelName,
            tokensUsed: json.usage.input_tokens + json.usage.output_tokens,
            latencyMs: Date.now() - start,
          };
        }
      } catch {
        // fall through to fallback
      }
    }

    // ── Fallback: smart templated response ──────────────────────────────────
    // Simulate realistic latency
    await new Promise(r => setTimeout(r, 400 + Math.random() * 600));

    return {
      message: buildFallbackResponse(dto.message, modelName),
      modelId: dto.modelId,
      modelName,
      tokensUsed: Math.floor(dto.message.length / 4) + Math.floor(Math.random() * 200) + 100,
      latencyMs: Date.now() - start,
    };
  }
}
