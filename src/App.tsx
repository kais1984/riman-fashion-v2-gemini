import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { DataProvider } from './contexts/DataContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import Layout from './components/Layout';

// Pages - Lazy Loaded
const Home = lazy(() => import('./pages/Index'));
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const AlterationsPage = lazy(() => import('./pages/AlterationsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const Auth = lazy(() => import('./pages/Auth'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/PaymentCancel'));
const StyleQuiz = lazy(() => import('./pages/StyleQuiz'));
const AppointmentPage = lazy(() => import('./pages/AppointmentPage'));
const WeddingTimeline = lazy(() => import('./pages/WeddingTimeline'));
const WeddingChecklist = lazy(() => import('./pages/WeddingChecklist'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Contexts
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';

// Admin Pages - Lazy Loaded
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCalendar = lazy(() => import('./pages/admin/AdminCalendar'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminContent = lazy(() => import('./pages/admin/AdminContent'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));

const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <GlobalErrorBoundary>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <LanguageProvider>
              <AuthProvider>
                <WishlistProvider>
                  <CartProvider>
                    <BrowserRouter>
                      <Suspense fallback={
                        <div className="min-h-screen bg-ivory flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        </div>
                      }>
                        <MaintenanceGate>
                          <AnimatedRoutes />
                        </MaintenanceGate>
                      </Suspense>
                    </BrowserRouter>
                  </CartProvider>
                </WishlistProvider>
              </AuthProvider>
            </LanguageProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </ToastProvider>
    </GlobalErrorBoundary>
  );
}

function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { settings, isLoading } = useSettings();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (settings.advanced.maintenanceMode && !isAdmin) {
      document.title = 'Maintenance | Atelier Riman';
    }
  }, [settings.advanced.maintenanceMode, isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (settings.advanced.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-onyx flex items-center justify-center text-center px-6">
        <div className="max-w-md">
          <h1 className="font-heading text-4xl md:text-5xl text-gold uppercase tracking-widest mb-4">Atelier Riman</h1>
          <div className="w-16 h-px bg-gold mx-auto mb-8" />
          <p className="font-body text-ivory/60 text-sm tracking-widest uppercase mb-2">
            {settings.advanced.maintenanceMessage || 'We are currently updating our atelier.'}
          </p>
          <p className="font-body text-ivory/30 text-micro tracking-widest uppercase mt-6">
            Please check back soon.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function SEOInjector() {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings.advanced.metaDescription) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', settings.advanced.metaDescription);
    }

    if (settings.advanced.keywords) {
      let meta = document.querySelector('meta[name="keywords"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'keywords');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', settings.advanced.keywords);
    }

    if (settings.advanced.ogImageUrl) {
      let og = document.querySelector('meta[property="og:image"]');
      if (!og) {
        og = document.createElement('meta');
        og.setAttribute('property', 'og:image');
        document.head.appendChild(og);
      }
      og.setAttribute('content', settings.advanced.ogImageUrl);
    }

    if (settings.advanced.customHeadCode) {
      const existing = document.getElementById('custom-head-code');
      if (existing) existing.remove();
      // Sanitize: strip scripts, iframes, forms, event handlers — same policy as SEOHead.
      // customHeadCode is admin-only; this blocks stored-XSS if the value is ever compromised.
      const sanitized = settings.advanced.customHeadCode
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
        .replace(/<object[\s\S]*?<\/object>/gi, '')
        .replace(/<embed[\s\S]*?>/gi, '')
        .replace(/<form[\s\S]*?<\/form>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript\s*:/gi, '');
      if (!sanitized.trim()) return;
      const wrapper = document.createElement('div');
      wrapper.id = 'custom-head-code';
      wrapper.innerHTML = sanitized;
      document.head.appendChild(wrapper);
    }
  }, [settings.advanced]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <DataProvider>
      <SEOInjector />
      <ScrollToTop />
      <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Layout />}>
          <Route index element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="collection/:category" element={<PageWrapper><CollectionPage /></PageWrapper>} />
          <Route path="product/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
          <Route path="about" element={<PageWrapper><AboutPage /></PageWrapper>} />
          <Route path="contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
          <Route path="search" element={<PageWrapper><SearchPage /></PageWrapper>} />
          <Route path="wishlist" element={<PageWrapper><WishlistPage /></PageWrapper>} />
          <Route path="profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
          <Route path="faq" element={<PageWrapper><FaqPage /></PageWrapper>} />
          <Route path="alterations" element={<PageWrapper><AlterationsPage /></PageWrapper>} />
          <Route path="privacy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />
          <Route path="terms" element={<PageWrapper><TermsPage /></PageWrapper>} />
          <Route path="auth" element={<PageWrapper><Auth /></PageWrapper>} />
          <Route path="checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
          <Route path="payment/success" element={<PageWrapper><PaymentSuccess /></PageWrapper>} />
          <Route path="payment/cancel" element={<PageWrapper><PaymentCancel /></PageWrapper>} />
          <Route path="style-quiz" element={<PageWrapper><StyleQuiz /></PageWrapper>} />
          <Route path="appointment" element={<PageWrapper><AppointmentPage /></PageWrapper>} />
          <Route path="timeline" element={<PageWrapper><WeddingTimeline /></PageWrapper>} />
          <Route path="wedding-checklist" element={<PageWrapper><WeddingChecklist /></PageWrapper>} />
          <Route path="gallery" element={<PageWrapper><GalleryPage /></PageWrapper>} />
          <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
        </Route>

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="bookings" element={<AdminCalendar />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
      </motion.div>
      </AnimatePresence>
    </DataProvider>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -10, filter: 'blur(4px)' }
      }}
      transition={{ 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1
      }}
    >
      {children}
    </motion.div>
  );
}
