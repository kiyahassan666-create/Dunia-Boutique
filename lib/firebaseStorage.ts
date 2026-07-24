import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

function requireStorage() {
  if (!storage) throw new Error("Firebase Storage not initialized");
  return storage;
}

export async function uploadImage(file: File, path?: string): Promise<string> {
  const st = requireStorage();
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const fullPath = path ? `${path}/${fileName}` : `uploads/${fileName}`;
  const storageRef = ref(st, fullPath);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function uploadMultipleImages(files: File[], path?: string): Promise<string[]> {
  return Promise.all(files.map(f => uploadImage(f, path)));
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
