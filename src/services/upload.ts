import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET_NAME = 'product-images';

export async function uploadImage(file: File): Promise<string> {
  if (isSupabaseConfigured) {
    return uploadToSupabase(file);
  }
  return uploadToFallback(file);
}

async function uploadToSupabase(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return urlData?.publicUrl || '';
}

async function uploadToFallback(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
