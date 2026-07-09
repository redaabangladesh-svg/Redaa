'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import type { HomeProduct } from '@/lib/products';
import ProductCard from '@/components/store/ProductCard';

export default function ShopPageClient({ products }: { products: HomeProduct[] }) {
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
    const category = searchParams.get('category');
    if (category) setSelectedCategory(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = [
    { id: 'all', label_en: 'All Categories', label_bn: 'সব ক্যাটাগরি' },
    { id: 'panjabi', label_en: 'Panjabi', label_bn: 'পাঞ্জাবি' },
    { id: 'tupi', label_en: 'Tupi', label_bn: 'টুপি' },
    { id: 'rumal', label_en: 'Rumal', label_bn: 'রুমাল' },
    { id: 'orna', label_en: 'Orna', label_bn: 'ওড়না' },
  ];

  // Filtering
  const filteredProducts = products.filter((product) => {
    const name = locale === 'bn' ? product.name_bn : product.name_en;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.sale_price ?? a.price;
    const priceB = b.sale_price ?? b.price;

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    return 0; // featured default ordering
  });

  return (
    <div className="space-y-6 px-4 sm:px-0 pb-16">
      {/* Header */}
      <div className="pt-2 pb-4 border-b border-brand-border space-y-1.5">
        <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.25em] text-[#C6A15B] uppercase">
          <span className="h-px w-4 bg-[#C6A15B]" />
          Redaa
        </span>
        <h1 className="font-serif text-2xl md:text-4xl font-semibold tracking-tight text-brand-text leading-tight">
          {locale === 'bn' ? 'আমাদের কালেকশন' : 'Our Collection'}
        </h1>
        <p className="text-xs md:text-sm text-brand-muted leading-relaxed font-medium">
          {locale === 'bn'
            ? 'প্রিমিয়াম কোয়ালিটির পাঞ্জাবি, টুপি, ওড়না ও রুমাল সংগ্রহ।'
            : 'Explore our high-quality premium Panjabi, Tupi, Orna, and Rumal.'}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={locale === 'bn' ? 'ডেকোর পণ্য খুঁজুন...' : 'Search products...'}
          className="w-full bg-brand-surface border border-brand-border rounded-lg py-2.5 pl-4 pr-11 text-sm text-brand-text placeholder-brand-muted outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
      </div>

      {/* Category chips — horizontal scroll on mobile */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 border ${
              selectedCategory === cat.id
                ? 'bg-brand-primary border-brand-primary text-white'
                : 'bg-white border-brand-border text-brand-text hover:border-brand-primary/40'
            }`}
          >
            {locale === 'bn' ? cat.label_bn : cat.label_en}
          </button>
        ))}
      </div>

      {/* Sort Header */}
      <div className="flex items-center justify-between border-b border-brand-border pb-3 gap-4">
        <p className="text-xs font-bold text-brand-muted">
          {locale === 'bn' ? `${sortedProducts.length} টি পণ্য পাওয়া গেছে` : `Showing ${sortedProducts.length} items`}
        </p>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-brand-border rounded-lg text-xs font-bold py-2 px-3 text-brand-text outline-none focus:border-brand-primary transition-colors"
        >
          <option value="featured">{locale === 'bn' ? 'জনপ্রিয়' : 'Featured'}</option>
          <option value="price-asc">{locale === 'bn' ? 'মূল্য: কম থেকে বেশি' : 'Price: Low to High'}</option>
          <option value="price-desc">{locale === 'bn' ? 'মূল্য: বেশি থেকে কম' : 'Price: High to Low'}</option>
        </select>
      </div>

      {/* Product Grid — same card as homepage */}
      {sortedProducts.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-brand-surface border border-brand-border rounded-2xl">
          <p className="text-sm font-bold text-brand-muted">
            {locale === 'bn' ? 'দুঃখিত, কোনো পণ্য পাওয়া যায়নি!' : 'No products found matching criteria!'}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
          >
            {locale === 'bn' ? 'রিসেট করুন' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} p={product} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
