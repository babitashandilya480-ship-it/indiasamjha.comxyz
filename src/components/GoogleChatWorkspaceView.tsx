import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { FIREBASE_PROJECT_ID } from '../firebase';

interface GoogleChatWorkspaceViewProps {
  accessToken: string | null;
  userEmail: string | null;
  onSignInWithGoogle: () => Promise<void>;
}

interface ChatSpaceItem {
  name: string;
  displayName?: string;
  spaceType?: string;
}

interface ChatMessageItem {
  name: string;
  text?: string;
  createTime?: string;
  sender?: {
    displayName?: string;
    name?: string;
  };
}

export const GoogleChatWorkspaceView: React.FC<GoogleChatWorkspaceViewProps> = ({
  accessToken,
  userEmail,
  onSignInWithGoogle,
}) => {
  const [spaces, setSpaces] = useState<ChatSpaceItem[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<ChatSpaceItem | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [draftMessage, setDraftMessage] = useState('');
  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isNotFound404, setIsNotFound404] = useState(false);

  // Mandatory destructive / mutating operation confirmation modal state
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);

  const consoleConfigUrl = `https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat?project=${FIREBASE_PROJECT_ID}`;

  const handleLoadSpaces = async () => {
    if (!accessToken) return;
    setLoadingSpaces(true);
    setApiError(null);
    setIsNotFound404(false);
    try {
      const res = await fetch('https://chat.googleapis.com/v1/spaces?pageSize=20', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data?.error?.message || `HTTP ${res.status}`;
        if (res.status === 404 || errMsg.includes('Google Chat app not found')) {
          setIsNotFound404(true);
        }
        throw new Error(errMsg);
      }
      const list = (data.spaces || []) as ChatSpaceItem[];
      setSpaces(list);
      if (list.length > 0 && !selectedSpace) {
        setSelectedSpace(list[0]);
      }
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingSpaces(false);
    }
  };

  const handleLoadMessages = async (space: ChatSpaceItem) => {
    if (!accessToken) return;
    setSelectedSpace(space);
    setLoadingMessages(true);
    setApiError(null);
    try {
      const res = await fetch(
        `https://chat.googleapis.com/v1/${space.name}/messages?pageSize=20`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || `HTTP ${res.status}`);
      }
      setMessages((data.messages || []) as ChatMessageItem[]);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleRequestSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace || !draftMessage.trim()) return;
    // Open confirmation dialog before mutating user's Google Chat space
    setConfirmSendOpen(true);
  };

  const handleConfirmedSend = async () => {
    if (!accessToken || !selectedSpace || !draftMessage.trim()) return;
    setConfirmSendOpen(false);
    setSending(true);
    setApiError(null);
    try {
      const res = await fetch(
        `https://chat.googleapis.com/v1/${selectedSpace.name}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: draftMessage.trim(),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || `HTTP ${res.status}`);
      }
      setDraftMessage('');
      await handleLoadMessages(selectedSpace);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Google Chat Workspace Integration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse your Google Chat spaces, read conversation history, and send messages with explicit user confirmation.
          </p>
        </div>
        {accessToken && (
          <button
            type="button"
            onClick={handleLoadSpaces}
            disabled={loadingSpaces}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSpaces ? 'animate-spin' : ''}`} />
            {loadingSpaces ? 'Syncing Spaces...' : 'Sync Google Chat Spaces'}
          </button>
        )}
      </div>

      {/* Mandatory Up-Front Google Chat API Prerequisites Banner */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 space-y-2 text-xs">
        <div className="font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
          Google Chat API Workspace Prerequisites
        </div>
        <ol className="list-decimal list-inside text-slate-300 space-y-1">
          <li>
            Requires a <strong>Business or Enterprise Google Workspace account</strong> with access to Google Chat (consumer <code className="text-slate-200">@gmail.com</code> accounts return a Workspace prerequisite message).
          </li>
          <li>
            Requires one-time configuration of the Google Chat App (App Name, Avatar URL, Description) on the{' '}
            <a
              href={consoleConfigUrl}
              target="_blank"
              rel="noreferrer"
              className="text-purple-300 hover:text-white underline inline-flex items-center gap-1"
            >
              Google Cloud Console Chat API Configuration page ({FIREBASE_PROJECT_ID})
              <ExternalLink className="w-3 h-3" />
            </a>
            .
          </li>
        </ol>
      </div>

      {!accessToken ? (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-8 text-center space-y-4">
          <MessageSquare className="w-10 h-10 text-[#7C3AED] mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-base font-semibold text-white">
              Connect Your Google Account for Google Chat
            </h2>
            <p className="text-xs text-slate-400">
              Sign in with Google to grant Samjha AI in-memory access to view spaces and send messages on your behalf.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onSignInWithGoogle}
              className="gsi-material-button"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: 'block' }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">Sign in with Google</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {apiError && (
            <div className="bg-amber-950/50 border border-amber-700 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Google Chat API Response: {apiError}</span>
              </div>
              {isNotFound404 && (
                <p className="text-slate-300">
                  Google Chat app not found. To create a Chat app, turn on the Chat API and configure the app in the{' '}
                  <a
                    href={consoleConfigUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-300 underline font-medium"
                  >
                    Google Cloud Console Chat Configuration Page
                  </a>
                  .
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Spaces Sidebar */}
            <div className="lg:col-span-4 bg-[#1E293B] border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Chat Spaces ({spaces.length})</h2>
                <span className="text-xs text-slate-400 truncate max-w-[140px]">
                  {userEmail}
                </span>
              </div>
              {spaces.length === 0 ? (
                <div className="p-6 text-center bg-[#0F172A] border border-slate-800 rounded-lg text-xs text-slate-400">
                  Click &ldquo;Sync Google Chat Spaces&rdquo; above to fetch spaces from your Google Workspace account.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {spaces.map((sp) => (
                    <button
                      key={sp.name}
                      type="button"
                      onClick={() => handleLoadMessages(sp)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${
                        selectedSpace?.name === sp.name
                          ? 'bg-[#7C3AED] text-white font-semibold'
                          : 'bg-[#0F172A] text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate">{sp.displayName || sp.name}</div>
                      <div className="text-[11px] opacity-75 font-mono">{sp.spaceType || 'SPACE'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active Space Messages & Composer */}
            <div className="lg:col-span-8 bg-[#1E293B] border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[380px] space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-white">
                    {selectedSpace
                      ? `Space: ${selectedSpace.displayName || selectedSpace.name}`
                      : 'Select a Google Chat Space'}
                  </h2>
                  {loadingMessages && (
                    <span className="text-xs text-slate-400">Loading messages...</span>
                  )}
                </div>

                <div className="space-y-2.5 max-h-[260px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">
                      {selectedSpace
                        ? 'No messages loaded in this space yet.'
                        : 'Select a space on the left to read or post messages.'}
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.name}
                        className="bg-[#0F172A] border border-slate-800 rounded-lg p-3 text-xs space-y-1"
                      >
                        <div className="flex justify-between text-slate-400">
                          <span className="font-semibold text-white">
                            {m.sender?.displayName || m.sender?.name || 'Member'}
                          </span>
                          <span className="font-mono">{m.createTime || ''}</span>
                        </div>
                        <p className="text-slate-200">{m.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <form onSubmit={handleRequestSend} className="flex gap-2 pt-3 border-t border-slate-800">
                <input
                  type="text"
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  disabled={!selectedSpace || sending}
                  placeholder={
                    selectedSpace
                      ? `Message ${selectedSpace.displayName || selectedSpace.name}...`
                      : 'Select a space first...'
                  }
                  className="flex-1 bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  disabled={!selectedSpace || !draftMessage.trim() || sending}
                  className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" /> Send to Chat
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog before Sending a Message to Google Chat */}
      {confirmSendOpen && selectedSpace && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-chat-send-title"
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        >
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 id="confirm-chat-send-title" className="text-base font-bold text-white">
              Confirm Sending Message to Google Chat?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to post a live message on your behalf to space{' '}
              <strong className="text-white">
                {selectedSpace.displayName || selectedSpace.name}
              </strong>
              :
            </p>
            <div className="p-3 bg-[#0F172A] border border-slate-800 rounded-lg text-xs text-slate-200">
              {draftMessage}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSendOpen(false)}
                className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmedSend}
                className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg text-xs"
              >
                Confirm & Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
