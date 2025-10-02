import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.product_id === item.product_id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        })),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setCartOpen: (isOpen) => set({ isOpen }),

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.product?.price || 0;
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
