"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { getImage } from "@/lib/siteImages";
import { preloadImage, prefetchFirebaseStorage } from "@/lib/imagePreload";

export function Hero() {
  const [heroImage, setHeroImage] = useState("");

  useEffect(() => {
    prefetchFirebaseStorage();
    (async () => {
      try {
        const img = await getImage("hero_home");
        if (img) {
          preloadImage(img);
          setHeroImage(img);
        }
      } catch {}
    })();
  }, []);

  return (
    <section className="relative h-[75vh] min-h-[500px] w-full">
      {heroImage && (
        <SafeImage
          src={heroImage}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-2xl text-center px-6">
          <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold-light font-body mb-5">
            Maison Dunia — Collection 2026
          </span>
          <h1 className="font-serif text-4xl leading-[1.08] text-ivory sm:text-5xl lg:text-6xl xl:text-7xl font-medium">
            Modest Fashion,
            <br />
            <span className="italic font-normal text-gold-light">Reimagined</span>
          </h1>
          <div className="mx-auto mt-6 h-px w-16 bg-gold/50" />
          <p className="mt-6 max-w-md mx-auto font-serif text-lg leading-relaxed text-ivory/70">
            Curated luxury for the modern Muslim woman — where timeless tradition meets contemporary sophistication.
          </p>
          <div className="mt-10 flex items-center justify-center gap-5">
            <Link
              href="#collection"
              className="inline-flex items-center gap-3 bg-ivory px-8 py-4 text-[10px] font-medium tracking-[0.25em] uppercase text-charcoal font-body transition-all duration-500 hover:bg-gold hover:text-ivory"
            >
              Explore Collection
            </Link>
            <Link
              href="#categories"
              className="inline-flex items-center gap-2 border-b border-gold/40 pb-1 text-[10px] tracking-[0.25em] uppercase text-ivory/70 hover:text-ivory transition-colors font-body"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[9px] tracking-[0.3em] uppercase text-ivory/40 font-body">
        <span className="h-px w-16 bg-ivory/20" />
        <span>Scroll</span>
        <span className="h-px w-16 bg-ivory/20" />
      </div>
    </section>
  );
}
