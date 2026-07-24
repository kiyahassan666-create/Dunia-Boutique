"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "admin@dunia.com";
const ADMIN_PASS = "admin123";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        sessionStorage.setItem("admin_token", "authenticated");
        router.push("/admin");
      } else {
        setError("Invalid credentials. Use admin@dunia.com / admin123");
      }
      setLoading(false);
    }, 600);
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
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold transition-colors" placeholder="admin@dunia.com" required />
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
