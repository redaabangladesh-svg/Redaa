'use client';

import { useCart } from '@/lib/cart';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function CartDrawer() {
  const { cartItems, cartTotal, isCartOpen, setIsCartOpen, updateCartItemQty, removeFromCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Navbar'); // reuse translations for labels

  if (!isCartOpen) return null;

  const currentLocale = pathname.split('/')[1] || 'bn';

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    router.push(`/${currentLocale}/checkout`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-brand-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-brand-primary" />
              <span>{currentLocale === 'bn' ? 'শপিং কার্ট' : 'Shopping Cart'}</span>
            </h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-full text-brand-muted hover:bg-brand-surface hover:text-brand-text transition-all-custom"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-brand-muted">
                <ShoppingBag className="h-16 w-16 text-brand-border stroke-[1.5]" />
                <p className="font-medium text-sm">
                  {currentLocale === 'bn' ? 'আপনার কার্ট খালি রয়েছে 🌸' : 'Your cart is empty 🌸'}
                </p>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white px-4 py-2 rounded-full transition-all-custom"
                >
                  {currentLocale === 'bn' ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => {
                const activePrice = item.sale_price !== null ? item.sale_price : item.price;
                const name = currentLocale === 'bn' ? item.name_bn : item.name_en;

                return (
                  <div key={`${item.id}-${idx}`} className="flex gap-4 border-b border-brand-border pb-4 last:border-0 last:pb-0">
                    {/* Item Image */}
                    <div className="h-20 w-20 rounded-xl bg-brand-surface border border-brand-border overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={name} className="h-full w-full object-cover" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="font-bold text-brand-text text-sm line-clamp-1">{name}</h4>
                        {item.variant && (
                          <p className="text-[10px] text-brand-muted mt-0.5">
                            {item.variant.color_en && `${currentLocale === 'bn' ? item.variant.color_bn : item.variant.color_en}`}
                            {item.variant.size_en && ` / ${currentLocale === 'bn' ? item.variant.size_bn : item.variant.size_en}`}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Selector */}
                        <div className="flex items-center rounded-full border border-brand-border bg-brand-surface py-0.5 px-1.5 gap-2">
                          <button 
                            onClick={() => updateCartItemQty(item.id, item.qty - 1, item.variant ? `${item.variant.color_en || ''}-${item.variant.size_en || ''}` : '')}
                            className="p-1 text-brand-muted hover:text-brand-primary transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                          <button 
                            onClick={() => updateCartItemQty(item.id, item.qty + 1, item.variant ? `${item.variant.color_en || ''}-${item.variant.size_en || ''}` : '')}
                            className="p-1 text-brand-muted hover:text-brand-primary transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-sm text-brand-text">৳{activePrice * item.qty}</span>
                          <button 
                            onClick={() => removeFromCart(item.id, item.variant ? `${item.variant.color_en || ''}-${item.variant.size_en || ''}` : '')}
                            className="text-brand-muted hover:text-brand-secondary transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-brand-border bg-brand-surface space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-brand-muted">
                  {currentLocale === 'bn' ? 'মোট হিসাব' : 'Subtotal'}
                </span>
                <span className="text-xl font-black text-brand-text">৳{cartTotal}</span>
              </div>
              <p className="text-[10px] text-brand-muted leading-relaxed">
                {currentLocale === 'bn' 
                  ? '* শিপিং চার্জ ও অন্যান্য খরচ চেকআউটের সময় ডিস্ট্রিক্ট নির্বাচনের ভিত্তিতে হিসাব করা হবে।'
                  : '* Shipping charges and other taxes calculated at checkout based on BD district selection.'}
              </p>
              
              <button 
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-brand-primary text-white font-bold hover:bg-brand-primary-alt shadow-lg shadow-brand-primary/25 transition-all-custom"
              >
                <span>{currentLocale === 'bn' ? 'চেকআউট করুন' : 'Proceed to Checkout'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
