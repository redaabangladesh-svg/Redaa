'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Plus, Pencil, Trash2, Save, X, Image as ImageIcon, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface Category {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  image: string | null;
  created_at: string;
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export default function AdminCategoriesPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [slug, setSlug] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const [showAddForm, setShowAddForm] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    if (!editingId) {
      setSlug(slugify(val));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const resData = await res.json();
      if (res.ok && resData.url) {
        setImageUrl(resData.url);
      } else {
        alert(isBn ? 'ইমেজ আপলোড ব্যর্থ হয়েছে।' : 'Image upload failed.');
      }
    } catch {
      alert(isBn ? 'ইমেজ আপলোড ব্যর্থ হয়েছে।' : 'Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameBn || !slug) {
      alert(isBn ? 'অনুগ্রহ করে সব তথ্য দিন।' : 'Please fill in all fields.');
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    const payload = {
      name_en: nameEn,
      name_bn: nameBn,
      slug: slug,
      image: imageUrl,
    };

    if (editingId) {
      const { error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', editingId);

      if (error) {
        alert(isBn ? 'ক্যাটাগরি আপডেট ব্যর্থ হয়েছে।' : 'Failed to update category.');
        console.error(error);
      } else {
        setEditingId(null);
        resetForm();
        loadCategories();
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([payload]);

      if (error) {
        alert(isBn ? 'নতুন ক্যাটাগরি তৈরি ব্যর্থ হয়েছে।' : 'Failed to create category.');
        console.error(error);
      } else {
        setShowAddForm(false);
        resetForm();
        loadCategories();
      }
    }
    setIsSaving(false);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setNameEn(cat.name_en);
    setNameBn(cat.name_bn);
    setSlug(cat.slug);
    setImageUrl(cat.image);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    const conf = window.confirm(
      isBn 
        ? 'আপনি কি নিশ্চিতভাবে এই ক্যাটাগরি ডিলিট করতে চান?' 
        : 'Are you sure you want to delete this category?'
    );
    if (!conf) return;

    const supabase = createClient();
    
    // Check if any products are using this category
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count && count > 0) {
      alert(
        isBn 
          ? 'এই ক্যাটাগরির অধীনে প্রোডাক্ট আছে। আগে প্রডাক্টগুলো অন্য ক্যাটাগরিতে সরান।' 
          : 'Products exist under this category. Move them before deleting.'
      );
      return;
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert(isBn ? 'ডিলিট ব্যর্থ হয়েছে।' : 'Delete failed.');
    } else {
      loadCategories();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNameEn('');
    setNameBn('');
    setSlug('');
    setImageUrl(null);
  };

  return (
    <div className="max-w-4xl space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-brand-text">
            {isBn ? 'ক্যাটাগরি ম্যানেজমেন্ট' : 'Category Management'}
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 font-medium">
            {isBn 
              ? 'স্টোরের ক্যাটাগরি তৈরি, সম্পাদনা এবং মুছে ফেলার কাজ করুন।' 
              : 'Add new categories, edit names/slugs, or upload preview images.'}
          </p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => { resetForm(); setShowAddForm(true); }}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-xs rounded-lg transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{isBn ? 'নতুন ক্যাটাগরি' : 'Add Category'}</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-brand-border p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-brand-border">
            <h3 className="text-sm font-bold text-brand-text">
              {editingId 
                ? (isBn ? 'ক্যাটাগরি সম্পাদনা' : 'Edit Category') 
                : (isBn ? 'নতুন ক্যাটাগরি যোগ করুন' : 'Add New Category')}
            </h3>
            <button
              type="button"
              onClick={() => { setShowAddForm(false); resetForm(); }}
              className="text-brand-muted hover:text-brand-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                Category Name (English) *
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => handleNameEnChange(e.target.value)}
                placeholder="e.g. Premium Cotton Panjabi"
                className="w-full py-2 px-3 rounded-lg border border-brand-border focus:border-brand-primary text-xs font-semibold focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                ক্যাটাগরির নাম (বাংলা) *
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: প্রিমিয়াম কটন পাঞ্জাবি"
                className="w-full py-2 px-3 rounded-lg border border-brand-border focus:border-brand-primary text-xs font-semibold focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                Slug (URL Path) *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="w-full py-2 px-3 rounded-lg border border-brand-border bg-brand-surface text-brand-muted text-xs font-semibold focus:outline-none"
                required
              />
            </div>

            {/* Category Image Upload */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                {isBn ? 'ক্যাটাগরি ইমেজ' : 'Category Image'}
              </label>
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted overflow-hidden flex-shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-5 w-5 stroke-1" />
                  )}
                </div>
                
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    disabled={isUploading}
                  />
                  <button
                    type="button"
                    className="flex items-center gap-1.5 py-1.5 px-3 border border-brand-border hover:bg-brand-surface text-brand-text font-semibold text-xs rounded-lg transition-all disabled:opacity-60"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="h-3.5 w-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>{isBn ? 'আপলোড করুন' : 'Upload Image'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-brand-border justify-end">
            <button
              type="button"
              onClick={() => { setShowAddForm(false); resetForm(); }}
              className="py-2 px-4 rounded-lg border border-brand-border text-brand-text font-semibold text-xs hover:bg-brand-surface"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 py-2 px-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-xs rounded-lg shadow-sm disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সংরক্ষণ করুন' : 'Save Category')}</span>
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full rounded-xl bg-brand-primary/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-border overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16">{isBn ? 'ছবি' : 'Image'}</th>
                <th className="py-3.5 px-4">{isBn ? 'ক্যাটাগরির নাম (বাংলা / English)' : 'Name (English / Bengali)'}</th>
                <th className="py-3.5 px-4 w-32">Slug</th>
                <th className="py-3.5 px-4 w-28 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-xs font-semibold text-brand-text">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-brand-muted font-medium">
                    {isBn ? 'কোনো ক্যাটাগরি পাওয়া যায়নি।' : 'No categories found.'}
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-brand-surface/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="h-10 w-10 rounded-lg border border-brand-border bg-brand-surface overflow-hidden flex items-center justify-center text-brand-muted">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name_en} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 stroke-1" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-brand-text">{cat.name_en}</div>
                      <div className="text-[10px] text-brand-muted font-medium mt-0.5">{cat.name_bn}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-brand-muted">{cat.slug}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="h-7 w-7 rounded-lg hover:bg-brand-surface border border-transparent hover:border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-text transition-all"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="h-7 w-7 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 flex items-center justify-center text-rose-500 hover:text-rose-700 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
