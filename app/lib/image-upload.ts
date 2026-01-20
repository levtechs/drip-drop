import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirebaseStorage } from "./firebase";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface UploadProgress {
  fileName: string;
  progress: number;
  error?: string;
}

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
}

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "File must be a JPEG, PNG, WebP, or GIF image";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File size must be less than 10MB";
  }
  return null;
}

function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop() || "jpg";
  return `${timestamp}-${random}.${extension}`;
}

export async function uploadImage(
  file: File,
  type: "listing" | "message",
  id?: string
): Promise<UploadResult> {
  const error = validateFile(file);
  if (error) {
    throw new Error(error);
  }

  const storage = getFirebaseStorage();
  const fileName = generateFileName(file.name);
  
  let path: string;
  if (type === "listing" && id) {
    path = `listings/${id}/${fileName}`;
  } else if (type === "listing") {
    path = `listings/temp/${fileName}`;
  } else if (type === "message" && id) {
    path = `messages/${id}/${fileName}`;
  } else {
    path = `messages/temp/${fileName}`;
  }

  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);

  return {
    url,
    path,
    fileName,
  };
}

export async function uploadMultipleImages(
  files: File[],
  type: "listing" | "message",
  id?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress({
        fileName: file.name,
        progress: 0,
      });
    }

    try {
      const result = await uploadImage(file, type, id);
      results.push(result);

      if (onProgress) {
        onProgress({
          fileName: file.name,
          progress: 100,
        });
      }
    } catch (error) {
      if (onProgress) {
        onProgress({
          fileName: file.name,
          progress: 0,
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }
  }

  return results;
}

export async function deleteImage(path: string): Promise<void> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export async function deleteMultipleImages(paths: string[]): Promise<void> {
  await Promise.all(paths.map((path) => deleteImage(path)));
}

export function reorderImageUrls(
  urls: string[],
  fromIndex: number,
  toIndex: number
): string[] {
  const result = [...urls];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
