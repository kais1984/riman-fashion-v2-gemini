import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Search, ShoppingCart, Eye, X, ChevronDown, CheckCircle2, Clock, Ban, Truck, RefreshCw, MessageSquare, Save, CreditCard, Building2 } from 'lucide-react';
import { fetchOrders, updateOrderStatus, Order } from '../../services/orders';
import { isSupabaseConfigured } from '../../services/supabase';
import { formatPrice, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-600 border-amber-200 bg-amber-50',
  confirmed: 'text-emerald-600 border-emerald-200 bg-emerald-50',
  processing: 'text-sky-600 border-sky-200 bg-sky-50',
  shipped: 'text-indigo-600 border-indigo-200 bg-indigo-50',
  delivered: 'text-teal-600 border-teal-200 bg-teal-50',
  completed: 'text-stone-600 border-stone-200 bg-stone-50',
  cancelled: 'text-rose-600 border-rose-200 bg-rose-50',
};

const STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: RefreshCw,
  shipped: Truck,
  delivered: Truck,
  completed: CheckCircle2,
  cancelled: Ban,
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { addToast } = useToast();

  const loadOrders = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    
    const timeout = setTimeout(() => setIsLoading(false), 8000);

    try {
      setError(null);
      const data = await fetchOrders();
      setOrders(data);
    } catch (err: any) {
      let msg = err.message || 'Failed to load orders';
      if (msg.includes('Failed to fetch')) {
        msg = 'Connection Error: Unable to connect to Supabase. Check your network or VITE_SUPABASE_URL in .env';
      }
      setError(msg);
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const updated = await updateOrderStatus(id, newStatus, adminNotes || undefined);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : prev);
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Status Update Failed', message: err.message });
    } finally {
      setUpdating(null);
    }
  };

  const handleSaveNotes = async (id: string) => {
    if (!adminNotes.trim()) return;
    setUpdating(id);
    try {
      const updated = await updateOrderStatus(id, selectedOrder?.status || 'pending', adminNotes);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, admin_notes: adminNotes } : prev);
      }
      addToast({ type: 'success', title: 'Notes Saved' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to Save Notes', message: err.message });
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = !search || 
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-ivory border border-stone-200">
        <ShoppingCart className="w-12 h-12 text-stone-300 mb-4" />
        <h2 className="font-heading text-xl text-stone-400 tracking-widest uppercase mb-2">Orders Require Backend</h2>
        <p className="text-[10px] tracking-[0.3em] text-stone-400 uppercase italic">Configure Supabase to manage orders</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-ivory p-8 border border-stone-200">
        <div>
          <h2 className="font-heading text-2xl text-stone-800 tracking-wide uppercase">Order Management</h2>
          <p className="text-[10px] tracking-[0.3em] text-stone-400 uppercase mt-1">Track & fulfill customer investments</p>
        </div>
        <button onClick={loadOrders} className="btn-luxury-outline flex items-center gap-2 text-xs">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="bg-ivory border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-grow max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, email, or order ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 text-xs tracking-widest outline-none focus:border-gold transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', ...STATUS_OPTIONS].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "text-[9px] tracking-widest uppercase px-3 py-1.5 border transition-colors",
                  statusFilter === s ? "bg-stone-800 text-white border-stone-800" : "text-stone-400 border-stone-200 hover:border-stone-400"
                )}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] tracking-widest text-stone-400 uppercase">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-rose-500 text-xs tracking-widest uppercase mb-4">{error}</p>
            <button onClick={loadOrders} className="btn-luxury-outline text-xs">Retry</button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-stone-200 mx-auto mb-4" />
            <p className="text-[10px] tracking-widest text-stone-400 uppercase">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-100">
                  <th className="px-6 py-4 text-[9px] tracking-widest text-stone-400 uppercase font-bold">Order ID</th>
                  <th className="px-6 py-4 text-[9px] tracking-widest text-stone-400 uppercase font-bold">Date</th>
                  <th className="px-6 py-4 text-[9px] tracking-widest text-stone-400 uppercase font-bold">Customer</th>
                  <th className="px-6 py-4 text-[9px] tracking-widest text-stone-400 uppercase font-bold">Type</th>
                  <th className="px-6 py-4 text-[9px] tracking-widest text-stone-400 uppercase font-bold">Status</th>
                  <th className="px-6 py-4 text-[9px] tracking-widest text-stone-400 uppercase font-bold">Total</th>
                  <th className="px-6 py-4 text-[9px] tracking-widest text-stone-400 uppercase font-bold">Payment</th>
                  <th className="px-6 py-4 text-[9px] tracking-widest text-stone-400 uppercase font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map(order => {
                  const StatusIcon = STATUS_ICONS[order.status] || Clock;
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <code className="text-[9px] text-stone-400 font-mono">{order.id?.slice(0, 8)}...</code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] text-stone-600">{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-bold text-stone-800">{order.customer_name || 'Unknown'}</p>
                        <p className="text-[8px] text-stone-400">{order.customer_email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] tracking-widest uppercase text-stone-500">{order.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("text-[9px] tracking-widest uppercase font-bold px-2 py-1 border flex items-center gap-1.5 w-fit", STATUS_COLORS[order.status])}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-stone-800">{formatPrice(order.subtotal)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[8px] tracking-widest uppercase font-bold px-2 py-1 border flex items-center gap-1 w-fit",
                          order.payment_status === 'paid' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                          order.payment_status === 'processing' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                          order.payment_status === 'failed' ? 'text-rose-600 border-rose-200 bg-rose-50' :
                          'text-stone-400 border-stone-200 bg-stone-50'
                        )}>
                          {order.payment_method === 'card' ? <CreditCard className="w-2 h-2" /> : <Building2 className="w-2 h-2" />}
                          {order.payment_status || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setAdminNotes(order.admin_notes || '');
                          }}
                          className="p-2 border border-stone-200 text-stone-400 hover:text-gold hover:border-gold transition-all"
                          aria-label="View order details"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-ivory w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl border border-stone-200"
              role="dialog"
              aria-modal="true"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <h3 className="font-heading text-xl text-stone-800 tracking-wide uppercase">Order Details</h3>
                  <code className="text-[9px] text-stone-400 font-mono bg-stone-100 px-2 py-1">{selectedOrder.id}</code>
                </div>
                <button onClick={() => setSelectedOrder(null)} aria-label="Close" className="text-stone-400 hover:text-stone-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Customer</h4>
                    <div className="space-y-2 text-xs">
                      <p><span className="text-stone-400 uppercase text-[9px] tracking-widest block">Name</span><span className="font-bold text-stone-800">{selectedOrder.customer_name || '-'}</span></p>
                      <p><span className="text-stone-400 uppercase text-[9px] tracking-widest block">Email</span><span className="text-stone-600">{selectedOrder.customer_email || '-'}</span></p>
                      <p><span className="text-stone-400 uppercase text-[9px] tracking-widest block">Phone</span><span className="text-stone-600">{selectedOrder.customer_phone || '-'}</span></p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Order Info</h4>
                    <div className="space-y-2 text-xs">
                      <p><span className="text-stone-400 uppercase text-[9px] tracking-widest block">Date</span><span className="text-stone-800 font-bold">{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : '-'}</span></p>
                      <p><span className="text-stone-400 uppercase text-[9px] tracking-widest block">Type</span><span className="text-[10px] tracking-widest uppercase text-stone-600 font-medium">{selectedOrder.type}</span></p>
                      <p><span className="text-stone-400 uppercase text-[9px] tracking-widest block">Payment Method</span><span className="text-[10px] tracking-widest uppercase text-stone-600 font-medium flex items-center gap-1.5">{selectedOrder.payment_method === 'card' ? <><CreditCard className="w-3 h-3" /> Card</> : <><Building2 className="w-3 h-3" /> Atelier</>}</span></p>
                      <p><span className="text-stone-400 uppercase text-[9px] tracking-widest block">Payment Status</span><span className={cn("text-[9px] tracking-widest uppercase font-bold", selectedOrder.payment_status === 'paid' ? 'text-emerald-600' : selectedOrder.payment_status === 'failed' ? 'text-rose-600' : 'text-stone-600')}>{selectedOrder.payment_status || 'pending'}</span></p>
                      <p><span className="text-stone-400 uppercase text-[9px] tracking-widest block">Total</span><span className="text-gold font-heading font-bold">{formatPrice(selectedOrder.subtotal)}</span></p>
                    </div>
                  </div>
                </div>

                {/* Status & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map(status => {
                        const Icon = STATUS_ICONS[status] || Clock;
                        const isActive = selectedOrder.status === status;
                        return (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(selectedOrder.id!, status)}
                            disabled={updating === selectedOrder.id}
                            className={cn(
                              "text-[9px] tracking-widest uppercase px-3 py-2 border flex items-center gap-1.5 transition-all",
                              isActive
                                ? "bg-stone-800 text-white border-stone-800"
                                : "text-stone-400 border-stone-200 hover:border-stone-400 hover:text-stone-600",
                              updating === selectedOrder.id && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <Icon className="w-2.5 h-2.5" />
                            {status}
                          </button>
                        );
                      })}
                    </div>
                    {selectedOrder.notes && (
                      <div className="mt-4 p-4 bg-stone-50 border border-stone-100">
                        <p className="text-[9px] tracking-widest uppercase text-stone-400 font-bold flex items-center gap-1.5 mb-2">
                          <MessageSquare className="w-3 h-3" /> Customer Notes
                        </p>
                        <p className="text-xs text-stone-600 italic">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Admin Notes</h4>
                    <textarea
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                      rows={4}
                      className="w-full bg-stone-50 border border-stone-100 p-4 text-xs tracking-widest outline-none focus:border-gold transition-all resize-none"
                      placeholder="Internal notes about this order..."
                    />
                    <button
                      onClick={() => handleSaveNotes(selectedOrder.id!)}
                      disabled={updating === selectedOrder.id || !adminNotes.trim()}
                      className="btn-luxury text-xs flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-3 h-3" /> Save Notes
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Items ({selectedOrder.items?.length || 0})</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-stone-50/50 border-b border-stone-100">
                          <th className="px-4 py-3 text-[8px] tracking-widest text-stone-400 uppercase font-bold">Product</th>
                          <th className="px-4 py-3 text-[8px] tracking-widest text-stone-400 uppercase font-bold">Type</th>
                          <th className="px-4 py-3 text-[8px] tracking-widest text-stone-400 uppercase font-bold">Size</th>
                          <th className="px-4 py-3 text-[8px] tracking-widest text-stone-400 uppercase font-bold">Qty</th>
                          <th className="px-4 py-3 text-[8px] tracking-widest text-stone-400 uppercase font-bold">Price</th>
                          <th className="px-4 py-3 text-[8px] tracking-widest text-stone-400 uppercase font-bold">Rental Dates</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {selectedOrder.items?.map((item, i) => (
                          <tr key={item.id || i} className="hover:bg-stone-50/50">
                            <td className="px-4 py-3">
                              <p className="text-[11px] font-bold text-stone-800">{item.product_name}</p>
                              <code className="text-[8px] text-stone-400 font-mono">{item.product_id}</code>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[9px] tracking-widest uppercase text-stone-500">{item.product_type}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] text-stone-600">{item.size || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] text-stone-600">{item.quantity}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-bold text-stone-800">{formatPrice(item.unit_price)}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[9px] text-stone-500">
                                {item.rental_start_date ? `${item.rental_start_date} → ${item.rental_end_date}` : '-'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
