import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let dbInstance: Firestore | undefined;
let storageInstance: FirebaseStorage | undefined;
let authInstance: Auth | undefined;

// Only initialize Firebase if we have valid configuration
const hasValidConfig =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId;

// Debug logs to help diagnose initialization in the browser
try {
  // Only log in browser to avoid noisy server logs
  if (typeof window !== "undefined") {
    // Avoid leaking secrets: only log presence (boolean), not actual values
    // eslint-disable-next-line no-console
    console.log("firebase.ts: hasValidConfig=", Boolean(hasValidConfig), {
      apiKey: Boolean(firebaseConfig.apiKey),
      authDomain: Boolean(firebaseConfig.authDomain),
      projectId: Boolean(firebaseConfig.projectId),
    });
  }
} catch {}

if (hasValidConfig && typeof window !== "undefined") {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
    authInstance = getAuth(app);
    
    // Set persistence to browser local storage to maintain auth state
    setPersistence(authInstance, browserLocalPersistence).catch((error) => {
      console.error("Failed to set auth persistence:", error);
    });
  } else {
    app = getApps()[0];
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
    authInstance = getAuth(app);
  }
}

// Create placeholder/mock implementations for when Firebase is not configured
const mockDb = {} as Firestore;
const mockStorage = {} as FirebaseStorage;
const mockAuth = {} as Auth;

export const db = dbInstance || mockDb;
export const storage = storageInstance || mockStorage;
export const auth = authInstance || mockAuth;
export { app };

// Indicates whether Firebase was initialized successfully at runtime
export const FIREBASE_AVAILABLE = Boolean(dbInstance && app);
try {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.log("firebase.ts: FIREBASE_AVAILABLE=", FIREBASE_AVAILABLE);
  }
} catch {}
