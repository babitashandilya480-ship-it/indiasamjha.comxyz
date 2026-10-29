import React, { useState } from 'react';
import {
  Palette,
  Type,
  Layout,
  Users,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  Copy,
  Sparkles,
} from 'lucide-react';

interface DesignSpecPreset {
  id: string;
  appName: string;
  tagline: string;
  persona: {
    name: string;
    role: string;
    ageRange: string;
    painPoints: string[];
    goals: string[];
  };
  userFlow: Array<{
    step: string;
    screen: string;
    action: string;
    outcome: string;
  }>;
  colors: Array<{
    role: string;
    name: string;
    hex: string;
    contrastOnDark: string;
    psychology: string;
  }>;
  typography: {
    displayFont: string;
    bodyFont: string;
    monoFont: string;
    scale: Array<{
      token: string;
      element: string;
      mobileSize: string;
      desktopSize: string;
      lineHeight: string;
      weight: string;
      usage: string;
    }>;
  };
  componentStates: Array<{
    state: 'Default' | 'Hover' | 'Active / Clicked' | 'Focus (Keyboard)' | 'Disabled';
    bgToken: string;
    textToken: string;
    borderToken: string;
    fontToken: string;
    shadowOrRing: string;
  }>;
  accessibility: Array<{
    title: string;
    standard: string;
    implementation: string;
  }>;
  microcopy: Array<{
    scenario: string;
    headline: string;
    body: string;
    cta: string;
  }>;
}

const PRESETS: Record<string, DesignSpecPreset> = {
  samjha_ai: {
    id: 'samjha_ai',
    appName: 'Samjha AI — Cognitive Assistant & Learning Platform',
    tagline: 'Multilingual cognitive workspace powered by SCEM, SCCL & Samjha Small Brain',
    persona: {
      name: 'Aman Verma & Priya Sharma',
      role: 'University Student / Full-Stack Developer / Bilingual Learner',
      ageRange: '18–34 years',
      painPoints: [
        'Opaque "black-box" AI responses with hallucinated facts and no source verification.',
        'Jarring switches between English technical terminology and natural Hindi/Hinglish explanations.',
        'High cognitive overload from cluttered dashboards and intimidating developer consoles.',
      ],
      goals: [
        'Switch effortlessly between Fast Q&A, Step-by-Step Learning Tutor, and Deep Thinking modes.',
        'Inspect the exact SCCL plan and VEM verification score behind every critical answer.',
        'Learn complex STEM and coding topics in natural Hinglish, Hindi, or English.',
      ],
    },
    userFlow: [
      {
        step: '01. Arrival & Context Setup',
        screen: 'Top Bar & Hero Greeting Card',
        action: 'User selects cognitive Mode (e.g., Learning or Search Grounded) and Language (Hinglish).',
        outcome: 'Active route indicator updates immediately to show target model and language.',
      },
      {
        step: '02. Task Formulation',
        screen: 'Message Composer / Quick Tools',
        action: 'User submits a natural-language question or clicks a Quick Tool (Explain, Solve, Research).',
        outcome: 'Samjha Small Brain compiles the prompt into a deterministic SCCL task script.',
      },
      {
        step: '03. SCEM Execution & Verification',
        screen: 'Conversation Thread',
        action: 'APM orders steps topologically, CPM injects approved memories, and VEM audits output.',
        outcome: 'Response renders with model badge, VEM verification score, and clickable web citations.',
      },
      {
        step: '04. Trace Inspection & Feedback Loop',
        screen: 'Expandable SCCL Drawer & Training Mode',
        action: 'User inspects the SCCL DAG trace or rates the response with explicit training consent.',
        outcome: 'Approved examples flow into the Training Mode JSONL dataset queue.',
      },
    ],
    colors: [
      {
        role: 'Background (60% Canvas)',
        name: 'Midnight Navy',
        hex: '#0F172A',
        contrastOnDark: '15.4:1 (with #E2E8F0)',
        psychology: 'Reduces eye strain during extended study and coding sessions while anchoring focus.',
      },
      {
        role: 'Structural Surface (30%)',
        name: 'Deep Slate Blue',
        hex: '#1E293B',
        contrastOnDark: '11.8:1 (with #E2E8F0)',
        psychology: 'Creates clear spatial hierarchy and readable card boundaries without harsh borders.',
      },
      {
        role: 'Primary Brand Accent (10%)',
        name: 'Electric Purple',
        hex: '#7C3AED',
        contrastOnDark: '5.3:1 (with #FFFFFF)',
        psychology: 'Signals cognitive intelligence, creativity, and trustworthy primary interactive affordances.',
      },
      {
        role: 'Secondary Warmth',
        name: 'Warm Amber',
        hex: '#F59E0B',
        contrastOnDark: '8.9:1 (with #0F172A)',
        psychology: 'Evokes encouragement, human warmth, and clear caution/review states in Training Mode.',
      },
      {
        role: 'Semantic Verification',
        name: 'Emerald Green',
        hex: '#10B981',
        contrastOnDark: '8.4:1 (with #0F172A)',
        psychology: 'Confirms VEM verification pass states, safety compliance, and learning progress.',
      },
      {
        role: 'Primary Text',
        name: 'Soft White',
        hex: '#E2E8F0',
        contrastOnDark: '15.4:1 (on #0F172A)',
        psychology: 'Prevents halation/glare on dark backgrounds while maintaining crisp WCAG AAA legibility.',
      },
      {
        role: 'Creative Highlight',
        name: 'Rose Pink',
        hex: '#EC4899',
        contrastOnDark: '5.1:1 (with #0F172A)',
        psychology: 'Highlights supportive micro-moments, Deep Thinking mode, and multimodal studio actions.',
      },
    ],
    typography: {
      displayFont: 'Plus Jakarta Sans',
      bodyFont: 'DM Sans',
      monoFont: 'JetBrains Mono',
      scale: [
        {
          token: 'display-hero (H1)',
          element: 'h1',
          mobileSize: '1.5rem (24px)',
          desktopSize: '2.0rem (32px)',
          lineHeight: '1.25 (Tight)',
          weight: '700 (Bold)',
          usage: 'Primary workspace greeting and view titles (`text-wrap: balance`).',
        },
        {
          token: 'heading-section (H2)',
          element: 'h2',
          mobileSize: '1.125rem (18px)',
          desktopSize: '1.25rem (20px)',
          lineHeight: '1.35',
          weight: '600 (SemiBold)',
          usage: 'Module headers (SCEM Workbench, Training Queue, Multimodal Studio).',
        },
        {
          token: 'heading-card (H3)',
          element: 'h3',
          mobileSize: '0.9375rem (15px)',
          desktopSize: '1.0rem (16px)',
          lineHeight: '1.4',
          weight: '600 (SemiBold)',
          usage: 'Sub-panel titles, modal headers, and card lead-ins.',
        },
        {
          token: 'body-prose',
          element: 'p / li',
          mobileSize: '0.875rem (14px)',
          desktopSize: '0.9375rem (15px)',
          lineHeight: '1.65 (Relaxed)',
          weight: '400 (Regular)',
          usage: 'Multi-turn assistant responses, Hinglish/Hindi prose, and documentation.',
        },
        {
          token: 'ui-control-label',
          element: 'button / nav / label',
          mobileSize: '0.75rem (12px)',
          desktopSize: '0.8125rem (13px)',
          lineHeight: '1.2 (Single-line)',
          weight: '500–600 (Medium/SemiBold)',
          usage: 'Single-line buttons, segmented tabs, and form labels (`whitespace-nowrap`).',
        },
        {
          token: 'code-telemetry',
          element: 'code / pre / td',
          mobileSize: '0.75rem (12px)',
          desktopSize: '0.75rem (12px)',
          lineHeight: '1.5',
          weight: '500 (Medium)',
          usage: 'SCCL grammar scripts, tabular benchmark scores (`tabular-nums`), latency ms.',
        },
      ],
    },
    componentStates: [
      {
        state: 'Default',
        bgToken: 'color.brand.primary (#7C3AED)',
        textToken: 'color.text.onPrimary (#FFFFFF)',
        borderToken: 'color.border.transparent',
        fontToken: 'font.ui.label (13px / 600)',
        shadowOrRing: 'shadow-sm',
      },
      {
        state: 'Hover',
        bgToken: 'color.brand.primaryHover (#6D28D9)',
        textToken: 'color.text.onPrimary (#FFFFFF)',
        borderToken: 'color.border.purpleSubtle (#8B5CF6)',
        fontToken: 'font.ui.label (13px / 600)',
        shadowOrRing: 'transition-colors 150ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      {
        state: 'Active / Clicked',
        bgToken: 'color.brand.primaryActive (#5B21B6)',
        textToken: 'color.text.onPrimary (#FFFFFF)',
        borderToken: 'color.border.purpleStrong (#A78BFA)',
        fontToken: 'font.ui.label (13px / 600)',
        shadowOrRing: 'scale-[0.99] transform',
      },
      {
        state: 'Focus (Keyboard)',
        bgToken: 'color.brand.primary (#7C3AED)',
        textToken: 'color.text.onPrimary (#FFFFFF)',
        borderToken: 'color.accent.emerald (#10B981)',
        fontToken: 'font.ui.label (13px / 600)',
        shadowOrRing: 'focus-visible:ring-2 ring-[#7C3AED] ring-offset-2 ring-offset-[#0F172A]',
      },
      {
        state: 'Disabled',
        bgToken: 'color.surface.disabled (#1E293B / 40% opacity)',
        textToken: 'color.text.muted (#64748B)',
        borderToken: 'color.border.slate800 (#1E293B)',
        fontToken: 'font.ui.label (13px / 500)',
        shadowOrRing: 'cursor-not-allowed opacity-40',
      },
    ],
    accessibility: [
      {
        title: 'WCAG AA/AAA Contrast & Optical Dark-Mode Compensation',
        standard: 'Contrast >= 4.5:1 for body text (15.4:1 achieved with #E2E8F0 on #0F172A)',
        implementation:
          'Applies +0.01em letter-spacing on dark surfaces to prevent light-on-dark halation and pairs every semantic color with an explicit text label or icon.',
      },
      {
        title: 'Semantic Landmark & Keyboard Screen-Reader Flow',
        standard: 'Native HTML5 landmarks (<header>, <nav>, <aside>, <main>, <dialog>)',
        implementation:
          'Every icon-only button, textarea, and select control includes an explicit <label> or aria-label so assistive trees expose deterministic roles.',
      },
      {
        title: 'Touch Target Geometry & Multilingual Script Legibility',
        standard: 'Minimum 40x40px desktop / 44x44px mobile interactive hit areas',
        implementation:
          'Supports Devanagari (Hindi/Marathi), Tamil, Telugu, and Bengali script line-heights (1.65) so ascenders and matras never clip inside chat bubbles.',
      },
    ],
    microcopy: [
      {
        scenario: 'Empty Conversation Thread',
        headline: 'Ready when you are — let’s explore step by step.',
        body: 'Ask a question in English, Hindi, or Hinglish, or pick a Quick Tool on the right. Every answer is planned with SCCL and verified before it reaches you.',
        cta: 'Try a Sample Research Query',
      },
      {
        scenario: 'Empty Approved Training Dataset',
        headline: 'No approved training examples in the queue yet.',
        body: 'Examples only enter the fine-tuning dataset when both user consent and reviewer approval are checked — keeping your data private and verified.',
        cta: 'Review Pending Feedback',
      },
      {
        scenario: 'Network / Upstream Inference Error',
        headline: 'We hit a temporary pause while reaching the model.',
        body: 'Your message and conversation history are safely preserved. Check your connection or retry the turn whenever you are ready.',
        cta: 'Retry Turn',
      },
    ],
  },
  fintech_young_adults: {
    id: 'fintech_young_adults',
    appName: 'PulsePay — Mobile Banking & Micro-Investing for Young Adults',
    tagline: 'Zero-jargon money habits, instant UPI/peer splits, and automated round-up vaults',
    persona: {
      name: 'Rohan Mehta',
      role: 'First-Job Product Analyst & Freelance Creator',
      ageRange: '20–28 years',
      painPoints: [
        'Traditional banking apps bury simple transfers behind 5 layers of legacy menus and OTP timeouts.',
        'Anxiety around checking monthly spending because statements look like punitive accounting ledgers.',
        'Hidden fees and confusing financial jargon around mutual funds and emergency savings.',
      ],
      goals: [
        'See real "Safe-to-Spend" balance at a glance after rent and recurring bills are set aside.',
        'Split dinner or rent with friends in 2 taps and automate ₹50 daily micro-savings.',
      ],
    },
    userFlow: [
      {
        step: '01. Biometric Passkey Unlock',
        screen: 'Instant Auth Splash',
        action: 'User unlocks with FaceID / Fingerprint or 4-digit hardware-backed PIN.',
        outcome: 'Lands directly on the Safe-to-Spend Home Canvas in under 400ms.',
      },
      {
        step: '02. Safe-to-Spend Inspection',
        screen: 'Home Dashboard',
        action: 'User reviews Safe-to-Spend balance, upcoming bill radar, and 1-tap "Send / Split" bar.',
        outcome: 'Clear separation between spendable cash and locked goal vaults.',
      },
      {
        step: '03. Instant Peer Transfer / Split',
        screen: 'Quick Pay Sheet',
        action: 'User selects recipient, enters amount in tabular numerals, and adds a tag.',
        outcome: 'Real-time payee name verification and zero-fee confirmation preview.',
      },
      {
        step: '04. Confirmed Settlement & Round-Up',
        screen: 'Receipt & Vault Boost State',
        action: 'User confirms payment; optional ₹20 spare-change round-up routes to Emergency Vault.',
        outcome: 'Instant receipt with updated Safe-to-Spend metric and streak progress.',
      },
    ],
    colors: [
      {
        role: 'Background (60% Canvas)',
        name: 'Deep Obsidian Slate',
        hex: '#0F172A',
        contrastOnDark: '15.4:1',
        psychology: 'Conveys institutional security, modern craft, and calm financial control.',
      },
      {
        role: 'Elevated Card Surface (30%)',
        name: 'Charcoal Navy',
        hex: '#1E293B',
        contrastOnDark: '11.8:1',
        psychology: 'Separates transaction rows, vaults, and spending analytics cleanly.',
      },
      {
        role: 'Primary Action & Trust (10%)',
        name: 'Electric Violet',
        hex: '#7C3AED',
        contrastOnDark: '5.3:1',
        psychology: 'Signals modern fintech innovation and unmistakable primary payment CTAs.',
      },
      {
        role: 'Growth & Positive Cashflow',
        name: 'Emerald Mint',
        hex: '#10B981',
        contrastOnDark: '8.4:1',
        psychology: 'Reinforces positive savings habits, verified deposits, and completed transfers.',
      },
      {
        role: 'Bill Reminder / Caution',
        name: 'Warm Amber',
        hex: '#F59E0B',
        contrastOnDark: '8.9:1',
        psychology: 'Alerts users to upcoming subscriptions without inducing panic.',
      },
    ],
    typography: {
      displayFont: 'Plus Jakarta Sans',
      bodyFont: 'DM Sans',
      monoFont: 'JetBrains Mono',
      scale: [
        {
          token: 'balance-hero (H1)',
          element: 'h1',
          mobileSize: '2.0rem (32px)',
          desktopSize: '2.5rem (40px)',
          lineHeight: '1.15',
          weight: '700 (Bold)',
          usage: 'Safe-to-Spend hero currency figure (`tabular-nums`).',
        },
        {
          token: 'section-header (H2)',
          element: 'h2',
          mobileSize: '1.125rem (18px)',
          desktopSize: '1.375rem (22px)',
          lineHeight: '1.3',
          weight: '600 (SemiBold)',
          usage: 'Savings Vaults, Recent Activity, and Cashflow Breakdown headers.',
        },
        {
          token: 'body-transaction',
          element: 'p',
          mobileSize: '0.875rem (14px)',
          desktopSize: '1.0rem (16px)',
          lineHeight: '1.5',
          weight: '400 (Regular)',
          usage: 'Merchant names, transfer notes, and plain-language fee explanations.',
        },
        {
          token: 'numeric-ledger',
          element: 'span.tabular-nums',
          mobileSize: '0.875rem (14px)',
          desktopSize: '0.9375rem (15px)',
          lineHeight: '1.4',
          weight: '600 (SemiBold)',
          usage: 'Aligned currency amounts, percentages, and account timestamps.',
        },
      ],
    },
    componentStates: [
      {
        state: 'Default',
        bgToken: 'color.brand.primary (#7C3AED)',
        textToken: 'color.text.onPrimary (#FFFFFF)',
        borderToken: 'color.border.transparent',
        fontToken: 'font.ui.label (14px / 600)',
        shadowOrRing: 'shadow-sm',
      },
      {
        state: 'Hover',
        bgToken: 'color.brand.primaryHover (#6D28D9)',
        textToken: 'color.text.onPrimary (#FFFFFF)',
        borderToken: 'color.border.purpleSubtle (#8B5CF6)',
        fontToken: 'font.ui.label (14px / 600)',
        shadowOrRing: 'transition-colors 150ms ease-out',
      },
      {
        state: 'Active / Clicked',
        bgToken: 'color.brand.primaryActive (#5B21B6)',
        textToken: 'color.text.onPrimary (#FFFFFF)',
        borderToken: 'color.border.purpleStrong (#A78BFA)',
        fontToken: 'font.ui.label (14px / 600)',
        shadowOrRing: 'scale-[0.98] transform',
      },
      {
        state: 'Focus (Keyboard)',
        bgToken: 'color.brand.primary (#7C3AED)',
        textToken: 'color.text.onPrimary (#FFFFFF)',
        borderToken: 'color.accent.emerald (#10B981)',
        fontToken: 'font.ui.label (14px / 600)',
        shadowOrRing: 'focus-visible:ring-2 ring-[#10B981] ring-offset-2 ring-offset-[#0F172A]',
      },
      {
        state: 'Disabled',
        bgToken: 'color.surface.disabled (#1E293B / 40% opacity)',
        textToken: 'color.text.muted (#64748B)',
        borderToken: 'color.border.slate800 (#1E293B)',
        fontToken: 'font.ui.label (14px / 500)',
        shadowOrRing: 'cursor-not-allowed opacity-40',
      },
    ],
    accessibility: [
      {
        title: 'Tabular Currency Alignment (`tabular-nums`)',
        standard: 'OpenType `tnum` feature enforced on all financial figures',
        implementation:
          'Prevents horizontal jitter during live balance updates and ensures decimal points align vertically in transaction lists.',
      },
      {
        title: 'Non-Hue-Only Semantic Transaction States',
        standard: 'WCAG 1.4.1 Use of Color',
        implementation:
          'Incoming credits pair Emerald Green (#10B981) with an explicit "+" prefix and "Received" label; outgoing debits use neutral Soft White (#E2E8F0) with a "-" prefix.',
      },
      {
        title: 'Thumb-Zone Primary Action Placement (Mobile 44x44px)',
        standard: 'WCAG 2.5.5 Target Size & 15% Sticky Cap',
        implementation:
          'Primary "Send / Split" actions sit within easy one-handed thumb reach with 48px height and generous 12px spacing between adjacent controls.',
      },
    ],
    microcopy: [
      {
        scenario: 'Empty Savings Vault State',
        headline: 'Your Emergency Vault is ready for its first ₹100.',
        body: 'Turn on automatic spare-change round-ups or move a small amount whenever you get paid. Withdraw anytime with zero lock-in fees.',
        cta: 'Start with ₹100',
      },
      {
        scenario: 'Insufficient Safe-to-Spend Balance Warning',
        headline: 'This transfer dips into your upcoming Rent buffer.',
        body: 'You have ₹1,450 in Safe-to-Spend and ₹12,000 reserved for Rent due on the 1st. Would you like to adjust the amount or unlock your buffer?',
        cta: 'Adjust Amount',
      },
    ],
  },
};

export const DesignSystemArchitectView: React.FC = () => {
  const [selectedPresetKey, setSelectedPresetKey] = useState<'samjha_ai' | 'fintech_young_adults'>(
    'samjha_ai'
  );
  const [interactiveButtonState, setInteractiveButtonState] = useState<
    'Default' | 'Hover' | 'Active / Clicked' | 'Focus (Keyboard)' | 'Disabled'
  >('Default');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const spec = PRESETS[selectedPresetKey];

  const handleCopyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Domain Preset Switcher */}
      <div className="border-b border-slate-800 pb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            UI/UX Specification & Design System Architect
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Interactive specification covering Target Persona, User Flows, Wireframe Grid Math, Color Psychology, Typography Scale, State Tokens, and Accessibility Microcopy.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-[#1E293B] border border-slate-800 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setSelectedPresetKey('samjha_ai')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedPresetKey === 'samjha_ai'
                ? 'bg-[#7C3AED] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Samjha AI Cognitive System
          </button>
          <button
            type="button"
            onClick={() => setSelectedPresetKey('fintech_young_adults')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedPresetKey === 'fintech_young_adults'
                ? 'bg-[#7C3AED] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Mobile Banking (Young Adults)
          </button>
        </div>
      </div>

      {/* SECTION 1: Target Audience & Core User Flows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="text-base font-semibold text-white">
              01. Primary User Persona & Core Pain Points
            </h2>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 space-y-2.5 text-xs">
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-400 shrink-0">Application:</span>
              <span className="font-semibold text-white text-right">{spec.appName}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-400 shrink-0">Primary Persona:</span>
              <span className="text-purple-300 font-medium text-right">{spec.persona.name}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-400 shrink-0">Demographics:</span>
              <span className="text-slate-200 text-right">
                {spec.persona.role} ({spec.persona.ageRange})
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-amber-400">Core User Pain Points</h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {spec.persona.painPoints.map((pt, i) => (
                <li key={i} className="bg-[#0F172A] border border-slate-800 rounded-lg p-2.5">
                  • {pt}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#10B981]">Target Outcomes & Goals</h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {spec.persona.goals.map((g, i) => (
                <li key={i} className="bg-[#0F172A] border border-slate-800 rounded-lg p-2.5">
                  • {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-[#10B981]" />
            <h2 className="text-base font-semibold text-white">
              02. Step-by-Step Core User Journey & Layout Wireframe Architecture
            </h2>
          </div>

          <div className="space-y-2.5">
            {spec.userFlow.map((flow, idx) => (
              <div
                key={idx}
                className="bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{flow.step}</span>
                  <span className="font-mono text-purple-300">{flow.screen}</span>
                </div>
                <p className="text-slate-300">
                  <strong className="text-slate-200">User Action:</strong> {flow.action}
                </p>
                <p className="text-[#10B981]">
                  <strong>System Outcome:</strong> {flow.outcome}
                </p>
              </div>
            ))}
          </div>

          {/* Spatial & Wireframe Grid Math Summary */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 space-y-2 text-xs">
            <h3 className="font-semibold text-white">
              Layout & Spatial Math Specification (1440px Desktop / 390px Mobile)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-300">
              <div>
                <strong className="text-slate-200">Top Bar Contract:</strong> 1-row, 3-zone header (`px-6 py-3.5`, `gap-8`, `border-b border-slate-800`).
              </div>
              <div>
                <strong className="text-slate-200">Workspace Grid:</strong> `280px` Left Sidebar + `12-column` fluid main canvas (`gap-6` / `24px`).
              </div>
              <div>
                <strong className="text-slate-200">Container Math:</strong> Outer padding (`20px–24px`) &ge; inner child gap (`12px–16px`).
              </div>
              <div>
                <strong className="text-slate-200">Nested Border Radius:</strong> Outer card `r = 16px` (`rounded-2xl`), inner element `r = 8px–12px`.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Color Palette & Psychology */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#F59E0B]" />
            <h2 className="text-base font-semibold text-white">
              03. Color Palette & Psychological Architecture (60-30-10 Rule)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Click any swatch to copy Hex token</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {spec.colors.map((c) => (
            <button
              key={c.hex + c.name}
              type="button"
              onClick={() => handleCopyHex(c.hex)}
              className="text-left bg-[#0F172A] border border-slate-800 hover:border-slate-600 rounded-xl p-3.5 space-y-2.5 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className="w-10 h-10 rounded-lg border border-white/15 shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-white">
                    {copiedHex === c.hex ? 'COPIED!' : c.hex}
                  </div>
                  <div className="text-[11px] font-mono text-[#10B981]">{c.contrastOnDark}</div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{c.name}</div>
                <div className="text-[11px] text-purple-300 font-mono">{c.role}</div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{c.psychology}</p>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 4: Typography & Font System */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-[#EC4899]" />
            <h2 className="text-base font-semibold text-white">
              04. Typography & 2+1 Font System Scale
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-300">
            Display: {spec.typography.displayFont} · Body: {spec.typography.bodyFont} · Mono:{' '}
            {spec.typography.monoFont}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 pr-4">Token / Role</th>
                <th className="py-2.5 pr-4">Element</th>
                <th className="py-2.5 pr-4">Mobile Size</th>
                <th className="py-2.5 pr-4">Desktop Size</th>
                <th className="py-2.5 pr-4">Line Height</th>
                <th className="py-2.5 pr-4">Weight</th>
                <th className="py-2.5">Domain Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 tabular-nums">
              {spec.typography.scale.map((row) => (
                <tr key={row.token} className="hover:bg-slate-800/30">
                  <td className="py-2.5 pr-4 font-mono font-semibold text-white">{row.token}</td>
                  <td className="py-2.5 pr-4 font-mono text-purple-300">&lt;{row.element}&gt;</td>
                  <td className="py-2.5 pr-4 font-mono text-slate-200">{row.mobileSize}</td>
                  <td className="py-2.5 pr-4 font-mono text-slate-200">{row.desktopSize}</td>
                  <td className="py-2.5 pr-4 font-mono text-slate-300">{row.lineHeight}</td>
                  <td className="py-2.5 pr-4 text-slate-300">{row.weight}</td>
                  <td className="py-2.5 text-slate-400">{row.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 5: Design System Tokens (Tabular Format + Interactive State Previewer) */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="text-base font-semibold text-white">
              05. Design System Component State Tokens & Live Preview
            </h2>
          </div>

          {/* Interactive State Simulator */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Simulate State:</span>
            {spec.componentStates.map((st) => (
              <button
                key={st.state}
                type="button"
                onClick={() => setInteractiveButtonState(st.state)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  interactiveButtonState === st.state
                    ? 'bg-[#7C3AED] border-[#7C3AED] text-white font-semibold'
                    : 'bg-[#0F172A] border-slate-700 text-slate-300'
                }`}
              >
                {st.state}
              </button>
            ))}
          </div>
        </div>

        {/* Live Simulated Button Preview Bar */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs space-y-0.5">
            <div className="text-white font-semibold">
              Live Specimen Preview — State: {interactiveButtonState}
            </div>
            <div className="text-slate-400 font-mono">
              {
                spec.componentStates.find((s) => s.state === interactiveButtonState)?.bgToken
              }{' '}
              ·{' '}
              {
                spec.componentStates.find((s) => s.state === interactiveButtonState)?.shadowOrRing
              }
            </div>
          </div>

          <button
            type="button"
            disabled={interactiveButtonState === 'Disabled'}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              interactiveButtonState === 'Default'
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : interactiveButtonState === 'Hover'
                ? 'bg-[#6D28D9] text-white border border-[#8B5CF6] shadow'
                : interactiveButtonState === 'Active / Clicked'
                ? 'bg-[#5B21B6] text-white border border-[#A78BFA] scale-95'
                : interactiveButtonState === 'Focus (Keyboard)'
                ? 'bg-[#7C3AED] text-white ring-2 ring-[#10B981] ring-offset-2 ring-offset-[#0F172A]'
                : 'bg-[#1E293B] text-slate-500 border border-slate-800 opacity-40 cursor-not-allowed'
            }`}
          >
            Primary Action CTA ({interactiveButtonState})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 pr-4">Component State</th>
                <th className="py-2.5 pr-4">Background Token</th>
                <th className="py-2.5 pr-4">Text Color Token</th>
                <th className="py-2.5 pr-4">Border Token</th>
                <th className="py-2.5 pr-4">Font Token</th>
                <th className="py-2.5">Interaction / Focus Ring</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {spec.componentStates.map((row) => (
                <tr key={row.state} className="hover:bg-slate-800/30">
                  <td className="py-2.5 pr-4 font-sans font-semibold text-white">{row.state}</td>
                  <td className="py-2.5 pr-4 text-purple-300">{row.bgToken}</td>
                  <td className="py-2.5 pr-4 text-slate-200">{row.textToken}</td>
                  <td className="py-2.5 pr-4 text-slate-300">{row.borderToken}</td>
                  <td className="py-2.5 pr-4 text-amber-300">{row.fontToken}</td>
                  <td className="py-2.5 text-[#10B981]">{row.shadowOrRing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 6: Accessibility & Microcopy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <h2 className="text-base font-semibold text-white">
              06A. Key Accessibility Enhancements (WCAG 2.2 AA/AAA)
            </h2>
          </div>
          <div className="space-y-3">
            {spec.accessibility.map((item, i) => (
              <div
                key={i}
                className="bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 space-y-1 text-xs"
              >
                <div className="font-semibold text-white">
                  {i + 1}. {item.title}
                </div>
                <div className="font-mono text-[#10B981] text-[11px]">{item.standard}</div>
                <p className="text-slate-300 leading-relaxed">{item.implementation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <h2 className="text-base font-semibold text-white">
              06B. Supportive Empty-State & Error Microcopy Library
            </h2>
          </div>
          <div className="space-y-3">
            {spec.microcopy.map((mc, i) => (
              <div
                key={i}
                className="bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-purple-300">{mc.scenario}</span>
                  <span className="text-amber-400 font-medium">CTA: &ldquo;{mc.cta}&rdquo;</span>
                </div>
                <p className="text-white font-semibold">{mc.headline}</p>
                <p className="text-slate-300 leading-relaxed">{mc.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
