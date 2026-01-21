export interface AffiliateLink {
  id: string;
  code: string;
  url: string;
}

export function generateAffiliateLink(baseUrl: string, affiliateId: string, campaign: string = "default"): string {
  const params = new URLSearchParams({
    utm_source: "affiliate",
    utm_campaign: campaign,
    utm_affiliate: affiliateId,
  });
  return `${baseUrl}?${params.toString()}`;
}

export function getAffiliateLinkFromUrl(url: string): { affiliateId: string; source: string; campaign: string } | null {
  try {
    const urlObj = new URL(url);
    const affiliateId = urlObj.searchParams.get("utm_affiliate");
    const source = urlObj.searchParams.get("utm_source");
    const campaign = urlObj.searchParams.get("utm_campaign");
    
    if (affiliateId && source === "affiliate") {
      return { affiliateId, source, campaign: campaign || "default" };
    }
  } catch (e) {
    console.error("Error parsing affiliate link:", e);
  }
  return null;
}
