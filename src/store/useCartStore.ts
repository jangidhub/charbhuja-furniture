/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number, selectedFinish?: string, selectedMaterial?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDeliveryEstimate: () => number;
  getTotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      addItem: (product, quantity = 1, selectedFinish, selectedMaterial) => {
        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.productId === product.productId);
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: Math.min(20, updated[existingIndex].quantity + quantity),
              selectedFinish: selectedFinish || updated[existingIndex].selectedFinish,
              selectedMaterial: selectedMaterial || updated[existingIndex].selectedMaterial,
            };
            return { items: updated, isOpen: true };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.productId,
                product,
                quantity: Math.min(20, Math.max(1, quantity)),
                selectedFinish: selectedFinish || (product.finishes && product.finishes[0]) || 'Raw Matt Oil Finish',
                selectedMaterial: selectedMaterial || (product.materials && product.materials[0]) || 'CP Teak (Central Province)',
              },
            ],
            isOpen: true,
          };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const clamped = Math.min(20, quantity);
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: clamped } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
      },
      getDeliveryEstimate: () => {
        const sub = get().getSubtotal();
        if (sub === 0) return 0;
        return sub >= 50000 ? 0 : 2500;
      },
      getTotal: () => {
        return get().getSubtotal() + get().getDeliveryEstimate();
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'charbhuja_furniture_cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
