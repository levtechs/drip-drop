import { auth } from "@/lib/firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!auth || !auth.currentUser) {
    throw new Error("User must be authenticated to perform this action");
  }
  
  let token: string;
  
  try {
    token = await auth.currentUser.getIdToken();
  } catch (error) {
    console.error("Error getting ID token:", error);
    throw new Error("Failed to get authentication token");
  }
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return response;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
