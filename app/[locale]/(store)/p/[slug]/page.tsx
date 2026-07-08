import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchProductDetailServer } from '@/lib/products-db-server';
import { generateProductMeta, generateProductJsonLd } from '@/lib/seo';
import ProductPageClient from './ProductPageClient';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string; locale: string } }): Promise<Metadata> {
  const product = await fetchProductDetailServer(params.slug);
  if (!product) return {};
  return generateProductMeta(product, params.locale);
}

export default async function ProductPage({ params }: { params: { slug: string; locale: string } }) {
  const product = await fetchProductDetailServer(params.slug);
  if (!product) notFound();

  const jsonLd = generateProductJsonLd(product, params.locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient product={product} />
    </>
  );
}
