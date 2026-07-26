import { supabase } from './supabase';

export async function fetchWishlist(userId: string) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('product_id, products(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []).map((item: any) => item.products);
}

export async function addToWishlistDb(userId: string, productId: string) {
  const { error } = await supabase
    .from('wishlist_items')
    .insert({ user_id: userId, product_id: productId });

  if (error) {
    if (error.code === '23505') return;
    throw error;
  }
}

export async function removeFromWishlistDb(userId: string, productId: string) {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) throw error;
}