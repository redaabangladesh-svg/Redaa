'use client';

import { useTranslations } from 'next-intl';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const t = useTranslations('Home'); // fallback translation access

  const stats = [
    { label: 'Revenue (Today)', value: '৳১২,৫০০', change: '+১২.৩%', icon: TrendingUp, positive: true, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'New Orders (Today)', value: '২৮টি', change: '+৮.৫%', icon: ShoppingBag, positive: true, color: 'text-brand-primary bg-brand-surface border border-brand-border' },
    { label: 'Pending Orders', value: '১৫টি', change: '-২.১%', icon: Clock, positive: false, color: 'text-amber-600 bg-amber-50' },
    { label: 'Low Stock Alert', value: '৩টি পণ্য', change: 'Alert', icon: AlertTriangle, positive: false, color: 'text-brand-secondary bg-brand-secondary/5' }
  ];

  const recentOrders = [
    { id: 'ORD-2026-0001', customer: 'Karim Ahmed', phone: '01712345678', amount: 1250, payment: 'COD', status: 'new' },
    { id: 'ORD-2026-0002', customer: 'Sultana Begum', phone: '01898765432', amount: 490, payment: 'Online', status: 'confirmed' },
    { id: 'ORD-2026-0003', customer: 'Nayeem Khan', phone: '01911122233', amount: 750, payment: 'COD', status: 'processing' },
    { id: 'ORD-2026-0004', customer: 'Mimi Rahman', phone: '01544455566', amount: 2400, payment: 'Online', status: 'delivered' }
  ];

  const lowStockProducts = [
    { name_en: 'Premium Metal Flower Hanger', name_bn: 'প্রিমিয়াম মেটাল ফ্লাওয়ার হ্যাঙ্গার', stock: 2 },
    { name_en: 'Pastel Tulip Vase Set', name_bn: 'পেস্টেল টিউলিপ ফুলদানি সেট', stock: 1 }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-brand-border hover:shadow-lg transition-all-custom">
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-brand-muted">{stat.label}</span>
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-black text-brand-text">{stat.value}</span>
                <span className={`text-xs font-bold flex items-center ${stat.positive ? 'text-emerald-600' : 'text-brand-secondary'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart Mockup */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-brand-text text-lg">Weekly Sales Performance</h3>
            <span className="text-xs font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">
              June 2026
            </span>
          </div>
          {/* Custom SVG Bar Chart Mockup */}
          <div className="h-64 flex items-end justify-between gap-3 pt-4 border-b border-brand-border pb-1">
            {[45, 60, 30, 85, 55, 90, 75].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative rounded-t-lg bg-brand-primary/20 group-hover:bg-brand-primary transition-all-custom" style={{ height: `${val}%` }}>
                  {/* Tooltip on hover */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-text text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ৳{val * 200}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-brand-muted">
                  {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border space-y-6">
          <h3 className="font-bold text-brand-text text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-brand-secondary" />
            <span>Low Stock Alerts</span>
          </h3>
          <div className="space-y-4">
            {lowStockProducts.map((prod, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-brand-secondary/5 border border-brand-secondary/10">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-brand-text">{prod.name_en}</h4>
                  <p className="text-xs text-brand-muted">{prod.name_bn}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 text-xs font-bold text-brand-secondary bg-white rounded-full border border-brand-secondary/20">
                    {prod.stock} Left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-2xl border border-brand-border space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-brand-text text-lg">Recent Orders</h3>
          <Link href="/admin/orders" className="text-sm font-semibold text-brand-primary hover:text-brand-primary-alt flex items-center gap-1">
            <span>View All Orders</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted">
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Payment</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border font-medium">
              {recentOrders.map((order) => {
                const statusColor = 
                  order.status === 'new' ? 'text-blue-700 bg-blue-50' :
                  order.status === 'confirmed' ? 'text-purple-700 bg-purple-50' :
                  order.status === 'processing' ? 'text-amber-700 bg-amber-50' :
                  'text-emerald-700 bg-emerald-50';

                return (
                  <tr key={order.id} className="hover:bg-brand-surface transition-all-custom">
                    <td className="py-3.5 px-4 font-bold text-brand-primary">{order.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-brand-text">{order.customer}</div>
                      <div className="text-xs text-brand-muted">{order.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-text">৳{order.amount}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-brand-muted">{order.payment}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white px-3 py-1.5 rounded-lg transition-all-custom"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
