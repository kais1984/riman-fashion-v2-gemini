import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import {
  addItemToCart,
  removeItemFromCart,
  updateQuantityInCart,
  calculateSubtotal,
  calculateTotalItems,
  type CartItem,
} from '../lib/cart';
import { analytics } from '../services/analytics';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, intent: 'sale' | 'rent', size?: string, date?: Date) => void;
  removeItem: (id: string, size?: string, intent?: 'sale' | 'rent') => void;
  updateQuantity: (id: string, qty: number, size?: string, intent?: 'sale' | 'rent') => void;
  subtotal: number;
  totalItems: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('riman_cart');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      localStorage.removeItem('riman_cart');
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('riman_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, intent: 'sale' | 'rent', size?: string, date?: Date) => {
    setItems(prev => {
      const next = addItemToCart(prev, product, intent, size, date);
      analytics.addToCart({
        id: product.id,
        name: product.name,
        price: intent === 'rent' ? product.rentalPrice : product.salePrice,
        intent,
      });
      return next;
    });
  };

  const removeItem = (id: string, size?: string, intent?: 'sale' | 'rent') => {
    setItems(prev => removeItemFromCart(prev, id, size, intent));
    analytics.removeFromCart(id);
  };

  const updateQuantity = (id: string, quantity: number, size?: string, intent?: 'sale' | 'rent') => {
    setItems(prev => updateQuantityInCart(prev, id, quantity, size, intent));
  };

  const clearCart = () => setItems([]);

  const subtotal = calculateSubtotal(items);
  const totalItems = calculateTotalItems(items);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, subtotal, totalItems, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
