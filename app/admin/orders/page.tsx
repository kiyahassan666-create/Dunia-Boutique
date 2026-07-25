"use client";

import { useEffect, useState } from "react";
import { getOrdersFromFirestore, updateOrderInFirestore } from "@/lib/firebaseSync";
import { formatKES } from "@/lib/currency";

const STATUSES = ["Pending Payment", "Processing", "In Transit", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const all = await getOrdersFromFirestore();
        setOrders(all);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.userEmail?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (orderId: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    try {
      await updateOrderInFirestore(orderId, { status });
    } catch {}
    if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status });
  };

  const verifyPayment = async (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentVerified: true, status: "Processing", verifiedAt: new Date().toISOString() } : o));
    try {
      await updateOrderInFirestore(orderId, { 
        paymentVerified: true, 
        status: "Processing",
        verifiedAt: new Date().toISOString()
      });
    } catch {}
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentVerified: true, status: "Processing", verifiedAt: new Date().toISOString() });
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Delete this order?")) return;
    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (selectedOrder?.id === orderId) setSelectedOrder(null);
  };

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const ts = orders.filter(o => o.date === today && o.paymentVerified);
  const ms = orders.filter(o => o.date?.startsWith(today.slice(0, 7)) && o.paymentVerified);
  const todayTotal = ts.reduce((s: number, o: any) => s + (o.total || 0), 0);
  const monthTotal = ms.reduce((s: number, o: any) => s + (o.total || 0), 0);
  const allTimeTotal = orders.filter((o: any) => o.paymentVerified).reduce((s: number, o: any) => s + (o.total || 0), 0);

  if (loading) return <p className="text-warm-gray font-body text-sm">Loading...</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-medium text-charcoal dark:text-[#E8E0D8]">Orders</h1>
        <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mt-1">{orders.length} orders total</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-6 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">Today&apos;s Sales</p>
          <p className="font-serif text-3xl font-medium text-gold-dark mt-2">{formatKES(todayTotal)}</p>
          <p className="text-[9px] text-warm-gray font-body mt-1">{ts.length} order{(ts.length !== 1) && "s"}</p>
        </div>
        <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-6 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">This Month</p>
          <p className="font-serif text-3xl font-medium text-gold-dark mt-2">{formatKES(monthTotal)}</p>
          <p className="text-[9px] text-warm-gray font-body mt-1">{ms.length} order{(ms.length !== 1) && "s"}</p>
        </div>
        <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-6 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body">All Time</p>
          <p className="font-serif text-3xl font-medium text-gold-dark mt-2">{formatKES(allTimeTotal)}</p>
          <p className="text-[9px] text-warm-gray font-body mt-1">{orders.length} order{(orders.length !== 1) && "s"}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or customer..." className="border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-2.5 text-xs text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold font-body flex-1 min-w-[200px]" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-2.5 text-xs text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold font-body">
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="border border-gold/10 overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-left min-w-[550px]">
          <thead>
            <tr className="border-b border-gold/10">
              <th className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-warm-gray font-body px-3 sm:px-4 py-3">Order</th>
              <th className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-warm-gray font-body px-3 sm:px-4 py-3">Customer</th>
              <th className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-warm-gray font-body px-3 sm:px-4 py-3 hidden sm:table-cell">Items</th>
              <th className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-warm-gray font-body px-3 sm:px-4 py-3">Total</th>
              <th className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-warm-gray font-body px-3 sm:px-4 py-3">Status</th>
              <th className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-warm-gray font-body px-3 sm:px-4 py-3 hidden sm:table-cell">Date</th>
              <th className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-warm-gray font-body px-3 sm:px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-warm-gray font-body">No orders found</td></tr>
            )}
            {filtered.map(o => (
              <tr key={o.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                <td className="px-3 sm:px-4 py-3 font-serif text-sm text-charcoal dark:text-[#E8E0D8] max-w-[80px] sm:max-w-none truncate">{o.id}</td>
                <td className="px-3 sm:px-4 py-3 text-xs text-warm-gray font-body max-w-[100px] sm:max-w-none truncate">{o.customer?.name || o.userEmail || "Guest"}</td>
                <td className="px-3 sm:px-4 py-3 font-serif text-sm text-charcoal dark:text-[#E8E0D8] hidden sm:table-cell">{o.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0}</td>
                <td className="px-3 sm:px-4 py-3 font-serif text-sm text-gold-dark whitespace-nowrap">{formatKES(o.total)}</td>
                <td className="px-3 sm:px-4 py-3">
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className={`text-[10px] sm:text-[11px] tracking-[0.15em] uppercase font-body border border-gold/10 px-2 py-1.5 min-h-[32px] outline-none bg-ivory dark:bg-[#0A0A0A] ${o.status === "Delivered" ? "text-green-600" : o.status === "Cancelled" ? "text-red-400" : o.status === "Pending Payment" ? "text-amber-500" : "text-warm-gray"}`}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-3 sm:px-4 py-3 text-[10px] sm:text-[11px] text-warm-gray font-body hidden sm:table-cell whitespace-nowrap">{o.date}</td>
                <td className="px-3 sm:px-4 py-3">
                  <div className="flex gap-3 items-center min-h-[36px]">
                    <button onClick={() => setSelectedOrder(o)} className="text-[11px] tracking-[0.15em] uppercase text-gold-dark font-body hover:text-gold transition-colors py-1">View</button>
                    <button onClick={() => deleteOrder(o.id)} className="text-[11px] tracking-[0.15em] uppercase text-red-400 font-body hover:text-red-500 transition-colors py-1">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-ivory dark:bg-[#0A0A0A] border border-gold/10 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-medium text-charcoal dark:text-[#E8E0D8]">{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-warm-gray hover:text-charcoal text-lg">✕</button>
            </div>

            <div className="mb-6">
              <h3 className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-2">Customer Details</h3>
              <div className="border border-gold/10 p-4 space-y-1.5">
                <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Name:</span> {selectedOrder.customer?.name || "—"}</p>
                <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Email:</span> {selectedOrder.customer?.email || selectedOrder.userEmail || "—"}</p>
                <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Phone:</span> {selectedOrder.customer?.phone || "—"}</p>
                <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">County:</span> {selectedOrder.customer?.county || "—"}</p>
                <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Town:</span> {selectedOrder.customer?.town || "—"}</p>
                <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Address:</span> {selectedOrder.customer?.address || "—"}</p>
                {selectedOrder.customer?.notes && <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Notes:</span> {selectedOrder.customer.notes}</p>}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-2">Order Details</h3>
              <div className="border border-gold/10 p-4 space-y-1.5">
                <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Date:</span> {selectedOrder.date}</p>
                <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Status:</span> {selectedOrder.status}</p>
                <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Payment:</span> {selectedOrder.paymentMethod || "—"}</p>
                {selectedOrder.mpesaCode && (
                  <div className="pt-2 border-t border-gold/10">
                    <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">M-Pesa Code:</span> <span className="font-mono text-sm text-gold-dark font-bold">{selectedOrder.mpesaCode}</span></p>
                    <p className={`text-xs font-body mt-1 ${selectedOrder.paymentVerified ? "text-green-600" : "text-amber-500"}`}>
                      {selectedOrder.paymentVerified ? "✓ Payment Verified" : "⚠ Pending Verification"}
                    </p>
                  </div>
                )}
                <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Subtotal:</span> <span className="text-gold-dark font-serif">{formatKES(selectedOrder.subtotal || selectedOrder.total)}</span></p>
                {selectedOrder.shipping && <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Shipping:</span> <span className="text-gold-dark font-serif">{formatKES(selectedOrder.shipping)}</span></p>}
                <p className="text-xs font-body text-charcoal dark:text-[#E8E0D8]"><span className="text-warm-gray">Total:</span> <span className="text-gold-dark font-serif">{formatKES(selectedOrder.total)}</span></p>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-2">Ordered Products</h3>
              <div className="space-y-2">
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="border border-gold/10 p-3 flex justify-between items-center">
                    <div>
                      <p className="font-serif text-sm text-charcoal dark:text-[#E8E0D8]">{item.name}</p>
                      <p className="text-[9px] tracking-[0.15em] uppercase text-warm-gray font-body">{item.category} × {item.quantity}</p>
                    </div>
                    <span className="font-serif text-sm text-gold-dark">{formatKES(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gold/10 space-y-3">
              {selectedOrder.mpesaCode && !selectedOrder.paymentVerified && (
                <button onClick={() => verifyPayment(selectedOrder.id)} className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-ivory font-body transition-colors">
                  ✓ Verify Payment & Process Order
                </button>
              )}
              <div className="flex gap-3">
                <select value={selectedOrder.status} onChange={e => { updateStatus(selectedOrder.id, e.target.value); setSelectedOrder({ ...selectedOrder, status: e.target.value }); }} className="flex-1 border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-2.5 text-xs text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold font-body">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => deleteOrder(selectedOrder.id)} className="border border-red-300 px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase text-red-400 font-body hover:bg-red-50 transition-colors">Delete</button>
                <button onClick={() => setSelectedOrder(null)} className="border border-gold/20 px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase text-warm-gray font-body hover:text-charcoal transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
