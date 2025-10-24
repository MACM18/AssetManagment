"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  User,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, FIREBASE_AVAILABLE } from "./firebase";
import { UserProfile } from "@/types";

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  if (!FIREBASE_AVAILABLE) {
    throw new Error("Firebase is not initialized");
  }
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create a new user account with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  if (!FIREBASE_AVAILABLE) {
    throw new Error("Firebase is not initialized");
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Update profile with display name if provided
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }

  // Create user profile in Firestore
  await createUserProfile(userCredential.user);

  return userCredential;
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  if (!FIREBASE_AVAILABLE) {
    throw new Error("Firebase is not initialized");
  }

  const userCredential = await signInWithPopup(auth, googleProvider);

  // Create or update user profile in Firestore
  await createUserProfile(userCredential.user);

  return userCredential;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  if (!FIREBASE_AVAILABLE) {
    throw new Error("Firebase is not initialized");
  }
  return firebaseSignOut(auth);
}

/**
 * Create or update user profile in Firestore
 */
async function createUserProfile(user: User): Promise<void> {
  if (!user || !FIREBASE_AVAILABLE) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  const profileData: Partial<UserProfile> = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    lastLogin: new Date().toISOString(),
  };

  if (!userSnap.exists()) {
    // New user - create profile
    await setDoc(userRef, {
      ...profileData,
      createdAt: serverTimestamp(),
    });
  } else {
    // Existing user - update last login
    await setDoc(
      userRef,
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!FIREBASE_AVAILABLE) return null;

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  return userSnap.data() as UserProfile;
}
