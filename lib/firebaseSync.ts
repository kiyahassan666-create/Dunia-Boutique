import {
  getDocuments, getDocument, addDocument, setDocument, updateDocument,
  getUserCart, saveUserCart, getUserWishlist, saveUserWishlist,
} from "./firebaseDb";
import { db } from "./firebase";

const CACHE_PREFIX = "dunia_cache_";

function cacheGet<T = any[]>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) as T : null;
  } catch { return null; }
}

function cacheSet(key: string, data: any): void {
  try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data)); } catch {}
}

function isOnline(): boolean {
  return !!db;
}

export async function syncUserToFirestore(uid: string, data: { email: string; name?: string }): Promise<void> {
  if (!isOnline()) { cacheSet(`user_${uid}`, data); return; }
  try {
    await setDocument("users", uid, {
      uid,
      name: data.name || "",
      email: data.email,
      lastLogin: new Date().toISOString(),
      status: "active",
      role: "customer",
    });
  } catch (err) {
    console.warn("Firestore sync error (user):", err);
  }
}

export async function getCartItems(uid: string): Promise<any[]> {
  if (!isOnline()) return cacheGet(`cart_${uid}`) || [];
  try {
    const items = await getUserCart(uid);
    cacheSet(`cart_${uid}`, items);
    return items;
  } catch { return cacheGet(`cart_${uid}`) || []; }
}

export async function saveCartItems(uid: string, items: any[]): Promise<void> {
  cacheSet(`cart_${uid}`, items);
  if (!isOnline()) return;
  try {
    await saveUserCart(uid, items);
  } catch (err) {
    console.warn("Firestore sync error (cart):", err);
  }
}

export async function getWishlistItems(uid: string): Promise<any[]> {
  if (!isOnline()) return cacheGet(`wishlist_${uid}`) || [];
  try {
    const items = await getUserWishlist(uid);
    cacheSet(`wishlist_${uid}`, items);
    return items;
  } catch { return cacheGet(`wishlist_${uid}`) || []; }
}

export async function saveWishlistItems(uid: string, items: any[]): Promise<void> {
  cacheSet(`wishlist_${uid}`, items);
  if (!isOnline()) return;
  try {
    await saveUserWishlist(uid, items);
  } catch (err) {
    console.warn("Firestore sync error (wishlist):", err);
  }
}

export async function saveOrderToFirestore(order: any): Promise<string> {
  if (!isOnline()) {
    const id = order.id || `ORD-${Date.now()}`;
    const local = cacheGet("orders") || [];
    local.unshift({ ...order, id });
    cacheSet("orders", local);
    return id;
  }
  try {
    return await addDocument("orders", order);
  } catch (err) {
    console.warn("Firestore sync error (order):", err);
    const id = order.id || `ORD-${Date.now()}`;
    const local = cacheGet("orders") || [];
    local.unshift({ ...order, id });
    cacheSet("orders", local);
    return id;
  }
}

export async function getOrdersFromFirestore(): Promise<any[]> {
  if (!isOnline()) return cacheGet("orders") || [];
  try {
    const orders = await getDocuments("orders");
    cacheSet("orders", orders);
    return orders;
  } catch { return cacheGet("orders") || []; }
}

export async function updateOrderInFirestore(orderId: string, data: any): Promise<void> {
  if (!isOnline()) {
    const local = cacheGet("orders") || [];
    const idx = local.findIndex((o: any) => o.id === orderId);
    if (idx !== -1) { local[idx] = { ...local[idx], ...data }; cacheSet("orders", local); }
    return;
  }
  await updateDocument("orders", orderId, data);
}
