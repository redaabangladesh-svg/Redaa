import type { Metadata } from 'next';
import { fetchProductsServer } from '@/lib/products-db-server';
import HomePageClient from './HomePageClient';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Sicily';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${STORE_NAME} | প্রিমিয়াম হোম ডেকোর`,
  description: 'বাংলাদেশের সেরা প্রিমিয়াম হোম ডেকোর স্টোর — ফুল, গাছ, ওয়াল স্ট্যান্ড ও আরও অনেক কিছু, সারাদেশে ক্যাশ অন ডেলিভারিতে।',
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: `${STORE_NAME} | প্রিমিয়াম হোম ডেকোর`,
    description: 'বাংলাদেশের সেরা প্রিমিয়াম হোম ডেকোর স্টোর।',
    url: BASE_URL,
    type: 'website',
    locale: 'bn_BD',
  },
};

export default async function HomePage() {
  const products = await fetchProductsServer();
  return <HomePageClient products={products} />;
}
