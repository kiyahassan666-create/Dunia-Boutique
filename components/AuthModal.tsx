"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function AuthModal() {
  const { showGuestModal, setShowGuestModal, guestAction } = useAuth();

  if (!showGuestModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6">
      <div className="bg-ivory dark:bg-[#0A0A0A] border border-gold/10 p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">♕</div>
        <p className="font-serif text-lg text-charcoal dark:text-[#E8E0D8]">Welcome to Dunia Boutique</p>
        <p className="text-xs text-warm-gray font-body mt-3 leading-relaxed">
          Please log in or create an account to {guestAction || "continue"}.
        </p>
        <div className="flex gap-3 mt-6 justify-center">
          <Link href="/login" onClick={() => setShowGuestModal(false)} className="bg-charcoal dark:bg-gold px-6 py-3 text-[10px] tracking-[0.2em] uppercase text-ivory dark:text-charcoal font-body hover:bg-gold hover:text-charcoal transition-colors">Log In</Link>
          <Link href="/signup" onClick={() => setShowGuestModal(false)} className="border border-gold/20 px-6 py-3 text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body hover:text-charcoal transition-colors">Sign Up</Link>
        </div>
        <button onClick={() => setShowGuestModal(false)} className="mt-4 text-[9px] tracking-[0.2em] uppercase text-warm-gray/60 hover:text-warm-gray font-body transition-colors">Continue Browsing</button>
      </div>
    </div>
  );
}
