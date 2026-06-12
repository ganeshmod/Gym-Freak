import { create } from "zustand";

export const useGlobalStore = create((set, get) => ({
  userDetails: null,
  setUserDetails: (val) => set({ userDetails: val }),
  updateAddress: (val) =>
    set((state) => ({
      userDetails: {
        ...state.userDetails,
        addresses: val,
      },
    })),
  cartCount: 0,
  setCartCount: (count) => set({ cartCount: count }),
  incrementCartCount: (amount = 1) =>
    set((state) => ({ cartCount: state.cartCount + amount })),
  decrementCartCount: (amount = 1) =>
    set((state) => ({ cartCount: Math.max(0, state.cartCount - amount) })),
  resetCartCount: () => set({ cartCount: 0 }),
}));
