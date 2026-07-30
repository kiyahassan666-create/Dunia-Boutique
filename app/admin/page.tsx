"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDocuments } from "@/lib/firebaseDb";
import { formatKES } from "@/lib/currency";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 7, orders: 0, users: 0, pendingOrders: 0 });
  const [totalIncome, setTotalIncome] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [categoryIncome, setCategoryIncome] = useState<{ category: string; total: number; count: number }[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load non-order stats once
  useEffect(() => {
    (async () => {
      try {
        const [allProducts, allUsers] = await Promise.all([
          getDocuments("products"),
          getDocuments("users"),
        ]);
        setStats(prev => ({ ...prev, products: allProducts.length, users: allUsers.length }));
      } catch {}
    })();
  }, []);

  // Real-time listener for paid orders (revenue tracking)
  useEffect(() => {
    if (!db) return;

    // Only Processing and Delivered orders count as revenue
    const paidQuery = query(
      collection(db, "orders"),
      where("status", "in", ["Processing", "Delivered"])
    );

    const unsub = onSnapshot(paidQuery, (snap) => {
      const paidOrders = snap.docs.map(d => {
        const data = d.data();
        return { ...data, id: d.id, orderCode: data?.id || data?.orderCode || "" };
      });

      const now = new Date();
      const todayStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const total = paidOrders.reduce((s: number, o: any) => s + (o.total || 0), 0);
      setTotalIncome(total);

      const todayOrders = paidOrders.filter((o: any) => o.date === todayStr);
      const monthOrders = paidOrders.filter((o: any) => o.date && o.date.startsWith(monthStr));
      setTodayCount(todayOrders.length);
      setMonthCount(monthOrders.length);
      setTodayTotal(todayOrders.reduce((s: number, o: any) => s + (o.total || 0), 0));
      setMonthTotal(monthOrders.reduce((s: number, o: any) => s + (o.total || 0), 0));

      const catMap: Record<string, { category: string; total: number; count: number }> = {};
      for (const order of paidOrders) {
        const items = (order as any).items || [];
        for (const item of items) {
          const cat = item.category || "Uncategorized";
          if (!catMap[cat]) catMap[cat] = { category: cat, total: 0, count: 0 };
          catMap[cat].total += (item.price || 0) * (item.quantity || 1);
          catMap[cat].count += item.quantity || 1;
        }
      }
      setCategoryIncome(Object.values(catMap).sort((a, b) => b.total - a.total));

      setLoaded(true);
    }, () => {
      setLoaded(true);
    });

    return () => unsub();
  }, []);

  // Real-time listener for ALL orders (for count stats)
  useEffect(() => {
    if (!db) return;

    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      const allOrders = snap.docs.map(d => {
        const data = d.data();
        return { ...data, id: d.id, orderCode: data?.id || data?.orderCode || "" };
      });
      setStats(prev => ({
        ...prev,
        orders: allOrders.length,
        pendingOrders: allOrders.filter((o: any) => o.status === "Pending Payment").length,
      }));
    });

    return () => unsub();
  }, []);

  const cards = [
    { label: "Total Products", value: stats.products, href: "/admin/products" },
    { label: "Categories", value: stats.categories, href: "/admin/products" },
    { label: "Orders Received", value: stats.orders, href: "/admin/orders" },
    { label: "Registered Users", value: stats.users, href: "/admin/users" },
  ];

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-serif text-2xl font-medium text-charcoal dark:text-[#E8E0D8]">Dashboard</h1>
        <p className="text-xs text-warm-gray font-body mt-1 tracking-wider uppercase">Live data from Firestore</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map(c => (
          <Link key={c.label} href={c.href} className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-6 hover:border-gold/30 transition-colors">
            <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">{c.label}</p>
            <p className="font-serif text-3xl font-medium text-gold-dark mt-2">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-6 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">Today&apos;s Sales</p>
          <p className="font-serif text-3xl font-medium text-gold-dark mt-2">{loaded ? formatKES(todayTotal) : "—"}</p>
          <p className="text-[9px] text-warm-gray font-body mt-1">{loaded ? `${todayCount} order${todayCount !== 1 ? "s" : ""}` : ""}</p>
        </div>
        <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-6 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">This Month</p>
          <p className="font-serif text-3xl font-medium text-gold-dark mt-2">{loaded ? formatKES(monthTotal) : "—"}</p>
          <p className="text-[9px] text-warm-gray font-body mt-1">{loaded ? `${monthCount} order${monthCount !== 1 ? "s" : ""}` : ""}</p>
        </div>
        <Link href="/admin/orders?status=processing%2Cdelivered" className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-6 text-center hover:border-gold/30 transition-colors">
          <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">All Time Revenue</p>
          <p className="font-serif text-3xl font-medium text-gold-dark mt-2">{loaded ? formatKES(totalIncome) : "—"}</p>
          <p className="text-[9px] text-warm-gray font-body mt-1">{loaded ? `${stats.orders} order${stats.orders !== 1 ? "s" : ""}` : ""}</p>
        </Link>
        <Link href="/admin/orders?status=pending_payment" className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-6 text-center hover:border-gold/30 transition-colors">
          <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">Pending Orders</p>
          <p className="font-serif text-3xl font-medium text-amber-500 mt-2">{stats.pendingOrders}</p>
        </Link>
      </div>

      {loaded && categoryIncome.length > 0 && (
        <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8">
          <h2 className="font-serif text-xl font-medium text-charcoal dark:text-[#E8E0D8] mb-6">Income by Category</h2>
          <div className="space-y-3">
            {categoryIncome.map(cat => (
              <div key={cat.category} className="flex items-center justify-between border-b border-gold/5 pb-3">
                <div>
                  <span className="font-serif text-sm text-charcoal dark:text-[#E8E0D8]">{cat.category}</span>
                  <span className="ml-3 text-[10px] text-warm-gray font-body">({cat.count} items)</span>
                </div>
                <span className="font-serif text-base text-gold-dark font-medium">{formatKES(cat.total)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <span className="font-serif text-base font-medium text-charcoal dark:text-[#E8E0D8]">Total Income</span>
              <span className="font-serif text-xl text-gold-dark font-medium">{formatKES(totalIncome)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
