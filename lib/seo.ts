import type { Metadata } from 'next';
import type { ProductDetail } from '@/lib/products-db';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Redaa';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.redaarabia.com/';

export function generateProductMeta(product: ProductDetail, locale: string): Metadata {
  const isBn = locale === 'bn';
  const name = isBn ? product.name_bn : product.name_en;
  const shortDesc = (isBn ? product.short_description_bn : product.short_description_en) || name;
  const seoTitle = (isBn ? product.seo_title_bn : product.seo_title_en) || name;
  const seoDesc = (isBn ? product.seo_description_bn : product.seo_description_en) || shortDesc;
  const image = product.images?.[0];
  const url = `${BASE_URL}/p/${product.id}`;

  return {
    title: `${seoTitle} | ${STORE_NAME}`,
    description: seoDesc,
    alternates: { canonical: url },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url,
      images: image ? [{ url: image, width: 800, height: 800 }] : undefined,
      type: 'website',
      locale: 'bn_BD',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: image ? [image] : undefined,
    },
  };
}

export function generateProductJsonLd(product: ProductDetail, locale: string) {
  const isBn = locale === 'bn';
  const name = isBn ? product.name_bn : product.name_en;
  const description = (isBn ? product.description_bn : product.description_en) || name;
  const price = product.sale_price ?? product.price;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: product.images,
    description,
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/p/${product.id}`,
      priceCurrency: 'BDT',
      price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: STORE_NAME },
    },
  };

  if (product.reviews > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews,
    };
  }

  return jsonLd;
}
