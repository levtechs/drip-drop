"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserData } from "@/lib/types";

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData);
        }
      }
    }
    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-lg border border-border">
        <h1 className="mb-6 text-center text-2xl font-bold text-card-foreground">Profile</h1>
        <div className="flex flex-col items-center">
          {(userData?.profilePicture || user.photoURL) && (
            <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full">
              <Image
                src={userData?.profilePicture || user.photoURL || ""}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
          )}
          <p className="mb-2 text-lg font-medium text-card-foreground">
            {userData?.firstName} {userData?.lastName}
          </p>
          <p className="mb-6 text-muted-foreground">{userData?.email || user.email}</p>
          <button
            onClick={signOut}
            className="rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
