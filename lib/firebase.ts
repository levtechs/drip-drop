import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    if (getApps().length > 0) {
      app = getApp();
    } else {
      app = initializeApp(firebaseConfig);
    }
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}

export function getFirebaseDb(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(getFirebaseApp());
  }
  return dbInstance;
}

export function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProviderInstance) {
    googleProviderInstance = new GoogleAuthProvider();
  }
  return googleProviderInstance;
}

export const auth = getFirebaseAuth();
export const db = getFirebaseDb();
export const googleProvider = getGoogleProvider();
