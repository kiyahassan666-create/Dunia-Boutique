"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { Newsletter } from "@/components/Newsletter";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory } from "@/lib/firebaseDb";
import { getImage } from "@/lib/siteImages";

export default function AbayasPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [heroImage, setHeroImage] = useState("");
  const [storyImage, setStoryImage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [prods, hero, story] = await Promise.all([
          getProductsByCategory("Abayas"),
          getImage("hero_abayas"),
          getImage("story_abayas"),
        ]);
        setProducts(prods);
        setHeroImage(hero);
        setStoryImage(story);
      } catch {}
    })();
  }, []);

  return (
    <>
      <section className="relative h-[55vh] min-h-[420px] w-full">
        <SafeImage
          src={heroImage || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1600&q=85&auto=format&fit=crop"}
          alt="Luxury abaya collection"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-2xl px-6">
            <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold-light font-body mb-5">
              Maison Dunia — Atelier 2026
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-ivory leading-[1.08]">
              The Abaya
              <br />
              <span className="italic font-normal text-gold-light">Collection</span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto font-serif text-base leading-relaxed text-ivory/70 italic">
              Twenty-four silhouettes, one singular vision — the art of modest luxury, reimagined for the modern woman.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ivory dark:bg-[#0A0A0A]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16 py-16 lg:py-28">
          <div className="mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold-dark font-medium font-body mb-3">
                Signature Silhouettes
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal dark:text-[#E8E0D8] leading-tight">
                L&rsquo;Art de l&rsquo;Abaya
              </h2>
            </div>
            <p className="font-serif text-base text-warm-gray dark:text-[#A09890] max-w-sm leading-relaxed italic">
              Each piece is crafted in our atelier with a reverence for tradition and an eye toward the future.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gold/10 dark:bg-gold/5">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 3} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal dark:bg-black">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/5] overflow-hidden">
              <SafeImage
                src={storyImage || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=85&auto=format&fit=crop"}
                alt="Dunia abaya craftsmanship"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="max-w-lg">
              <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold font-medium font-body mb-4">
                Atelier Heritage
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ivory leading-tight">
                Where Modesty
                <br />
                <span className="italic font-normal text-gold/80">Meets Mastery</span>
              </h2>
              <div className="my-6 h-px w-12 bg-gold/40" />
              <p className="font-serif text-base text-ivory/65 leading-relaxed">
                In our atelier, every seam is a statement. We source the finest Italian crepes, French laces, and Egyptian cottons — then transform them into abayas that drape like poetry.
              </p>
              <div className="mt-8 flex flex-wrap gap-10">
                {[
                  { label: "Years of Heritage", value: "Since 2018" },
                  { label: "Master Artisans", value: "24" },
                  { label: "Hours per Piece", value: "40+" },
                ].map((s) => (
                  <div key={s.label}>
                    <span className="block font-serif text-2xl font-medium text-gold">{s.value}</span>
                    <span className="block text-[10px] tracking-[0.2em] uppercase text-ivory/40 font-body mt-1">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory dark:bg-[#0A0A0A] px-6 py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold-dark font-body font-medium mb-3">The Complete Experience</span>
          <h2 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8] lg:text-4xl">Discover the Full Collection</h2>
          <p className="mt-4 font-serif text-base text-warm-gray dark:text-[#A09890] italic leading-relaxed">From everyday essentials to occasion-worthy masterpieces.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/vip-abayas" className="inline-flex items-center gap-3 bg-charcoal dark:bg-gold px-8 py-4 text-[10px] font-medium tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body transition-all duration-500 hover:bg-gold hover:text-charcoal dark:hover:bg-ivory dark:hover:text-charcoal">VIP Abayas</Link>
            <Link href="/wedding-dirah" className="inline-flex items-center gap-3 border border-charcoal/20 dark:border-ivory/20 px-8 py-4 text-[10px] font-medium tracking-[0.25em] uppercase text-charcoal dark:text-ivory font-body transition-all duration-500 hover:bg-charcoal hover:text-ivory dark:hover:bg-ivory dark:hover:text-charcoal">Wedding Dirah</Link>
            <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-medium tracking-[0.25em] uppercase text-warm-gray dark:text-[#A09890] font-body transition-colors hover:text-charcoal dark:hover:text-ivory">Home</Link>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
