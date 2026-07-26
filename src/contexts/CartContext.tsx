import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';

const MAX_QUANTITY = 10;

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedDate?: string;
  intent: 'sale' | 'rent';
}

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
      const existingIndex = prev.findIndex(item => 
        item.id === product.id && item.selectedSize === size && item.intent === intent
      );

      if (existingIndex > -1) {
        const newItems = [...prev];
        const newQty = newItems[existingIndex].quantity + 1;
        if (newQty > MAX_QUANTITY) return prev;
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newQty
        };
        return newItems;
      }

      return [...prev, { 
        ...product, 
        quantity: 1, 
        selectedSize: size, 
        intent,
        selectedDate: date ? date.toISOString() : undefined 
      }];
    });
  };

  const removeItem = (id: string, size?: string, intent?: 'sale' | 'rent') => {
    setItems(prev => prev.filter(item => !(item.id === id && item.selectedSize === size && item.intent === intent)));
  };

  const updateQuantity = (id: string, quantity: number, size?: string, intent?: 'sale' | 'rent') => {
    if (quantity > MAX_QUANTITY) return;
    setItems(prev => prev.map(item => 
      (item.id === id && item.selectedSize === size && item.intent === intent) 
        ? { ...item, quantity: Math.max(1, quantity) } 
        : item
    ));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => {
    const price = item.intent === 'rent' ? (item.rentalPrice || 0) : (item.salePrice || 0);
    return sum + price * item.quantity;
  }, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, subtotal, totalItems, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};