'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { ShoppingCart, Zap, ArrowLeft, Plus, Minus, ShieldCheck, Truck, RefreshCw, PackageCheck, PackageX, Flame } from 'lucide-react';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/products';
import ProductCard from '@/components/store/ProductCard';

interface SizeOption { en: string; bn: string; price: number; sale_price: number | null; }

interface Product {
  id: string;
  name_en: string;
  name_bn: string;
  price: number;
  sale_price: number | null;
  images: string[];
  category: string;
  short_desc_en: string;
  short_desc_bn: string;
  desc_en: string;
  desc_bn: string;
  sizes?: SizeOption[];
  stock?: number;
}

const mockDescriptions: Record<string, { desc_en: string; desc_bn: string; short_en: string; short_bn: string }> = {
  '1': {
    desc_en: 'Enhance your wall aesthetics with this handcrafted premium metal flower hanger. Sourced from high-grade anti-rust painted iron.',
    desc_bn: 'আপনার দেয়ালের সৌন্দর্য বাড়াতে আমাদের হাতে তৈরি এই প্রিমিয়াম মেটাল ফ্লাওয়ার হ্যাঙ্গারটি অনন্য। মরিচা-প্রতিরোধক পেইন্ট করা উচ্চ মানের লোহা দ্বারা তৈরি।',
    short_en: 'Handcrafted anti-rust metal hanger with a modern geometric silhouette.',
    short_bn: 'হাতে তৈরি মরিচা-প্রতিরোধক মেটাল হ্যাঙ্গার, আধুনিক জ্যামিতিক ডিজাইনে।'
  },
  '2': {
    desc_en: 'Beautifully wrapped handcrafted pastel paper tulips. Perfect for dining tables, study desks, or gifting on special occasions.',
    desc_bn: 'চমৎকারভাবে মোড়ানো হাতে তৈরি পেস্টেল কাগজের টিউলিপের তোড়া। ডাইনিং টেবিল, স্টাডি ডেস্ক বা বিশেষ অনুষ্ঠানে উপহার দেয়ার জন্য আদর্শ।',
    short_en: 'Handcrafted pastel paper tulips, perfect for tables and gifting.',
    short_bn: 'হাতে তৈরি পেস্টেল কাগজের টিউলিপ, টেবিল সাজানো ও উপহারের জন্য উপযুক্ত।'
  },
  '3': {
    desc_en: 'Hand-polished solid mahogany wood frames carrying preserved dry flowers. Gives an organic vintage country look to any home interior decoration.',
    desc_bn: 'প্রাকৃতিক শুকানো ফুল ধরে রাখা হাতে পালিশ করা সলিড মেহগনি কাঠের তৈরি ফ্রেম। যেকোনো বাড়ির ঘরের ভেতরে চমৎকার ভিন্টেজ লুক এনে দেয়।',
    short_en: 'Solid mahogany frame with preserved dry flowers, vintage country look.',
    short_bn: 'সলিড মেহগনি ফ্রেমে শুকানো ফুল, ভিন্টেজ কান্ট্রি লুক।'
  },
  '5': {
    desc_en: 'Premium ceramic vase with minimal modern lines, ideal for showing off fresh or dry floral bouquets.',
    desc_bn: 'আধুনিক ডিজাইনের মিনিমাল সিরামিক ফুলদানি, যা ফুলের তোড়া সাজিয়ে রাখার জন্য আদর্শ।',
    short_en: 'Premium ceramic vase with minimal modern lines.',
    short_bn: 'আধুনিক ডিজাইনের মিনিমাল সিরামিক ফুলদানি।'
  },
  '6': {
    desc_en: 'Boho style macrame wall hanging handcrafted with 100% natural cotton cord on driftwood.',
    desc_bn: '১০০% প্রাকৃতিক সুতি সুতা দিয়ে তৈরি বোহো স্টাইলের ম্যাক্রামে দেয়াল সজ্জা শোপিস।',
    short_en: 'Boho style macrame wall hanging handcrafted with 100% natural cotton cord.',
    short_bn: '১০০% প্রাকৃতিক সুতি সুতা দিয়ে তৈরি বোহো স্টাইলের ম্যাক্রামে দেয়াল সজ্জা।'
  },
  '7': {
    desc_en: 'Double decker anti-rust metal plant stand for organizing multiple tubs.',
    desc_bn: 'মরিচা-প্রতিরোধক মেটাল ডাবল ডেকার প্ল্যান্ট স্ট্যান্ড, যা একসাথে কয়েকটি টব রাখার জন্য চমৎকার।',
    short_en: 'Double decker anti-rust metal plant stand.',
    short_bn: 'মরিচা-প্রতিরোধক মেটাল ডাবল ডেকার প্ল্যান্ট স্ট্যান্ড।'
  },
  '8': {
    desc_en: 'Gorgeous handcrafted pastel roses bundle with premium gift wrapping sheets.',
    desc_bn: 'হাতে তৈরি আকর্ষণীয় পেস্টেল গোলাপের তোড়া, বিশেষ গিফট র‍্যাপিং পেপার সহ মোড়ানো।',
    short_en: 'Gorgeous handcrafted pastel roses bundle.',
    short_bn: 'হাতে তৈরি আকর্ষণীয় পেস্টেল গোলাপের তোড়া।'
  },
  '9': {
    desc_en: 'Luxury mahogany wooden frame with glass front and dried botanicals detail.',
    desc_bn: 'আকর্ষণীয় মেহগনি কাঠের শৌখিন ফ্রেম, সামনের কাচ ও ভেতর সুরক্ষিত প্রাকৃতিক শুকনো ফুল সহ।',
    short_en: 'Luxury mahogany wooden frame with dried botanicals.',
    short_bn: 'আকর্ষণীয় মেহগনি কাঠের শৌখিন ফ্রেম।'
  },
  '10': {
    desc_en: 'Premium Magnolia plant in ceramic pot, perfect for home and workspace.',
    desc_bn: 'সিরামিক টবে প্রিমিয়াম ম্যাগনোলিয়া গাছ, বাসা ও অফিসের অভ্যন্তরীণ সাজসজ্জায় প্রাণবন্ত লুক এনে দেবে।',
    short_en: 'Premium Magnolia plant in ceramic pot.',
    short_bn: 'সিরামিক টবে প্রিমিয়াম ম্যাগনোলিয়া গাছ।'
  },
  '11': {
    desc_en: 'Modern design A-Frame wood wall shelf with beautiful artificial greenery.',
    desc_bn: 'আধুনিক ডিজাইনের এ-ফ্রেম কাঠের দেয়াল তাক ও চমৎকার কৃত্রিম লতাপাতা কম্বো।',
    short_en: 'Modern design A-Frame wood wall shelf.',
    short_bn: 'আধুনিক ডিজাইনের এ-ফ্রেম কাঠের দেয়াল তাক।'
  },
  '12': {
    desc_en: 'Premium geometric ceramic plant pot, extremely stylish and suitable for large plants.',
    desc_bn: 'আকর্ষণীয় জ্যামিতিক সিরামিক টব, যা আপনার ঘরের বড় বড় ইনডোর গাছের জন্য দারুণ মানানসই।',
    short_en: 'Premium geometric ceramic plant pot, extremely stylish.',
    short_bn: 'আকর্ষণীয় জ্যামিতিক সিরামিক টব।'
  },
  '13': {
    desc_en: 'Lush green artificial fern plant in simple white pot, maintenance free.',
    desc_bn: 'আকর্ষণীয় চিরসবুজ কৃত্রিম ফার্ন গাছ ও সাদা টব, যা পানি বা রোদের কোনো ঝামেলা ছাড়াই সতেজ দেখাবে।',
    short_en: 'Lush green artificial fern plant in simple white pot.',
    short_bn: 'আকর্ষণীয় চিরসবুজ কৃত্রিম ফার্ন গাছ ও সাদা টব।'
  }
};

const mockProducts: Record<string, Product> = {};
PRODUCTS.forEach((p) => {
  const meta = mockDescriptions[p.id] || {
    desc_en: p.name_en,
    desc_bn: p.name_bn,
    short_en: p.name_en,
    short_bn: p.name_bn
  };
  
  mockProducts[p.id] = {
    id: p.id,
    name_en: p.name_en,
    name_bn: p.name_bn,
    price: p.price,
    sale_price: p.sale_price,
    images: p.id === '12' ? ['/banana-tree.jpg', '/banana-tree-1.jpg', '/banana-tree-2.jpg', '/banana-tree-trans.png'] : [p.image],
    category: p.category,
    short_desc_en: meta.short_en,
    short_desc_bn: meta.short_bn,
    desc_en: meta.desc_en,
    desc_bn: meta.desc_bn,
    sizes: p.sizes ? p.sizes.map((s: string) => {
      const sizeLower = s.toLowerCase();
      let pAdd = 0;
      if (sizeLower.includes('18') || sizeLower.includes('medium') || sizeLower.includes('16')) {
        pAdd = 300;
      } else if (sizeLower.includes('24') || sizeLower.includes('large') || sizeLower.includes('20')) {
        pAdd = 600;
      }
      return {
        en: s,
        bn: s.replace('inch', 'ইঞ্চি').replace('"', ' ইঞ্চি'),
        price: p.price + pAdd,
        sale_price: p.sale_price !== null ? p.sale_price + pAdd : null
      };
    }) : undefined,
    stock: p.stock !== undefined ? p.stock : 10
  };
});

const WHATSAPP_NUMBER = '8801700000000';

export default function ProductViewPage({ params }: { params: { id: string } }) {
  const locale = useLocale();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const stored = localStorage.getItem('sicily_products_list');
    let loadedProducts: Record<string, Product> = {};

    if (stored) {
      try {
        const list: any[] = JSON.parse(stored);
        list.forEach((p) => {
          loadedProducts[p.id] = {
            id: p.id,
            name_en: p.name_en,
            name_bn: p.name_bn,
            price: p.price,
            sale_price: p.sale_price,
            images: p.images || [p.image || '/02.09.23.jpg'],
            category: p.category,
            short_desc_en: p.short_desc_en || p.name_en,
            short_desc_bn: p.short_desc_bn || p.name_bn,
            desc_en: p.desc_en || p.name_en,
            desc_bn: p.desc_bn || p.name_bn,
            sizes: p.sizes,
            stock: p.stock !== undefined ? p.stock : 10
          };
        });
      } catch (e) {
        console.error(e);
      }
    }

    const slugify = (text: string) => {
      return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    };

    const merged = { ...mockProducts, ...loadedProducts };
    const mergedList = Object.values(merged);
    const slugLower = params.id.toLowerCase();
    
    const matched = mergedList.find(p => {
      const imageFilename = p.images[0]?.split('/').pop()?.toLowerCase() || '';
      const imageBasename = imageFilename.split('.')[0] || '';
      
      const matchesId = p.id === params.id;
      const matchesNameSlugEn = slugify(p.name_en) === slugLower;
      const matchesNameSlugBn = slugify(p.name_bn) === slugLower;
      const matchesImageFilename = imageFilename === slugLower || imageFilename.includes(slugLower);
      const matchesImageBasename = imageBasename === slugLower || imageBasename.includes(slugLower);
      const matchesNameSubEn = p.name_en.toLowerCase().includes(slugLower);
      const matchesNameSubBn = p.name_bn.toLowerCase().includes(slugLower);
      
      const matchesBannaSpecial = (slugLower === 'banna' || slugLower === 'banna.jpg') && (p.id === '12' || imageFilename.includes('banana'));

      return (
        matchesId ||
        matchesNameSlugEn ||
        matchesNameSlugBn ||
        matchesImageFilename ||
        matchesImageBasename ||
        matchesBannaSpecial ||
        matchesNameSubEn ||
        matchesNameSubBn
      );
    }) || merged['1'];
    
    setProduct(matched);
    setActiveImage(0);
    if (matched) {
      if (matched.sizes && matched.sizes.length > 0) {
        setSelectedSize(matched.sizes[0]);
      } else {
        setSelectedSize(null);
      }
    }
  }, [params.id]);

  if (!product) {
    return (
      <div className="py-20 text-center text-brand-muted font-bold">
        {locale === 'bn' ? 'লোড হচ্ছে...' : 'Loading product details...'}
      </div>
    );
  }

  const price = selectedSize ? selectedSize.price : product.price;
  const salePrice = selectedSize ? selectedSize.sale_price : product.sale_price;
  const activePrice = salePrice ?? price;
  const nameLabel = locale === 'bn' ? product.name_bn : product.name_en;
  const shortDesc = locale === 'bn' ? product.short_desc_bn : product.short_desc_en;
  const fullDesc = locale === 'bn' ? product.desc_bn : product.desc_en;
  const stockCount = product.stock !== undefined ? product.stock : 5;

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
    addToCart(buildCartItem(), quantity);
    router.push(`/${locale}/checkout`);
  };

  const whatsappMessage = locale === 'bn'
    ? `আসসালামুয়ালাইকুম, আমি "${nameLabel}" (${selectedSize ? (locale === 'bn' ? selectedSize.bn : selectedSize.en) : ''}) প্রোডাক্টটি অর্ডার করতে চাই। দাম: ৳${activePrice}`
    : `Hi, I'd like to order "${nameLabel}" (${selectedSize?.en ?? ''}). Price: ৳${activePrice}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  const otherProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

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
          {product.sizes && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-muted">{locale === 'bn' ? 'সাইজ (দাম পরিবর্তন হবে):' : 'Size (price varies):'}</span>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
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
