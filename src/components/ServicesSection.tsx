import React, { useState } from 'react';
import { Package, ServiceCategory } from '../types';
import { Check, Plus, Minus, Sparkles } from 'lucide-react';

interface ServicesSectionProps {
  packages: Package[];
  onSelectPackage: (pkg: Package, multiplier: number) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  packages,
  onSelectPackage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('entry');
  const [multipliers, setMultipliers] = useState<Record<string, number>>({});

  const categories: { id: ServiceCategory; name: string; range: string; dot: string }[] = [
    { id: 'entry', name: 'Entry', range: '৳50 – ৳499', dot: 'bg-emerald-500' },
    { id: 'core', name: 'Core', range: '৳999 – ৳4,999', dot: 'bg-blue-500' },
    { id: 'premium', name: 'Premium', range: '৳5,000 – ৳35,000+', dot: 'bg-purple-500' },
    { id: 'vip', name: 'VIP', range: '৳40,000 – ৳100,000', dot: 'bg-rose-500' },
  ];

  const filteredPackages = packages.filter((p) => p.category === selectedCategory);

  const getMultiplier = (pkgId: string) => multipliers[pkgId] || 1;

  // Requirement 2: Unlimited volume adjustment
  const handleMultiplierChange = (pkg: Package, delta: number) => {
    const current = getMultiplier(pkg.id);
    const next = Math.max(1, current + delta);
    setMultipliers((prev) => ({ ...prev, [pkg.id]: next }));
  };

  const handleDirectMultiplierInput = (pkg: Package, val: string) => {
    const parsed = parseInt(val, 10);
    const safeVal = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    setMultipliers((prev) => ({ ...prev, [pkg.id]: safeVal }));
  };

  return (
    <section id="packages" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-2">
            Transparent Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Choose Your Growth Package
          </h2>
          <p className="text-slate-600 mt-3 text-base sm:text-lg font-medium">
            100% organic promotion with instant activation. Use promo code for exclusive discounts.
          </p>
        </div>

        {/* Category Navigation Tabs (Bold Styling) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-14">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2.5 px-5 sm:px-7 py-3.5 rounded-2xl text-sm sm:text-base font-extrabold transition-all cursor-pointer border-2 shadow-xs ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-102'
                    : 'bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${cat.dot} shrink-0`} />
                <span className="font-black tracking-tight">{cat.name}</span>
                <span className={`text-xs sm:text-sm font-bold ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                  ({cat.range})
                </span>
              </button>
            );
          })}
        </div>

        {/* Service Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {filteredPackages.map((pkg) => {
            const mult = getMultiplier(pkg.id);
            const currentPrice = pkg.allowQuantityIncrease
              ? pkg.basePrice + (mult - 1) * pkg.priceStep
              : pkg.basePrice;

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
              >
                {/* Popular or Best Value Badge */}
                {pkg.popularBadge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                      <Sparkles className="w-3 h-3 fill-white" />
                      {pkg.popularBadge}
                    </span>
                  </div>
                )}

                {/* Card Top: 1:1 Unique Image for each package */}
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-85" />

                  {/* Clean Category Badge on image (Bonus removed per instruction 1) */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                    <span className="uppercase tracking-wider text-[11px] font-bold bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      {pkg.category} Category
                    </span>
                    <span className="text-[11px] font-bold bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-lg text-emerald-400">
                      100% Organic
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    {/* Unique distinct service name */}
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Requirement 2: Unlimited Volume Adjustment */}
                  {pkg.allowQuantityIncrease ? (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        Adjust Volume:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMultiplierChange(pkg, -1)}
                          disabled={mult <= 1}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={mult}
                          onChange={(e) => handleDirectMultiplierInput(pkg, e.target.value)}
                          className="w-14 text-center font-bold text-xs py-1 rounded-lg bg-white border border-slate-200 tabular-nums focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleMultiplierChange(pkg, 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-2xs"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Feature Highlights */}
                  {pkg.features && (
                    <ul className="space-y-2 text-xs text-slate-600 pt-1">
                      {pkg.features.slice(0, 4).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Optional Opportunity Spec */}
                  <div className="text-xs text-slate-500 font-medium py-1.5 px-3 bg-slate-50 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Opportunity:</span>
                    <span className="font-semibold text-slate-700">{pkg.optionalOpportunity}</span>
                  </div>

                  {/* Price & CTA */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-medium">Price: </span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                          ৳{currentPrice.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Tax & VAT Included
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectPackage(pkg, mult)}
                      className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-center shadow-sm hover:shadow-md transition-all text-sm cursor-pointer flex items-center justify-center gap-2 group-hover:bg-blue-700"
                    >
                      <span>Order Now</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
