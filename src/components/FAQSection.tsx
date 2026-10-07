import React, { useState } from 'react';
import { FAQItem } from '../types';
import { ChevronDown, HelpCircle, PhoneCall, MessageCircle } from 'lucide-react';

interface FAQSectionProps {
  faqs: FAQItem[];
  primaryWhatsapp?: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  faqs,
  primaryWhatsapp = '+8801601300122',
}) => {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const cleanWhatsapp = primaryWhatsapp.replace(/[^0-9]/g, '');

  return (
    <section id="faq" className="py-16 md:py-24 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            Got Questions?
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Everything you need to know about our organic promotion services, delivery, and payment.
          </p>
        </div>

        {/* Accordion list */}
        <div className="divide-y divide-slate-100 border-y border-slate-100 mb-16">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="py-4 sm:py-5">
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer focus:outline-hidden"
                >
                  <span className={`text-base sm:text-lg font-semibold transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 bg-blue-50 text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="pt-3 pb-2 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-200">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* "Need Help?" Card Inspired Directly by GP Shield Reference Screenshot 6 */}
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 p-8 sm:p-10 rounded-3xl border border-blue-100/80 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 mx-auto flex items-center justify-center mb-4 shadow-2xs border border-blue-100">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6">
            Our Dhaka & Gaibandha customer success team is available 24/7 on WhatsApp to guide you through package selection.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello Tech Promotion BD, I have a question regarding social media services.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
