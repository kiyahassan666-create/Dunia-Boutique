"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getCartItems, saveCartItems } from "@/lib/firebaseSync";
import { formatKES } from "@/lib/currency";

function getLocalCart(): BagItem[] {
  try { const raw = localStorage.getItem("guest_cart"); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveLocalCart(items: BagItem[]): void {
  try { localStorage.setItem("guest_cart", JSON.stringify(items)); } catch {}
}

interface BagItem {
  id: string; name: string; price: number; image: string; category: string;
  size?: string; color?: string; quantity: number;
}

export default function BagPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<BagItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (user) {
        const items = await getCartItems(user.uid!);
        setItems(items);
      } else {
        setItems(getLocalCart());
      }
      setLoading(false);
    })();
  }, [user]);

  const updateQuantity = async (id: string, delta: number) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const qty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: qty };
      }
      return item;
    });
    setItems(updated);
    if (user?.uid) {
      await saveCartItems(user.uid!, updated);
    } else {
      saveLocalCart(updated);
    }
    window.dispatchEvent(new Event("cart-update"));
  };

  const removeItem = async (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    if (user?.uid) {
      await saveCartItems(user.uid!, updated);
    } else {
      saveLocalCart(updated);
    }
    window.dispatchEvent(new Event("cart-update"));
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F]" />;

  return (
    <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F]">
      <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8]">Shopping Bag</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mt-1">{items.length} {items.length === 1 ? "item" : "items"}</p>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-20 border border-gold/10">
            <p className="font-serif text-lg text-warm-gray mb-4">Your bag is empty.</p>
            <Link href="/" className="inline-block bg-charcoal dark:bg-gold px-8 py-4 text-[10px] tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body hover:bg-gold hover:text-charcoal dark:hover:bg-ivory transition-all">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id + (item.size||"") + (item.color||"")} className="flex gap-5 border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-5">
                  <div className="relative w-24 h-32 flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                  </div>
                  <div className="flex-1">
                    <Link href={`/product/${item.id}`} className="font-serif text-base font-medium text-charcoal dark:text-[#E8E0D8] hover:text-gold transition-colors">{item.name}</Link>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mt-1">{item.category}</p>
                    {item.size && <p className="text-[11px] text-warm-gray font-body mt-1">Size: {item.size}</p>}
                    {item.color && <p className="text-[11px] text-warm-gray font-body">Color: {item.color}</p>}
                    <p className="font-serif text-base text-gold-dark mt-2">{formatKES(item.price)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-gold/20">
                        <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1.5 text-xs text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body">&minus;</button>
                        <span className="px-3 py-1.5 text-xs text-charcoal dark:text-[#E8E0D8] font-body">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1.5 text-xs text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-[10px] tracking-[0.15em] uppercase text-red-400 hover:text-red-500 font-body transition-colors">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8 h-fit">
              <h3 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-5">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-warm-gray font-body">Subtotal</span><span className="font-serif text-charcoal dark:text-[#E8E0D8]">{formatKES(total)}</span></div>
                <div className="flex justify-between"><span className="text-warm-gray font-body">Shipping</span><span className="font-serif text-charcoal dark:text-[#E8E0D8]">Free</span></div>
                <div className="border-t border-gold/10 pt-3 flex justify-between"><span className="font-serif font-medium text-charcoal dark:text-[#E8E0D8]">Total</span><span className="font-serif text-xl text-gold-dark font-medium">{formatKES(total)}</span></div>
              </div>
              <Link href="/checkout" className="block w-full mt-8 bg-charcoal dark:bg-gold py-4 text-[10px] tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body text-center transition-all hover:bg-gold hover:text-charcoal dark:hover:bg-ivory">Proceed to Checkout</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
