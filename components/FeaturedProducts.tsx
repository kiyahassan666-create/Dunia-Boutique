"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/firebaseDb";
import { formatKES } from "@/lib/currency";

export function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const featured = await getFeaturedProducts();
        setProducts(featured);
      } catch {}
    })();
  }, []);

  if (products.length === 0) return null;

  return (
    <section id="collection" className="px-6 py-20 lg:px-12 lg:py-28 bg-ivory dark:bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold-dark font-body font-medium mb-3">
            Curated Edition
          </span>
          <h2 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8] lg:text-4xl">
            The Signature Collection
          </h2>
          <p className="mx-auto mt-3 max-w-md font-serif text-base text-warm-gray dark:text-[#A09890] italic">
            Each piece thoughtfully designed to transcend seasons.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-px bg-gold/10 dark:bg-gold/5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group bg-cream dark:bg-[#0F0F0F]">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={i < 3}
                />
                {product.badge && (
                  <span className="absolute top-5 left-5 bg-charcoal/90 dark:bg-gold/90 px-4 py-2 text-[9px] font-medium tracking-[0.2em] uppercase text-ivory dark:text-charcoal font-body backdrop-blur-sm">
                    {product.badge}
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="inline-block border border-ivory/80 px-10 py-3.5 text-[10px] font-medium tracking-[0.25em] uppercase text-ivory font-body transition-all duration-500 hover:bg-ivory hover:text-charcoal">
                    Quick View
                  </span>
                </div>
              </div>
              <div className="px-6 pt-6 pb-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="block text-[10px] tracking-[0.25em] uppercase text-warm-gray dark:text-[#A09890] font-body">
                      {product.category}
                    </span>
                    <h3 className="mt-1 font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8]">
                      {product.name}
                    </h3>
                  </div>
                  <span className="font-serif text-xl font-medium text-gold-dark whitespace-nowrap">
                    {formatKES(product.price)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
