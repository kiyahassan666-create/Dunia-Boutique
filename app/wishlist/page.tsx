"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getWishlistItems, saveWishlistItems, getCartItems, saveCartItems } from "@/lib/firebaseSync";
import { formatKES } from "@/lib/currency";

interface WishlistItem {
  id: string; name: string; price: number; image: string; category: string;
}

export default function WishlistPage() {
  const { user, triggerGuestModal } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { triggerGuestModal("view wishlist"); setLoading(false); return; }
    (async () => {
      setLoading(true);
      const items = await getWishlistItems(user.uid!);
      setItems(items);
      setLoading(false);
    })();
  }, [user]);

  const removeItem = async (id: string) => {
    if (!user?.uid) return;
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    await saveWishlistItems(user.uid!, updated);
  };

  const moveToCart = async (item: WishlistItem) => {
    if (!user?.uid) return;
    const cart = await getCartItems(user.uid!);
    cart.push({ ...item, quantity: 1 });
    await saveCartItems(user.uid!, cart);
    await removeItem(item.id);
    window.dispatchEvent(new Event("cart-update"));
  };

  if (loading) return <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F]" />;
  if (!user) return null;

  return (
    <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F]">
      <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8]">My Wishlist</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mt-1">{items.length} {items.length === 1 ? "item" : "items"}</p>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-20 border border-gold/10">
            <p className="font-serif text-lg text-warm-gray mb-4">Your wishlist is empty.</p>
            <Link href="/" className="inline-block bg-charcoal dark:bg-gold px-8 py-4 text-[10px] tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body hover:bg-gold hover:text-charcoal dark:hover:bg-ivory transition-all">Discover Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-gold/10 dark:bg-gold/5">
            {items.map(item => (
              <div key={item.id} className="group bg-ivory dark:bg-[#0A0A0A]">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-cover transition-all duration-700 group-hover:scale-105" sizes="(max-width:640px)100vw,(max-width:1024px)50vw,25vw" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <button onClick={() => moveToCart(item)} className="bg-ivory/95 px-8 py-3.5 text-[9px] tracking-[0.2em] uppercase text-charcoal font-body transition-all hover:bg-charcoal hover:text-ivory">Add to Cart</button>
                  </div>
                </div>
                <div className="px-5 pt-5 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">{item.category}</span>
                      <Link href={`/product/${item.id}`} className="block mt-1 font-serif text-base font-medium text-charcoal dark:text-[#E8E0D8] hover:text-gold transition-colors">{item.name}</Link>
                      <p className="font-serif text-base text-gold-dark mt-1">{formatKES(item.price)}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-warm-gray hover:text-red-400 transition-colors text-sm mt-1">&times;</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
