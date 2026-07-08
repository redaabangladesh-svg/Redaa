'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist';
import { useCart } from '@/lib/cart';
import InfoPageHeader from '@/components/store/InfoPageHeader';

export default function WishlistPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="font-sans">
      <InfoPageHeader
        icon={Heart}
        title={isBn ? 'পছন্দের তালিকা' : 'My Wishlist'}
        subtitle={isBn
          ? 'পছন্দের প্রোডাক্টগুলো এখানে সংরক্ষিত থাকবে, পরে সহজেই অর্ডার করতে পারবেন।'
          : 'Your saved favorites live here — order them anytime.'}
      />

      <div className="max-w-5xl mx-auto px-6 py-10 sm:py-14">
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-4 py-16 text-brand-muted">
            <Heart className="h-16 w-16 text-brand-border stroke-[1.5]" />
            <p className="font-medium text-sm">
              {isBn ? 'আপনার পছন্দের তালিকা খালি রয়েছে 🌸' : 'Your wishlist is empty 🌸'}
            </p>
            <Link
              href={`/shop`}
              className="mt-2 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white px-4 py-2 rounded-full transition-all-custom"
            >
              {isBn ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistItems.map((item) => {
              const name = isBn ? item.name_bn : item.name_en;
              const activePrice = item.sale_price ?? item.price;
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm flex flex-col">
                  <Link href={`/p/${item.id}`} className="block aspect-square bg-brand-surface overflow-hidden">
                    <img src={item.image} alt={name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                    <div>
                      <h3 className="text-xs font-semibold text-brand-text line-clamp-2 leading-snug">
                        <Link href={`/p/${item.id}`}>{name}</Link>
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-sm font-bold text-brand-secondary">৳{activePrice}</span>
                        {item.sale_price !== null && (
                          <span className="text-[10px] text-brand-muted line-through">৳{item.price}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addToCart({ id: item.id, name_en: item.name_en, name_bn: item.name_bn, image: item.image, price: item.price, sale_price: item.sale_price })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-br from-brand-primary to-brand-primary-alt text-white text-[10px] font-bold"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.75} />
                        <span>{isBn ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2 rounded-lg border border-brand-border text-brand-muted hover:border-red-300 hover:text-red-600 transition-all-custom flex-shrink-0"
                        title={isBn ? 'সরিয়ে ফেলুন' : 'Remove'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
