import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onOrderNowClick: () => void;
  heroVideoUrl?: string;
  heroVideoPoster?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOrderNowClick,
  heroVideoUrl,
  heroVideoPoster = '/src/assets/images/hero_cinematic_banner_1791233752016.jpg',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  return (
    <section id="home" className="pt-10 pb-16 md:pt-16 md:pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Modern & Minimalistic Sans-Serif Headline */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50/90 px-3.5 py-1.5 rounded-full border border-blue-100">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Tech Promotion BD · Since 2021</span>
              </div>

              {/* Modern Minimalist Sans-Serif "Grow Faster. Reach Further." */}
              <h1 className="font-modern-minimal text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold text-slate-900 tracking-[-0.04em] leading-[1.05] text-balance">
                Grow Faster. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 font-black">
                  Reach Further.
                </span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
              100% organic Facebook growth, followers, video views, and engagement services designed for creators, businesses, and brands across Bangladesh.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOrderNowClick}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm sm:text-base transition-all shadow-sm hover:shadow-md cursor-pointer tracking-wide flex items-center gap-2"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#packages"
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm sm:text-base transition-all cursor-pointer"
              >
                View Packages
              </a>
            </div>
          </div>

          {/* Right Column: 16:9 Video Showcase with Min 500MB Video Support */}
          <div className="lg:col-span-6">
            <div
              onClick={togglePlay}
              className="relative aspect-16/9 w-full rounded-3xl overflow-hidden bg-black shadow-2xl border border-slate-900 group cursor-pointer"
            >
              {heroVideoUrl ? (
                <video
                  ref={videoRef}
                  src={heroVideoUrl}
                  poster={heroVideoPoster}
                  muted={isMuted}
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={heroVideoPoster}
                  alt="Tech Promotion BD Video Campaign"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105 filter brightness-110' : 'group-hover:scale-102'
                  }`}
                />
              )}

              {/* Dark subtle gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/50 pointer-events-none" />

              {/* Top-Left: Glowing Cyan Brand Insignia */}
              <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-cyan-400/20 backdrop-blur-md border border-cyan-400/40 flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-cyan-400 fill-cyan-400">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 12a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 drop-shadow-sm">
                  Tech Promotion BD
                </span>
              </div>

              {/* Center: Interactive Play/Pause button */}
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-md text-white border border-white/50 flex items-center justify-center transition-all transform group-hover:scale-110 shadow-xl pointer-events-auto">
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-white" />
                  ) : (
                    <Play className="w-7 h-7 fill-white translate-x-0.5" />
                  )}
                </div>
              </div>

              {/* Bottom-Right: Bengali Slogan overlay */}
              <div className="absolute bottom-5 right-6 z-20 text-right pointer-events-none">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide drop-shadow-md">
                  ১০০% অর্গানিক প্রোমোশন
                </p>
                <p className="text-[11px] font-medium text-cyan-300 tracking-wider">
                  REAL BANGLADESH REACH · SINCE 2021
                </p>
              </div>

              {/* Video control buttons (Mute/Unmute) */}
              <div className="absolute bottom-5 left-5 z-20 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
