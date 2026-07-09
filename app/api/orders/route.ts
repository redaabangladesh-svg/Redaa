import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSessionClient } from '@/lib/supabase-server';
import { checkFraud } from '@/lib/fraud';
import { sendSMS, SMS_TEMPLATES } from '@/lib/sms';

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface OrderItemInput {
  productId?: string;
  name: string;
  variant?: Record<string, string> | null;
  qty: number;
  price: number;
}

interface OrderInput {
  customerName: string;
  phone: string;
  address: string;
  district: string;
  area?: string;
  items: OrderItemInput[];
  paymentMethod: string;
  shippingCharge: number;
  discountAmount?: number;
  couponCode?: string;
  source?: string;
  notes?: string;
}

export async function POST(request: Request) {
  const body: OrderInput = await request.json();

  if (!body.customerName?.trim() || !body.phone?.trim() || !body.address?.trim() || !body.district?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: 'No items in order' }, { status: 400 });
  }

  const cleanPhone = body.phone.replace(/\D/g, '');
  const supabase = createServiceClient();

  // Stock check for any item tied to a real product
  const productIds = body.items.map((i) => i.productId).filter(Boolean) as string[];
  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('id, stock, name_en')
      .in('id', productIds);

    for (const item of body.items) {
      if (!item.productId) continue;
      const product = products?.find((p) => p.id === item.productId);
      if (product && product.stock < item.qty) {
        return NextResponse.json(
          { error: `${product.name_en} — only ${product.stock} left in stock` },
          { status: 409 }
        );
      }
    }
  }

  const subtotal = body.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = body.discountAmount || 0;
  const total = subtotal + body.shippingCharge - discount;

  // Resolve logged-in customer (if any) from the session cookie
  let customerId: string | null = null;
  const sessionClient = await createSessionClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (user) {
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();
    customerId = customer?.id ?? null;
  }

  const fraud = await checkFraud({
    phone: cleanPhone,
    address: body.address,
    paymentMethod: body.paymentMethod,
    total,
  });

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      customer_name: body.customerName,
      phone: cleanPhone,
      address: body.address,
      district: body.district,
      area: body.area || null,
      subtotal,
      delivery_charge: body.shippingCharge,
      discount,
      total,
      payment_method: body.paymentMethod,
      source: body.source || 'website',
      fraud_score: fraud.score,
      fraud_flags: fraud.flags,
      coupon_code: body.couponCode || null,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (orderError || !newOrder) {
    console.error('Order creation failed:', orderError);
    return NextResponse.json({ error: `Could not place order: ${orderError?.message || 'Unknown DB error'}` }, { status: 500 });
  }

  await supabase.from('order_items').insert(
    body.items.map((item) => ({
      order_id: newOrder.id,
      product_id: item.productId || null,
      product_name: item.name,
      variant: item.variant || null,
      qty: item.qty,
      price: item.price,
    }))
  );

  for (const item of body.items) {
    if (item.productId) {
      await supabase.rpc('decrement_stock', { p_product_id: item.productId, p_qty: item.qty });
    }
  }

  if (body.couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('id, used_count')
      .eq('code', body.couponCode.toUpperCase())
      .maybeSingle();
    if (coupon) {
      await supabase.from('coupons').update({ used_count: coupon.used_count + 1 }).eq('id', coupon.id);
    }
  }

  if (fraud.action === 'auto_confirm') {
    try {
      await sendSMS(cleanPhone, SMS_TEMPLATES.ORDER_CONFIRMED(body.customerName, newOrder.order_number), newOrder.id);
    } catch {
      // SMS failures never block order placement
    }
  }

  return NextResponse.json({
    id: newOrder.id,
    orderNumber: newOrder.order_number,
    subtotal,
    shippingCharge: body.shippingCharge,
    discount,
    total,
    fraudAction: fraud.action,
  });
}
