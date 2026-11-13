/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { UserProfile } from '../../types';

const ADMIN_EMAIL = 'sudhanshujangid143@gmail.com';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<UserProfile> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;
    return await syncUserProfile(user);
  } catch (err) {
    console.error('Google Sign In Error:', err);
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export function isUserAdmin(user: FirebaseUser | UserProfile | null): boolean {
  if (!user) return false;
  return user.email === ADMIN_EMAIL || (user as any).role === 'admin';
}

export async function syncUserProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const isAdminUser = firebaseUser.email === ADMIN_EMAIL;

  try {
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      const data = snapshot.data() as UserProfile;
      return {
        ...data,
        role: isAdminUser ? 'admin' : (data.role || 'customer'),
      };
    } else {
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Valued Client',
        email: firebaseUser.email || '',
        phoneNumber: firebaseUser.phoneNumber || '',
        photoURL: firebaseUser.photoURL || '',
        role: isAdminUser ? 'admin' : 'customer',
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
  }
}

export function subscribeToAuthChanges(callback: (profile: UserProfile | null, rawUser: FirebaseUser | null) => void) {
  return firebaseOnAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const profile = await syncUserProfile(user);
        callback(profile, user);
      } catch {
        callback({
          uid: user.uid,
          displayName: user.displayName || 'Client',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          role: user.email === ADMIN_EMAIL ? 'admin' : 'customer',
        }, user);
      }
    } else {
      callback(null, null);
    }
  });
}
