import type { DataProvider, Product, Category, Order, User, Review } from "./types";

// TODO: confirm once Firebase project is created
// This file is structurally complete but unconnected until real credentials are added.
// Install `firebase` and `firebase-admin` packages, then uncomment and wire.
//
// import { initializeApp } from "firebase/app";
// import {
//   getFirestore, collection, doc, getDocs, getDoc,
//   addDoc, updateDoc, deleteDoc, query, where,
// } from "firebase/firestore";
//
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };
//
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

export const firebaseProvider: DataProvider = {
  async getProducts() {
    // const snap = await getDocs(collection(db, "products"));
    // return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
    throw new Error("Firebase not configured. Set NEXT_PUBLIC_DB_PROVIDER=mock to use the mock provider.");
  },
  async getProductBySlug(_slug: string) {
    throw new Error("Firebase not configured.");
  },
  async getProductById(_id: string) {
    throw new Error("Firebase not configured.");
  },
  async createProduct(_data) {
    throw new Error("Firebase not configured.");
  },
  async updateProduct(_id, _data) {
    throw new Error("Firebase not configured.");
  },
  async deleteProduct(_id) {
    throw new Error("Firebase not configured.");
  },
  async getCategories() {
    throw new Error("Firebase not configured.");
  },
  async getCategoryBySlug(_slug: string) {
    throw new Error("Firebase not configured.");
  },
  async createCategory(_data) {
    throw new Error("Firebase not configured.");
  },
  async updateCategory(_id, _data) {
    throw new Error("Firebase not configured.");
  },
  async deleteCategory(_id) {
    throw new Error("Firebase not configured.");
  },
  async getOrders() {
    throw new Error("Firebase not configured.");
  },
  async getOrderById(_id: string) {
    throw new Error("Firebase not configured.");
  },
  async createOrder(_data) {
    throw new Error("Firebase not configured.");
  },
  async updateOrder(_id, _data) {
    throw new Error("Firebase not configured.");
  },
  async deleteOrder(_id) {
    throw new Error("Firebase not configured.");
  },
  async getUsers() {
    throw new Error("Firebase not configured.");
  },
  async getUserById(_id: string) {
    throw new Error("Firebase not configured.");
  },
  async createUser(_data) {
    throw new Error("Firebase not configured.");
  },
  async updateUser(_id, _data) {
    throw new Error("Firebase not configured.");
  },
  async deleteUser(_id) {
    throw new Error("Firebase not configured.");
  },
  async getReviews(_productId: string) {
    throw new Error("Firebase not configured.");
  },
  async createReview(_data) {
    throw new Error("Firebase not configured.");
  },
};
