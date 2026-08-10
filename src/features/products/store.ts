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
      set({ categories: data || [], isLoading: false });
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
          variants:product_variants(*)
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

      // Transform and order images/variants if needed
      const transformedData = (data || []).map((product: any) => ({
        ...product,
        images: product.images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [],
        variants: product.variants?.filter((v: any) => v.active) || [],
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
          variants:product_variants(*)
        `)
        .eq('slug', slug)
        .eq('active', true)
        .single();
        
      if (error) throw error;
      
      const product = {
        ...data,
        images: data.images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [],
        variants: data.variants?.filter((v: any) => v.active) || [],
      };

      set({ isLoading: false });
      return product;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch product', isLoading: false });
      return null;
    }
  }
}));
