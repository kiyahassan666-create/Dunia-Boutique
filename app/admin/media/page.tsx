"use client";

import { useEffect, useState } from "react";
import { getAllImageEntries, updateImage, IMAGE_DEFAULTS } from "@/lib/siteImages";
import { uploadImage, deleteImageFromStorage } from "@/lib/firebaseStorage";

interface ImageEntry {
  key: string; label: string; defaultUrl: string;
  page: string; section: string; currentUrl: string;
}

export default function AdminMedia() {
  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [pageFilter, setPageFilter] = useState("All");
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const all = await getAllImageEntries();
      setEntries(all);
    })();
  }, []);

  const refresh = async () => {
    const all = await getAllImageEntries();
    setEntries(all);
  };

  const handleUpload = async (key: string, file: File) => {
    setUploading(key);
    try {
      const existing = entries.find(ent => ent.key === key);
      if (existing?.currentUrl && existing.currentUrl.startsWith("https://firebasestorage.googleapis.com")) {
        await deleteImageFromStorage(existing.currentUrl);
      }
      const url = await uploadImage(file, "site");
      await updateImage(key, url);
      await refresh();
    } catch (err) {
      console.error("Media upload failed:", err);
      alert("Upload failed: " + ((err as any)?.message || "Unknown error"));
    }
    setUploading(null);
  };

  const handleUrlSave = async (key: string) => {
    if (urlInput.trim()) {
      await updateImage(key, urlInput.trim());
      await refresh();
    }
    setEditing(null);
  };

  const handleReset = async (key: string) => {
    const def = IMAGE_DEFAULTS.find(i => i.key === key);
    if (def) {
      await updateImage(key, def.defaultUrl);
      await refresh();
    }
  };

  const handleDelete = async (key: string) => {
    const existing = entries.find(ent => ent.key === key);
    if (existing?.currentUrl && existing.currentUrl.startsWith("https://firebasestorage.googleapis.com")) {
      await deleteImageFromStorage(existing.currentUrl);
    }
    await updateImage(key, "");
    await refresh();
  };

  const handleDrop = async (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragKey(null);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const existing = entries.find(ent => ent.key === key);
      if (existing?.currentUrl && existing.currentUrl.startsWith("https://firebasestorage.googleapis.com")) {
        await deleteImageFromStorage(existing.currentUrl);
      }
      const url = await uploadImage(file, "site");
      await updateImage(key, url);
      await refresh();
    } catch (err) {
      console.error("Media drop upload failed:", err);
      alert("Upload failed: " + ((err as any)?.message || "Unknown error"));
    }
  };

  const pages = ["All", ...new Set(entries.map(e => e.page))].sort();
  const filtered = pageFilter === "All" ? entries : entries.filter(e => e.page === pageFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-medium text-charcoal dark:text-[#E8E0D8]">Website Pictures</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mt-1">
            Upload, replace, or delete images. Changes update site-wide automatically.
          </p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {pages.map(p => (
          <button key={p} onClick={() => setPageFilter(p)} className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-body border transition-colors ${pageFilter === p ? "bg-charcoal text-ivory border-charcoal dark:bg-gold dark:text-charcoal" : "border-gold/20 text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8]"}`}>{p}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(entry => (
          <div
            key={entry.key}
            onDragOver={e => { e.preventDefault(); setDragKey(entry.key); }}
            onDragLeave={() => setDragKey(null)}
            onDrop={e => handleDrop(e, entry.key)}
            className={`border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-4 transition-all ${dragKey === entry.key ? "border-gold border-dashed bg-gold/5" : ""}`}
          >
            <div className="relative aspect-[16/9] overflow-hidden mb-3 bg-charcoal/5 dark:bg-ivory/5 group">
              {entry.currentUrl ? (
                <>
                  <img src={entry.currentUrl} alt={entry.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer bg-ivory/90 px-3 py-1.5 text-[9px] tracking-[0.15em] uppercase text-charcoal font-body hover:bg-ivory transition-colors">
                      {uploading === entry.key ? "..." : "Replace"}
                      <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(entry.key, f); e.target.value = ""; }} className="hidden" disabled={!!uploading} />
                    </label>
                    <button onClick={() => handleDelete(entry.key)} className="bg-red-500/90 px-3 py-1.5 text-[9px] tracking-[0.15em] uppercase text-white font-body hover:bg-red-600 transition-colors">Delete</button>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer w-full h-full flex items-center justify-center text-warm-gray/40 text-[10px] tracking-[0.2em] uppercase font-body hover:text-warm-gray/60 transition-colors">
                  <div className="text-center">
                    <span className="text-2xl block mb-1">+</span>
                    {uploading === entry.key ? "Uploading..." : "Click to Upload"}
                  </div>
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(entry.key, f); e.target.value = ""; }} className="hidden" disabled={!!uploading} />
                </label>
              )}
            </div>
            <span className="block text-[10px] tracking-[0.2em] uppercase text-gold-dark font-body">{entry.section}</span>
            <span className="block font-serif text-sm text-charcoal dark:text-[#E8E0D8] mt-0.5">{entry.label}</span>
            <span className="block text-[9px] text-warm-gray/60 font-body mt-0.5">{entry.page}</span>

            {editing === entry.key ? (
              <div className="mt-3 space-y-2">
                <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="Paste image URL..." className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-3 py-2 text-xs text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold font-body" />
                <div className="flex gap-2">
                  <button onClick={() => handleUrlSave(entry.key)} className="flex-1 bg-charcoal dark:bg-gold py-2 text-[9px] tracking-[0.2em] uppercase text-ivory dark:text-charcoal font-body hover:bg-gold hover:text-charcoal dark:hover:bg-ivory transition-colors">Save URL</button>
                  <button onClick={() => setEditing(null)} className="px-3 py-2 text-[9px] tracking-[0.2em] uppercase text-warm-gray font-body hover:text-charcoal transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <label className="cursor-pointer flex-1 border border-gold/20 py-2 text-[9px] tracking-[0.2em] uppercase text-charcoal dark:text-[#E8E0D8] font-body hover:bg-charcoal hover:text-ivory dark:hover:bg-ivory dark:hover:text-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-center min-h-[36px] flex items-center justify-center">
                  {uploading === entry.key ? "..." : "Upload"}
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(entry.key, f); e.target.value = ""; }} className="hidden" disabled={!!uploading} />
                </label>
                <button onClick={() => { setEditing(entry.key); setUrlInput(entry.currentUrl || ""); }} disabled={!!uploading} className="px-3 py-2 text-[9px] tracking-[0.15em] uppercase text-gold-dark font-body hover:text-gold transition-colors disabled:opacity-40">URL</button>
                {entry.currentUrl && (
                  <button onClick={() => handleReset(entry.key)} disabled={!!uploading} className="px-3 py-2 text-[9px] tracking-[0.15em] uppercase text-amber-500 font-body hover:text-amber-600 transition-colors disabled:opacity-40">Reset</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
