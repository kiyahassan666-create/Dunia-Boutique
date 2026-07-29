"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useBusinessSettings, type ShippingZone } from "@/lib/useBusinessSettings";

let zoneCounter = 4;

export default function AdminSettings() {
  const settings = useBusinessSettings();
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [mpesaNumber, setMpesaNumber] = useState(settings.mpesaNumber);
  const [mpesaAccountName, setMpesaAccountName] = useState(settings.mpesaAccountName);
  const [zones, setZones] = useState<ShippingZone[]>(settings.shippingZones);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const initialLoadDone = useRef(false);

  // Sync local state from Firestore settings only on first load
  useEffect(() => {
    if (!initialLoadDone.current) {
      setBusinessName(settings.businessName);
      setMpesaNumber(settings.mpesaNumber);
      setMpesaAccountName(settings.mpesaAccountName);
      setZones(settings.shippingZones);
      initialLoadDone.current = true;
    }
  }, [settings]);

  const addZone = () => {
    setZones(prev => [...prev, { id: `zone_${zoneCounter++}`, name: "", fee: 0 }]);
  };

  const updateZone = (id: string, field: keyof ShippingZone, value: string | number) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, [field]: value } : z));
  };

  const removeZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
  };

  const setMessageTimeout = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  }, []);

  const handleSave = async () => {
    if (!db) {
      setMessageTimeout("Firestore not initialized");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await setDoc(doc(db, "settings", "business"), {
        businessName,
        mpesaNumber,
        mpesaAccountName,
        shippingZones: zones,
      });
      setMessageTimeout("Settings saved successfully");
    } catch (err: any) {
      setMessageTimeout(`Failed to save: ${err?.message || "Unknown error"}`);
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-serif text-2xl font-medium text-charcoal dark:text-[#E8E0D8]">Settings</h1>
        <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mt-1">Business configuration</p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 border text-xs font-body ${
          message.includes("Failed")
            ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
            : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
        }`}>
          {message}
        </div>
      )}

      {/* Business Info */}
      <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8 mb-8">
        <h2 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-6">Business Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="sm:col-span-2">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">M-Pesa Number</label>
            <input
              type="text"
              value={mpesaNumber}
              onChange={e => setMpesaNumber(e.target.value)}
              className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold"
              placeholder="e.g. 0712345678"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">M-Pesa Account Name</label>
            <input
              type="text"
              value={mpesaAccountName}
              onChange={e => setMpesaAccountName(e.target.value)}
              className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold"
              placeholder="e.g. Halima Maalim"
            />
          </div>
        </div>
      </div>

      {/* Shipping Zones */}
      <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8]">Shipping Zones</h2>
          <button
            onClick={addZone}
            className="border border-gold/20 px-4 py-2 text-[10px] tracking-[0.15em] uppercase text-gold-dark font-body hover:bg-gold/5 transition-colors"
          >
            + Add Zone
          </button>
        </div>

        {zones.length === 0 ? (
          <p className="text-xs text-warm-gray font-body text-center py-8">No shipping zones configured. Click "Add Zone" to create one.</p>
        ) : (
          <div className="space-y-3">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center gap-3 border border-gold/10 p-4">
                <input
                  type="text"
                  value={zone.name}
                  onChange={e => updateZone(zone.id, "name", e.target.value)}
                  placeholder="Zone name (e.g. Nairobi CBD)"
                  className="flex-1 border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-3 py-2 text-xs text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold font-body min-w-0"
                />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-[9px] tracking-[0.15em] uppercase text-warm-gray font-body">KSh</span>
                  <input
                    type="number"
                    value={zone.fee}
                    onChange={e => updateZone(zone.id, "fee", parseInt(e.target.value) || 0)}
                    className="w-24 border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-3 py-2 text-xs text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold font-body"
                    min={0}
                  />
                </div>
                <button
                  onClick={() => removeZone(zone.id)}
                  className="text-red-400 hover:text-red-500 text-xs px-2 py-1 transition-colors flex-shrink-0"
                  title="Remove zone"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-charcoal dark:bg-gold px-8 py-3.5 text-[10px] tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body transition-all hover:bg-gold hover:text-charcoal dark:hover:bg-ivory disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
