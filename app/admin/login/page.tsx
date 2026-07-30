"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { signIn, signOut } from "@/lib/firebaseAuth";
import { db } from "@/lib/firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: Authenticate with Firebase Auth
      const user = await signIn(email, password);

      // Step 2: Check if this user is in the admins collection
      if (db) {
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (!adminDoc.exists()) {
          // User is authenticated but not an admin — revoke session
          await signOut();
          setError("This account is not authorized for admin access.");
          setLoading(false);
          return;
        }
      }

      // Step 3: Authorized admin — redirect to dashboard
      router.push("/admin");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid admin credentials.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        // Don't leak "This account is not authorized" as an auth error — it's already handled above
        setError(err.message || "Login failed. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0F0F0F] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-2xl tracking-wider text-charcoal dark:text-[#E8E0D8]">Dunia <span className="text-gold">Boutique</span></h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-warm-gray font-body mt-2">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-xs text-red-500 font-body text-center bg-red-50 dark:bg-red-900/20 px-4 py-2">{error}</p>}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Admin Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold transition-colors" placeholder="your@email.com" required />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Admin Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold transition-colors" placeholder="••••••" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-charcoal dark:bg-gold py-3.5 text-[10px] tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body transition-all hover:bg-gold hover:text-charcoal dark:hover:bg-ivory dark:hover:text-charcoal disabled:opacity-50">{loading ? "Verifying..." : "Access Admin"}</button>
        </form>
        <p className="text-center text-[9px] tracking-[0.15em] uppercase text-warm-gray/60 font-body mt-6">Store administrators only</p>
      </div>
    </div>
  );
}
