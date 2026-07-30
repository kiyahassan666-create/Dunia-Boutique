"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { formatKES } from "@/lib/currency";
import { OrdersProvider, useOrders } from "@/lib/adminContext";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: "◈" },
  { label: "Products", href: "/admin/products", icon: "◉" },
  { label: "Orders", href: "/admin/orders", icon: "◎" },
  { label: "Users", href: "/admin/users", icon: "♢" },
  { label: "Media", href: "/admin/media", icon: "⊡" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
];

const NOTIFICATION_STORAGE_KEY = "dunia_admin_last_seen";

function getLastSeen(): number {
  try {
    const val = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

function setLastSeen(ts: number): void {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, String(ts));
  } catch {}
}

/** Inner component that can access the shared OrdersContext. */
function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState<"loading" | "authorized" | "denied">("loading");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newOrders, setNewOrders] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);
  const { orders } = useOrders();

  // Single auth flow: Firebase Auth → admins collection → grant/deny
  useEffect(() => {
    // Login page doesn't need guarding
    if (pathname === "/admin/login") {
      setAuthState("authorized");
      return;
    }

    if (!auth) {
      router.replace("/admin/login");
      return;
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setAuthState("denied");
        router.replace("/admin/login");
        return;
      }

      // User is signed into Firebase Auth — verify they're an admin
      try {
        if (db) {
          const adminSnap = await getDoc(doc(db, "admins", fbUser.uid));
          if (!adminSnap.exists()) {
            // Signed in but not in admins collection — revoke and redirect
            if (auth) await fbSignOut(auth);
            setAuthState("denied");
            router.replace("/admin/login");
            return;
          }
        }
        setAuthState("authorized");
      } catch {
        // If Firestore check fails (e.g. network), default to denied
        setAuthState("denied");
        router.replace("/admin/login");
      }
    });

    return () => unsub();
  }, [pathname, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Derive new-order notifications from the shared orders context
  useEffect(() => {
    if (!orders.length) return;
    const lastSeenTs = getLastSeen();
    const recent = orders
      .filter(o => {
        if ((o as any).createdAt?.toMillis) {
          return (o as any).createdAt.toMillis() > lastSeenTs;
        }
        return false;
      })
      .sort((a, b) => {
        const aTime = (a as any).createdAt?.toMillis ? (a as any).createdAt.toMillis() : 0;
        const bTime = (b as any).createdAt?.toMillis ? (b as any).createdAt.toMillis() : 0;
        return bTime - aTime;
      });

    setNewOrders(recent);
    setUnreadCount(recent.length);
  }, [orders]);

  // Mark notifications as seen
  const markAsSeen = useCallback(() => {
    setLastSeen(Date.now());
    setUnreadCount(0);
    setShowNotifications(false);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (pathname === "/admin/login") return <>{children}</>;
  if (authState !== "authorized") return null;

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

        {/* Notification Bell */}
        <div className="ml-auto relative" ref={bellRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] transition-colors p-2"
            aria-label="Notifications"
          >
            <span className="text-lg">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-ivory text-[9px] font-body font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-ivory dark:bg-[#0A0A0A] border border-gold/10 shadow-xl z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gold/10 flex items-center justify-between">
                <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">New Orders</p>
                {newOrders.length > 0 && (
                  <button onClick={markAsSeen} className="text-[9px] tracking-[0.15em] uppercase text-gold-dark hover:text-gold font-body transition-colors">
                    Mark all seen
                  </button>
                )}
              </div>
              {newOrders.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-warm-gray font-body">No new orders</p>
                </div>
              ) : (
                <div>
                  {newOrders.slice(0, 10).map((o) => (
                    <Link
                      key={o.id}
                      href={`/admin/orders`}
                      onClick={markAsSeen}
                      className="flex items-center justify-between px-4 py-3 border-b border-gold/5 hover:bg-gold/5 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-serif text-charcoal dark:text-[#E8E0D8] truncate">{o.orderCode || o.id}</p>
                        <p className="text-[9px] text-warm-gray font-body truncate">{o.customer?.name || o.userEmail || "Guest"}</p>
                      </div>
                      <span className="text-xs font-serif text-gold-dark ml-3 whitespace-nowrap">{formatKES(o.total)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrdersProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </OrdersProvider>
  );
}
