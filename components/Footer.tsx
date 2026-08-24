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
  { name: "Instagram", href: "https://www.instagram.com/dunia.boutiques?igsh=cG1oMDZidDJxeDhj&utm_source=qr", label: "IG" },
  { name: "TikTok", href: "https://www.tiktok.com/@dunia.boutique?_r=1&_t=ZS-98JDCW8egB3", label: "TK" },
  { name: "Snapchat", href: "https://snapchat.com/t/Nq2nWrrI", label: "SC" },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="relative bg-charcoal dark:bg-black px-6 pb-10 pt-20 lg:px-12 lg:pt-24 lg:pb-12">
      {/* A visible top accent + shadow so the footer reads as clearly separate from the section above it, on every page */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-8 text-center sm:text-left">
          <div className="sm:col-span-2 md:col-span-1 flex flex-col items-center sm:items-start">
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
              <div className="flex flex-col gap-3.5 sm:gap-3">
                {col.links.map((link) => {
                  let href = "#";
                  if (link === "Contact Us") href = "/contact";
                  else if (link === "WhatsApp") href = "https://wa.me/254725133957";
                  else if (link === "Instagram") href = "https://www.instagram.com/dunia.boutiques?igsh=cG1oMDZidDJxeDhj&utm_source=qr";
                  else if (link === "TikTok") href = "https://www.tiktok.com/@dunia.boutique?_r=1&_t=ZS-98JDCW8egB3";
                  else if (link === "Snapchat") href = "https://snapchat.com/t/Nq2nWrrI";
                  else if (link === "Size Guide") href = "#";
                  else if (link === "Shipping & Returns") href = "#";
                  else if (link === "FAQ") href = "#";
                  else if (link === "New Arrivals") href = "/bags";
                  else if (link === "Best Sellers") href = "/";
                  else if (link === "The Abaya Edit") href = "/abayas";
                  else if (link === "Jewelry Collection") href = "/jewelry";
                  const isExternal = href.startsWith("http");
                  return isExternal ? (
                    <a
                      key={link}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-sm text-ivory/40 hover:text-gold transition-colors cursor-pointer"
                    >
                      {link}
                    </a>
                  ) : (
                    <Link
                      key={link}
                      href={href}
                      className="font-serif text-sm text-ivory/40 hover:text-gold transition-colors"
                    >
                      {link}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-7 border-t border-ivory/10 flex flex-col md:flex-row items-center justify-between gap-5">
          <span className="text-[10px] tracking-[0.15em] text-ivory/25 font-body text-center">
            &copy; 2026 Dunia Boutique. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] tracking-[0.2em] uppercase text-ivory/25 hover:text-gold transition-colors font-body cursor-pointer"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
