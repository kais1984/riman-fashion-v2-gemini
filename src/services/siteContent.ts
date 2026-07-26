import { supabase } from './supabase';

export async function fetchSiteContent(): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from('site_content')
    .select('key, value');

  if (error) throw error;
  const result: Record<string, any> = {};
  (data || []).forEach(row => {
    result[row.key] = row.value;
  });
  return result;
}

export async function updateSiteContentKey(key: string, value: any): Promise<void> {
  const { error } = await supabase
    .from('site_content')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) throw error;
}
