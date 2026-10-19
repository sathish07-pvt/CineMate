import React, { useState, useEffect } from 'react';
import { Download, X, Film } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 glass-panel p-4 rounded-2xl border border-cinemate-accent/40 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cinemate-accent to-cinemate-cyan p-0.5 flex-shrink-0">
            <div className="w-full h-full bg-cinemate-surface rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-cinemate-cyan" />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Install CineMate App</h4>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Install as a Progressive Web App for fast discovery and offline viewing.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-500 hover:text-slate-300 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          onClick={() => setIsVisible(false)}
          className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-cinemate-accent hover:bg-purple-600 text-white rounded-xl shadow-lg shadow-cinemate-accent/25 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install PWA</span>
        </button>
      </div>
    </div>
  );
};
