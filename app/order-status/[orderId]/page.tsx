"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatKES } from "@/lib/currency";

interface OrderType {
  id: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  status: string;
  paymentMethod: string;
  mpesaCode: string;
  mpesaEditCount?: number;
  paymentVerified: boolean;
  verifiedAt?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    county?: string;
    town?: string;
    address: string;
    notes?: string;
  };
  items: any[];
  date: string;
  userEmail?: string;
}

const STATUS_ORDER: Record<string, number> = {
  "Pending Payment": 0,
  "Processing": 1,
  "Delivered": 2,
  "Cancelled": -1,
};

export default function OrderStatusPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !db) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() } as OrderType);
      } else {
        setOrder(null);
      }
      setLoading(false);
    }, () => {
      setOrder(null);
      setLoading(false);
    });

    return () => unsub();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F] flex items-center justify-center">
        <p className="text-warm-gray font-body">Loading order details...</p>
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

  const currentStep = STATUS_ORDER[order.status] ?? 0;
  const isCancelled = order.status === "Cancelled";

  const steps = [
    { label: "Pending Payment", key: "pending", index: 0 },
    { label: "Processing", key: "processing", index: 1 },
    { label: "Delivered", key: "delivered", index: 2 },
  ];

  return (
    <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F]">
      <div className="mx-auto max-w-4xl px-6 pb-20 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8]">Order Status</h1>
          <p className="text-warm-gray font-body text-sm mt-1">Order ID: {order.id}</p>
        </div>

        {/* Cancelled Banner */}
        {isCancelled && (
          <div className="mb-8 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20 p-6">
            <h3 className="font-serif text-lg font-medium text-red-900 dark:text-red-200 mb-2">Order Cancelled</h3>
            <p className="text-sm text-red-800 dark:text-red-300 font-body">
              This order has been cancelled by the administrator. If you have already made a payment, please contact customer support for a refund.
            </p>
          </div>
        )}

        {/* Status Timeline - only show when not cancelled */}
        {!isCancelled && (
          <div className="mb-12 border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8">
            <div className="flex items-center justify-between">
              {steps.map((step) => {
                const completed = currentStep > step.index;
                const active = currentStep === step.index;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-lg mb-3 transition-all ${
                      completed
                        ? "bg-green-600 text-ivory"
                        : active
                          ? "bg-gold text-charcoal border-2 border-gold"
                          : "bg-gold/20 text-warm-gray border border-gold/20"
                    }`}>
                      {completed ? "✓" : active ? "●" : step.index + 1}
                    </div>
                    <p className={`text-xs text-center font-body ${
                      active ? "text-charcoal dark:text-[#E8E0D8] font-medium" : "text-warm-gray"
                    }`}>{step.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Status Alert */}
        {!isCancelled && order.status === "Pending Payment" && (
          <div className="mb-8 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20 p-6">
            <h3 className="font-serif text-lg font-medium text-amber-900 dark:text-amber-200 mb-2">Payment Pending</h3>
            <p className="text-sm text-amber-800 dark:text-amber-300 font-body mb-4">
              Your order is awaiting payment verification. Please complete payment via M-Pesa and submit your confirmation code.
            </p>
            {!order.mpesaCode && (
              <Link
                href={`/payment-instructions/${order.id}`}
                className="inline-block bg-charcoal dark:bg-gold px-6 py-3 text-[10px] tracking-[0.2em] uppercase text-ivory dark:text-charcoal font-body hover:bg-gold hover:text-charcoal dark:hover:bg-ivory transition-all"
              >
                Complete Payment
              </Link>
            )}
          </div>
        )}

        {/* M-Pesa Code Display */}
        {order.mpesaCode && (
          <div className="mb-8 border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-6">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-2">M-Pesa Confirmation Code</h3>
            <p className="font-mono text-xl font-bold text-charcoal dark:text-[#E8E0D8] tracking-wider">{order.mpesaCode}</p>
            {order.paymentVerified ? (
              <p className="text-xs text-green-600 font-body mt-2 flex items-center gap-1">✓ Payment Verified</p>
            ) : order.status !== "Cancelled" ? (
              <p className="text-xs text-amber-500 font-body mt-2">⚠ Awaiting verification</p>
            ) : null}
          </div>
        )}

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8">
              <h2 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-4">Delivery Information</h2>
              <div className="space-y-2 text-sm">
                <p className="font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Name:</span> {order.customer?.name || "—"}</p>
                <p className="font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Phone:</span> {order.customer?.phone || "—"}</p>
                <p className="font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Email:</span> {order.customer?.email || order.userEmail || "—"}</p>
                <p className="font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">County:</span> {order.customer?.county || "—"}</p>
                <p className="font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Town:</span> {order.customer?.town || "—"}</p>
                <p className="font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Address:</span> {order.customer?.address || "—"}</p>
                {order.customer?.notes && <p className="font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Notes:</span> {order.customer.notes}</p>}
              </div>
            </div>

            {/* Order Items */}
            <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8">
              <h2 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center pb-3 border-b border-gold/10 last:border-0">
                    <div>
                      <p className="font-serif text-sm text-charcoal dark:text-[#E8E0D8]">{item.name}</p>
                      <p className="text-xs text-warm-gray font-body">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-serif text-sm text-gold-dark">{formatKES(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8 h-fit">
            <h2 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between"><span className="text-warm-gray">Subtotal</span><span className="font-serif text-charcoal dark:text-[#E8E0D8]">{formatKES(order.subtotal || order.total)}</span></div>
              <div className="flex justify-between"><span className="text-warm-gray">Shipping</span><span className="font-serif text-charcoal dark:text-[#E8E0D8]">{order.shipping ? formatKES(order.shipping) : "500 KES"}</span></div>
              <div className="border-t border-gold/10 pt-3 flex justify-between"><span className="font-serif font-medium text-charcoal dark:text-[#E8E0D8]">Total</span><span className="font-serif text-xl text-gold-dark font-medium">{formatKES(order.total)}</span></div>
            </div>

            {/* Status Badge */}
            <div className={`p-4 text-center text-xs font-body rounded tracking-widest uppercase ${
              isCancelled
                ? "bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-200"
                : order.status === "Delivered"
                  ? "bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-200"
                  : order.status === "Processing" || order.paymentVerified
                    ? "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200"
                    : "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200"
            }`}>
              {order.status}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body transition-colors">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
