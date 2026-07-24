import { ref, uploadBytes, getDownloadURL, deleteObject, UploadResult } from "firebase/storage";
import { storage } from "./firebase";

const UPLOAD_TIMEOUT = 60000;
const MAX_DIM = 1920;
const JPEG_QUALITY = 0.82;

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

async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.size < 1024 * 1024) return file;
  try {
    const img = new Image();
    const url = URL.createObjectURL(file);
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
      img.src = url;
    });
    URL.revokeObjectURL(img.src);
    let { width, height } = img;
    if (width <= MAX_DIM && height <= MAX_DIM) return file;
    if (width > MAX_DIM || height > MAX_DIM) {
      const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob | null>(r => canvas.toBlob(b => r(b), "image/jpeg", JPEG_QUALITY));
    if (blob) return blob;
    return file;
  } catch {
    return file;
  }
}

export async function uploadImage(file: File, path?: string): Promise<string> {
  const st = requireStorage();
  const data = await compressImage(file);
  const ext = "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const fullPath = path ? `${path}/${fileName}` : `uploads/${fileName}`;
  const storageRef = ref(st, fullPath);
  const result: UploadResult = await withTimeout(uploadBytes(storageRef, data), UPLOAD_TIMEOUT);
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
