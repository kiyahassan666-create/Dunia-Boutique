"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: "◈" },
  { label: "Products", href: "/admin/products", icon: "◉" },
  { label: "Orders", href: "/admin/orders", icon: "◎" },
  { label: "Users", href: "/admin/users", icon: "♢" },
  { label: "Media", href: "/admin/media", icon: "⊡" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token && pathname !== "/admin/login") {
      router.replace("/admin/login");
    } else if (token) {
      setAuthed(true);
    }
  }, [pathname, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!authed) return null;

  return (
    <div className="min-h-screen bg-[#FAF5F0] dark:bg-[#0F0F0F]">
      <header className="relative z-30 border-b border-gold/10 bg-ivory dark:bg-[#0A0A0A] h-16 flex items-center px-6 lg:px-12">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] transition-colors mr-4 text-lg leading-none" aria-label="Toggle sidebar">
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <Link href="/admin">
          <span className="font-serif text-lg tracking-wider text-charcoal dark:text-[#E8E0D8]">Dunia <span className="text-gold">Boutique</span></span>
          <span className="hidden sm:inline text-[9px] tracking-[0.3em] uppercase text-warm-gray font-body ml-2">Admin</span>
        </Link>
      </header>
      <div className="flex">
        <aside className={`z-20 w-56 border-r border-gold/10 bg-ivory dark:bg-[#0A0A0A] px-5 py-8 flex flex-col min-h-[calc(100vh-4rem)] flex-shrink-0 overflow-y-auto ${sidebarOpen ? "fixed left-0 top-16 bottom-0 z-30 lg:relative lg:top-auto lg:z-auto" : "hidden lg:flex"}`}>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs tracking-wider uppercase font-body transition-colors ${
                  pathname === item.href
                    ? "bg-charcoal/5 dark:bg-ivory/5 text-charcoal dark:text-[#E8E0D8]"
                    : "text-warm-gray dark:text-[#A09890] hover:text-charcoal dark:hover:text-[#E8E0D8]"
                }`}
              >
                <span className="text-gold text-sm">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <main className="flex-1 overflow-auto min-w-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
