import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');
  const orderNumber = searchParams.get('orderNumber');

  const supabase = createServiceClient();

  if (orderNumber) {
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber.toUpperCase())
      .maybeSingle();
    return NextResponse.json({ order: data || null });
  }

  if (phone) {
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, total, order_status, created_at')
      .eq('phone', phone.replace(/\D/g, ''))
      .order('created_at', { ascending: false });
    return NextResponse.json({ orders: data || [] });
  }

  return NextResponse.json({ error: 'phone or orderNumber required' }, { status: 400 });
}
