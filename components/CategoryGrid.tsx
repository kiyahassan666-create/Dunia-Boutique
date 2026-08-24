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

// Roman numerals: the seven collections, numbered — echoes "Seven collections, one singular vision"
const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];

// Named grid-template-areas for the desktop lookbook layout (only applies cleanly when there are exactly 7 categories)
const BENTO_AREAS = ["abayas", "vip", "wedding", "perfumes", "bags", "jewelry", "shoes"];
const BENTO_TEMPLATE = `"abayas abayas vip wedding" "abayas abayas perfumes bags" "jewelry shoes shoes bags"`;

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
        // Preload first 4 images for faster display
        preloadImages(imagesToPreload.slice(0, 4));
        setCats(loaded);
      } catch {}
    })();
  }, []);

  const isBentoReady = cats.length === 7;

  const renderTile = (cat: CatData, index: number, variant: "bento" | "rail") => {
    const isHero = variant === "bento" && index === 0;
    return (
      <Link
        key={cat.id}
        href={`/${cat.slug}`}
        style={variant === "bento" ? { gridArea: BENTO_AREAS[index] } : undefined}
        className={`group relative flex flex-col justify-end overflow-hidden bg-charcoal ${
          variant === "rail"
            ? "aspect-[3/4] w-[70vw] max-w-[280px] shrink-0 snap-start"
            : "h-full w-full"
        }`}
      >
        {cat.image && (
          <SafeImage
            src={cat.image}
            alt={cat.name}
            fill
            priority={index < 4}
            className={`object-cover transition-all duration-[1200ms] ease-out motion-safe:group-hover:scale-[1.08] ${
              imageLoaded[cat.id] ? "opacity-100" : "opacity-0"
            }`}
            sizes={variant === "rail" ? "70vw" : "(max-width: 1024px) 50vw, 28vw"}
            onLoad={() => setImageLoaded((prev) => ({ ...prev, [cat.id]: true }))}
          />
        )}

        {/* Warm gradient wash — deepens on hover for contrast with text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/5 transition-all duration-700 group-hover:from-black/85" />

        {/* Signature element: large translucent Roman numeral, brightens to gold on hover */}
        <span
          className={`pointer-events-none absolute font-serif italic text-ivory/15 transition-colors duration-700 group-hover:text-gold/40 ${
            isHero
              ? "-top-2 right-3 text-[7rem] leading-none sm:text-[9rem]"
              : "-top-1 right-2 text-5xl leading-none sm:text-6xl"
          }`}
        >
          {NUMERALS[index] || index + 1}
        </span>

        <div className={`relative z-10 ${isHero ? "p-6 lg:p-8" : "p-4 lg:p-5"}`}>
          <h3
            className={`font-serif font-medium text-ivory ${
              isHero ? "text-2xl lg:text-3xl" : "text-base lg:text-lg"
            }`}
          >
            {cat.name}
          </h3>
          <span
            className={`mt-1.5 block text-[10px] tracking-[0.2em] uppercase text-ivory/55 font-body ${
              isHero ? "" : "text-[9px]"
            }`}
          >
            {counts[cat.name] || "..."} styles
          </span>
          {/* Underline draws in on hover — quiet confirmation this tile is interactive */}
          <span className="mt-2 block h-px w-8 origin-left scale-x-0 bg-gold transition-transform duration-500 motion-safe:group-hover:scale-x-100" />
        </div>
      </Link>
    );
  };

  return (
    <section id="categories" className="px-6 py-20 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center lg:mb-16">
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

        {/* Desktop / large tablet: editorial lookbook grid, one hero tile among varying sizes */}
        <div
          className="hidden lg:grid lg:h-[720px] lg:grid-cols-4 lg:grid-rows-3 lg:gap-3 xl:h-[780px] xl:gap-4"
          style={isBentoReady ? { gridTemplateAreas: BENTO_TEMPLATE } : undefined}
        >
          {isBentoReady
            ? cats.map((cat, i) => renderTile(cat, i, "bento"))
            : // Fallback while categories are loading or count differs from 7: simple even grid, no named areas
              cats.map((cat, i) => (
                <div key={cat.id} className="col-span-1 row-span-1">
                  {renderTile(cat, i, "bento")}
                </div>
              ))}
        </div>

        {/* Mobile / small tablet: swipeable rail, edge fade hints there's more */}
        <div className="relative lg:hidden">
          <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cats.map((cat, i) => renderTile(cat, i, "rail"))}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-cream dark:from-[#0A0A0A] to-transparent" />
        </div>
      </div>
    </section>
  );
}
