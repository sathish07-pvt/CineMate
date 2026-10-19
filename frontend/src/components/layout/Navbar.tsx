import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Film, Tv, Sparkles, Bookmark, Users, Video, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Discover', path: '/', icon: Film },
    { name: 'Movies', path: '/search?type=movie', icon: Film },
    { name: 'Series', path: '/search?type=tv', icon: Tv },
    { name: 'Mood AI', path: '/mood', icon: Sparkles, badge: 'Popular' },
    { name: 'Watchlist', path: '/watchlist', icon: Bookmark },
    { name: 'Watch Rooms', path: '/rooms', icon: Video },
    { name: 'Friends', path: '/friends', icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname + location.search === path) return true;
    if (path.startsWith('/search') && location.pathname === '/search') return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cinemate-border/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cinemate-accent to-cinemate-cyan p-0.5 shadow-lg shadow-cinemate-accent/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-cinemate-surface rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-cinemate-cyan group-hover:rotate-12 transition-transform duration-200" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Cine<span className="text-cinemate-accent">Mate</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium -mt-1 hidden sm:block">
              Watch Together
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  active
                    ? 'text-white bg-slate-800/80 shadow-sm border border-slate-700/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-cinemate-accent' : 'text-slate-400'}`} />
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-cinemate-accent/20 text-cinemate-accent border border-cinemate-accent/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-xs relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, series, cast..."
            className="w-full bg-slate-900/90 text-sm text-slate-200 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:border-cinemate-accent focus:ring-1 focus:ring-cinemate-accent focus:outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </form>

        {/* User Auth & Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Search on mobile */}
          <Link
            to="/search"
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Link>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/70 border border-slate-700/60 transition-all focus:outline-none"
              >
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  alt={user.username}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-cinemate-accent/40"
                />
                <span className="hidden sm:block text-sm font-semibold text-slate-200 max-w-[100px] truncate">
                  {user.username}
                </span>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 glass-panel rounded-2xl shadow-2xl py-2 border border-slate-700/80 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800 text-xs">
                    <p className="text-slate-400">Signed in as</p>
                    <p className="font-semibold text-slate-200 truncate">{user.email}</p>
                    <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      Region: {user.preferredRegion || 'US'}
                    </span>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/70"
                  >
                    <UserIcon className="w-4 h-4 text-cinemate-cyan" />
                    Profile & Settings
                  </Link>
                  <Link
                    to="/watchlist"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/70"
                  >
                    <Bookmark className="w-4 h-4 text-cinemate-accent" />
                    My Watchlist
                  </Link>
                  <Link
                    to="/friends"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/70"
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    Friends List
                  </Link>
                  <div className="border-t border-slate-800 my-1" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3.5 py-1.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cinemate-accent to-purple-600 hover:from-purple-600 hover:to-cinemate-accent shadow-lg shadow-cinemate-accent/25 transition-all"
              >
                Join Free
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, series, cast..."
              className="w-full bg-slate-900 text-sm text-slate-200 placeholder-slate-400 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70"
                >
                  <Icon className="w-4 h-4 text-cinemate-accent" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
