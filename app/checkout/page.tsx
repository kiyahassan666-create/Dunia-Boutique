"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getCartItems, saveCartItems } from "@/lib/firebaseSync";
import { saveOrderToFirestore } from "@/lib/firebaseSync";
import { formatKES } from "@/lib/currency";
import { saveGuestOrder } from "@/lib/guestOrderCache";

interface CartItem {
  id: string; name: string; price: number; image: string; category: string;
  size?: string; color?: string; quantity: number;
}

function getLocalCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("guest_cart");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function clearLocalCart(): void {
  try { localStorage.removeItem("guest_cart"); } catch {}
}

export default function CheckoutPage() {
  const { user, triggerGuestModal } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", county: "", town: "", address: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (user) {
        const cart = await getCartItems(user.uid!);
        if (cart.length === 0) { router.push("/cart"); return; }
        setItems(cart);
        setForm(f => ({ ...f, name: user.name || "", email: user.email || "" }));
      } else {
        // Guest user — read from local cart
        const localCart = getLocalCart();
        if (localCart.length === 0) { router.push("/cart"); return; }
        setItems(localCart);
      }
      setLoading(false);
    })();
  }, [user, router]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = 500;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `ORD-${Date.now()}`;
    const order = {
      id,
      items,
      subtotal,
      shipping,
      total,
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        county: form.county,
        town: form.town,
        address: form.address,
        notes: form.notes,
      },
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Pending Payment",
      paymentMethod: "mpesa",
      paymentVerified: false,
      verifiedAt: null,
      userEmail: user?.email || form.email,
      userId: user?.uid || null,
    };

    const savedId = await saveOrderToFirestore(order);

    if (user) {
      await saveCartItems(user.uid!, []);
      window.dispatchEvent(new Event("cart-update"));
    } else {
      // Guest: save to local cache and clear local cart
      saveGuestOrder(savedId || id, { ...order, id: savedId || id });
      clearLocalCart();
    }

    setOrderId(savedId || id);
    setSubmitted(true);
    router.push(`/payment-instructions/${savedId || id}`);
  };

  if (loading) return <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F]" />;

  if (submitted) return null; // Will redirect

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F]">
      <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
        <div className="mb-10">
          <Link href="/cart" className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body transition-colors mb-4">&larr; Back to Cart</Link>
          <h1 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8]">Checkout</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8">
              <h2 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-6">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Full Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" required />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" required />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" required placeholder="+254 712 345 678" />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">County</label>
                  <select value={form.county} onChange={e => setForm({ ...form, county: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" required>
                    <option value="">Select county</option>
                    {["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Nyeri", "Machakos", "Kiambu"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Town / City</label>
                  <input type="text" value={form.town} onChange={e => setForm({ ...form, town: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Delivery Address</label>
                  <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Delivery Notes (optional)</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold resize-none" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-charcoal dark:bg-gold py-4 text-[10px] tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body transition-all hover:bg-gold hover:text-charcoal dark:hover:bg-ivory">
              Place Order — {formatKES(total)}
            </button>
          </form>
          <div className="lg:col-span-2">
            <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8 sticky top-28">
              <h3 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-5">Order Summary</h3>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-3 pb-4 border-b border-gold/5 last:border-0">
                    <div className="relative w-14 h-18 flex-shrink-0 bg-charcoal/5 dark:bg-ivory/5">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-charcoal dark:text-[#E8E0D8] truncate">{item.name}</p>
                      <p className="text-[10px] text-warm-gray font-body">Qty: {item.quantity}</p>
                      {item.size && <p className="text-[10px] text-warm-gray font-body">Size: {item.size}</p>}
                      <p className="font-serif text-sm text-gold-dark mt-1">{formatKES(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3 text-sm border-t border-gold/10 pt-5">
                <div className="flex justify-between"><span className="text-warm-gray font-body">Subtotal</span><span className="font-serif text-charcoal dark:text-[#E8E0D8]">{formatKES(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-warm-gray font-body">Shipping</span><span className="font-serif text-charcoal dark:text-[#E8E0D8]">{formatKES(shipping)}</span></div>
                <div className="border-t border-gold/10 pt-3 flex justify-between"><span className="font-serif font-medium text-charcoal dark:text-[#E8E0D8]">Total</span><span className="font-serif text-xl text-gold-dark font-medium">{formatKES(total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
