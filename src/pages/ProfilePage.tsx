import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Navigate, Link } from 'react-router-dom';
import { ShoppingBag, Calendar, Settings, LogOut, User, Heart, ChevronRight, Package, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { formatPrice, cn } from '../lib/utils';
import { fetchOrders, type Order } from '../services/orders';
import { isSupabaseConfigured } from '../services/supabase';

export default function ProfilePage() {
  const { user, signOut, isLoading } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setOrdersLoading(false);
      return;
    }
    fetchOrders()
      .then(data => setOrders(data))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="pt-40 flex justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const totalInvested = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const activeRentals = orders.filter(o => o.type === 'rental' && o.status !== 'completed' && o.status !== 'cancelled').length;
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()).slice(0, 5);

  return (
    <div className="pt-32 pb-20 bg-ivory min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-80">
            <div className="bg-ivory p-8 border border-stone-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-2xl -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex items-center gap-4 mb-10 relative z-10">
                 <div className="w-16 h-16 bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                   <User className="w-8 h-8" />
                 </div>
                 <div>
                   <h2 className="font-heading text-lg text-stone-800 tracking-wide">{user.name}</h2>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">{user.role} {t('profile.member')}</p>
                 </div>
               </div>

               <nav className="space-y-1 relative z-10">
                  <ProfileLink icon={ShoppingBag} label={t('profile.orders')} active />
                  <Link to="/wishlist"><ProfileLink icon={Heart} label={t('wishlist.title')} /></Link>
                  <ProfileLink icon={Calendar} label={t('profile.appointments')} />
                  <ProfileLink icon={Settings} label={t('profile.preferences')} />
                 <button 
                   onClick={signOut}
                   className="w-full flex items-center gap-4 p-4 text-[10px] text-stone-400 uppercase tracking-[0.2em] hover:text-rose-500 hover:bg-rose-50/30 transition-all text-left mt-8 border-t border-stone-50 pt-8"
                 >
                    <LogOut className="w-4 h-4" /> {t('profile.sign_out')}
                 </button>
               </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-12">
            <header>
               <h1 className="font-heading text-4xl text-stone-800 tracking-wider uppercase mb-3">{t('profile.dashboard')}</h1>
               <div className="w-12 h-px bg-gold mb-3" />
               <p className="font-body text-stone-400 text-[10px] tracking-[0.2em] uppercase italic">{t('profile.welcome')}</p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatBox label={t('profile.total_investments')} value={isSupabaseConfigured ? formatPrice(totalInvested) : '—'} />
              <StatBox label={t('profile.active_rentals')} value={isSupabaseConfigured ? String(activeRentals) : '—'} />
              <StatBox label={t('profile.orders_placed')} value={isSupabaseConfigured ? String(orders.length) : '—'} />
            </div>

            {/* Recent Orders */}
            <section>
               <div className="border-b border-stone-100 pb-4 mb-8">
                 <h3 className="font-heading text-xl text-stone-800 tracking-widest uppercase">{t('profile.recent_engagements')}</h3>
                 <div className="w-8 h-px bg-gold mt-3" />
               </div>
               {ordersLoading ? (
                 <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="bg-stone-50 p-6 border border-stone-100 animate-pulse">
                       <div className="h-4 w-40 bg-stone-200 mb-3" />
                       <div className="h-3 w-60 bg-stone-100" />
                     </div>
                   ))}
                 </div>
               ) : !isSupabaseConfigured ? (
                 <div className="bg-ivory p-12 text-center border border-stone-100">
                   <Package className="w-10 h-10 text-stone-200 mx-auto mb-4" />
                    <p className="text-[10px] tracking-widest text-stone-400 uppercase">{t('profile.backend_not_connected')}</p>
                 </div>
               ) : recentOrders.length === 0 ? (
                 <div className="bg-ivory p-12 text-center border border-stone-100">
                   <Package className="w-10 h-10 text-stone-200 mx-auto mb-4" />
                    <p className="text-[10px] tracking-widest text-stone-400 uppercase mb-6">{t('profile.no_orders')}</p>
                    <Link to="/collection/bridal" className="text-[10px] text-gold uppercase tracking-[0.3em] font-bold underline underline-offset-4">{t('profile.explore_new')}</Link>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {recentOrders.map(order => (
                     <div key={order.id} className="bg-ivory p-6 border border-stone-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gold/20 transition-colors">
                       <div>
                         <h4 className="text-[11px] font-bold text-stone-800 uppercase tracking-widest mb-1">
                            {order.type === 'rental' ? t('profile.rental_booking') : order.type === 'mixed' ? t('profile.combined_order') : t('profile.purchase_order')} — {order.id?.slice(0, 8)}
                         </h4>
                         <p className="text-[12px] text-stone-500 italic mb-1">{order.items?.map(i => i.product_name).join(', ') || 'Order items'}</p>
                         <p className="text-[9px] text-stone-300 uppercase tracking-widest">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</p>
                       </div>
                       <div className="flex items-center gap-4">
                         <span className="text-gold font-heading text-sm font-bold">{formatPrice(order.subtotal)}</span>
                         <span className={cn(
                           "px-3 py-1 text-[9px] font-bold uppercase tracking-widest border",
                           order.status === 'cancelled' ? 'text-rose-400 border-rose-100 bg-rose-50/30' :
                           order.status === 'completed' || order.status === 'delivered' ? 'text-emerald-600 border-emerald-100 bg-emerald-50/30' :
                           'text-gold border-gold/10 bg-ivory'
                         )}>
                           {order.status}
                         </span>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
               {recentOrders.length > 0 && (
                 <Link to="/collection/bridal" className="inline-flex items-center gap-3 text-[10px] text-gold uppercase tracking-[0.3em] font-bold mt-8 hover:gap-5 transition-all">
                    {t('profile.explore_new')} <ChevronRight className="w-3 h-3" />
                 </Link>
               )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function ProfileLink({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 text-[10px] uppercase tracking-[0.2em] transition-all text-left border-l-2",
        active ? "bg-gold/5 text-gold font-bold border-gold" : "text-stone-400 hover:text-stone-800 hover:bg-stone-50 border-transparent"
      )}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function StatBox({ label, value }: any) {
  return (
    <div className="bg-ivory p-8 border border-stone-100">
      <p className="text-[9px] text-stone-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="font-heading text-2xl text-stone-800 tracking-wide">{value}</p>
    </div>
  );
}
