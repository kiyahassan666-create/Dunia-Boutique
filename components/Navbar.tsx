"use client";

import { useState, useEffect } from "react";
import { Heart, ShoppingBag, User, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getCartItems } from "@/lib/firebaseSync";

const NAV_ITEMS = ["Abayas", "VIP Abayas", "Wedding Dirah", "Perfumes", "Bags", "Jewelry", "Shoes"];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const load = async () => {
      let items: any[];
      if (user?.uid) {
        items = await getCartItems(user.uid!);
      } else {
        try { const raw = localStorage.getItem("guest_cart"); items = raw ? JSON.parse(raw) : []; } catch { items = []; }
      }
      setCartCount(items.reduce((s: number, i: any) => s + (i.quantity || 1), 0));
    };
    load();
    const handler = () => load();
    window.addEventListener("cart-update", handler);
    return () => window.removeEventListener("cart-update", handler);
  }, [user?.uid]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-cream/92 dark:bg-[#0F0F0F]/92 backdrop-blur-2xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
        <Link href="/" className="font-serif text-xl tracking-[0.12em] text-charcoal dark:text-[#E8E0D8]">
          DUNIA<span className="text-gold">.</span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[10px] tracking-[0.25em] uppercase text-warm-gray dark:text-[#A09890] hover:text-charcoal dark:hover:text-[#E8E0D8] transition-colors duration-300 font-body"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Cart icon: now visible on all screen sizes, including mobile top bar */}
          <Link href="/bag" className="flex items-center gap-1 text-warm-gray hover:text-charcoal dark:text-[#A09890] dark:hover:text-[#E8E0D8] transition-colors" aria-label="Bag">
            <ShoppingBag size={17} />
            {cartCount > 0 && <span className="text-[9px] bg-gold text-charcoal rounded-full w-4 h-4 flex items-center justify-center font-body font-medium">{cartCount > 9 ? "9+" : cartCount}</span>}
          </Link>
          {user ? (
            <>
              <Link href="/wishlist" className="hidden md:block text-warm-gray hover:text-charcoal dark:text-[#A09890] dark:hover:text-[#E8E0D8] transition-colors" aria-label="Wishlist">
                <Heart size={17} />
              </Link>
              <button onClick={logout} className="hidden md:block text-warm-gray hover:text-charcoal dark:text-[#A09890] dark:hover:text-[#E8E0D8] transition-colors" aria-label="Logout">
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <Link href="/login" className="hidden md:block text-warm-gray hover:text-charcoal dark:text-[#A09890] dark:hover:text-[#E8E0D8] transition-colors" aria-label="Sign In">
              <User size={17} />
            </Link>
          )}
          <button className="md:hidden text-warm-gray dark:text-[#A09890]" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-gold/10 bg-cream/98 dark:bg-[#0F0F0F]/98 backdrop-blur-2xl">
          <div className="flex flex-col gap-5 px-6 py-7">
            {NAV_ITEMS.map((item) => (
              <Link key={item} href={`/${item.toLowerCase().replace(/\s+/g, "-")}`} className="text-[10px] tracking-[0.25em] uppercase text-warm-gray dark:text-[#A09890] hover:text-charcoal dark:hover:text-[#E8E0D8] font-body" onClick={() => setMobileOpen(false)}>
                {item}
              </Link>
            ))}
            <div className="flex gap-5 pt-4 border-t border-gold/10">
              {user ? (
                <>
                  <Link href="/wishlist" className="text-[10px] tracking-[0.2em] uppercase text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body" onClick={() => setMobileOpen(false)}>Wishlist</Link>
                  <Link href="/checkout" className="text-[10px] tracking-[0.2em] uppercase text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body" onClick={() => setMobileOpen(false)}>Checkout</Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-[10px] tracking-[0.2em] uppercase text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-[10px] tracking-[0.2em] uppercase text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link href="/signup" className="text-[10px] tracking-[0.2em] uppercase text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
