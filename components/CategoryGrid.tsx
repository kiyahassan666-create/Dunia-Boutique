"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { getDocuments, getDocument } from "@/lib/firebaseDb";
import { getSiteImages } from "@/lib/siteImages";
import { preloadImages } from "@/lib/imagePreload";

interface CatData {
  id: string; name: string; slug: string; image: string;
}

const CAT_KEYS: Record<string, { key: string; slug: string }> = {
  "Abayas": { key: "cat_abayas", slug: "abayas" },
  "VIP Abayas": { key: "cat_vip_abayas", slug: "vip-abayas" },
  "Wedding Dirah": { key: "cat_wedding_dirah", slug: "wedding-dirah" },
  "Perfumes": { key: "cat_perfumes", slug: "perfumes" },
  "Luxury Bags": { key: "cat_bags", slug: "luxury-bags" },
  "Jewelry": { key: "cat_jewelry", slug: "jewelry" },
  "Shoes": { key: "cat_shoes", slug: "shoes" },
};

export function CategoryGrid() {
  const [cats, setCats] = useState<CatData[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const [prods, siteImages] = await Promise.all([
          getDocuments("products"),
          getSiteImages(),
        ]);
        const map: Record<string, number> = {};
        for (const p of prods) {
          const cat = p.category || "Other";
          map[cat] = (map[cat] || 0) + 1;
        }
        setCounts(map);
        const loaded: CatData[] = [];
        const imagesToPreload: string[] = [];
        for (const [catName, info] of Object.entries(CAT_KEYS)) {
          const doc = await getDocument<{ name?: string; slug?: string }>("categories", info.key.replace("cat_", ""));
          const name = doc?.name || catName;
          const slug = doc?.slug || info.slug;
          const img = siteImages[info.key] || "";
          loaded.push({ id: slug, name, slug, image: img });
          if (img) imagesToPreload.push(img);
        }
        preloadImages(imagesToPreload.slice(0, 4));
        setCats(loaded);
      } catch {}
    })();
  }, []);

  return (
    <section id="categories" className="px-6 py-20 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold-dark font-body font-medium mb-3">
            Collections
          </span>
          <h2 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8] lg:text-4xl">
            Shop by Category
          </h2>
          <p className="mx-auto mt-3 max-w-md font-serif text-base text-warm-gray dark:text-[#A09890] italic">
            Seven collections, one singular vision of modest luxury.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {cats.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-sm bg-charcoal shadow-sm transition-shadow duration-500 hover:shadow-lg"
            >
              {cat.image && (
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  fill
                  priority={i < 4}
                  className={`object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105 ${
                    imageLoaded[cat.id] ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  onLoad={() => setImageLoaded((prev) => ({ ...prev, [cat.id]: true }))}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
              <div className="relative z-10 p-5 lg:p-6">
                <h3 className="font-serif text-lg font-medium text-ivory lg:text-xl">
                  {cat.name}
                </h3>
                <span className="mt-1 block text-[10px] tracking-[0.2em] uppercase text-ivory/60 font-body">
                  {counts[cat.name] || "..."} styles
                </span>
                <span className="mt-2 block h-px w-8 origin-left scale-x-0 bg-gold transition-transform duration-500 motion-safe:group-hover:scale-x-100" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
