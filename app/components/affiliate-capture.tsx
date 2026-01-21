"use client";

import { useEffect } from "react";
import { captureAffiliateFromUrl, setAffiliateData, AffiliateData } from "@/app/lib/affiliate-tracker";

interface AffiliateCaptureProps {
  children: React.ReactNode;
}

export function AffiliateCapture({ children }: AffiliateCaptureProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      captureAffiliateFromUrl(url);
    }
  }, []);

  return <>{children}</>;
}

export function useCaptureAffiliate() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      captureAffiliateFromUrl(window.location.href);
    }
  }, []);
}

export function useGetAffiliateData(): AffiliateData | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("thryft_affiliate_data");
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
}
