import React, { useState, useRef, useEffect } from 'react';
import { ReelItem } from '../types';
import { Play, Pause, Eye, Clock, Volume2, VolumeX, ShieldCheck, Sparkles } from 'lucide-react';

interface ReelsSectionProps {
  reels?: ReelItem[];
  onOrderNowClick: () => void;
}

// Fallback high-quality demo video streams if custom URL isn't set yet
const DEFAULT_DEMO_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
];

export const ReelsSection: React.FC<ReelsSectionProps> = ({
  reels = [],
  onOrderNowClick,
}) => {
  // Track which reel is currently playing inline (No Pop-ups!)
  const [playingReelId, setPlayingReelId] = useState<string | null>(null);
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  if (!reels || reels.length === 0) return null;

  const handleCardClick = (reelId: string, fallbackIdx: number) => {
    const isCurrentlyPlaying = playingReelId === reelId;
    const currentVideo = videoRefs.current[reelId];

    if (isCurrentlyPlaying) {
      if (currentVideo) {
        if (currentVideo.paused) {
          currentVideo.muted = false;
          currentVideo.play().catch(() => {});
        } else {
          currentVideo.pause();
          setPlayingReelId(null);
        }
      } else {
        setPlayingReelId(null);
      }
    } else {
      // Pause any previously playing video
      if (playingReelId && videoRefs.current[playingReelId]) {
        videoRefs.current[playingReelId]?.pause();
      }

      setPlayingReelId(reelId);

      // Play with sound immediately as requested by user
      setTimeout(() => {
        const vid = videoRefs.current[reelId];
        if (vid) {
          vid.muted = false;
          vid.volume = 1.0;
          setMutedStates((prev) => ({ ...prev, [reelId]: false }));
          vid.play().catch((err) => {
            console.warn('Autoplay with sound interaction:', err);
            // Fallback to muted if browser requires
            vid.muted = true;
            vid.play().catch(() => {});
          });
        }
      }, 50);
    }
  };

  const toggleSound = (e: React.MouseEvent, reelId: string) => {
    e.stopPropagation();
    const vid = videoRefs.current[reelId];
    if (vid) {
      const nextMuted = !vid.muted;
      vid.muted = nextMuted;
      setMutedStates((prev) => ({ ...prev, [reelId]: nextMuted }));
    }
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50/70 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto mb-14">
          <p className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real Growth Proof</span>
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Client Growth Stories & Live Reels
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Watch real proof and results from creators and business pages who used Tech Promotion BD to scale their reach.
          </p>
        </div>

        {/* 3 Facebook Reels Size (9:16 Vertical) Video Cards with Inline Sound Playback (NO POPUPS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {reels.slice(0, 3).map((reel, idx) => {
            const isPlaying = playingReelId === reel.id;
            const videoSource = reel.videoUrl || DEFAULT_DEMO_VIDEOS[idx % DEFAULT_DEMO_VIDEOS.length];
            const isMuted = mutedStates[reel.id] ?? false;

            return (
              <div
                key={reel.id}
                onClick={() => handleCardClick(reel.id, idx)}
                className={`group relative aspect-9/16 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border transition-all duration-300 bg-black cursor-pointer transform ${
                  isPlaying ? 'ring-4 ring-blue-500 shadow-2xl scale-[1.02]' : 'hover:-translate-y-1.5 border-slate-200/80'
                }`}
              >
                {/* Inline Video Player Element */}
                {isPlaying ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[reel.id] = el;
                    }}
                    src={videoSource}
                    poster={reel.thumbnail}
                    playsInline
                    loop
                    controls={false}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={reel.thumbnail}
                    alt={reel.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Scrim Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/40 transition-opacity ${
                    isPlaying ? 'opacity-40 group-hover:opacity-60' : 'opacity-100'
                  }`}
                />

                {/* Top Meta Badges (Views & Duration) & Sound Toggle */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white text-[11px] font-bold z-20">
                  <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>{reel.views || '100K+'}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {isPlaying && (
                      <button
                        type="button"
                        onClick={(e) => toggleSound(e, reel.id)}
                        className="bg-black/70 hover:bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-cyan-400/50 text-cyan-300 transition-colors shadow-md"
                        title={isMuted ? 'Turn Sound ON' : 'Turn Sound OFF'}
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
                        <span className="text-[10px] font-black">{isMuted ? 'Muted' : 'Sound ON'}</span>
                      </button>
                    )}
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>{reel.duration || '0:45'}</span>
                    </span>
                  </div>
                </div>

                {/* Center Play/Pause Indicator Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-300 ${
                  isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                }`}>
                  <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white backdrop-blur-md border-2 border-white/80 flex items-center justify-center transform group-hover:scale-110 shadow-2xl transition-all">
                    {isPlaying ? (
                      <Pause className="w-7 h-7 fill-white" />
                    ) : (
                      <Play className="w-7 h-7 fill-white translate-x-0.5" />
                    )}
                  </div>
                </div>

                {/* Bottom Caption & Bengali Subtitle */}
                <div className="absolute bottom-4 left-4 right-4 text-left text-white z-20 space-y-1">
                  <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3" />
                    <span>100% Organic Proof</span>
                  </div>
                  <h3 className="text-base font-black leading-tight text-white group-hover:text-cyan-300 transition-colors drop-shadow-md">
                    {reel.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 font-medium drop-shadow-sm">
                    {reel.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-12 text-center">
          <button
            onClick={onOrderNowClick}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Start Your Organic Campaign
          </button>
        </div>
      </div>
    </section>
  );
};
