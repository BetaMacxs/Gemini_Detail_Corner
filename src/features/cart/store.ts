import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductWithDetails, ProductVariant } from '../../types/database';

export interface CartItem {
  id: string; // unique id for cart item (could be product.id + variant.id)
  product: ProductWithDetails;
  variant?: ProductVariant;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: ProductWithDetails, variant: ProductVariant | undefined, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, variant, quantity) => {
        set((state) => {
          const itemId = variant ? `${product.id}-${variant.id}` : product.id;
          const existingItemIndex = state.items.findIndex(item => item.id === itemId);
          
          const maxStock = variant ? variant.stock_quantity : product.stock_quantity;

          if (existingItemIndex >= 0) {
            const updatedItems = [...state.items];
            const newQuantity = Math.min(maxStock, updatedItems[existingItemIndex].quantity + quantity);
            updatedItems[existingItemIndex].quantity = newQuantity;
            return { items: updatedItems };
          }
          
          return {
            items: [...state.items, {
              id: itemId,
              product,
              variant,
              quantity: Math.min(maxStock, quantity)
            }]
          };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },
      
      updateQuantity: (id, quantity) => {
        set((state) => {
          const itemIndex = state.items.findIndex(item => item.id === id);
          if (itemIndex < 0) return state;
          
          const item = state.items[itemIndex];
          const maxStock = item.variant ? item.variant.stock_quantity : item.product.stock_quantity;
          const validQuantity = Math.max(1, Math.min(maxStock, quantity));
          
          const updatedItems = [...state.items];
          updatedItems[itemIndex].quantity = validQuantity;
          return { items: updatedItems };
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.variant ? item.variant.price : item.product.price;
          return total + (price * item.quantity);
        }, 0);
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'detailcorner-cart',
    }
  )
);
