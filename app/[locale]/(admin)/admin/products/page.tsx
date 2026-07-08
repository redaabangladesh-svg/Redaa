'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Package, Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface Product {
  id: string;
  name_en: string;
  name_bn: string;
  price: number;
  sale_price: number | null;
  images: string[];
  stock: number;
  categories: { name_en: string; name_bn: string } | null;
}

export default function AdminProductsPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, name_en, name_bn, price, sale_price, images, stock, categories(name_en, name_bn)')
      .order('created_at', { ascending: false });

    if (!error && data) setProducts(data as unknown as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    const confirmDelete = window.confirm(
      isBn ? 'আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি ডিলিট করতে চান?' : 'Are you sure you want to delete this product?'
    );
    if (!confirmDelete) return;

    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-brand-text flex items-center gap-2">
            <Package className="h-6 w-6 text-brand-primary" />
            <span>{isBn ? 'প্রোডাক্টস তালিকা' : 'Store Products'}</span>
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 font-medium">
            {isBn ? 'স্টোরের ইনভেন্টরি, স্টক এবং নতুন সামগ্রী যুক্ত করুন।' : 'Manage store catalog items, stock limits, and launch new products.'}
          </p>
        </div>

        {/* Add Product Button */}
        <Link
          href={`/admin/products/new`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white font-extrabold text-xs rounded-xl hover:bg-brand-primary-alt shadow-md shadow-brand-primary/20 transition-all-custom"
        >
          <Plus className="h-4 w-4" />
          <span>{isBn ? 'নতুন প্রোডাক্ট যোগ করুন' : 'Add New Product'}</span>
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-medium">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface/40 text-brand-muted font-bold">
                <th className="py-4 px-5">{isBn ? 'পণ্য' : 'Product'}</th>
                <th className="py-4 px-5">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="py-4 px-5">{isBn ? 'মূল্য' : 'Price'}</th>
                <th className="py-4 px-5">{isBn ? 'স্টক' : 'Stock'}</th>
                <th className="py-4 px-5 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-muted font-bold">
                    {isBn ? 'লোড হচ্ছে...' : 'Loading...'}
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-muted font-bold">
                    {isBn ? 'কোনো প্রোডাক্ট পাওয়া যায়নি।' : 'No products found in catalog.'}
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const name = isBn ? p.name_bn : p.name_en;
                  const priceText = p.sale_price !== null ? (
                    <div>
                      <span className="font-extrabold text-brand-secondary">৳{p.sale_price}</span>
                      <span className="block text-[9px] text-brand-muted line-through">৳{p.price}</span>
                    </div>
                  ) : (
                    <span className="font-bold text-brand-text">৳{p.price}</span>
                  );

                  return (
                    <tr key={p.id} className="hover:bg-brand-surface/40">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0] || '/Sicily_icon.png'} alt={name} className="h-10 w-10 rounded-lg object-cover border border-brand-border flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="font-extrabold text-brand-text text-xs block truncate max-w-[200px]">{name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 capitalize text-brand-muted font-semibold">
                        {p.categories ? (isBn ? p.categories.name_bn : p.categories.name_en) : '—'}
                      </td>
                      <td className="py-3.5 px-5">{priceText}</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stock <= 5
                            ? 'bg-rose-50 border border-rose-100 text-rose-700'
                            : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                        }`}>
                          {p.stock} {isBn ? 'টি বাকি' : 'left'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="inline-flex p-1.5 rounded-lg border border-brand-border text-brand-muted hover:border-brand-primary hover:text-brand-primary transition-all-custom"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="inline-flex p-1.5 rounded-lg border border-brand-border text-brand-muted hover:border-red-300 hover:text-red-600 transition-all-custom"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
