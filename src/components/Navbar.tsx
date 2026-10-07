import React from 'react';
import { BrandLogo } from './BrandLogo';
import { MessageCircle, Headphones, ShieldCheck, Search } from 'lucide-react';

interface NavbarProps {
  onOrderNowClick: () => void;
  onAdminClick: () => void;
  onTrackOrderClick: () => void;
  primaryWhatsapp?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOrderNowClick,
  onAdminClick,
  onTrackOrderClick,
  primaryWhatsapp = '+8801601300122',
}) => {
  const cleanWhatsappNumber = primaryWhatsapp.replace(/[^0-9]/g, '');
  const defaultWhatsappMessage = encodeURIComponent(
    'Hello Tech Promotion BD, I want to know more about your social media services.'
  );
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${defaultWhatsappMessage}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Wordmark & Logo (Left) */}
        <a href="#home" className="flex items-center group cursor-pointer focus:outline-hidden">
          <BrandLogo size="md" showTagline={false} />
        </a>

        {/* Clean Action Controls (Right) — Matches GP Shield reference header */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Headset / Support Icon (Directly inspired by GP Shield top-right support icon) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="24/7 Customer Support"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            aria-label="Customer Support"
          >
            <Headphones className="w-5 h-5 text-slate-700 hover:text-blue-600" />
            <span className="hidden sm:inline text-xs font-semibold text-slate-700">Support</span>
          </a>

          {/* Track Order Button (Right next to Support) */}
          <button
            onClick={onTrackOrderClick}
            title="Track Order by Order ID and Phone Number"
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200/80 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs"
            aria-label="Track Order"
          >
            <Search className="w-3.5 h-3.5 text-blue-600" />
            <span>Track Order</span>
          </button>

          {/* Admin shortcut button */}
          <button
            onClick={onAdminClick}
            title="Admin Dashboard"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            aria-label="Admin Access"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>

          {/* WhatsApp Direct Chat */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-xl transition-all shadow-2xs whitespace-nowrap cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
            <span>WhatsApp</span>
          </a>

          {/* Primary Order Now Button */}
          <button
            onClick={onOrderNowClick}
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm hover:shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            Order Now
          </button>
        </div>
      </div>
    </header>
  );
};
