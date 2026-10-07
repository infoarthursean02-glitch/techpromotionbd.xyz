export type ServiceCategory = 'entry' | 'core' | 'premium' | 'vip';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface Package {
  id: string;
  name: string;
  category: ServiceCategory;
  quantityLabel: string;
  baseQuantity: number;
  basePrice: number;
  quantityStep: number;
  priceStep: number;
  allowQuantityIncrease: boolean;
  image: string;
  description: string;
  optionalOpportunity: string;
  popularBadge?: 'Popular' | 'Best Value' | 'Flash Discount';
  features?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  whatsappNumber: string;
  clientLocation?: string;
  serviceLink: string;
  pageLink?: string;
  videoLinks?: string[];
  additionalLinks?: string[];
  serviceId?: string;
  packageId: string;
  packageName: string;
  category: ServiceCategory;
  quantity: number;
  quantityDisplay: string;
  unitPrice: number;
  multiplier: number;
  discountApplied?: number;
  promoCode?: string;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  transactionId?: string;
  paymentMethod?: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReelItem {
  id: string;
  title: string;
  subtitle: string;
  videoUrl?: string;
  thumbnail: string;
  duration?: string;
  views?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  primaryWhatsapp: string;
  alternativeWhatsapp: string;
  email: string;
  address: string;
  currency: string;
  promoCode: string;
  statSince: string;
  statOrders: string;
  statDelivery: string;
  statSupport: string;
  statTotalViews: string;
  statTotalEngagement: string;
  heroVideoUrl?: string;
  heroVideoPoster?: string;
  reels?: ReelItem[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  orderNumber: string;
  paymentUrl?: string;
  transactionId?: string;
  message?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  order: Order;
  message: string;
}
