import React from 'react';
import { MessageCircle, ShoppingBag } from 'lucide-react';

interface MobileStickyCTAProps {
  onOrderNowClick: () => void;
  primaryWhatsapp?: string;
}

export const MobileStickyCTA: React.FC<MobileStickyCTAProps> = ({
  onOrderNowClick,
  primaryWhatsapp = '+8801601300122',
}) => {
  const cleanWhatsapp = primaryWhatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
      {/* WhatsApp Quick Action */}
      <a
        href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello Tech Promotion BD, I want to place an order.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 py-2.5 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 active:bg-emerald-100 transition-colors"
      >
        <MessageCircle className="w-4 h-4 text-emerald-600" />
        <span>WhatsApp</span>
      </a>

      {/* Primary Order Now Button */}
      <button
        onClick={onOrderNowClick}
        className="flex-2 py-2.5 px-4 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:bg-blue-700 transition-colors cursor-pointer"
      >
        <ShoppingBag className="w-4 h-4" />
        <span>Order Now (From ৳50)</span>
      </button>
    </div>
  );
};
