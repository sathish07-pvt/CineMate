import React, { useState, useEffect } from 'react';
import { Check, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const REGIONS = [
  { code: 'US', label: 'United States 🇺🇸' },
  { code: 'GB', label: 'United Kingdom 🇬🇧' },
  { code: 'IN', label: 'India 🇮🇳' },
  { code: 'CA', label: 'Canada 🇨🇦' },
  { code: 'AU', label: 'Australia 🇦🇺' },
  { code: 'DE', label: 'Germany 🇩🇪' },
  { code: 'FR', label: 'France 🇫🇷' },
];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout, isAuthenticated, openAuthModal } = useAuth();

  const [bio, setBio] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [preferredRegion, setPreferredRegion] = useState<string>('US');
  const [preferredLanguages, setPreferredLanguages] = useState<string>('en');
  const [favoriteGenres, setFavoriteGenres] = useState<string>('28,12,878');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      setPreferredRegion(user.preferredRegion || 'US');
      setPreferredLanguages(user.preferredLanguages || 'en');
      setFavoriteGenres(user.favoriteGenres || '28,12,878');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfile({
        bio,
        avatarUrl,
        preferredRegion,
        preferredLanguages,
        favoriteGenres,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Profile Access</h2>
        <p className="text-xs text-slate-400">Please sign in to customize your profile and settings.</p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cinemate-accent text-white"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cinemate-border/70 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-2xl">
        <img
          src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
          alt={user.username}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-cinemate-accent/30 shadow-xl"
        />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-black text-white">@{user.username}</h1>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors self-center sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 max-w-xl leading-relaxed pt-1">
            {user.bio || 'Film enthusiast on CineMate.'}
          </p>

          {/* Stats Badges */}
          <div className="pt-3 flex items-center justify-center sm:justify-start gap-6 text-center">
            <div>
              <p className="text-lg font-black text-white">{user.stats?.watchlistCount ?? 4}</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Watchlist</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <p className="text-lg font-black text-amber-400">{user.stats?.reviewsCount ?? 2}</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Reviews</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <p className="text-lg font-black text-cinemate-cyan">{user.stats?.friendsCount ?? 2}</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Friends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cinemate-border/70 space-y-6">
        <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          Profile & Preferences
        </h2>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cinemate-accent"
            />
            <p className="text-[11px] text-slate-500 mt-1">Leave empty or use a Dicebear or Unsplash link.</p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share what genres and cinema eras you love..."
              className="w-full bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cinemate-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Preferred OTT Region</label>
              <select
                value={preferredRegion}
                onChange={(e) => setPreferredRegion(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cinemate-accent"
              >
                {REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Used to discover matching Netflix, Prime, and regional streaming links.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Preferred Languages</label>
              <input
                type="text"
                value={preferredLanguages}
                onChange={(e) => setPreferredLanguages(e.target.value)}
                placeholder="e.g. en, fr, ko, es"
                className="w-full bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cinemate-accent"
              />
              <p className="text-[11px] text-slate-500 mt-1">Comma-separated ISO language codes.</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <Check className="w-4 h-4" />
                <span>Preferences saved successfully!</span>
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cinemate-accent hover:bg-purple-600 text-white shadow-lg shadow-cinemate-accent/30 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
