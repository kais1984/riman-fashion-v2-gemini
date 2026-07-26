import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import GlobalFeatures from './GlobalFeatures';
import MobileBottomNav from './MobileBottomNav';
import ImmersiveUI from './ImmersiveUI';
import SEOHead from './SEOHead';
import MaintenanceMode from './MaintenanceMode';
import ToastContainer from './ToastContainer';

const CHECKOUT_ROUTES = ['/checkout', '/payment/success', '/payment/cancel'];

export default function Layout() {
  const { pathname } = useLocation();
  const isCheckout = CHECKOUT_ROUTES.some(r => pathname.startsWith(r));

  return (
    <div id="layout-root" className="min-h-screen flex flex-col font-body pb-16 md:pb-0">
      <SEOHead />
      <MaintenanceMode />
      <ImmersiveUI />
      {!isCheckout && <Header />}
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isCheckout && <Footer />}
      
      <GlobalFeatures />
      {!isCheckout && <MobileBottomNav />}
      <ToastContainer />
    </div>
  );
}
