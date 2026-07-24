"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Newsletter } from "@/components/Newsletter";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory } from "@/lib/firebaseDb";
import { getImage } from "@/lib/siteImages";

export default function JewelryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [heroImage, setHeroImage] = useState("");
  const [storyImage, setStoryImage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [prods, hero, story] = await Promise.all([
          getProductsByCategory("Jewelry"),
          getImage("hero_jewelry"),
          getImage("story_jewelry"),
        ]);
        setProducts(prods);
        setHeroImage(hero);
        setStoryImage(story);
      } catch {}
    })();
  }, []);
  return (
    <>
      <section className="relative h-[50vh] min-h-[380px] w-full">
        <Image src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1600&q=85&auto=format&fit=crop" alt="Luxury jewelry" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-xl px-6">
            <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold-light font-body mb-5">Maison Dunia — Fine Jewelry</span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-ivory leading-tight">Jewelry</h1>
            <div className="mx-auto mt-5 h-px w-12 bg-gold/50" />
            <p className="mt-5 max-w-md mx-auto font-serif text-base leading-relaxed text-ivory/70 italic">Timeless pieces crafted in 18-karat gold, set with ethically sourced gemstones.</p>
          </div>
        </div>
      </section>
      <section className="px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-center justify-between border-b border-gold/10 pb-4">
            <span className="font-serif text-sm text-warm-gray dark:text-[#A09890]"><span className="text-charcoal dark:text-[#E8E0D8]">{products.length}</span> pieces</span>
          </div>
          <div className="grid grid-cols-1 gap-px bg-gold/10 dark:bg-gold/5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i<3} />
            ))}
          </div>
        </div>
      </section>
      <section className="bg-charcoal dark:bg-black">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=85&auto=format&fit=crop" alt="Jewelry craftsmanship" fill className="object-cover" sizes="(max-width:1024px)100vw,50vw" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="max-w-lg">
              <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold font-medium font-body mb-4">Atelier Joaillerie</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ivory leading-tight">Where Craft <br /><span className="italic font-normal text-gold/80">Becomes Heirloom</span></h2>
              <div className="my-6 h-px w-12 bg-gold/40" />
              <p className="font-serif text-base text-ivory/65 leading-relaxed">Our jewelry is handcrafted by master gem-setters using techniques refined over centuries. Every stone is ethically sourced and hand-selected for its brilliance. Each piece arrives in a velvet presentation box with a certificate of authenticity.</p>
              <div className="mt-8 flex flex-wrap gap-8">{[{label:"Gold Karat",value:"18K"},{label:"Ethical Gems",value:"100%"},{label:"Certificate",value:"Included"}].map(s=>(<div key={s.label}><span className="block font-serif text-xl font-medium text-gold">{s.value}</span><span className="block text-[10px] tracking-[0.2em] uppercase text-ivory/40 font-body mt-1">{s.label}</span></div>))}</div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-ivory dark:bg-[#0A0A0A] px-6 py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold-dark font-body font-medium mb-3">Discover More</span>
          <h2 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8] lg:text-4xl">Explore Our Collections</h2>
          <p className="mt-4 font-serif text-base text-warm-gray dark:text-[#A09890] italic">Find the perfect pieces to complement your style.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/luxury-bags" className="inline-flex items-center gap-3 bg-charcoal dark:bg-gold px-8 py-4 text-[10px] font-medium tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body transition-all duration-500 hover:bg-gold hover:text-charcoal dark:hover:bg-ivory dark:hover:text-charcoal">Luxury Bags</Link>
            <Link href="/perfumes" className="inline-flex items-center gap-3 border border-charcoal/20 dark:border-ivory/20 px-8 py-4 text-[10px] font-medium tracking-[0.25em] uppercase text-charcoal dark:text-ivory font-body transition-all duration-500 hover:bg-charcoal hover:text-ivory dark:hover:bg-ivory dark:hover:text-charcoal">Perfumes</Link>
            <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-medium tracking-[0.25em] uppercase text-warm-gray dark:text-[#A09890] font-body transition-colors hover:text-charcoal dark:hover:text-ivory">Home</Link>
          </div>
        </div>
      </section>
      <Newsletter />
    </>
  );
}
