"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/constants";
import { getDocuments } from "@/lib/firebaseDb";

export function CategoryGrid() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      try {
        const prods = await getDocuments("products");
        const map: Record<string, number> = {};
        for (const p of prods) {
          const cat = p.category || "Other";
          map[cat] = (map[cat] || 0) + 1;
        }
        setCounts(map);
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
        <div className="grid grid-cols-2 gap-px bg-gold/10 dark:bg-gold/5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden bg-ivory dark:bg-[#0F0F0F]"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 14vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="relative z-10 p-5">
                <h3 className="font-serif text-lg font-medium text-ivory">{cat.name}</h3>
                <span className="text-[10px] tracking-[0.2em] uppercase text-ivory/60 font-body">
                  {counts[cat.name] || "..."} styles
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
