import { supabase } from './supabase';
import { Product } from '../types';

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapDbProduct);
}

export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapDbProduct);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data ? mapDbProduct(data) : null;
}

export async function createProduct(product: Product): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(mapProductToDb(product))
    .select()
    .single();

  if (error) throw error;
  return mapDbProduct(data);
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ ...mapProductToDb(product as Product), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapDbProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    productType: row.product_type,
    salePrice: row.sale_price,
    rentalPrice: row.rental_price,
    securityDeposit: row.security_deposit,
    images: row.images || [],
    videoUrl: row.video_url,
    category: row.category,
    style: row.style || [],
    color: row.color || [],
    fabric: row.fabric,
    designer: row.designer,
    sizes: row.sizes || [],
    isNew: row.is_new,
    isFeatured: row.is_featured,
    tags: row.tags || [],
    glbUrl: row.glb_url,
    collectionYear: row.collection_year,
    silhouette: row.silhouette,
  };
}

function mapProductToDb(product: Product): any {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    product_type: product.productType,
    sale_price: product.salePrice,
    rental_price: product.rentalPrice,
    security_deposit: product.securityDeposit,
    images: product.images,
    video_url: product.videoUrl,
    category: product.category,
    style: product.style,
    color: product.color,
    fabric: product.fabric,
    designer: product.designer,
    sizes: product.sizes,
    is_new: product.isNew,
    is_featured: product.isFeatured,
    tags: product.tags,
    glb_url: product.glbUrl,
    collection_year: product.collectionYear,
    silhouette: product.silhouette,
  };
}