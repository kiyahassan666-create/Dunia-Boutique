import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

console.log("[Firebase] Config loaded:", {
  hasApiKey: !!firebaseConfig.apiKey,
  hasProjectId: !!firebaseConfig.projectId,
  hasAll: !!(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.storageBucket && firebaseConfig.messagingSenderId && firebaseConfig.appId),
});

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

const hasFirebaseConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

if (typeof window !== "undefined") {
  if (hasFirebaseConfig && !getApps().length) {
    console.log("[Firebase] Initializing Firebase with project:", firebaseConfig.projectId);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("[Firebase] Firebase initialized successfully");
  } else if (!hasFirebaseConfig) {
    console.warn("[Firebase] Missing credentials — Firebase Auth & Firestore will not be available. Add NEXT_PUBLIC_FIREBASE_* env vars to .env.local");
  } else {
    console.log("[Firebase] Firebase already initialized");
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
}

export { app, auth, db, storage, hasFirebaseConfig };
