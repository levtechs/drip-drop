"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthContextType } from "./types";
import { initFirebase, getFirebaseAuth, getFirebaseDb } from "@/app/lib/firebase-runtime";
import { getAffiliateData } from "@/app/lib/affiliate-tracker";

interface AuthContextValue extends AuthContextType {
  needsSchoolSelection: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function creditAffiliate(referredUserId: string, referredEmail?: string): Promise<void> {
  const affiliateData = getAffiliateData();
  
  if (!affiliateData) {
    return;
  }

  try {
    const response = await fetch("/api/affiliates/credit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        affiliateId: affiliateData.affiliateId,
        referredUserId,
        referredEmail,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.error !== "User already referred") {
        console.error("Failed to credit affiliate:", error);
      }
    }
  } catch (e) {
    console.error("Error crediting affiliate:", e);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSchoolSelection, setNeedsSchoolSelection] = useState(false);

  async function checkSchoolAndRefresh() {
    if (user) {
      const { doc, getDoc } = await import("firebase/firestore");
      const db = getFirebaseDb();
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setNeedsSchoolSelection(!userData?.schoolId);
      } else {
        setNeedsSchoolSelection(true);
      }
    }
  }

  useEffect(() => {
    let unsubscribe: any = null;

    async function init() {
      try {
        initFirebase();
        const auth = getFirebaseAuth();
        const { onAuthStateChanged } = await import("firebase/auth");
        const { doc, getDoc, setDoc, Timestamp } = await import("firebase/firestore");
        const db = getFirebaseDb();

        unsubscribe = onAuthStateChanged(auth, async (user: any) => {
          setUser(user);
          if (user) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              const nameParts = (user.displayName || "").split(" ");
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                firstName: nameParts[0] || "",
                lastName: nameParts.slice(1).join(" ") || "",
                profilePicture: user.photoURL || "",
                createdAt: Timestamp.now(),
              });
              setNeedsSchoolSelection(true);
              creditAffiliate(user.uid, user.email);
            } else {
              const userData = userSnap.data();
              setNeedsSchoolSelection(!userData?.schoolId);
            }
          } else {
            setNeedsSchoolSelection(false);
          }
          setLoading(false);
        });
      } catch (err: any) {
        console.error("Firebase initialization error:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    if (error) {
      throw new Error(`Firebase not configured: ${error}`);
    }
    try {
      const auth = getFirebaseAuth();
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      console.error("Sign in error:", err);
      if (err.code === "auth/popup-blocked") {
        throw new Error("Popup was blocked. Please allow popups for this site.");
      }
      throw err;
    }
  };

  const signOut = async () => {
    const auth = getFirebaseAuth();
    const { signOut: firebaseSignOut } = await import("firebase/auth");
    await firebaseSignOut(auth);
    setNeedsSchoolSelection(false);
  };

  const refreshUserData = async () => {
    await checkSchoolAndRefresh();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, needsSchoolSelection, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
