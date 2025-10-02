import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export async function uploadImage(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

export async function deleteImage(bucket: string, url: string): Promise<boolean> {
  try {
    const path = url.split(`${bucket}/`)[1];
    if (!path) return false;

    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
