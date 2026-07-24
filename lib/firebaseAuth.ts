import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, updateProfile, sendPasswordResetEmail as fbSendReset } from "firebase/auth";
import { auth } from "./firebase";

function requireAuth() {
  if (!auth) throw new Error("auth/not-configured");
  return auth;
}

export async function signUp(email: string, password: string, displayName?: string) {
  const a = requireAuth();
  console.log("[Firebase Auth] signUp called for:", email);
  const result = await createUserWithEmailAndPassword(a, email, password);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
    console.log("[Firebase Auth] displayName set to:", displayName);
  }
  console.log("[Firebase Auth] signUp success for uid:", result.user.uid);
  return result.user;
}

export async function signIn(email: string, password: string) {
  const a = requireAuth();
  console.log("[Firebase Auth] signIn called for:", email);
  const result = await signInWithEmailAndPassword(a, email, password);
  console.log("[Firebase Auth] signIn success for uid:", result.user.uid);
  return result.user;
}

export async function signOut() {
  if (!auth) return;
  console.log("[Firebase Auth] signOut called");
  await fbSignOut(auth);
  console.log("[Firebase Auth] signOut complete");
}

export async function sendPasswordResetEmail(email: string) {
  const a = requireAuth();
  console.log("[Firebase Auth] sendPasswordResetEmail called for:", email);
  await fbSendReset(a, email);
  console.log("[Firebase Auth] reset email sent");
}
