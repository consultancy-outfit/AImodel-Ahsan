export const SEED_DISCOVERIES = [
  {
    slug: 'gemini-2-5-sota-reasoning',
    title: 'Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks',
    organization: 'Google DeepMind',
    date: new Date('2026-03-26'),
    category: 'Reasoning',
    snippet:
      'Scores 83.2% on AIME 2025 math competition, outperforming all prior models on reasoning-intensive evaluations including GPT-5 and Claude Opus 4.6.',
    overview:
      "Google DeepMind's Gemini 2.5 Pro has set a new state-of-the-art across multiple reasoning benchmarks, most notably scoring 83.2% on the highly competitive AIME 2025 mathematical competition. This result surpasses GPT-5, Claude Opus 4.6, and all prior frontier models on reasoning-intensive evaluations. The paper introduces a novel chain-of-thought extension called Iterative Thought Refinement (ITR), which enables the model to backtrack and revise intermediate reasoning steps in real-time, dramatically improving accuracy on multi-step logical and mathematical problems.",
    arxivId: 'arXiv:2603.08821',
    authors: 'Anil, R., Borgeaud, S., Wu, Y., et al.',
    metrics: [
      { value: '83.2%', label: 'AIME 2025 score' },
      { value: '+6.4%', label: 'vs prior SOTA' },
      { value: '5M ctx', label: 'Context window' },
    ],
    keyFindings: [
      'New Iterative Thought Refinement (ITR) allows real-time reasoning backtracking, boosting math accuracy by 18% vs standard CoT.',
      'Gemini 2.5 Pro scored top-1 on MATH, HumanEval, and MMLU-Pro simultaneously — a first for any single model.',
      'Performance gains are most significant on problems requiring 10+ reasoning steps, suggesting ITR scales with complexity.',
      'Multimodal reasoning (diagrams + equations) also improved 22% over Gemini 2.0, crucial for physics and geometry tasks.',
    ],
    modelsReferenced: ['Gemini 2.5 Pro', 'GPT-5', 'Claude Opus 4.6', 'o3'],
    impactLevel: 'High',
    impactDescription:
      'Sets new benchmark baseline for all future frontier model evaluations.',
  },
  {
    slug: 'scaling-laws-multimodal-models',
    title: 'Scaling laws for multimodal models: new empirical findings',
    organization: 'MIT CSAIL',
    date: new Date('2026-03-22'),
    category: 'Multimodal',
    snippet:
      'Research reveals unexpected scaling dynamics when combining vision and language — efficiency plateaus emerge at 70B parameters for most multimodal tasks.',
    overview:
      'MIT CSAIL researchers conducted a comprehensive study of scaling behavior in multimodal language models, examining how performance evolves as model size increases from 1B to 540B parameters. Contrary to purely language models, multimodal systems exhibit diminishing returns earlier — around 70B parameters — for standard vision-language tasks. However, tasks requiring deep spatial reasoning and 3D scene understanding continue to improve at larger scales. The paper proposes a new scaling coefficient specifically for multimodal architectures.',
    arxivId: 'arXiv:2603.05147',
    authors: 'Chen, L., Park, J., Nguyen, T., et al.',
    metrics: [
      { value: '70B', label: 'Efficiency plateau' },
      { value: '3.2x', label: 'Cost reduction' },
      { value: '540B', label: 'Max scale tested' },
    ],
    keyFindings: [
      'Multimodal models plateau at 70B for standard VQA and image captioning tasks.',
      'Spatial reasoning and 3D understanding continue improving beyond 200B parameters.',
      'A new multimodal scaling coefficient (MSC) predicts crossover points with 94% accuracy.',
      'Training data diversity matters more than volume beyond the 70B parameter threshold.',
    ],
    modelsReferenced: ['Gemini 1.5 Pro', 'LLaVA-3', 'GPT-4V', 'Flamingo-2'],
    impactLevel: 'High',
    impactDescription:
      'Redefines compute allocation strategy for multimodal AI teams.',
  },
  {
    slug: 'constitutional-ai-v2-alignment',
    title: 'Constitutional AI v2: improved alignment through iterative refinement',
    organization: 'Anthropic',
    date: new Date('2026-03-18'),
    category: 'Alignment',
    snippet:
      'New methodology achieves 40% reduction in harmful outputs while preserving capability on all major benchmarks.',
    overview:
      'Anthropic presents Constitutional AI v2, a significant evolution of their alignment methodology. The new approach introduces an iterative self-critique loop where the model evaluates its own outputs against a constitutional document before finalizing responses. This process, applied during both supervised fine-tuning and RLHF stages, achieves a 40% reduction in harmful outputs on red-team evaluations while maintaining or improving performance on standard capability benchmarks including MMLU, HumanEval, and MATH.',
    arxivId: 'arXiv:2603.01923',
    authors: 'Bai, Y., Askell, A., Clark, J., et al.',
    metrics: [
      { value: '40%', label: 'Reduction in harmful outputs' },
      { value: '+2.1%', label: 'MMLU improvement' },
      { value: '3 stages', label: 'Refinement iterations' },
    ],
    keyFindings: [
      'Iterative self-critique during fine-tuning reduces harmful outputs by 40% on red-team benchmarks.',
      'Constitutional v2 maintains 98.7% of base model capability on standard evaluations.',
      'The approach scales linearly — longer constitutions improve safety without capability tradeoffs.',
      'Human preference ratings improved by 18% across helpfulness, honesty, and harmlessness axes.',
    ],
    modelsReferenced: ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'GPT-4o'],
    impactLevel: 'High',
    impactDescription:
      'New gold standard for production-safe AI alignment pipelines.',
  },
  {
    slug: 'llama-4-scout-maverick-multimodal',
    title: 'Llama 4 Scout & Maverick: natively multimodal from the ground up',
    organization: 'Meta AI',
    date: new Date('2026-03-15'),
    category: 'Open Weights',
    snippet:
      '17B MoE architecture trained on 40 trillion tokens with native understanding across text, image, and audio — fully open weights released.',
    overview:
      'Meta AI releases Llama 4 Scout and Llama 4 Maverick, the first models in the Llama series to be natively multimodal from the ground up. Unlike adapter-based multimodal approaches, both models use a unified token space for text, image, and audio from pretraining. Scout (17B active, 109B total MoE) targets edge deployment while Maverick (17B active, 400B total MoE) targets data center workloads. Both models are released as fully open weights under a permissive license.',
    arxivId: 'arXiv:2603.00482',
    authors: 'Touvron, H., Martin, L., Stone, K., et al.',
    metrics: [
      { value: '17B', label: 'Active parameters' },
      { value: '40T', label: 'Training tokens' },
      { value: '400B', label: 'Total MoE params' },
    ],
    keyFindings: [
      'Unified token space for text, image, and audio enables superior cross-modal reasoning vs adapter-based approaches.',
      'Scout achieves competitive vision-language benchmark scores while running on a single A100 GPU.',
      'Maverick outperforms GPT-4V on 7 of 9 multimodal benchmarks with full open weights.',
      'Training on 40 trillion tokens with 35% multimodal data establishes a new open-source pretraining recipe.',
    ],
    modelsReferenced: [
      'Llama 4 Scout',
      'Llama 4 Maverick',
      'GPT-4V',
      'Gemini 1.5 Flash',
    ],
    impactLevel: 'High',
    impactDescription:
      'Opens frontier-quality multimodal capability to the entire open-source community.',
  },
  {
    slug: 'long-context-recall-1m-tokens',
    title: 'Long-context recall: how models handle 1M+ token windows',
    organization: 'Stanford NLP',
    date: new Date('2026-03-10'),
    category: 'Efficiency',
    snippet:
      'Comprehensive evaluation shows sharp recall degradation beyond 200K tokens for most frontier models, with only two models maintaining performance.',
    overview:
      'Stanford NLP introduces LongRecall-1M, a new benchmark evaluating retrieval accuracy across contexts up to 1 million tokens. Testing 12 frontier models, the study finds that most models experience significant recall degradation beyond 200K tokens. Only Gemini 1.5 Pro and Claude 3.5 Sonnet maintain above 85% recall at 500K tokens. The paper identifies positional encoding as the primary limiting factor and proposes a new positional interpolation scheme that improves long-context recall by 31% with no additional training.',
    arxivId: 'arXiv:2603.04298',
    authors: 'Liu, N., Lin, K., Hewitt, J., et al.',
    metrics: [
      { value: '200K', label: 'Typical degradation point' },
      { value: '31%', label: 'Recall improvement' },
      { value: '12', label: 'Models evaluated' },
    ],
    keyFindings: [
      '85%+ recall maintained by only Gemini 1.5 Pro and Claude 3.5 Sonnet at 500K token contexts.',
      'Positional encoding is the dominant failure mode — accounting for 67% of degradation cases.',
      'New interpolation scheme restores recall by 31% for models with RoPE-based position embeddings.',
      'Instruction placement at the end of long contexts consistently outperforms placement at the beginning.',
    ],
    modelsReferenced: [
      'Gemini 1.5 Pro',
      'Claude 3.5 Sonnet',
      'GPT-4o',
      'Mistral Large 2',
    ],
    impactLevel: 'Medium',
    impactDescription:
      'Changes best practices for long-document RAG and agentic context management.',
  },
  {
    slug: 'deepseek-r1-open-weights-reasoning',
    title: 'DeepSeek-R1 open weights: reproducing frontier reasoning at minimal cost',
    organization: 'DeepSeek',
    date: new Date('2026-03-05'),
    category: 'Open Weights',
    snippet:
      "Full open-weight release of R1 reasoning model trained for $5.6M — matches o1 performance on math and coding at 20x lower inference cost.",
    overview:
      "DeepSeek releases the full weights and training recipe for DeepSeek-R1, a chain-of-thought reasoning model that matches OpenAI o1's performance on AIME, MATH, and HumanEval benchmarks while costing 20x less per inference token. The model uses a novel Group Relative Policy Optimization (GRPO) algorithm that replaces the critic model in PPO, reducing training compute by 50%. The complete training recipe, including the GRPO implementation, is open-sourced enabling full reproduction.",
    arxivId: 'arXiv:2602.14567',
    authors: 'DeepSeek-AI, Guo, D., Yang, D., et al.',
    metrics: [
      { value: '$5.6M', label: 'Training cost' },
      { value: '20x', label: 'Inference cost reduction' },
      { value: '97.3%', label: 'o1 parity on MATH' },
    ],
    keyFindings: [
      'GRPO eliminates the critic model from PPO, cutting reasoning model training cost by 50%.',
      "DeepSeek-R1 achieves 97.3% of o1's MATH benchmark score at 1/20th the inference cost.",
      'Open-weight release enables fine-tuning R1 on domain-specific reasoning tasks without API dependency.',
      'Distillation from R1 to 7B and 14B models retains 89% of full-size reasoning performance.',
    ],
    modelsReferenced: ['DeepSeek-R1', 'o1', 'o1-mini', 'Qwen2.5-72B'],
    impactLevel: 'High',
    impactDescription:
      'Democratizes frontier-level reasoning capability with full open-source reproducibility.',
  },
  {
    slug: 'mixture-of-experts-sparse-scaling',
    title: 'Sparse MoE scaling: efficiency frontiers for trillion-parameter models',
    organization: 'Microsoft Research',
    date: new Date('2026-02-28'),
    category: 'Efficiency',
    snippet:
      'New routing algorithm for sparse Mixture-of-Experts reduces communication overhead by 43% enabling stable training of 1T+ parameter models on commodity clusters.',
    overview:
      'Microsoft Research presents Switch-Router v2, an improved routing algorithm for sparse Mixture-of-Experts (MoE) architectures that addresses the load-balancing and communication bottlenecks that have limited MoE scaling. By introducing adaptive expert capacity with dynamic rebalancing, the new router reduces inter-node communication overhead by 43% compared to standard top-k routing. The team successfully trains a 1.2 trillion parameter MoE model on 4096 H100 GPUs, demonstrating stable convergence without expert collapse.',
    arxivId: 'arXiv:2602.09841',
    authors: 'Fedus, W., Zoph, B., Shazeer, N., et al.',
    metrics: [
      { value: '43%', label: 'Communication reduction' },
      { value: '1.2T', label: 'Parameters trained' },
      { value: '4096', label: 'H100 GPUs used' },
    ],
    keyFindings: [
      'Switch-Router v2 eliminates expert collapse across all tested scales from 8B to 1.2T parameters.',
      'Dynamic expert capacity reduces wasted compute from 31% to under 4% at trillion-parameter scale.',
      'The 1.2T MoE model outperforms a dense 70B model on 14 of 15 benchmarks at equivalent inference FLOP.',
      'Open-source routing code compatible with PyTorch, JAX, and existing MoE frameworks.',
    ],
    modelsReferenced: [
      'Mixtral 8x7B',
      'DeepSeek-V2',
      'Gemini 1.5 Flash',
      'Switch Transformer',
    ],
    impactLevel: 'Medium',
    impactDescription:
      'Unlocks practical trillion-parameter training for organizations without hyperscaler infrastructure.',
  },
  {
    slug: 'vision-language-alignment-grounding',
    title: 'Beyond CLIP: rethinking vision-language alignment for dense grounding',
    organization: 'OpenAI',
    date: new Date('2026-02-20'),
    category: 'Multimodal',
    snippet:
      'New contrastive grounding objective outperforms CLIP on object localization and dense captioning by 28% while using 60% less training data.',
    overview:
      'OpenAI researchers propose DenseAlign, a new vision-language pretraining objective that extends contrastive learning to dense, region-level alignment rather than image-level alignment. By contrasting image regions with spans of text rather than entire captions, DenseAlign models learn significantly richer spatial representations. The model outperforms CLIP-based architectures on object localization, referring expression comprehension, and dense captioning benchmarks by 28% on average while requiring 60% less pretraining data.',
    arxivId: 'arXiv:2602.07213',
    authors: 'Radford, A., Kim, J., Xu, T., et al.',
    metrics: [
      { value: '28%', label: 'Grounding improvement' },
      { value: '60%', label: 'Data reduction' },
      { value: '1B', label: 'Image-text pairs used' },
    ],
    keyFindings: [
      'Region-level contrastive objective learns 3.4x more precise spatial representations vs image-level CLIP.',
      'DenseAlign achieves state-of-the-art on RefCOCO, RefCOCO+, and Visual Genome dense captioning.',
      '60% training data reduction is achieved through hard negative mining at the region level.',
      'Zero-shot transfer to 3D scene grounding shows 22% improvement over CLIP-based baselines.',
    ],
    modelsReferenced: ['CLIP', 'DALL-E 3', 'GPT-4V', 'Stable Diffusion 3'],
    impactLevel: 'Medium',
    impactDescription:
      'New pretraining recipe for vision models requiring precise spatial understanding.',
  },
];
