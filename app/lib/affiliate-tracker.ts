const AFFILIATE_STORAGE_KEY = "thryft_affiliate_data";

export interface AffiliateData {
  affiliateId: string;
  source: string;
  campaign: string;
  timestamp: number;
}

export function getAffiliateData(): AffiliateData | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(AFFILIATE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading affiliate data:", e);
  }
  return null;
}

export function setAffiliateData(data: AffiliateData): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error storing affiliate data:", e);
  }
}

export function clearAffiliateData(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(AFFILIATE_STORAGE_KEY);
  } catch (e) {
    console.error("Error clearing affiliate data:", e);
  }
}

export function captureAffiliateFromUrl(url: string): void {
  try {
    const urlObj = new URL(url);
    const affiliateId = urlObj.searchParams.get("utm_affiliate");
    const source = urlObj.searchParams.get("utm_source");
    const campaign = urlObj.searchParams.get("utm_campaign");
    
    if (affiliateId && source === "affiliate") {
      setAffiliateData({
        affiliateId,
        source,
        campaign: campaign || "default",
        timestamp: Date.now(),
      });
    }
  } catch (e) {
    console.error("Error capturing affiliate from URL:", e);
  }
}

export function hasRecentAffiliateData(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): boolean {
  const data = getAffiliateData();
  if (!data) return false;
  
  const age = Date.now() - data.timestamp;
  return age < maxAgeMs;
}
