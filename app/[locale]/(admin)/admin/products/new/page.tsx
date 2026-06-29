'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminNewProductPage() {
  const locale = useLocale();
  const router = useRouter();

  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('flowers');
  const [stock, setStock] = useState('10');
  const [descEn, setDescEn] = useState('');
  const [descBn, setDescBn] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameBn || !price || !image) {
      alert(locale === 'bn' ? 'অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।' : 'Please fill out all required fields.');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const stored = localStorage.getItem('sicily_products_list');
      let list = [];
      if (stored) {
        try {
          list = JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }

      // Create new product object
      const newProduct = {
        id: String(Math.floor(1000 + Math.random() * 9000)),
        name_en: nameEn,
        name_bn: nameBn,
        price: Number(price),
        sale_price: salePrice ? Number(salePrice) : null,
        image: image,
        category: category,
        stock: Number(stock),
        desc_en: descEn,
        desc_bn: descBn,
        colors: [
          { en: 'Classic Gold', bn: 'ক্লাসিক গোল্ড', hex: '#D97706' },
          { en: 'Matte Black', bn: 'ম্যাট ব্ল্যাক', hex: '#111827' }
        ]
      };

      list.push(newProduct);
      localStorage.setItem('sicily_products_list', JSON.stringify(list));

      setIsSaving(false);
      router.push(`/${locale}/admin/products`);
    }, 800);
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
              <option value="flowers">{locale === 'bn' ? 'ফুল (Flowers)' : 'Handmade Flowers'}</option>
              <option value="hangers">{locale === 'bn' ? 'হ্যাঙ্গার (Hangers)' : 'Metal Hangers'}</option>
              <option value="frames">{locale === 'bn' ? 'ফ্রেম (Frames)' : 'Wooden Frames'}</option>
              <option value="vases">{locale === 'bn' ? 'ফুলদানি (Vases)' : 'Vases & Pots'}</option>
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

        {/* Image URL Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">
            Image URL <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            required
          />
          <span className="text-[9px] text-brand-muted font-bold block pt-1">
            {locale === 'bn' ? '* আনস্প্ল্যাশ বা অন্যান্য হোস্টিং সাইটের ডিরেক্ট ইমেজ ইউআরএল ব্যবহার করুন।' : '* Provide direct image URLs from Unsplash, Imgur or Cloudflare R2.'}
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
