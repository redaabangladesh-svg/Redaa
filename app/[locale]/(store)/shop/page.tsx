'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useCart } from '@/lib/cart';
import { Search, SlidersHorizontal, Heart, Star, ShoppingCart, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name_en: string;
  name_bn: string;
  price: number;
  sale_price: number | null;
  image: string;
  category: 'flowers' | 'hangers' | 'frames' | 'vases';
  rating: number;
  reviews: number;
  isFeatured?: boolean;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name_en: 'Premium Metal Flower Hanger',
    name_bn: 'প্রিমিয়াম মেটাল ফ্লাওয়ার হ্যাঙ্গার',
    price: 1250,
    sale_price: 990,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600',
    category: 'hangers',
    rating: 4.8,
    reviews: 24,
    isFeatured: true
  },
  {
    id: '2',
    name_en: 'Handcrafted Pastel Tulip Bouquet',
    name_bn: 'হ্যান্ডক্রাফটেড পেস্টেল টিউলিপ তোড়া',
    price: 850,
    sale_price: null,
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&q=80&w=600',
    category: 'flowers',
    rating: 4.9,
    reviews: 18,
    isFeatured: true
  },
  {
    id: '3',
    name_en: 'Vintage Wooden Wall Flower Frame',
    name_bn: 'ভিন্টেজ কাঠের ওয়াল ফ্লাওয়ার ফ্রেম',
    price: 1500,
    sale_price: 1200,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
    category: 'frames',
    rating: 4.7,
    reviews: 32,
    isFeatured: true
  },
  {
    id: '4',
    name_en: 'Artificial Eucalyptus Hanging Vine',
    name_bn: 'কৃত্রিম ইউক্যালিপটাস ঝুলন্ত লতা',
    price: 450,
    sale_price: null,
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600',
    category: 'flowers',
    rating: 4.5,
    reviews: 12
  },
  {
    id: '5',
    name_en: 'Hexagonal Metal Wall Shelves (Set of 3)',
    name_bn: 'ষড়ভুজ মেটাল ওয়াল শেলফ (৩ পিসের সেট)',
    price: 1800,
    sale_price: 1450,
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600',
    category: 'hangers',
    rating: 4.6,
    reviews: 15
  },
  {
    id: '6',
    name_en: 'Ceramic White Minimalist Flower Vase',
    name_bn: 'সিরামিক হোয়াইট মিনিমালিস্ট ফ্লাওয়ার ফুলদানি',
    price: 950,
    sale_price: 750,
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=600',
    category: 'vases',
    rating: 4.9,
    reviews: 28
  }
];

export default function ShopPage() {
  const locale = useLocale();
  const { addToCart } = useCart();
  
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Load from localStorage or initialize with mockProducts static array
  useEffect(() => {
    const stored = localStorage.getItem('sicily_products_list');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setProductsList(parsed);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    localStorage.setItem('sicily_products_list', JSON.stringify(mockProducts));
    setProductsList(mockProducts);
  }, []);

  // Debounced search query logger
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(() => {
      const stored = localStorage.getItem('sicily_search_logs') || '[]';
      let logs = [];
      try {
        logs = JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }

      const cleanQuery = searchQuery.trim().toLowerCase();
      const existingIdx = logs.findIndex((l: any) => l.query.toLowerCase() === cleanQuery);

      if (existingIdx > -1) {
        logs[existingIdx].count += 1;
        logs[existingIdx].last_searched = new Date().toISOString().replace('T', ' ').substring(0, 16);
      } else {
        logs.push({
          query: searchQuery.trim(),
          count: 1,
          last_searched: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });
      }

      localStorage.setItem('sicily_search_logs', JSON.stringify(logs));
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter Categories list
  const categories = [
    { id: 'all', label_en: 'All Decor', label_bn: 'সব সামগ্রী' },
    { id: 'flowers', label_en: 'Handmade Flowers', label_bn: 'হাতে তৈরি ফুল' },
    { id: 'hangers', label_en: 'Metal Hangers', label_bn: 'মেটাল হ্যাঙ্গার' },
    { id: 'frames', label_en: 'Wooden Frames', label_bn: 'কাঠের ফ্রেম' },
    { id: 'vases', label_en: 'Vases & Pots', label_bn: 'ফুলদানি' }
  ];

  // Filtering Logic
  const filteredProducts = productsList.filter((product) => {
    const name = locale === 'bn' ? product.name_bn : product.name_en;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.sale_price !== null ? a.sale_price : a.price;
    const priceB = b.sale_price !== null ? b.sale_price : b.price;

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // featured default ordering
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0B5D5C] p-8 md:p-12 text-white flex flex-col justify-center min-h-[160px] md:min-h-[220px] border border-white/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.25em] text-[#C6A15B] uppercase mb-1">
            <span className="h-px w-4 bg-[#C6A15B]" />
            {locale === 'bn' ? 'সিসিলি ডেকোর' : 'Sicily Decor'}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
            {locale === 'bn' ? 'আমাদের ডেকোর কালেকশন' : 'Our Decor Collection'}
          </h1>
          <p className="text-xs md:text-sm text-white/70 leading-relaxed font-medium">
            {locale === 'bn' 
              ? 'প্রিমিয়াম কোয়ালিটির ফ্লাওয়ার, ওয়াল আর্ট ফ্রেম এবং মেটাল হ্যাঙ্গার সংগ্রহ।' 
              : 'Explore our high-quality premium flowers, wall-art frames, and hanger stands.'}
          </p>
        </div>
      </div>

      {/* Control Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="space-y-6 lg:col-span-1">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'bn' ? 'ডেকোর পণ্য খুঁজুন...' : 'Search products...'}
              className="w-full bg-white border border-brand-border rounded-2xl py-3 pl-4 pr-11 text-sm text-brand-text placeholder-brand-muted outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all-custom"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
          </div>

          {/* Categories card */}
          <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3">
              <SlidersHorizontal className="h-4 w-4 text-brand-primary" />
              <h3 className="font-bold text-brand-text text-sm">
                {locale === 'bn' ? 'ক্যাটাগরি ফিল্টার' : 'Filter by Category'}
              </h3>
            </div>
            
            <div className="flex flex-wrap lg:flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all-custom text-left border ${
                    selectedCategory === cat.id
                      ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20'
                      : 'bg-brand-surface border-brand-border text-brand-text hover:border-brand-primary/40'
                  }`}
                >
                  {locale === 'bn' ? cat.label_bn : cat.label_en}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Panel */}
        <main className="lg:col-span-3 space-y-6">
          {/* Sort Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-brand-border pb-4 gap-4">
            <p className="text-xs font-bold text-brand-muted">
              {locale === 'bn' 
                ? `${sortedProducts.length} টি পণ্য পাওয়া গেছে` 
                : `Showing ${sortedProducts.length} items`}
            </p>
            
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-bold text-brand-muted">
                {locale === 'bn' ? 'সর্ট করুন:' : 'Sort:'}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-brand-border rounded-xl text-xs font-bold py-2 px-3 text-brand-text outline-none focus:border-brand-primary transition-all-custom"
              >
                <option value="featured">{locale === 'bn' ? 'জনপ্রিয়' : 'Featured'}</option>
                <option value="price-asc">{locale === 'bn' ? 'মূল্য: কম থেকে বেশি' : 'Price: Low to High'}</option>
                <option value="price-desc">{locale === 'bn' ? 'মূল্য: বেশি থেকে কম' : 'Price: High to Low'}</option>
                <option value="rating">{locale === 'bn' ? 'রেটিং' : 'Top Rated'}</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {sortedProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white border border-brand-border rounded-3xl">
              <p className="text-sm font-bold text-brand-muted">
                {locale === 'bn' ? 'দুঃখিত, কোনো ডেকোর পাওয়া যায়নি! 🔍' : 'No products found matching criteria! 🔍'}
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-full hover:bg-brand-primary hover:text-white transition-all-custom"
              >
                {locale === 'bn' ? 'রিসেট করুন' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => {
                const hasSale = !!product.sale_price;
                const activePrice = product.sale_price !== null ? product.sale_price : product.price;
                const name = locale === 'bn' ? product.name_bn : product.name_en;

                return (
                  <div 
                    key={product.id} 
                    className="group relative rounded-2xl bg-white border border-brand-border overflow-hidden hover:shadow-xl hover:border-brand-primary/20 hover:-translate-y-1 transition-all-custom"
                  >
                    {/* Image Wrap */}
                    <div className="relative aspect-square w-full bg-brand-surface overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={name}
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-all-custom duration-500"
                      />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.isFeatured && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-[#C6A15B] bg-[#14201D] uppercase tracking-wider">
                            Best
                          </span>
                        )}
                        {hasSale && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white bg-brand-secondary uppercase tracking-wider">
                            Sale
                          </span>
                        )}
                      </div>

                      {/* Wishlist Button placeholder */}
                      <button className="absolute top-3 right-3 p-2 rounded-full bg-white/85 backdrop-blur-sm border border-brand-border text-brand-text hover:text-brand-secondary hover:bg-white transition-all-custom">
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <Link 
                        href={`/${locale}/product/${product.id}`}
                        className="block font-bold text-brand-text group-hover:text-brand-primary transition-all-custom line-clamp-2 min-h-[40px] text-sm hover:underline"
                      >
                        {name}
                      </Link>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-xs font-semibold text-brand-text">{product.rating}</span>
                        <span className="text-[10px] text-brand-muted">({product.reviews})</span>
                      </div>

                      {/* Price & Cart Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                          {hasSale ? (
                            <>
                              <span className="text-base font-extrabold text-brand-secondary">৳{product.sale_price}</span>
                              <span className="text-[10px] text-brand-muted line-through">৳{product.price}</span>
                            </>
                          ) : (
                            <span className="text-base font-extrabold text-brand-text">৳{product.price}</span>
                          )}
                        </div>

                        <button 
                          onClick={() => addToCart({
                            id: product.id,
                            name_en: product.name_en,
                            name_bn: product.name_bn,
                            image: product.image,
                            price: product.price,
                            sale_price: product.sale_price
                          })}
                          className="p-2.5 rounded-full bg-brand-primary text-white hover:bg-brand-primary-alt hover:rotate-12 transition-all-custom shadow-md shadow-brand-primary/20"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
