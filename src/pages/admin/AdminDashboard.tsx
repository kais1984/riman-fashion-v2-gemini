import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, Calendar, ArrowUpRight, ArrowDownRight, ChevronRight, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { fetchOrders, Order } from '../../services/orders';

interface DashboardStats {
  totalRevenue: number;
  activeRentals: number;
  newClients: number;
  totalOrders: number;
  monthlyRevenue: { name: string; revenue: number }[];
  categoryBreakdown: { name: string; value: number; color: string }[];
  recentOrders: Order[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Bridal Gown': '#8B7355',
  'Evening Dress': '#D4A574',
  'Accessory': '#C4A882',
  'Fine Jewelry': '#F5F0E8',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [orders, revenueResult, rentalsResult, clientsResult, productsResult] = await Promise.all([
        fetchOrders().catch(() => []),
        (async () => (await supabase.from('orders').select('subtotal, created_at, payment_status')).data || [])().catch(() => []),
        (async () => (await supabase.from('rental_bookings').select('id').in('status', ['confirmed', 'active'])).data || [])().catch(() => []),
        (async () => (await supabase.from('customers').select('id').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())).data || [])().catch(() => []),
        (async () => (await supabase.from('products').select('category')).data || [])().catch(() => []),
      ]);

      const paidOrders = revenueResult.filter((o: any) => o.payment_status === 'paid');
      const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + (o.subtotal || 0), 0);

      const monthlyMap = new Map<string, number>();
      paidOrders.forEach((o: any) => {
        const d = new Date(o.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap.set(key, (monthlyMap.get(key) || 0) + (o.subtotal || 0));
      });
      const monthlyRevenue = Array.from(monthlyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([key, revenue]) => {
          const [y, m] = key.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return { name: monthNames[parseInt(m) - 1], revenue };
        });

      const catCount = new Map<string, number>();
      productsResult.forEach((p: any) => {
        catCount.set(p.category, (catCount.get(p.category) || 0) + 1);
      });
      const total = productsResult.length || 1;
      const categoryBreakdown = Array.from(catCount.entries()).map(([name, count]) => ({
        name,
        value: Math.round((count / total) * 100),
        color: CATEGORY_COLORS[name] || '#8B7355',
      }));

      setStats({
        totalRevenue,
        activeRentals: rentalsResult.length,
        newClients: clientsResult.length,
        totalOrders: orders.length,
        monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue : [{ name: 'No data', revenue: 0 }],
        categoryBreakdown: categoryBreakdown.length > 0 ? categoryBreakdown : [{ name: 'No data', value: 100, color: '#e5e5e5' }],
        recentOrders: orders.slice(0, 6),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShoppingCart className="w-12 h-12 text-stone-300 mb-4" />
        <h3 className="font-heading text-xl text-stone-800 uppercase tracking-widest mb-2">Dashboard Requires Backend</h3>
        <p className="text-sm text-stone-400">Connect Supabase to see real analytics.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-rose-500 text-sm mb-4">{error}</p>
        <button onClick={loadDashboard} className="btn-luxury text-[10px]">Retry</button>
      </div>
    );
  }

  const s = stats!;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`AED ${s.totalRevenue.toLocaleString()}`} icon={TrendingUp} />
        <StatCard title="Active Rentals" value={`${s.activeRentals} Pieces`} icon={ShoppingCart} />
        <StatCard title="New Clients (30d)" value={String(s.newClients)} icon={Users} />
        <StatCard title="Total Orders" value={String(s.totalOrders)} icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-ivory p-8 border border-stone-200">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-heading text-xl text-stone-800 tracking-wide uppercase">Performance Overview</h3>
              <p className="text-[10px] tracking-widest text-stone-400 uppercase mt-1">Monthly Revenue (Paid Orders)</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={s.monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B7355" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B7355" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1C1917', border: 'none', borderRadius: '0', color: '#fff', fontSize: '12px' }} itemStyle={{ color: '#D4A574' }} />
                <Area type="monotone" dataKey="revenue" stroke="#8B7355" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-ivory p-8 border border-stone-200">
          <h3 className="font-heading text-xl text-stone-800 tracking-wide uppercase mb-10">Product Mix</h3>
          <div className="h-[250px] w-full mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.categoryBreakdown} layout="vertical" barSize={32}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontStyle: 'bold', fill: '#444' }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                  {s.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {s.categoryBreakdown.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3" style={{ backgroundColor: cat.color }} />
                  <span className="text-[10px] tracking-widest text-stone-600 uppercase font-bold">{cat.name}</span>
                </div>
                <span className="text-xs text-stone-800">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-ivory border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div>
            <h3 className="font-heading text-xl text-stone-800 tracking-wide uppercase">Recent Orders</h3>
            <p className="text-[10px] tracking-widest text-stone-400 uppercase mt-1">Latest order activity</p>
          </div>
          <Link to="/admin/orders" className="group flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-gold hover:text-stone-800 transition-colors">
            Manage All Orders <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {s.recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-stone-400 text-sm">No orders yet.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-ivory border-b border-stone-100">
                  <th className="px-8 py-5 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Client</th>
                  <th className="px-8 py-5 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Items</th>
                  <th className="px-8 py-5 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Type</th>
                  <th className="px-8 py-5 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Amount</th>
                  <th className="px-8 py-5 text-[10px] tracking-widest text-stone-400 uppercase font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {s.recentOrders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="bg-ivory p-6 border border-stone-200 group hover:border-gold transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-ivory text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-[10px] tracking-widest text-stone-400 uppercase mb-1">{title}</p>
      <h4 className="text-xl font-heading text-stone-800 tracking-wide">{value}</h4>
    </div>
  );
}

function OrderRow({ order }: { key?: React.Key; order: Order }) {
  const statusColors: Record<string, string> = {
    completed: 'bg-green-50 text-green-600',
    confirmed: 'bg-green-50 text-green-600',
    processing: 'bg-blue-50 text-blue-600',
    shipped: 'bg-gold/10 text-gold',
    pending: 'bg-stone-100 text-stone-600',
    cancelled: 'bg-rose-50 text-rose-600',
  };

  const itemNames = order.items?.map(i => i.product_name).join(', ') || '—';
  const shortDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  return (
    <tr className="hover:bg-stone-50 transition-colors">
      <td className="px-8 py-5">
        <p className="text-xs font-bold text-stone-800">{order.customer_name || 'Guest'}</p>
        <p className="text-[8px] text-stone-400 uppercase tracking-widest mt-1">{shortDate}</p>
      </td>
      <td className="px-8 py-5 text-stone-600 text-xs max-w-[200px] truncate">{itemNames}</td>
      <td className="px-8 py-5 translate-y-[2px]">
        <span className={cn(
          "text-[8px] tracking-[0.2em] uppercase px-2 py-1 border",
          order.type === 'sale' ? "border-gold text-gold" : "border-stone-300 text-stone-400"
        )}>
          {order.type}
        </span>
      </td>
      <td className="px-8 py-5 text-xs text-stone-800 font-medium">AED {(order.subtotal || 0).toLocaleString()}</td>
      <td className="px-8 py-5 text-center">
        <span className={cn("inline-block text-[8px] tracking-widest uppercase px-3 py-1 font-bold", statusColors[order.status] || 'bg-stone-100 text-stone-600')}>
          {order.status}
        </span>
      </td>
    </tr>
  );
}
