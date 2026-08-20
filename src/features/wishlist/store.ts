import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductWithDetails } from '../../types/database';

export interface WishlistItem {
  id: string; // product id
  product: ProductWithDetails;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (product: ProductWithDetails) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        set((state) => {
          if (state.items.find(item => item.id === product.id)) {
            return state;
          }
          return {
            items: [...state.items, { id: product.id, product, addedAt: new Date().toISOString() }]
          };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },
      
      clearWishlist: () => {
        set({ items: [] });
      },
      
      isInWishlist: (id) => {
        return get().items.some(item => item.id === id);
      }
    }),
    {
      name: 'detailcorner-wishlist',
    }
  )
);
