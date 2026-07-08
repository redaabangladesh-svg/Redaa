import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSessionClient } from '@/lib/supabase-server';
import { sendSMS, SMS_TEMPLATES } from '@/lib/sms';

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('product_name, qty, price')
    .eq('order_id', order.id);

  return NextResponse.json({ order, items: items || [] });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const sessionClient = await createSessionClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!user?.email || !adminEmails.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { orderStatus } = await request.json();
  const validStatuses = ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
  if (!validStatuses.includes(orderStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: order, error } = await supabase
    .from('orders')
    .update({ order_status: orderStatus })
    .eq('id', params.id)
    .select()
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }

  try {
    if (orderStatus === 'shipped' && order.tracking_number) {
      await sendSMS(order.phone, SMS_TEMPLATES.ORDER_SHIPPED(order.customer_name, order.courier || 'Courier', order.tracking_number), order.id);
    } else if (orderStatus === 'delivered') {
      await sendSMS(order.phone, SMS_TEMPLATES.ORDER_DELIVERED(order.customer_name), order.id);
    } else if (orderStatus === 'cancelled') {
      await sendSMS(order.phone, SMS_TEMPLATES.ORDER_CANCELLED(order.customer_name, order.order_number), order.id);
    }
  } catch {
    // SMS failures never block a status update
  }

  return NextResponse.json({ order });
}
