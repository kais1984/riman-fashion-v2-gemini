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

// Pages - to be created
import Home from './pages/Index';
import CollectionPage from './pages/CollectionPage';
import ProductDetail from './pages/ProductDetail';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SearchPage from './pages/SearchPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import BlogPage from './pages/BlogPage';
import FaqPage from './pages/FaqPage';
import AlterationsPage from './pages/AlterationsPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import Auth from './pages/Auth';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import StyleQuiz from './pages/StyleQuiz';
import AppointmentPage from './pages/AppointmentPage';
import WeddingTimeline from './pages/WeddingTimeline';
import WeddingChecklist from './pages/WeddingChecklist';
import GalleryPage from './pages/GalleryPage';
import NotFound from './pages/NotFound';

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
const AdminPlaceholder = lazy(() => import('./pages/admin/AdminPlaceholder'));
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
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <AuthProvider>
            <WishlistProvider>
              <LanguageProvider>
                <CartProvider>
                  <BrowserRouter>
                    <ToastProvider>
                      <Suspense fallback={
                        <div className="min-h-screen bg-ivory flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        </div>
                      }>
                        <MaintenanceGate>
                          <AnimatedRoutes />
                        </MaintenanceGate>
                      </Suspense>
                    </ToastProvider>
                  </BrowserRouter>
                </CartProvider>
              </LanguageProvider>
            </WishlistProvider>
          </AuthProvider>
        </SettingsProvider>
      </QueryClientProvider>
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
          <p className="font-body text-ivory/30 text-[10px] tracking-widest uppercase mt-6">
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
      const wrapper = document.createElement('div');
      wrapper.id = 'custom-head-code';
      wrapper.innerHTML = settings.advanced.customHeadCode;
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
          <Route path="blog" element={<PageWrapper><BlogPage /></PageWrapper>} />
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
