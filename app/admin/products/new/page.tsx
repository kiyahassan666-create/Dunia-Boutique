"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDocument } from "@/lib/firebaseDb";
import { convertToKES } from "@/lib/currency";
import { uploadImage, uploadMultipleImages, deleteImageFromStorage } from "@/lib/firebaseStorage";

const CATEGORIES = ["Abayas", "VIP Abayas", "Wedding Dirah", "Perfumes", "Luxury Bags", "Jewelry", "Shoes"];

export default function NewProduct() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", category: "Abayas", price: "", image: "", badge: "", description: "", sizes: "", colors: "", material: "", stock: "10", featured: false });
  const [preview, setPreview] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
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
      const urls = await uploadMultipleImages(Array.from(files), "products");
      setGallery(prev => [...prev, ...urls]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `p${Date.now()}`;
    const colors = form.colors ? form.colors.split(",").map((c: string) => {
      const [name, hex] = c.trim().split("|");
      return { name: name?.trim() || c.trim(), hex: hex?.trim() || "#000000" };
    }) : [];
    await addDocument("products", {
      id,
      name: form.name,
      category: form.category,
      price: convertToKES(Number(form.price)),
      originalPrice: Number(form.price),
      image: form.image || (gallery.length > 0 ? gallery[0] : "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80"),
      images: gallery.length > 0 ? gallery : undefined,
      badge: form.badge || null,
      description: form.description,
      sizes: form.sizes ? form.sizes.split(",").map((s: string) => s.trim()) : [],
      colors,
      material: form.material,
      inStock: true,
      stock: Number(form.stock),
      featured: form.featured,
    }, id);
    router.push("/admin/products");
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-charcoal dark:text-[#E8E0D8] mb-6 sm:mb-8">New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Product Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" required />
          </div>
          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Price (USD)</label>
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" required min="0" placeholder="Will be converted to KES" />
          </div>
          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Badge</label>
            <select value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold">
              <option value="">None</option>
              <option value="New">New</option>
              <option value="Best Seller">Best Seller</option>
              <option value="Sale">Sale</option>
            </select>
          </div>
          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Stock</label>
            <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" min="0" />
          </div>
          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Material</label>
            <input type="text" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Sizes (comma separated, e.g. XS,S,M,L,XL)</label>
            <input type="text" value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Colors (name|hex, comma separated, e.g. Black|#1A1A1A, Ivory|#FFFCF8)</label>
            <input type="text" value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer py-1">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="accent-charcoal dark:accent-gold w-4 h-4" />
              <span className="text-xs tracking-[0.2em] uppercase text-warm-gray font-body">Featured product (shows on homepage)</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Main Image</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="url" value={form.image} onChange={e => handleUrlChange(e.target.value)} placeholder="Paste image URL..." className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" />
              <label className="cursor-pointer border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-6 py-3 text-xs tracking-[0.2em] uppercase text-warm-gray font-body hover:bg-charcoal hover:text-ivory dark:hover:bg-gold dark:hover:text-charcoal transition-colors flex items-center justify-center min-h-[44px]">
                {uploading ? "..." : "Upload"}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            {preview && (
              <div className="mt-3 relative w-32 h-32 border border-gold/10 overflow-hidden bg-ivory dark:bg-[#0A0A0A]">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Gallery Images (optional)</label>
            <label className="cursor-pointer inline-flex border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-6 py-3 text-xs tracking-[0.2em] uppercase text-warm-gray font-body hover:bg-charcoal hover:text-ivory dark:hover:bg-gold dark:hover:text-charcoal transition-colors min-h-[44px] items-center">
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
        <button type="submit" className="w-full bg-charcoal dark:bg-gold py-3.5 text-xs tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body transition-all hover:bg-gold hover:text-charcoal dark:hover:bg-ivory min-h-[48px]">Add Product</button>
      </form>
    </div>
  );
}
