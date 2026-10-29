/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Image as ImageIcon,
  Send,
  Plus,
  Search,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Menu,
  X,
  ExternalLink,
  User as UserIcon,
  Shield,
  Download,
  Wand2,
  Trash2,
  LogIn,
  UserPlus,
  LogOut,
  Check,
  Code2,
  BookOpen,
  Globe,
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import {
  db,
  initAuth,
  logout,
  handleFirestoreError,
  OperationType,
  upsertConversationDocument,
} from './firebase';
import {
  SamjhaMode,
  SupportedLanguage,
  MemoryRecord,
  autoDetectLanguageAndIntent,
} from './core/samjhaEngine';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_MEMORIES,
  INITIAL_PROMPT_VERSIONS,
  ConversationThread,
  ChatTurnMessage,
} from './data/samjhaInventoryData';
import { FreeImageGeneratorView } from './components/FreeImageGeneratorView';
import { FounderPageView } from './components/FounderPageView';
import { LegalAndHelpPagesView, HelpSubTab } from './components/LegalAndHelpPagesView';
import { AuthModal, AuthModalMode } from './components/AuthModal';

type ActiveSection = 'chat' | 'image_studio' | 'founder' | 'privacy_help';

type ComposerOption = 'auto_chat' | 'free_image';

const QUICK_STARTER_PROMPTS = [
  {
    label: 'Explain quantum computing in Hinglish',
    isImg: false,
  },
  {
    label: 'Create an image of a futuristic Indian city',
    isImg: true,
  },
  {
    label: 'सौर ऊर्जा और आधुनिक खेती के लाभ',
    isImg: false,
  },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('chat');
  const [helpSubTab, setHelpSubTab] = useState<HelpSubTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 2 Core Options in Composer: 1. Smart Chat (Auto-Understand) | 2. Free Text-to-Image
  const [composerOption, setComposerOption] = useState<ComposerOption>('auto_chat');

  // Firebase Auth & Modal State
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');

  // Conversations & Memory state
  const [conversations, setConversations] = useState<ConversationThread[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [memories] = useState<MemoryRecord[]>(INITIAL_MEMORIES);
  const activePromptVersion = INITIAL_PROMPT_VERSIONS[0];

  // Chat Composer state
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Live preview of what Samjha AI automatically understands as the user types
  const liveAutoDetection = inputMessage.trim()
    ? autoDetectLanguageAndIntent(inputMessage)
    : null;

  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser) => {
        setUser(authedUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Auto-scroll chat thread when a new message is added or generation starts
  useEffect(() => {
    if (
      activeSection === 'chat' &&
      (isGenerating || (activeConversation?.messages.length || 0) > 2)
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [activeConversation?.messages.length, isGenerating, activeSection]);

  // Sync Firestore conversations when user is signed in
  useEffect(() => {
    if (!user) return;

    const convQuery = query(
      collection(db, 'conversations'),
      where('ownerId', '==', user.uid)
    );
    const unsubConv = onSnapshot(
      convQuery,
      (snapshot) => {
        if (snapshot.empty) return;
        const loaded: ConversationThread[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          loaded.push({
            id: docSnap.id,
            title: d.title || 'Conversation',
            mode: (d.mode as SamjhaMode) || 'standard',
            language: (d.language as SupportedLanguage) || 'Hinglish',
            modelId: 'Samjha Core',
            updatedAtLabel: 'Synced',
            messages: INITIAL_CONVERSATIONS[0].messages,
          });
        });
        if (loaded.length > 0) {
          setConversations((prev) => {
            const existingMap = new Map(prev.map((c) => [c.id, c]));
            for (const item of loaded) {
              const local = existingMap.get(item.id);
              existingMap.set(item.id, local ? { ...item, messages: local.messages } : item);
            }
            return Array.from(existingMap.values());
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'conversations');
      }
    );

    return () => unsubConv();
  }, [user]);

  const openAuthModal = (mode: AuthModalMode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
  };

  const handleStartNewChat = () => {
    const newId = `conv_${Date.now().toString(36)}`;
    const newThread: ConversationThread = {
      id: newId,
      title: 'New Conversation',
      mode: 'standard',
      language: 'Hinglish',
      modelId: 'Samjha Core',
      updatedAtLabel: 'Just now',
      messages: [],
    };
    setConversations((prev) => [newThread, ...prev]);
    setActiveConvId(newId);
    setActiveSection('chat');
    setChatError(null);
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length <= 1) {
      // Clear messages if it's the only conversation
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title: 'New Conversation', messages: [] } : c))
      );
      return;
    }
    const remaining = conversations.filter((c) => c.id !== convId);
    setConversations(remaining);
    if (activeConvId === convId) {
      setActiveConvId(remaining[0].id);
    }
    if (user) {
      try {
        const safeId = convId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
        await deleteDoc(doc(db, 'conversations', safeId));
      } catch {
        // Ignore if not yet persisted in Firestore
      }
    }
  };

  const handleSendMessage = async (customPrompt?: string, forceImage?: boolean) => {
    const promptToSend = (customPrompt ?? inputMessage).trim();
    if (!promptToSend || isGenerating) return;

    const shouldGenerateImage = forceImage ?? composerOption === 'free_image';

    setChatError(null);
    if (!customPrompt) {
      setInputMessage('');
    }

    const userMsg: ChatTurnMessage = {
      id: `msg_u_${Date.now().toString(36)}`,
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...(activeConversation?.messages || []), userMsg];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              title: c.messages.length === 0 ? promptToSend.slice(0, 48) : c.title,
              updatedAtLabel: 'Just now',
              messages: updatedHistory,
            }
          : c
      )
    );

    setIsGenerating(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          history: updatedHistory.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          autoUnderstand: true,
          forceImageGeneration: shouldGenerateImage,
          memories,
          promptTemplate: activePromptVersion.systemPromptTemplate,
          promptVersionId: activePromptVersion.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      const assistantMsg: ChatTurnMessage = {
        id: `msg_a_${Date.now().toString(36)}`,
        role: 'assistant',
        content: data.text,
        imageUrl: data.imageUrl || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || 'Samjha Core',
        detectedIntent: data.detectedIntent || 'Automatic Understanding',
        groundingUrls: data.groundingUrls || [],
        verificationPassed: true,
        verificationScore: 100,
        latencyMs: data.scemTrace?.lpmMetrics?.totalLatencyMs ?? 360,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                modelId: data.modelUsed || 'Samjha Core',
                messages: [...updatedHistory, assistantMsg],
              }
            : c
        )
      );

      if (user) {
        await upsertConversationDocument({
          conversationId: activeConversation.id,
          ownerUid: user.uid,
          title: promptToSend.slice(0, 180) || 'Session',
          mode: 'standard',
          language: data.detectedLanguage || 'Hinglish',
          modelId: 'Samjha Core',
          messageCount: updatedHistory.length + 1,
          lastMessagePreview: (data.text || '').slice(0, 480),
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setChatError(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRateMessage = (msg: ChatTurnMessage, ratingValue: number) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msg.id ? { ...m, feedbackRating: ratingValue } : m
              ),
            }
          : c
      )
    );
  };

  const handleCopyMessage = (msg: ChatTurnMessage) => {
    navigator.clipboard?.writeText(msg.content);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 1800);
  };

  const openLegalTab = (tab: HelpSubTab) => {
    setHelpSubTab(tab);
    setActiveSection('privacy_help');
    setMobileSidebarOpen(false);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-[#0F172A] text-[#E2E8F0] flex flex-col overflow-hidden">
      {/* FIREBASE LOGIN & SIGN-UP MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(authedUser) => setUser(authedUser)}
      />

      {/* STRICT 3-ZONE TOP BAR CONTRACT — PURE SAMJHA AI BRANDING */}
      <header className="flex items-center justify-between gap-8 px-6 py-3 bg-[#0F172A] border-b border-slate-800/90 shrink-0 z-30">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('chat');
          }}
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Samjha AI
        </a>

        {/* Zone 2: 4 Clean Single-Line Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300"
        >
          <button
            type="button"
            onClick={() => setActiveSection('chat')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'chat'
                ? 'border-[#7C3AED] text-white'
                : 'border-transparent text-slate-400'
            }`}
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('image_studio')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'image_studio'
                ? 'border-[#7C3AED] text-white'
                : 'border-transparent text-slate-400'
            }`}
          >
            Text to Image
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('founder')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'founder'
                ? 'border-[#7C3AED] text-white'
                : 'border-transparent text-slate-400'
            }`}
          >
            Founder
          </button>
          <button
            type="button"
            onClick={() => openLegalTab('overview')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'privacy_help'
                ? 'border-[#7C3AED] text-white'
                : 'border-transparent text-slate-400'
            }`}
          >
            Privacy &amp; Help
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-[#1E293B] hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-purple-300" />
              <span>Sign Out ({user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'User'})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Log In / Sign Up
            </button>
          )}
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-[#1E293B] border-b border-slate-800 text-xs shrink-0">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen((o) => !o)}
          className="flex items-center gap-1.5 text-slate-200 font-medium py-1"
        >
          {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Menu</span>
        </button>
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection('chat')}
            className={`px-2.5 py-1 rounded ${
              activeSection === 'chat' ? 'bg-[#7C3AED] text-white' : 'text-slate-300'
            }`}
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('image_studio')}
            className={`px-2.5 py-1 rounded ${
              activeSection === 'image_studio' ? 'bg-[#7C3AED] text-white' : 'text-slate-300'
            }`}
          >
            Text to Image
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('founder')}
            className={`px-2.5 py-1 rounded ${
              activeSection === 'founder' ? 'bg-[#7C3AED] text-white' : 'text-slate-300'
            }`}
          >
            Founder
          </button>
          <button
            type="button"
            onClick={() => openLegalTab('overview')}
            className={`px-2.5 py-1 rounded ${
              activeSection === 'privacy_help' ? 'bg-[#7C3AED] text-white' : 'text-slate-300'
            }`}
          >
            Help
          </button>
        </div>
      </div>

      {/* Main Application Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* STREAMLINED LEFT SIDEBAR */}
        <aside
          aria-label="Workspace Sidebar"
          className={`${
            mobileSidebarOpen ? 'flex fixed inset-y-0 left-0 z-40 w-72' : 'hidden'
          } md:flex md:static md:w-64 lg:w-72 bg-[#0F172A] border-r border-slate-800/90 flex-col justify-between p-4 shrink-0 overflow-y-auto`}
        >
          <div className="space-y-4">
            {/* + New Chat CTA */}
            <button
              type="button"
              onClick={handleStartNewChat}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#F59E0B] hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> New Chat
            </button>

            {/* 2 Core Workspace Options + Founder & Privacy/Help */}
            <div className="space-y-1">
              <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Core Workspace
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveSection('chat');
                  setComposerOption('auto_chat');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeSection === 'chat' && composerOption === 'auto_chat'
                    ? 'bg-[#7C3AED]/20 text-white border border-[#7C3AED]/50'
                    : 'text-slate-300 hover:bg-[#1E293B]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
                  <span>Smart Chat</span>
                </span>
                <span className="text-[10px] text-purple-300 font-mono">Auto</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSection('image_studio');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeSection === 'image_studio'
                    ? 'bg-[#7C3AED]/20 text-white border border-[#7C3AED]/50'
                    : 'text-slate-300 hover:bg-[#1E293B]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-[#EC4899]" />
                  <span>Text to Image</span>
                </span>
                <span className="text-[10px] text-[#10B981] font-mono">Free</span>
              </button>

              <div className="px-2 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                About &amp; Policies
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveSection('founder');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeSection === 'founder'
                    ? 'bg-[#7C3AED]/20 text-white border border-[#7C3AED]/50'
                    : 'text-slate-300 hover:bg-[#1E293B]'
                }`}
              >
                <UserIcon className="w-4 h-4 text-[#F59E0B]" />
                <span>Founder · Ayush Vishwakarma</span>
              </button>

              <button
                type="button"
                onClick={() => openLegalTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeSection === 'privacy_help'
                    ? 'bg-[#7C3AED]/20 text-white border border-[#7C3AED]/50'
                    : 'text-slate-300 hover:bg-[#1E293B]'
                }`}
              >
                <Shield className="w-4 h-4 text-[#10B981]" />
                <span>Privacy, Legal &amp; Help</span>
              </button>
            </div>

            {/* Search & Recent Chats */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  aria-label="Search conversations"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats, topics..."
                  className="w-full bg-[#1E293B] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="font-medium">Recent Chats</span>
                <span className="font-mono tabular-nums">{filteredConversations.length}</span>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setActiveSection('chat');
                      setMobileSidebarOpen(false);
                    }}
                    className={`group w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      activeConvId === conv.id && activeSection === 'chat'
                        ? 'bg-[#1E293B] text-white font-medium border border-slate-700'
                        : 'text-slate-400 hover:bg-[#1E293B]/60 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{conv.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 group-hover:hidden">
                        {conv.updatedAtLabel}
                      </span>
                      <button
                        type="button"
                        aria-label="Delete conversation"
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="hidden group-hover:inline-flex text-slate-400 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Account & Founder Card in Sidebar Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2.5">
            {user ? (
              <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#7C3AED] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[11px] text-emerald-400 truncate">Synced with Firebase</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                  className="text-slate-400 hover:text-white p-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="py-2 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-purple-300" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="py-2 px-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveSection('founder')}
              className="w-full text-left bg-[#1E293B]/60 hover:bg-[#1E293B] border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between transition-colors"
            >
              <span className="text-[11px] text-slate-300 truncate">
                Founder: <strong className="text-white">Ayush Vishwakarma</strong>
              </span>
              <span className="text-purple-300 text-[11px] font-semibold shrink-0">&rarr;</span>
            </button>
          </div>
        </aside>

        {/* CENTER MAIN VIEWPORT */}
        {activeSection === 'chat' ? (
          /* DEDICATED FULL-HEIGHT FLUID CHAT INTERFACE */
          <main className="flex-1 flex flex-col bg-[#0F172A] overflow-hidden">
            {/* 1. Chat Session Top Header Bar */}
            <div className="px-4 sm:px-6 py-3 bg-[#0F172A] border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white font-display font-bold text-sm shrink-0">
                  S
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-sm sm:text-base font-bold text-white truncate">
                    {activeConversation.title}
                  </h1>
                  <p className="text-[11px] text-slate-400 truncate">
                    Automatic Understanding · English · हिंदी · Hinglish
                  </p>
                </div>
              </div>

              {/* 2-Option Segmented Mode Switcher in Chat Header */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setComposerOption('auto_chat')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      composerOption === 'auto_chat'
                        ? 'bg-[#7C3AED] text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Smart Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerOption('free_image')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      composerOption === 'free_image'
                        ? 'bg-[#EC4899] text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Text to Image (Free)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Scrollable Conversation Message Stream */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
              <div className="max-w-3xl mx-auto space-y-5">
                {/* Compact Welcome Capabilities Strip when starting or in welcome thread */}
                {activeConversation.messages.length <= 2 && (
                  <div className="bg-gradient-to-br from-[#1E293B] via-[#1E293B] to-[#7C3AED]/15 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
                          One AI Assistant For Everything
                        </span>
                        <h2 className="font-display text-lg sm:text-xl font-bold text-white mt-0.5">
                          Good Evening
                          {user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}! How can
                          I help you today?
                        </h2>
                      </div>
                      <span className="text-xs text-[#10B981] font-medium">
                        Auto Language &amp; Task Detection Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      <div className="bg-[#0F172A]/90 border border-slate-800 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                          <span>Learn &amp; Study</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Step-by-step tutor explanations
                        </p>
                      </div>
                      <div className="bg-[#0F172A]/90 border border-slate-800 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                          <Code2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Code &amp; Build</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Write, debug, and explain code
                        </p>
                      </div>
                      <div className="bg-[#0F172A]/90 border border-slate-800 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                          <Globe className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Hindi &amp; Hinglish</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Natural Indian language fluency
                        </p>
                      </div>
                      <div className="bg-[#0F172A]/90 border border-slate-800 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                          <Wand2 className="w-3.5 h-3.5 text-[#EC4899]" />
                          <span>Free Text-to-Image</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Powered by Samjha Nano Vision
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages List */}
                {activeConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3.5 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Assistant Avatar */}
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white font-display font-bold text-xs shrink-0 mt-1 shadow-sm">
                        S
                      </div>
                    )}

                    <div
                      className={`max-w-2xl rounded-2xl px-4 py-3.5 space-y-2.5 ${
                        msg.role === 'user'
                          ? 'bg-[#7C3AED] text-white'
                          : 'bg-[#1E293B] border border-slate-800 text-[#E2E8F0]'
                      }`}
                    >
                      {/* Unboxed Metadata Line */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] opacity-85">
                        <span className="font-semibold text-white">
                          {msg.role === 'user'
                            ? user?.displayName?.split(' ')[0] || 'You'
                            : 'Samjha AI'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{msg.timestamp}</span>
                        {msg.modelUsed && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-purple-300">{msg.modelUsed}</span>
                          </>
                        )}
                        {msg.detectedIntent && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#10B981] font-medium">{msg.detectedIntent}</span>
                          </>
                        )}
                      </div>

                      {/* Generated Image (if created via Samjha Nano Vision) */}
                      {msg.imageUrl && (
                        <div className="space-y-2 pt-1">
                          <div className="bg-[#0F172A] border border-slate-700 rounded-xl overflow-hidden p-2">
                            <img
                              src={msg.imageUrl}
                              alt={msg.content}
                              className="max-h-80 w-auto rounded-lg mx-auto object-contain"
                            />
                          </div>
                          <div className="flex justify-end">
                            <a
                              href={msg.imageUrl}
                              download={`samjha-ai-${msg.id}.png`}
                              className="text-xs font-semibold text-purple-300 hover:text-white inline-flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Image</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Formatted Message Prose with Clean Bilingual Line-Height */}
                      <div className="text-sm sm:text-[15px] whitespace-pre-wrap leading-[1.68]">
                        {msg.content
                          .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
                          .map((part, idx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return (
                                <strong key={idx} className="font-semibold text-white">
                                  {part.slice(2, -2)}
                                </strong>
                              );
                            }
                            if (part.startsWith('`') && part.endsWith('`')) {
                              return (
                                <code
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-[#0F172A] text-purple-300 rounded font-mono text-xs"
                                >
                                  {part.slice(1, -1)}
                                </code>
                              );
                            }
                            return <React.Fragment key={idx}>{part}</React.Fragment>;
                          })}
                      </div>

                      {/* Web Search Grounding Citations */}
                      {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                        <div className="pt-2 border-t border-slate-700/80 space-y-1">
                          <p className="text-[11px] font-semibold text-[#10B981]">
                            Verified Web Sources:
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {msg.groundingUrls.map((u, idx) => (
                              <a
                                key={idx}
                                href={u.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-purple-300 hover:text-white underline inline-flex items-center gap-1"
                              >
                                <span>
                                  [{idx + 1}] {u.title}
                                </span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assistant Message Actions */}
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-4 pt-2 border-t border-slate-700/70 text-xs text-slate-400">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg)}
                            className="hover:text-white flex items-center gap-1 transition-colors"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                                <span className="text-[#10B981]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            aria-label="Rate response helpful"
                            onClick={() => handleRateMessage(msg, 5)}
                            className={`hover:text-[#10B981] flex items-center gap-1 transition-colors ${
                              msg.feedbackRating === 5 ? 'text-[#10B981] font-semibold' : ''
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Helpful</span>
                          </button>
                          <button
                            type="button"
                            aria-label="Rate response needs improvement"
                            onClick={() => handleRateMessage(msg, 2)}
                            className={`hover:text-amber-400 flex items-center gap-1 transition-colors ${
                              msg.feedbackRating === 2 ? 'text-amber-400 font-semibold' : ''
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Live Generating / Thinking Bubble */}
                {isGenerating && (
                  <div className="flex gap-3.5 justify-start" aria-live="polite">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white font-display font-bold text-xs shrink-0 mt-1 animate-pulse">
                      S
                    </div>
                    <div className="bg-[#1E293B] border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-300 flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                      <span>
                        {composerOption === 'free_image'
                          ? 'Samjha Nano Vision is creating your image...'
                          : 'Samjha AI is understanding and composing your response...'}
                      </span>
                    </div>
                  </div>
                )}

                {chatError && (
                  <div className="p-3.5 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center justify-between">
                    <span>{chatError}</span>
                    <button
                      type="button"
                      onClick={() => setChatError(null)}
                      className="text-rose-300 underline ml-4 shrink-0"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 3. Docked Bottom Chat & Free Image Composer */}
            <div className="px-4 sm:px-6 py-3 bg-[#0F172A] border-t border-slate-800/90 shrink-0">
              <div className="max-w-3xl mx-auto space-y-2">
                {/* Quick Starter Prompts Row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {QUICK_STARTER_PROMPTS.map((starter, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => {
                        setComposerOption(starter.isImg ? 'free_image' : 'auto_chat');
                        handleSendMessage(starter.label, starter.isImg);
                      }}
                      className="px-3 py-1 rounded-lg bg-[#1E293B] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
                    >
                      {starter.label}
                    </button>
                  ))}
                </div>

                {/* Main Input Bar */}
                <div className="bg-[#1E293B] border border-slate-700/90 focus-within:border-[#7C3AED] rounded-2xl p-2 flex items-center gap-2 shadow-lg">
                  <button
                    type="button"
                    onClick={() =>
                      setComposerOption((prev) =>
                        prev === 'auto_chat' ? 'free_image' : 'auto_chat'
                      )
                    }
                    title={
                      composerOption === 'free_image'
                        ? 'Switch to Smart Chat'
                        : 'Switch to Free Text-to-Image'
                    }
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                      composerOption === 'free_image'
                        ? 'bg-[#EC4899]/20 text-pink-300 border border-[#EC4899]/40'
                        : 'bg-[#0F172A] text-purple-300 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {composerOption === 'free_image' ? (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Image</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Auto Chat</span>
                      </>
                    )}
                  </button>

                  <input
                    type="text"
                    aria-label="Message Samjha AI"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      composerOption === 'free_image'
                        ? 'Describe any image to generate for free with Samjha Nano Vision...'
                        : 'Ask Samjha AI anything in English, हिंदी, or Hinglish...'
                    }
                    disabled={isGenerating}
                    className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={isGenerating || !inputMessage.trim()}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-50 ${
                      composerOption === 'free_image'
                        ? 'bg-gradient-to-r from-[#EC4899] to-[#F59E0B]'
                        : 'bg-[#7C3AED] hover:bg-[#6D28D9]'
                    }`}
                  >
                    {composerOption === 'free_image' ? (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>{isGenerating ? 'Creating...' : 'Create'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isGenerating ? 'Sending...' : 'Send'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Compact Status & Quick Policy Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
                  <span>
                    {composerOption === 'free_image'
                      ? 'Active: Samjha Nano Vision (Free Text-to-Image)'
                      : liveAutoDetection
                      ? `Auto-Detected: ${liveAutoDetection.samjhaBrandLabel} · ${liveAutoDetection.detectedLanguage} (${liveAutoDetection.intentSummary})`
                      : 'Samjha AI automatically understands your language and topic'}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveSection('founder')}
                      className="hover:text-white"
                    >
                      Founder
                    </button>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => openLegalTab('privacy')}
                      className="hover:text-white"
                    >
                      Privacy
                    </button>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => openLegalTab('help_faq')}
                      className="hover:text-white"
                    >
                      Help
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        ) : (
          /* NON-CHAT VIEWS: IMAGE STUDIO, FOUNDER PAGE, PRIVACY & HELP */
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-between">
            <div>
              {activeSection === 'image_studio' && <FreeImageGeneratorView />}

              {activeSection === 'founder' && (
                <FounderPageView
                  onOpenChat={(initialPrompt) => {
                    setActiveSection('chat');
                    if (initialPrompt) {
                      handleSendMessage(initialPrompt, false);
                    }
                  }}
                />
              )}

              {activeSection === 'privacy_help' && (
                <LegalAndHelpPagesView
                  initialTab={helpSubTab}
                  onOpenChat={() => setActiveSection('chat')}
                  onOpenImageCreator={() => setActiveSection('image_studio')}
                  onOpenFounder={() => setActiveSection('founder')}
                />
              )}
            </div>

            <footer className="mt-10 pt-5 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-white">Samjha AI</span>
                <span aria-hidden="true">·</span>
                <span>One AI Assistant For Everything</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setActiveSection('founder')}
                  className="text-purple-300 hover:text-white underline"
                >
                  Founder: Ayush Vishwakarma
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => openLegalTab('privacy')}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => openLegalTab('terms')}
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
                <button
                  type="button"
                  onClick={() => openLegalTab('cookies')}
                  className="hover:text-white transition-colors"
                >
                  Cookie Policy
                </button>
                <button
                  type="button"
                  onClick={() => openLegalTab('acceptable_use')}
                  className="hover:text-white transition-colors"
                >
                  Acceptable Use
                </button>
                <button
                  type="button"
                  onClick={() => openLegalTab('help_faq')}
                  className="hover:text-white transition-colors"
                >
                  Help &amp; FAQ
                </button>
                <button
                  type="button"
                  onClick={() => openLegalTab('status')}
                  className="text-[#10B981] hover:text-white transition-colors"
                >
                  Status
                </button>
              </div>
            </footer>
          </main>
        )}
      </div>
    </div>
  );
}
