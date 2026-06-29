'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Package, Plus, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name_en: string;
  name_bn: string;
  price: number;
  sale_price: number | null;
  image: string;
  category: string;
  stock: number;
}

const DEFAULT_MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name_en: 'Premium Metal Flower Hanger',
    name_bn: 'প্রিমিয়াম মেটাল ফ্লাওয়ার হ্যাঙ্গার',
    price: 1250,
    sale_price: 990,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600',
    category: 'hangers',
    stock: 2
  },
  {
    id: '2',
    name_en: 'Handcrafted Pastel Tulip Bouquet',
    name_bn: 'হ্যান্ডক্রাফটেড পেস্টেল টিউলিপ তোড়া',
    price: 850,
    sale_price: null,
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&q=80&w=600',
    category: 'flowers',
    stock: 12
  },
  {
    id: '3',
    name_en: 'Vintage Wooden Wall Flower Frame',
    name_bn: 'ভিন্টেজ কাঠের ওয়াল ফ্লাওয়ার ফ্রেম',
    price: 1500,
    sale_price: 1200,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
    category: 'frames',
    stock: 4
  }
];

export default function AdminProductsPage() {
  const locale = useLocale();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('sicily_products_list');
    if (stored) {
      try {
        const parsed: Product[] = JSON.parse(stored);
        setProducts(parsed);
      } catch (e) {
        console.error(e);
        setProducts(DEFAULT_MOCK_PRODUCTS);
      }
    } else {
      localStorage.setItem('sicily_products_list', JSON.stringify(DEFAULT_MOCK_PRODUCTS));
      setProducts(DEFAULT_MOCK_PRODUCTS);
    }
  }, []);

  const handleDeleteProduct = (id: string) => {
    const confirmDelete = window.confirm(
      locale === 'bn' 
        ? 'আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি ডিলিট করতে চান?' 
        : 'Are you sure you want to delete this product?'
    );
    if (!confirmDelete) return;

    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem('sicily_products_list', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-brand-text flex items-center gap-2">
            <Package className="h-6 w-6 text-brand-primary" />
            <span>{locale === 'bn' ? 'প্রোডাক্টস তালিকা' : 'Store Products'}</span>
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 font-medium">
            {locale === 'bn' ? 'স্টোরের ইনভেন্টরি, স্টক এবং নতুন সামগ্রী যুক্ত করুন।' : 'Manage store catalog items, stock limits, and launch new products.'}
          </p>
        </div>

        {/* Add Product Button */}
        <Link
          href={`/${locale}/admin/products/new`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white font-extrabold text-xs rounded-xl hover:bg-brand-primary-alt shadow-md shadow-brand-primary/20 transition-all-custom"
        >
          <Plus className="h-4 w-4" />
          <span>{locale === 'bn' ? 'নতুন প্রোডাক্ট যোগ করুন' : 'Add New Product'}</span>
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-medium">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface/40 text-brand-muted font-bold">
                <th className="py-4 px-5">{locale === 'bn' ? 'পণ্য' : 'Product'}</th>
                <th className="py-4 px-5">{locale === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="py-4 px-5">{locale === 'bn' ? 'মূল্য' : 'Price'}</th>
                <th className="py-4 px-5">{locale === 'bn' ? 'স্টক' : 'Stock'}</th>
                <th className="py-4 px-5 text-right">{locale === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-muted font-bold">
                    {locale === 'bn' ? 'কোনো প্রোডাক্ট পাওয়া যায়নি।' : 'No products found in catalog.'}
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const name = locale === 'bn' ? p.name_bn : p.name_en;
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
                          <img src={p.image} alt={name} className="h-10 w-10 rounded-lg object-cover border border-brand-border flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="font-extrabold text-brand-text text-xs block truncate max-w-[200px]">{name}</span>
                            <span className="text-[9px] text-brand-muted block mt-0.5">ID: {p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 capitalize text-brand-muted font-semibold">{p.category}</td>
                      <td className="py-3.5 px-5">{priceText}</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stock <= 5 
                            ? 'bg-rose-50 border border-rose-100 text-rose-700' 
                            : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                        }`}>
                          {p.stock} {locale === 'bn' ? 'টি বাকি' : 'left'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        <Link
                          href={`/${locale}/admin/products/${p.id}`}
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
