"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { AuthContextType } from "./types";
import { getFirebaseAuth, getGoogleProvider, getFirebaseDb } from "./firebase";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function createUserDocument(user: User) {
  const db = getFirebaseDb();
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const displayName = user.displayName || "";
    const nameParts = displayName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      profilePicture: user.photoURL || "",
      createdAt: Timestamp.now(),
      ...user.providerData.reduce((acc, provider) => {
        acc[provider.providerId] = provider.uid;
        return acc;
      }, {} as Record<string, string>),
    });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await createUserDocument(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const auth = getFirebaseAuth();
      const googleProvider = getGoogleProvider();
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDocument(result.user);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
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
