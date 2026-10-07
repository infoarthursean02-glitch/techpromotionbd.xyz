// Meta Pixel & Analytics helper
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

// Track fired purchases to prevent duplicate Purchase events
const firedPurchaseOrderIds = new Set<string>();

export const analytics = {
  pageView: (pageName: string) => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView', { page: pageName });
    }
  },

  viewContent: (packageName: string, category: string, price: number) => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', {
        content_name: packageName,
        content_category: category,
        value: price,
        currency: 'BDT',
      });
    }
  },

  addToCart: (packageName: string, quantity: number, price: number) => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'AddToCart', {
        content_name: packageName,
        value: price,
        currency: 'BDT',
        contents: [{ id: packageName, quantity }],
      });
    }
  },

  initiateCheckout: (packageName: string, totalAmount: number) => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', {
        content_name: packageName,
        value: totalAmount,
        currency: 'BDT',
      });
    }
  },

  lead: (customerName: string, service: string) => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: service,
        status: 'form_submitted',
      });
    }
  },

  purchase: (orderId: string, value: number, packageName: string) => {
    if (firedPurchaseOrderIds.has(orderId)) {
      return; // Prevent duplicate Purchase events
    }
    firedPurchaseOrderIds.add(orderId);

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Purchase', {
        content_name: packageName,
        content_ids: [orderId],
        value: value,
        currency: 'BDT',
      });
    }
  },
};
