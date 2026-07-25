import {
  collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, Timestamp, QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

export const COLLECTIONS = {
  users: "users",
  products: "products",
  orders: "orders",
  categories: "categories",
  wishlists: "wishlists",
  carts: "carts",
  websiteImages: "websiteImages",
  settings: "settings",
};

function ensureDb() {
  if (!db) throw new Error("Firestore not initialized");
  return db;
}

export async function getDocuments<T = any>(
  colName: string,
  ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
  const colRef = collection(ensureDb(), colName);
  const q = constraints.length ? query(colRef, ...constraints) : colRef;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }));
}

export async function getDocument<T = any>(colName: string, docId: string): Promise<(T & { id: string }) | null> {
  const docRef = doc(ensureDb(), colName, docId);
  const snap = await getDoc(docRef);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T & { id: string }) : null;
}

export async function addDocument(colName: string, data: any, id?: string): Promise<string> {
  const fireDb = ensureDb();
  const clean = JSON.parse(JSON.stringify(data));
  if (id) {
    await setDoc(doc(fireDb, colName, id), { ...clean, createdAt: Timestamp.now() });
    return id;
  }
  const docRef = await addDoc(collection(fireDb, colName), { ...clean, createdAt: Timestamp.now() });
  return docRef.id;
}

export async function updateDocument(colName: string, docId: string, data: any): Promise<void> {
  const docRef = doc(ensureDb(), colName, docId);
  const clean = JSON.parse(JSON.stringify(data));
  await updateDoc(docRef, { ...clean, updatedAt: Timestamp.now() });
}

export async function deleteDocument(colName: string, docId: string): Promise<void> {
  await deleteDoc(doc(ensureDb(), colName, docId));
}

export async function setDocument(colName: string, docId: string, data: any): Promise<void> {
  await setDoc(doc(ensureDb(), colName, docId), { ...data, updatedAt: Timestamp.now() }, { merge: true });
}

export async function getProductsByCategory(category: string): Promise<any[]> {
  return getDocuments(COLLECTIONS.products, where("category", "==", category));
}

export async function getAllProducts(): Promise<any[]> {
  return getDocuments(COLLECTIONS.products);
}

export async function getFeaturedProducts(limitCount = 9): Promise<any[]> {
  return getDocuments(COLLECTIONS.products, where("featured", "==", true), limit(limitCount));
}

export async function getUserCart(uid: string): Promise<any[]> {
  const cart = await getDocument<{ items: any[] }>(COLLECTIONS.carts, uid);
  return cart?.items || [];
}

export async function saveUserCart(uid: string, items: any[]): Promise<void> {
  await setDoc(doc(ensureDb(), COLLECTIONS.carts, uid), { items, updatedAt: Timestamp.now() });
}

export async function getUserWishlist(uid: string): Promise<any[]> {
  const wish = await getDocument<{ items: any[] }>(COLLECTIONS.wishlists, uid);
  return wish?.items || [];
}

export async function saveUserWishlist(uid: string, items: any[]): Promise<void> {
  await setDoc(doc(ensureDb(), COLLECTIONS.wishlists, uid), { items, updatedAt: Timestamp.now() });
}

export async function createUserProfile(uid: string, data: {
  name: string; email: string; phone?: string;
}): Promise<void> {
  await setDoc(doc(ensureDb(), COLLECTIONS.users, uid), {
    uid,
    name: data.name,
    email: data.email,
    phone: data.phone || "",
    createdAt: Timestamp.now(),
    lastLogin: Timestamp.now(),
    status: "active",
    role: "customer",
    wishlistCount: 0,
    cartCount: 0,
    totalOrders: 0,
    totalSpent: 0,
  });
}

export async function updateUserLogin(uid: string): Promise<void> {
  await updateDoc(doc(ensureDb(), COLLECTIONS.users, uid), { lastLogin: Timestamp.now() });
}

export async function getWebsiteImages(): Promise<Record<string, string>> {
  try {
    const images = await getDocuments<{ key: string; url: string }>(COLLECTIONS.websiteImages);
    const map: Record<string, string> = {};
    for (const img of images) map[img.key] = img.url;
    return map;
  } catch {
    return {};
  }
}

export async function setWebsiteImage(key: string, url: string): Promise<void> {
  await setDoc(doc(ensureDb(), COLLECTIONS.websiteImages, key), { key, url, updatedAt: Timestamp.now() });
}

export async function deleteWebsiteImage(key: string): Promise<void> {
  await deleteDocument(COLLECTIONS.websiteImages, key);
}

export async function saveOrder(order: any): Promise<string> {
  return addDocument(COLLECTIONS.orders, order);
}

export async function getAllOrders(): Promise<any[]> {
  return getDocuments(COLLECTIONS.orders, orderBy("createdAt", "desc"));
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  await updateDocument(COLLECTIONS.orders, orderId, { status });
}
