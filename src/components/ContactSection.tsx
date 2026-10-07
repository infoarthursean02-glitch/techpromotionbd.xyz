import React from 'react';
import { SiteSettings } from '../types';
import { MessageCircle, Mail, MapPin, Phone, Send } from 'lucide-react';

interface ContactSectionProps {
  settings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const pWhatsappClean = settings.primaryWhatsapp.replace(/[^0-9]/g, '');
  const aWhatsappClean = settings.alternativeWhatsapp.replace(/[^0-9]/g, '');

  return (
    <section id="contact" className="py-16 md:py-24 bg-slate-50/70 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            Get In Touch
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact Tech Promotion BD
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Have custom requirements or need large volume enterprise campaigns? Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary WhatsApp Card */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-md transition-shadow text-left flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Primary WhatsApp (24/7)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Fastest support for new orders and live campaign status
              </p>
              <p className="text-sm font-extrabold text-slate-900">
                {settings.primaryWhatsapp}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Alt: {settings.alternativeWhatsapp}
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <a
                href={`https://wa.me/${pWhatsappClean}?text=${encodeURIComponent('Hello Tech Promotion BD, I would like to consult on social media growth.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Email Support Card */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-md transition-shadow text-left flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Official Email
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                For invoices, B2B agency partnerships and enterprise agreements
              </p>
              <p className="text-sm font-extrabold text-slate-900 break-all">
                {settings.email}
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <a
                href={`mailto:${settings.email}?subject=Tech%20Promotion%20BD%20Inquiry`}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
            </div>
          </div>

          {/* Office Address Card */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-md transition-shadow text-left flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Office Location
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Registered physical workplace in Gaibandha, Rangpur
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                {settings.address}
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View Gaibandha Sadar</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
