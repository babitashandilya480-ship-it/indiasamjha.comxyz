import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  emailSignIn,
  emailSignUp,
  resetUserPassword,
} from '../firebase';

export type AuthModalMode = 'login' | 'signup' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthModalMode;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setStatusMessage(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (mode === 'reset') {
      setLoading(true);
      try {
        await resetUserPassword(email);
        setStatusMessage('Password reset link sent! Check your email inbox.');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-check.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const user = await emailSignUp(fullName, email, password);
        onSuccess(user);
        onClose();
      } else {
        const user = await emailSignIn(email, password);
        onSuccess(user);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleContinue = async () => {
    setError(null);
    setStatusMessage(null);
    setLoading(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        onSuccess(res.user);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="samjha-auth-modal-title"
    >
      <div className="w-full max-w-md bg-[#1E293B] border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Samjha AI Account</span>
            </div>
            <h2
              id="samjha-auth-modal-title"
              className="text-xl font-bold text-white tracking-tight mt-0.5"
            >
              {mode === 'login'
                ? 'Welcome Back to Samjha AI'
                : mode === 'signup'
                ? 'Create Your Free Account'
                : 'Reset Your Password'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'login'
                ? 'Sign in to sync your chats and preferences across devices.'
                : mode === 'signup'
                ? 'Join Samjha AI for free smart chat, learning, and text-to-image.'
                : 'Enter your email to receive a password reset link.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs (Log In / Sign Up) */}
        {mode !== 'reset' && (
          <div className="px-6 pt-4">
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0F172A] border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                  mode === 'login'
                    ? 'bg-[#7C3AED] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                  mode === 'signup'
                    ? 'bg-[#7C3AED] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up Free
              </button>
            </div>
          </div>
        )}

        {/* Body Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* 1-Click Google Sign-In Button */}
          {mode !== 'reset' && (
            <>
              <button
                type="button"
                onClick={handleGoogleContinue}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-[#1E293B] px-3 text-[11px] text-slate-400 uppercase tracking-wider shrink-0">
                  or with email
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>
            </>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label htmlFor="auth-fullname" className="text-xs font-medium text-slate-300 block">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="auth-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Ayush Vishwakarma"
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="auth-email" className="text-xs font-medium text-slate-300 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="text-xs font-medium text-slate-300 block"
                  >
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setError(null);
                      }}
                      className="text-[11px] text-purple-300 hover:text-white"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#7C3AED]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-1">
                <label
                  htmlFor="auth-confirm-password"
                  className="text-xs font-medium text-slate-300 block"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#F59E0B] hover:opacity-95 text-white font-semibold text-xs sm:text-sm transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Please wait...'
                  : mode === 'login'
                  ? 'Log In to Samjha AI'
                  : mode === 'signup'
                  ? 'Create Free Account'
                  : 'Send Password Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setStatusMessage(null);
              }}
              className="w-full text-center text-xs text-purple-300 hover:text-white pt-1"
            >
              &larr; Back to Log In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
