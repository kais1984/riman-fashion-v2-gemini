import { supabase } from './supabase';

export async function submitContactForm(data: {
  name: string;
  email: string;
  phone: string;
  inquiry_type: string;
  message: string;
}) {
  const { data: result, error } = await supabase
    .from('contact_submissions')
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      inquiry_type: data.inquiry_type,
      message: data.message,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function fetchContactSubmissions() {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateContactSubmissionStatus(id: string, status: string, adminNotes?: string) {
  const updates: any = { status };
  if (adminNotes) updates.admin_notes = adminNotes;

  const { data, error } = await supabase
    .from('contact_submissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}