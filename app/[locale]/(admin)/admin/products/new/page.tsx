'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import ProductForm, { emptyProductForm, type ProductFormData } from '@/components/admin/ProductForm';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export default function AdminNewProductPage() {
  const locale = useLocale();
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(emptyProductForm);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameEn || !form.nameBn || !form.price || form.images.length === 0 || !form.categorySlug) {
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

    const { error } = await supabase.from('products').insert({
      name_en: form.nameEn,
      name_bn: form.nameBn,
      slug: slugify(form.nameEn),
      price: Number(form.price),
      sale_price: form.salePrice ? Number(form.salePrice) : null,
      stock: Number(form.stock),
      low_stock_threshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : 5,
      is_featured: form.isFeatured,
      images: form.images,
      variants: form.variants.map((v) => ({
        size_en: v.size_en,
        size_bn: v.size_bn,
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
        benefits_en: form.benefitsEn.split('\n').map((s) => s.trim()).filter(Boolean),
        benefits_bn: form.benefitsBn.split('\n').map((s) => s.trim()).filter(Boolean),
        video_url: form.videoUrl || undefined,
      },
      seo_title_en: form.seoTitleEn || null,
      seo_title_bn: form.seoTitleBn || null,
      seo_description_en: form.seoDescEn || null,
      seo_description_bn: form.seoDescBn || null,
    });

    setIsSaving(false);

    if (error) {
      alert(locale === 'bn' ? 'প্রোডাক্ট সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save product.');
      console.error(error);
      return;
    }

    router.push(`/admin/products`);
  };

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
          {locale === 'bn' ? 'নতুন প্রোডাক্ট তৈরি করুন' : 'Add New Product'}
        </h1>
        <p className="text-xs text-brand-muted mt-1.5 font-medium">
          {locale === 'bn' ? 'স্টোরে প্রদর্শন করার জন্য নতুন সামগ্রীর তথ্য দিন।' : 'Upload photos and configure prices/stocks for launching a new product.'}
        </p>
      </div>

      <ProductForm
        locale={locale}
        data={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        isSaving={isSaving}
        submitLabel={locale === 'bn' ? 'প্রোডাক্ট সংরক্ষণ করুন' : 'Save & Publish Product'}
      />
    </div>
  );
}
