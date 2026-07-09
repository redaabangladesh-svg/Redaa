'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export interface WishlistItem {
  id: string;
  name_en: string;
  name_bn: string;
  image: string;
  price: number;
  sale_price: number | null;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  const loadFromDb = async (custId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('wishlist_items')
      .select('product_id, products(id, name_en, name_bn, images, price, sale_price)')
      .eq('customer_id', custId);

    if (data) {
      const items: WishlistItem[] = data
        .filter((row: any) => row.products)
        .map((row: any) => ({
          id: row.products.id,
          name_en: row.products.name_en,
          name_bn: row.products.name_bn,
          image: row.products.images?.[0] || '/logo.svg',
          price: row.products.price,
          sale_price: row.products.sale_price,
        }));
      setWishlistItems(items);
    }
    setIsLoaded(true);
  };

  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem('redaa_wishlist');
    if (stored) {
      try {
        setWishlistItems(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored wishlist:', e);
      }
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        if (customer) {
          setCustomerId(customer.id);
          await loadFromDb(customer.id);
          return;
        }
      }
      loadFromLocalStorage();
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setCustomerId(null);
        loadFromLocalStorage();
      }
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guests: persist to localStorage whenever the list changes
  useEffect(() => {
    if (isLoaded && !customerId) {
      localStorage.setItem('redaa_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoaded, customerId]);

  const isWishlisted = (id: string) => wishlistItems.some((item) => item.id === id);

  const toggleWishlist = async (item: WishlistItem) => {
    const alreadyIn = wishlistItems.some((i) => i.id === item.id);

    if (customerId) {
      const supabase = createClient();
      if (alreadyIn) {
        await supabase.from('wishlist_items').delete().eq('customer_id', customerId).eq('product_id', item.id);
      } else {
        await supabase.from('wishlist_items').insert({ customer_id: customerId, product_id: item.id });
      }
    }

    setWishlistItems((prev) =>
      alreadyIn ? prev.filter((i) => i.id !== item.id) : [...prev, item]
    );
  };

  const removeFromWishlist = async (id: string) => {
    if (customerId) {
      const supabase = createClient();
      await supabase.from('wishlist_items').delete().eq('customer_id', customerId).eq('product_id', id);
    }
    setWishlistItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
