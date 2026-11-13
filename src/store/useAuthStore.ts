/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { UserProfile, CustomerAddress } from '../types';
import {
  signInWithGoogle as firebaseGoogleSignIn,
  signOutUser as firebaseSignOut,
  subscribeToAuthChanges,
  isUserAdmin,
} from '../services/firebase/auth';
import {
  getUserProfile,
  saveUserAddress as fsSaveAddress,
  deleteUserAddress as fsDeleteAddress,
  setDefaultUserAddress as fsSetDefaultAddress,
} from '../services/firebase/firestore';

interface AuthState {
  user: UserProfile | null;
  addresses: CustomerAddress[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  setDemoAdmin: () => void;
  fetchUserAddresses: () => Promise<void>;
  saveAddress: (address: CustomerAddress) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  addresses: [],
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,

  signInWithGoogle: async () => {
    try {
      const profile = await firebaseGoogleSignIn();
      set({
        user: profile,
        addresses: profile.addresses || [],
        isAuthenticated: true,
        isAdmin: isUserAdmin(profile),
        isLoading: false,
      });
      if (profile.uid) {
        get().fetchUserAddresses();
      }
    } catch (err) {
      console.error('Failed to sign in with Google:', err);
      throw err;
    }
  },

  logout: async () => {
    try {
      await firebaseSignOut();
      set({
        user: null,
        addresses: [],
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  },

  setUser: (user) => {
    set({
      user,
      addresses: user?.addresses || [],
      isAuthenticated: !!user,
      isAdmin: isUserAdmin(user),
      isLoading: false,
    });
    if (user?.uid) {
      get().fetchUserAddresses();
    }
  },

  fetchUserAddresses: async () => {
    const user = get().user;
    if (!user || !user.uid || user.uid.startsWith('admin_sudhanshu')) return;
    try {
      const profile = await getUserProfile(user.uid);
      if (profile && profile.addresses) {
        set({ addresses: profile.addresses });
      }
    } catch (err) {
      console.warn('Could not fetch user addresses:', err);
    }
  },

  saveAddress: async (address: CustomerAddress) => {
    const user = get().user;
    if (!user || !user.uid) {
      // Local fallback for guest
      set((state) => {
        const id = address.addressId || `addr_${Date.now()}`;
        const clean = { ...address, addressId: id };
        const exists = state.addresses.findIndex((a) => a.addressId === id);
        let list = exists > -1 ? [...state.addresses] : [clean, ...state.addresses];
        if (exists > -1) list[exists] = clean;
        return { addresses: list };
      });
      return;
    }

    try {
      const updated = await fsSaveAddress(user.uid, address);
      set({ addresses: updated });
    } catch (err) {
      console.error('Error saving address:', err);
      throw err;
    }
  },

  deleteAddress: async (addressId: string) => {
    const user = get().user;
    if (!user || !user.uid) {
      set((state) => ({
        addresses: state.addresses.filter((a) => a.addressId !== addressId),
      }));
      return;
    }

    try {
      const updated = await fsDeleteAddress(user.uid, addressId);
      set({ addresses: updated });
    } catch (err) {
      console.error('Error deleting address:', err);
      throw err;
    }
  },

  setDefaultAddress: async (addressId: string) => {
    const user = get().user;
    if (!user || !user.uid) {
      set((state) => ({
        addresses: state.addresses.map((a) => ({
          ...a,
          isDefault: a.addressId === addressId,
        })),
      }));
      return;
    }

    try {
      const updated = await fsSetDefaultAddress(user.uid, addressId);
      set({ addresses: updated });
    } catch (err) {
      console.error('Error setting default address:', err);
      throw err;
    }
  },

  setDemoAdmin: () => {
    const adminProfile: UserProfile = {
      uid: 'admin_sudhanshu',
      displayName: 'Sudhanshu (Administrator)',
      email: 'sudhanshujangid143@gmail.com',
      role: 'admin',
    };
    set({
      user: adminProfile,
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
    });
  },
}));

// Initialize real-time Firebase Auth listener
subscribeToAuthChanges((profile, rawUser) => {
  if (profile) {
    useAuthStore.getState().setUser(profile);
  } else if (rawUser) {
    useAuthStore.getState().setUser({
      uid: rawUser.uid,
      displayName: rawUser.displayName || 'Valued Client',
      email: rawUser.email || '',
      role: rawUser.email === 'sudhanshujangid143@gmail.com' ? 'admin' : 'customer',
    });
  } else {
    // Only clear if not in manual demo mode
    const current = useAuthStore.getState().user;
    if (!current || !current.uid.startsWith('admin_sudhanshu')) {
      useAuthStore.setState({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
    }
  }
});
