import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Sparkles, Bookmark, Video } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Mood AI', path: '/mood', icon: Sparkles },
    { label: 'Watchlist', path: '/watchlist', icon: Bookmark },
    { label: 'Rooms', path: '/rooms', icon: Video },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-800/80 px-2 py-2 backdrop-blur-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                active ? 'text-cinemate-accent scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium tracking-tight mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
