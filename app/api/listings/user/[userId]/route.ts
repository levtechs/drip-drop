import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ListingData } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const listingsRef = collection(db, "listings");
    const q = query(
      listingsRef,
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    
    const listings: ListingData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      listings.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        type: data.type,
        userId: data.userId,
        createdAt: {
          seconds: data.createdAt?.seconds || 0,
          nanoseconds: data.createdAt?.nanoseconds || 0,
        },
      });
    });
    
    listings.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    
    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return NextResponse.json({ error: "Failed to fetch user listings" }, { status: 500 });
  }
}
