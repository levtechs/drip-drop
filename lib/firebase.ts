import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const getConfig = () => ({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
});

function isConfigured(): boolean {
  const config = getConfig();
  return !!(config.apiKey && config.apiKey.startsWith("AIza") && config.projectId);
}

let cachedApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isConfigured()) {
    throw new Error("Firebase not configured");
  }
  if (!cachedApp) {
    cachedApp = getApps().length > 0 ? getApp() : initializeApp(getConfig());
  }
  return cachedApp;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getGoogleProvider(): GoogleAuthProvider {
  return new GoogleAuthProvider();
}

export const auth = isConfigured() ? getAuth(getFirebaseApp()) : null;
export const db = isConfigured() ? getFirestore(getFirebaseApp()) : null;
export const googleProvider = new GoogleAuthProvider();
