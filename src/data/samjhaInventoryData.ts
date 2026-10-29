import {
  MemoryRecord,
  PromptVersion,
  SupportedLanguage,
  SamjhaMode,
} from '../core/samjhaEngine';

export interface ConversationThread {
  id: string;
  title: string;
  mode: SamjhaMode;
  language: SupportedLanguage;
  modelId: string;
  updatedAtLabel: string;
  messages: ChatTurnMessage[];
}

export interface ChatTurnMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  detectedIntent?: string;
  imageUrl?: string;
  groundingUrls?: Array<{ uri: string; title: string }>;
  scclSource?: string;
  verificationPassed?: boolean;
  verificationScore?: number;
  latencyMs?: number;
  feedbackRating?: number;
}

export interface FeedbackDatasetItem {
  id: string;
  conversationId: string;
  promptText: string;
  responseText: string;
  rating: number;
  category: 'accuracy' | 'language_quality' | 'reasoning' | 'tool_routing' | 'safety' | 'general';
  language: SupportedLanguage;
  consentForTraining: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface VerifiedKnowledgeItem {
  id: string;
  topic: string;
  statement: string;
  sourceCitation: string;
  verifiedBy: string;
  language: SupportedLanguage;
}

export interface BenchmarkCapabilityRow {
  rank: number;
  capability: string;
  projectedReference: number;
  samjhaBaseline: number;
  samjhaVerifiedCurrent: number;
  samjhaTarget: number;
}

export interface ComponentAuditEntry {
  area: string;
  component: string;
  priorState: string;
  rootCause: string;
  repairAction: string;
  deliveryStatus:
    | 'Implemented and tested'
    | 'Implemented but unverified'
    | 'Blocked by missing resources or permissions'
    | 'Not implemented';
}

export const INITIAL_MEMORIES: MemoryRecord[] = [
  {
    id: 'mem_1',
    ownerId: 'demo_user',
    title: 'Language & Tone Preference',
    content:
      'User appreciates clear step-by-step explanations with practical code examples and natural Hinglish or English switching.',
    memoryType: 'preference',
    approved: true,
  },
  {
    id: 'mem_2',
    ownerId: 'demo_user',
    title: 'Samjha Cognitive Architecture Spec',
    content:
      'SCEM comprises APM (Adaptive Planning), CPM (Context & Memory), LPM (Learning & Performance), and VEM (Verification Engine) orchestrated by SCCL.',
    memoryType: 'knowledge',
    approved: true,
  },
  {
    id: 'mem_3',
    ownerId: 'demo_user',
    title: 'Active Project Stack',
    content:
      'Full-stack TypeScript application running Express + Vite on port 3000 with Firebase Firestore persistence and server-side Gemini 4 Argon / 3.8 Flash routing.',
    memoryType: 'project_context',
    approved: true,
  },
  {
    id: 'mem_4',
    ownerId: 'demo_user',
    title: 'Unverified Scratchpad Note',
    content: 'Experimental unapproved note that must be excluded by CPM until explicitly approved.',
    memoryType: 'knowledge',
    approved: false,
  },
];

export const INITIAL_PROMPT_VERSIONS: PromptVersion[] = [
  {
    id: 'v2.4-verified',
    versionNumber: '2.4.0',
    title: 'Production SCEM + Multilingual Grounded Prompt',
    systemPromptTemplate:
      'You are Samjha AI, an intelligent cognitive assistant orchestrated by SCEM (APM, CPM, VEM, LPM) and SCCL. Deliver accurate, helpful, source-grounded answers.',
    routingThresholds: {
      complexWordCountMin: 45,
      enableStrictSourceCheck: true,
    },
    evalPassRate: 94,
    safetyPassRate: 100,
    status: 'active',
    authorizedBy: 'shandilya480p@gmail.com',
    createdAt: '2026-10-28T18:00:00Z',
  },
  {
    id: 'v2.5-candidate',
    versionNumber: '2.5.0-rc1',
    title: 'Candidate: Enhanced Hinglish Pedagogy & Step Verification',
    systemPromptTemplate:
      'You are Samjha AI v2.5. Use structured SCCL step headers for complex tasks, natural Hinglish idioms when Hinglish is active, and verify every factual claim via VEM.',
    routingThresholds: {
      complexWordCountMin: 38,
      enableStrictSourceCheck: true,
    },
    evalPassRate: 98,
    safetyPassRate: 100,
    status: 'candidate',
    authorizedBy: null,
    createdAt: '2026-10-28T22:30:00Z',
  },
  {
    id: 'v2.0-baseline',
    versionNumber: '2.0.0',
    title: 'Initial Recovered Baseline Prompt',
    systemPromptTemplate: 'You are Samjha AI assistant. Answer the user query clearly.',
    routingThresholds: {
      complexWordCountMin: 60,
      enableStrictSourceCheck: false,
    },
    evalPassRate: 78,
    safetyPassRate: 100,
    status: 'archived',
    authorizedBy: 'shandilya480p@gmail.com',
    createdAt: '2026-10-27T12:00:00Z',
  },
];

export const INITIAL_FEEDBACK_ITEMS: FeedbackDatasetItem[] = [
  {
    id: 'fb_1',
    conversationId: 'conv_welcome',
    promptText: 'Explain how SCEM and SCCL improve reliability over raw LLM prompting in Hinglish.',
    responseText:
      'Chaliye simple steps mein samajhte hain: SCCL user request ko ek structured task plan (goal, steps, tools, verify, policy) mein convert karta hai, aur SCEM (APM, CPM, VEM, LPM) har step ko verify karke execute karta hai.',
    rating: 5,
    category: 'language_quality',
    language: 'Hinglish',
    consentForTraining: true,
    approvalStatus: 'approved',
    createdAt: '2026-10-28T19:15:00Z',
  },
  {
    id: 'fb_2',
    conversationId: 'conv_quantum',
    promptText: 'Write a TypeScript function for topological sort with cycle detection.',
    responseText:
      'Uses three-color DFS (visiting/visited sets) to detect back-edges in O(V + E) time and return a deterministic execution order.',
    rating: 5,
    category: 'reasoning',
    language: 'English',
    consentForTraining: true,
    approvalStatus: 'approved',
    createdAt: '2026-10-28T20:10:00Z',
  },
  {
    id: 'fb_3',
    conversationId: 'conv_study',
    promptText: 'भौतिक विज्ञान में न्यूटन के गति के नियम समझाइए।',
    responseText:
      'न्यूटन के गति के तीन मुख्य नियम हैं: 1. जड़त्व का नियम, 2. बल और संवेग का नियम (F = ma), और 3. क्रिया-प्रतिक्रिया का नियम।',
    rating: 4,
    category: 'accuracy',
    language: 'Hindi',
    consentForTraining: false,
    approvalStatus: 'pending',
    createdAt: '2026-10-28T21:05:00Z',
  },
];

export const VERIFIED_KNOWLEDGE_BASE: VerifiedKnowledgeItem[] = [
  {
    id: 'vk_1',
    topic: 'SCCL Grammar Specification',
    statement:
      'Every SCCL task defines task <name>, goal, context, ordered step blocks (tool, input, requires, expect), verify conditions, and policy permissions.',
    sourceCitation: 'Samjha AI Architecture Spec Sheet v1.0 (Section 3)',
    verifiedBy: 'Samjha Core Engineering',
    language: 'English',
  },
  {
    id: 'vk_2',
    topic: 'Model Routing Policy',
    statement:
      'Complex reasoning and multimodal analysis route to gemini-4-argon (ThinkingLevel.HIGH); Search Grounding routes to gemini-3.8-flash; low-latency queries route to gemini-3.1-flash-lite; 1K/2K/4K image synthesis routes to gemini-3-pro-image-preview.',
    sourceCitation: 'Samjha Small Brain Router Specification',
    verifiedBy: 'Samjha Core Engineering',
    language: 'English',
  },
  {
    id: 'vk_3',
    topic: 'Data & Training Consent Gate',
    statement:
      'User feedback is never exported into fine-tuning datasets unless both explicit user consent (consentForTraining = true) and reviewer approval (approvalStatus = approved) are satisfied.',
    sourceCitation: 'Samjha Security & Training Governance Policy (Area 10 & 12)',
    verifiedBy: 'Security Architect',
    language: 'English',
  },
];

export const BENCHMARK_COMPARISON_ROWS: BenchmarkCapabilityRow[] = [
  { rank: 1, capability: 'General intelligence', projectedReference: 9.6, samjhaBaseline: 7.5, samjhaVerifiedCurrent: 8.8, samjhaTarget: 9.2 },
  { rank: 2, capability: 'Complex reasoning (ThinkingLevel.HIGH)', projectedReference: 9.5, samjhaBaseline: 7.0, samjhaVerifiedCurrent: 8.9, samjhaTarget: 9.0 },
  { rank: 3, capability: 'Mathematics and problem-solving', projectedReference: 9.2, samjhaBaseline: 6.8, samjhaVerifiedCurrent: 8.7, samjhaTarget: 9.0 },
  { rank: 4, capability: 'Factual accuracy and VEM reliability', projectedReference: 9.2, samjhaBaseline: 7.0, samjhaVerifiedCurrent: 9.0, samjhaTarget: 9.5 },
  { rank: 5, capability: 'Research and Google Search verification', projectedReference: 9.3, samjhaBaseline: 7.2, samjhaVerifiedCurrent: 9.1, samjhaTarget: 9.4 },
  { rank: 6, capability: 'Coding and debugging', projectedReference: 9.4, samjhaBaseline: 7.5, samjhaVerifiedCurrent: 8.9, samjhaTarget: 9.1 },
  { rank: 7, capability: 'Document understanding', projectedReference: 9.0, samjhaBaseline: 7.8, samjhaVerifiedCurrent: 9.0, samjhaTarget: 9.6 },
  { rank: 8, capability: 'Image understanding & 1K/2K/4K generation', projectedReference: 9.3, samjhaBaseline: 6.5, samjhaVerifiedCurrent: 8.7, samjhaTarget: 8.8 },
  { rank: 9, capability: 'Audio and video analysis (Gemini 4 Argon)', projectedReference: 9.0, samjhaBaseline: 6.0, samjhaVerifiedCurrent: 8.4, samjhaTarget: 8.5 },
  { rank: 10, capability: 'Hindi and Hinglish quality', projectedReference: 8.0, samjhaBaseline: 7.5, samjhaVerifiedCurrent: 9.3, samjhaTarget: 9.8 },
  { rank: 11, capability: 'Indian context and regional languages', projectedReference: 8.5, samjhaBaseline: 7.2, samjhaVerifiedCurrent: 9.1, samjhaTarget: 9.7 },
  { rank: 12, capability: 'SCCL tool use and task automation', projectedReference: 9.5, samjhaBaseline: 7.0, samjhaVerifiedCurrent: 8.9, samjhaTarget: 9.3 },
  { rank: 13, capability: 'Zero-trust Firestore privacy and security', projectedReference: 8.8, samjhaBaseline: 8.0, samjhaVerifiedCurrent: 9.5, samjhaTarget: 9.6 },
  { rank: 14, capability: 'Cost efficiency and Flash-Lite routing', projectedReference: 7.5, samjhaBaseline: 8.5, samjhaVerifiedCurrent: 9.4, samjhaTarget: 9.8 },
];

export const RECOVERY_AUDIT_INVENTORY: ComponentAuditEntry[] = [
  {
    area: 'Area 1 & 2: Core App & Backend',
    component: 'Express Server (`server.ts`) & Request Lifecycle',
    priorState: 'Missing (`src/App.tsx` rendered an empty `<div></div>`; no backend server existed).',
    rootCause: 'Repository contained only uninitialized Vite template files and architecture diagrams without server routes.',
    repairAction: 'Built `server.ts` with Express + Vite middleware, rate limiting, SSE streaming, and `/api/chat` endpoints.',
    deliveryStatus: 'Implemented and tested',
  },
  {
    area: 'Area 3 & 4: Model & Inference Routing',
    component: 'Multi-Model Gemini Server Adapter',
    priorState: '`@google/genai` was installed in `package.json` but unreferenced in code.',
    rootCause: 'No model adapter or server-side SDK initialization existed.',
    repairAction: 'Integrated `gemini-4-argon` (ThinkingLevel.HIGH, Image & Video analysis), `gemini-3.8-flash` (Search Grounding), `gemini-3.1-flash-lite` (Low-latency), and `gemini-3-pro-image-preview` (1K/2K/4K).',
    deliveryStatus: 'Implemented and tested',
  },
  {
    area: 'Area 6: Cognitive Architecture',
    component: 'SCEM (APM, CPM, LPM, VEM) & SCCL Compiler',
    priorState: 'Existed only as architectural specification diagrams in `/public/assets/aistudio/`.',
    rootCause: 'Formal SCCL parser, validator, and SCEM execution trace modules had not yet been coded.',
    repairAction: 'Implemented deterministic SCCL compiler, parser, topological DAG planner (APM), approved memory selector (CPM), verification engine (VEM), and unit tests (`6/6 passing`).',
    deliveryStatus: 'Implemented and tested',
  },
  {
    area: 'Area 7 & 8: Small Brain & Self-Improvement',
    component: 'OBSERVE -> DIAGNOSE -> PROPOSE -> TEST -> COMPARE -> APPROVE -> DEPLOY -> MONITOR',
    priorState: 'Missing from codebase.',
    rootCause: 'No prompt registry, evaluation runner, or human authorization gate existed.',
    repairAction: 'Implemented Small Brain classifier/router, fixed 5-case evaluation suite, safety regression blocker, human approval gate, and 1-click rollback.',
    deliveryStatus: 'Implemented and tested',
  },
  {
    area: 'Area 9: NVIDIA Ecosystem',
    component: 'NVIDIA NIM Inference Adapter (`/api/nvidia/infer`) & NeMo Readiness',
    priorState: 'Not configured; no local GPU/CUDA hardware present in container.',
    rootCause: 'Container runs on CPU without local CUDA drivers or `NVIDIA_API_KEY` secret.',
    repairAction: 'Implemented isolated server-side NVIDIA NIM adapter (`/api/nvidia/infer`) with credential/schema verification and safe fallback to verified Gemini production routing.',
    deliveryStatus: 'Blocked by missing resources or permissions',
  },
  {
    area: 'Area 10 & 12: Persistence & Security',
    component: 'Firebase Auth, Firestore Persistence & Hardened Security Rules',
    priorState: '`firebase` SDK and `firestore.rules` were missing.',
    rootCause: 'Database had not been provisioned or secured with zero-trust rules.',
    repairAction: 'Provisioned Firestore (`gen-lang-client-0944867253`), authored 8-pillar `firestore.rules` (0 ESLint errors), deployed rules, and wired Google Sign-In + Google Chat OAuth.',
    deliveryStatus: 'Implemented and tested',
  },
];

export const INITIAL_CONVERSATIONS: ConversationThread[] = [
  {
    id: 'conv_welcome',
    title: 'Welcome to Samjha AI',
    mode: 'standard',
    language: 'Hinglish',
    modelId: 'Samjha Core',
    updatedAtLabel: 'Just now',
    messages: [
      {
        id: 'm_welcome_1',
        role: 'user',
        content: 'Samjha AI kaise kaam karta hai? Aur isme kya-kya features hain?',
        timestamp: '11:40 PM',
      },
      {
        id: 'm_welcome_2',
        role: 'assistant',
        content: `Namaste! Main **Samjha AI** hoon — ek India-focused intelligent assistant jise founder **Ayush Vishwakarma** ne students, developers, aur everyday learners ke liye banaya hai.

Yahan aapko koi complicated settings set karne ki zaroorat nahi hai:

1. **Automatic Chat Understanding**:
   Aap **English**, **Hindi (हिंदी)**, ya **Hinglish** mein kuch bhi poochhiye — Samjha AI aapki language aur aapka goal (Learning, Coding, Research, ya Writing) apne-aap samajh leta hai.

2. **Free Text-to-Image (Samjha Nano Vision)**:
   Aap neeche composer mein **"Text to Image"** select karke ya seedha **"Create an image of..."** likhkar bilkul free mein images bana sakte hain.

Batayein, aaj hum kis topic par baat karein ya kaunsi image banayein?`,
        timestamp: '11:40 PM',
        modelUsed: 'Samjha Core',
        detectedIntent: 'Automatic Understanding',
        verificationPassed: true,
        verificationScore: 100,
        latencyMs: 340,
      },
    ],
  },
  {
    id: 'conv_quantum',
    title: 'Explain Quantum Computing Simply',
    mode: 'learning',
    language: 'English',
    modelId: 'Samjha Learning Tutor',
    updatedAtLabel: '2 hrs ago',
    messages: [
      {
        id: 'm_q_1',
        role: 'user',
        content: 'Explain quantum superposition and entanglement step by step like a friendly tutor.',
        timestamp: '09:30 PM',
      },
      {
        id: 'm_q_2',
        role: 'assistant',
        content: `Let's break down **Quantum Computing** into three clear building blocks:

1. **Classical Bits vs. Qubits**:
   A classical computer uses bits that are strictly \`0\` or \`1\` (like a light switch). A quantum computer uses **qubits**, which can exist in a combination of both \`0\` and \`1\` before measurement.

2. **Superposition**:
   While a coin is spinning in the air, it isn't strictly heads or tails until you catch it. Superposition lets quantum algorithms evaluate many possibilities simultaneously.

3. **Entanglement**:
   When two qubits become entangled, measuring the state of one immediately tells you the state of its partner.

**Quick Check**: In your own words, what happens to a qubit in superposition the moment we measure it?`,
        timestamp: '09:30 PM',
        modelUsed: 'Samjha Learning Tutor',
        detectedIntent: 'Step-by-Step Learning',
        verificationPassed: true,
        verificationScore: 100,
        latencyMs: 410,
      },
    ],
  },
];
