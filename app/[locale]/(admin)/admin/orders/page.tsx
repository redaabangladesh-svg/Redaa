'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ShoppingBag, Search, Eye, Filter, ArrowLeftRight, Clock, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  customer: string;
  phone: string;
  amount: number;
  payment: string;
  status: 'new' | 'processing' | 'delivered' | 'cancelled';
  date: string;
}

const DEFAULT_ORDERS: Order[] = [
  { id: 'ORD-2026-0001', customer: 'Karim Ahmed', phone: '01712345678', amount: 1250, payment: 'COD', status: 'new', date: '2026-06-29 10:15' },
  { id: 'ORD-2026-0002', customer: 'Sultana Begum', phone: '01898765432', amount: 490, payment: 'Online', status: 'delivered', date: '2026-06-28 15:30' },
  { id: 'ORD-2026-0003', customer: 'Nayeem Khan', phone: '01911122233', amount: 750, payment: 'COD', status: 'processing', date: '2026-06-28 11:20' },
  { id: 'ORD-2026-0004', customer: 'Mimi Rahman', phone: '01544455566', amount: 2400, payment: 'Online', status: 'cancelled', date: '2026-06-27 09:45' }
];

export default function AdminOrdersPage() {
  const locale = useLocale();

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const stored = localStorage.getItem('sicily_orders_list');
    if (stored) {
      try {
        setOrders(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing orders:', e);
        setOrders(DEFAULT_ORDERS);
      }
    } else {
      localStorage.setItem('sicily_orders_list', JSON.stringify(DEFAULT_ORDERS));
      setOrders(DEFAULT_ORDERS);
    }
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats summaries
  const pendingCount = orders.filter(o => o.status === 'new').length;
  const processingCount = orders.filter(o => o.status === 'processing').length;
  const completedCount = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-text flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-brand-primary" />
            <span>{locale === 'bn' ? 'অর্ডার তালিকা' : 'Orders Management'}</span>
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 font-medium">
            {locale === 'bn' ? 'Sicily Decor শপের অর্ডারসমূহ ট্র্যাক ও স্ট্যাটাস আপডেট করুন।' : 'Track and manage customer shopping invoices and workflow.'}
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
            <span className="text-[10px] font-bold text-brand-muted uppercase block">{locale === 'bn' ? 'নতুন অর্ডার' : 'New Orders'}</span>
            <span className="text-xl font-black text-brand-text mt-0.5 block">{pendingCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ArrowLeftRight className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-muted uppercase block">{locale === 'bn' ? 'প্রসেসিং অর্ডার' : 'Processing'}</span>
            <span className="text-xl font-black text-brand-text mt-0.5 block">{processingCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-muted uppercase block">{locale === 'bn' ? 'ডেলিভার্ড সম্পন্ন' : 'Delivered'}</span>
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
            placeholder={locale === 'bn' ? 'আইডি, নাম বা ফোন দিয়ে অর্ডার খুঁজুন...' : 'Search by ID, name, or phone...'}
            className="w-full bg-white border border-brand-border rounded-2xl py-2.5 pl-4 pr-11 text-xs text-brand-text placeholder-brand-muted outline-none focus:border-brand-primary transition-all-custom font-medium"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: locale === 'bn' ? 'সব' : 'All' },
            { id: 'new', label: locale === 'bn' ? 'নতুন' : 'New' },
            { id: 'processing', label: locale === 'bn' ? 'প্রসেসিং' : 'Processing' },
            { id: 'delivered', label: locale === 'bn' ? 'ডেলিভার্ড' : 'Delivered' },
            { id: 'cancelled', label: locale === 'bn' ? 'বাতিল' : 'Cancelled' }
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
                <th className="py-4 px-6">{locale === 'bn' ? 'অর্ডার আইডি' : 'Order ID'}</th>
                <th className="py-4 px-6">{locale === 'bn' ? 'গ্রাহকের তথ্য' : 'Customer Info'}</th>
                <th className="py-4 px-6">{locale === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="py-4 px-6">{locale === 'bn' ? 'মোট মূল্য' : 'Grand Total'}</th>
                <th className="py-4 px-6">{locale === 'bn' ? 'পেমেন্ট' : 'Payment'}</th>
                <th className="py-4 px-6">{locale === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-4 px-6 text-right">{locale === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-muted font-bold">
                    {locale === 'bn' ? 'দুঃখিত, কোনো অর্ডার পাওয়া যায়নি! 📁' : 'No order details found! 📁'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusColors = 
                    order.status === 'new' ? 'text-blue-700 bg-blue-50 border-blue-100' :
                    order.status === 'processing' ? 'text-amber-700 bg-amber-50 border-amber-100' :
                    order.status === 'delivered' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                    'text-rose-700 bg-rose-50 border-rose-100';

                  const displayStatus = 
                    order.status === 'new' ? (locale === 'bn' ? 'নতুন' : 'New') :
                    order.status === 'processing' ? (locale === 'bn' ? 'প্রসেসিং' : 'Processing') :
                    order.status === 'delivered' ? (locale === 'bn' ? 'ডেলিভার্ড' : 'Delivered') :
                    (locale === 'bn' ? 'বাতিল' : 'Cancelled');

                  return (
                    <tr key={order.id} className="hover:bg-brand-surface/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-brand-primary">{order.id}</td>
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-brand-text text-sm">{order.customer}</div>
                        <div className="text-[10px] text-brand-muted mt-0.5 font-semibold">{order.phone}</div>
                      </td>
                      <td className="py-4 px-6 text-brand-muted font-bold">{order.date}</td>
                      <td className="py-4 px-6 font-extrabold text-brand-text">৳{order.amount}</td>
                      <td className="py-4 px-6 text-[10px] font-extrabold text-brand-muted">{order.payment}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${statusColors}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/${locale}/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white font-extrabold text-[10px] transition-all-custom"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{locale === 'bn' ? 'বিস্তারিত' : 'Detail'}</span>
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
