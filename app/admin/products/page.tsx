"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDocuments, deleteDocument } from "@/lib/firebaseDb";
import { formatKES } from "@/lib/currency";
import { deleteImageFromStorage } from "@/lib/firebaseStorage";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const all = await getDocuments("products");
        setProducts(all);
      } catch {}
    })();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const p = products.find(pr => pr.id === id);
      if (p?.image && p.image.startsWith("https://firebasestorage.googleapis.com")) {
        await deleteImageFromStorage(p.image);
      }
      if (p?.images) {
        for (const url of p.images) {
          if (url.startsWith("https://firebasestorage.googleapis.com")) {
            await deleteImageFromStorage(url);
          }
        }
      }
      await deleteDocument("products", id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-medium text-charcoal dark:text-[#E8E0D8]">Products</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mt-1">{filtered.length} products</p>
        </div>
        <Link href="/admin/products/new" className="bg-charcoal dark:bg-gold px-6 py-3 text-[10px] tracking-[0.2em] uppercase text-ivory dark:text-charcoal font-body hover:bg-gold hover:text-charcoal dark:hover:bg-ivory transition-colors">+ New Product</Link>
      </div>
      <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full border border-gold/10 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold/30 transition-colors mb-6 font-body" />
      <div className="border border-gold/10 overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-gold/10">
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Image</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Name</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Category</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Price</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Badge</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                <td className="px-4 py-3">
                  <img src={p.image} alt={p.name} className="w-12 h-16 object-cover" />
                </td>
                <td className="px-4 py-3 font-serif text-sm text-charcoal dark:text-[#E8E0D8]">{p.name}</td>
                <td className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">{p.category}</td>
                <td className="px-4 py-3 font-serif text-sm text-gold-dark">{formatKES(p.price)}</td>
                <td className="px-4 py-3">{p.badge ? <span className="text-[9px] bg-charcoal text-ivory px-2 py-0.5 uppercase tracking-wider font-body">{p.badge}</span> : <span className="text-[10px] text-warm-gray/50 font-body">—</span>}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Link href={`/admin/products/edit/${p.id}`} className="text-[10px] tracking-[0.15em] uppercase text-gold-dark hover:text-gold font-body transition-colors">Edit</Link>
                  <button onClick={() => handleDelete(p.id)} className="text-[10px] tracking-[0.15em] uppercase text-red-400 hover:text-red-500 font-body transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
