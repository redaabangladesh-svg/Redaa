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
  category: 'flower-tub' | 'tree-plant' | 'wall-stand';
  rating: number;
  reviews: number;
}

export const PRODUCTS: HomeProduct[] = [
  { 
    id: '1', 
    name_en: 'Premium Quality Bird Nest', 
    name_bn: 'প্রিমিয়াম কোয়ালিটি বার্ড নেস্ট', 
    price: 1250, 
    sale_price: 990, 
    image: '/02.09.23.jpg', 
    discount: '-21%', 
    sizes: ['12"', '18"', '24"'], 
    stock: 8,
    category: 'wall-stand',
    rating: 4.8,
    reviews: 24
  },
  { 
    id: '2', 
    name_en: 'Premium Orchid Bouquet', 
    name_bn: 'ঘর সাজান আভিজাত্যে – প্রিমিয়াম অর্কিড!', 
    price: 850, 
    sale_price: null, 
    image: '/37-5.jpg', 
    discount: null, 
    sizes: ['14"'], 
    stock: 20,
    category: 'flower-tub',
    rating: 4.9,
    reviews: 18
  },
  { 
    id: '3', 
    name_en: 'Premium Areca Palm', 
    name_bn: 'প্রিমিয়াম এরিকা পাম, বড় কাঠের টব সহ!', 
    price: 1500, 
    sale_price: 1200, 
    image: '/38-7.jpg', 
    discount: '-20%', 
    sizes: ['12"', '16"', '20"'], 
    stock: 4,
    category: 'wall-stand',
    rating: 4.7,
    reviews: 32
  },
  { 
    id: '5', 
    name_en: 'Premium Orchid in Ceramic Pot', 
    name_bn: 'সিরামিক টবে প্রিমিয়াম অর্কিড – ঘরের আভিজাত্য!', 
    price: 920, 
    sale_price: 750, 
    image: '/47-3.jpg', 
    discount: '-18%', 
    sizes: ['8"', '10"'], 
    stock: 3,
    category: 'flower-tub',
    rating: 4.6,
    reviews: 14
  },
  { 
    id: '6', 
    name_en: 'Macrame Wall Hanging', 
    name_bn: 'ম্যাক্রামে ওয়াল হ্যাঙ্গিং', 
    price: 1100, 
    sale_price: null, 
    image: '/49.jpg', 
    discount: null, 
    sizes: ['24"', '30"', '36"'], 
    stock: 5,
    category: 'wall-stand',
    rating: 4.8,
    reviews: 21
  },
  { 
    id: '7', 
    name_en: 'Premium Metal Flower Stand', 
    name_bn: 'প্রিমিয়াম মেটাল ফ্লাওয়ার স্ট্যান্ড', 
    price: 1550, 
    sale_price: 1390, 
    image: '/51-2.jpg', 
    discount: '-10%', 
    sizes: ['24"', '36"'], 
    stock: 15,
    category: 'wall-stand',
    rating: 4.9,
    reviews: 15
  },
  { 
    id: '8', 
    name_en: 'Pastel Rose Bouquet', 
    name_bn: 'পেস্টেল গোলাপ তোড়া', 
    price: 950, 
    sale_price: 850, 
    image: '/55-3.jpg', 
    discount: '-10%', 
    sizes: ['16"'], 
    stock: 12,
    category: 'flower-tub',
    rating: 4.7,
    reviews: 28
  },
  { 
    id: '9', 
    name_en: 'Handcrafted Mahogany Frame', 
    name_bn: 'হ্যান্ডক্রাফটেড মেহগনি ফ্রেম', 
    price: 1800, 
    sale_price: 1490, 
    image: '/38-7.jpg', 
    discount: '-17%', 
    sizes: ['14"', '18"'], 
    stock: 9,
    category: 'wall-stand',
    rating: 4.8,
    reviews: 19
  },
  { 
    id: '10', 
    name_en: 'Modern Glass Vase', 
    name_bn: 'মডার্ন গ্লাস ভেজ', 
    price: 1150, 
    sale_price: 990, 
    image: '/47-3.jpg', 
    discount: '-14%', 
    sizes: ['10"'], 
    stock: 6,
    category: 'flower-tub',
    rating: 4.5,
    reviews: 11
  },
  { 
    id: '11', 
    name_en: 'Hanging Macrame Shelf', 
    name_bn: 'ঝুলন্ত ম্যাক্রামে শেলফ', 
    price: 1350, 
    sale_price: null, 
    image: '/49.jpg', 
    discount: null, 
    sizes: ['18"'], 
    stock: 7,
    category: 'wall-stand',
    rating: 4.7,
    reviews: 13
  },
  { 
    id: '12', 
    name_en: 'Premium Tree Plant Tub', 
    name_bn: 'প্রিমিয়াম ট্রি প্ল্যান্ট টাব', 
    price: 2200, 
    sale_price: 1890, 
    image: '/37-5.jpg', 
    discount: '-14%', 
    sizes: ['20"', '24"'], 
    stock: 5,
    category: 'tree-plant',
    rating: 4.9,
    reviews: 22
  },
  { 
    id: '13', 
    name_en: 'Green Fern Plant', 
    name_bn: 'সবুজ ফার্ন প্ল্যান্ট', 
    price: 1200, 
    sale_price: 990, 
    image: '/55-3.jpg', 
    discount: '-17%', 
    sizes: ['Small', 'Medium'], 
    stock: 14,
    category: 'tree-plant',
    rating: 4.6,
    reviews: 17
  }
];
