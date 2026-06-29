import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Inter, Hind_Siliguri, Playfair_Display } from 'next/font/google';
import { CartProvider } from '@/lib/cart';
import '../globals.css';

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
  console.log("ROOT LAYOUT LOCALE PARAM:", locale);
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${hindSiliguri.variable} ${playfair.variable}`}>
      <body className={`${locale === 'bn' ? 'font-bangla' : 'font-sans'} antialiased text-brand-text bg-brand-bg min-h-screen flex flex-col`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            {children}
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
export function generateStaticParams() {
  return [{ locale: 'bn' }];
}
