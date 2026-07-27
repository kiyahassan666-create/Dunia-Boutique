"use client";

const GUEST_ORDER_KEY = "dunia_guest_active_order";
const GUEST_ORDER_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface GuestOrderData {
  orderId: string;
  orderData: any;
  timestamp: number;
}

export function saveGuestOrder(orderId: string, orderData: any): void {
  try {
    const payload: GuestOrderData = {
      orderId,
      orderData,
      timestamp: Date.now(),
    };
    localStorage.setItem(GUEST_ORDER_KEY, JSON.stringify(payload));
  } catch {
    // localStorage full or unavailable
  }
}

export function getGuestOrder(): GuestOrderData | null {
  try {
    const raw = localStorage.getItem(GUEST_ORDER_KEY);
    if (!raw) return null;
    const data: GuestOrderData = JSON.parse(raw);

    // Check TTL — if expired, clear and return null
    if (Date.now() - data.timestamp > GUEST_ORDER_TTL_MS) {
      clearGuestOrder();
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function clearGuestOrder(): void {
  try {
    localStorage.removeItem(GUEST_ORDER_KEY);
  } catch {
    // ignore
  }
}

export function isGuestOrderExpired(): boolean {
  const data = getGuestOrder();
  return data === null;
}
