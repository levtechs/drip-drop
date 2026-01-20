import { NextRequest, NextResponse } from "next/server";
import { getDB, verifyAuthToken, getAdminAuth } from "../helpers";
import { ListingType, CreateListingInput, ListingData, ClothingType } from "@/app/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as ListingType | null;
    const clothingType = searchParams.get("clothingType") as ClothingType | null;
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const scope = searchParams.get("scope") as "school" | "state" | "all" | null;

    const db = getDB();
    const listingsRef = db.collection("listings");
    const q = listingsRef.orderBy("createdAt", "desc");
    const querySnapshot = await q.get();
    
    let listings: ListingData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      listings.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        price: data.price || 0,
        type: data.type,
        clothingType: data.clothingType,
        userId: data.userId,
        schoolId: data.schoolId,
        createdAt: {
          seconds: data.createdAt?.seconds || 0,
          nanoseconds: data.createdAt?.nanoseconds || 0,
        },
        imageUrls: data.imageUrls,
      });
    });

    if (scope && scope !== "all") {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const firebaseAuth = getAdminAuth();
          const token = authHeader.split(" ")[1];
          const decodedToken = await firebaseAuth.verifyIdToken(token);
          const userId = decodedToken.uid;

          const userDoc = await db.collection("users").doc(userId).get();
          const userData = userDoc.data();
          const userSchoolId = userData?.schoolId;

          if (userSchoolId) {
            const schoolDoc = await db.collection("schools").doc(userSchoolId).get();
            const schoolData = schoolDoc.data();

            if (scope === "school") {
              listings = listings.filter((l) => l.schoolId === userSchoolId);
            } else if (scope === "state" && schoolData) {
              const stateSchools = await db.collection("schools")
                .where("state", "==", schoolData.state)
                .get();
              
              const stateSchoolIds = new Set(stateSchools.docs.map((s) => s.id));
              listings = listings.filter((l) => l.schoolId && stateSchoolIds.has(l.schoolId));
            }
          }
        } catch (err) {
          console.error("Error filtering by scope:", err);
        }
      }
    }

    if (type) {
      listings = listings.filter((l) => l.type === type);
    }

    if (clothingType) {
      listings = listings.filter((l) => l.clothingType === clothingType);
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      listings = listings.filter((l) => l.price >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      listings = listings.filter((l) => l.price <= max);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      listings = listings.filter(
        (l) =>
          l.title.toLowerCase().includes(searchLower) ||
          l.description.toLowerCase().includes(searchLower)
      );
    }
    
    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    const userId = decodedToken.uid;
    
    const body: CreateListingInput = await request.json();
    
    if (!body.title || !body.description || !body.type || body.price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, type, price" },
        { status: 400 }
      );
    }
    
    const validTypes: ListingType[] = ["clothes", "textbooks", "tech", "furniture", "tickets", "services", "other"];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: "Invalid listing type" },
        { status: 400 }
      );
    }
    
    const db = getDB();
    const listingsRef = db.collection("listings");
    
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const schoolId = userData?.schoolId;
    
    const listingData: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      price: body.price,
      type: body.type,
      userId: userId,
      schoolId: schoolId || null,
      createdAt: new Date(),
      imageUrls: body.imageUrls || [],
    };
    
    if (body.clothingType !== undefined) {
      listingData.clothingType = body.clothingType;
    }
    
    const docRef = await listingsRef.add(listingData);
    
    const responseData: Record<string, unknown> = {
      id: docRef.id,
      title: body.title,
      description: body.description,
      price: body.price,
      type: body.type,
      userId: userId,
      schoolId: schoolId || null,
      createdAt: {
        seconds: Date.now() / 1000,
        nanoseconds: 0,
      },
      imageUrls: body.imageUrls || [],
    };
    
    if (body.clothingType !== undefined) {
      responseData.clothingType = body.clothingType;
    }
    
    return NextResponse.json(responseData, { status: 201 });
    
  } catch (error) {
    console.error("Error creating listing:", error);
    
    if (error instanceof Error && error.message.includes("authorization")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
