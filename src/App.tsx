import React, { useState, useEffect } from 'react';
import { Package, SiteSettings, FAQItem, Order } from './types';
import { fetchPackages, fetchSettings, fetchFaqs } from './lib/api';
import { INITIAL_PACKAGES, INITIAL_SETTINGS, INITIAL_FAQS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StatsSection } from './components/StatsSection';
import { ServicesSection } from './components/ServicesSection';
import { ReelsSection } from './components/ReelsSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { MobileStickyCTA } from './components/MobileStickyCTA';
import { OrderModal } from './components/OrderModal';
import { NagorikPayModal } from './components/NagorikPayModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminDashboard } from './components/AdminDashboard';
import { analytics } from './lib/analytics';

import { TrackOrderModal } from './components/TrackOrderModal';

export default function App() {
  const [packages, setPackages] = useState<Package[]>(INITIAL_PACKAGES);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);

  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(1);

  // Track order modal state
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);

  // Active pending order for Nagorik Pay gateway
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  // Confirmed / submitted order modal
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Admin Dashboard modal
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    analytics.pageView('Home');
    loadInitialData();

    // Check if visiting /admin or #admin URL
    const checkAdminRoute = () => {
      if (
        window.location.pathname === '/admin' ||
        window.location.hash === '#admin' ||
        window.location.search.includes('admin=true')
      ) {
        setIsAdminOpen(true);
      }
    };

    const handleDataRefreshed = () => {
      loadInitialData();
    };

    window.addEventListener('tpbd:datarefreshed', handleDataRefreshed);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('tpbd:datarefreshed', handleDataRefreshed);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const [pkgs, sttgs, fqs] = await Promise.all([
        fetchPackages(),
        fetchSettings(),
        fetchFaqs(),
      ]);
      if (pkgs && pkgs.length) setPackages(pkgs);
      if (sttgs) setSettings(sttgs);
      if (fqs && fqs.length) setFaqs(fqs);
    } catch (err) {
      console.warn('Data sync notice:', err);
    }
  };

  const handleOpenOrder = (pkg?: Package, multiplier: number = 1) => {
    setSelectedPackage(pkg || packages[0]);
    setSelectedMultiplier(multiplier);
    setIsOrderModalOpen(true);
    if (pkg) {
      analytics.viewContent(pkg.name, pkg.category, pkg.basePrice);
    }
  };

  const handleProceedToPayment = (order: Order) => {
    setIsOrderModalOpen(false);
    if (order.paymentMethod === 'Nagorik Pay' && order.paymentStatus !== 'PAID') {
      setPendingOrder(order);
    } else {
      setConfirmedOrder(order);
    }
  };

  const handlePaymentSuccess = (paidOrder: Order) => {
    setPendingOrder(null);
    setConfirmedOrder(paidOrder);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white pb-14 md:pb-0">
      {/* Sticky Responsive Header */}
      <Navbar
        onOrderNowClick={() => handleOpenOrder()}
        onAdminClick={() => {
          window.location.hash = '#admin';
          setIsAdminOpen(true);
        }}
        onTrackOrderClick={() => setIsTrackOrderOpen(true)}
        primaryWhatsapp={settings.primaryWhatsapp}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with Styled Headline & 500MB Video Support */}
        <HeroSection
          onOrderNowClick={() => handleOpenOrder()}
          heroVideoUrl={settings.heroVideoUrl}
          heroVideoPoster={settings.heroVideoPoster}
        />

        {/* Horizontal Trust / Stats Section with Delivery Timeline Chart */}
        <StatsSection
          settings={settings}
          onOrderNowClick={() => handleOpenOrder()}
        />

        {/* Services & Dynamic Pricing Packages with Bold Category Tabs & Unlimited Volume */}
        <ServicesSection
          packages={packages}
          onSelectPackage={(pkg, mult) => handleOpenOrder(pkg, mult)}
        />

        {/* 3 Facebook Reels Size (9:16 Vertical) Video Section */}
        <ReelsSection
          reels={settings.reels}
          onOrderNowClick={() => handleOpenOrder()}
        />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Frequently Asked Questions */}
        <FAQSection
          faqs={faqs}
          primaryWhatsapp={settings.primaryWhatsapp}
        />
      </main>

      {/* Footer with Integrated Contact Desk & /admin Direct URL */}
      <Footer
        settings={settings}
        onAdminClick={() => {
          window.location.hash = '#admin';
          setIsAdminOpen(true);
        }}
      />

      {/* Mobile Sticky CTA Bar (Strictly <= 15% Viewport Height) */}
      <MobileStickyCTA
        onOrderNowClick={() => handleOpenOrder()}
        primaryWhatsapp={settings.primaryWhatsapp}
      />

      {/* Step 1: Order Modal with Promo Code TechPromotionBD & Unlimited Volume */}
      {isOrderModalOpen && (
        <OrderModal
          packages={packages}
          initialPackage={selectedPackage}
          initialMultiplier={selectedMultiplier}
          onClose={() => setIsOrderModalOpen(false)}
          onProceedToPayment={handleProceedToPayment}
        />
      )}

      {/* Step 2: Nagorik Pay Payment Gateway Modal (Server-Side Verified with API Key) */}
      {pendingOrder && (
        <NagorikPayModal
          order={pendingOrder}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setPendingOrder(null)}
        />
      )}

      {/* Step 3: Order Confirmation Modal with Direct Download Order Details Button */}
      {confirmedOrder && (
        <OrderSuccessModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          primaryWhatsapp={settings.primaryWhatsapp}
        />
      )}

      {/* Track Order Modal (Accessible via Header next to Support) */}
      {isTrackOrderOpen && (
        <TrackOrderModal
          onClose={() => setIsTrackOrderOpen(false)}
          primaryWhatsapp={settings.primaryWhatsapp}
        />
      )}

      {/* Admin Dashboard Portal (Direct URL /admin or #admin) */}
      {isAdminOpen && (
        <AdminDashboard
          onClose={() => {
            setIsAdminOpen(false);
            if (window.location.hash === '#admin') {
              window.history.pushState(null, '', window.location.pathname);
            }
          }}
          siteSettings={settings}
          packages={packages}
          faqs={faqs}
          onRefreshData={loadInitialData}
        />
      )}
    </div>
  );
}
