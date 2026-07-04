'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ShoppingBag, Search, Eye, Clock, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  total: number;
  payment_method: string;
  order_status: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, { en: string; bn: string }> = {
  new: { en: 'New', bn: 'নতুন' },
  confirmed: { en: 'Confirmed', bn: 'কনফার্ম' },
  processing: { en: 'Processing', bn: 'প্রসেসিং' },
  shipped: { en: 'Shipped', bn: 'পাঠানো হয়েছে' },
  delivered: { en: 'Delivered', bn: 'ডেলিভার্ড' },
  cancelled: { en: 'Cancelled', bn: 'বাতিল' },
  returned: { en: 'Returned', bn: 'ফেরত' },
};

const STATUS_COLORS: Record<string, string> = {
  new: 'text-blue-700 bg-blue-50 border-blue-100',
  confirmed: 'text-blue-700 bg-blue-50 border-blue-100',
  processing: 'text-amber-700 bg-amber-50 border-amber-100',
  shipped: 'text-purple-700 bg-purple-50 border-purple-100',
  delivered: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  cancelled: 'text-rose-700 bg-rose-50 border-rose-100',
  returned: 'text-rose-700 bg-rose-50 border-rose-100',
};

export default function AdminOrdersPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const loadOrders = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, phone, total, payment_method, order_status, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) setOrders(data);
      setLoading(false);
    };
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter(o => o.order_status === 'new').length;
  const processingCount = orders.filter(o => o.order_status === 'processing' || o.order_status === 'confirmed').length;
  const completedCount = orders.filter(o => o.order_status === 'delivered').length;

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-text flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-brand-primary" />
            <span>{isBn ? 'অর্ডার তালিকা' : 'Orders Management'}</span>
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 font-medium">
            {isBn ? 'Sicily শপের অর্ডারসমূহ ট্র্যাক ও স্ট্যাটাস আপডেট করুন।' : 'Track and manage customer shopping invoices and workflow.'}
          </p>
        </div>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-brand-border flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-muted uppercase block">{isBn ? 'নতুন অর্ডার' : 'New Orders'}</span>
            <span className="text-xl font-black text-brand-text mt-0.5 block">{pendingCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ArrowLeftRight className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-muted uppercase block">{isBn ? 'প্রসেসিং অর্ডার' : 'Processing'}</span>
            <span className="text-xl font-black text-brand-text mt-0.5 block">{processingCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-muted uppercase block">{isBn ? 'ডেলিভার্ড সম্পন্ন' : 'Delivered'}</span>
            <span className="text-xl font-black text-brand-text mt-0.5 block">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Control Widgets */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'আইডি, নাম বা ফোন দিয়ে অর্ডার খুঁজুন...' : 'Search by ID, name, or phone...'}
            className="w-full bg-white border border-brand-border rounded-2xl py-2.5 pl-4 pr-11 text-xs text-brand-text placeholder-brand-muted outline-none focus:border-brand-primary transition-all-custom font-medium"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: isBn ? 'সব' : 'All' },
            { id: 'new', label: isBn ? 'নতুন' : 'New' },
            { id: 'processing', label: isBn ? 'প্রসেসিং' : 'Processing' },
            { id: 'shipped', label: isBn ? 'পাঠানো হয়েছে' : 'Shipped' },
            { id: 'delivered', label: isBn ? 'ডেলিভার্ড' : 'Delivered' },
            { id: 'cancelled', label: isBn ? 'বাতিল' : 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all-custom border ${
                statusFilter === tab.id
                  ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/10'
                  : 'bg-white border-brand-border text-brand-text hover:border-brand-primary/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-medium">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted bg-brand-surface font-bold">
                <th className="py-4 px-6">{isBn ? 'অর্ডার আইডি' : 'Order ID'}</th>
                <th className="py-4 px-6">{isBn ? 'গ্রাহকের তথ্য' : 'Customer Info'}</th>
                <th className="py-4 px-6">{isBn ? 'তারিখ' : 'Date'}</th>
                <th className="py-4 px-6">{isBn ? 'মোট মূল্য' : 'Grand Total'}</th>
                <th className="py-4 px-6">{isBn ? 'পেমেন্ট' : 'Payment'}</th>
                <th className="py-4 px-6">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-4 px-6 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-muted font-bold">
                    {isBn ? 'লোড হচ্ছে...' : 'Loading...'}
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-muted font-bold">
                    {isBn ? 'দুঃখিত, কোনো অর্ডার পাওয়া যায়নি! 📁' : 'No order details found! 📁'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-surface/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-brand-primary">{order.order_number}</td>
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-brand-text text-sm">{order.customer_name}</div>
                      <div className="text-[10px] text-brand-muted mt-0.5 font-semibold">{order.phone}</div>
                    </td>
                    <td className="py-4 px-6 text-brand-muted font-bold">
                      {new Date(order.created_at).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-brand-text">৳{order.total}</td>
                    <td className="py-4 px-6 text-[10px] font-extrabold text-brand-muted uppercase">{order.payment_method}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[order.order_status] || STATUS_COLORS.new}`}>
                        {isBn ? STATUS_LABEL[order.order_status]?.bn || order.order_status : STATUS_LABEL[order.order_status]?.en || order.order_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/${locale}/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white font-extrabold text-[10px] transition-all-custom"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{isBn ? 'বিস্তারিত' : 'Detail'}</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
