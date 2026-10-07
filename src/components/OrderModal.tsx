import React, { useState } from 'react';
import { Package, Order } from '../types';
import { createOrder } from '../lib/api';
import { analytics } from '../lib/analytics';
import {
  X,
  Plus,
  Minus,
  AlertCircle,
  ArrowRight,
  Loader2,
  Tag,
  CheckCircle2,
  Trash2,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Link2,
  MapPin,
} from 'lucide-react';

interface OrderModalProps {
  packages: Package[];
  initialPackage?: Package | null;
  initialMultiplier?: number;
  onClose: () => void;
  onProceedToPayment: (order: Order) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  packages,
  initialPackage,
  initialMultiplier = 1,
  onClose,
  onProceedToPayment,
}) => {
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    initialPackage?.id || packages[0]?.id || ''
  );
  const [multiplier, setMultiplier] = useState<number>(initialMultiplier);
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [clientLocation, setClientLocation] = useState('');

  // Service-specific link inputs
  const [pageLink, setPageLink] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [additionalLinks, setAdditionalLinks] = useState<string[]>([]);
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment method selection & Transaction ID
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Nagorik Pay'>('bKash');
  const [transactionId, setTransactionId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Promo Code State (TechPromotionBD)
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [showPromoBanner, setShowPromoBanner] = useState(true);

  const currentPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];

  // Detect which links are required based on package type
  const pkgNameLower = (currentPkg?.name || '').toLowerCase();
  const pkgDescLower = (currentPkg?.description || '').toLowerCase();
  const pkgCat = currentPkg?.category;

  const requiresPageLink =
    pkgNameLower.includes('follow') ||
    pkgNameLower.includes('page') ||
    pkgDescLower.includes('page') ||
    pkgDescLower.includes('follower') ||
    pkgCat === 'premium' ||
    pkgCat === 'vip' ||
    currentPkg?.quantityLabel.toLowerCase().includes('follow');

  const requiresVideoLink =
    pkgNameLower.includes('view') ||
    pkgNameLower.includes('stream') ||
    pkgNameLower.includes('video') ||
    pkgDescLower.includes('video') ||
    pkgDescLower.includes('view') ||
    pkgCat === 'entry' ||
    pkgCat === 'core' ||
    pkgCat === 'vip';

  // Dynamic calculations based on unlimited multiplier system
  const rawPrice = currentPkg
    ? currentPkg.allowQuantityIncrease
      ? currentPkg.basePrice + (multiplier - 1) * currentPkg.priceStep
      : currentPkg.basePrice
    : 0;

  // Requirement: 10% rate reduction without mentioning percent
  const discountAmount = appliedPromo ? Math.round(rawPrice * 0.10) : 0;
  const finalPrice = Math.max(1, rawPrice - discountAmount);

  // Multiplier change
  const handleMultiplierChange = (delta: number) => {
    setMultiplier((prev) => Math.max(1, prev + delta));
  };

  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply || promoInput).trim();
    if (!code) return;

    if (code.toLowerCase() === 'techpromotionbd') {
      setAppliedPromo('TechPromotionBD');
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Please enter TechPromotionBD');
    }
  };

  const handleAddExtraLink = () => {
    setAdditionalLinks((prev) => [...prev, '']);
  };

  const handleUpdateExtraLink = (index: number, val: string) => {
    setAdditionalLinks((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveExtraLink = (index: number) => {
    setAdditionalLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const cleanPhone = whatsappNumber.replace(/[\s\-]/g, '');
    const bdPhoneRegex = /^(?:\+?880|0)?1[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 11-digit Bangladeshi mobile/WhatsApp number (e.g. 01712345678).');
      return;
    }

    // Determine primary link
    const primaryLink = (pageLink || videoLink || '').trim();
    if (!primaryLink && !requiresPageLink && !requiresVideoLink) {
      setErrorMsg('Please enter at least one valid Facebook link.');
      return;
    }

    if (requiresPageLink && !pageLink.trim()) {
      setErrorMsg('Please enter your Facebook Page or Profile link for follower growth.');
      return;
    }

    if (requiresVideoLink && !videoLink.trim()) {
      setErrorMsg('Please enter your Facebook Video or Post link for views / engagement.');
      return;
    }

    if (paymentMethod !== 'Nagorik Pay' && !transactionId.trim()) {
      setErrorMsg(`Please enter the Transaction ID (TrxID) for your ${paymentMethod} payment.`);
      return;
    }

    setIsSubmitting(true);

    try {
      analytics.initiateCheckout(currentPkg.name, finalPrice);
      analytics.lead(customerName, currentPkg.name);

      const cleanExtra = additionalLinks.map((l) => l.trim()).filter(Boolean);
      const videoLinksList = videoLink.trim() ? [videoLink.trim(), ...cleanExtra] : cleanExtra;

      const res = await createOrder({
        customerName: customerName.trim(),
        whatsappNumber: cleanPhone,
        clientLocation: clientLocation.trim() || undefined,
        serviceLink: primaryLink,
        pageLink: pageLink.trim() || undefined,
        videoLinks: videoLinksList.length > 0 ? videoLinksList : undefined,
        additionalLinks: cleanExtra.length > 0 ? cleanExtra : undefined,
        packageId: currentPkg.id,
        multiplier: currentPkg.allowQuantityIncrease ? multiplier : 1,
        promoCode: appliedPromo || undefined,
        paymentMethod,
        transactionId: transactionId.trim() || undefined,
        customerNotes: customerNotes.trim() || undefined,
      });

      if (res.success && res.order) {
        if (appliedPromo) {
          res.order.promoCode = appliedPromo;
          res.order.discountApplied = discountAmount;
          res.order.totalPrice = finalPrice;
        }
        onProceedToPayment(res.order);
      } else {
        throw new Error(res.message || 'Failed to submit order.');
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8 animate-in zoom-in-95 duration-200 text-left">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Order Form</span>
            <h3 className="text-xl font-bold text-white">Service Package Checkout</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Promo Code Pop-up Banner */}
        {showPromoBanner && !appliedPromo && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 px-6 flex items-center justify-between gap-3 text-xs shadow-inner">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                Use promo code <strong className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold">TechPromotionBD</strong> for an instant rate discount!
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleApplyPromo('TechPromotionBD')}
                className="px-2.5 py-1 bg-white text-blue-700 font-bold rounded-lg text-[11px] hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => setShowPromoBanner(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Package Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Selected Service Package
            </label>
            <select
              value={selectedPkgId}
              onChange={(e) => {
                setSelectedPkgId(e.target.value);
                setMultiplier(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.category.toUpperCase()}] {p.name} — ৳{p.basePrice} ({p.quantityLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Selector: Unlimited volume adjustment */}
          {currentPkg?.allowQuantityIncrease && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Adjust Volume: unlimited</p>
                <p className="text-[11px] text-slate-500">Scale package quantity to any multiplier</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMultiplierChange(-1)}
                  disabled={multiplier <= 1}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer shadow-2xs"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={multiplier}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setMultiplier(isNaN(v) || v < 1 ? 1 : v);
                  }}
                  className="w-16 text-center font-black text-sm py-1.5 rounded-xl bg-white border border-slate-200 tabular-nums focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => handleMultiplierChange(1)}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Mobile Number (Bangladesh) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Order updates and tracking verification will be sent to this WhatsApp number.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Location / District (Bangladesh)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={clientLocation}
                  onChange={(e) => setClientLocation(e.target.value)}
                  placeholder="e.g. Dhaka, Chittagong, Sylhet, etc."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Gazipur'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setClientLocation(city)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      clientLocation === city
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Service-Specific Links (Page/Profile & Video Links) */}
          <div className="space-y-3.5 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Link2 className="w-4 h-4 text-blue-600" />
              <span>Target Social Media Links</span>
            </div>

            {/* If package includes page/profile followers */}
            {requiresPageLink && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facebook Page / Profile Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={pageLink}
                  onChange={(e) => setPageLink(e.target.value)}
                  placeholder="https://www.facebook.com/yourpage or profile"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            {/* If package includes video views / watch time / reactions */}
            {requiresVideoLink && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facebook Video / Post Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  placeholder="https://www.facebook.com/watch/?v=... or video URL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            {/* Fallback link field if neither matched */}
            {!requiresPageLink && !requiresVideoLink && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Social Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  placeholder="https://www.facebook.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            {/* Dynamic Opportunity Links: (e.g. Up to 5 Videos, Up to 10 Videos) */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 block">
                    Package Opportunity: {currentPkg?.optionalOpportunity || 'Standard'}
                  </span>
                  <p className="text-[11px] text-blue-700">
                    Add multiple links if you wish to split promotion according to opportunity.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddExtraLink}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link</span>
                </button>
              </div>

              {additionalLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleUpdateExtraLink(idx, e.target.value)}
                    placeholder={`Additional Link #${idx + 2} (Facebook video or page)`}
                    className="flex-1 px-3 py-2 rounded-xl border border-blue-200 text-xs bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExtraLink(idx)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100/50 rounded-xl cursor-pointer"
                    title="Remove Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Notes / Specific Instructions (Optional)
              </label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={2}
                placeholder="Mention any custom distribution or delivery instructions..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Section 3: Payment Method & Verification */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Payment Method & Verification
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Admin Verified
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'bKash', label: 'bKash', color: 'border-pink-500 text-pink-600 bg-pink-50/50' },
                { id: 'Nagad', label: 'Nagad', color: 'border-orange-500 text-orange-600 bg-orange-50/50' },
                { id: 'Rocket', label: 'Rocket', color: 'border-purple-500 text-purple-600 bg-purple-50/50' },
                { id: 'Nagorik Pay', label: 'Nagorik Pay', color: 'border-blue-500 text-blue-600 bg-blue-50/50' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as typeof paymentMethod)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    paymentMethod === m.id
                      ? `${m.color} ring-2 ring-blue-500 shadow-xs font-black`
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Account Details based on selected payment */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
              {paymentMethod === 'bKash' && (
                <>
                  <p className="font-semibold text-slate-800">bKash Personal (Send Money):</p>
                  <p className="font-mono font-bold text-pink-600 text-sm">01601300122 / 01795315431</p>
                  <p className="text-[11px] text-slate-500">Send ৳{finalPrice} BDT to either number and enter the TrxID below.</p>
                </>
              )}
              {paymentMethod === 'Nagad' && (
                <>
                  <p className="font-semibold text-slate-800">Nagad Personal (Send Money):</p>
                  <p className="font-mono font-bold text-orange-600 text-sm">01601300122</p>
                  <p className="text-[11px] text-slate-500">Send ৳{finalPrice} BDT to this number and enter the TrxID below.</p>
                </>
              )}
              {paymentMethod === 'Rocket' && (
                <>
                  <p className="font-semibold text-slate-800">Rocket Personal:</p>
                  <p className="font-mono font-bold text-purple-600 text-sm">01601300122-8</p>
                  <p className="text-[11px] text-slate-500">Send ৳{finalPrice} BDT to this number and enter the TrxID below.</p>
                </>
              )}
              {paymentMethod === 'Nagorik Pay' && (
                <>
                  <p className="font-semibold text-slate-800">Nagorik Pay Automatic Payment:</p>
                  <p className="text-[11px] text-slate-600">Online automatic verification with instant dispatch queue.</p>
                </>
              )}
            </div>

            {/* Transaction ID Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transaction ID (TrxID) / Payment Reference <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 9K72BXYZ or NAG-..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Admin verifies this transaction ID to confirm your order.
              </span>
            </div>
          </div>

          {/* Promo Code Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold text-slate-700">Promo Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter promo code (e.g. TechPromotionBD)"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono uppercase"
              />
              <button
                type="button"
                onClick={() => handleApplyPromo()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-[11px] text-red-600">{promoError}</p>}
            {appliedPromo && (
              <div className="flex items-center justify-between text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Promo Applied: {appliedPromo}
                </span>
                <span className="tabular-nums">-৳{discountAmount.toLocaleString()} BDT</span>
              </div>
            )}
          </div>

          {/* Pricing & Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] text-slate-400">Total Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tabular-nums">
                  ৳{finalPrice.toLocaleString()}
                </span>
                {appliedPromo && (
                  <span className="text-xs text-slate-400 line-through tabular-nums">
                    ৳{rawPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-500">BDT</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <span>Submit Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
