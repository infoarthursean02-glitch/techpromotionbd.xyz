import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, AlertCircle, Download, Printer, MessageCircle, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { trackOrder } from '../lib/api';

interface TrackOrderModalProps {
  onClose: () => void;
  primaryWhatsapp?: string;
  initialOrderId?: string;
  initialPhone?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  onClose,
  primaryWhatsapp = '+8801601300122',
  initialOrderId = '',
  initialPhone = '',
}) => {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  const cleanWaNumber = primaryWhatsapp.replace(/[^0-9]/g, '');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter your Order ID.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await trackOrder(orderId.trim(), phone.trim());
      if (res && res.order) {
        setTrackedOrder(res.order);
      } else {
        setError('No order found with the provided details.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Order not found. Please verify Order ID and Phone Number.');
      setTrackedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!trackedOrder) return;
    const invoiceContent = `
=========================================
TECH PROMOTION BD — ORDER RECEIPT
=========================================
Order ID:        ${trackedOrder.orderNumber}
Date:            ${new Date(trackedOrder.createdAt).toLocaleString()}
Customer Name:   ${trackedOrder.customerName}
WhatsApp:        ${trackedOrder.whatsappNumber}
Service Package: ${trackedOrder.packageName}
Quantity:        ${trackedOrder.quantityDisplay}
Total Price:     ৳${trackedOrder.totalPrice} BDT
Payment Status:  ${trackedOrder.paymentStatus}
Order Status:    ${trackedOrder.orderStatus}
Payment Method:  ${trackedOrder.paymentMethod || 'bKash/Nagad/Rocket'}
Transaction ID:  ${trackedOrder.transactionId || 'Awaiting Verification'}
Target Link:     ${trackedOrder.serviceLink}
${trackedOrder.pageLink ? `Page Link:       ${trackedOrder.pageLink}\n` : ''}
${trackedOrder.videoLinks && trackedOrder.videoLinks.length > 0 ? `Video Links:     ${trackedOrder.videoLinks.join(', ')}\n` : ''}
${trackedOrder.customerNotes ? `Notes:           ${trackedOrder.customerNotes}\n` : ''}
-----------------------------------------
100% Organic Social Media Services — Since 2021
College Road, Thana Para, Gaibandha Sadar, Rangpur
WhatsApp Support: ${primaryWhatsapp}
=========================================
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${trackedOrder.orderNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Track Your Order</h2>
              <p className="text-xs text-slate-400">Real-time status verified directly by Tech Promotion BD</p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Order ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. TPBD-20261005-9206"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-mono placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp / Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. 01601300122 or 017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-mono placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching Order...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check Order Status</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-900/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Search Results Card */}
        {trackedOrder && (
          <div className="p-6 sm:p-7 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Status Banner */}
            {trackedOrder.paymentStatus === 'PAID' ? (
              <div className="bg-emerald-600 text-white p-5 rounded-2xl text-center space-y-1.5 shadow-md">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white mb-2">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black">Order Confirmed!</h3>
                <p className="text-xs text-emerald-100">
                  Payment verified by Admin. Order is currently {trackedOrder.orderStatus === 'COMPLETED' ? 'COMPLETED' : 'IN PROCESSING & QUEUED'} for organic delivery.
                </p>
              </div>
            ) : (
              <div className="bg-amber-500 text-slate-950 p-5 rounded-2xl text-center space-y-1.5 shadow-md">
                <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mx-auto text-slate-950 mb-2">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black">Awaiting Admin Verification</h3>
                <p className="text-xs text-amber-950 font-medium">
                  Your order is placed. Admin will verify your payment details and confirm the order shortly.
                </p>
              </div>
            )}

            {/* Order Meta Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID</span>
                <p className="text-base font-extrabold text-blue-600 font-mono">{trackedOrder.orderNumber}</p>
              </div>
              <div>
                {trackedOrder.paymentStatus === 'PAID' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Payment Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Pending Verification
                  </span>
                )}
              </div>
            </div>

            {/* Details Table */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Customer Name:</span>
                <span className="font-bold text-slate-900">{trackedOrder.customerName}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">WhatsApp Number:</span>
                <span className="font-bold text-slate-900 font-mono">{trackedOrder.whatsappNumber}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Service Package:</span>
                <span className="font-bold text-slate-900">{trackedOrder.packageName}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Quantity:</span>
                <span className="font-bold text-slate-900">{trackedOrder.quantityDisplay}</span>
              </div>

              {/* Target Links */}
              <div className="py-2 border-b border-slate-100 space-y-1.5">
                <span className="text-slate-500 font-medium block">Target Social Link:</span>
                <a
                  href={trackedOrder.serviceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all inline-flex items-center gap-1 font-mono text-xs"
                >
                  <span>{trackedOrder.serviceLink}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>

                {trackedOrder.pageLink && trackedOrder.pageLink !== trackedOrder.serviceLink && (
                  <div className="pt-1">
                    <span className="text-[11px] text-slate-400 font-medium block">Page/Profile Link:</span>
                    <a
                      href={trackedOrder.pageLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all inline-flex items-center gap-1 font-mono text-xs"
                    >
                      <span>{trackedOrder.pageLink}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}

                {trackedOrder.videoLinks && trackedOrder.videoLinks.length > 0 && (
                  <div className="pt-1 space-y-1">
                    <span className="text-[11px] text-slate-400 font-medium block">Included Video Links ({trackedOrder.videoLinks.length}):</span>
                    {trackedOrder.videoLinks.map((vLink, idx) => (
                      <a
                        key={idx}
                        href={vLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all block font-mono text-[11px]"
                      >
                        {idx + 1}. {vLink}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Payment Method:</span>
                <span className="font-bold text-slate-900">{trackedOrder.paymentMethod || 'bKash'}</span>
              </div>

              {trackedOrder.transactionId && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-900">{trackedOrder.transactionId}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-800 font-bold text-base">Total Amount:</span>
                <span className="text-2xl font-black text-emerald-600">৳{trackedOrder.totalPrice} BDT</span>
              </div>
            </div>

            {/* Action Buttons matching User Screenshot */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleDownloadInvoice}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Order Details / Invoice</span>
              </button>

              <a
                href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
                  `Hello Tech Promotion BD, I am tracking my order ${trackedOrder.orderNumber}. Could you please check?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact on WhatsApp with Order ID</span>
              </a>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handlePrint}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Back to Home</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
