"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getCartItems, saveCartItems } from "@/lib/firebaseSync";
import { saveOrderToFirestore } from "@/lib/firebaseSync";
import { formatKES } from "@/lib/currency";
import { saveGuestOrder } from "@/lib/guestOrderCache";
import { useBusinessSettings } from "@/lib/useBusinessSettings";

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

type CheckoutMode = "guest" | "create" | "login";

export default function CheckoutPage() {
  const { user, login, signup, loading: authLoading } = useAuth();
  const settings = useBusinessSettings();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", county: "", town: "", address: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("guest");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");

  // Set default zone when settings load
  useEffect(() => {
    if (settings.shippingZones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(settings.shippingZones[0].id);
    }
  }, [settings.shippingZones, selectedZoneId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (user) {
        const cart = await getCartItems(user.uid!);
        if (cart.length === 0) { router.push("/cart"); return; }
        setItems(cart);
        setForm(f => ({ ...f, name: user.name || "", email: user.email || "" }));
      } else {
        const localCart = getLocalCart();
        if (localCart.length === 0) { router.push("/cart"); return; }
        setItems(localCart);
      }
      setLoading(false);
    })();
  }, [user, router]);

  // If user is already logged in, default to guest mode (no account creation needed)
  useEffect(() => {
    if (user) setCheckoutMode("guest");
  }, [user]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const selectedZone = settings.shippingZones.find(z => z.id === selectedZoneId);
  const shipping = selectedZone?.fee || 0;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate account creation passwords
    if (checkoutMode === "create") {
      if (!password || password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    if (checkoutMode === "login") {
      if (!loginPassword) {
        setError("Please enter your password to log in.");
        return;
      }
    }

    const id = `ORD-${Date.now()}`;

    // If "create account" mode, sign up the user first (order still submitted for guest)
    let resolvedUser = user;
    if (checkoutMode === "create" && !user) {
      const err = await signup(form.email, password, form.name);
      if (err) {
        setError(err);
        return;
      }
      // User is now created, will be picked up by AuthContext
      // We need the uid for the order — will get it from context
      // Re-fetch from auth context after a brief wait for the auth state to propagate
      await new Promise(r => setTimeout(r, 500));
      // The order will be submitted with the new user's info
      // (user will be set by AuthContext after signup)
    }

    if (checkoutMode === "login" && !user) {
      const err = await login(form.email, loginPassword);
      if (err) {
        setError(err);
        return;
      }
      await new Promise(r => setTimeout(r, 500));
    }

    // Build the order
    const order = {
      id,
      items,
      subtotal,
      shipping,
      total,
      shippingZone: selectedZone?.name || "",
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
      saveGuestOrder(savedId || id, { ...order, id: savedId || id });
      clearLocalCart();
    }

    setOrderId(savedId || id);
    setSubmitted(true);
    router.push(`/payment-instructions/${savedId || id}`);
  };

  if (loading || authLoading) return <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F]" />;

  if (submitted) return null;

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F]">
      <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
        <div className="mb-10">
          <Link href="/cart" className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body transition-colors mb-4">&larr; Back to Cart</Link>
          <h1 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8]">Checkout</h1>
        </div>

        {/* Account Options */}
        {!user && (
          <div className="mb-8">
            <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-6">
              <p className="text-xs text-warm-gray font-body mb-4">
                Have an account?{" "}
                <button
                  onClick={() => setCheckoutMode(checkoutMode === "login" ? "guest" : "login")}
                  className="text-gold-dark hover:text-gold underline underline-offset-2 font-medium"
                >
                  {checkoutMode === "login" ? "Continue as Guest" : "Log in"}
                </button>
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setCheckoutMode("guest"); setPassword(""); setConfirmPassword(""); setLoginPassword(""); }}
                  className={`flex-1 py-3 text-[10px] tracking-[0.2em] uppercase font-body transition-colors ${
                    checkoutMode === "guest"
                      ? "bg-charcoal dark:bg-gold text-ivory dark:text-charcoal"
                      : "border border-gold/20 text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8]"
                  }`}
                >
                  Continue as Guest
                </button>
                <button
                  type="button"
                  onClick={() => { setCheckoutMode("create"); setLoginPassword(""); }}
                  className={`flex-1 py-3 text-[10px] tracking-[0.2em] uppercase font-body transition-colors ${
                    checkoutMode === "create"
                      ? "bg-charcoal dark:bg-gold text-ivory dark:text-charcoal"
                      : "border border-gold/20 text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8]"
                  }`}
                >
                  Create an Account
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            {/* Login Fields */}
            {checkoutMode === "login" && !user && (
              <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8">
                <h2 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-4">Log In</h2>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold"
                    placeholder="Your password"
                    required
                  />
                </div>
              </div>
            )}

            {/* Create Account Password Fields */}
            {checkoutMode === "create" && !user && (
              <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8">
                <h2 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-4">Create Account</h2>
                <p className="text-[10px] text-warm-gray font-body mb-4">Set a password to create your account. Your order will be linked to your new account.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold"
                      placeholder="Min 6 characters"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold"
                      placeholder="Repeat password"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Information */}
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

            {/* Error display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
                <p className="text-xs text-red-600 dark:text-red-400 font-body">{error}</p>
              </div>
            )}

            <button type="submit" className="w-full bg-charcoal dark:bg-gold py-4 text-[10px] tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body transition-all hover:bg-gold hover:text-charcoal dark:hover:bg-ivory">
              Place Order — {formatKES(total)}
            </button>
          </form>

          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
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

              {/* Shipping Zone Selector */}
              {settings.shippingZones.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gold/10">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-2">Delivery Zone</label>
                  <select
                    value={selectedZoneId}
                    onChange={e => setSelectedZoneId(e.target.value)}
                    className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold"
                  >
                    {settings.shippingZones.map(z => (
                      <option key={z.id} value={z.id}>{z.name} — {formatKES(z.fee)}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mt-6 space-y-3 text-sm border-t border-gold/10 pt-5">
                <div className="flex justify-between"><span className="text-warm-gray font-body">Subtotal</span><span className="font-serif text-charcoal dark:text-[#E8E0D8]">{formatKES(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-warm-gray font-body">Shipping</span><span className="font-serif text-charcoal dark:text-[#E8E0D8]">{formatKES(shipping)}</span></div>
                <div className="border-t border-gold/10 pt-3 flex justify-between"><span className="font-serif font-medium text-charcoal dark:text-[#E8E0D8]">Total</span><span className="font-serif text-xl text-gold-dark font-medium">{formatKES(total)}</span></div>
              </div>
            </div>

            {/* Payment Info from Settings */}
            <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-6">
              <h3 className="font-serif text-sm font-medium text-charcoal dark:text-[#E8E0D8] mb-3">Payment via M-Pesa</h3>
              <div className="text-xs text-warm-gray font-body space-y-1">
                <p>Send payment to:</p>
                <p className="font-serif text-base text-charcoal dark:text-[#E8E0D8]">{settings.mpesaAccountName}</p>
                <p className="font-mono text-lg font-bold text-gold-dark tracking-wider">{settings.mpesaNumber}</p>
                <p className="text-[9px] mt-2">Enter the M-Pesa confirmation code on the next page after payment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
