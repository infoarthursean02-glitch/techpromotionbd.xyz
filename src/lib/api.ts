import { Package, SiteSettings, FAQItem, Order } from '../types';
import { INITIAL_PACKAGES, INITIAL_SETTINGS, INITIAL_FAQS } from '../data/initialData';

const BASE_URL = '';

export async function fetchPackages(): Promise<Package[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/packages?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load packages');
    return await res.json();
  } catch (err) {
    console.warn('Using local fallback packages:', err);
    return INITIAL_PACKAGES;
  }
}

export async function fetchSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${BASE_URL}/api/settings?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load settings');
    return await res.json();
  } catch (err) {
    console.warn('Using local fallback settings:', err);
    return INITIAL_SETTINGS;
  }
}

export async function fetchFaqs(): Promise<FAQItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/faqs?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load FAQs');
    return await res.json();
  } catch (err) {
    console.warn('Using local fallback FAQs:', err);
    return INITIAL_FAQS;
  }
}

export async function createOrder(payload: {
  customerName: string;
  whatsappNumber: string;
  clientLocation?: string;
  serviceLink: string;
  pageLink?: string;
  videoLinks?: string[];
  additionalLinks?: string[];
  packageId: string;
  multiplier: number;
  customerNotes?: string;
  promoCode?: string;
  paymentMethod?: string;
  transactionId?: string;
}): Promise<{ success: boolean; order: Order; message?: string }> {
  const res = await fetch(`${BASE_URL}/api/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit order');
  }
  return data;
}

export async function trackOrder(orderId: string, phone?: string): Promise<{ success: boolean; order: Order }> {
  const params = new URLSearchParams();
  params.append('orderId', orderId);
  if (phone) params.append('phone', phone);

  const res = await fetch(`${BASE_URL}/api/orders/track/search?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'No matching order found');
  }
  return data;
}

export async function initiatePayment(orderNumber: string): Promise<{
  success: boolean;
  orderNumber: string;
  transactionId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  service: string;
  brandKeyMasked: string;
}> {
  const res = await fetch(`${BASE_URL}/api/payments/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNumber }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Payment gateway initialization failed');
  }
  return data;
}

export async function verifyPayment(payload: {
  orderNumber: string;
  transactionId: string;
  paymentMethod: string;
}): Promise<{ success: boolean; order: Order; message: string }> {
  const res = await fetch(`${BASE_URL}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Payment verification failed');
  }
  return data;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders/${orderNumber}`);
  if (!res.ok) {
    throw new Error('Order not found');
  }
  return await res.json();
}

// Admin API
export async function adminLogin(
  credentials: { username?: string; password: string } | string
): Promise<{ success: boolean; token: string }> {
  const body = typeof credentials === 'string' ? { password: credentials } : credentials;
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed');
  }
  return data;
}

export async function adminVerifyOrderPayment(
  token: string,
  id: string
): Promise<{ success: boolean; order: Order; message: string }> {
  const res = await fetch(`${BASE_URL}/api/admin/orders/${id}/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to verify payment');
  return data;
}

export async function fetchAdminOrders(token: string, filter?: { search?: string; paymentStatus?: string; orderStatus?: string }): Promise<{
  orders: Order[];
  totalOrders: number;
  paidCount: number;
  revenueBDT: number;
}> {
  const params = new URLSearchParams();
  if (filter?.search) params.append('search', filter.search);
  if (filter?.paymentStatus) params.append('paymentStatus', filter.paymentStatus);
  if (filter?.orderStatus) params.append('orderStatus', filter.orderStatus);

  const res = await fetch(`${BASE_URL}/api/admin/orders?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Unauthorized or failed to fetch orders');
  return await res.json();
}

export async function updateOrderStatus(
  token: string,
  id: string,
  status: { orderStatus?: string; paymentStatus?: string }
): Promise<{ success: boolean; order: Order }> {
  const res = await fetch(`${BASE_URL}/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(status),
  });

  if (!res.ok) throw new Error('Failed to update status');
  return await res.json();
}

export async function updatePackage(token: string, id: string, pkgData: Partial<Package>): Promise<Package> {
  const res = await fetch(`${BASE_URL}/api/admin/packages/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pkgData),
  });

  if (!res.ok) throw new Error('Failed to update package');
  const updated = await res.json();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tpbd:datarefreshed'));
  }
  return updated;
}

export async function updateSettings(token: string, settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const res = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });

  if (!res.ok) throw new Error('Failed to update settings');
  const updated = await res.json();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tpbd:datarefreshed'));
  }
  return updated;
}
