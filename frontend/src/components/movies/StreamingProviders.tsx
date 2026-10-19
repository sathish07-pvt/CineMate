import React, { useState, useEffect } from 'react';
import { Tv, ExternalLink, Globe, AlertCircle } from 'lucide-react';
import { ProvidersMap, WatchProvider } from '../../types';
import { api } from '../../services/api';

interface StreamingProvidersProps {
  tmdbId: number;
  mediaType: string;
  initialProviders?: ProvidersMap;
  userRegion?: string;
}

const REGIONS = [
  { code: 'US', label: 'United States 🇺🇸' },
  { code: 'GB', label: 'United Kingdom 🇬🇧' },
  { code: 'IN', label: 'India 🇮🇳' },
  { code: 'CA', label: 'Canada 🇨🇦' },
  { code: 'AU', label: 'Australia 🇦🇺' },
  { code: 'DE', label: 'Germany 🇩🇪' },
  { code: 'FR', label: 'France 🇫🇷' },
];

export const StreamingProviders: React.FC<StreamingProvidersProps> = ({
  tmdbId,
  mediaType,
  initialProviders,
  userRegion = 'US',
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(userRegion);
  const [providers, setProviders] = useState<ProvidersMap | undefined>(initialProviders);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchRegional = async () => {
      setIsLoading(true);
      try {
        const res = await api.getWatchProviders(tmdbId, mediaType as 'movie' | 'tv', selectedRegion);
        if (isMounted && res.success && res.data) {
          setProviders(res.data);
        }
      } catch (err) {
        console.error('Failed to load regional providers:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (selectedRegion !== userRegion || !initialProviders) {
      fetchRegional();
    }
    return () => {
      isMounted = false;
    };
  }, [selectedRegion, tmdbId, mediaType]);

  const hasStream = providers?.flatrate && providers.flatrate.length > 0;
  const hasRent = providers?.rent && providers.rent.length > 0;
  const hasBuy = providers?.buy && providers.buy.length > 0;
  const hasAny = hasStream || hasRent || hasBuy;

  const directDestinationLink = providers?.link || (hasStream ? `https://www.google.com/search?q=watch+${tmdbId}` : null);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-cinemate-border/70 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cinemate-cyan/10 border border-cinemate-cyan/20">
            <Tv className="w-5 h-5 text-cinemate-cyan" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Where to Watch</h3>
            <p className="text-xs text-slate-400">Stream, Rent, or Buy from authorized providers</p>
          </div>
        </div>

        {/* Region Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cinemate-accent"
          >
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 flex items-center justify-center text-xs text-slate-400 animate-pulse">
          Locating regional streaming availability...
        </div>
      ) : hasAny ? (
        <div className="space-y-5">
          {/* Stream / Subscription */}
          {hasStream && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Stream (Subscription)
                </span>
                {directDestinationLink && (
                  <a
                    href={directDestinationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-cinemate-cyan hover:underline"
                  >
                    <span>Watch Now</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {providers.flatrate!.map((p: WatchProvider) => (
                  <div
                    key={p.provider_id}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow transition-all"
                  >
                    <img
                      src={p.logo_path}
                      alt={p.provider_name}
                      className="w-6 h-6 rounded-md object-cover shadow"
                    />
                    <span className="text-xs font-semibold text-slate-200">{p.provider_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rent Options */}
          {hasRent && (
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                Rent
              </span>
              <div className="flex flex-wrap gap-2.5">
                {providers.rent!.map((p: WatchProvider) => (
                  <div
                    key={p.provider_id}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/70 border border-slate-800/80"
                  >
                    <img
                      src={p.logo_path}
                      alt={p.provider_name}
                      className="w-5 h-5 rounded object-cover"
                    />
                    <span className="text-xs text-slate-300">{p.provider_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buy Options */}
          {hasBuy && (
            <div>
              <span className="text-xs font-bold text-cinemate-accent uppercase tracking-wider block mb-2">
                Buy
              </span>
              <div className="flex flex-wrap gap-2.5">
                {providers.buy!.map((p: WatchProvider) => (
                  <div
                    key={p.provider_id}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/70 border border-slate-800/80"
                  >
                    <img
                      src={p.logo_path}
                      alt={p.provider_name}
                      className="w-5 h-5 rounded object-cover"
                    />
                    <span className="text-xs text-slate-300">{p.provider_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
            Provider availability is subject to change based on licensing. CineMate connects to official streaming destinations.
          </p>
        </div>
      ) : (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
          <AlertCircle className="w-8 h-8 text-slate-600 mb-1" />
          <p className="text-xs font-medium">No verified OTT streaming provider currently listed for {selectedRegion}.</p>
          <p className="text-[11px] text-slate-500">Try switching regions above or check local cinema listings.</p>
        </div>
      )}
    </div>
  );
};
