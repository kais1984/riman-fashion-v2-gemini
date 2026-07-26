import React from 'react';
import { TrendingUp, Users, ShoppingCart, Calendar, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

const data = [
  { name: 'Jan', revenue: 145000, bookings: 45 },
  { name: 'Feb', revenue: 168000, bookings: 52 },
  { name: 'Mar', revenue: 185000, bookings: 61 },
  { name: 'Apr', revenue: 195000, bookings: 58 },
  { name: 'May', revenue: 210000, bookings: 70 },
  { name: 'Jun', revenue: 245000, bookings: 85 },
];

const categoryData = [
  { name: 'Bridal', value: 45, color: '#8B7355' },
  { name: 'Evening', value: 30, color: '#D4A574' },
  { name: 'Rental', value: 25, color: '#F5F0E8' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="AED 245,000" 
          trend="+12.5%" 
          up={true} 
          icon={TrendingUp} 
        />
        <StatCard 
          title="Active Rentals" 
          value="42 Pieces" 
          trend="+5.2%" 
          up={true} 
          icon={ShoppingCart} 
        />
        <StatCard 
          title="New Clients" 
          value="128" 
          trend="-2.4%" 
          up={false} 
          icon={Users} 
        />
        <StatCard 
          title="Consultations" 
          value="18" 
          trend="+18.0%" 
          up={true} 
          icon={Calendar} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-ivory p-8 border border-stone-200">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-heading text-xl text-stone-800 tracking-wide uppercase">Performance Overview</h3>
              <p className="text-[10px] tracking-widest text-stone-400 uppercase mt-1">Monthly Revenue & Bookings</p>
            </div>
            <select className="text-[10px] tracking-widest uppercase border border-stone-200 px-3 py-2 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B7355" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B7355" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#A8A29E' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#A8A29E' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C1917', 
                    border: 'none', 
                    borderRadius: '0', 
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                  itemStyle={{ color: '#D4A574' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8B7355" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-ivory p-8 border border-stone-200">
          <h3 className="font-heading text-xl text-stone-800 tracking-wide uppercase mb-10">Product Mix</h3>
          <div className="h-[250px] w-full mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" barSize={32}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fontStyle: 'bold', fill: '#444' }}
                />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            {categoryData.map((cat) => (
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

      {/* Recent Orders Table */}
      <div className="bg-ivory border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div>
            <h3 className="font-heading text-xl text-stone-800 tracking-wide uppercase">Recent Transactions</h3>
            <p className="text-[10px] tracking-widest text-stone-400 uppercase mt-1">Live order fulfillment stream</p>
          </div>
          <Link 
            to="/admin/orders" 
            className="group flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-gold hover:text-stone-800 transition-colors"
          >
            Manage All Orders <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-ivory border-b border-stone-100">
                <th className="px-8 py-5 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Client</th>
                <th className="px-8 py-5 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Selection</th>
                <th className="px-8 py-5 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Service</th>
                <th className="px-8 py-5 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Investment</th>
                <th className="px-8 py-5 text-[10px] tracking-widest text-stone-400 uppercase font-bold text-center">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <OrderRow customer="Fatima Al-Sudairi" product="Arabella Gown" type="Sale" amount="AED 28,500" status="Processing" date="Today, 2:45 PM" />
              <OrderRow customer="Reem Al-Mansoori" product="Celestine Gown" type="Rental" amount="AED 4,500" status="Shipped" date="Today, 11:20 AM" />
              <OrderRow customer="Noora Obaid" product="Rosalina Evening" type="Sale" amount="AED 26,000" status="Completed" date="Yesterday" />
              <OrderRow customer="Meera Al-Ali" product="Aurelia Dress" type="Rental" amount="AED 4,200" status="Pending" date="Yesterday" />
              <OrderRow customer="Latifa K." product="Midnight Empress" type="Rental" amount="AED 2,800" status="Completed" date="Apr 21" />
              <OrderRow customer="Amal Al-Sayegh" product="Seraphina Bridal" type="Sale" amount="AED 32,000" status="Processing" date="Apr 20" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  up: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

function StatCard({ title, value, trend, up, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-ivory p-6 border border-stone-200 group hover:border-gold transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-ivory text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500">
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
          up ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"
        )}>
          {up ? <ArrowUpRight className="w-3 h-3" aria-label="Trending up" /> : <ArrowDownRight className="w-3 h-3" aria-label="Trending down" />}
          {trend}
        </div>
      </div>
      <p className="text-[10px] tracking-widest text-stone-400 uppercase mb-1">{title}</p>
      <h4 className="text-xl font-heading text-stone-800 tracking-wide">{value}</h4>
    </div>
  );
}

interface OrderRowProps {
  customer: string;
  product: string;
  type: string;
  amount: string;
  status: string;
  date: string;
}

function OrderRow({ customer, product, type, amount, status, date }: OrderRowProps) {
  const statusColors: Record<string, string> = {
    Completed: 'bg-green-50 text-green-600',
    Processing: 'bg-blue-50 text-blue-600',
    Shipped: 'bg-gold/10 text-gold',
    Pending: 'bg-stone-100 text-stone-600'
  };

  return (
    <tr className="hover:bg-stone-50 transition-colors group">
      <td className="px-8 py-5">
        <p className="text-xs font-bold text-stone-800">{customer}</p>
        <p className="text-[8px] text-stone-400 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{date}</p>
      </td>
      <td className="px-8 py-5 text-stone-600 text-xs">{product}</td>
      <td className="px-8 py-5 translate-y-[2px]">
        <span className={cn(
          "text-[8px] tracking-[0.2em] uppercase px-2 py-1 border",
          type === 'Sale' ? "border-gold text-gold" : "border-stone-300 text-stone-400"
        )}>
          {type}
        </span>
      </td>
      <td className="px-8 py-5 text-xs text-stone-800 font-medium">{amount}</td>
      <td className="px-8 py-5 text-center">
        <span className={cn("inline-block text-[8px] tracking-widest uppercase px-3 py-1 font-bold", statusColors[status])}>
          {status}
        </span>
      </td>
    </tr>
  );
}
