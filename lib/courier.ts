export interface SteadfastOrderInput {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
}

export interface SteadfastOrderResult {
  success: boolean;
  trackingCode?: string;
  error?: string;
}

export async function createSteadfastOrder(order: SteadfastOrderInput): Promise<SteadfastOrderResult> {
  try {
    const response = await fetch('https://portal.steadfast.com.bd/api/v1/create_order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.STEADFAST_API_KEY!,
        'Secret-Key': process.env.STEADFAST_SECRET_KEY!,
      },
      body: JSON.stringify({
        invoice: order.invoice,
        recipient_name: order.recipient_name,
        recipient_phone: order.recipient_phone,
        recipient_address: order.recipient_address,
        cod_amount: order.cod_amount,
        note: order.note || '',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data?.consignment?.tracking_code) {
      return { success: false, error: data?.message || 'Steadfast order creation failed' };
    }

    return { success: true, trackingCode: data.consignment.tracking_code };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
