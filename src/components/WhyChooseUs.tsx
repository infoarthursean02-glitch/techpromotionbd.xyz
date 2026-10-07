import React from 'react';
import { BadgeCheck, DollarSign, Smartphone, ShieldCheck, Headphones, Calendar } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const cards = [
    {
      title: 'Affordable Packages',
      description: 'Transparent BDT pricing starting from just ৳50. Fair rates with no hidden fees or surprise renewals.',
      icon: DollarSign,
    },
    {
      title: 'Professional Service',
      description: 'Strict adherence to organic promotion methods. Safe, steady delivery that preserves account credibility.',
      icon: BadgeCheck,
    },
    {
      title: 'Easy Online Ordering',
      description: 'No complicated signups or passwords needed. Simply input your public Facebook link and submit.',
      icon: Smartphone,
    },
    {
      title: 'Secure Payment',
      description: 'Integrated with Nagorik Pay for automated, SSL-encrypted payments via bKash, Nagad, Rocket and Cards.',
      icon: ShieldCheck,
    },
    {
      title: 'Fast Support',
      description: 'Dedicated 24/7 WhatsApp assistance in Bengali and English. Quick turnaround on all questions.',
      icon: Headphones,
    },
    {
      title: 'Since 2021 Experience',
      description: 'Over 5 years of verified domain experience supporting thousands of Bangladeshi content creators and brands.',
      icon: Calendar,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            Why Partner With Us
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose Tech Promotion BD?
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Trusted by creators, e-commerce shops, and media agencies across Bangladesh since 2021.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/70 hover:bg-white p-7 rounded-3xl border border-slate-100 hover:border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 border border-slate-200/60 flex items-center justify-center mb-5 transition-colors shadow-2xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  {c.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {c.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
