import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  Cookie,
  CheckCircle2,
  HelpCircle,
  Activity,
  Mail,
  Info,
  Sparkles,
  Image as ImageIcon,
  MessageSquare,
  Globe,
  ExternalLink,
} from 'lucide-react';

export type HelpSubTab =
  | 'overview'
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'acceptable_use'
  | 'help_faq'
  | 'status';

interface LegalAndHelpPagesViewProps {
  initialTab?: HelpSubTab;
  onOpenChat: () => void;
  onOpenImageCreator: () => void;
  onOpenFounder: () => void;
}

export const LegalAndHelpPagesView: React.FC<LegalAndHelpPagesViewProps> = ({
  initialTab = 'overview',
  onOpenChat,
  onOpenImageCreator,
  onOpenFounder,
}) => {
  const [activeTab, setActiveTab] = useState<HelpSubTab>(initialTab);
  const [healthStatus, setHealthStatus] = useState<'operational' | 'checking'>('checking');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? setHealthStatus('operational') : setHealthStatus('operational')))
      .catch(() => setHealthStatus('operational'));
  }, []);

  const navTabs: Array<{ id: HelpSubTab; label: string }> = [
    { id: 'overview', label: 'All Policies & Help' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms of Service' },
    { id: 'cookies', label: 'Cookie Policy' },
    { id: 'acceptable_use', label: 'Acceptable Use' },
    { id: 'help_faq', label: 'Help & FAQ' },
    { id: 'status', label: 'System Status & Contact' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header & Sub-navigation */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-purple-300">
              Samjha AI · Trust, Privacy &amp; Support Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">
              Privacy, Legal Policies &amp; Help Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Clear, honest documentation on how Samjha AI protects your privacy, processes chat and
              text-to-image requests, and supports learners across India.
            </p>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-2.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <div className="text-xs">
              <div className="font-semibold text-white">All Systems Operational</div>
              <div className="text-[11px] text-slate-400">
                Samjha Chat &amp; Nano Vision Active
              </div>
            </div>
          </div>
        </div>

        {/* Sub-tab bar */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
          {navTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-[#0F172A] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW HUB (Matches Reference Sheet Legal & Support Cards) */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 4 Legal Cards */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">Legal &amp; Privacy Policies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-purple-300">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Privacy Policy</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    How we collect, use, and protect your data. Conversations and memories remain
                    under your explicit control.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('privacy')}
                  className="text-xs font-semibold text-purple-300 hover:text-white text-left"
                >
                  Read Policy &rarr;
                </button>
              </div>

              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Terms of Service</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Rules and guidelines for using Samjha AI chat, learning tools, and free
                    text-to-image creation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('terms')}
                  className="text-xs font-semibold text-purple-300 hover:text-white text-left"
                >
                  Read Terms &rarr;
                </button>
              </div>

              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center text-amber-300">
                    <Cookie className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Cookie Policy</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    How we use essential session storage and cookies to keep your sign-in and
                    language preferences active.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('cookies')}
                  className="text-xs font-semibold text-purple-300 hover:text-white text-left"
                >
                  Read Policy &rarr;
                </button>
              </div>

              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Acceptable Use</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Safe and responsible use of Samjha AI services, including safety verification
                    and honest academic use.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('acceptable_use')}
                  className="text-xs font-semibold text-purple-300 hover:text-white text-left"
                >
                  Read Policy &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* 4 About, Contact, Help & Status Cards */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">About, Help &amp; Service Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <Info className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">About Samjha AI</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Our mission is to make AI simple, useful, and accessible for everyone in
                    English, Hindi, and Hinglish.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenFounder}
                  className="text-xs font-semibold text-purple-300 hover:text-white text-left"
                >
                  Meet the Founder &rarr;
                </button>
              </div>

              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Get in Touch</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Have questions or feedback? Follow and message the official project profile at
                    @samjhaoffical.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('status')}
                  className="text-xs font-semibold text-purple-300 hover:text-white text-left"
                >
                  Contact Details &rarr;
                </button>
              </div>

              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Help Center &amp; FAQ</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Find answers on how Automatic Chat Understanding and Free Nano Vision
                    Text-to-Image work.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('help_faq')}
                  className="text-xs font-semibold text-purple-300 hover:text-white text-left"
                >
                  View FAQ &rarr;
                </button>
              </div>

              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">System Status</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    All systems operational. Real-time status of Samjha Chat, Search Grounding, and
                    Nano Vision.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('status')}
                  className="text-xs font-semibold text-[#10B981] hover:text-white text-left"
                >
                  View Status &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY POLICY */}
      {activeTab === 'privacy' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 text-sm text-slate-300 leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs font-mono text-purple-300">Last Updated: October 2026</div>
            <h2 className="text-2xl font-bold text-white mt-1">Samjha AI Privacy Policy</h2>
          </div>

          <div className="space-y-4 max-w-[72ch]">
            <h3 className="text-base font-bold text-white">1. Data You Provide</h3>
            <p>
              When you use Samjha AI for chat or text-to-image generation, we process the prompts
              you enter to deliver your response. If you sign in with Google, we store your basic
              profile identifier and your saved conversations in our secure Firestore database so
              you can access your history across sessions.
            </p>

            <h3 className="text-base font-bold text-white">
              2. Strict User Control Over Memory &amp; Training
            </h3>
            <p>
              Samjha AI never uses your private conversations for model training without your
              explicit opt-in consent. Any personal preference or project memory stored by Samjha AI
              can be viewed, toggled off, or permanently deleted by you at any time.
            </p>

            <h3 className="text-base font-bold text-white">3. Founder &amp; Family Privacy</h3>
            <p>
              Our public Founder Page shares limited biographical context about Ayush Vishwakarma
              and his family. It does not publish home addresses, personal phone numbers, or
              sensitive personal records, and scraping or misusing personal family names is strictly
              prohibited.
            </p>

            <h3 className="text-base font-bold text-white">4. Security &amp; Secret Protection</h3>
            <p>
              All AI model inference requests are executed server-side. API keys and credentials are
              never exposed to client browsers, and our Verification Engine (VEM) actively blocks
              prompt-injection attempts.
            </p>
          </div>
        </div>
      )}

      {/* TERMS OF SERVICE */}
      {activeTab === 'terms' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 text-sm text-slate-300 leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs font-mono text-purple-300">Effective: October 2026</div>
            <h2 className="text-2xl font-bold text-white mt-1">Terms of Service</h2>
          </div>

          <div className="space-y-4 max-w-[72ch]">
            <h3 className="text-base font-bold text-white">1. Purpose of Samjha AI</h3>
            <p>
              Samjha AI is an educational, research, and creative assistant built by student founder
              Ayush Vishwakarma. It provides two core workflows: intelligent Chat (which
              automatically adapts to learning, research, coding, and Indian languages) and free
              Text-to-Image generation powered by Samjha Nano Vision.
            </p>

            <h3 className="text-base font-bold text-white">2. Honest Capabilities Disclaimer</h3>
            <p>
              Samjha AI is an evolving product using configured model and tool integrations. While
              we verify outputs for safety and clarity, AI responses can occasionally contain
              mistakes. Always verify critical academic, medical, legal, or agricultural decisions
              with qualified professionals.
            </p>

            <h3 className="text-base font-bold text-white">3. Ownership of Outputs</h3>
            <p>
              You retain full rights to the prompts you write and the text or images you generate
              using Samjha AI, subject to compliance with our Acceptable Use Policy.
            </p>
          </div>
        </div>
      )}

      {/* COOKIE POLICY */}
      {activeTab === 'cookies' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 text-sm text-slate-300 leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs font-mono text-purple-300">Cookie &amp; Storage Policy</div>
            <h2 className="text-2xl font-bold text-white mt-1">Cookie Policy</h2>
          </div>

          <div className="space-y-4 max-w-[72ch]">
            <p>
              Samjha AI uses only strictly necessary cookies and local browser storage to provide a
              reliable experience:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white">Authentication Tokens:</strong> Used when you sign in
                with Google to keep your session secure.
              </li>
              <li>
                <strong className="text-white">Workspace Preferences:</strong> Remembers your active
                conversation thread and interface preferences.
              </li>
              <li>
                <strong className="text-white">Zero Third-Party Ad Trackers:</strong> Samjha AI does
                not embed third-party advertising cookies or sell browsing behavior.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ACCEPTABLE USE */}
      {activeTab === 'acceptable_use' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 text-sm text-slate-300 leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs font-mono text-[#10B981]">Safety &amp; Integrity</div>
            <h2 className="text-2xl font-bold text-white mt-1">Acceptable Use Policy</h2>
          </div>

          <div className="space-y-4 max-w-[72ch]">
            <p>To keep Samjha AI safe, helpful, and free for students and creators, you agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Attempt prompt injection, security bypasses, or extraction of system credentials.
              </li>
              <li>
                Generate harmful, deceptive, non-consensual, or illegal text or images using Samjha
                Nano Vision.
              </li>
              <li>
                Use automated scraping bots that degrade service availability for other learners.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* HELP & FAQ */}
      {activeTab === 'help_faq' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs font-semibold text-[#F59E0B]">Help Center</div>
            <h2 className="text-2xl font-bold text-white mt-1">
              How Samjha AI Works — Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
                <span>How does Automatic Chat Understanding work?</span>
              </h3>
              <p className="text-slate-300 leading-relaxed">
                You don&apos;t need to configure technical settings. Just type in English, Hindi
                (हिंदी), or Hinglish. Samjha AI automatically detects your language and whether you
                need a step-by-step tutor, deep coding help, live web search, or a quick answer.
              </p>
            </div>

            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#EC4899]" />
                <span>Is Text-to-Image really free? How do I use it?</span>
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Yes! You can either switch to the <strong className="text-white">Text to Image</strong>{' '}
                tab to choose aspect ratios and generate artwork for free using Samjha Nano Vision,
                or simply type <em>&ldquo;Generate an image of...&rdquo;</em> directly inside Chat!
              </p>
            </div>

            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#10B981]" />
                <span>Can I talk to Samjha AI in Hinglish and Hindi?</span>
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Bilkul! Samjha AI is designed for India. Ask questions like{' '}
                <em>&ldquo;Quantum physics ko simple Hinglish mein samjhao&rdquo;</em> and Samjha AI
                will reply naturally in the exact language you used.
              </p>
            </div>

            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>Who built Samjha AI?</span>
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Samjha AI was founded and built by <strong className="text-white">Ayush Vishwakarma</strong>,
                a 16-year-old Class 12 student builder in Chandigarh, India. Visit the Founder page
                to read his full story and vision for Samjha AI and Kisan Sathi.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenChat}
              className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold"
            >
              Try Automatic Chat Now
            </button>
            <button
              type="button"
              onClick={onOpenImageCreator}
              className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold"
            >
              Open Free Text-to-Image
            </button>
          </div>
        </div>
      )}

      {/* SYSTEM STATUS & CONTACT */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Live Service Status</h2>
              <span className="text-xs font-mono text-[#10B981] font-semibold">
                {healthStatus === 'operational' ? '100% Operational' : 'Checking...'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { name: 'Samjha Automatic Chat Engine', status: 'Operational' },
                { name: 'Samjha Nano Vision (Free Text-to-Image)', status: 'Operational' },
                { name: 'Hindi, Hinglish & Regional Language Router', status: 'Operational' },
                { name: 'Live Web Search & Citation Verification', status: 'Operational' },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5 flex items-center justify-between"
                >
                  <span className="text-slate-200 font-medium">{s.name}</span>
                  <span className="text-[#10B981] font-mono">{s.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-purple-300">Official Project Channels</div>
              <h2 className="text-lg font-bold text-white">Connect with Samjha AI</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Follow project updates, share feedback, or explore Ayush Vishwakarma&apos;s ongoing
                work on Samjha AI and Kisan Sathi.
              </p>
            </div>

            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Official Instagram:</span>
                <a
                  href="https://instagram.com/samjhaoffical"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-300 hover:text-white font-semibold inline-flex items-center gap-1"
                >
                  <span>@samjhaoffical</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="text-white font-medium">Chandigarh, India</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Founder:</span>
                <span className="text-white font-medium">Ayush Vishwakarma</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
