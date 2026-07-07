'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft, Save, Sparkles, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

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

  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('flower-tub');
  const [stock, setStock] = useState('10');
  const [descEn, setDescEn] = useState('');
  const [descBn, setDescBn] = useState('');
  const [landingPageActive, setLandingPageActive] = useState(false);
  const [seoTitleEn, setSeoTitleEn] = useState('');
  const [seoTitleBn, setSeoTitleBn] = useState('');
  const [seoDescEn, setSeoDescEn] = useState('');
  const [seoDescBn, setSeoDescBn] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || (locale === 'bn' ? 'আপলোড ব্যর্থ হয়েছে।' : 'Upload failed.'));
        return;
      }

      setImage(data.url);
    } catch (err) {
      setUploadError(locale === 'bn' ? 'আপলোড ব্যর্থ হয়েছে।' : 'Upload failed.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameBn || !price || !image) {
      alert(locale === 'bn' ? 'অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।' : 'Please fill out all required fields.');
      return;
    }

    setIsSaving(true);

    const supabase = createClient();
    const { data: categoryRow } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .maybeSingle();

    const { error } = await supabase.from('products').insert({
      name_en: nameEn,
      name_bn: nameBn,
      slug: slugify(nameEn),
      price: Number(price),
      sale_price: salePrice ? Number(salePrice) : null,
      stock: Number(stock),
      images: [image],
      category_id: categoryRow?.id ?? null,
      description_en: descEn || null,
      description_bn: descBn || null,
      landing_page_active: landingPageActive,
      seo_title_en: seoTitleEn || null,
      seo_title_bn: seoTitleBn || null,
      seo_description_en: seoDescEn || null,
      seo_description_bn: seoDescBn || null,
    });

    setIsSaving(false);

    if (error) {
      alert(locale === 'bn' ? 'প্রোডাক্ট সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save product.');
      console.error(error);
      return;
    }

    router.push(`/${locale}/admin/products`);
  };

  return (
    <div className="max-w-3xl space-y-6 font-sans">
      {/* Back Button */}
      <Link
        href={`/${locale}/admin/products`}
        className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{locale === 'bn' ? 'প্রোডাক্টস তালিকায় ফিরে যান' : 'Back to Products'}</span>
      </Link>

      {/* Header */}
      <div className="border-b border-brand-border pb-4">
        <h1 className="text-xl md:text-2xl font-black text-brand-text">
          {locale === 'bn' ? 'নতুন প্রোডাক্ট তৈরি করুন' : 'Add New Product'}
        </h1>
        <p className="text-xs text-brand-muted mt-1.5 font-medium">
          {locale === 'bn' ? 'স্টোরে প্রদর্শন করার জন্য নতুন সামগ্রীর তথ্য দিন।' : 'Upload photos and configure prices/stocks for launching a new product.'}
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        
        {/* Name Fields EN & BN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              Product Name (English) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Handmade Ceramic Flower Vase"
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              প্রোডাক্টের নাম (বাংলা) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              placeholder="যেমন: হাতে তৈরি সিরামিক ফুলদানি"
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              required
            />
          </div>
        </div>

        {/* Pricing, Category & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              Price (৳) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1200"
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              Sale Price (৳)
            </label>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="990"
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            >
              <option value="flower-tub">{locale === 'bn' ? 'ফ্লাওয়ার টাব' : 'Flower Tub'}</option>
              <option value="tree-plant">{locale === 'bn' ? 'ট্রি প্ল্যান্ট' : 'Tree Plant'}</option>
              <option value="wall-stand">{locale === 'bn' ? 'ওয়াল স্ট্যান্ড' : 'Wall Stand'}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              Stock Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="10"
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              required
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-brand-muted uppercase">
            Product Image <span className="text-rose-500">*</span>
          </label>

          {image ? (
            <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-brand-border">
              <img src={image} alt="Product preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImage('')}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="w-40 h-40 rounded-xl border-2 border-dashed border-brand-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-primary/40 transition-all-custom">
              {isUploading ? (
                <Sparkles className="h-6 w-6 text-brand-primary animate-spin" />
              ) : (
                <>
                  <UploadCloud className="h-6 w-6 text-brand-muted" />
                  <span className="text-[10px] font-bold text-brand-muted">
                    {locale === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}
                  </span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
            </label>
          )}

          {uploadError && (
            <p className="text-[10px] text-rose-600 font-bold">{uploadError}</p>
          )}

          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://... (or upload an image above)"
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            required
          />
          <span className="text-[9px] text-brand-muted font-bold block pt-1">
            {locale === 'bn' ? '* ছবি আপলোড করুন অথবা সরাসরি ইমেজ ইউআরএল বসান।' : '* Upload an image above, or paste a direct image URL.'}
          </span>
        </div>

        {/* Descriptions (optional) */}
        <div className="space-y-6 pt-4 border-t border-brand-border">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              Description (English)
            </label>
            <textarea
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              placeholder="Write product detailed specifications..."
              rows={4}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-3 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-semibold leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              বিবরণ (বাংলা)
            </label>
            <textarea
              value={descBn}
              onChange={(e) => setDescBn(e.target.value)}
              placeholder="পণ্যের বিস্তারিত বিবরণ ও বৈশিষ্ট্য লিখুন..."
              rows={4}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-3 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-semibold leading-relaxed"
            />
          </div>
        </div>

        {/* Landing Page Toggle */}
        <div className="pt-4 border-t border-brand-border flex items-center justify-between">
          <div>
            <label className="text-xs font-bold text-brand-text block">
              {locale === 'bn' ? 'ল্যান্ডিং পেজ সক্রিয়' : 'Landing Page Active'}
            </label>
            <p className="text-[10px] text-brand-muted mt-0.5">
              {locale === 'bn' ? 'চালু করলে /p/[slug] এ একটি মার্কেটিং ল্যান্ডিং পেজ পাওয়া যাবে।' : 'When on, this product gets a dedicated /p/[slug] marketing landing page.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLandingPageActive((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition-all-custom flex-shrink-0 ${landingPageActive ? 'bg-brand-primary' : 'bg-brand-border'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-all-custom ${landingPageActive ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {/* SEO Fields */}
        <div className="space-y-6 pt-4 border-t border-brand-border">
          <h3 className="text-[10px] font-bold text-brand-muted uppercase">
            {locale === 'bn' ? 'এসইও তথ্য (ঐচ্ছিক)' : 'SEO Metadata (Optional)'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">SEO Title (English)</label>
              <input
                type="text"
                value={seoTitleEn}
                onChange={(e) => setSeoTitleEn(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">এসইও টাইটেল (বাংলা)</label>
              <input
                type="text"
                value={seoTitleBn}
                onChange={(e) => setSeoTitleBn(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">SEO Description (English)</label>
              <textarea
                value={seoDescEn}
                onChange={(e) => setSeoDescEn(e.target.value)}
                rows={2}
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">এসইও বিবরণ (বাংলা)</label>
              <textarea
                value={seoDescBn}
                onChange={(e) => setSeoDescBn(e.target.value)}
                rows={2}
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 rounded-2xl bg-brand-primary text-white font-extrabold text-xs hover:bg-brand-primary-alt shadow-lg shadow-brand-primary/25 transition-all-custom flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
        >
          {isSaving ? (
            <Sparkles className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <Save className="h-4.5 w-4.5" />
          )}
          <span>{locale === 'bn' ? 'প্রোডাক্ট সংরক্ষণ করুন' : 'Save & Publish Product'}</span>
        </button>
      </form>
    </div>
  );
}
