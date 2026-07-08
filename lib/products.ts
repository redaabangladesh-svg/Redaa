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
  category: string;
  lowStockThreshold?: number;
  rating: number;
  reviews: number;
}
