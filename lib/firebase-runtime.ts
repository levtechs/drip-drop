import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    throw new Error("Firebase not initialized. Call initFirebase first.");
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error("Firebase auth not initialized. Call initFirebase first.");
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    throw new Error("Firebase DB not initialized. Call initFirebase first.");
  }
  return db;
}

export async function initFirebase(): Promise<void> {
  if (app) return;

  const response = await fetch("/api/firebase-config");
  if (!response.ok) {
    throw new Error("Failed to fetch Firebase config");
  }
  const firebaseConfig = await response.json();

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error("Firebase config is incomplete");
  }

  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}
