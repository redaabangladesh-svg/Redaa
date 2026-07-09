import type { Metadata } from 'next';
import { Suspense } from 'react';
import { fetchProductsServer } from '@/lib/products-db-server';
import ShopPageClient from './ShopPageClient';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Redaa';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.redaarabia.com/';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `আমাদের কালেকশন | ${STORE_NAME}`,
  description: 'প্রিমিয়াম কোয়ালিটির পাঞ্জাবি, টুপি, ওড়না ও রুমাল সংগ্রহ — সারাদেশে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।',
  alternates: { canonical: `${BASE_URL}/shop` },
};

export default async function ShopPage() {
  const products = await fetchProductsServer();
  return (
    <Suspense>
      <ShopPageClient products={products} />
    </Suspense>
  );
}
