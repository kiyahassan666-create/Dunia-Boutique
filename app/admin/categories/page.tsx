"use client";

import { useEffect, useState } from "react";
import { getDocuments, setDocument, getDocument } from "@/lib/firebaseDb";
import { getSiteImages } from "@/lib/siteImages";

interface CategoryCard {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  count: number;
}

const DEFAULT_CATEGORIES = [
  { id: "abayas", name: "Abayas", slug: "abayas", description: "", count: 0 },
  { id: "vip-abayas", name: "VIP Abayas", slug: "vip-abayas", description: "", count: 0 },
  { id: "wedding-dirah", name: "Wedding Dirah", slug: "wedding-dirah", description: "", count: 0 },
  { id: "perfumes", name: "Perfumes", slug: "perfumes", description: "", count: 0 },
  { id: "luxury-bags", name: "Luxury Bags", slug: "luxury-bags", description: "", count: 0 },
  { id: "jewelry", name: "Jewelry", slug: "jewelry", description: "", count: 0 },
  { id: "shoes", name: "Shoes", slug: "shoes", description: "", count: 0 },
];

export default function AdminCategories() {
  const [cards, setCards] = useState<CategoryCard[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", slug: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [prods, siteImages] = await Promise.all([
          getDocuments("products"),
          getSiteImages(),
        ]);
        const counts: Record<string, number> = {};
        for (const p of prods) {
          const cat = p.category || "Other";
          counts[cat] = (counts[cat] || 0) + 1;
        }
        const loadedCards: CategoryCard[] = [];
        for (const def of DEFAULT_CATEGORIES) {
          const doc = await getDocument<{ name?: string; description?: string; slug?: string }>("categories", def.id);
          const key = `cat_${def.id.replace(/-/g, "_")}`;
          loadedCards.push({
            ...def,
            name: doc?.name || def.name,
            description: doc?.description || "",
            slug: doc?.slug || def.slug,
            count: counts[def.name] || 0,
            image: siteImages[key] || undefined,
          });
        }
        setCards(loadedCards);
      } catch {}
    })();
  }, []);

  const startEdit = (card: CategoryCard) => {
    setEditing(card.id);
    setEditForm({ name: card.name, description: card.description || "", slug: card.slug });
  };

  const saveCard = async (id: string) => {
    setSaving(true);
    try {
      await setDocument("categories", id, {
        name: editForm.name,
        description: editForm.description,
        slug: editForm.slug,
      });
      setCards(prev => prev.map(c => c.id === id ? { ...c, name: editForm.name, description: editForm.description, slug: editForm.slug } : c));
      setEditing(null);
    } catch {}
    setSaving(false);
  };

  const CATEGORY_KEYS: Record<string, string> = {
    "Abayas": "cat_abayas", "VIP Abayas": "cat_vip_abayas", "Wedding Dirah": "cat_wedding_dirah",
    "Perfumes": "cat_perfumes", "Luxury Bags": "cat_bags", "Jewelry": "cat_jewelry", "Shoes": "cat_shoes",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-medium text-charcoal dark:text-[#E8E0D8]">Categories</h1>
        <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mt-1">{cards.length} categories — edit card names, descriptions, and slugs (URL path). Upload card images in Media page.</p>
      </div>
      <div className="border border-gold/10">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gold/10">
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Image</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Name</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Slug</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Description</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Products</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cards.map(card => (
              <tr key={card.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="w-10 h-14 overflow-hidden bg-charcoal/5">
                    {card.image ? <img src={card.image} alt={card.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-warm-gray/40">No img</div>}
                  </div>
                </td>
                <td className="px-4 py-3 font-serif text-sm text-charcoal dark:text-[#E8E0D8]">
                  {editing === card.id ? (
                    <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-28 border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-2 py-1 text-xs outline-none font-body" />
                  ) : card.name}
                </td>
                <td className="px-4 py-3">
                  {editing === card.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-warm-gray">/</span>
                      <input type="text" value={editForm.slug} onChange={e => setEditForm({ ...editForm, slug: e.target.value })} className="w-28 border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-2 py-1 text-xs outline-none font-body" />
                    </div>
                  ) : (
                    <span className="text-[10px] tracking-[0.15em] text-warm-gray font-body">/{card.slug}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing === card.id ? (
                    <input type="text" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-36 border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-2 py-1 text-xs outline-none font-body" placeholder="e.g. Elegant styles" />
                  ) : (
                    <span className="text-[10px] text-warm-gray/70 font-body">{card.description || "—"}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-serif text-sm text-gold-dark">{card.count}</td>
                <td className="px-4 py-3">
                  {editing === card.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => saveCard(card.id)} disabled={saving} className="text-[10px] tracking-[0.15em] uppercase text-green-600 hover:text-green-700 font-body">{saving ? "..." : "Save"}</button>
                      <button onClick={() => setEditing(null)} className="text-[10px] tracking-[0.15em] uppercase text-warm-gray hover:text-charcoal font-body">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(card)} className="text-[10px] tracking-[0.15em] uppercase text-gold-dark hover:text-gold font-body transition-colors">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
