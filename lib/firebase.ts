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
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;
let cachedProvider: GoogleAuthProvider | null = null;

function getOrInitApp(): FirebaseApp {
  if (!isConfigured()) {
    return {} as FirebaseApp;
  }
  if (!cachedApp) {
    cachedApp = getApps().length > 0 ? getApp() : initializeApp(getConfig());
  }
  return cachedApp;
}

function getOrInitAuth(): Auth {
  if (!isConfigured()) {
    return {} as Auth;
  }
  if (!cachedAuth) {
    cachedAuth = getAuth(getOrInitApp());
  }
  return cachedAuth;
}

function getOrInitDb(): Firestore {
  if (!isConfigured()) {
    return {} as Firestore;
  }
  if (!cachedDb) {
    cachedDb = getFirestore(getOrInitApp());
  }
  return cachedDb;
}

function getOrInitProvider(): GoogleAuthProvider {
  if (!cachedProvider) {
    cachedProvider = new GoogleAuthProvider();
  }
  return cachedProvider;
}

export const auth = getOrInitAuth();
export const db = getOrInitDb();
export const googleProvider = getOrInitProvider();
