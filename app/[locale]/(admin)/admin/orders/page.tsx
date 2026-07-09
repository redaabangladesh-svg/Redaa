'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ShoppingBag, Search, Eye, Clock, ArrowLeftRight, CheckCircle2, Download, CheckSquare, Truck, Printer, X, ChevronLeft, ChevronRight, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  district: string;
  total: number;
  payment_method: string;
  order_status: string;
  created_at: string;
}

interface PreviewItem {
  id: string;
  product_name: string;
  qty: number;
  price: number;
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadOrders = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, phone, address, district, total, payment_method, order_status, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (ids: string[]) => {
    setSelectedIds((prev) => (prev.size === ids.length ? new Set() : new Set(ids)));
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (selectedIds.size === 0) return;
    setBulkWorking(true);
    await Promise.all(
      Array.from(selectedIds).map((id) =>
        fetch(`/api/orders/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderStatus: newStatus }),
        })
      )
    );
    setSelectedIds(new Set());
    setBulkWorking(false);
    loadOrders();
  };

  const handleExportExcel = async () => {
    const XLSX = await import('xlsx');
    const rows = filteredOrders.map((o) => ({
      'অর্ডার নম্বর': o.order_number,
      'কাস্টমার': o.customer_name,
      'ফোন': o.phone,
      'মোট': o.total,
      'পেমেন্ট পদ্ধতি': o.payment_method,
      'স্ট্যাটাস': o.order_status,
      'তারিখ': new Date(o.created_at).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, `orders-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const previewOrder = previewIndex !== null ? filteredOrders[previewIndex] : null;

  useEffect(() => {
    if (!previewOrder) {
      setPreviewItems([]);
      return;
    }
    setPreviewLoading(true);
    const supabase = createClient();
    supabase
      .from('order_items')
      .select('id, product_name, qty, price')
      .eq('order_id', previewOrder.id)
      .then(({ data }) => {
        setPreviewItems(data || []);
        setPreviewLoading(false);
      });
  }, [previewOrder?.id]);

  const openPreview = (order: Order) => {
    const idx = filteredOrders.findIndex((o) => o.id === order.id);
    setPreviewIndex(idx);
  };

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
            {isBn ? 'Redaa শপের অর্ডারসমূহ ট্র্যাক ও স্ট্যাটাস আপডেট করুন।' : 'Track and manage customer shopping invoices and workflow.'}
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

      {/* Bulk actions + Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-brand-muted">
            {isBn ? `${selectedIds.size}টি নির্বাচিত` : `${selectedIds.size} selected`}
          </span>
          <button
            onClick={() => handleBulkStatus('confirmed')}
            disabled={selectedIds.size === 0 || bulkWorking}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white font-extrabold text-[10px] transition-all-custom disabled:opacity-40 disabled:pointer-events-none"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>{isBn ? 'কনফার্ম করুন' : 'Confirm selected'}</span>
          </button>
          <button
            onClick={() => handleBulkStatus('shipped')}
            disabled={selectedIds.size === 0 || bulkWorking}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white font-extrabold text-[10px] transition-all-custom disabled:opacity-40 disabled:pointer-events-none"
          >
            <Truck className="h-3.5 w-3.5" />
            <span>{isBn ? 'পাঠানো হয়েছে চিহ্নিত করুন' : 'Mark shipped'}</span>
          </button>
        </div>
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-brand-border bg-white text-brand-text hover:border-brand-primary/40 font-extrabold text-[10px] transition-all-custom"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{isBn ? 'এক্সপোর্ট (Excel)' : 'Export to Excel'}</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-medium">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted bg-brand-surface font-bold">
                <th className="py-4 px-4">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedIds.size === filteredOrders.length}
                    onChange={() => toggleSelectAll(filteredOrders.map((o) => o.id))}
                    className="h-3.5 w-3.5"
                  />
                </th>
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
                  <td colSpan={8} className="py-12 text-center text-brand-muted font-bold">
                    {isBn ? 'লোড হচ্ছে...' : 'Loading...'}
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-muted font-bold">
                    {isBn ? 'দুঃখিত, কোনো অর্ডার পাওয়া যায়নি! 📁' : 'No order details found! 📁'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => openPreview(order)}
                    className="hover:bg-brand-surface/40 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelected(order.id)}
                        className="h-3.5 w-3.5"
                      />
                    </td>
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
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}/invoice`}
                          target="_blank"
                          title={isBn ? 'ইনভয়েস' : 'Invoice'}
                          className="inline-flex items-center justify-center p-1.5 rounded-xl border border-brand-border text-brand-muted hover:border-brand-primary hover:text-brand-primary transition-all-custom"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white font-extrabold text-[10px] transition-all-custom"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{isBn ? 'বিস্তারিত' : 'Detail'}</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Preview Drawer */}
      {previewOrder && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setPreviewIndex(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border flex-shrink-0">
              <div>
                <h3 className="font-black text-brand-text text-sm">{previewOrder.order_number}</h3>
                <p className="text-[10px] text-brand-muted font-semibold mt-0.5">
                  {new Date(previewOrder.created_at).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
                  disabled={previewIndex === 0}
                  title={isBn ? 'আগেরটি' : 'Previous'}
                  className="p-2 rounded-lg border border-brand-border text-brand-muted hover:border-brand-primary hover:text-brand-primary disabled:opacity-30 disabled:pointer-events-none transition-all-custom"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewIndex((i) => (i !== null && i < filteredOrders.length - 1 ? i + 1 : i))}
                  disabled={previewIndex === filteredOrders.length - 1}
                  title={isBn ? 'পরেরটি' : 'Next'}
                  className="p-2 rounded-lg border border-brand-border text-brand-muted hover:border-brand-primary hover:text-brand-primary disabled:opacity-30 disabled:pointer-events-none transition-all-custom"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewIndex(null)}
                  title={isBn ? 'বন্ধ করুন' : 'Close'}
                  className="p-2 rounded-lg text-brand-muted hover:bg-brand-surface transition-all-custom"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[previewOrder.order_status] || STATUS_COLORS.new}`}>
                  {isBn ? STATUS_LABEL[previewOrder.order_status]?.bn || previewOrder.order_status : STATUS_LABEL[previewOrder.order_status]?.en || previewOrder.order_status}
                </span>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold uppercase text-brand-muted">{isBn ? 'গ্রাহক' : 'Customer'}</h4>
                <p className="text-sm font-extrabold text-brand-text">{previewOrder.customer_name}</p>
                <p className="text-xs text-brand-muted font-semibold">{previewOrder.phone}</p>
                <p className="text-xs text-brand-muted font-medium flex items-start gap-1.5 pt-1">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>{previewOrder.address}, {previewOrder.district}</span>
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-brand-muted">{isBn ? 'পণ্যসমূহ' : 'Items'}</h4>
                {previewLoading ? (
                  <p className="text-xs text-brand-muted font-semibold">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</p>
                ) : previewItems.length === 0 ? (
                  <p className="text-xs text-brand-muted font-semibold">—</p>
                ) : (
                  <div className="space-y-2">
                    {previewItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-brand-text">{item.product_name} × {item.qty}</span>
                        <span className="font-bold text-brand-text">৳{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-brand-border">
                <span className="text-xs font-bold text-brand-muted">{isBn ? 'পেমেন্ট' : 'Payment'}</span>
                <span className="text-xs font-extrabold text-brand-text uppercase">{previewOrder.payment_method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-brand-text">{isBn ? 'সর্বমোট' : 'Total'}</span>
                <span className="text-lg font-black text-brand-secondary">৳{previewOrder.total}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-brand-border flex-shrink-0">
              <Link
                href={`/admin/orders/${previewOrder.id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-primary text-white font-extrabold text-xs hover:bg-brand-primary-alt transition-all-custom"
              >
                <ExternalLink className="h-4 w-4" />
                <span>{isBn ? 'পূর্ণ বিবরণ ও স্ট্যাটাস আপডেট' : 'Full Detail & Update Status'}</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
