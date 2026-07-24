"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getCartItems, saveCartItems, getWishlistItems, saveWishlistItems } from "@/lib/firebaseSync";
import { getDocument } from "@/lib/firebaseDb";
import { formatKES, convertToKES } from "@/lib/currency";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user, triggerGuestModal } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = await getDocument("products", id);
        if (p) setProduct(p);
      } catch {}
    })();
  }, [id]);

  const addToCart = async () => {
    if (!product) return;
    if (!user) { triggerGuestModal("add to cart"); return; }
    const cart = await getCartItems(user.uid!);
    cart.push({ ...product, size: selectedSize, color: selectedColor, quantity: 1 });
    await saveCartItems(user.uid!, cart);
    window.dispatchEvent(new Event("cart-update"));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (!product) return <div className="min-h-screen flex items-center justify-center"><p className="font-serif text-lg text-warm-gray">Loading...</p></div>;

  return (
    <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F]">
      <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
        <Link href={`/${(product.category || "").toLowerCase().replace(/\s+/g, "-")}`} className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body transition-colors mb-8">
          &larr; Back to {product.category}
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="relative aspect-[3/4] overflow-hidden bg-ivory dark:bg-[#0A0A0A]">
            <Image src={product.image} alt={product.name} fill className="object-cover" priority sizes="(max-width:1024px)100vw,50vw" />
            {product.badge && <span className="absolute top-5 left-5 bg-charcoal/90 px-4 py-2 text-[9px] tracking-[0.2em] uppercase text-ivory font-body backdrop-blur-sm">{product.badge}</span>}
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] tracking-[0.25em] uppercase text-warm-gray font-body">{product.category}</span>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium text-charcoal dark:text-[#E8E0D8]">{product.name}</h1>
            <p className="mt-6 font-serif text-3xl font-medium text-gold-dark">{formatKES(product.price)}</p>
            <div className="mt-6 h-px w-full bg-gold/10" />
            <p className="mt-6 font-serif text-base text-warm-gray dark:text-[#A09890] leading-relaxed">{product.description || "A premium piece from the Dunia collection."}</p>
            {product.material && <p className="mt-3 text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">Material: <span className="text-charcoal dark:text-[#E8E0D8]">{product.material}</span></p>}
            <div className="mt-6 flex items-center gap-3">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${product.inStock !== false ? "bg-green-500" : "bg-red-400"}`} />
              <span className="text-[10px] tracking-[0.15em] uppercase font-body text-warm-gray">{product.inStock !== false ? "In Stock" : "Out of Stock"}</span>
              {product.stock !== undefined && product.inStock !== false && (
                <span className="text-[10px] tracking-[0.15em] uppercase font-body text-warm-gray/60">&mdash; {product.stock} remaining</span>
              )}
            </div>
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-8">
                <span className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">Size</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.sizes.map((s: string) => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`px-5 py-2.5 text-xs font-body border transition-colors ${selectedSize === s ? "bg-charcoal text-ivory border-charcoal dark:bg-gold dark:text-charcoal dark:border-gold" : "border-gold/20 text-charcoal dark:text-[#E8E0D8] hover:border-charcoal dark:hover:border-gold"}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-6">
                <span className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">Color</span>
                <div className="flex flex-wrap gap-3 mt-2">
                  {product.colors.map((c: { name: string; hex: string }) => (
                    <button key={c.name} onClick={() => setSelectedColor(c.name)} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-body border transition-colors ${selectedColor === c.name ? "bg-charcoal text-ivory border-charcoal dark:bg-gold dark:text-charcoal dark:border-gold" : "border-gold/20 text-charcoal dark:text-[#E8E0D8] hover:border-charcoal dark:hover:border-gold"}`}>
                      <span className="w-3 h-3 rounded-full border border-gold/20" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-10 flex flex-wrap gap-3">
              <button onClick={addToCart} className={`flex-1 min-w-[200px] py-4 text-[10px] tracking-[0.25em] uppercase font-body transition-all duration-300 ${addedToCart ? "bg-green-600 text-ivory" : "bg-charcoal text-ivory hover:bg-gold hover:text-charcoal dark:bg-gold dark:text-charcoal dark:hover:bg-ivory"}`}>
                {addedToCart ? "Added to Cart \u2713" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
