"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const err = await resetPassword(email);
    if (err) {
      setError(err);
    } else {
      setMessage("If an account exists with this email, you will receive password reset instructions.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0F0F0F] flex items-center justify-center px-6 pt-24">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-2xl tracking-wider text-charcoal dark:text-[#E8E0D8]">Reset Password</h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-warm-gray font-body mt-2">Enter your email to receive instructions</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-xs text-red-500 font-body text-center bg-red-50 dark:bg-red-900/20 px-4 py-2">{error}</p>}
          {message && <p className="text-xs text-green-600 font-body text-center bg-green-50 dark:bg-green-900/20 px-4 py-2">{message}</p>}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold transition-colors" placeholder="your@email.com" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-charcoal dark:bg-gold py-3.5 text-[10px] tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body transition-all hover:bg-gold hover:text-charcoal dark:hover:bg-ivory dark:hover:text-charcoal disabled:opacity-50">{loading ? "Sending..." : "Send Instructions"}</button>
        </form>
        <p className="text-center text-xs text-warm-gray font-body mt-6">
          <Link href="/login" className="text-charcoal dark:text-gold underline hover:no-underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
