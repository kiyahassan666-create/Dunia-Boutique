"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const COLUMNS = [
  {
    title: "Discover",
    links: ["New Arrivals", "Best Sellers", "The Abaya Edit", "Jewelry Collection"],
  },
  {
    title: "Support",
    links: ["Size Guide", "Shipping & Returns", "Contact Us", "FAQ"],
  },
  {
    title: "Connect",
    links: ["Instagram", "TikTok", "Snapchat", "WhatsApp"],
  },
];

const SOCIALS = [
  { name: "Instagram", href: "#", label: "IG" },
  { name: "TikTok", href: "#", label: "TK" },
  { name: "Snapchat", href: "#", label: "SC" },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="bg-charcoal dark:bg-black px-6 pb-8 pt-16 lg:px-12 lg:pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-serif text-xl tracking-[0.12em] text-ivory">
              DUNIA<span className="text-gold">.</span>
            </Link>
            <p className="mt-4 font-serif text-sm text-ivory/40 leading-relaxed max-w-xs">
              Luxury modest fashion for the modern Muslim woman. Every piece tells a story of heritage, grace, and timeless beauty.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[10px] tracking-[0.3em] uppercase text-gold font-body font-medium mb-5">
                {col.title}
              </h4>
              {col.links.map((link) => {
                let href = "#";
                if (link === "Contact Us") href = "/contact";
                else if (link === "WhatsApp") href = "https://wa.me/254725133957";
                else if (link === "Instagram") href = "#";
                else if (link === "TikTok") href = "#";
                else if (link === "Snapchat") href = "#";
                else if (link === "Size Guide") href = "#";
                else if (link === "Shipping & Returns") href = "#";
                else if (link === "FAQ") href = "#";
                else if (link === "New Arrivals") href = "/bags";
                else if (link === "Best Sellers") href = "/";
                else if (link === "The Abaya Edit") href = "/abayas";
                else if (link === "Jewelry Collection") href = "/jewelry";
                return (
                  <Link
                    key={link}
                    href={href}
                    className="block font-serif text-sm text-ivory/40 hover:text-gold transition-colors mb-3"
                  >
                    {link}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-12 pt-7 border-t border-ivory/10 flex flex-col md:flex-row items-center justify-between gap-5">
          <span className="text-[10px] tracking-[0.15em] text-ivory/25 font-body">
            &copy; 2026 Dunia Boutique. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            {SOCIALS.map((s) => (
              <Link
                key={s.name}
                href={s.href}
                className="text-[10px] tracking-[0.2em] uppercase text-ivory/25 hover:text-gold transition-colors font-body"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
