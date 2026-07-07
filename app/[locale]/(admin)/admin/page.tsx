'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  total: number;
  payment_method: string;
  order_status: string;
}

interface LowStockProduct {
  name_en: string;
  name_bn: string;
  stock: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrderCount, setTodayOrderCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [weeklySales, setWeeklySales] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 6);
      startOfWeek.setHours(0, 0, 0, 0);

      const [ordersRes, lowStockRes, recentRes] = await Promise.all([
        supabase.from('orders').select('total, order_status, created_at').gte('created_at', startOfWeek.toISOString()),
        supabase.from('products').select('name_en, name_bn, stock, low_stock_threshold').order('stock', { ascending: true }).limit(5),
        supabase.from('orders').select('id, order_number, customer_name, phone, total, payment_method, order_status').order('created_at', { ascending: false }).limit(5),
      ]);

      if (ordersRes.data) {
        const todayOrders = ordersRes.data.filter((o) => new Date(o.created_at) >= startOfToday);
        setTodayRevenue(todayOrders.reduce((sum, o) => sum + Number(o.total), 0));
        setTodayOrderCount(todayOrders.length);
        setPendingCount(ordersRes.data.filter((o) => o.order_status === 'new').length);

        const buckets = [0, 0, 0, 0, 0, 0, 0];
        ordersRes.data.forEach((o) => {
          const diffDays = Math.floor((Date.now() - new Date(o.created_at).getTime()) / 86400000);
          const idx = 6 - diffDays;
          if (idx >= 0 && idx <= 6) buckets[idx] += Number(o.total);
        });
        setWeeklySales(buckets);
      }

      if (lowStockRes.data) {
        const low = lowStockRes.data.filter((p) => p.stock <= (p.low_stock_threshold ?? 5));
        setLowStockCount(low.length);
        setLowStockProducts(low.slice(0, 3));
      }

      if (recentRes.data) setRecentOrders(recentRes.data);

      setLoading(false);
    };

    load();
  }, []);

  const stats = [
    { label: 'Revenue (7 Days)', value: `৳${weeklySales.reduce((a, b) => a + b, 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'New Orders (Today)', value: `${todayOrderCount}`, icon: ShoppingBag, color: 'text-brand-primary bg-brand-surface border border-brand-border' },
    { label: 'Pending Orders', value: `${pendingCount}`, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Low Stock Alert', value: `${lowStockCount} products`, icon: AlertTriangle, color: 'text-brand-secondary bg-brand-secondary/5' },
  ];

  const maxSale = Math.max(...weeklySales, 1);
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });

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
                <span className="text-2xl font-black text-brand-text">{loading ? '—' : stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-brand-text text-lg">Weekly Sales Performance</h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-3 pt-4 border-b border-brand-border pb-1">
            {weeklySales.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className="w-full relative rounded-t-lg bg-brand-primary/20 group-hover:bg-brand-primary transition-all-custom"
                  style={{ height: `${Math.max((val / maxSale) * 100, 2)}%` }}
                >
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-text text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ৳{val}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-brand-muted">{dayLabels[idx]}</span>
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
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-brand-muted font-semibold">No low-stock products.</p>
            ) : (
              lowStockProducts.map((prod, idx) => (
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
              ))
            )}
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
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-muted font-bold">
                    <Package className="h-5 w-5 inline mr-2" />
                    {loading ? 'Loading...' : 'No orders yet.'}
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const statusColor =
                    order.order_status === 'new' ? 'text-blue-700 bg-blue-50' :
                    order.order_status === 'confirmed' ? 'text-purple-700 bg-purple-50' :
                    order.order_status === 'processing' ? 'text-amber-700 bg-amber-50' :
                    order.order_status === 'cancelled' ? 'text-rose-700 bg-rose-50' :
                    'text-emerald-700 bg-emerald-50';

                  return (
                    <tr key={order.id} className="hover:bg-brand-surface transition-all-custom">
                      <td className="py-3.5 px-4 font-bold text-brand-primary">{order.order_number}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-text">{order.customer_name}</div>
                        <div className="text-xs text-brand-muted">{order.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-text">৳{order.total}</td>
                      <td className="py-3.5 px-4 text-xs font-bold text-brand-muted uppercase">{order.payment_method}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                          {order.order_status}
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
