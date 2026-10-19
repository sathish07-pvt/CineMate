import React from 'react';
import { Film, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-cinemate-border/70 bg-cinemate-surface/60 backdrop-blur-md pb-24 lg:pb-12 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cinemate-accent to-cinemate-cyan p-0.5">
                <div className="w-full h-full bg-cinemate-surface rounded-[6px] flex items-center justify-center">
                  <Film className="w-4 h-4 text-cinemate-cyan" />
                </div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Cine<span className="text-cinemate-accent">Mate</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your personal movie discovery & social viewing platform. Discover movies, discover OTT availability, watch trailers in cinematic background mode, and watch together with friends.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">Trending Movies</Link></li>
              <li><Link to="/search?type=tv" className="hover:text-white transition-colors">Popular TV Series</Link></li>
              <li><Link to="/mood" className="hover:text-white transition-colors">Mood & Situation Recommendations</Link></li>
              <li><Link to="/rooms" className="hover:text-white transition-colors">Social Watch Together Rooms</Link></li>
            </ul>
          </div>

          {/* Streaming & OTT */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">OTT Discovery</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="text-slate-300">Netflix & Disney+</span></li>
              <li><span className="text-slate-300">Amazon Prime Video</span></li>
              <li><span className="text-slate-300">Apple TV & Google Play</span></li>
              <li><span className="text-slate-300">Max, Hulu & Peacock</span></li>
            </ul>
          </div>

          {/* Attribution & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Attribution</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              This product uses the TMDB API but is not endorsed or certified by TMDB. Movie metadata, posters, and watch provider links are provided by external authorized services.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for cinema lovers</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CineMate Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Find. Discover. Review. Watch Together.</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-[10px] text-slate-400">PWA Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
