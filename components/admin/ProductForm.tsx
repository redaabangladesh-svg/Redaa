'use client';

import { useState, useEffect } from 'react';
import { Sparkles, UploadCloud, X, Plus, Trash2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { BOX_ITEM_ICONS, type BoxItemIcon } from '@/lib/products-db';

export interface Variant {
  size_en: string;
  size_bn: string;
  color_en?: string;
  color_bn?: string;
  color_code?: string;
  price?: string;
  sale_price?: string;
  stock?: string;
}

export interface BoxItemForm {
  icon: BoxItemIcon;
  title_en: string;
  title_bn: string;
  subtitle_en: string;
  subtitle_bn: string;
}

const BOX_ICON_LABEL: Record<BoxItemIcon, string> = {
  frame: 'ফ্রেম',
  flower: 'ফুল',
  tool: 'টুল',
  guide: 'গাইড',
  gift: 'গিফট',
  box: 'বক্স',
};

export interface ProductFormData {
  nameEn: string;
  nameBn: string;
  shortDescEn: string;
  shortDescBn: string;
  descEn: string;
  descBn: string;
  price: string;
  salePrice: string;
  costPrice: string;
  stock: string;
  lowStockThreshold: string;
  isFeatured: boolean;
  categorySlug: string;
  images: string[];
  variants: Variant[];
  landingPageActive: boolean;
  taglineEn: string;
  taglineBn: string;
  benefitsEn: string;
  benefitsBn: string;
  boxItems: BoxItemForm[];
  videoUrl: string;
  seoTitleEn: string;
  seoTitleBn: string;
  seoDescEn: string;
  seoDescBn: string;
}

export const emptyProductForm: ProductFormData = {
  nameEn: '', nameBn: '', shortDescEn: '', shortDescBn: '', descEn: '', descBn: '',
  price: '', salePrice: '', costPrice: '', stock: '10', lowStockThreshold: '5', isFeatured: false,
  categorySlug: '', images: [], variants: [], landingPageActive: false,
  taglineEn: '', taglineBn: '',
  benefitsEn: '', benefitsBn: '', boxItems: [], videoUrl: '',
  seoTitleEn: '', seoTitleBn: '', seoDescEn: '', seoDescBn: '',
};

interface Category { id: string; slug: string; name_en: string; name_bn: string; }

export default function ProductForm({
  locale,
  data,
  onChange,
  onSubmit,
  isSaving,
  submitLabel,
}: {
  locale: string;
  data: ProductFormData;
  onChange: (data: ProductFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
  submitLabel: string;
}) {
  const isBn = locale === 'bn';
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient();
      const { data: rows } = await supabase.from('categories').select('id, slug, name_en, name_bn').order('name_en');
      setCategories(rows || []);
    };
    loadCategories();
  }, []);

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const resData = await res.json();
        if (!res.ok) {
          setUploadError(resData.error || (isBn ? 'আপলোড ব্যর্থ হয়েছে।' : 'Upload failed.'));
          continue;
        }
        uploadedUrls.push(resData.url);
      }
      set('images', [...data.images, ...uploadedUrls]);
    } catch {
      setUploadError(isBn ? 'আপলোড ব্যর্থ হয়েছে।' : 'Upload failed.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const addVariant = () => {
    set('variants', [...data.variants, { size_en: '', size_bn: '', color_en: '', color_bn: '', color_code: '#000000', price: '', sale_price: '', stock: '10' }]);
  };

  const updateVariant = (idx: number, field: keyof Variant, value: string) => {
    const updated = data.variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v));
    set('variants', updated);
  };

  const removeVariant = (idx: number) => {
    set('variants', data.variants.filter((_, i) => i !== idx));
  };

  const addBoxItem = () => {
    set('boxItems', [...data.boxItems, { icon: 'box', title_en: '', title_bn: '', subtitle_en: '', subtitle_bn: '' }]);
  };

  const updateBoxItem = (idx: number, field: keyof BoxItemForm, value: string) => {
    const updated = data.boxItems.map((b, i) => (i === idx ? { ...b, [field]: value } : b));
    set('boxItems', updated);
  };

  const removeBoxItem = (idx: number) => {
    set('boxItems', data.boxItems.filter((_, i) => i !== idx));
  };

  return (
    <form onSubmit={onSubmit} className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">

      {/* Name Fields EN & BN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">
            প্রোডাক্টের নাম (ইংরেজি) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={data.nameEn}
            onChange={(e) => set('nameEn', e.target.value)}
            placeholder="যেমন: Handmade Ceramic Flower Vase"
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
            value={data.nameBn}
            onChange={(e) => set('nameBn', e.target.value)}
            placeholder="যেমন: হাতে তৈরি সিরামিক ফুলদানি"
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            required
          />
        </div>
      </div>

      {/* Short Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">সংক্ষিপ্ত বিবরণ (ইংরেজি)</label>
          <input
            type="text"
            value={data.shortDescEn}
            onChange={(e) => set('shortDescEn', e.target.value)}
            placeholder="টাইটেলের নিচে দেখানো এক লাইনের বিবরণ"
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">সংক্ষিপ্ত বিবরণ (বাংলা)</label>
          <input
            type="text"
            value={data.shortDescBn}
            onChange={(e) => set('shortDescBn', e.target.value)}
            placeholder="টাইটেলের নিচে দেখানো এক লাইনের বিবরণ"
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
          />
        </div>
      </div>

      {/* Pricing, Category, Stock, Low Stock Threshold */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">দাম (৳) <span className="text-rose-500">*</span></label>
          <input
            type="number"
            value={data.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="1200"
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">সেল প্রাইস (৳)</label>
          <input
            type="number"
            value={data.salePrice}
            onChange={(e) => set('salePrice', e.target.value)}
            placeholder="990"
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">
            ক্রয়মূল্য (৳)
          </label>
          <input
            type="number"
            value={data.costPrice}
            onChange={(e) => set('costPrice', e.target.value)}
            placeholder="600"
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
          />
          <p className="text-[9px] text-brand-muted font-semibold">প্রফিট/লস রিপোর্ট হিসাব করতে ব্যবহৃত হয়, কাস্টমার দেখবে না।</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">ক্যাটাগরি <span className="text-rose-500">*</span></label>
          <select
            value={data.categorySlug}
            onChange={(e) => set('categorySlug', e.target.value)}
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            required
          >
            <option value="">{isBn ? '-- ক্যাটাগরি বেছে নিন --' : '-- Select Category --'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{isBn ? c.name_bn : c.name_en}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">স্টক পরিমাণ <span className="text-rose-500">*</span></label>
          <input
            type="number"
            value={data.stock}
            onChange={(e) => set('stock', e.target.value)}
            placeholder="10"
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">
            {isBn ? 'লো-স্টক থ্রেশহোল্ড' : 'Low Stock Threshold'}
          </label>
          <input
            type="number"
            value={data.lowStockThreshold}
            onChange={(e) => set('lowStockThreshold', e.target.value)}
            placeholder="5"
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
          />
          <p className="text-[9px] text-brand-muted font-semibold">
            {isBn ? 'এই সংখ্যার নিচে স্টক নামলে "মাত্র কয়েকটি বাকি" ব্যাজ দেখাবে।' : 'Stock badge switches to "low stock" at or below this count.'}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5">
          <div>
            <label className="text-xs font-bold text-brand-text block">{isBn ? 'ফিচার্ড প্রোডাক্ট' : 'Featured Product'}</label>
            <p className="text-[9px] text-brand-muted mt-0.5">{isBn ? 'হোমপেজে হাইলাইট হবে' : 'Highlighted on the homepage'}</p>
          </div>
          <button
            type="button"
            onClick={() => set('isFeatured', !data.isFeatured)}
            className={`relative h-6 w-11 rounded-full transition-all-custom flex-shrink-0 ${data.isFeatured ? 'bg-brand-primary' : 'bg-brand-border'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-all-custom ${data.isFeatured ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Multi-Image Upload */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-brand-muted uppercase">
          প্রোডাক্ট ছবি <span className="text-rose-500">*</span>
        </label>

        <div className="flex flex-wrap gap-3">
          {data.images.map((img, idx) => (
            <div key={idx} className="relative w-28 h-28 rounded-xl overflow-hidden border border-brand-border">
              <img src={img} alt={`প্রোডাক্ট ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => set('images', data.images.filter((_, i) => i !== idx))}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="w-28 h-28 rounded-xl border-2 border-dashed border-brand-border flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-brand-primary/40 transition-all-custom">
            {isUploading ? (
              <Sparkles className="h-5 w-5 text-brand-primary animate-spin" />
            ) : (
              <>
                <UploadCloud className="h-5 w-5 text-brand-muted" />
                <span className="text-[9px] font-bold text-brand-muted text-center px-1">
                  {isBn ? 'ছবি যোগ করুন' : 'Add Images'}
                </span>
              </>
            )}
            <input type="file" accept="image/*" multiple onChange={handleFileUpload} disabled={isUploading} className="hidden" />
          </label>
        </div>

        {uploadError && <p className="text-[10px] text-rose-600 font-bold">{uploadError}</p>}
        <span className="text-[9px] text-brand-muted font-bold block pt-1">
          {isBn ? '* একাধিক ছবি একসাথে আপলোড করা যাবে। প্রথম ছবিটি প্রধান ছবি হিসেবে ব্যবহৃত হবে।' : '* Upload multiple images at once — the first one becomes the main product image.'}
        </span>
      </div>

      {/* Variants Editor */}
      <div className="space-y-3 pt-4 border-t border-brand-border">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-brand-muted uppercase">
            {isBn ? 'ভ্যারিয়েন্ট (সাইজ/কালার)' : 'Variants (Size/Color)'}
          </h3>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 text-[10px] font-bold text-brand-primary hover:text-brand-primary-alt"
          >
            <Plus className="h-3.5 w-3.5" /> {isBn ? 'যোগ করুন' : 'Add Variant'}
          </button>
        </div>
        {data.variants.length === 0 ? (
          <p className="text-[10px] text-brand-muted font-semibold">
            {isBn ? 'কোনো ভ্যারিয়েন্ট নেই — প্রোডাক্টটি একটিমাত্র দাম ও সাইজে বিক্রি হবে।' : 'No variants — product sells at a single price/size.'}
          </p>
        ) : (
          <div className="space-y-2">
            {data.variants.map((v, idx) => (
              <div key={idx} className="grid grid-cols-2 md:grid-cols-8 gap-2 items-center bg-brand-surface rounded-xl p-3 border border-brand-border/40">
                {/* Size Inputs */}
                <input
                  type="text"
                  value={v.size_en}
                  onChange={(e) => updateVariant(idx, 'size_en', e.target.value)}
                  placeholder="Size EN (e.g. M, L)"
                  className="bg-white border border-brand-border rounded-lg py-2 px-2 text-xs outline-none focus:border-brand-primary"
                />
                <input
                  type="text"
                  value={v.size_bn}
                  onChange={(e) => updateVariant(idx, 'size_bn', e.target.value)}
                  placeholder="সাইজ (যেমন: M)"
                  className="bg-white border border-brand-border rounded-lg py-2 px-2 text-xs outline-none focus:border-brand-primary"
                />
                
                {/* Color Inputs */}
                <input
                  type="text"
                  value={v.color_en || ''}
                  onChange={(e) => updateVariant(idx, 'color_en', e.target.value)}
                  placeholder="Color EN (e.g. Black)"
                  className="bg-white border border-brand-border rounded-lg py-2 px-2 text-xs outline-none focus:border-brand-primary"
                />
                <input
                  type="text"
                  value={v.color_bn || ''}
                  onChange={(e) => updateVariant(idx, 'color_bn', e.target.value)}
                  placeholder="রঙ (যেমন: কালো)"
                  className="bg-white border border-brand-border rounded-lg py-2 px-2 text-xs outline-none focus:border-brand-primary"
                />
                
                {/* Color Code Picker */}
                <div className="flex items-center gap-1.5 bg-white border border-brand-border rounded-lg py-1 px-1.5">
                  <input
                    type="color"
                    value={v.color_code || '#000000'}
                    onChange={(e) => updateVariant(idx, 'color_code', e.target.value)}
                    className="h-7 w-7 rounded cursor-pointer border-0 bg-transparent flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={v.color_code || '#000000'}
                    onChange={(e) => updateVariant(idx, 'color_code', e.target.value)}
                    placeholder="#Hex"
                    className="w-full text-[10px] outline-none border-0 font-mono"
                  />
                </div>

                {/* Stock & Prices */}
                <input
                  type="number"
                  value={v.stock || ''}
                  onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                  placeholder={isBn ? 'স্টক' : 'Stock'}
                  className="bg-white border border-brand-border rounded-lg py-2 px-2 text-xs outline-none focus:border-brand-primary"
                />
                <input
                  type="number"
                  value={v.price || ''}
                  onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                  placeholder={isBn ? 'দাম (ঐচ্ছিক)' : 'Price (opt)'}
                  className="bg-white border border-brand-border rounded-lg py-2 px-2 text-xs outline-none focus:border-brand-primary"
                />
                
                {/* Action Row */}
                <div className="flex gap-2 justify-end w-full">
                  <input
                    type="number"
                    value={v.sale_price || ''}
                    onChange={(e) => updateVariant(idx, 'sale_price', e.target.value)}
                    placeholder={isBn ? 'সেল (ঐচ্ছিক)' : 'Sale (opt)'}
                    className="w-full bg-white border border-brand-border rounded-lg py-2 px-2 text-xs outline-none focus:border-brand-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="flex items-center justify-center h-9 w-9 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Description */}
      <div className="space-y-6 pt-4 border-t border-brand-border">
        <h3 className="text-[10px] font-bold text-brand-muted uppercase">বিস্তারিত বিবরণ (ঐচ্ছিক)</h3>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">বিবরণ (ইংরেজি)</label>
          <textarea
            value={data.descEn}
            onChange={(e) => set('descEn', e.target.value)}
            placeholder="প্রোডাক্টের বিস্তারিত স্পেসিফিকেশন লিখুন..."
            rows={4}
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-3 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-semibold leading-relaxed"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">বিবরণ (বাংলা)</label>
          <textarea
            value={data.descBn}
            onChange={(e) => set('descBn', e.target.value)}
            placeholder="পণ্যের বিস্তারিত বিবরণ ও বৈশিষ্ট্য লিখুন..."
            rows={4}
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-3 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-semibold leading-relaxed"
          />
        </div>
      </div>

      {/* Landing Page Toggle + Content */}
      <div className="space-y-4 pt-4 border-t border-brand-border">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-bold text-brand-text block">
              {isBn ? 'ল্যান্ডিং পেজ সক্রিয়' : 'Landing Page Active'}
            </label>
            <p className="text-[10px] text-brand-muted mt-0.5">
              {isBn ? 'চালু থাকলে /p/[slug] পেজে সম্পূর্ণ মার্কেটিং সেকশনসমূহ (সুবিধা, ৩-ধাপ, রিভিউ) দেখা যাবে।' : 'When on, /p/[slug] shows the full marketing sections (benefits, 3-step, reviews).'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => set('landingPageActive', !data.landingPageActive)}
            className={`relative h-6 w-11 rounded-full transition-all-custom flex-shrink-0 ${data.landingPageActive ? 'bg-brand-primary' : 'bg-brand-border'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-all-custom ${data.landingPageActive ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              {isBn ? 'ট্যাগলাইন (English)' : 'Tagline (English)'}
            </label>
            <input
              type="text"
              value={data.taglineEn}
              onChange={(e) => set('taglineEn', e.target.value)}
              placeholder="A unique blend of beauty and premium design"
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-semibold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              {isBn ? 'ট্যাগলাইন (বাংলা)' : 'Tagline (Bangla)'}
            </label>
            <input
              type="text"
              value={data.taglineBn}
              onChange={(e) => set('taglineBn', e.target.value)}
              placeholder="সৌন্দর্য, নান্দনিকতা ও প্রিমিয়াম ডিজাইনের অনন্য সমন্বয়"
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              {isBn ? 'কাস্টম সুবিধাসমূহ (English, এক লাইনে একটি)' : 'Custom Benefits (English, one per line)'}
            </label>
            <textarea
              value={data.benefitsEn}
              onChange={(e) => set('benefitsEn', e.target.value)}
              rows={3}
              placeholder={'100% handmade\nFree shipping over ৳1000'}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-semibold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              {isBn ? 'কাস্টম সুবিধাসমূহ (বাংলা, এক লাইনে একটি)' : 'Custom Benefits (Bangla, one per line)'}
            </label>
            <textarea
              value={data.benefitsBn}
              onChange={(e) => set('benefitsBn', e.target.value)}
              rows={3}
              placeholder={'১০০% হাতে তৈরি\n৳১০০০+ অর্ডারে ফ্রি ডেলিভারি'}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-semibold"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              {isBn ? 'বক্সে কী থাকছে (ঐচ্ছিক)' : "What's in the Box (optional)"}
            </label>
            <button
              type="button"
              onClick={addBoxItem}
              className="flex items-center gap-1 text-[10px] font-bold text-brand-primary hover:text-brand-primary-alt"
            >
              <Plus className="h-3.5 w-3.5" /> {isBn ? 'যোগ করুন' : 'Add Item'}
            </button>
          </div>
          {data.boxItems.length === 0 ? (
            <p className="text-[10px] text-brand-muted font-semibold">
              {isBn ? 'কোনো বক্স-আইটেম নেই — এই সেকশন ল্যান্ডিং পেজে দেখানো হবে না।' : 'No box items — this section will be hidden on the landing page.'}
            </p>
          ) : (
            <div className="space-y-2">
              {data.boxItems.map((item, idx) => (
                <div key={idx} className="bg-brand-surface rounded-xl p-3 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-center">
                    <select
                      value={item.icon}
                      onChange={(e) => updateBoxItem(idx, 'icon', e.target.value)}
                      className="bg-white border border-brand-border rounded-lg py-2 px-2 text-xs outline-none focus:border-brand-primary sm:col-span-1"
                    >
                      {BOX_ITEM_ICONS.map((ic) => (
                        <option key={ic} value={ic}>{BOX_ICON_LABEL[ic]}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={item.title_en}
                      onChange={(e) => updateBoxItem(idx, 'title_en', e.target.value)}
                      placeholder="টাইটেল (ইংরেজি) যেমন: Wooden Wall Frame"
                      className="bg-white border border-brand-border rounded-lg py-2 px-2.5 text-xs outline-none focus:border-brand-primary sm:col-span-2"
                    />
                    <input
                      type="text"
                      value={item.title_bn}
                      onChange={(e) => updateBoxItem(idx, 'title_bn', e.target.value)}
                      placeholder="টাইটেল (বাংলা)"
                      className="bg-white border border-brand-border rounded-lg py-2 px-2.5 text-xs outline-none focus:border-brand-primary sm:col-span-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeBoxItem(idx)}
                      className="flex items-center justify-center gap-1 py-2 rounded-lg border border-rose-200 text-rose-600 text-[10px] font-bold hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.subtitle_en}
                      onChange={(e) => updateBoxItem(idx, 'subtitle_en', e.target.value)}
                      placeholder="সাবটাইটেল (ইংরেজি, ঐচ্ছিক)"
                      className="bg-white border border-brand-border rounded-lg py-2 px-2.5 text-xs outline-none focus:border-brand-primary"
                    />
                    <input
                      type="text"
                      value={item.subtitle_bn}
                      onChange={(e) => updateBoxItem(idx, 'subtitle_bn', e.target.value)}
                      placeholder="সাবটাইটেল (ঐচ্ছিক)"
                      className="bg-white border border-brand-border rounded-lg py-2 px-2.5 text-xs outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">
            {isBn ? 'কাস্টম ভিডিও URL (ঐচ্ছিক)' : 'Custom Video URL (optional)'}
          </label>
          <input
            type="text"
            value={data.videoUrl}
            onChange={(e) => set('videoUrl', e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
          />
        </div>
      </div>

      {/* SEO Fields */}
      <div className="space-y-6 pt-4 border-t border-brand-border">
        <h3 className="text-[10px] font-bold text-brand-muted uppercase">
          {isBn ? 'এসইও তথ্য (ঐচ্ছিক)' : 'SEO Metadata (Optional)'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">এসইও টাইটেল (ইংরেজি)</label>
            <input
              type="text"
              value={data.seoTitleEn}
              onChange={(e) => set('seoTitleEn', e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">এসইও টাইটেল (বাংলা)</label>
            <input
              type="text"
              value={data.seoTitleBn}
              onChange={(e) => set('seoTitleBn', e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">এসইও বিবরণ (ইংরেজি)</label>
            <textarea
              value={data.seoDescEn}
              onChange={(e) => set('seoDescEn', e.target.value)}
              rows={2}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-semibold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">এসইও বিবরণ (বাংলা)</label>
            <textarea
              value={data.seoDescBn}
              onChange={(e) => set('seoDescBn', e.target.value)}
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
        {isSaving ? <Sparkles className="h-4.5 w-4.5 animate-spin" /> : <Save className="h-4.5 w-4.5" />}
        <span>{submitLabel}</span>
      </button>
    </form>
  );
}
