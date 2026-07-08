'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft, User, MapPin, Calendar, ShoppingBag, ShieldCheck, ShieldAlert, Truck, Ban, Printer } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { WA_TEMPLATES, getWhatsAppURL } from '@/lib/whatsapp';
import type { Order, OrderItem, OrderStatus } from '@/types';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

const STATUS_LABEL: Record<OrderStatus, { en: string; bn: string }> = {
  new: { en: 'New / Pending', bn: 'নতুন' },
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
  const [items, setItems] = useState<Pick<OrderItem, 'id' | 'product_name' | 'qty' | 'price'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [assigningCourier, setAssigningCourier] = useState(false);
  const [blockingPhone, setBlockingPhone] = useState(false);
  const [orderList, setOrderList] = useState<Pick<Order, 'id' | 'order_number' | 'customer_name' | 'total' | 'order_status'>[]>([]);

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

  useEffect(() => {
    const loadOrderList = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, total, order_status')
        .order('created_at', { ascending: false })
        .limit(30);
      setOrderList(data || []);
    };
    loadOrderList();
  }, []);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setSuccessMsg('');
    setErrorMsg('');

    const response = await fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus: newStatus }),
    });

    if (!response.ok) {
      setErrorMsg(isBn ? 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।' : 'Failed to update status.');
      return;
    }

    setOrder({ ...order, order_status: newStatus });
    setSuccessMsg(isBn ? 'অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!' : 'Order status updated successfully!');
  };

  const handleBlockPhone = async () => {
    if (!order) return;
    setBlockingPhone(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const response = await fetch('/api/fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: order.phone, reason: `Blocked from order ${order.order_number}` }),
      });

      if (!response.ok) {
        setErrorMsg(isBn ? 'ফোন নম্বর ব্লক করা যায়নি।' : 'Failed to block phone number.');
        return;
      }

      setSuccessMsg(isBn ? 'ফোন নম্বর ব্লক করা হয়েছে।' : 'Phone number blocked.');
    } finally {
      setBlockingPhone(false);
    }
  };

  const handleAssignCourier = async (courier: 'steadfast' | 'pathao' | 'redex') => {
    if (!order) return;
    const confirmed = window.confirm(
      isBn
        ? `আপনি কি নিশ্চিত ${courier}-এ এই অর্ডারটি পাঠাতে চান? এটি সত্যিকারের কুরিয়ার শিপমেন্ট তৈরি করবে, ফিরিয়ে নেওয়া যাবে না।`
        : `Are you sure you want to send this order to ${courier}? This creates a real courier shipment and cannot be undone.`
    );
    if (!confirmed) return;

    setAssigningCourier(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/courier/${courier}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || (isBn ? 'কুরিয়ার এসাইন ব্যর্থ হয়েছে।' : 'Failed to assign courier.'));
        return;
      }

      setOrder({ ...order, courier, tracking_number: data.trackingCode, order_status: 'shipped' });
      setSuccessMsg(isBn ? `${courier}-এ পাঠানো হয়েছে!` : `Sent to ${courier} successfully!`);
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
    <div className="max-w-7xl grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start font-sans">
    <div className="space-y-6 min-w-0">
      {/* Back Button */}
      <Link
        href={`/admin/orders`}
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

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/orders/${order.id}/invoice`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-xs font-bold text-brand-muted hover:border-brand-primary hover:text-brand-primary transition-all-custom"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>{isBn ? 'ইনভয়েস প্রিন্ট/ডাউনলোড' : 'Print/Download Invoice'}</span>
          </Link>
          <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide ${STATUS_COLORS[order.order_status]}`}>
            {isBn ? STATUS_LABEL[order.order_status].bn : STATUS_LABEL[order.order_status].en}
          </span>
        </div>
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
                <span className="flex items-center gap-2">
                  <span className="text-brand-primary font-bold block text-sm">{order.phone}</span>
                  <a
                    href={getWhatsAppURL(
                      order.phone,
                      WA_TEMPLATES.ORDER_CONFIRM(
                        order.customer_name,
                        items.length > 0 ? (items.length > 1 ? `${items[0].product_name} ও আরও ${items.length - 1}টি পণ্য` : items[0].product_name) : (isBn ? 'পণ্য' : 'product'),
                        order.total
                      )
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={isBn ? 'হোয়াটসঅ্যাপে মেসেজ পাঠান' : 'Send WhatsApp message'}
                    className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#25D366] text-white flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <WhatsAppIcon className="h-3 w-3" />
                  </a>
                </span>
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
                    <p className="text-[10px] text-brand-muted mt-0.5">পরিমাণ: {item.qty}</p>
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
          {/* Fraud check card */}
          <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="font-extrabold text-brand-text text-sm border-b border-brand-border pb-3 flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-brand-primary" />
              <span>{isBn ? 'ফ্রড স্কোর' : 'Fraud Check'}</span>
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-muted">{isBn ? 'স্কোর' : 'Score'}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                order.fraud_score <= 30
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                  : order.fraud_score <= 60
                    ? 'text-amber-700 bg-amber-50 border-amber-100'
                    : 'text-rose-700 bg-rose-50 border-rose-100'
              }`}>
                {order.fraud_score}/100
              </span>
            </div>
            {order.fraud_flags && order.fraud_flags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {order.fraud_flags.map((flag) => (
                  <span key={flag} className="px-2 py-0.5 rounded-full bg-brand-surface border border-brand-border text-[10px] font-bold text-brand-muted">
                    {flag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-brand-muted font-semibold">{isBn ? 'কোনো ফ্ল্যাগ নেই' : 'No flags'}</p>
            )}
            <button
              onClick={handleBlockPhone}
              disabled={blockingPhone}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-rose-200 text-rose-600 font-bold text-[11px] hover:bg-rose-50 transition-all-custom disabled:opacity-60"
            >
              <Ban className="h-3.5 w-3.5" />
              <span>{isBn ? 'ফোন নম্বর ব্লক করুন' : 'Block Phone Number'}</span>
            </button>
          </div>

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
              <div className="space-y-2">
                {(['steadfast', 'pathao', 'redex'] as const).map((courier) => (
                  <button
                    key={courier}
                    onClick={() => handleAssignCourier(courier)}
                    disabled={assigningCourier}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-primary text-white font-extrabold text-xs shadow-sm hover:bg-brand-primary-alt transition-all-custom disabled:opacity-60 capitalize"
                  >
                    {assigningCourier ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Truck className="h-4 w-4" />
                        <span>{isBn ? `${courier}-এ পাঠান` : `Send to ${courier}`}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* WhatsApp status-update messages (order confirmation lives next to the phone number above) */}
          {(order.tracking_number || order.order_status === 'delivered' || order.order_status === 'cancelled') && (
          <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="font-extrabold text-brand-text text-sm border-b border-brand-border pb-3 flex items-center gap-2">
              <WhatsAppIcon className="h-4.5 w-4.5 text-[#25D366]" />
              <span>{isBn ? 'হোয়াটসঅ্যাপ মেসেজ' : 'WhatsApp Message'}</span>
            </h3>

            {order.tracking_number && (
              <a
                href={getWhatsAppURL(
                  order.phone,
                  WA_TEMPLATES.ORDER_SHIPPED(order.customer_name, order.courier || 'কুরিয়ার', order.tracking_number)
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#25D366]/40 text-[#128C7E] font-bold text-[11px] hover:bg-[#25D366]/5 transition-all-custom"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                <span>{isBn ? 'শিপিং আপডেট পাঠান' : 'Send Shipping Update'}</span>
              </a>
            )}

            {order.order_status === 'delivered' && (
              <a
                href={getWhatsAppURL(order.phone, WA_TEMPLATES.ORDER_DELIVERED(order.customer_name))}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#25D366]/40 text-[#128C7E] font-bold text-[11px] hover:bg-[#25D366]/5 transition-all-custom"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                <span>{isBn ? 'ডেলিভারি কনফার্মেশন পাঠান' : 'Send Delivery Confirmation'}</span>
              </a>
            )}

            {order.order_status === 'cancelled' && (
              <a
                href={getWhatsAppURL(order.phone, WA_TEMPLATES.ORDER_CANCELLED(order.customer_name, order.order_number))}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#25D366]/40 text-[#128C7E] font-bold text-[11px] hover:bg-[#25D366]/5 transition-all-custom"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                <span>{isBn ? 'বাতিল বার্তা পাঠান' : 'Send Cancellation Message'}</span>
              </a>
            )}
          </div>
          )}
        </div>
      </div>
    </div>

    {/* Order list side panel — switch orders without leaving this page */}
    <div className="hidden xl:block bg-white border border-brand-border rounded-2xl shadow-sm sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
      <h3 className="font-extrabold text-brand-text text-sm p-4 border-b border-brand-border sticky top-0 bg-white">
        {isBn ? 'সাম্প্রতিক অর্ডার' : 'Recent Orders'}
      </h3>
      <div className="divide-y divide-brand-border">
        {orderList.map((o) => (
          <Link
            key={o.id}
            href={`/admin/orders/${o.id}`}
            className={`block p-3.5 text-xs transition-colors ${o.id === order.id ? 'bg-brand-primary/5 border-l-2 border-brand-primary' : 'hover:bg-brand-surface border-l-2 border-transparent'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-brand-primary truncate">{o.order_number}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${STATUS_COLORS[o.order_status]}`}>
                {isBn ? STATUS_LABEL[o.order_status].bn : STATUS_LABEL[o.order_status].en}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-brand-text font-semibold truncate">{o.customer_name}</span>
              <span className="text-brand-muted font-bold flex-shrink-0">৳{o.total}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
    </div>
  );
}
