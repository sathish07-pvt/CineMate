import React, { useState } from 'react';
import { X, Film, Mail, Lock, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, login, register, openAuthModal } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        await login(identifier, password);
      } else {
        await register({ username, email, password });
      }
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async (demoEmail: string) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await login(demoEmail, 'password123');
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-cinemate-border/80 shadow-2xl bg-cinemate-darkest/95 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cinemate-accent to-cinemate-cyan p-0.5 shadow-lg shadow-cinemate-accent/30">
            <div className="w-full h-full bg-cinemate-surface rounded-[14px] flex items-center justify-center">
              <Film className="w-6 h-6 text-cinemate-cyan" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            {isLogin ? 'Welcome Back to CineMate' : 'Join the CineMate Community'}
          </h3>
          <p className="text-xs text-slate-400">
            {isLogin
              ? 'Access your personal watchlist, ratings, and watch parties'
              : 'Create an account to rate movies, discover OTT links, and host rooms'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => { setErrorMsg(''); openAuthModal('login'); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isLogin ? 'bg-cinemate-accent text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setErrorMsg(''); openAuthModal('register'); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isLogin ? 'bg-cinemate-accent text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cinema_lover"
                  className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:border-cinemate-accent focus:outline-none"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {isLogin ? 'Email or Username' : 'Email Address'}
            </label>
            <div className="relative">
              <input
                type={isLogin ? 'text' : 'email'}
                required
                value={isLogin ? identifier : email}
                onChange={(e) => (isLogin ? setIdentifier(e.target.value) : setEmail(e.target.value))}
                placeholder={isLogin ? 'Enter your email or username' : 'you@example.com'}
                className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:border-cinemate-accent focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:border-cinemate-accent focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cinemate-accent to-purple-600 hover:from-purple-600 hover:to-cinemate-accent text-white shadow-xl shadow-cinemate-accent/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : isLogin ? 'Sign In to CineMate' : 'Create Free Account'}
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="pt-2 border-t border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center mb-2.5 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-cinemate-cyan" />
            <span>Instant Demo Access (1-Click)</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('alex@cinemate.io')}
              disabled={isSubmitting}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-800 hover:border-slate-700 transition-all text-center"
            >
              🚀 Alex (Cinephile)
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('sophia@cinemate.io')}
              disabled={isSubmitting}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-800 hover:border-slate-700 transition-all text-center"
            >
              🎬 Sophia (Curator)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
