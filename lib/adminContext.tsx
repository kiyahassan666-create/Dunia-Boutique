"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface OrderData {
  id: string;
  orderCode: string;
  [key: string]: any;
}

interface OrdersContextValue {
  /** All orders, kept live by a single onSnapshot listener shared across the admin section. */
  orders: OrderData[];
  loading: boolean;
}

const OrdersContext = createContext<OrdersContextValue>({ orders: [], loading: true });

/**
 * Provides a single live onSnapshot listener on the `orders` collection.
 * Every admin page that needs orders reads from this context instead of
 * opening its own Firestore connection. This cuts redundant reads and
 * ensures all views see the same data at the same time.
 */
export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // Single shared listener — all admin pages derive from this
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        const raw = data as any;
        return { ...data, id: d.id, orderCode: raw?.id || raw?.orderCode || "" } as OrderData;
      });
      setOrders(list);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    unsubRef.current = unsub;
    return () => unsub();
  }, []);

  // Expose a stable reference so child callbacks don't trigger re-renders
  const value = useRef({ orders, loading });
  value.current = { orders, loading };

  return (
    <OrdersContext.Provider value={value.current}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrdersContext);
}
