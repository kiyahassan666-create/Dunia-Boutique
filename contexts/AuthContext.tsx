"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { syncUserToFirestore } from "@/lib/firebaseSync";
import { createUserProfile, getDocument } from "@/lib/firebaseDb";

export interface AuthUser {
  email: string;
  name?: string;
  uid?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, name: string) => Promise<string | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
  showGuestModal: boolean;
  setShowGuestModal: (v: boolean) => void;
  guestAction: string | null;
  triggerGuestModal: (action: string) => void;
}

const AuthContext = createContext<AuthContextType>(null!);

const TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_MS = 1 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestAction, setGuestAction] = useState<string | null>(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
  }, []);

  const startInactivityTimer = useCallback(() => {
    clearTimers();
    warningRef.current = setTimeout(() => setShowTimeoutWarning(true), TIMEOUT_MS - WARNING_MS);
    timeoutRef.current = setTimeout(() => doLogout(), TIMEOUT_MS);
  }, [clearTimers]);

  const resetInactivityTimer = useCallback(() => {
    if (user) startInactivityTimer();
  }, [user, startInactivityTimer]);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(firebaseAuth, (fbUser) => {
      if (fbUser) {
        setUser({
          email: fbUser.email || "",
          name: fbUser.displayName || undefined,
          uid: fbUser.uid,
        });
        (async () => {
          try {
            const existing = await getDocument("users", fbUser.uid);
            if (!existing) {
              await createUserProfile(fbUser.uid, { name: fbUser.displayName || "", email: fbUser.email || "" });
            } else {
              await syncUserToFirestore(fbUser.uid, { email: fbUser.email || "", name: fbUser.displayName || undefined });
            }
          } catch {}
        })();
      } else {
        setUser(null);
        setShowTimeoutWarning(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (user) startInactivityTimer();
    else clearTimers();
    return clearTimers;
  }, [user, startInactivityTimer, clearTimers]);

  useEffect(() => {
    if (!user) return;
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    for (const e of events) window.addEventListener(e, resetInactivityTimer);
    return () => { for (const e of events) window.removeEventListener(e, resetInactivityTimer); };
  }, [user, resetInactivityTimer]);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const { signIn } = await import("@/lib/firebaseAuth");
      const fbUser = await signIn(email, password);
      if (fbUser?.uid) {
        await syncUserToFirestore(fbUser.uid, { email, name: fbUser.displayName || undefined });
      }
      return null;
    } catch (err: any) {
      if (err.message === "auth/not-configured") return "Firebase is not configured.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") return "Invalid email or password.";
      if (err.code === "auth/too-many-requests") return "Too many attempts. Please try again later.";
      if (err.code === "auth/invalid-email") return "Invalid email address.";
      if (err.code === "auth/user-disabled") return "This account has been disabled.";
      return err.message || "Login failed. Please try again.";
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<string | null> => {
    try {
      const { signUp } = await import("@/lib/firebaseAuth");
      const fbUser = await signUp(email, password, name);
      if (fbUser?.uid) {
        await createUserProfile(fbUser.uid, { name, email });
        await syncUserToFirestore(fbUser.uid, { email, name });
      }
      return null;
    } catch (err: any) {
      if (err.message === "auth/not-configured") return "Firebase is not configured.";
      if (err.code === "auth/email-already-in-use") return "An account with this email already exists.";
      if (err.code === "auth/weak-password") return "Password is too weak. Use at least 6 characters.";
      if (err.code === "auth/invalid-email") return "Invalid email address.";
      if (err.code === "auth/operation-not-allowed") return "Email/password signup not enabled in Firebase Console.";
      return err.message || "Signup failed. Please try again.";
    }
  };

  const doLogout = useCallback(async () => {
    try {
      const { signOut } = await import("@/lib/firebaseAuth");
      await signOut();
    } catch {}
    clearTimers();
    setShowTimeoutWarning(false);
  }, [clearTimers]);

  const logout = async () => {
    await doLogout();
    router.push("/");
  };

  const resetPassword = async (email: string): Promise<string | null> => {
    try {
      const { sendPasswordResetEmail } = await import("@/lib/firebaseAuth");
      await sendPasswordResetEmail(email);
      return null;
    } catch (err: any) {
      if (err.message === "auth/not-configured") return "Firebase is not configured.";
      return err.message || "Failed to send reset email.";
    }
  };

  const triggerGuestModal = (action: string) => {
    setGuestAction(action);
    setShowGuestModal(true);
  };

  const handleStayLoggedIn = () => {
    setShowTimeoutWarning(false);
    resetInactivityTimer();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, resetPassword, showGuestModal, setShowGuestModal, guestAction, triggerGuestModal }}>
      {children}
      {showTimeoutWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6">
          <div className="bg-ivory dark:bg-[#0A0A0A] border border-gold/10 p-8 max-w-sm w-full text-center">
            <p className="font-serif text-lg text-charcoal dark:text-[#E8E0D8]">Session Expiring</p>
            <p className="text-xs text-warm-gray font-body mt-3">You will be logged out in 1 minute due to inactivity.</p>
            <div className="flex gap-3 mt-6 justify-center">
              <button onClick={handleStayLoggedIn} className="bg-charcoal dark:bg-gold px-6 py-3 text-[10px] tracking-[0.2em] uppercase text-ivory dark:text-charcoal font-body hover:bg-gold hover:text-charcoal transition-colors">Stay Logged In</button>
              <button onClick={logout} className="border border-gold/20 px-6 py-3 text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body hover:text-charcoal transition-colors">Logout</button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
