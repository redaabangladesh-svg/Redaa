import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Inter, Hind_Siliguri, Playfair_Display } from 'next/font/google';
import { CartProvider } from '@/lib/cart';
import { WishlistProvider } from '@/lib/wishlist';
import '../globals.css';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Sicily';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Sets a base for resolving any relative image path (e.g. og:image, favicon)
// into an absolute URL — without this, Next.js can't turn "/Sicily_icon.png"
// into a URL that Facebook/WhatsApp/Twitter crawlers can actually fetch, so
// link previews silently show no image. Pages that define their own
// `openGraph`/`twitter` metadata (products, blog, etc.) override this; every
// other page (home, cart, checkout, account...) falls back to it.
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${STORE_NAME} — প্রিমিয়াম হোম ডেকোর`,
    template: `%s | ${STORE_NAME}`,
  },
  description: 'বাংলাদেশের সেরা প্রিমিয়াম হোম ডেকোর স্টোর। হাতে তৈরি ফ্লাওয়ার, ওয়াল আর্ট ও মেটাল হ্যাঙ্গার — সারাদেশে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।',
  openGraph: {
    title: `${STORE_NAME} — প্রিমিয়াম হোম ডেকোর`,
    description: 'বাংলাদেশের সেরা প্রিমিয়াম হোম ডেকোর স্টোর। হাতে তৈরি, মনে রাখার মতো।',
    url: BASE_URL,
    siteName: STORE_NAME,
    images: [{ url: '/Sicily_icon.png', width: 512, height: 512 }],
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${STORE_NAME} — প্রিমিয়াম হোম ডেকোর`,
    description: 'বাংলাদেশের সেরা প্রিমিয়াম হোম ডেকোর স্টোর।',
    images: ['/Sicily_icon.png'],
  },
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  variable: '--font-bangla',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${hindSiliguri.variable} ${playfair.variable}`}>
      <body className={`${locale === 'bn' ? 'font-bangla' : 'font-sans'} antialiased text-brand-text bg-brand-bg min-h-screen flex flex-col`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
export function generateStaticParams() {
  return [{ locale: 'bn' }];
}
