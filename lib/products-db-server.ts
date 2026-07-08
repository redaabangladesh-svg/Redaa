import { createClient } from '@supabase/supabase-js';
import { fetchProductDetail, fetchProducts, type ProductDetail } from '@/lib/products-db';
import type { HomeProduct } from '@/lib/products';

// Stateless anon client for server components / metadata / sitemap — no
// cookies needed since these are all public reads, and this needs to work
// outside a request context (revalidated ISR renders, sitemap builds).
function createStatelessClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function fetchProductDetailServer(slugOrId: string): Promise<ProductDetail | null> {
  return fetchProductDetail(slugOrId, createStatelessClient());
}

export async function fetchProductsServer(): Promise<HomeProduct[]> {
  return fetchProducts(createStatelessClient());
}

export interface SitemapProduct {
  slug: string;
  updated_at: string;
}

export async function fetchAllProductSlugs(): Promise<SitemapProduct[]> {
  const supabase = createStatelessClient();
  const { data } = await supabase.from('products').select('slug, updated_at');
  return data || [];
}

export interface SitemapCategory {
  slug: string;
}

export async function fetchAllCategorySlugs(): Promise<SitemapCategory[]> {
  const supabase = createStatelessClient();
  const { data } = await supabase.from('categories').select('slug');
  return data || [];
}
