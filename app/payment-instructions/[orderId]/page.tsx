"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateOrderMpesaCode } from "@/lib/firebaseDb";
import { formatKES } from "@/lib/currency";
import { useAuth } from "@/contexts/AuthContext";
import { getGuestOrder, saveGuestOrder, clearGuestOrder } from "@/lib/guestOrderCache";

export default function PaymentInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mpesaCode, setMpesaCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editCount, setEditCount] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!orderId || !db) return;

    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as any;
        setOrder(data);
        setEditCount(data.mpesaEditCount || 0);
        if (data.mpesaCode) {
          setMpesaCode(data.mpesaCode);
        }
        // If already paid/processing/delivered/cancelled, redirect to tracking
        if (data.status === "Processing" || data.status === "Delivered" || data.status === "Cancelled") {
          router.replace(`/order-status/${orderId}`);
        }
      } else {
        // Check guest cache if user not logged in
        if (!user) {
          const guest = getGuestOrder();
          if (guest && guest.orderId === orderId) {
            setOrder(guest.orderData);
          } else {
            setOrder(null);
          }
        } else {
          setOrder(null);
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [orderId, user, router]);

  const handleSubmitCode = async () => {
    const code = mpesaCode.trim().toUpperCase();
    if (!code) {
      setError("Please enter your M-Pesa confirmation code");
      return;
    }
    if (editCount >= 3) {
      setError("You have reached the maximum number of edits (3). The code is locked.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const newCount = editCount + 1;
      await updateOrderMpesaCode(orderId, code, newCount);
      setEditCount(newCount);
      setSuccess(true);

      // Redirect to order tracking after brief delay
      setTimeout(() => {
        router.push(`/order-status/${orderId}`);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to save payment code. Please try again.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F] flex items-center justify-center">
        <p className="text-warm-gray font-body">Loading payment details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8]">Order Not Found</h1>
          <p className="text-warm-gray font-body mt-2">We couldn&apos;t find this order. Please check the order ID.</p>
          <Link href="/" className="inline-block mt-6 bg-charcoal dark:bg-gold px-8 py-4 text-[10px] tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body hover:bg-gold hover:text-charcoal dark:hover:bg-ivory transition-all">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const canEdit = editCount < 3;
  const codeLocked = editCount >= 3 && !!order.mpesaCode;

  if (success) {
    return (
      <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">✓</div>
          <h1 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8]">Payment Code Saved</h1>
          <p className="font-serif text-base text-warm-gray dark:text-[#A09890] mt-3 italic leading-relaxed">
            Your M-Pesa confirmation code has been recorded. Redirecting to order tracking...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F]">
      <div className="mx-auto max-w-2xl px-6 pb-20 lg:px-12">
        <div className="mb-10">
          <Link href="/checkout" className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body transition-colors mb-4">
            &larr; Back to Checkout
          </Link>
          <h1 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8]">Payment Instructions</h1>
        </div>

        {/* Order Reference */}
        <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">Order Number</p>
            <p className="font-serif text-lg font-medium text-gold-dark">{order.id}</p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gold/10">
            <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">Total Due</p>
            <p className="font-serif text-2xl font-medium text-charcoal dark:text-[#E8E0D8]">{formatKES(order.total)}</p>
          </div>
        </div>

        {/* M-Pesa Payment Details */}
        <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8 mb-6">
          <h2 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-6">Send Payment via M-Pesa</h2>

          <div className="space-y-4">
            <div className="border border-gold/10 p-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1">M-Pesa Name</p>
              <p className="font-serif text-lg text-charcoal dark:text-[#E8E0D8]">Halima Maalim</p>
            </div>
            <div className="border border-gold/10 p-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1">M-Pesa Number</p>
              <p className="font-serif text-lg text-charcoal dark:text-[#E8E0D8]">0725133957</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gold/10">
            <p className="text-xs text-warm-gray font-body leading-relaxed mb-4">
              Send the exact amount shown above to the M-Pesa number. After payment, enter the confirmation code you received via SMS below.
            </p>
          </div>
        </div>

        {/* M-Pesa Confirmation Code */}
        <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8 mb-6">
          <h2 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-4">Confirm Your Payment</h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 mb-4">
              <p className="text-xs text-red-600 dark:text-red-400 font-body">{error}</p>
            </div>
          )}

          {codeLocked ? (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-4 py-3 mb-4">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-body">
                Your M-Pesa code has been submitted and locked after 3 edits.
              </p>
              {order.mpesaCode && (
                <p className="font-mono text-sm font-bold text-charcoal dark:text-[#E8E0D8] mt-2">
                  {order.mpesaCode}
                </p>
              )}
            </div>
          ) : (
            <>
              {order.mpesaCode && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 px-4 py-3 mb-4">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-body">
                    Current code: <span className="font-mono font-bold">{order.mpesaCode}</span>
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-body mt-1">
                    You can edit this code {3 - editCount} more time{(3 - editCount) !== 1 ? "s" : ""}.
                  </p>
                </div>
              )}

              <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-2">
                M-Pesa Confirmation Code
              </label>
              <input
                type="text"
                value={mpesaCode}
                onChange={e => setMpesaCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123DEF456"
                className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold uppercase tracking-widest font-mono mb-4"
                maxLength={50}
              />
            </>
          )}

          <div className="flex flex-col gap-3">
            {!codeLocked && (
              <button
                onClick={handleSubmitCode}
                disabled={submitting || !canEdit}
                className="w-full bg-charcoal dark:bg-gold py-4 text-[10px] tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body transition-all hover:bg-gold hover:text-charcoal dark:hover:bg-ivory disabled:opacity-40"
              >
                {submitting ? "Saving..." : order.mpesaCode ? "Update Code" : "I Have Paid"}
              </button>
            )}

            <Link
              href={`/order-status/${orderId}`}
              className="w-full border border-gold/20 py-4 text-[10px] tracking-[0.25em] uppercase text-warm-gray font-body text-center hover:text-charcoal dark:hover:text-[#E8E0D8] transition-all"
            >
              View Order Status
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body transition-colors text-center">
            &larr; Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
