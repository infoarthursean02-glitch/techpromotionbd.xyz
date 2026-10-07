import React from 'react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

interface GlobalBonusBannerProps {
  bonusPercent?: number;
  onExploreClick?: () => void;
}

export const GlobalBonusBanner: React.FC<GlobalBonusBannerProps> = ({
  bonusPercent = 15,
  onExploreClick,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 text-white text-xs sm:text-sm py-2 px-4 shadow-inner relative overflow-hidden">
      {/* Background ambient pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2 font-medium truncate">
          <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full text-xs font-bold text-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            Global Server Bonus
          </span>
          <span className="truncate">
            <strong className="text-white font-semibold">+{bonusPercent}% Extra Delivery</strong> added automatically to all packages based on live global server updates!
          </span>
        </div>

        {onExploreClick && (
          <button
            onClick={onExploreClick}
            className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-white/90 hover:text-white underline decoration-white/50 hover:decoration-white transition-all shrink-0 cursor-pointer"
          >
            Claim Today
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
