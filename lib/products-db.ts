import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import type { HomeProduct } from '@/lib/products';

interface ProductRow {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock: number;
  images: string[];
  variants: { size_en?: string; size_bn?: string }[] | null;
  is_featured: boolean;
  low_stock_threshold?: number;
  categories: { slug: string } | null;
}

function mapRow(row: ProductRow, rating?: number, reviewCount?: number): HomeProduct {
  const discount = row.sale_price
    ? `-${Math.round(((row.price - row.sale_price) / row.price) * 100)}%`
    : null;

  return {
    id: row.id,
    name_en: row.name_en,
    name_bn: row.name_bn,
    price: row.price,
    sale_price: row.sale_price,
    image: row.images?.[0] || '/logo.svg',
    discount,
    sizes: (row.variants || []).map((v) => v.size_en || '').filter(Boolean),
    stock: row.stock,
    category: row.categories?.slug || 'uncategorized',
    lowStockThreshold: row.low_stock_threshold ?? 5,
    rating: rating ?? 4.8,
    reviews: reviewCount ?? 0,
  };
}

export async function fetchProducts(client?: SupabaseClient): Promise<HomeProduct[]> {
  const supabase = client || createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name_en, name_bn, slug, price, sale_price, stock, images, variants, is_featured, categories(slug)')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('fetchProducts error', error);
    return [];
  }

  return (data as unknown as ProductRow[]).map((row) => mapRow(row));
}

export async function fetchProductBySlugOrId(slugOrId: string): Promise<HomeProduct | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name_en, name_bn, slug, price, sale_price, stock, images, variants, is_featured, categories(slug)')
    .or(`id.eq.${slugOrId},slug.eq.${slugOrId}`)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data as unknown as ProductRow);
}

export const BOX_ITEM_ICONS = ['frame', 'flower', 'tool', 'guide', 'gift', 'box'] as const;
export type BoxItemIcon = typeof BOX_ITEM_ICONS[number];

export interface BoxItem {
  icon: BoxItemIcon;
  title_en: string;
  title_bn: string;
  subtitle_en?: string;
  subtitle_bn?: string;
}

export interface LandingContent {
  benefits_en?: string[];
  benefits_bn?: string[];
  video_url?: string;
  tagline_en?: string;
  tagline_bn?: string;
  box_items?: BoxItem[];
}

export interface ProductReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  image: string | null;
  createdAt: string;
}

export interface ProductDetail extends HomeProduct {
  images: string[];
  description_en: string | null;
  description_bn: string | null;
  short_description_en: string | null;
  short_description_bn: string | null;
  variants: { size_en?: string; size_bn?: string; price?: number; sale_price?: number | null }[];
  landingPageActive: boolean;
  landingContent: LandingContent;
  reviews_list: ProductReview[];
  seo_title_en: string | null;
  seo_title_bn: string | null;
  seo_description_en: string | null;
  seo_description_bn: string | null;
}

// Accepts an injectable client so server components (metadata, ISR pages,
// sitemap) can pass a stateless anon client instead of the browser one.
export async function fetchProductDetail(slugOrId: string, client?: SupabaseClient): Promise<ProductDetail | null> {
  const supabase = client || createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

  const query = supabase
    .from('products')
    .select('id, name_en, name_bn, slug, price, sale_price, stock, images, variants, is_featured, low_stock_threshold, landing_page_active, landing_content, description_en, description_bn, short_description_en, short_description_bn, seo_title_en, seo_title_bn, seo_description_en, seo_description_bn, categories(slug)');

  const { data, error } = isUuid
    ? await query.or(`id.eq.${slugOrId},slug.eq.${slugOrId}`).maybeSingle()
    : await query.eq('slug', slugOrId).maybeSingle();

  if (error || !data) return null;

  const row = data as any;

  const { data: reviewRows } = await supabase
    .from('reviews')
    .select('id, customer_name, rating, comment, image, created_at')
    .eq('product_id', row.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  const reviews_list: ProductReview[] = (reviewRows || []).map((r) => ({
    id: r.id,
    customerName: r.customer_name,
    rating: r.rating,
    comment: r.comment,
    image: r.image,
    createdAt: r.created_at,
  }));

  const reviewCount = reviews_list.length;
  const avgRating = reviewCount > 0
    ? Math.round((reviews_list.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : 0;

  return {
    ...mapRow(row, avgRating, reviewCount),
    images: row.images && row.images.length > 0 ? row.images : ['/logo.svg'],
    description_en: row.description_en,
    description_bn: row.description_bn,
    short_description_en: row.short_description_en,
    short_description_bn: row.short_description_bn,
    variants: row.variants || [],
    landingPageActive: row.landing_page_active ?? false,
    landingContent: row.landing_content || {},
    reviews_list,
    seo_title_en: row.seo_title_en,
    seo_title_bn: row.seo_title_bn,
    seo_description_en: row.seo_description_en,
    seo_description_bn: row.seo_description_bn,
  };
}
