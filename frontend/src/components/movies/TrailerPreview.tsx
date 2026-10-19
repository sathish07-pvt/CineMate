import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Maximize2, ExternalLink, Film } from 'lucide-react';

interface TrailerPreviewProps {
  trailerKey?: string;
  backdropUrl?: string;
  title: string;
}

export const TrailerPreview: React.FC<TrailerPreviewProps> = ({ trailerKey, backdropUrl, title }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showFullModal, setShowFullModal] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Check user preference for reduced motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsPlaying(false);
    }
  }, []);

  const youtubeEmbedUrl = trailerKey
    ? `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerKey}&modestbranding=1&iv_load_policy=3&playsinline=1`
    : null;

  const fullModalUrl = trailerKey
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=1&rel=0`
    : null;

  return (
    <div className="relative w-full h-[55vh] min-h-[420px] max-h-[600px] overflow-hidden bg-slate-950">
      {/* Background Video Trailer or Fallback Image */}
      {youtubeEmbedUrl && isPlaying && !hasError ? (
        <div className="absolute inset-0 w-full h-full pointer-events-none scale-125 overflow-hidden">
          <iframe
            src={youtubeEmbedUrl}
            title={`${title} Trailer Preview`}
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full object-cover pointer-events-none transition-opacity duration-1000 opacity-70"
            onError={() => setHasError(true)}
          />
        </div>
      ) : (
        <img
          src={backdropUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80'}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 opacity-60 transition-transform duration-700"
        />
      )}

      {/* Cinematic Gradient Overlays to keep content readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-cinemate-darkest via-cinemate-darkest/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-cinemate-darkest via-cinemate-darkest/75 to-transparent max-w-4xl" />

      {/* Interactive Trailer Preview Controls Floating Bar */}
      {trailerKey && !hasError && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/60 hover:bg-black/90 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all shadow-lg"
            title={isPlaying ? 'Pause background preview' : 'Play background preview'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Preview</span>
              </>
            )}
          </button>

          {/* Mute / Unmute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl text-xs font-semibold bg-black/60 hover:bg-black/90 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all shadow-lg"
            title={isMuted ? 'Unmute trailer' : 'Mute trailer'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cinemate-cyan" />}
          </button>

          {/* View Full Trailer Modal */}
          <button
            onClick={() => setShowFullModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cinemate-accent hover:bg-purple-600 text-white shadow-lg shadow-cinemate-accent/30 transition-all"
            title="Watch full trailer in theatre mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Full Trailer</span>
          </button>

          {/* External YouTube Link */}
          <a
            href={`https://www.youtube.com/watch?v=${trailerKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-black/60 hover:bg-black/90 text-slate-300 hover:text-red-500 border border-slate-700/80 backdrop-blur-md transition-all shadow-lg"
            title="Open on YouTube"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Fallback Notice if Trailer unavailable */}
      {!trailerKey && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-400 bg-black/50 backdrop-blur-md border border-slate-800">
          <Film className="w-3.5 h-3.5 text-slate-500" />
          <span>Official trailer preview unavailable</span>
        </div>
      )}

      {/* Full Trailer Theater Modal */}
      {showFullModal && fullModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setShowFullModal(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={fullModalUrl}
              title={`${title} Full Trailer`}
              allow="autoplay; encrypted-media; fullscreen"
              className="w-full h-full"
            />
            <button
              onClick={() => setShowFullModal(false)}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-bold border border-slate-700"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
