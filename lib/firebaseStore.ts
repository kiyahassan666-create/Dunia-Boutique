import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, QueryConstraint, DocumentData } from "firebase/firestore";
import { db } from "./firebase";

const COLLECTIONS = {
  products: "products",
  categories: "categories",
  orders: "orders",
  users: "users",
  siteImages: "siteImages",
};

function isFirebaseReady(): boolean {
  return !!db;
}

export async function getCollection<T = DocumentData>(colName: string, ...constraints: QueryConstraint[]): Promise<T[]> {
  if (!isFirebaseReady()) {
    const local = localStorage.getItem(`dunia_${colName}`);
    return local ? JSON.parse(local) : [];
  }
  const colRef = collection(db!, colName);
  const q = constraints.length ? query(colRef, ...constraints) : colRef;
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as T));
}

export async function getDocument<T = DocumentData>(colName: string, docId: string): Promise<T | null> {
  if (!isFirebaseReady()) {
    const local = localStorage.getItem(`dunia_${colName}`);
    if (!local) return null;
    const items = JSON.parse(local);
    return items.find((i: any) => i.id === docId) || null;
  }
  const docRef = doc(db!, colName, docId);
  const snap = await getDoc(docRef);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as T) : null;
}

export async function addDocument(colName: string, data: any): Promise<string> {
  if (!isFirebaseReady()) {
    const local = JSON.parse(localStorage.getItem(`dunia_${colName}`) || "[]");
    local.unshift(data);
    localStorage.setItem(`dunia_${colName}`, JSON.stringify(local));
    return data.id || `local_${Date.now()}`;
  }
  const colRef = collection(db!, colName);
  const docRef = await addDoc(colRef, data);
  return docRef.id;
}

export async function updateDocument(colName: string, docId: string, data: any): Promise<void> {
  if (!isFirebaseReady()) {
    const local = JSON.parse(localStorage.getItem(`dunia_${colName}`) || "[]");
    const idx = local.findIndex((i: any) => i.id === docId);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...data };
      localStorage.setItem(`dunia_${colName}`, JSON.stringify(local));
    }
    return;
  }
  const docRef = doc(db!, colName, docId);
  await updateDoc(docRef, data);
}

export async function deleteDocument(colName: string, docId: string): Promise<void> {
  if (!isFirebaseReady()) {
    const local = JSON.parse(localStorage.getItem(`dunia_${colName}`) || "[]");
    const updated = local.filter((i: any) => i.id !== docId);
    localStorage.setItem(`dunia_${colName}`, JSON.stringify(updated));
    return;
  }
  const docRef = doc(db!, colName, docId);
  await deleteDoc(docRef);
}

export { COLLECTIONS, isFirebaseReady };
