"use client";

import { useEffect } from "react";
import { captureAffiliateFromUrl, getAffiliateData, AffiliateData } from "@/app/lib/affiliate-tracker";

export function useAffiliateCapture() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      captureAffiliateFromUrl(url);
    }
  }, []);
}

export function useHasAffiliateData(): AffiliateData | null {
  return getAffiliateData();
}
