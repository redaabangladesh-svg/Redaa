import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateSslPayment } from '@/lib/payment';

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const form = await request.formData();
  const valId = form.get('val_id')?.toString();
  const tranId = form.get('tran_id')?.toString();

  if (!valId || !tranId) {
    return NextResponse.json({ error: 'Missing val_id or tran_id' }, { status: 400 });
  }

  // Never trust the webhook body directly — re-validate with SSLCommerz's own API
  const validation = await validateSslPayment(valId);
  if (!validation.valid || validation.tranId !== tranId) {
    return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from('orders')
    .select('id, total')
    .eq('order_number', tranId)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (validation.amount !== undefined && Math.abs(validation.amount - order.total) > 1) {
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
  }

  await supabase
    .from('orders')
    .update({ payment_status: 'paid' })
    .eq('id', order.id);

  return NextResponse.json({ success: true });
}
