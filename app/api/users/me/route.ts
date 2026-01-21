import { NextRequest, NextResponse } from "next/server";
import { getDB, verifyAuthToken } from "../../helpers";
import { ListingData } from "@/app/lib/types";

function extractTimestamp(createdAt: any): { seconds: number; nanoseconds: number } {
  if (!createdAt) return { seconds: 0, nanoseconds: 0 };
  
  if (typeof createdAt === 'object' && 'seconds' in createdAt) {
    return { seconds: createdAt.seconds, nanoseconds: createdAt.nanoseconds };
  }
  if (typeof createdAt === 'object' && '_seconds' in createdAt) {
    return { seconds: createdAt._seconds, nanoseconds: createdAt._nanoseconds };
  }
  if (typeof createdAt === 'number') {
    return { seconds: createdAt, nanoseconds: 0 };
  }
  
  return { seconds: 0, nanoseconds: 0 };
}

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    const userId = decodedToken.uid;
    const db = getDB();
    
    const userSnap = await db.collection("users").doc(userId).get();
    
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const userData = userSnap.data()!;
    
    let school = null;
    if (userData.schoolId) {
      const schoolSnap = await db.collection("schools").doc(userData.schoolId).get();
      if (schoolSnap.exists) {
        const schoolData = schoolSnap.data()!;
        school = {
          id: schoolSnap.id,
          name: schoolData.name,
          state: schoolData.state,
        };
      }
    }
    
    const listingsSnap = await db.collection("listings")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    
    const listings: ListingData[] = [];
    listingsSnap.forEach((doc) => {
      const data = doc.data();
      listings.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        price: data.price || 0,
        type: data.type,
        clothingType: data.clothingType,
        condition: data.condition,
        size: data.size,
        userId: data.userId,
        schoolId: data.schoolId,
        isPrivate: data.isPrivate || false,
        isSold: data.isSold || false,
        createdAt: extractTimestamp(data.createdAt),
        imageUrls: data.imageUrls,
      });
    });
    
    return NextResponse.json({
      uid: userSnap.id,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      profilePicture: userData.profilePicture || "",
      email: userData.email || "",
      schoolId: userData.schoolId || null,
      school,
      listings,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    
    if (error instanceof Error && error.message.includes("authorization")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
