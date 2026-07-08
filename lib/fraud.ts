import { createClient } from '@supabase/supabase-js';

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface FraudInput {
  phone: string;
  address: string;
  paymentMethod: string;
  total: number;
}

export interface FraudResult {
  score: number;
  flags: string[];
  action: 'auto_confirm' | 'review' | 'hold';
}

const VALID_PHONE = /^(017|018|019|016|015|013|014)\d{8}$/;

export async function checkFraud(order: FraudInput): Promise<FraudResult> {
  const supabase = createServiceClient();
  let score = 0;
  const flags: string[] = [];

  const cleanPhone = order.phone.replace(/\D/g, '');

  // Rule 1: phone blacklisted
  const { data: blocked } = await supabase
    .from('blocked_phones')
    .select('phone')
    .eq('phone', cleanPhone)
    .maybeSingle();
  if (blocked) {
    score += 60;
    flags.push('phone_blacklisted');
  }

  // Rule 2: same phone, multiple orders today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count: todayOrders } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('phone', cleanPhone)
    .gte('created_at', startOfDay.toISOString());

  if ((todayOrders ?? 0) >= 3) {
    score += 30;
    flags.push('multiple_orders_today');
  } else if ((todayOrders ?? 0) >= 2) {
    score += 15;
    flags.push('duplicate_order_today');
  }

  // Rule 3: incomplete address
  if (order.address.trim().length < 15) {
    score += 20;
    flags.push('incomplete_address');
  }

  // Rule 4: high value COD
  if (order.paymentMethod === 'cod' && order.total > 2000) {
    score += 15;
    flags.push('high_value_cod');
  }

  // Rule 5: same address, different phone, same day
  const { data: sameAddress } = await supabase
    .from('orders')
    .select('id')
    .eq('address', order.address)
    .neq('phone', cleanPhone)
    .gte('created_at', startOfDay.toISOString())
    .limit(1)
    .maybeSingle();
  if (sameAddress) {
    score += 20;
    flags.push('address_reuse');
  }

  // Rule 6: invalid phone format
  if (!VALID_PHONE.test(cleanPhone)) {
    score += 25;
    flags.push('invalid_phone_format');
  }

  let action: FraudResult['action'];
  if (score <= 30) action = 'auto_confirm';
  else if (score <= 60) action = 'review';
  else action = 'hold';

  return { score, flags, action };
}
