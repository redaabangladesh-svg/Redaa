import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { initSslPayment, isSslConfigured } from '@/lib/payment';

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  if (!isSslConfigured()) {
    return NextResponse.json({ error: 'Online payment is not configured yet' }, { status: 503 });
  }

  const { orderId } = await request.json();
  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from('orders')
    .select('order_number, total, customer_name, phone, address')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const result = await initSslPayment({
    orderNumber: order.order_number,
    amount: order.total,
    customerName: order.customer_name,
    customerPhone: order.phone,
    customerAddress: order.address,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ redirectUrl: result.redirectUrl });
}
