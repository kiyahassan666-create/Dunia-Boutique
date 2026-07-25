"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDocument } from "@/lib/firebaseDb";
import { formatKES } from "@/lib/currency";

interface OrderType {
  id: string;
  total: number;
  status: string;
  paymentMethod: string;
  mpesaCode: string;
  paymentVerified: boolean;
  verifiedAt?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: any[];
  date: string;
}

export default function OrderStatusPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      setLoading(true);
      try {
        const doc = await getDocument<OrderType>("orders", orderId);
        setOrder(doc || null);
      } catch {
        setOrder(null);
      }
      setLoading(false);
    })();
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

  const statusSteps = [
    { label: "Payment Pending", key: "pending", completed: order.paymentVerified || order.status !== "Pending Payment" },
    { label: "Verified", key: "verified", completed: order.paymentVerified },
    { label: "Processing", key: "processing", completed: order.status === "Processing" || order.status === "Delivered" },
    { label: "Delivered", key: "delivered", completed: order.status === "Delivered" },
  ];

  const isPaymentPending = order.status === "Pending Payment" && !order.paymentVerified;
  const isVerified = order.paymentVerified;
  const isProcessing = order.status === "Processing";
  const isDelivered = order.status === "Delivered";

  return (
    <div className="min-h-screen pt-28 bg-cream dark:bg-[#0F0F0F]">
      <div className="mx-auto max-w-4xl px-6 pb-20 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-3xl font-medium text-charcoal dark:text-[#E8E0D8]">Order Status</h1>
          <p className="text-warm-gray font-body text-sm mt-1">Order ID: {order.id}</p>
        </div>

        {/* Status Timeline */}
        <div className="mb-12 border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, idx) => (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-lg mb-3 transition-all ${step.completed ? "bg-green-600 text-ivory" : "bg-gold/20 text-warm-gray border border-gold/20"}`}>
                  {step.completed ? "✓" : idx + 1}
                </div>
                <p className="text-xs text-center text-warm-gray font-body">{step.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status Alert */}
        {isPaymentPending && (
          <div className="mb-8 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20 p-6">
            <h3 className="font-serif text-lg font-medium text-amber-900 dark:text-amber-200 mb-2">Payment Pending</h3>
            <p className="text-sm text-amber-800 dark:text-amber-300 font-body mb-4">
              Your order is awaiting payment verification. The admin team will verify your M-Pesa code and confirm payment.
            </p>
            {order.mpesaCode && (
              <div className="bg-white dark:bg-[#0A0A0A] p-4 rounded border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-warm-gray font-body">M-Pesa Confirmation Code:</p>
                <p className="font-mono text-lg font-bold text-charcoal dark:text-[#E8E0D8] mt-2">{order.mpesaCode}</p>
              </div>
            )}
          </div>
        )}

        {isVerified && (
          <div className="mb-8 border-l-4 border-green-600 bg-green-50 dark:bg-green-950/20 p-6">
            <h3 className="font-serif text-lg font-medium text-green-900 dark:text-green-200 mb-2">Payment Verified</h3>
            <p className="text-sm text-green-800 dark:text-green-300 font-body">
              Payment confirmed on {new Date(order.verifiedAt || "").toLocaleDateString()}. Your order is being processed.
            </p>
          </div>
        )}

        {isDelivered && (
          <div className="mb-8 border-l-4 border-blue-600 bg-blue-50 dark:bg-blue-950/20 p-6">
            <h3 className="font-serif text-lg font-medium text-blue-900 dark:text-blue-200 mb-2">Order Delivered</h3>
            <p className="text-sm text-blue-800 dark:text-blue-300 font-body">Thank you for your purchase! We hope you enjoy your order.</p>
          </div>
        )}

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8">
              <h2 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-4">Delivery Information</h2>
              <div className="space-y-2 text-sm">
                <p className="font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Name:</span> {order.customer.name}</p>
                <p className="font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Phone:</span> {order.customer.phone}</p>
                <p className="font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Email:</span> {order.customer.email}</p>
                <p className="font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Address:</span> {order.customer.address}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8">
              <h2 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
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
              <div className="flex justify-between"><span className="text-warm-gray">Subtotal</span><span className="font-serif text-charcoal dark:text-[#E8E0D8]">{formatKES(order.total - (order.items?.length ? 500 : 0) || order.total)}</span></div>
              <div className="flex justify-between"><span className="text-warm-gray">Shipping</span><span className="font-serif text-charcoal dark:text-[#E8E0D8]">500 KES</span></div>
              <div className="border-t border-gold/10 pt-3 flex justify-between"><span className="font-serif font-medium text-charcoal dark:text-[#E8E0D8]">Total</span><span className="font-serif text-xl text-gold-dark font-medium">{formatKES(order.total)}</span></div>
            </div>

            {/* Status Badge */}
            <div className={`p-4 text-center text-xs font-body rounded tracking-widest uppercase ${isDelivered ? "bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-200" : isVerified ? "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200" : "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200"}`}>
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
