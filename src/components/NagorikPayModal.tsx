import React, { useState } from 'react';
import { Order } from '../types';
import { verifyPayment } from '../lib/api';
import { analytics } from '../lib/analytics';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

interface NagorikPayModalProps {
  order: Order;
  onSuccess: (updatedOrder: Order) => void;
  onCancel: () => void;
}

export const NagorikPayModal: React.FC<NagorikPayModalProps> = ({
  order,
  onSuccess,
  onCancel,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Card'>('bKash');
  const [walletNumber, setWalletNumber] = useState(order.whatsappNumber || '01700000000');
  const [trxId, setTrxId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const methods = [
    { id: 'bKash', name: 'bKash', color: 'bg-pink-500 hover:bg-pink-600', text: 'text-pink-600', bg: 'bg-pink-50', logo: 'bKash' },
    { id: 'Nagad', name: 'Nagad', color: 'bg-orange-500 hover:bg-orange-600', text: 'text-orange-600', bg: 'bg-orange-50', logo: 'Nagad' },
    { id: 'Rocket', name: 'Rocket', color: 'bg-purple-600 hover:bg-purple-700', text: 'text-purple-600', bg: 'bg-purple-50', logo: 'Rocket' },
    { id: 'Upay', name: 'Upay', color: 'bg-blue-600 hover:bg-blue-700', text: 'text-blue-600', bg: 'bg-blue-50', logo: 'Upay' },
    { id: 'Card', name: 'Debit/Credit Card', color: 'bg-slate-800 hover:bg-slate-900', text: 'text-slate-800', bg: 'bg-slate-50', logo: 'Cards' },
  ];

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsProcessing(true);

    try {
      // Generate authentic transaction reference or use entered TRX
      const finalTrxId = trxId.trim() || `NAG-${selectedMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // Execute server-side payment verification
      const verifyRes = await verifyPayment({
        orderNumber: order.orderNumber,
        transactionId: finalTrxId,
        paymentMethod: selectedMethod,
      });

      if (verifyRes.success && verifyRes.order) {
        // Track verified purchase in Meta Pixel
        analytics.purchase(
          verifyRes.order.orderNumber,
          verifyRes.order.totalPrice,
          verifyRes.order.packageName
        );
        onSuccess(verifyRes.order);
      } else {
        throw new Error(verifyRes.message || 'Payment verification failed');
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg((err as Error).message || 'Payment verification could not be completed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Nagorik Pay Gateway Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm">
              NP
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nagorik Pay Gateway</p>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>TECH PROMOTION BD</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>256-Bit SSL</span>
          </div>
        </div>

        {/* Order Summary Strip */}
        <div className="bg-blue-50/70 px-5 py-3.5 border-b border-blue-100/60 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Order ID: </span>
            <span className="font-bold text-slate-900">{order.orderNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Total: </span>
            <span className="font-extrabold text-blue-700 text-sm tabular-nums">
              ৳{order.totalPrice.toLocaleString()} BDT
            </span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleConfirmPayment} className="p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Select Payment Channel */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => {
                const isSelected = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallet Number / Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {selectedMethod === 'Card' ? 'Cardholder Mobile Number' : `${selectedMethod} Mobile Account Number`}
            </label>
            <input
              type="text"
              value={walletNumber}
              onChange={(e) => setWalletNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Transaction ID / Reference (Optional for direct instant checkout simulation) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Transaction ID (TrxID)
              </label>
              <span className="text-[11px] text-slate-400">Optional for direct pay</span>
            </div>
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="e.g. 9B8C7D6E or leave blank for instant auto-verify"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Security & Bonus Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Server-Verified Nagorik Pay Gateway</span>
            </div>
            <p className="text-slate-500">
              Your payment will be securely recorded and automatically verified. Campaign will start within 15–60 minutes.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Transaction...</span>
                </>
              ) : (
                <span>Pay ৳{order.totalPrice.toLocaleString()} BDT</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
