import { ref, uploadBytes, getDownloadURL, deleteObject, UploadResult } from "firebase/storage";
import { storage } from "./firebase";

const UPLOAD_TIMEOUT = 30000;

function requireStorage() {
  if (!storage) throw new Error("Firebase Storage not initialized");
  return storage;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Upload timed out after ${ms}ms`)), ms);
    }),
  ]).finally(() => clearTimeout(timer!));
}

export async function uploadImage(file: File, path?: string): Promise<string> {
  const st = requireStorage();
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const fullPath = path ? `${path}/${fileName}` : `uploads/${fileName}`;
  const storageRef = ref(st, fullPath);
  const result: UploadResult = await withTimeout(uploadBytes(storageRef, file), UPLOAD_TIMEOUT);
  return getDownloadURL(result.ref);
}

export async function uploadMultipleImages(files: File[], path?: string): Promise<string[]> {
  const results = await Promise.allSettled(files.map(f => uploadImage(f, path)));
  const urls: string[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") urls.push(r.value);
  }
  return urls;
}

export async function deleteImageFromStorage(url: string): Promise<void> {
  try {
    const st = requireStorage();
    const storageRef = ref(st, url);
    await deleteObject(storageRef);
  } catch {
    // ignore if file doesn't exist
  }
}

export async function getImageUrl(path: string): Promise<string | null> {
  try {
    const st = requireStorage();
    const storageRef = ref(st, path);
    return getDownloadURL(storageRef);
  } catch {
    return null;
  }
}
