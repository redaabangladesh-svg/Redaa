import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSessionClient } from '@/lib/supabase-server';
import { createSteadfastOrder } from '@/lib/courier';

// Service-role client: bypasses RLS for this trusted server-side admin action
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  // Verify the caller is a logged-in, allowlisted admin before touching couriers/money
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

  const result = await createSteadfastOrder({
    invoice: order.order_number,
    recipient_name: order.customer_name,
    recipient_phone: order.phone,
    recipient_address: `${order.address}, ${order.area ? order.area + ', ' : ''}${order.district}`,
    cod_amount: order.payment_method === 'cod' ? order.total : 0,
    note: order.notes || '',
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      courier: 'steadfast',
      tracking_number: result.trackingCode,
      order_status: 'shipped',
    })
    .eq('id', orderId);

  if (updateError) {
    return NextResponse.json({ error: 'Order updated at Steadfast but failed to save locally' }, { status: 500 });
  }

  return NextResponse.json({ trackingCode: result.trackingCode });
}
