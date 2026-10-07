import React from 'react';
import { Order } from '../types';
import { CheckCircle2, MessageCircle, ArrowLeft, Download, Printer, ShieldCheck } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
  primaryWhatsapp?: string;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  primaryWhatsapp = '+8801601300122',
}) => {
  const cleanPhone = primaryWhatsapp.replace(/[^0-9]/g, '');

  const waMessage = encodeURIComponent(
    `Hello Tech Promotion BD,\n\nI have completed payment for my order!\n\nOrder ID: ${order.orderNumber}\nService: ${order.packageName}\nQuantity: ${order.quantityDisplay}\nTotal Paid: ৳${order.totalPrice} BDT\nLink: ${order.serviceLink}\n\nPlease proceed with my campaign delivery.`
  );

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  // Requirement 4: Direct Download of Order Details
  const handleDownloadOrderDetails = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${order.orderNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; background: #fff; }
    .invoice-card { max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 900; color: #0f172a; }
    .brand span { color: #2563eb; }
    .badge { background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 12px; rounded-full; border-radius: 9999px; }
    .table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .table th { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; }
    .total-row { font-size: 18px; font-weight: 800; color: #0f172a; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand">Tech Promotion <span>BD</span></div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">100% Organic Social Media Services</div>
      </div>
      <div>
        <span class="badge">PAID (Nagorik Pay Verified)</span>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 20px;">
      <div>
        <strong>Billed To:</strong><br>
        ${order.customerName}<br>
        WhatsApp: ${order.whatsappNumber}
      </div>
      <div style="text-align: right;">
        <strong>Order ID:</strong> ${order.orderNumber}<br>
        <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
        <strong>Txn ID:</strong> ${order.transactionId || 'NAG-AUTO-VERIFIED'}
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Service Package</th>
          <th>Quantity</th>
          <th style="text-align: right;">Amount (BDT)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${order.packageName}</strong><br><small style="color: #64748b;">${order.serviceLink}</small></td>
          <td>${order.quantityDisplay}</td>
          <td style="text-align: right;">৳${order.totalPrice.toLocaleString()}</td>
        </tr>
        ${order.discountApplied ? `
        <tr style="color: #16a34a;">
          <td colspan="2">Promo Discount (${order.promoCode || 'TechPromotionBD'})</td>
          <td style="text-align: right;">-৳${order.discountApplied.toLocaleString()}</td>
        </tr>` : ''}
        <tr class="total-row">
          <td colspan="2">Total Paid</td>
          <td style="text-align: right; color: #16a34a;">৳${order.totalPrice.toLocaleString()} BDT</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      College Road, Thana Para, Gaibandha Sadar, Rangpur, Bangladesh - 5700<br>
      WhatsApp: +8801601300122 | Email: techpromotionbd@gmail.com<br>
      Thank you for choosing Tech Promotion BD!
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${order.orderNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Success Banner */}
        <div className={`p-6 text-center space-y-2 relative overflow-hidden text-white ${
          order.paymentStatus === 'PAID' ? 'bg-emerald-600' : 'bg-blue-600'
        }`}>
          <div className="w-14 h-14 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">
            {order.paymentStatus === 'PAID' ? 'Order Confirmed!' : 'Order Placed!'}
          </h3>
          <p className="text-xs text-white/90 font-medium max-w-sm mx-auto">
            {order.paymentStatus === 'PAID'
              ? 'Payment verified. Order is now queued for organic delivery.'
              : 'Order submitted with payment details! Tech Promotion BD admin will verify your payment and confirm your order.'}
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-6 space-y-5 text-left">
          {/* Order ID & Status Badge */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order ID</p>
              <p className="text-base font-extrabold text-blue-600 font-mono tabular-nums">
                {order.orderNumber}
              </p>
            </div>
            <div className="text-right">
              {order.paymentStatus === 'PAID' ? (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Payment Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Awaiting Verification
                </span>
              )}
            </div>
          </div>

          {/* Detailed Itemized List */}
          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 font-medium">Customer Name:</span>
              <span className="font-semibold text-slate-800">{order.customerName}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 font-medium">WhatsApp Number:</span>
              <span className="font-semibold text-slate-800">{order.whatsappNumber}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 font-medium">Service Package:</span>
              <span className="font-bold text-slate-800 text-right">{order.packageName}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 font-medium">Target Social Link:</span>
              <a
                href={order.serviceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline max-w-[200px] truncate"
              >
                {order.serviceLink}
              </a>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 font-medium">Payment Method:</span>
              <span className="font-semibold text-slate-800">{order.paymentMethod || 'bKash'}</span>
            </div>
            {order.transactionId && (
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">Transaction ID:</span>
                <span className="font-mono text-slate-700 font-bold">{order.transactionId}</span>
              </div>
            )}
            <div className="py-3 flex justify-between items-baseline text-base font-extrabold">
              <span className="text-slate-900">Total Amount:</span>
              <span className="text-emerald-600 text-xl tabular-nums">
                ৳{order.totalPrice.toLocaleString()} BDT
              </span>
            </div>
          </div>

          {/* Action CTAs: Direct Download & WhatsApp Contact */}
          <div className="space-y-2.5 pt-2">
            {/* Requirement 4: Direct Download Order Details Button */}
            <button
              type="button"
              onClick={handleDownloadOrderDetails}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Order Details / Invoice</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact on WhatsApp with Order ID</span>
            </a>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
