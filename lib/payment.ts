export interface SslInitInput {
  orderNumber: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}

export interface SslInitResult {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

const isLive = process.env.SSL_IS_LIVE === 'true';
const SSL_API_BASE = isLive
  ? 'https://securepay.sslcommerz.com'
  : 'https://sandbox.sslcommerz.com';

export function isSslConfigured(): boolean {
  return Boolean(process.env.SSL_STORE_ID && process.env.SSL_STORE_PASSWORD);
}

export async function initSslPayment(input: SslInitInput): Promise<SslInitResult> {
  if (!isSslConfigured()) {
    return { success: false, error: 'SSLCommerz is not configured' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const payload = new URLSearchParams({
    store_id: process.env.SSL_STORE_ID!,
    store_passwd: process.env.SSL_STORE_PASSWORD!,
    total_amount: String(input.amount),
    currency: 'BDT',
    tran_id: input.orderNumber,
    success_url: `${baseUrl}/api/payment/sslcommerz/success`,
    fail_url: `${baseUrl}/checkout?status=failed`,
    cancel_url: `${baseUrl}/checkout?status=cancelled`,
    ipn_url: `${baseUrl}/api/payment/sslcommerz/ipn`,
    cus_name: input.customerName,
    cus_phone: input.customerPhone,
    cus_add1: input.customerAddress,
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    shipping_method: 'NO',
    product_name: 'Home Decor',
    product_category: 'General',
    product_profile: 'general',
  });

  try {
    const response = await fetch(`${SSL_API_BASE}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString(),
    });

    const data = await response.json();

    if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
      return { success: false, error: data.failedreason || 'Failed to initiate SSLCommerz session' };
    }

    return { success: true, redirectUrl: data.GatewayPageURL };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function validateSslPayment(valId: string): Promise<{ valid: boolean; tranId?: string; amount?: number }> {
  if (!isSslConfigured()) return { valid: false };

  const params = new URLSearchParams({
    val_id: valId,
    store_id: process.env.SSL_STORE_ID!,
    store_passwd: process.env.SSL_STORE_PASSWORD!,
    format: 'json',
  });

  try {
    const response = await fetch(`${SSL_API_BASE}/validator/api/validationserverAPI.php?${params.toString()}`);
    const data = await response.json();

    const isValid = data.status === 'VALID' || data.status === 'VALIDATED';
    return { valid: isValid, tranId: data.tran_id, amount: data.amount ? Number(data.amount) : undefined };
  } catch {
    return { valid: false };
  }
}
