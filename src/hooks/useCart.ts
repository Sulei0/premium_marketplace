import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/lib/index';

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'cartId'>) => void;
  removeItem: (cartId: string) => void;
  updateItem: (cartId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

/**
 * useCart hook handles the "Digital Boudoir" shopping experience logic.
 * It manages items added to the whisper list (cart) with persistent storage.
 */
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [] as CartItem[],

      /**
       * Adds a new product to the cart with specific user-selected durations and extras.
       * Generates a unique cartId for each instance of a product.
       */
      addItem: (item) => {
        const cartId = crypto.randomUUID();
        set((state) => ({
          items: [...state.items, { ...item, cartId }],
        }));
      },

      /**
       * Removes an item from the cart using its unique cartId.
       */
      removeItem: (cartId) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartId !== cartId),
        }));
      },

      /**
       * Updates specific properties of a cart item (e.g., duration or personal note).
       */
      updateItem: (cartId, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.cartId === cartId ? { ...item, ...updates } : item
          ),
        }));
      },

      /**
       * Resets the entire cart state.
       */
      clearCart: () => set({ items: [] }),

      /**
       * Returns the count of items in the cart.
       */
      getTotalItems: () => get().items.length,

      /**
       * Calculates the total price of all items in the cart including extras and duration multipliers.
       */
      getTotalPrice: () => {
        return get().items.reduce((acc, item) => acc + item.totalPrice, 0);
      },
    }),
    {
      name: 'giyenden-boudoir-cart',
    }
  )
);