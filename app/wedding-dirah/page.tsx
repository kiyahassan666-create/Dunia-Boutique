"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { Newsletter } from "@/components/Newsletter";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory } from "@/lib/firebaseDb";
import { getImage } from "@/lib/siteImages";

export default function WeddingDirahPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [heroImage, setHeroImage] = useState("");
  const [storyImage, setStoryImage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [prods, hero, story] = await Promise.all([
          getProductsByCategory("Wedding Dirah"),
          getImage("hero_wedding"),
          getImage("story_wedding"),
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
        {heroImage && (
          <SafeImage
            src={heroImage}
            alt="Wedding dirah collection"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-2xl px-6">
            <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold-light font-body mb-5">
              Maison Dunia — Bridal
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-ivory leading-[1.08]">
              Wedding Dirah
            </h1>
            <div className="mx-auto mt-6 h-px w-16 bg-gold/50" />
            <p className="mt-6 max-w-lg mx-auto font-serif text-base leading-relaxed text-ivory/70 italic">
              For your most cherished moment — ethereal bridal pieces that
              celebrate love, faith, and timeless elegance.
            </p>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[9px] tracking-[0.3em] uppercase text-ivory/40 font-body">
          <span className="h-px w-16 bg-ivory/20" />
          <span>Scroll</span>
          <span className="h-px w-16 bg-ivory/20" />
        </div>
      </section>

      <section className="bg-ivory dark:bg-[#0A0A0A]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16 py-16 lg:py-28">
          <div className="mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold-dark font-medium font-body mb-3">
                Bridal Couture
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal dark:text-[#E8E0D8] leading-tight">
                L&rsquo;Art du Mariage
              </h2>
            </div>
            <p className="font-serif text-base text-warm-gray dark:text-[#A09890] max-w-sm leading-relaxed italic">
              Every bride deserves to feel radiant on her special day.
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
              {storyImage && (
                <SafeImage
                  src={storyImage}
                  alt="Wedding dirah craftsmanship"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="max-w-lg">
              <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold font-medium font-body mb-4">
                Bridal Atelier
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ivory leading-tight">
                For Your Most
                <br />
                <span className="italic font-normal text-gold/80">Beautiful Day</span>
              </h2>
              <div className="my-6 h-px w-12 bg-gold/40" />
              <p className="font-serif text-base text-ivory/65 leading-relaxed">
                Your wedding day deserves nothing less than perfection. Our
                bridal dirah collection is crafted with the finest laces, silks,
                and hand-beaded embellishments. Each piece is designed to make
                you feel like the most beautiful version of yourself — modest,
                confident, and utterly radiant.
              </p>
              <div className="mt-8 flex flex-wrap gap-8">
                {[
                  { label: "Hand Beading", value: "100%" },
                  { label: "Custom Fit", value: "Included" },
                  { label: "Delivery", value: "6 Weeks" },
                ].map((s) => (
                  <div key={s.label}>
                    <span className="block font-serif text-xl font-medium text-gold">
                      {s.value}
                    </span>
                    <span className="block text-[10px] tracking-[0.2em] uppercase text-ivory/40 font-body mt-1">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory dark:bg-[#0A0A0A] px-6 py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold-dark font-body font-medium mb-3">
            The Complete Collection
          </span>
          <h2 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8] lg:text-4xl">
            Explore More
          </h2>
          <p className="mt-4 font-serif text-base text-warm-gray dark:text-[#A09890] italic leading-relaxed">
            Discover our full range of luxury modest fashion.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/abayas"
              className="inline-flex items-center gap-3 bg-charcoal dark:bg-gold px-8 py-4 text-[10px] font-medium tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body transition-all duration-500 hover:bg-gold hover:text-charcoal dark:hover:bg-ivory dark:hover:text-charcoal"
            >
              Classic Abayas
            </Link>
            <Link
              href="/vip-abayas"
              className="inline-flex items-center gap-3 border border-charcoal/20 dark:border-ivory/20 px-8 py-4 text-[10px] font-medium tracking-[0.25em] uppercase text-charcoal dark:text-ivory font-body transition-all duration-500 hover:bg-charcoal hover:text-ivory dark:hover:bg-ivory dark:hover:text-charcoal"
            >
              VIP Abayas
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-[10px] font-medium tracking-[0.25em] uppercase text-warm-gray dark:text-[#A09890] font-body transition-colors hover:text-charcoal dark:hover:text-ivory"
            >
              Home
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
