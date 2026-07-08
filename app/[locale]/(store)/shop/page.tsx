import type { Metadata } from 'next';
import { Suspense } from 'react';
import { fetchProductsServer } from '@/lib/products-db-server';
import ShopPageClient from './ShopPageClient';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Sicily';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `আমাদের ডেকোর কালেকশন | ${STORE_NAME}`,
  description: 'প্রিমিয়াম কোয়ালিটির ফ্লাওয়ার, ওয়াল আর্ট ফ্রেম এবং মেটাল হ্যাঙ্গার সংগ্রহ — সারাদেশে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।',
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
