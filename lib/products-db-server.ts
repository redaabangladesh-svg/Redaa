import { createClient } from '@supabase/supabase-js';
import { fetchProductDetail, fetchProducts, type ProductDetail } from '@/lib/products-db';
import type { HomeProduct } from '@/lib/products';

// Stateless anon client for server components / metadata / sitemap — no
// cookies needed since these are all public reads, and this needs to work
// outside a request context (revalidated ISR renders, sitemap builds).
function createStatelessClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const validUrl = !url || url.includes('your-supabase-project') || !url.startsWith('http')
    ? 'https://placeholder-project-id.supabase.co'
    : url;

  const validKey = !anonKey || anonKey.includes('your-supabase-anon-key')
    ? 'placeholder-anon-key'
    : anonKey;

  return createClient(validUrl, validKey);
}

export async function fetchProductDetailServer(slugOrId: string): Promise<ProductDetail | null> {
  return fetchProductDetail(slugOrId, createStatelessClient());
}

export async function fetchProductsServer(): Promise<HomeProduct[]> {
  return fetchProducts(createStatelessClient());
}

export async function fetchSettingsServer(keys: string[]): Promise<Record<string, string>> {
  const supabase = createStatelessClient();
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', keys);

  if (error || !data) return {};
  return data.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as Record<string, string>);
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
