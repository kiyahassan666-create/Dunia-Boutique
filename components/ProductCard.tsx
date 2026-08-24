"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { Product } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { getWishlistItems, saveWishlistItems } from "@/lib/firebaseSync";
import { formatKES } from "@/lib/currency";
interface ProductCardProps {
  product: Product;
  priority?: boolean;
}
export default function ProductCard({ product, priority }: ProductCardProps) {
  const { user, triggerGuestModal } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      const wish = await getWishlistItems(user.uid!);
      setInWishlist(wish.some((p: Product) => p.id === product.id));
    })();
  }, [user?.uid, product.id]);
  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { triggerGuestModal("save to wishlist"); return; }
    const wish = await getWishlistItems(user.uid!);
    let updated: Product[];
    if (inWishlist) {
      updated = wish.filter((p: Product) => p.id !== product.id);
      setInWishlist(false);
    } else {
      updated = [...wish, product];
      setInWishlist(true);
    }
    await saveWishlistItems(user.uid!, updated);
  };
  return (
    <Link href={`/product/${product.id}`} className="group relative bg-ivory dark:bg-[#0F0F0F] block">
      <div className="relative aspect-[3/4] overflow-hidden">
        <SafeImage
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-all duration-1000 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
        {product.badge && (
          <span className="absolute top-5 left-5 bg-charcoal/90 dark:bg-gold/90 px-4 py-2 text-[9px] font-medium tracking-[0.2em] uppercase text-ivory dark:text-charcoal font-body backdrop-blur-sm">
            {product.badge}
          </span>
        )}
        <button
          onClick={toggleWishlist}
          className={`absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 ${
            inWishlist ? "bg-red-500/90 text-white" : "bg-white/80 text-charcoal opacity-0 group-hover:opacity-100"
          }`}
        >
          <span className="text-lg leading-none">{inWishlist ? "\u2665" : "\u2661"}</span>
        </button>
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="inline-block border border-ivory/80 px-10 py-3.5 text-[10px] font-medium tracking-[0.25em] uppercase text-ivory font-body transition-all duration-500 hover:bg-ivory hover:text-charcoal">
            View Details
          </span>
        </div>
      </div>
      <div className="px-4 pt-4 pb-6 sm:px-6 sm:pt-6 sm:pb-8">
        <span className="block text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-warm-gray dark:text-[#A09890] font-body">
          {product.category}
        </span>
        <h3 className="mt-1 font-serif text-sm sm:text-lg font-medium text-charcoal dark:text-[#E8E0D8] leading-snug line-clamp-2">
          {product.name}
        </h3>
        <span className="mt-1.5 sm:mt-2 block font-serif text-base sm:text-xl font-medium text-gold-dark">
          {formatKES(product.price)}
        </span>
      </div>
    </Link>
  );
}
