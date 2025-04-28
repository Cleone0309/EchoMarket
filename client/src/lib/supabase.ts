import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anonymous key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads an image to Supabase Storage
 * @param file - File to upload
 * @param bucket - Storage bucket name
 * @param folder - Folder path within the bucket
 * @returns URL of the uploaded file
 */
export async function uploadImage(
  file: File,
  bucket: string = 'products',
  folder: string = ''
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data?.path || filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Deletes an image from Supabase Storage
 * @param imageUrl - Full URL of the image to delete
 * @param bucket - Storage bucket name
 * @returns boolean indicating success or failure
 */
export async function deleteImage(
  imageUrl: string,
  bucket: string = 'products'
): Promise<boolean> {
  try {
    // Extract path from the URL
    const urlParts = imageUrl.split(`${bucket}/`);
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL format');
    }

    const filePath = urlParts[1];
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}
