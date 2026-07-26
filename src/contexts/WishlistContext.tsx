import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { fetchWishlist, addToWishlistDb, removeFromWishlistDb } from '../services/wishlist';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadWishlist();
  }, [user?.id]);

  const loadWishlist = async () => {
    if (user?.id) {
      try {
        const data = await fetchWishlist(user.id);
        setWishlist(data || []);
      } catch {
        loadFromLocal();
      }
    } else {
      loadFromLocal();
    }
    setIsLoading(false);
  };

  const loadFromLocal = () => {
    try {
      const saved = localStorage.getItem('riman_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      }
    } catch {
      localStorage.removeItem('riman_wishlist');
    }
  };

  const saveToLocal = (items: Product[]) => {
    localStorage.setItem('riman_wishlist', JSON.stringify(items));
  };

  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      const updated = [...prev, product];
      saveToLocal(updated);
      return updated;
    });

    if (user?.id) {
      addToWishlistDb(user.id, product.id).catch(() => {});
    }
  };

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveToLocal(updated);
      return updated;
    });

    if (user?.id) {
      removeFromWishlistDb(user.id, id).catch(() => {});
    }
  };

  const isInWishlist = (id: string) => wishlist.some(p => p.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}