'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { ShoppingCart, Zap, ArrowLeft, Plus, Minus, ShieldCheck, Truck, RefreshCw, PackageCheck, PackageX, Flame } from 'lucide-react';
import Link from 'next/link';
import type { HomeProduct } from '@/lib/products';
import { fetchProducts, fetchProductDetail, type ProductDetail } from '@/lib/products-db';
import ProductCard from '@/components/store/ProductCard';

interface SizeOption { en: string; bn: string; price: number; sale_price: number | null; }

const WHATSAPP_NUMBER = '8801788825495';

export default function ProductViewPage({ params }: { params: { id: string } }) {
  const locale = useLocale();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [otherProducts, setOtherProducts] = useState<HomeProduct[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductDetail(params.id).then((detail) => {
      setProduct(detail);
      setActiveImage(0);
      setQuantity(1);

      if (detail) {
        const sizes: SizeOption[] = detail.variants.length > 0
          ? detail.variants.map((v) => ({
              en: v.size_en || '',
              bn: v.size_bn || v.size_en || '',
              price: v.price ?? detail.price,
              sale_price: v.sale_price !== undefined ? v.sale_price : detail.sale_price,
            }))
          : [];
        setSelectedSize(sizes.length > 0 ? sizes[0] : null);

        fetchProducts().then((all) => {
          setOtherProducts(all.filter((p) => p.id !== detail.id).slice(0, 3));
        });
      } else {
        setSelectedSize(null);
      }
    });
  }, [params.id]);

  if (!product) {
    return (
      <div className="py-20 text-center text-brand-muted font-bold">
        {locale === 'bn' ? 'লোড হচ্ছে...' : 'Loading product details...'}
      </div>
    );
  }

  const sizeOptions: SizeOption[] | undefined = product.variants.length > 0
    ? product.variants.map((v) => ({
        en: v.size_en || '',
        bn: v.size_bn || v.size_en || '',
        price: v.price ?? product.price,
        sale_price: v.sale_price !== undefined ? v.sale_price : product.sale_price,
      }))
    : undefined;

  const nameLabel = locale === 'bn' ? product.name_bn : product.name_en;
  const shortDesc = (locale === 'bn' ? product.short_description_bn : product.short_description_en) || nameLabel;
  const fullDesc = (locale === 'bn' ? product.description_bn : product.description_en) || nameLabel;
  const stockCount = product.stock;
  const price = selectedSize ? selectedSize.price : product.price;
  const salePrice = selectedSize ? selectedSize.sale_price : product.sale_price;
  const activePrice = salePrice ?? price;

  const buildCartItem = () => ({
    id: product.id,
    name_en: product.name_en,
    name_bn: product.name_bn,
    image: product.images[0],
    price,
    sale_price: salePrice,
    variant: {
      size_en: selectedSize?.en,
      size_bn: selectedSize?.bn,
    },
  });

  const handleAddToCart = () => addToCart(buildCartItem(), quantity);

  const handleDirectOrder = () => {
    addToCart(buildCartItem(), quantity, false);
    router.push(`/${locale}/checkout`);
  };

  const whatsappMessage = locale === 'bn'
    ? `আসসালামুয়ালাইকুম, আমি "${nameLabel}" (${selectedSize ? (locale === 'bn' ? selectedSize.bn : selectedSize.en) : ''}) প্রোডাক্টটি অর্ডার করতে চাই। দাম: ৳${activePrice}`
    : `Hi, I'd like to order "${nameLabel}" (${selectedSize?.en ?? ''}). Price: ৳${activePrice}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="space-y-10 pb-16 px-4 sm:px-0">
      {/* Back Link */}
      <Link
        href={`/${locale}/shop`}
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-muted hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{locale === 'bn' ? 'শপে ফিরে যান' : 'Back to Shop'}</span>
      </Link>

      {/* Grid: Gallery and Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-brand-surface border border-brand-border">
            <img src={product.images[activeImage]} alt={nameLabel} className="h-full w-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2.5">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === i ? 'border-brand-primary' : 'border-brand-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div className="space-y-2">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-brand-text leading-tight">
              {nameLabel}
            </h1>
            <p className="text-xs md:text-sm text-brand-muted leading-relaxed">{shortDesc}</p>
          </div>

          {/* Price + Stock — single row, no empty space */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-brand-secondary/5 to-brand-surface border border-brand-secondary/15 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-bold text-brand-secondary">৳{activePrice}</span>
              {salePrice !== null && (
                <span className="text-sm text-brand-muted line-through">৳{price}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {salePrice !== null && (
                <span className="px-2 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary text-[10px] font-bold">
                  {Math.round(((price - salePrice) / price) * 100)}% {locale === 'bn' ? 'ছাড়' : 'OFF'}
                </span>
              )}
              {stockCount === 0 ? (
                <span className="flex items-center gap-1 text-xs font-bold text-brand-muted whitespace-nowrap">
                  <PackageX className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.75} />
                  {locale === 'bn' ? 'স্টকে নেই' : 'Out of Stock'}
                </span>
              ) : stockCount <= 5 ? (
                <span className="flex items-center gap-1 text-xs font-bold text-brand-primary whitespace-nowrap">
                  <Flame className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.75} />
                  {locale === 'bn' ? `${stockCount}টি বাকি` : `${stockCount} left`}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-brand-primary whitespace-nowrap">
                  <PackageCheck className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.75} />
                  {locale === 'bn' ? 'স্টকে আছে' : 'In Stock'}
                </span>
              )}
            </div>
          </div>

          {/* Size selector */}
          {sizeOptions && sizeOptions.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-muted">{locale === 'bn' ? 'সাইজ (দাম পরিবর্তন হবে):' : 'Size (price varies):'}</span>
              <div className="flex gap-2 flex-wrap">
                {sizeOptions.map((size) => (
                  <button
                    key={size.en}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all duration-150 ${
                      selectedSize?.en === size.en
                        ? 'bg-brand-primary border-brand-primary text-white'
                        : 'bg-white border-brand-border text-brand-text hover:border-brand-primary/40'
                    }`}
                  >
                    {locale === 'bn' ? size.bn : size.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-between rounded-lg border border-brand-border bg-white px-1 py-2.5 w-24 flex-shrink-0">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-1 text-brand-muted hover:text-brand-primary transition-colors">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="font-bold text-sm text-brand-text">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="p-1 text-brand-muted hover:text-brand-primary transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={stockCount === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-lg bg-gradient-to-br from-brand-primary to-brand-primary-alt text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-lg hover:shadow-brand-primary/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4" strokeWidth={1.75} />
              <span>{locale === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
            </button>
          </div>

          {/* Two CTA buttons: Direct Order + WhatsApp */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDirectOrder}
              disabled={stockCount === 0}
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-lg bg-gradient-to-br from-brand-secondary to-brand-secondary-dark text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-lg hover:shadow-brand-secondary/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="h-4 w-4" strokeWidth={1.75} />
              <span>{locale === 'bn' ? 'সরাসরি অর্ডার করুন' : 'Order Now'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-lg bg-[#25D366] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-lg hover:shadow-[#25D366]/30 transition-all duration-200"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              <span>{locale === 'bn' ? 'হোয়াটসঅ্যাপে অর্ডার' : 'Order via WhatsApp'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Trust strip — single line */}
      <div className="flex items-center justify-between gap-2 py-4 px-2 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto">
        <div className="flex items-center gap-2 flex-1 justify-center">
          <ShieldCheck className="h-4 w-4 text-brand-primary flex-shrink-0" strokeWidth={1.75} />
          <span className="text-[10px] sm:text-xs font-bold text-brand-text whitespace-nowrap">
            {locale === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
          </span>
        </div>
        <div className="h-6 w-px bg-brand-border flex-shrink-0" />
        <div className="flex items-center gap-2 flex-1 justify-center">
          <Truck className="h-4 w-4 text-brand-primary flex-shrink-0" strokeWidth={1.75} />
          <span className="text-[10px] sm:text-xs font-bold text-brand-text whitespace-nowrap">
            {locale === 'bn' ? 'দ্রুত ডেলিভারি' : 'Fast Delivery'}
          </span>
        </div>
        <div className="h-6 w-px bg-brand-border flex-shrink-0" />
        <div className="flex items-center gap-2 flex-1 justify-center">
          <RefreshCw className="h-4 w-4 text-brand-primary flex-shrink-0" strokeWidth={1.75} />
          <span className="text-[10px] sm:text-xs font-bold text-brand-text whitespace-nowrap">
            {locale === 'bn' ? 'সহজ রিটার্ন' : 'Easy Return'}
          </span>
        </div>
      </div>

      {/* Detailed Description */}
      <div className="space-y-2 pt-2">
        <h3 className="font-serif font-semibold text-base text-brand-text">
          {locale === 'bn' ? 'বিস্তারিত বিবরণ' : 'Detailed Description'}
        </h3>
        <p className="whitespace-pre-line text-xs md:text-sm text-brand-muted leading-relaxed">{fullDesc}</p>
      </div>

      {/* Suggested Products (same card style as homepage) */}
      {otherProducts.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-brand-border">
          <h3 className="font-serif font-semibold text-base text-brand-text">
            {locale === 'bn' ? 'আরও প্রোডাক্ট' : 'Other Products'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {otherProducts.map((p) => (
              <ProductCard key={p.id} p={p} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
