import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateSslPayment } from '@/lib/payment';

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// SSLCommerz redirects the customer's browser here via POST after payment.
// This is UX only (get them to the right confirmation page) — the IPN route
// is the source of truth for actually marking an order paid.
export async function POST(request: Request) {
  const form = await request.formData();
  const valId = form.get('val_id')?.toString();
  const tranId = form.get('tran_id')?.toString();

  if (!valId || !tranId) {
    return NextResponse.redirect(`${baseUrl}/checkout?status=failed`, 303);
  }

  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('order_number', tranId)
    .maybeSingle();

  if (!order) {
    return NextResponse.redirect(`${baseUrl}/checkout?status=failed`, 303);
  }

  const validation = await validateSslPayment(valId);
  if (validation.valid) {
    await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', order.id);
  }

  return NextResponse.redirect(`${baseUrl}/order/${order.id}`, 303);
}
