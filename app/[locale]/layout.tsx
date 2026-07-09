import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Inter, Hind_Siliguri, Playfair_Display } from 'next/font/google';
import { CartProvider } from '@/lib/cart';
import { WishlistProvider } from '@/lib/wishlist';
import '../globals.css';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Redaa';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.redaarabia.com/';

// Sets a base for resolving any relative image path (e.g. og:image, favicon)
// into an absolute URL — without this, Next.js can't turn "/logo.svg"
// into a URL that Facebook/WhatsApp/Twitter crawlers can actually fetch, so
// link previews silently show no image. Pages that define their own
// `openGraph`/`twitter` metadata (products, blog, etc.) override this; every
// other page (home, cart, checkout, account...) falls back to it.
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${STORE_NAME} — প্রিমিয়াম পাঞ্জাবি, টুপি, ওড়না ও রুমাল কালেকশন`,
    template: `%s | ${STORE_NAME}`,
  },
  description: 'বাংলাদেশের সেরা প্রিমিয়াম পোশাক ও লাইফস্টাইল ব্র্যান্ড। প্রিমিয়াম পাঞ্জাবি, টুপি, ওড়না ও রুমাল — সারাদেশে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।',
  openGraph: {
    title: `${STORE_NAME} — প্রিমিয়াম পাঞ্জাবি, টুপি, ওড়না ও রুমাল কালেকশন`,
    description: 'বাংলাদেশের সেরা প্রিমিয়াম পোশাক ও লাইফস্টাইল ব্র্যান্ড। গুণগত মান ও আধুনিক ডিজাইন।',
    url: BASE_URL,
    siteName: STORE_NAME,
    images: [{ url: '/logo.svg', width: 512, height: 512 }],
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${STORE_NAME} — প্রিমিয়াম পাঞ্জাবি, টুপি, ওড়না ও রুমাল কালেকশন`,
    description: 'বাংলাদেশের সেরা প্রিমিয়াম পোশাক ও লাইফস্টাইল ব্র্যান্ড।',
    images: ['/logo.svg'],
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
