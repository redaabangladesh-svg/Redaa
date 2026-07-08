'use client';

import { Heart, ShoppingCart, PackageCheck, PackageX, Flame } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { HomeProduct } from '@/lib/products';
import { useWishlist } from '@/lib/wishlist';
import { useCart } from '@/lib/cart';

export default function ProductCard({ p, locale }: { p: HomeProduct; locale: string }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const liked = isWishlisted(p.id);
  const name = locale === 'bn' ? p.name_bn : p.name_en;
  const price = p.sale_price ?? p.price;

  const handleAddToCart = () => {
    addToCart({ id: p.id, name_en: p.name_en, name_bn: p.name_bn, image: p.image, price: p.price, sale_price: p.sale_price });
  };

  return (
    <div className="group bg-white rounded-2xl border border-brand-border [@media(hover:hover)]:hover:border-[#C6A15B]/50 overflow-hidden shadow-sm [@media(hover:hover)]:hover:shadow-xl [@media(hover:hover)]:hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Wrapper */}
      <div className="relative aspect-square bg-brand-surface overflow-hidden">
        <Link href={`/p/${p.id}`} className="block h-full w-full">
          <Image
            src={p.image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            className="object-cover [@media(hover:hover)]:group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Discount Ribbon (Top-left corner) */}
        {p.discount && (
          <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-brand-secondary to-brand-secondary-dark text-white text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wide shadow-sm">
            {p.discount}
          </span>
        )}

        {/* Wishlist Heart Icon (Top-right corner) */}
        <button
          onClick={() => toggleWishlist({ id: p.id, name_en: p.name_en, name_bn: p.name_bn, image: p.image, price: p.price, sale_price: p.sale_price })}
          className="absolute top-2.5 right-2.5 h-8 w-8 flex items-center justify-center rounded-full bg-white/95 shadow-sm border border-brand-border [@media(hover:hover)]:hover:scale-110 [@media(hover:hover)]:hover:border-brand-secondary/50 [@media(hover:hover)]:hover:shadow-md transition-all duration-200"
        >
          <Heart className={`h-3.5 w-3.5 transition-colors ${liked ? 'fill-brand-secondary text-brand-secondary' : 'text-brand-muted'}`} strokeWidth={1.75} />
        </button>

        {/* Quick-add overlay (appears on hover) */}
        <button
          onClick={handleAddToCart}
          disabled={p.stock === 0}
          className="absolute inset-x-0 bottom-0 translate-y-full [@media(hover:hover)]:group-hover:translate-y-0 bg-gradient-to-r from-brand-secondary to-brand-secondary-dark text-white text-[10px] font-bold uppercase tracking-widest py-2.5 flex items-center justify-center gap-1.5 transition-transform duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>{locale === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
        </button>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <h3 className="text-xs sm:text-sm font-semibold text-brand-text leading-snug line-clamp-2 [@media(hover:hover)]:hover:text-brand-primary transition-colors">
            <Link href={`/p/${p.id}`}>{name}</Link>
          </h3>

          {/* Price + Stock */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-brand-secondary">৳{price}</span>
            {p.sale_price && (
              <span className="text-[10px] text-brand-muted line-through">৳{p.price}</span>
            )}
            <span className="text-brand-border">|</span>
            {p.stock === 0 ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-brand-muted whitespace-nowrap">
                <PackageX className="h-3 w-3 flex-shrink-0" strokeWidth={1.75} />
                {locale === 'bn' ? 'স্টকে নেই' : 'Out of Stock'}
              </span>
            ) : p.stock <= 5 ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-brand-primary whitespace-nowrap">
                <Flame className="h-3 w-3 flex-shrink-0" strokeWidth={1.75} />
                {locale === 'bn' ? `${p.stock}টি বাকি` : `${p.stock} left`}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-brand-primary whitespace-nowrap">
                <PackageCheck className="h-3 w-3 flex-shrink-0" strokeWidth={1.75} />
                {locale === 'bn' ? 'স্টকে আছে' : 'In Stock'}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button (full-width, with Bangla label) — disabled when out of stock */}
        {p.stock === 0 ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-brand-surface text-brand-muted text-[11px] font-bold cursor-not-allowed"
          >
            <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>{locale === 'bn' ? 'স্টকে নেই' : 'Out of Stock'}</span>
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-gradient-to-br from-brand-primary to-brand-primary-alt text-white text-[11px] font-bold shadow-sm [@media(hover:hover)]:hover:shadow-lg [@media(hover:hover)]:hover:shadow-brand-primary/30 [@media(hover:hover)]:hover:-translate-y-0.5 transition-all duration-200"
          >
            <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>{locale === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
