import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { ShieldCheck } from 'lucide-react';

interface StatsSectionProps {
  settings: SiteSettings;
  onOrderNowClick: () => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  settings,
  onOrderNowClick,
}) => {
  // Dates matching the timeline pattern in Image 2
  const timelineDates = ['Jul-06', 'Jul-18', 'Jul-30', 'Aug-11', 'Aug-23', 'Sep-04', 'Sep-16', 'Sep-28'];

  // Height values for the vertical bars matching the density and look of Image 2
  const barHeights = [
    32, 28, 48, 22, 40, 44, 52, 100, 48, 54, 38, 46, 58, 62, 55, 68,
    42, 60, 50, 45, 52, 48, 58, 64, 52, 60, 66, 72, 64, 76, 56, 110,
    62, 48, 52, 58, 66, 55, 62, 50, 54, 48, 50, 52, 56, 45, 48, 52,
    55, 60, 58, 64, 62, 60, 54, 66, 58, 62, 68, 72, 70, 65, 102, 68,
    74, 82, 70, 78, 85, 60
  ];

  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title matching Image 2 */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-8">
          Campaigns Delivered by Tech Promotion BD
        </h2>

        {/* Center Pill Card matching Image 2 */}
        <div className="inline-flex items-center gap-6 bg-[#EDF5FF] px-6 py-3.5 rounded-2xl border border-blue-100 shadow-2xs mb-10 text-left">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-8 text-xs sm:text-sm">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Total Delivered</p>
              <p className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                {settings.statTotalViews || '9696.6 M'}
              </p>
            </div>

            <div className="h-7 w-px bg-blue-200" />

            <div>
              <p className="text-[11px] text-slate-500 font-medium">Total Engagement</p>
              <p className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                {settings.statTotalEngagement || '19.3 M'}
              </p>
            </div>
          </div>
        </div>

        {/* Dense Cyan Bar Chart matching Image 2 */}
        <div className="w-full max-w-4xl mx-auto mb-4">
          <div className="h-44 sm:h-52 flex items-end justify-between gap-0.5 sm:gap-1 px-2 border-b border-slate-200 pb-1">
            {barHeights.map((h, idx) => (
              <div
                key={idx}
                style={{ height: `${h}%` }}
                className="flex-1 bg-[#00D2FF] hover:bg-blue-600 rounded-xs transition-colors cursor-pointer min-w-[2px] sm:min-w-[4px]"
                title={`Day ${idx + 1}: ${(h * 12.5).toFixed(0)}K Impressions`}
              />
            ))}
          </div>

          {/* Date Axis matching Image 2 */}
          <div className="flex justify-between text-[10px] sm:text-xs text-slate-400 pt-2 px-1 font-medium">
            {timelineDates.map((date, idx) => (
              <span key={idx}>{date}</span>
            ))}
          </div>
        </div>

        {/* Centered Blue Action Button matching Image 2 */}
        <div className="mt-8">
          <button
            onClick={onOrderNowClick}
            className="px-7 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-all shadow-xs cursor-pointer"
          >
            Order Now
          </button>
        </div>
      </div>
    </section>
  );
};
