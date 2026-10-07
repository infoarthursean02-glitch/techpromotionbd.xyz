import React from 'react';
import { Layers, Link2, CreditCard, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onOrderNowClick: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOrderNowClick }) => {
  const steps = [
    {
      num: '01',
      title: 'Choose Your Service & Package',
      description: 'Select from our Entry, Core, Premium or VIP tiers tailored to your target views, follower volume and engagement goal.',
      icon: Layers,
    },
    {
      num: '02',
      title: 'Submit Your Link & Information',
      description: 'Enter your Bangladeshi WhatsApp number and provide your Facebook page, video, or profile link in seconds.',
      icon: Link2,
    },
    {
      num: '03',
      title: 'Complete Payment & Get Started',
      description: 'Pay securely using Nagorik Pay (bKash, Nagad, Rocket, Upay or Card). Your campaign starts delivering within 15–60 minutes.',
      icon: CreditCard,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-slate-50/60 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            Simple & Transparent Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            3 Easy Steps to Grow Your Social Media
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            No complicated contracts or password sharing required. Simple, instant, and 100% organic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-200">
                      {s.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center text-xs font-semibold text-blue-600">
                  <span>Step {idx + 1} of 3</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onOrderNowClick}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Start Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
