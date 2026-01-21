import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
} as any;

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

export async function initFirebaseAdmin(): Promise<{ firestore: () => Firestore }> {
  if (!adminApp) {
    if (getApps().length === 0) {
      try {
        adminApp = initializeApp({
          credential: serviceAccount ? cert(serviceAccount) : undefined,
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      } catch (e) {
        console.error("Firebase Admin initialization error:", e);
        throw e;
      }
    } else {
      adminApp = getApps()[0];
    }
  }
  
  if (!adminDb) {
    adminDb = getFirestore(adminApp);
  }
  
  return { firestore: () => adminDb! };
}

export function getAdminFirestore(): Firestore {
  if (!adminDb) {
    throw new Error("Firebase Admin not initialized. Call initFirebaseAdmin() first.");
  }
  return adminDb;
}
