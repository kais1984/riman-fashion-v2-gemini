import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts } from '../data/products';
import { Product } from '../types';
import { isSupabaseConfigured } from '../services/supabase';
import { fetchProducts } from '../services/products';

interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    bgImage: string;
  };
  about: {
    title: string;
    description: string;
  };
  quote: string;
}

interface DataContextType {
  products: Product[];
  content: SiteContent;
  updateProducts: (products: Product[]) => void;
  updateContent: (content: Partial<SiteContent>) => void;
  resetData: () => void;
  isLoading: boolean;
  addProduct: (product: Product) => Promise<Product>;
  editProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
}

const defaultContent: SiteContent = {
  hero: {
    title: "Reverie & Essence",
    subtitle: "Sharjah's Most Majestic Couture",
    cta: "Request A Private Viewing",
    bgImage: "https://images.unsplash.com/photo-1594553423282-55ad0c034431?auto=format&fit=crop&w=2000&q=80",
  },
  about: {
    title: "The Riman Legacy",
    description: "Founded in the vibrant cultural landscape of Sharjah, Riman Fashion was born from a passion for preserving traditional artistry while embracing contemporary design. Our atelier is the zenith of luxury, where every thread is woven with royal intent.",
  },
  quote: "In the heart of Sharjah, we weave dreams into silk. Every thread is a testament to the heritage we preserve and the majestic future we envision.",
};

const DataContext = createContext<DataContextType | undefined>(undefined);

function safeParse<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    localStorage.removeItem(key);
  }
  return fallback;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => safeParse('riman_dynamic_products', initialProducts));
  const [content, setContent] = useState<SiteContent>(() => safeParse('riman_dynamic_site_content', defaultContent));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      loadFromSupabase();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadFromSupabase = async () => {
    const timeout = setTimeout(() => setIsLoading(false), 10000);

    try {
      const data = await fetchProducts();
      if (data && data.length > 0) {
        setProducts(data);
      }
    } catch {
      // Fallback to local data already in state
    }

    // Load site content
    try {
      const { fetchSiteContent } = await import('../services/siteContent');
      const remote = await fetchSiteContent();
      if (remote.hero || remote.about) {
        setContent(prev => ({
          hero: remote.hero || prev.hero,
          about: remote.about || prev.about,
          quote: remote.quote || prev.quote,
        }));
      }
    } catch {
      // Fallback to local content already in state
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('riman_dynamic_products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('riman_dynamic_site_content', JSON.stringify(content));
    }
  }, [content]);

  const updateProducts = (newProducts: Product[]) => setProducts(newProducts);

  const updateContent = async (updates: Partial<SiteContent>) => {
    setContent(prev => ({ ...prev, ...updates }));
    if (isSupabaseConfigured) {
      try {
        const { updateSiteContentKey } = await import('../services/siteContent');
        if (updates.hero) await updateSiteContentKey('hero', updates.hero);
        if (updates.about) await updateSiteContentKey('about', updates.about);
        if (updates.quote !== undefined) await updateSiteContentKey('quote', { value: updates.quote });
      } catch (err) {
        console.error('[Riman] Failed to save content to Supabase:', err);
      }
    }
  };

  const resetData = () => {
    setProducts(initialProducts);
    setContent(defaultContent);
    localStorage.removeItem('riman_dynamic_products');
    localStorage.removeItem('riman_dynamic_site_content');
  };

  const addProduct = async (product: Product): Promise<Product> => {
    if (isSupabaseConfigured) {
      try {
        const { createProduct } = await import('../services/products');
        const created = await createProduct(product);
        await loadFromSupabase();
        return created;
      } catch {
        // Fallback to local
      }
    }
    const fallback = { ...product };
    setProducts(prev => [fallback, ...prev]);
    return fallback;
  };

  const editProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
    if (isSupabaseConfigured) {
      try {
        const { updateProduct } = await import('../services/products');
        const updated = await updateProduct(id, updates as Product);
        await loadFromSupabase();
        return updated;
      } catch {
        // Fallback to local
      }
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const updatedProduct = products.find(p => p.id === id);
    return { ...updatedProduct, ...updates } as Product;
  };

  const removeProduct = async (id: string): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        const { deleteProduct } = await import('../services/products');
        await deleteProduct(id);
        await loadFromSupabase();
        return;
      } catch {
        // Fallback to local
      }
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <DataContext.Provider value={{ products, content, updateProducts, updateContent, resetData, isLoading, addProduct, editProduct, removeProduct }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}