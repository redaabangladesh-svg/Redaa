# CLAUDE.md — BD Home Decor E-Commerce (Full System)

## 🎯 Project Overview

Bangladesh-based home decor client (flowers, hangers, etc.) এর জন্য একটি complete custom e-commerce system। তিনটি অংশ একসাথে build করতে হবে:

1. **Public Website** — customer-facing store
2. **Admin Dashboard** — client management panel
3. **Dynamic Landing Pages** — `/p/[slug]` per product

---

## 🏗️ Tech Stack

| Layer | Technology | কারণ |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, ISR, SEO, speed |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Fast, responsive |
| Database | Supabase (PostgreSQL) | Free, realtime, auth |
| Storage | Cloudflare R2 | Product images (10GB free, free egress) |
| Deploy | Vercel | Next.js optimized, free |
| Payment | SSLCommerz + AmarPay + COD | BD standard |
| Courier | Pathao + Steadfast + Redex | BD courier APIs |
| SMS | Muthofon / SSL Wireless | BD local, ০.৩০ TK/SMS |
| WhatsApp | Manual one-click (wa.me) | Client sends personally |
| i18n / l10n | next-intl / custom middleware | Multi-language (Bangla + English) support |

---

## 📁 Folder Structure

```
/app
  /[locale]
    /(store)
      /page.tsx                      → Homepage
      /shop/page.tsx                 → All products
      /shop/[category]/page.tsx      → Category filtered
      /p/[slug]/page.tsx             → Product landing page (ISR)
      /cart/page.tsx                 → Cart
      /checkout/page.tsx             → Checkout
      /order/[id]/page.tsx           → Order confirmation
      /account/page.tsx              → Customer account
      /search/page.tsx               → Search results

    /(admin)
      /admin/page.tsx                → Overview/dashboard
      /admin/orders/page.tsx         → Order list
      /admin/orders/[id]/page.tsx    → Order detail
      /admin/orders/new/page.tsx     → Manual order entry
      /admin/products/page.tsx       → Product list
      /admin/products/new/page.tsx   → Add product
      /admin/products/[id]/page.tsx  → Edit product
      /admin/customers/page.tsx      → Customer list
      /admin/reports/page.tsx        → Analytics & reports
      /admin/offers/page.tsx         → Coupons & discounts
      /admin/settings/page.tsx       → Store settings

  /api
    /orders/route.ts               → Create order
    /orders/[id]/route.ts          → Update order
    /payment/
      /sslcommerz/route.ts         → SSLCommerz init
      /sslcommerz/ipn/route.ts     → SSLCommerz webhook
      /amarpay/route.ts            → AmarPay init
      /amarpay/callback/route.ts   → AmarPay callback
    /courier/
      /pathao/route.ts             → Pathao API
      /steadfast/route.ts          → Steadfast API
      /redex/route.ts              → Redex API
    /sms/route.ts                  → SMS send
    /fraud/route.ts                → Fraud score check
    /sitemap/route.ts              → Dynamic sitemap

/components
  /store/
    /Navbar.tsx                    → Includes Language Switcher (EN/BN)
    /FooterNav.tsx                 → Mobile bottom nav
    /ProductCard.tsx
    /ProductGallery.tsx
    /CartDrawer.tsx
    /CheckoutForm.tsx
    /ReviewSection.tsx
  /admin/
    /Sidebar.tsx
    /OrderTable.tsx
    /ProductForm.tsx
    /StatsCard.tsx
    /FraudBadge.tsx
  /widgets/
    /AnnouncementBar.tsx           → Top sticky bar
    /CountdownTimer.tsx            → Flash sale timer
    /StockBadge.tsx                → "মাত্র ৩টি বাকি"
    /ViewerCount.tsx               → "১২ জন দেখছে"
    /WhatsAppButton.tsx            → Floating button
    /ExitIntentPopup.tsx           → Exit popup
    /TrustBadges.tsx               → Security badges
    /InstagramFeed.tsx             → Customer photos
    /SeasonalBanner.tsx            → Eid/Valentine banner
  /ui/
    /Button.tsx
    /Input.tsx
    /Modal.tsx
    /Badge.tsx
    /Skeleton.tsx

/lib
  /supabase.ts                     → Supabase client
  /supabase-server.ts              → Server-side client
  /fraud.ts                        → Fraud detection logic
  /sms.ts                          → SMS helper
  /courier.ts                      → Courier helper functions
  /payment.ts                      → Payment helpers
  /whatsapp.ts                     → WhatsApp message templates
  /seo.ts                          → SEO metadata helpers

/types
  /index.ts                        → All TypeScript types
```

---

## 🗄️ Supabase Database Schema

```sql
-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price NUMERIC NOT NULL,
  sale_price NUMERIC,
  stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  description_en TEXT,
  description_bn TEXT,
  short_description_en TEXT,
  short_description_bn TEXT,
  category_id UUID REFERENCES categories(id),
  variants JSONB DEFAULT '[]',       -- [{color, size, stock, price}]
  landing_page_active BOOLEAN DEFAULT false,
  landing_content JSONB DEFAULT '{}', -- custom video, reviews, badges
  seo_title_en TEXT,
  seo_title_bn TEXT,
  seo_description_en TEXT,
  seo_description_bn TEXT,
  is_featured BOOLEAN DEFAULT false,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  address TEXT,
  district TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  tags TEXT[] DEFAULT '{}',          -- repeat, vip, fraud
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- ORD-2025-0001
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  area TEXT,
  subtotal NUMERIC NOT NULL,
  delivery_charge NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,      -- cod, sslcommerz, amarpay
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
  order_status TEXT DEFAULT 'new',   -- new, confirmed, processing, shipped, delivered, cancelled, returned
  courier TEXT,                      -- pathao, steadfast, redex, other
  tracking_number TEXT,
  source TEXT DEFAULT 'website',     -- website, facebook, instagram, phone
  fraud_score INTEGER DEFAULT 0,
  fraud_flags TEXT[] DEFAULT '{}',
  coupon_code TEXT,
  notes TEXT,
  sms_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  variant JSONB,
  qty INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

-- Coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,               -- percentage, fixed, free_delivery
  value NUMERIC NOT NULL,
  min_order NUMERIC DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS Log
CREATE TABLE sms_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',    -- sent, failed
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store Settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocked Phones (Fraud)
CREATE TABLE blocked_phones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  image TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🌐 Public Website Pages

### Homepage (`/`)
```
1. Announcement Bar        → "🚚 ঢাকায় ফ্রি ডেলিভারি ৳৫০০+ অর্ডারে"
2. Hero Section            → Full-width lifestyle image + CTA
3. Featured Categories     → Flowers / Hangers / Sets / New Arrivals
4. Best Sellers            → Top 8 products
5. Flash Sale Section      → Countdown timer + discounted products
6. Why Choose Us           → 4 trust points
7. Customer Photos         → Instagram-style UGC grid
8. Testimonials            → Real reviews with star rating
9. Seasonal Banner         → Eid/Valentine (admin toggle)
10. Footer                 → Links, policy, social
```

### Product Landing Page (`/p/[slug]`)
```
1. Hero Image Gallery      → Main image + thumbnails
2. Product Title + Price   → Sale price যদি থাকে
3. Stock Badge             → "মাত্র ৫টি বাকি 🔥"
4. Viewer Count            → "১২ জন এখন দেখছে"
5. Variant Selector        → Color/size swatches
6. Quantity Selector
7. Order Form              → Name, Phone, Address, Payment
8. Delivery Info           → ঢাকা ১-২ দিন, বাইরে ৩-৫ দিন
9. Product Benefits        → ৩-৫টা bullet
10. Customer Reviews       → With photos
11. Return Policy          → Disclaimer
12. Related Products
13. Sticky Mobile CTA      → "এখনই অর্ডার করুন" always visible
```

### Footer Bottom Nav (Mobile)
```
🏠 Home | 🔍 Search | 🛒 Cart | ❤️ Wishlist | 👤 Account
```

---

## 🖥️ Admin Dashboard Pages

### Overview (`/admin`)
```
Stats Row:
- আজকের Revenue
- নতুন Orders (আজকে)
- Pending Orders
- Low Stock Products (alert)

Charts:
- Weekly Sales (Bar chart)
- Payment Method breakdown (Pie: COD vs Online)

Tables:
- সাম্প্রতিক ৫টা Order
- Top 5 Products (এই সপ্তাহে)
- Low Stock Alert list
```

### Orders (`/admin/orders`)
```
Filter: All | New | Confirmed | Shipped | Delivered | Cancelled
Search: phone number / order number / নাম

Order Row:
[Order#] [নাম] [Phone] [Product] [Total] [Payment] [Status] [Actions]

Actions:
- Status update dropdown
- Courier assign + tracking number
- WhatsApp one-click button → wa.me/88017XXXXXXXX?text=...
- Print invoice
- View detail

Bulk Actions:
- Selected orders → Confirm করো
- Selected orders → Mark shipped
- Export to Excel
```

### Manual Order Entry (`/admin/orders/new`)
```
Source: [ Website | Facebook | Instagram | Phone ]
Customer: নাম, ফোন, ঠিকানা
Products: Search + add items
Payment: COD / Paid
Notes: (optional)
→ Fraud check auto run হবে
→ SMS auto পাঠাবে
```

### Products (`/admin/products`)
```
Product Form Fields:
- নাম (English & Bangla), slug (auto-generate from English name)
- Price, Sale Price
- Stock quantity
- Images (multiple upload → Cloudflare R2)
- Category
- Short description (English & Bangla)
- Full description (English & Bangla)
- Variants (color/size JSON editor)
- Landing Page: ON/OFF toggle
- SEO Title & SEO Description (English & Bangla)
- Low stock threshold
- Featured: ON/OFF
- Landing Content (custom video URL, special reviews)
```

### Customers (`/admin/customers`)
```
Customer Card:
- নাম, ফোন
- মোট orders, মোট spend
- Tags: 🔄 Repeat | ⭐ VIP | ⚠️ Flagged
- Order history list
- Block করো (reason দাও)
```

### Reports (`/admin/reports`)
```
Date Range: Today | This Week | This Month | Custom

Metrics:
- Total Revenue
- Total Orders
- Average Order Value
- COD vs Online breakdown
- Top Products
- Top Districts (ঢাকা vs বাইরে)
- Conversion rate
- Return/Cancel rate
- Seasonal trend chart

Export: Excel download button
```

### Offers (`/admin/offers`)
```
Coupon Creator:
- Code (e.g. EID2025)
- Type: Percentage / Fixed / Free Delivery
- Value
- Min order amount
- Max uses
- Expiry date
- Active/Inactive toggle

Active Offers list with usage stats
```

### Settings (`/admin/settings`)
```
Store Info:
- Store name, logo, phone, email, address

Delivery Charges:
- ঢাকা ভেতরে: ৳__ 
- ঢাকা বাইরে: ৳__
- Free delivery above: ৳__

Payment API Keys:
- SSLCommerz Store ID + Password
- AmarPay Username + Key

Courier API Keys:
- Pathao Client ID + Secret
- Steadfast API Key + Secret
- Redex API Key

SMS API:
- Muthofon API Key
- Sender ID

Announcement Bar:
- Text (English & Bangla) + Active toggle

Seasonal Banner:
- Select: Eid / Valentine / New Year / Custom
- Active toggle

Notification:
- New order SMS to owner: ON/OFF
- Low stock alert email: ON/OFF
```

---

## 💳 Payment Integration

### SSLCommerz Flow
```typescript
// 1. Customer submits order
// 2. POST /api/payment/sslcommerz
const sslData = {
  store_id: process.env.SSL_STORE_ID,
  store_passwd: process.env.SSL_STORE_PASSWORD,
  total_amount: order.total,
  currency: 'BDT',
  tran_id: order.order_number,
  success_url: `${BASE_URL}/order/${order.id}?status=success`,
  fail_url: `${BASE_URL}/checkout?status=failed`,
  cancel_url: `${BASE_URL}/checkout?status=cancelled`,
  ipn_url: `${BASE_URL}/api/payment/sslcommerz/ipn`,
  cus_name: order.customer_name,
  cus_phone: order.phone,
  cus_add1: order.address,
  shipping_method: 'NO',
  product_name: 'Home Decor',
  product_category: 'General',
  product_profile: 'general',
}
// 3. Redirect to SSLCommerz payment page
// 4. IPN webhook → verify → update order payment_status = 'paid'
```

### AmarPay Flow
```typescript
// POST /api/payment/amarpay
const amarData = {
  store_id: process.env.AMARPAY_STORE_ID,
  signature_key: process.env.AMARPAY_SIGNATURE_KEY,
  cus_name: order.customer_name,
  cus_phone: order.phone,
  cus_add1: order.address,
  amount: order.total,
  currency: 'BDT',
  tran_id: order.order_number,
  success_url: `${BASE_URL}/order/${order.id}?status=success`,
  fail_url: `${BASE_URL}/checkout?status=failed`,
  cancel_url: `${BASE_URL}/checkout?status=cancelled`,
}
```

### COD Flow
```
Order Submit
    ↓
Fraud Check (auto)
    ↓
Score 0-30:  Auto confirm → SMS পাঠাও
Score 31-60: Dashboard flag → client review
Score 61+:   Auto hold → client alert
```

---

## 🚚 Courier API Integration

### Pathao
```typescript
// Base URL: https://merchant.pathao.com/aladdin/api/v1

// 1. Get Auth Token
POST /issue-token
{ client_id, client_secret, username, password, grant_type: 'password' }

// 2. Create Parcel
POST /orders/bulk
{
  store_id: PATHAO_STORE_ID,
  merchant_order_id: order.order_number,
  recipient_name: order.customer_name,
  recipient_phone: order.phone,
  recipient_address: order.address,
  recipient_city: 1,          // Dhaka = 1
  recipient_zone: zone_id,
  delivery_type: 48,          // 48hr
  item_type: 2,               // parcel
  item_quantity: 1,
  item_weight: 0.5,
  amount_to_collect: order.total,  // COD amount
  item_description: 'Home Decor'
}
// Response → consignment_id → save as tracking_number
```

### Steadfast
```typescript
// Base URL: https://portal.steadfast.com.bd/api/v1

POST /create_order
Headers: {
  'Api-Key': process.env.STEADFAST_API_KEY,
  'Secret-Key': process.env.STEADFAST_SECRET_KEY,
}
Body: {
  invoice: order.order_number,
  recipient_name: order.customer_name,
  recipient_phone: order.phone,
  recipient_address: order.address,
  cod_amount: order.total,
  note: order.notes
}
// Response → tracking_code → save as tracking_number
```

### Redex
```typescript
// Base URL: https://redex.com.bd/api

POST /parcel/add
Headers: { 'api-token': process.env.REDEX_API_TOKEN }
Body: {
  client_order_id: order.order_number,
  customer_name: order.customer_name,
  customer_mobile: order.phone,
  customer_address: order.address,
  cod_amount: order.total,
  parcel_weight: '0.5 kg',
}
```

---

## 🔍 Fraud Detection System

```typescript
// /lib/fraud.ts

interface FraudResult {
  score: number        // 0-100
  flags: string[]
  action: 'auto_confirm' | 'review' | 'hold'
}

async function checkFraud(order: OrderInput): Promise<FraudResult> {
  let score = 0
  const flags: string[] = []

  // Rule 1: Phone blocked list
  const isBlocked = await checkBlockedPhone(order.phone)
  if (isBlocked) {
    score += 60
    flags.push('phone_blacklisted')
  }

  // Rule 2: Same phone — multiple orders today
  const todayOrders = await countOrdersToday(order.phone)
  if (todayOrders >= 3) {
    score += 30
    flags.push('multiple_orders_today')
  } else if (todayOrders >= 2) {
    score += 15
    flags.push('duplicate_order_today')
  }

  // Rule 3: Address too short/incomplete
  if (order.address.length < 15) {
    score += 20
    flags.push('incomplete_address')
  }

  // Rule 4: High amount COD (৳২০০০+)
  if (order.payment_method === 'cod' && order.total > 2000) {
    score += 15
    flags.push('high_value_cod')
  }

  // Rule 5: Same address different phone (same day)
  const sameAddressOrder = await checkSameAddress(order.address)
  if (sameAddressOrder) {
    score += 20
    flags.push('address_reuse')
  }

  // Rule 6: Phone number format invalid
  const validPhone = /^(017|018|019|016|015|013|014)\d{8}$/.test(order.phone)
  if (!validPhone) {
    score += 25
    flags.push('invalid_phone_format')
  }

  // Determine action
  let action: FraudResult['action']
  if (score <= 30) action = 'auto_confirm'
  else if (score <= 60) action = 'review'
  else action = 'hold'

  return { score, flags, action }
}
```

### Dashboard Fraud Display
```
Order #ORD-2025-0045
নাম: Karim Ahmed | ফোন: 017XXXXXXXX
Fraud Score: 45/100 ⚠️
Flags: multiple_orders_today, high_value_cod
→ [✅ Confirm] [❌ Cancel] [🚫 Block Phone]
```

---

## 📱 SMS Templates (Muthofon)

```typescript
// /lib/sms.ts

const SMS_TEMPLATES = {
  ORDER_CONFIRMED: (name: string, orderNo: string) =>
    `প্রিয় ${name}, আপনার অর্ডার ${orderNo} নিশ্চিত হয়েছে ✅ শীঘ্রই ডেলিভারি দেওয়া হবে। ধন্যবাদ।`,

  ORDER_SHIPPED: (name: string, courier: string, tracking: string) =>
    `প্রিয় ${name}, আপনার পণ্য ${courier}-এ পাঠানো হয়েছে 🚚 ট্র্যাকিং: ${tracking}`,

  ORDER_DELIVERED: (name: string) =>
    `প্রিয় ${name}, আপনার পণ্য ডেলিভারি হয়েছে ✅ আমাদের সেবা কেমন লাগলো জানাবেন। ধন্যবাদ 🌸`,

  ORDER_CANCELLED: (name: string, orderNo: string) =>
    `প্রিয় ${name}, আপনার অর্ডার ${orderNo} বাতিল হয়েছে। যোগাযোগ: 017XXXXXXXX`,
}

async function sendSMS(phone: string, message: string, orderId?: string) {
  const response = await fetch('https://api.muthofon.com/sms/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.MUTHOFON_API_KEY,
      sender_id: process.env.SMS_SENDER_ID,
      to: `88${phone}`,
      message,
    }),
  })
  // Log to sms_log table
  await logSMS(phone, message, response.ok ? 'sent' : 'failed', orderId)
}
```

---

## WhatsApp Templates (One-Click)

```typescript
// /lib/whatsapp.ts
// Dashboard থেকে client manually send করবে

const WA_TEMPLATES = {
  ORDER_CONFIRM: (name: string, product: string, total: number) =>
    `আসসালামুয়ালাইকুম ${name} ভাই/আপা 😊\n\nআপনার *${product}* অর্ডারটি confirm হয়েছে ✅\nমোট: ৳${total}\n\nআমরা শীঘ্রই deliver করবো। ধন্যবাদ 🌸`,

  ORDER_SHIPPED: (name: string, courier: string, tracking: string) =>
    `${name} ভাই/আপা,\n\nআপনার পণ্য *${courier}*-এ পাঠানো হয়েছে 🚚\nTracking: *${tracking}*\n\nধন্যবাদ 🌸`,
}

// Generate WhatsApp URL
function getWhatsAppURL(phone: string, message: string): string {
  return `https://wa.me/88${phone}?text=${encodeURIComponent(message)}`
}
// Dashboard button → window.open(getWhatsAppURL(...))
```

---

## 🔎 SEO + GEO + AIO Strategy

### Traditional SEO (Google)

```typescript
// /lib/seo.ts
export function generateProductMeta(product: Product) {
  return {
    title: `${product.seo_title || product.name} | [Store Name]`,
    description: product.seo_description || product.short_description,
    keywords: `${product.name}, home decor bangladesh, ফুল সাজসজ্জা ঢাকা`,
    openGraph: {
      title: product.name,
      description: product.short_description,
      images: [{ url: product.images[0], width: 800, height: 800 }],
      type: 'product',
      locale: 'bn_BD',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      images: [product.images[0]],
    },
  }
}
```

```typescript
// Product Schema (JSON-LD) — Google Rich Results
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  image: product.images,
  description: product.description,
  offers: {
    '@type': 'Offer',
    price: product.sale_price || product.price,
    priceCurrency: 'BDT',
    availability: product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    seller: { '@type': 'Organization', name: '[Store Name]' },
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: avgRating,
    reviewCount: reviewCount,
  },
}
```

```typescript
// /app/sitemap.ts — Auto-generate sitemap
export default async function sitemap() {
  const products = await getAllProducts()
  return [
    { url: BASE_URL, lastModified: new Date() },
    { url: `${BASE_URL}/shop`, lastModified: new Date() },
    ...products.map(p => ({
      url: `${BASE_URL}/p/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ]
}
```

### GEO (Generative Engine Optimization)
```
লক্ষ্য: ChatGPT / Perplexity / Gemini-এ mention হওয়া

Strategies:
1. About page-এ clear brand story লেখো
   "আমরা ঢাকার একটি হাতে তৈরি হোম ডেকোর ব্র্যান্ড..."

2. FAQ page বানাও (AI এটা love করে)
   Q: ঢাকায় সুন্দর ফুলের সাজসজ্জা কোথায় পাবো?
   Q: হ্যান্ডমেড হোম ডেকোর কোথায় কিনবো?

3. Blog section — helpful content
   "কীভাবে ঘর সাজাবেন ফুল দিয়ে"
   "বিয়ের ঘর সাজানোর ১০টি টিপস"

4. Structured data সব page-এ

5. Google Business Profile create করো
   → AI tools এটা reference করে
```

### AIO (AI Overview Optimization)
```
লক্ষ্য: Google Search-এ AI Overview box-এ cite হওয়া

Strategies:
1. Content clearly structured করো
   → H1, H2, H3 proper use
   → Bullet points, numbered lists

2. Featured Snippet target করো
   → "ফুল হ্যাঙ্গার কী?" এর direct answer দাও page-এ

3. E-E-A-T সিগনাল বাড়াও
   → Author info, business info
   → Customer reviews visible
   → Return policy clear

4. Page speed 90+ রাখো
   → Google AI Overview fast sites prefer করে

5. Mobile-first সব কিছু
   → Google mobile-first indexing
```

---

## ⚡ Speed Optimization

```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],  // Auto convert
    remotePatterns: [{ hostname: '*.supabase.co' }],
  },
  experimental: {
    optimizeCss: true,
  },
}

// Image Component — সব product image এভাবে
<Image
  src={product.images[0]}
  alt={product.name}
  width={800}
  height={800}
  loading="lazy"          // below fold
  priority={isHero}       // hero only = true
  placeholder="blur"
  blurDataURL={blurHash}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Font — Google Font বাদ, local use
const localFont = localFont({
  src: './fonts/hind-siliguri.woff2',  // Bangla font
  display: 'swap',
})

// ISR — Landing pages pre-build
export const revalidate = 3600  // 1 hour cache

// Dynamic import — heavy components
const ExitIntentPopup = dynamic(() => import('./ExitIntentPopup'), {
  ssr: false,
})
```

**Target Scores:**
```
Mobile PageSpeed:   90+
Desktop PageSpeed:  95+
LCP:               < 2.5s
TTFB:              < 200ms (Vercel Edge)
CLS:               < 0.1
FID:               < 100ms
```

---

## 🎨 Design System

### Color Palette (Custom Teal & Pink Theme)
```css
:root {
  --color-bg:        #FFFFFF;  /* Clean white background */
  --color-surface:   #FAFDFD;  /* Soft teal-tinted white surface */
  --color-primary:   #057476;  /* Deep Teal — Primary buttons & headers */
  --color-primary-alt: #008B8B; /* Dark Cyan — Alternate primary elements */
  --color-secondary: #D80064;  /* Deep Pink — Secondary actions/prominent highlights */
  --color-secondary-dark: #A9004B; /* Darker Pink — Accent highlights */
  --color-secondary-light: #FF3385; /* Rose Pink — Interactive badges */
  --color-accent:    #00f0d2;  /* Neon Turquoise — Interactive icons/micro-highlights */
  --color-text:      #111111;  /* Rich black for maximum readability */
  --color-muted:     #4A4A4A;  /* Dark gray for secondary descriptions */
  --color-border:    #E5EEEE;  /* Light teal-tinted borders */
}
```

### Typography
```css
/* Bangla: Hind Siliguri (local) */
/* English: Inter (local) */
/* Heading: 700 weight */
/* Body: 400 weight */
/* Small: 14px minimum */
```

### Mobile-First Breakpoints
```
Default: mobile (320px+)
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

---

## 🏷️ Widgets Implementation

### Announcement Bar
```typescript
// Admin settings থেকে text + active control
// Dismissible with cookie (24hr)
// Color: --color-primary background
```

### Flash Sale Countdown
```typescript
// Admin offers page থেকে end time set করো
// Real-time countdown: HH:MM:SS
// Timer শেষ → sale price automatically remove
```

### Stock Urgency
```typescript
// Auto show when stock <= low_stock_threshold
// "মাত্র {stock}টি বাকি! 🔥"
// Viewer count: random 8-25 (realistic)
```

### Exit Intent Popup
```typescript
// Desktop: mouse moves to top of viewport
// Mobile: back button intent
// Show max 1 time per session
// Offer: 10% coupon code
```

### Seasonal Banner
```typescript
// Admin settings → select season → activate
const SEASONAL_BANNERS = {
  eid:       { text: '🌙 ঈদ স্পেশাল অফার', color: '#2D6A4F' },
  valentine: { text: '❤️ ভালোবাসা দিবস', color: '#C1121F' },
  newyear:   { text: '🎉 নববর্ষ অফার', color: '#FFC300' },
  custom:    { text: '', color: '' },
}
```

---

## 🔐 Security & Auth

```typescript
// Admin routes protect করো
// /app/(admin)/layout.tsx
import { createServerClient } from '@supabase/ssr'

export default async function AdminLayout({ children }) {
  const supabase = createServerClient(...)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')
  return <>{children}</>
}

// API Routes — secret key verify
// Rate limiting — same IP থেকে বারবার order block
// Input sanitization — XSS prevent
// Payment webhook — signature verify করো
// HTTPS — Vercel auto SSL
```

---

## 🌍 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2 (Storage)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
NEXT_PUBLIC_R2_PUBLIC_URL=

# SSLCommerz
SSL_STORE_ID=
SSL_STORE_PASSWORD=
SSL_IS_LIVE=false

# AmarPay
AMARPAY_STORE_ID=
AMARPAY_SIGNATURE_KEY=

# Pathao
PATHAO_CLIENT_ID=
PATHAO_CLIENT_SECRET=
PATHAO_USERNAME=
PATHAO_PASSWORD=
PATHAO_STORE_ID=

# Steadfast
STEADFAST_API_KEY=
STEADFAST_SECRET_KEY=

# Redex
REDEX_API_TOKEN=

# SMS
MUTHOFON_API_KEY=
SMS_SENDER_ID=

# App
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_STORE_NAME=
NEXT_PUBLIC_STORE_PHONE=
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "@supabase/supabase-js": "latest",
    "@supabase/ssr": "latest",
    "@aws-sdk/client-s3": "latest",
    "@aws-sdk/s3-request-presigner": "latest",
    "recharts": "latest",
    "react-hot-toast": "latest",
    "lucide-react": "latest",
    "date-fns": "latest",
    "xlsx": "latest",
    "sharp": "latest"
  }
}
```

---

## 🚀 Build Order (Claude Code এই order-এ build করবে)

```
Phase 1 — Foundation
  1. Next.js 14 project setup + TypeScript + Tailwind
  2. Supabase setup + all tables create
  3. Environment variables setup
  4. Base layout + design system (colors, fonts) + i18n setup (next-intl / middleware)
  5. Supabase auth + admin route protection

Phase 2 — Public Store
  6. Homepage (hero, categories, bestsellers)
  7. Shop page (product grid, filter, search)
  8. Product landing page /p/[slug] with ISR
  9. Cart system (Zustand or Context)
  10. Checkout form + COD flow
  11. Order confirmation page
  12. Footer bottom nav (5 icons)

Phase 3 — Widgets
  13. Announcement bar
  14. Flash sale countdown timer
  15. Stock urgency + viewer count badges
  16. Floating WhatsApp button
  17. Exit intent popup
  18. Trust badges
  19. Seasonal banner

Phase 4 — Payments
  20. SSLCommerz integration + IPN webhook
  21. AmarPay integration + callback
  22. COD flow with fraud check

Phase 5 — Admin Dashboard
  23. Admin overview page (stats + charts)
  24. Orders list + filter + search
  25. Order detail + status update
  26. Manual order entry (Facebook/Instagram)
  27. Products CRUD + image upload
  28. Landing page toggle
  29. Customer list + block feature
  30. Reports page + Excel export

Phase 6 — Integrations
  31. Fraud detection system
  32. SMS integration (Muthofon)
  33. WhatsApp one-click (wa.me URLs)
  34. Pathao courier API
  35. Steadfast courier API
  36. Redex courier API
  37. Coupon/discount system

Phase 7 — SEO + GEO + AIO
  38. Dynamic metadata (title, description, OG)
  39. Product JSON-LD schema
  40. Auto sitemap generation
  41. robots.txt
  42. FAQ page (GEO optimization)
  43. Blog section setup (AIO + GEO)

Phase 8 — Speed + Polish
  44. Image optimization audit
  45. Dynamic imports for heavy components
  46. Loading skeletons
  47. Error boundaries
  48. 404 page
  49. Mobile responsiveness audit
  50. PageSpeed audit + fixes
```

## 🚀 Recent Redesign & Configuration Updates (June 2026)

The project layout has been optimized for the Bangladesh market:
1. **Shopica Layout Redesign**: Split hero area (left categories list with Lucide icons, right auto-sliding banner), circular category icons, bestsellers grid, product inline checkouts, and a clean footer with SSLCommerz logo.
2. **Strictly Bangla Locale**: Switched routing to Bangla (`defaultLocale: 'bn'`) with prefix-free pathing (`localePrefix: 'never'`). Paths load directly from the root (e.g., `/shop`, `/checkout`) instead of prepending `/bn`.
3. **Gmail Sign In**: Developed `/account` page containing user profile state and active orders history using mock Google Log-In simulation.

---

## ✅ Definition of Done

Verify after modifications:

- [ ] Responsive layout fits mobile viewport.
- [ ] Strictly no TypeScript/compiler compilation errors.
- [ ] No console runtime errors.
- [ ] Loading & Error boundaries are correctly configured.
- [ ] Admin route authorization rules are protected.

---

## 📝 Important Notes

1. **Strict Bangla Support** — Storefront is locked to Bangla only. All links render without `/bn` prefix (using prefix-free routing internally mapped to Bangla).
2. **Admin panel** — Content adding pages contain input fields for product details.
3. **Phone format** — `017XXXXXXXX` format (11 digits, no +88).
4. **Currency** — Use the ৳ symbol.
5. **Images** — Served from local `/public` assets (e.g., `bannerphn.jpeg`, `Banner1.png`, `SSLCommerz-Pay-With-logo-All-Size-01.png`, `Redaa_icon.png`).
6. **Order number format** — `ORD-2025-0001` (auto-incrementing in localStorage database).
7. **COD default** — Cash on Delivery as the default payment option.
8. **District list** — Standard dropdown containing all districts of Bangladesh.
9. **Responsive** — Mobile-first, header cart and search elements optimized for clean view.
10. **Color Usage & Typography** — Descriptions use dark/black variables for reading accessibility, theme accents (Matte Black, Red, Gold) are for highlight CTAs and badges only.

