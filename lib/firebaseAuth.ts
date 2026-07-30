import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, updateProfile, sendPasswordResetEmail as fbSendReset, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
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

/**
 * Re-authenticates the current user with their current password, then updates
 * to a new password. Requires that the user is currently signed in via Firebase Auth.
 *
 * Throws if:
 *  - No user is signed in
 *  - currentPassword is wrong (auth/invalid-credential)
 *  - newPassword is too weak (auth/weak-password)
 *  - Session is too old (auth/requires-recent-login) — reauthentication handles this
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const a = requireAuth();
  const user = a.currentUser;
  if (!user || !user.email) throw new Error("No authenticated user");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
  console.log("[Firebase Auth] password changed successfully");
}
