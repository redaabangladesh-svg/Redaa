export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentMethod = 'cod' | 'sslcommerz';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderSource = 'website' | 'facebook' | 'instagram' | 'phone';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
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
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  courier: string | null;
  tracking_number: string | null;
  source: OrderSource;
  fraud_score: number;
  fraud_flags: string[];
  coupon_code: string | null;
  notes: string | null;
  sms_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  variant: Record<string, string> | null;
  qty: number;
  price: number;
}

export type CouponType = 'percentage' | 'fixed' | 'free_delivery';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  district: string | null;
  total_orders: number;
  total_spent: number;
  is_blocked: boolean;
  block_reason: string | null;
  tags: string[];
  created_at: string;
}

export const STATUS_LABEL: Record<OrderStatus, { en: string; bn: string }> = {
  new: { en: 'New', bn: 'নতুন' },
  confirmed: { en: 'Confirmed', bn: 'কনফার্ম' },
  processing: { en: 'Processing', bn: 'প্রসেসিং' },
  shipped: { en: 'Shipped', bn: 'পাঠানো হয়েছে' },
  delivered: { en: 'Delivered', bn: 'ডেলিভার্ড' },
  cancelled: { en: 'Cancelled', bn: 'বাতিল' },
  returned: { en: 'Returned', bn: 'ফেরত' },
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'text-blue-700 bg-blue-50 border-blue-100',
  confirmed: 'text-blue-700 bg-blue-50 border-blue-100',
  processing: 'text-amber-700 bg-amber-50 border-amber-100',
  shipped: 'text-purple-700 bg-purple-50 border-purple-100',
  delivered: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  cancelled: 'text-rose-700 bg-rose-50 border-rose-100',
  returned: 'text-rose-700 bg-rose-50 border-rose-100',
};

export type { HomeProduct } from '@/lib/products';
export type { ProductDetail, ProductReview } from '@/lib/products-db';
