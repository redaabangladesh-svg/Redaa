'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name_en: string;
  name_bn: string;
  image: string;
  price: number;
  sale_price: number | null;
  qty: number;
  variant?: {
    color_en?: string;
    color_bn?: string;
    size_en?: string;
    size_bn?: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeFromCart: (itemId: string, variantKey?: string) => void;
  updateCartItemQty: (itemId: string, qty: number, variantKey?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Unique key for storage variant matching
const getVariantKey = (variant?: CartItem['variant']) => {
  if (!variant) return '';
  return `${variant.color_en || ''}-${variant.size_en || ''}`;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('bd_home_decor_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.error('Error parsing stored cart:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('bd_home_decor_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (newItem: Omit<CartItem, 'qty'>, qty: number = 1) => {
    setCartItems((prevItems) => {
      const variantKey = getVariantKey(newItem.variant);
      
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === newItem.id && getVariantKey(item.variant) === variantKey
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].qty += qty;
        return updatedItems;
      }

      // Add as new item
      return [...prevItems, { ...newItem, qty }];
    });
    
    // Automatically open the cart drawer when item is added
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string, variantKey?: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === itemId && (variantKey === undefined || getVariantKey(item.variant) === variantKey))
      )
    );
  };

  const updateCartItemQty = (itemId: string, qty: number, variantKey?: string) => {
    if (qty <= 0) {
      removeFromCart(itemId, variantKey);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId && (variantKey === undefined || getVariantKey(item.variant) === variantKey)
          ? { ...item, qty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  
  const cartTotal = cartItems.reduce((acc, item) => {
    const activePrice = item.sale_price !== null ? item.sale_price : item.price;
    return acc + activePrice * item.qty;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartItemQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
