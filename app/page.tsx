"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/profile");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-card sm:items-start border border-border rounded-lg">
        <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-card-foreground">
          Welcome to Drip Drop
        </h1>
        <p className="max-w-md text-lg leading-8 text-muted-foreground">
          Please sign in to continue
        </p>
        <a
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-white transition-colors hover:bg-primary-hover md:w-[158px]"
          href="/login"
        >
          Sign In
        </a>
      </main>
    </div>
  );
}
