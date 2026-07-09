'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import ProductForm, { emptyProductForm, type ProductFormData } from '@/components/admin/ProductForm';
import ProductReviewsManager from '@/components/admin/ProductReviewsManager';

export default function AdminEditProductPage({ params }: { params: { id: string } }) {
  const locale = useLocale();
  const router = useRouter();

  const [productId, setProductId] = useState<string | null>(null);
  const [productSlug, setProductSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ProductFormData>(emptyProductForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('id, name_en, name_bn, slug, price, sale_price, stock, low_stock_threshold, is_featured, images, variants, short_description_en, short_description_bn, description_en, description_bn, landing_page_active, landing_content, seo_title_en, seo_title_bn, seo_description_en, seo_description_bn, categories(slug)')
        .eq('id', params.id)
        .maybeSingle();

      // Fetched separately and tolerated on failure: `cost_price` is a newer
      // column (see supabase/add_cost_price.sql) that may not exist yet on
      // every environment — the rest of the edit form must still load.
      let costPriceValue: number | null = null;
      try {
        const { data: costRow } = await supabase.from('products').select('cost_price').eq('id', params.id).maybeSingle();
        costPriceValue = costRow?.cost_price ?? null;
      } catch {
        costPriceValue = null;
      }

      if (data) {
        const row = data as any;
        const landingContent = row.landing_content || {};
        setProductId(row.id);
        setProductSlug(row.slug);
        setForm({
          nameEn: row.name_en,
          nameBn: row.name_bn,
          shortDescEn: row.short_description_en || '',
          shortDescBn: row.short_description_bn || '',
          descEn: row.description_en || '',
          descBn: row.description_bn || '',
          price: String(row.price),
          salePrice: row.sale_price !== null ? String(row.sale_price) : '',
          costPrice: costPriceValue !== null ? String(costPriceValue) : '',
          stock: String(row.stock),
          lowStockThreshold: row.low_stock_threshold !== null && row.low_stock_threshold !== undefined ? String(row.low_stock_threshold) : '5',
          isFeatured: row.is_featured || false,
          categorySlug: row.categories?.slug || '',
          images: row.images && row.images.length > 0 ? row.images : [],
          variants: (row.variants || []).map((v: any) => ({
            size_en: v.size_en || '',
            size_bn: v.size_bn || '',
            color_en: v.color_en || '',
            color_bn: v.color_bn || '',
            color_code: v.color_code || '#000000',
            stock: v.stock !== undefined ? String(v.stock) : '10',
            price: v.price !== undefined ? String(v.price) : '',
            sale_price: v.sale_price !== undefined ? String(v.sale_price) : '',
          })),
          landingPageActive: row.landing_page_active || false,
          taglineEn: landingContent.tagline_en || '',
          taglineBn: landingContent.tagline_bn || '',
          benefitsEn: (landingContent.benefits_en || []).join('\n'),
          benefitsBn: (landingContent.benefits_bn || []).join('\n'),
          boxItems: (landingContent.box_items || []).map((b: any) => ({
            icon: b.icon || 'box',
            title_en: b.title_en || '',
            title_bn: b.title_bn || '',
            subtitle_en: b.subtitle_en || '',
            subtitle_bn: b.subtitle_bn || '',
          })),
          videoUrl: landingContent.video_url || '',
          seoTitleEn: row.seo_title_en || '',
          seoTitleBn: row.seo_title_bn || '',
          seoDescEn: row.seo_description_en || '',
          seoDescBn: row.seo_description_bn || '',
        });
      }
      setLoading(false);
    };
    loadProduct();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !form.nameEn || !form.nameBn || !form.price || form.images.length === 0 || !form.categorySlug) {
      alert(locale === 'bn' ? 'অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।' : 'Please fill out all required fields.');
      return;
    }

    setIsSaving(true);

    const supabase = createClient();
    const { data: categoryRow } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', form.categorySlug)
      .maybeSingle();

    const { error } = await supabase
      .from('products')
      .update({
        name_en: form.nameEn,
        name_bn: form.nameBn,
        price: Number(form.price),
        sale_price: form.salePrice ? Number(form.salePrice) : null,
        stock: Number(form.stock),
        low_stock_threshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : 5,
        is_featured: form.isFeatured,
        images: form.images,
        variants: form.variants.map((v) => ({
          size_en: v.size_en || undefined,
          size_bn: v.size_bn || undefined,
          color_en: v.color_en || undefined,
          color_bn: v.color_bn || undefined,
          color_code: v.color_code || undefined,
          stock: v.stock ? Number(v.stock) : undefined,
          price: v.price ? Number(v.price) : undefined,
          sale_price: v.sale_price ? Number(v.sale_price) : undefined,
        })),
        category_id: categoryRow?.id ?? null,
        short_description_en: form.shortDescEn || null,
        short_description_bn: form.shortDescBn || null,
        description_en: form.descEn || null,
        description_bn: form.descBn || null,
        landing_page_active: form.landingPageActive,
        landing_content: {
          tagline_en: form.taglineEn || undefined,
          tagline_bn: form.taglineBn || undefined,
          benefits_en: form.benefitsEn.split('\n').map((s) => s.trim()).filter(Boolean),
          benefits_bn: form.benefitsBn.split('\n').map((s) => s.trim()).filter(Boolean),
          box_items: form.boxItems.filter((b) => b.title_en || b.title_bn),
          video_url: form.videoUrl || undefined,
        },
        seo_title_en: form.seoTitleEn || null,
        seo_title_bn: form.seoTitleBn || null,
        seo_description_en: form.seoDescEn || null,
        seo_description_bn: form.seoDescBn || null,
      })
      .eq('id', productId);

    setIsSaving(false);

    if (error) {
      alert(locale === 'bn' ? 'পরিবর্তন সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save changes.');
      console.error(error);
      return;
    }

    // Best-effort: `cost_price` is a newer column (supabase/add_cost_price.sql)
    // that may not exist yet everywhere — never let it block the main save.
    try {
      await supabase.from('products').update({ cost_price: form.costPrice ? Number(form.costPrice) : 0 }).eq('id', productId);
    } catch {
      // ignore — profit/loss reporting just won't have a cost basis until the migration runs
    }

    fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: productSlug }),
    }).catch(() => {});

    router.push(`/admin/products`);
  };

  if (loading || !productId) {
    return (
      <div className="py-20 text-center font-sans text-brand-muted font-bold">
        {locale === 'bn' ? 'প্রোডাক্ট তথ্য লোড হচ্ছে...' : 'Loading product details...'}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6 font-sans">
      <Link
        href={`/admin/products`}
        className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{locale === 'bn' ? 'প্রোডাক্টস তালিকায় ফিরে যান' : 'Back to Products'}</span>
      </Link>

      <div className="border-b border-brand-border pb-4">
        <h1 className="text-xl md:text-2xl font-black text-brand-text">
          {locale === 'bn' ? `প্রোডাক্ট এডিট করুন: ${form.nameBn}` : `Edit Product: ${form.nameEn}`}
        </h1>
        <p className="text-xs text-brand-muted mt-1.5 font-medium">
          {locale === 'bn' ? 'প্রোডাক্টের বিবরণ, স্টক বা প্রাইস এডিট করে সেভ করুন।' : 'Modify product pricing, description copy or stock counts.'}
        </p>
      </div>

      <ProductForm
        locale={locale}
        data={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        isSaving={isSaving}
        submitLabel={locale === 'bn' ? 'পরিবর্তনগুলো সংরক্ষণ করুন' : 'Save Changes'}
      />

      <ProductReviewsManager productId={productId} productSlug={productSlug} locale={locale} />
    </div>
  );
}
