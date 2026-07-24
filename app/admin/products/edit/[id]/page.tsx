"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDocument, updateDocument } from "@/lib/firebaseDb";
import { convertToKES } from "@/lib/currency";
import { uploadImage, deleteImageFromStorage } from "@/lib/firebaseStorage";

const CATEGORIES = ["Abayas", "VIP Abayas", "Wedding Dirah", "Perfumes", "Luxury Bags", "Jewelry", "Shoes"];

export default function EditProduct() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [form, setForm] = useState({ name: "", category: "Abayas", price: "", image: "", badge: "", description: "", sizes: "", colors: "", material: "", stock: "10", featured: false });
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (form.image && form.image.startsWith("https://firebasestorage.googleapis.com")) {
        await deleteImageFromStorage(form.image);
      }
      const url = await uploadImage(file, "products");
      setForm({ ...form, image: url });
      setPreview(url);
    } catch {
      alert("Upload failed. Make sure Firebase Storage is enabled.");
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadImage(file, "products");
        setGallery(prev => [...prev, url]);
      }
    } catch {
      alert("Gallery upload failed.");
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeGalleryImage = async (url: string) => {
    await deleteImageFromStorage(url);
    setGallery(prev => prev.filter(u => u !== url));
  };

  const handleUrlChange = (url: string) => {
    setForm({ ...form, image: url });
    setPreview(url);
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = await getDocument("products", id);
        if (p) {
          setForm({
            name: p.name || "",
            category: p.category || "Abayas",
            price: String(p.originalPrice || Math.round((p.price || 0) / 130) || ""),
            image: p.image || "",
            badge: p.badge || "",
            description: p.description || "",
            sizes: (p.sizes || []).join(", "),
            colors: (p.colors || []).map((c: any) => `${c.name}|${c.hex}`).join(", "),
            material: p.material || "",
            stock: String(p.stock || 10),
            featured: p.featured || false,
          });
          if (p.images) setGallery(p.images);
        }
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const colors = form.colors ? form.colors.split(",").map((c: string) => {
      const [name, hex] = c.trim().split("|");
      return { name: name?.trim() || c.trim(), hex: hex?.trim() || "#000000" };
    }) : [];
    await updateDocument("products", id, {
      name: form.name,
      category: form.category,
      price: convertToKES(Number(form.price)),
      originalPrice: Number(form.price),
      image: form.image,
      images: gallery.length > 0 ? gallery : [],
      badge: form.badge || null,
      description: form.description,
      sizes: form.sizes ? form.sizes.split(",").map((s: string) => s.trim()) : [],
      colors,
      material: form.material,
      stock: Number(form.stock),
      featured: form.featured,
    });
    router.push("/admin/products");
  };

  if (loading) return <p className="text-warm-gray font-body text-sm">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl font-medium text-charcoal dark:text-[#E8E0D8] mb-8">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Product Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" required />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Price (USD)</label>
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" required min="0" />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Badge</label>
            <select value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold">
              <option value="">None</option>
              <option value="New">New</option>
              <option value="Best Seller">Best Seller</option>
              <option value="Sale">Sale</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Stock</label>
            <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" min="0" />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Material</label>
            <input type="text" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Sizes (comma separated)</label>
            <input type="text" value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Colors (name|hex, comma separated)</label>
            <input type="text" value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="accent-charcoal dark:accent-gold" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">Featured product</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Main Image</label>
            <div className="flex gap-3">
              <input type="url" value={form.image} onChange={e => handleUrlChange(e.target.value)} placeholder="Paste image URL..." className="flex-1 border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" />
              <label className="cursor-pointer border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body hover:bg-charcoal hover:text-ivory dark:hover:bg-gold dark:hover:text-charcoal transition-colors flex items-center">
                {uploading ? "..." : "Upload"}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            {(preview || form.image) && (
              <div className="mt-3 relative w-32 h-32 border border-gold/10 overflow-hidden bg-ivory dark:bg-[#0A0A0A]">
                <img src={preview || form.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Gallery Images (optional)</label>
            <label className="cursor-pointer inline-flex border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body hover:bg-charcoal hover:text-ivory dark:hover:bg-gold dark:hover:text-charcoal transition-colors">
              {uploading ? "Uploading..." : "Choose Images"}
              <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
            </label>
            {gallery.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {gallery.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 border border-gold/10 overflow-hidden bg-ivory dark:bg-[#0A0A0A] group">
                    <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGalleryImage(url)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] leading-none rounded-full opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="flex-1 bg-charcoal dark:bg-gold py-3.5 text-[10px] tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body transition-all hover:bg-gold hover:text-charcoal dark:hover:bg-ivory">Save Changes</button>
          <button type="button" onClick={() => router.push("/admin/products")} className="border border-charcoal/20 dark:border-ivory/20 px-6 py-3.5 text-[10px] tracking-[0.2em] uppercase text-charcoal dark:text-ivory font-body transition-colors hover:bg-charcoal hover:text-ivory dark:hover:bg-ivory dark:hover:text-charcoal">Cancel</button>
        </div>
      </form>
    </div>
  );
}
