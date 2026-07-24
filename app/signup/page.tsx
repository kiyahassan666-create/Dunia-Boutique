"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const { signup, user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    const err = await signup(email, password, name);
    if (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0F0F0F] flex items-center justify-center px-6 pt-24">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-2xl tracking-wider text-charcoal dark:text-[#E8E0D8]">Create Account</h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-warm-gray font-body mt-2">Join Dunia Boutique</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-xs text-red-500 font-body text-center bg-red-50 dark:bg-red-900/20 px-4 py-2">{error}</p>}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold transition-colors" placeholder="Aisha M." required />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold transition-colors" placeholder="your@email.com" required />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold transition-colors" placeholder="Min 6 characters" required />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold transition-colors" placeholder="••••••" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-charcoal dark:bg-gold py-3.5 text-[10px] tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body transition-all hover:bg-gold hover:text-charcoal dark:hover:bg-ivory dark:hover:text-charcoal disabled:opacity-50">{loading ? "Creating account..." : "Create Account"}</button>
        </form>
        <p className="text-center text-xs text-warm-gray font-body mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-charcoal dark:text-gold underline hover:no-underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
