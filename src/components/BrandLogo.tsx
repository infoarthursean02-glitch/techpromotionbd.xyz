import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = false, // Defaults to false: Header has no separate "Tech Promotion BD" text
  showTagline = false,
}) => {
  const sizeMap = {
    sm: { img: 'h-10 w-10 sm:h-11 sm:w-11', text: 'text-base', sub: 'text-[10px]' },
    md: { img: 'h-12 w-12 sm:h-14 sm:w-14', text: 'text-lg', sub: 'text-xs' },
    lg: { img: 'h-16 w-16 sm:h-20 sm:w-20', text: 'text-2xl', sub: 'text-sm' },
    xl: { img: 'h-24 w-24 sm:h-28 sm:w-28', text: 'text-3xl', sub: 'text-base' },
  };

  const { img, text, sub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Wireframe Globe with Orbital Ring & Red TECH PROMOTION BD lettering (sadwaefr.png) */}
      <div className={`relative ${img} shrink-0 flex items-center justify-center`}>
        <img
          src="/logo.png"
          alt="Tech Promotion BD Logo"
          className="w-full h-full object-contain filter drop-shadow-sm transition-transform hover:scale-105 duration-200"
          onError={(e) => {
            // High-res SVG fallback in case PNG is loading
            e.currentTarget.src = '/logo.svg';
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-slate-900 ${text}`}>
              Tech Promotion
            </span>
            <span className={`font-black text-blue-600 ${text}`}>
              BD
            </span>
          </div>
          {showTagline && (
            <span className={`text-slate-500 font-medium ${sub}`}>
              100% Organic Social Media Services · Since 2021
            </span>
          )}
        </div>
      )}
    </div>
  );
};
