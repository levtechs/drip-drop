import { NextRequest, NextResponse } from "next/server";
import { initFirebaseAdmin } from "../../../lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { affiliateId, landingPage, userAgent, referrer } = await request.json();
    
    if (!affiliateId) {
      return NextResponse.json(
        { error: "Missing affiliateId" },
        { status: 400 }
      );
    }

    const { firestore } = await initFirebaseAdmin();
    const db = firestore();

    const affiliateRef = db.collection("affiliates").doc(affiliateId);
    const clickRef = db.collection("affiliateClicks").doc();

    await db.runTransaction(async (transaction: any) => {
      const affiliateDoc = await transaction.get(affiliateRef);
      
      if (!affiliateDoc.exists) {
        throw new Error("Affiliate not found");
      }

      const affiliateData = affiliateDoc.data()!;
      
      if (!affiliateData.isActive) {
        return;
      }

      transaction.set(clickRef, {
        affiliateId,
        landingPage,
        userAgent,
        referrer,
        timestamp: new Date(),
      });

      transaction.update(affiliateRef, {
        clickCount: (affiliateData.clickCount || 0) + 1,
        updatedAt: new Date(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking affiliate click:", error);
    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 }
    );
  }
}
