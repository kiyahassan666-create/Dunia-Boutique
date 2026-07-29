"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export interface ShippingZone {
  id: string;
  name: string;
  fee: number;
}

export interface BusinessSettings {
  businessName: string;
  mpesaNumber: string;
  mpesaAccountName: string;
  shippingZones: ShippingZone[];
}

const DEFAULTS: BusinessSettings = {
  businessName: "Dunia Boutique",
  mpesaNumber: "0725133957",
  mpesaAccountName: "Halima Maalim",
  shippingZones: [
    { id: "zone_1", name: "Nairobi CBD", fee: 300 },
    { id: "zone_2", name: "Nairobi Outskirts", fee: 500 },
    { id: "zone_3", name: "Rest of Kenya", fee: 800 },
  ],
};

// Simple in-memory cache so multiple consumers don't create multiple listeners
let cachedSettings: BusinessSettings | null = null;
let cacheListeners: Array<(s: BusinessSettings) => void> = [];
let cacheUnsub: (() => void) | null = null;

function startListening(callback: (s: BusinessSettings) => void) {
  cacheListeners.push(callback);
  if (cachedSettings) {
    callback(cachedSettings);
  }
  if (!cacheUnsub && db) {
    cacheUnsub = onSnapshot(doc(db, "settings", "business"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as BusinessSettings;
        cachedSettings = { ...DEFAULTS, ...data };
        cacheListeners.forEach(cb => cb(cachedSettings!));
      } else {
        cachedSettings = { ...DEFAULTS };
        cacheListeners.forEach(cb => cb(cachedSettings!));
      }
    }, () => {
      // Error or permission denied — return defaults
      cachedSettings = { ...DEFAULTS };
      cacheListeners.forEach(cb => cb(cachedSettings!));
    });
  }
}

function stopListening(callback: (s: BusinessSettings) => void) {
  cacheListeners = cacheListeners.filter(cb => cb !== callback);
  if (cacheListeners.length === 0 && cacheUnsub) {
    cacheUnsub();
    cacheUnsub = null;
  }
}

export function useBusinessSettings(): BusinessSettings {
  const [settings, setSettings] = useState<BusinessSettings>(cachedSettings || DEFAULTS);

  useEffect(() => {
    startListening(setSettings);
    return () => stopListening(setSettings);
  }, []);

  return settings;
}

/** Fetch settings once (for contexts where hooks can't be used or during SSR) */
export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  if (cachedSettings) return cachedSettings;
  if (!db) return DEFAULTS;
  try {
    const { getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "settings", "business"));
    if (snap.exists()) {
      cachedSettings = { ...DEFAULTS, ...snap.data() } as BusinessSettings;
      return cachedSettings;
    }
  } catch {}
  return DEFAULTS;
}
