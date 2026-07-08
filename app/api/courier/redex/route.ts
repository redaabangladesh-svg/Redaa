import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSessionClient } from '@/lib/supabase-server';
import { createRedexOrder } from '@/lib/courier';

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const sessionClient = await createSessionClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!user?.email || !adminEmails.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { orderId } = await request.json();
  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const result = await createRedexOrder({
    clientOrderId: order.order_number,
    customerName: order.customer_name,
    customerMobile: order.phone,
    customerAddress: `${order.address}, ${order.area ? order.area + ', ' : ''}${order.district}`,
    codAmount: order.payment_method === 'cod' ? order.total : 0,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      courier: 'redex',
      tracking_number: result.trackingCode,
      order_status: 'shipped',
    })
    .eq('id', orderId);

  if (updateError) {
    return NextResponse.json({ error: 'Order updated at Redex but failed to save locally' }, { status: 500 });
  }

  return NextResponse.json({ trackingCode: result.trackingCode });
}
