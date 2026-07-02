export interface HomeProduct {
  id: string;
  name_en: string;
  name_bn: string;
  price: number;
  sale_price: number | null;
  image: string;
  discount: string | null;
  sizes: string[];
  stock: number;
}

export const PRODUCTS: HomeProduct[] = [
  { id: '1', name_en: 'Premium Metal Flower Hanger', name_bn: 'প্রিমিয়াম মেটাল ফ্লাওয়ার হ্যাঙ্গার', price: 1250, sale_price: 990, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=500', discount: '-21%', sizes: ['12"', '18"', '24"'], stock: 8 },
  { id: '2', name_en: 'Pastel Tulip Bouquet', name_bn: 'পেস্টেল টিউলিপ তোড়া', price: 850, sale_price: null, image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=500', discount: null, sizes: ['14"'], stock: 20 },
  { id: '3', name_en: 'Vintage Wooden Wall Frame', name_bn: 'ভিন্টেজ কাঠের ওয়াল ফ্রেম', price: 1500, sale_price: 1200, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=500', discount: '-20%', sizes: ['12"', '16"', '20"'], stock: 4 },
  { id: '4', name_en: 'Rose Gold Candle Set', name_bn: 'রোজ গোল্ড ক্যান্ডেল সেট', price: 680, sale_price: 540, image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=500', discount: '-21%', sizes: ['6"'], stock: 12 },
  { id: '5', name_en: 'Ceramic Flower Vase', name_bn: 'সিরামিক ফ্লাওয়ার ভেজ', price: 920, sale_price: 750, image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=500', discount: '-18%', sizes: ['8"', '10"'], stock: 3 },
  { id: '6', name_en: 'Macrame Wall Hanging', name_bn: 'ম্যাক্রামে ওয়াল হ্যাঙ্গিং', price: 1100, sale_price: null, image: 'https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?auto=format&fit=crop&q=80&w=500', discount: null, sizes: ['24"', '30"', '36"'], stock: 0 },
];
