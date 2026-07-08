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

export interface PathaoOrderInput {
  merchantOrderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  note?: string;
}

export interface PathaoOrderResult {
  success: boolean;
  trackingCode?: string;
  error?: string;
}

async function getPathaoToken(): Promise<string | null> {
  try {
    const response = await fetch('https://api-hermes.pathao.com/aladdin/api/v1/issue-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.PATHAO_CLIENT_ID,
        client_secret: process.env.PATHAO_CLIENT_SECRET,
        username: process.env.PATHAO_USERNAME,
        password: process.env.PATHAO_PASSWORD,
        grant_type: 'password',
      }),
    });
    const data = await response.json();
    return data.access_token || null;
  } catch {
    return null;
  }
}

export async function createPathaoOrder(order: PathaoOrderInput): Promise<PathaoOrderResult> {
  const token = await getPathaoToken();
  if (!token) {
    return { success: false, error: 'Could not authenticate with Pathao' };
  }

  try {
    const response = await fetch('https://api-hermes.pathao.com/aladdin/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        store_id: process.env.PATHAO_STORE_ID,
        merchant_order_id: order.merchantOrderId,
        recipient_name: order.recipientName,
        recipient_phone: order.recipientPhone,
        recipient_address: order.recipientAddress,
        delivery_type: 48,
        item_type: 2,
        item_quantity: 1,
        item_weight: 0.5,
        amount_to_collect: order.codAmount,
        item_description: order.note || 'Home Decor',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data?.data?.consignment_id) {
      return { success: false, error: data?.message || 'Pathao order creation failed' };
    }

    return { success: true, trackingCode: data.data.consignment_id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export interface RedexOrderInput {
  clientOrderId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  codAmount: number;
}

export interface RedexOrderResult {
  success: boolean;
  trackingCode?: string;
  error?: string;
}

export async function createRedexOrder(order: RedexOrderInput): Promise<RedexOrderResult> {
  try {
    const response = await fetch('https://redex.com.bd/api/parcel/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-token': process.env.REDEX_API_TOKEN!,
      },
      body: JSON.stringify({
        client_order_id: order.clientOrderId,
        customer_name: order.customerName,
        customer_mobile: order.customerMobile,
        customer_address: order.customerAddress,
        cod_amount: order.codAmount,
        parcel_weight: '0.5 kg',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data?.tracking_id) {
      return { success: false, error: data?.message || 'Redex order creation failed' };
    }

    return { success: true, trackingCode: data.tracking_id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
