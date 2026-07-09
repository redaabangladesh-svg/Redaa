'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { fetchSettings } from '@/lib/settings';
import type { Order, OrderItem } from '@/types';

export default function OrderInvoicePage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Pick<OrderItem, 'id' | 'product_name' | 'variant' | 'qty' | 'price'>[]>([]);
  const [store, setStore] = useState<{ name: string; phone: string; email: string; address: string }>({
    name: 'Redaa', phone: '', email: '', address: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data: orderRow }, settings] = await Promise.all([
        supabase.from('orders').select('*').eq('id', params.id).maybeSingle(),
        fetchSettings(['store_name', 'store_phone', 'store_email', 'store_address']),
      ]);

      if (orderRow) {
        setOrder(orderRow);
        const { data: itemRows } = await supabase
          .from('order_items')
          .select('id, product_name, variant, qty, price')
          .eq('order_id', orderRow.id);
        setItems(itemRows || []);
      }
      setStore({
        name: settings.store_name || 'Redaa',
        phone: settings.store_phone || '',
        email: settings.store_email || '',
        address: settings.store_address || '',
      });
      setLoading(false);
    };
    load();
  }, [params.id]);

  useEffect(() => {
    if (!loading && order) {
      const timer = setTimeout(() => window.print(), 400);
      return () => clearTimeout(timer);
    }
  }, [loading, order]);

  if (loading) {
    return <div className="p-10 text-center text-sm font-bold text-gray-500 font-sans">লোড হচ্ছে...</div>;
  }

  if (!order) {
    return <div className="p-10 text-center text-sm font-bold text-gray-500 font-sans">অর্ডার পাওয়া যায়নি।</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8 font-sans text-black bg-white print:p-0">
      <style>{`
        @media print {
          @page { margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div className="flex items-start gap-3">
          <img src="/logo.svg" alt={store.name} className="h-12 w-12 object-contain flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-black">{store.name}</h1>
            {store.address && <p className="text-xs mt-1">{store.address}</p>}
            {store.phone && <p className="text-xs">ফোন: {store.phone}</p>}
            {store.email && <p className="text-xs">ইমেইল: {store.email}</p>}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold">ইনভয়েস</h2>
          <p className="text-xs mt-1">অর্ডার নম্বর: <b>{order.order_number}</b></p>
          <p className="text-xs">তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
        <div>
          <h3 className="font-bold uppercase text-[10px] text-gray-500 mb-1">গ্রাহকের তথ্য</h3>
          <p className="font-bold">{order.customer_name}</p>
          <p>{order.phone}</p>
          <p>{order.address}{order.area ? `, ${order.area}` : ''}, {order.district}</p>
        </div>
        <div className="text-right">
          <h3 className="font-bold uppercase text-[10px] text-gray-500 mb-1">পেমেন্ট</h3>
          <p>পদ্ধতি: {order.payment_method.toUpperCase()}</p>
          <p>স্ট্যাটাস: {order.payment_status === 'paid' ? 'পরিশোধিত' : 'বকেয়া'}</p>
        </div>
      </div>

      <table className="w-full text-xs border-collapse mb-6">
        <thead>
          <tr className="border-y-2 border-black">
            <th className="text-left py-2">পণ্য</th>
            <th className="text-center py-2">পরিমাণ</th>
            <th className="text-right py-2">দাম</th>
            <th className="text-right py-2">সাবটোটাল</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-300">
              <td className="py-2">{item.product_name}</td>
              <td className="text-center py-2">{item.qty}</td>
              <td className="text-right py-2">৳{item.price}</td>
              <td className="text-right py-2">৳{item.price * item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-8">
        <div className="w-56 text-xs space-y-1.5">
          <div className="flex justify-between"><span>উপ-মোট</span><span>৳{order.subtotal}</span></div>
          <div className="flex justify-between"><span>ডেলিভারি চার্জ</span><span>৳{order.delivery_charge}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between"><span>ছাড়</span><span>-৳{order.discount}</span></div>
          )}
          <div className="flex justify-between text-sm font-black border-t-2 border-black pt-2">
            <span>সর্বমোট</span><span>৳{order.total}</span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
        আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ — {store.name}
      </p>
    </div>
  );
}
