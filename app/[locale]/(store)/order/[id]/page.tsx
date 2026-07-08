'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { CheckCircle2, PhoneCall, MapPin, CreditCard, ShoppingBag, ArrowRight, Truck, Package, Copy, Check, XCircle } from 'lucide-react';
import Link from 'next/link';

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerDistrict: string;
  paymentMethod: 'cod' | 'online';
  paymentStatus?: string;
  shippingCharge: number;
  discountAmount?: number;
  subtotal?: number;
  grandTotal?: number;
  orderNumber?: string;
  orderStatus?: string;
  trackingNumber?: string | null;
  courier?: string | null;
  items?: { product_name: string; qty: number; price: number }[];
}

const STATUS_LABEL: Record<string, { en: string; bn: string }> = {
  new: { en: 'New', bn: 'নতুন' },
  confirmed: { en: 'Confirmed', bn: 'কনফার্ম' },
  processing: { en: 'Processing', bn: 'প্রসেসিং' },
  shipped: { en: 'Shipped', bn: 'পাঠানো হয়েছে' },
  delivered: { en: 'Delivered', bn: 'ডেলিভার হয়েছে' },
  cancelled: { en: 'Cancelled', bn: 'বাতিল' },
  returned: { en: 'Returned', bn: 'ফেরত' },
};

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFreshCheckout, setIsFreshCheckout] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      // Fast path: order was just placed in this session (checkout flow).
      // Skipped for online payments — those redirect through the gateway and
      // back, so only a fresh server fetch has the real payment_status.
      const sessionDetails = sessionStorage.getItem('last_order_details');
      if (sessionDetails) {
        try {
          const parsed = JSON.parse(sessionDetails);
          if (parsed.orderId === params.id && parsed.paymentMethod !== 'online') {
            setOrder({ ...parsed, paymentStatus: 'pending' });
            setIsFreshCheckout(true);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing order confirmation data:', e);
        }
      }

      // Otherwise, look up a real past order via the server (service-role — orders aren't publicly readable)
      const response = await fetch(`/api/orders/${params.id}`);
      if (!response.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { order: orderRow, items } = await response.json();
      setOrder({
        orderId: orderRow.id,
        orderNumber: orderRow.order_number,
        customerName: orderRow.customer_name,
        customerPhone: orderRow.phone,
        customerAddress: orderRow.address,
        customerDistrict: orderRow.district,
        paymentMethod: orderRow.payment_method === 'cod' ? 'cod' : 'online',
        paymentStatus: orderRow.payment_status,
        shippingCharge: orderRow.delivery_charge,
        discountAmount: orderRow.discount,
        subtotal: orderRow.subtotal,
        grandTotal: orderRow.total,
        orderStatus: orderRow.order_status,
        trackingNumber: orderRow.tracking_number,
        courier: orderRow.courier,
        items: items || [],
      });
      setLoading(false);
    };

    loadOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <XCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h1 className="text-xl font-extrabold text-brand-text">
          {isBn ? 'অর্ডার খুঁজে পাওয়া যায়নি' : 'Order not found'}
        </h1>
        <p className="text-xs text-brand-muted">
          {isBn ? 'এই লিংকটি সঠিক নয় অথবা অর্ডারটি মুছে ফেলা হয়েছে।' : 'This link is invalid, or the order no longer exists.'}
        </p>
        <Link href={`/track-order`} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-primary">
          {isBn ? 'অর্ডার ট্র্যাক করুন' : 'Track an order'} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const orderId = order?.orderNumber || order?.orderId || params.id;
  const name = order?.customerName || (isBn ? 'সম্মানিত কাস্টমার' : 'Valued Customer');
  const phone = order?.customerPhone || '017XXXXXXXX';
  const address = order?.customerAddress || (isBn ? 'সরাসরি ডেলিভারি ঠিকানা' : 'Specified shipping address');
  const district = order?.customerDistrict || (isBn ? 'ঢাকা' : 'Dhaka');
  const payment = order?.paymentMethod || 'cod';
  const isPaid = order?.paymentStatus === 'paid';
  const shipping = order?.shippingCharge !== undefined ? order.shippingCharge : 80;
  const discount = order?.discountAmount || 0;
  const subtotal = order?.subtotal !== undefined ? order.subtotal : 0;
  const grandTotal = order?.grandTotal !== undefined ? order.grandTotal : shipping + subtotal - discount;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16 pt-4 px-4 sm:px-0 text-center">
      {/* Success Badge Banner */}
      <div className="space-y-4">
        <div className="inline-flex p-3 rounded-full bg-brand-primary/10 text-brand-primary animate-bounce">
          <CheckCircle2 className="h-14 w-14 stroke-[1.5]" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-black text-brand-text tracking-tight">
            {isFreshCheckout
              ? (isBn ? 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!' : 'Order Placed Successfully!')
              : (isBn ? 'অর্ডার বিস্তারিত' : 'Order Details')}
          </h1>
          <p className="text-xs text-brand-muted font-bold max-w-sm mx-auto leading-relaxed">
            {isBn
              ? 'আমাদের Sicily শপে অর্ডার করার জন্য আপনাকে আন্তরিক ধন্যবাদ।'
              : 'Thank you for shopping with Sicily. Your order is registered.'}
          </p>
        </div>
      </div>

      {isFreshCheckout && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-start gap-3 text-left max-w-lg mx-auto">
          <PhoneCall className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {isBn
              ? `আমরা আগামী ২৪ ঘণ্টার মধ্যে আপনার মোবাইল নম্বর (${phone})-এ কল দিয়ে অর্ডারটি নিশ্চিত করব এবং ডেলিভারি শিডিউল জানাবো।`
              : `We will call you on your phone number (${phone}) within 24 hours to verify details and confirm the delivery schedule.`}
          </p>
        </div>
      )}

      {!isFreshCheckout && order?.orderStatus && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#C6A15B]/10 text-[#8A6A2E] border border-[#C6A15B]/30 uppercase tracking-wider">
            {isBn ? STATUS_LABEL[order.orderStatus]?.bn || order.orderStatus : STATUS_LABEL[order.orderStatus]?.en || order.orderStatus}
          </span>
          {order.trackingNumber && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/30 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              {order.courier ? `${order.courier}: ` : ''}{order.trackingNumber}
            </span>
          )}
        </div>
      )}

      {/* Invoice Card */}
      <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 text-left shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border pb-4 gap-2">
          <div>
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
              {isBn ? 'ইনভয়েস আইডি' : 'Invoice Number'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-extrabold text-brand-text">{orderId}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(orderId);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-1 rounded-lg text-brand-muted hover:text-brand-primary hover:bg-brand-surface transition-all-custom"
                title={isBn ? 'কপি করুন' : 'Copy'}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
              {isBn ? 'পেমেন্ট স্ট্যাটাস' : 'Payment Status'}
            </span>
            <span className={`inline-block px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold border ${
              isPaid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              {isPaid
                ? (isBn ? 'পরিশোধিত' : 'Paid')
                : payment === 'cod'
                  ? (isBn ? 'ডেলিভারিতে পরিশোধ' : 'Pay on Delivery')
                  : (isBn ? 'পেমেন্ট বাকি' : 'Payment Pending')}
            </span>
          </div>
        </div>

        {/* Order Items */}
        {order?.items && order.items.length > 0 && (
          <div className="space-y-2.5 border-b border-brand-border pb-6">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-brand-primary" />
              {isBn ? 'অর্ডারের পণ্য' : 'Order Items'}
            </span>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs py-1.5">
                <span className="text-brand-text font-semibold">{item.product_name} <span className="text-brand-muted">× {item.qty}</span></span>
                <span className="font-bold text-brand-text">৳{item.price * item.qty}</span>
              </div>
            ))}
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-brand-border pb-6">
          {/* Customer & Address Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-brand-text">
              <MapPin className="h-4 w-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block">{isBn ? 'ডেলিভারি ঠিকানা:' : 'Delivery Address:'}</span>
                <span className="font-medium text-brand-muted mt-1 block leading-relaxed">
                  {name}<br />
                  {address}, {district}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-brand-text">
              <CreditCard className="h-4 w-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block">{isBn ? 'পেমেন্ট পদ্ধতি:' : 'Payment Method:'}</span>
                <span className="font-bold text-brand-muted mt-1 block">
                  {payment === 'cod'
                    ? (isBn ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery (COD)')
                    : (isBn ? 'অনলাইন পেমেন্ট (SSLCommerz)' : 'Online Payment (SSLCommerz)')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Summary Details */}
        <div className="space-y-3 text-xs">
          {subtotal > 0 && (
            <div className="flex justify-between text-brand-muted">
              <span>{isBn ? 'পণ্যের মূল্য' : 'Subtotal'}</span>
              <span className="font-semibold text-brand-text">৳{subtotal}</span>
            </div>
          )}
          <div className="flex justify-between text-brand-muted">
            <span>{isBn ? 'ডেলিভারি খরচ' : 'Delivery Charge'}</span>
            <span className="font-semibold text-brand-text">৳{shipping}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-brand-primary font-semibold">
              <span>{isBn ? 'কুপন ছাড়' : 'Coupon Discount'}</span>
              <span>-৳{discount}</span>
            </div>
          )}
          <div className="flex justify-between text-brand-text font-extrabold text-sm border-t border-brand-border pt-3 items-baseline">
            <span>{isBn ? 'মোট মূল্য' : 'Grand Total'}</span>
            <span className="text-base font-black text-brand-secondary">৳{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Navigation CTA */}
      <div className="flex justify-center">
        <Link
          href={`/shop`}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-primary text-white font-extrabold text-xs shadow-lg shadow-brand-primary/25 hover:bg-brand-primary-alt transition-all-custom"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{isBn ? 'কেনাকাটা চালিয়ে যান' : 'Continue Shopping'}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
