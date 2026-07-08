import { createClient } from '@supabase/supabase-js';

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const SMS_TEMPLATES = {
  ORDER_CONFIRMED: (name: string, orderNo: string) =>
    `প্রিয় ${name}, আপনার অর্ডার ${orderNo} নিশ্চিত হয়েছে ✅ শীঘ্রই ডেলিভারি দেওয়া হবে। ধন্যবাদ।`,

  ORDER_SHIPPED: (name: string, courier: string, tracking: string) =>
    `প্রিয় ${name}, আপনার পণ্য ${courier}-এ পাঠানো হয়েছে 🚚 ট্র্যাকিং: ${tracking}`,

  ORDER_DELIVERED: (name: string) =>
    `প্রিয় ${name}, আপনার পণ্য ডেলিভারি হয়েছে ✅ আমাদের সেবা কেমন লাগলো জানাবেন। ধন্যবাদ 🌸`,

  ORDER_CANCELLED: (name: string, orderNo: string) =>
    `প্রিয় ${name}, আপনার অর্ডার ${orderNo} বাতিল হয়েছে। যোগাযোগ: ${process.env.NEXT_PUBLIC_STORE_PHONE || ''}`,
};

export async function sendSMS(phone: string, message: string, orderId?: string): Promise<boolean> {
  const supabase = createServiceClient();
  const cleanPhone = phone.replace(/\D/g, '');

  if (!process.env.MUTHOFON_API_KEY) {
    await supabase.from('sms_log').insert({
      phone: cleanPhone,
      message,
      status: 'failed',
      order_id: orderId || null,
    });
    return false;
  }

  let sent = false;
  try {
    const response = await fetch('https://api.muthofon.com/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.MUTHOFON_API_KEY,
        sender_id: process.env.SMS_SENDER_ID,
        to: `88${cleanPhone}`,
        message,
      }),
    });
    sent = response.ok;
  } catch {
    sent = false;
  }

  await supabase.from('sms_log').insert({
    phone: cleanPhone,
    message,
    status: sent ? 'sent' : 'failed',
    order_id: orderId || null,
  });

  if (orderId && sent) {
    await supabase.from('orders').update({ sms_sent: true }).eq('id', orderId);
  }

  return sent;
}
