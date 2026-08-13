import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import { Product, ProductWithDetails, Category } from '../../types/database';

interface ProductsState {
  products: ProductWithDetails[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (search?: string, categoryId?: string) => Promise<void>;
  fetchProductBySlug: (slug: string) => Promise<ProductWithDetails | null>;
  fetchCategories: () => Promise<void>;
}

function resolveImageUrl(img: any): string {
  if (!img) return '';
  if (img.url && typeof img.url === 'string' && img.url.length > 0) return img.url;
  if (img.storage_path && typeof img.storage_path === 'string') {
    if (img.storage_path.startsWith('http://') || img.storage_path.startsWith('https://') || img.storage_path.startsWith('/')) {
      return img.storage_path;
    }
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gllpmefitusfsuzrjgtf.supabase.co';
    return `${baseUrl}/storage/v1/object/public/products/${img.storage_path}`;
  }
  return '';
}

function transformImage(img: any, index: number) {
  const url = resolveImageUrl(img);
  const sortOrder = img.sort_order ?? index;
  return {
    ...img,
    url,
    storage_path: img.storage_path || url,
    sort_order: sortOrder,
    is_primary: sortOrder === 0
  };
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      if (import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co' || !import.meta.env.VITE_SUPABASE_URL) {
        throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
      }
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      const transformedCategories = (data || []).map((c: any) => ({
        ...c,
        image: c.image || 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=800'
      }));
      set({ categories: transformedCategories, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      set({ error: err.message || 'Failed to fetch categories', isLoading: false });
    }
  },

  fetchProducts: async (search?: string, categoryId?: string) => {
    set({ isLoading: true, error: null });
    try {
      if (import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co' || !import.meta.env.VITE_SUPABASE_URL) {
        throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
      }
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          reviews:product_reviews(*, profile:profiles(full_name))
        `)
        .eq('active', true);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Transform and order images/variants
      const transformedData = (data || []).map((product: any) => ({
        ...product,
        images: (product.images || [])
          .map(transformImage)
          .sort((a: any, b: any) => a.sort_order - b.sort_order),
        variants: product.variants?.filter((v: any) => v.active) || [],
        reviews: product.reviews?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [],
      }));

      set({ products: transformedData, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch products', isLoading: false, products: [] });
    }
  },

  fetchProductBySlug: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      if (import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co' || !import.meta.env.VITE_SUPABASE_URL) {
        throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
      }
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          reviews:product_reviews(*, profile:profiles(full_name))
        `)
        .eq('slug', slug)
        .eq('active', true)
        .single();
        
      if (error) throw error;
      
      const product = {
        ...data,
        images: (data.images || [])
          .map(transformImage)
          .sort((a: any, b: any) => a.sort_order - b.sort_order),
        variants: data.variants?.filter((v: any) => v.active) || [],
        reviews: data.reviews?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [],
      };

      set({ isLoading: false });
      return product;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch product', isLoading: false });
      return null;
    }
  }
}));
