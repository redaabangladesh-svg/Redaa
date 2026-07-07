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
  categories: { slug: string } | null;
}

function mapRow(row: ProductRow): HomeProduct {
  const discount = row.sale_price
    ? `-${Math.round(((row.price - row.sale_price) / row.price) * 100)}%`
    : null;

  return {
    id: row.id,
    name_en: row.name_en,
    name_bn: row.name_bn,
    price: row.price,
    sale_price: row.sale_price,
    image: row.images?.[0] || '/Sicily_icon.png',
    discount,
    sizes: (row.variants || []).map((v) => v.size_en || '').filter(Boolean),
    stock: row.stock,
    category: (row.categories?.slug as HomeProduct['category']) || 'wall-stand',
    rating: 4.8,
    reviews: 20,
  };
}

export async function fetchProducts(): Promise<HomeProduct[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name_en, name_bn, slug, price, sale_price, stock, images, variants, is_featured, categories(slug)')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('fetchProducts error', error);
    return [];
  }

  return (data as unknown as ProductRow[]).map(mapRow);
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

export interface ProductDetail extends HomeProduct {
  images: string[];
  description_en: string | null;
  description_bn: string | null;
  short_description_en: string | null;
  short_description_bn: string | null;
  variants: { size_en?: string; size_bn?: string; price?: number; sale_price?: number | null }[];
}

export async function fetchProductDetail(slugOrId: string): Promise<ProductDetail | null> {
  const supabase = createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

  const query = supabase
    .from('products')
    .select('id, name_en, name_bn, slug, price, sale_price, stock, images, variants, is_featured, description_en, description_bn, short_description_en, short_description_bn, categories(slug)');

  const { data, error } = isUuid
    ? await query.or(`id.eq.${slugOrId},slug.eq.${slugOrId}`).maybeSingle()
    : await query.eq('slug', slugOrId).maybeSingle();

  if (error || !data) return null;

  const row = data as any;
  return {
    ...mapRow(row),
    images: row.images && row.images.length > 0 ? row.images : ['/Sicily_icon.png'],
    description_en: row.description_en,
    description_bn: row.description_bn,
    short_description_en: row.short_description_en,
    short_description_bn: row.short_description_bn,
    variants: row.variants || [],
  };
}
