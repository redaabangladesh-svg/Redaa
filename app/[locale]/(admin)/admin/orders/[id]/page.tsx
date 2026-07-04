'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft, User, MapPin, Calendar, ShoppingBag, ShieldCheck, ShieldAlert, Truck } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

type OrderStatus = 'new' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  district: string;
  area: string | null;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  payment_method: string;
  order_status: OrderStatus;
  courier: string | null;
  tracking_number: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  qty: number;
  price: number;
}

const STATUS_LABEL: Record<OrderStatus, { en: string; bn: string }> = {
  new: { en: 'New / Pending', bn: 'নতুন (New)' },
  confirmed: { en: 'Confirmed', bn: 'কনফার্ম' },
  processing: { en: 'Processing', bn: 'প্রসেসিং' },
  shipped: { en: 'Shipped', bn: 'পাঠানো হয়েছে' },
  delivered: { en: 'Delivered', bn: 'ডেলিভার্ড' },
  cancelled: { en: 'Cancelled', bn: 'বাতিল' },
  returned: { en: 'Returned', bn: 'ফেরত' },
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'text-blue-700 bg-blue-50 border-blue-100',
  confirmed: 'text-blue-700 bg-blue-50 border-blue-100',
  processing: 'text-amber-700 bg-amber-50 border-amber-100',
  shipped: 'text-purple-700 bg-purple-50 border-purple-100',
  delivered: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  cancelled: 'text-rose-700 bg-rose-50 border-rose-100',
  returned: 'text-rose-700 bg-rose-50 border-rose-100',
};

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [assigningCourier, setAssigningCourier] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      const supabase = createClient();
      const { data: orderRow } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

      if (orderRow) {
        setOrder(orderRow);
        const { data: itemRows } = await supabase
          .from('order_items')
          .select('id, product_name, qty, price')
          .eq('order_id', orderRow.id);
        setItems(itemRows || []);
      }
      setLoading(false);
    };
    loadOrder();
  }, [params.id]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setSuccessMsg('');
    setErrorMsg('');

    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', order.id);

    if (error) {
      setErrorMsg(isBn ? 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।' : 'Failed to update status.');
      return;
    }

    setOrder({ ...order, order_status: newStatus });
    setSuccessMsg(isBn ? 'অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!' : 'Order status updated successfully!');
  };

  const handleAssignSteadfast = async () => {
    if (!order) return;
    setAssigningCourier(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/courier/steadfast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || (isBn ? 'কুরিয়ার এসাইন ব্যর্থ হয়েছে।' : 'Failed to assign courier.'));
        return;
      }

      setOrder({ ...order, courier: 'steadfast', tracking_number: data.trackingCode, order_status: 'shipped' });
      setSuccessMsg(isBn ? 'Steadfast-এ পাঠানো হয়েছে!' : 'Sent to Steadfast successfully!');
    } finally {
      setAssigningCourier(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-brand-muted font-bold font-sans">
        {isBn ? 'অর্ডার তথ্য লোড হচ্ছে...' : 'Loading order details...'}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-12 text-center text-brand-muted font-bold font-sans">
        {isBn ? 'অর্ডার পাওয়া যায়নি।' : 'Order not found.'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 font-sans">
      {/* Back Button */}
      <Link
        href={`/${locale}/admin/orders`}
        className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{isBn ? 'অর্ডার তালিকায় ফিরে যান' : 'Back to Orders List'}</span>
      </Link>

      {/* Header */}
      <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-brand-text">
            {isBn ? `অর্ডার বিবরণী: ${order.order_number}` : `Order Details: ${order.order_number}`}
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 font-medium flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-brand-primary" />
            <span>{new Date(order.created_at).toLocaleString(isBn ? 'bn-BD' : 'en-US')}</span>
          </p>
        </div>

        <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide ${STATUS_COLORS[order.order_status]}`}>
          {isBn ? STATUS_LABEL[order.order_status].bn : STATUS_LABEL[order.order_status].en}
        </span>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Editor & Invoice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Columns: Invoice Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer Profile card */}
          <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-brand-text text-sm border-b border-brand-border pb-3 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-brand-primary" />
              <span>{isBn ? 'গ্রাহকের বিস্তারিত তথ্য' : 'Customer Profile'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div className="space-y-1">
                <span className="text-[10px] text-brand-muted font-bold block">{isBn ? 'নাম' : 'Customer Name'}</span>
                <span className="text-brand-text font-extrabold block text-sm">{order.customer_name}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-brand-muted font-bold block">{isBn ? 'ফোন নম্বর' : 'Phone Number'}</span>
                <span className="text-brand-primary font-bold block text-sm">{order.phone}</span>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-[10px] text-brand-muted font-bold block">{isBn ? 'ডেলিভারি ঠিকানা' : 'Shipping Address'}</span>
                <span className="text-brand-text leading-relaxed mt-1 block">
                  <MapPin className="h-4 w-4 inline mr-1 text-brand-primary flex-shrink-0 align-text-bottom" />
                  {order.address}{order.area ? `, ${order.area}` : ''}, {order.district}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Products invoice card */}
          <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-brand-text text-sm border-b border-brand-border pb-3 flex items-center gap-2">
              <ShoppingBag className="h-4.5 w-4.5 text-brand-primary" />
              <span>{isBn ? 'অর্ডারকৃত সামগ্রী' : 'Ordered Items'}</span>
            </h3>

            <div className="space-y-4 text-xs">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-brand-text">{item.product_name}</h4>
                    <p className="text-[10px] text-brand-muted mt-0.5">Qty: {item.qty}</p>
                  </div>
                  <span className="font-bold block text-brand-text">৳{item.price * item.qty}</span>
                </div>
              ))}

              {/* Total calculations */}
              <div className="border-t border-brand-border pt-4 space-y-2">
                <div className="flex justify-between text-brand-muted">
                  <span>{isBn ? 'উপ-মোট' : 'Subtotal'}</span>
                  <span>৳{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>{isBn ? 'শিপিং চার্জ' : 'Shipping Charge'}</span>
                  <span>৳{order.delivery_charge}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-brand-primary font-semibold">
                    <span>{isBn ? 'ছাড়' : 'Discount'}</span>
                    <span>-৳{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-brand-text border-t border-brand-border pt-3 items-baseline">
                  <span>{isBn ? 'সর্বমোট মূল্য' : 'Grand Total'}</span>
                  <span className="text-base font-black text-brand-secondary">৳{order.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workflow status editor */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-brand-text text-sm border-b border-brand-border pb-3">
              {isBn ? 'স্ট্যাটাস আপডেট করুন' : 'Manage Workflow'}
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">
                {isBn ? 'অর্ডার স্ট্যাটাস:' : 'Order Status:'}
              </label>
              <select
                value={order.order_status}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              >
                {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
                  <option key={s} value={s}>{isBn ? STATUS_LABEL[s].bn : STATUS_LABEL[s].en}</option>
                ))}
              </select>
            </div>

            <div className="text-[10px] text-brand-muted leading-relaxed font-semibold pt-2 border-t border-brand-border">
              {isBn
                ? '* অর্ডার স্ট্যাটাস পরিবর্তন করার সাথে সাথে ডেটাবেজে এবং কাস্টমারের ট্র্যাক পোর্টালে সেটি আপডেট হবে।'
                : '* Updating order status immediately refreshes details inside administration tables.'}
            </div>
          </div>

          {/* Courier assignment card */}
          <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-brand-text text-sm border-b border-brand-border pb-3 flex items-center gap-2">
              <Truck className="h-4.5 w-4.5 text-brand-primary" />
              <span>{isBn ? 'কুরিয়ার' : 'Courier'}</span>
            </h3>

            {order.tracking_number ? (
              <div className="text-xs space-y-1.5">
                <span className="text-[10px] text-brand-muted font-bold block uppercase">{order.courier}</span>
                <span className="font-extrabold text-brand-text block">{order.tracking_number}</span>
              </div>
            ) : (
              <button
                onClick={handleAssignSteadfast}
                disabled={assigningCourier}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-primary text-white font-extrabold text-xs shadow-sm hover:bg-brand-primary-alt transition-all-custom disabled:opacity-60"
              >
                {assigningCourier ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Truck className="h-4 w-4" />
                    <span>{isBn ? 'Steadfast-এ পাঠান' : 'Send to Steadfast'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
