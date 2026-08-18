import { supabase } from './supabase';

/**
 * Converts a File object to a Base64 data URL string.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image to Supabase storage with fallback handling.
 * @param file The file to upload
 * @param bucket The target bucket name (defaults to 'gallery' or 'products')
 * @returns Public URL or Base64 data URL
 */
export async function uploadImage(file: File, bucket: string = 'gallery'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanFileName}`;
    const filePath = `${fileName}`;

    // 1. Try uploading to the primary requested bucket
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (publicUrl) {
        return publicUrl;
      }
    } else {
      console.warn(`Storage upload to bucket '${bucket}' notice:`, uploadError.message || uploadError);

      // If bucket is missing and bucket was 'gallery', attempt fallback bucket 'products'
      if (bucket !== 'products') {
        const { error: fallbackUploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!fallbackUploadError) {
          const { data: { publicUrl: fallbackUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

          if (fallbackUrl) {
            return fallbackUrl;
          }
        }
      }
    }

    // 2. Fallback: Convert to Data URL if storage bucket is not provisioned on remote server
    const dataUrl = await fileToDataUrl(file);
    return dataUrl;
  } catch (error) {
    console.warn('Image upload fallback to data URL due to error:', error);
    try {
      return await fileToDataUrl(file);
    } catch {
      return null;
    }
  }
}

