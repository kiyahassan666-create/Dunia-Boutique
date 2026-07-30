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

  // ── Security / Password state ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

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

  // ── Change Password ──
  const passwordsMatch = newPassword === confirmPassword;
  const passwordMinLength = 8;
  const canSubmitPassword =
    currentPassword.length > 0 &&
    newPassword.length >= passwordMinLength &&
    passwordsMatch;

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < passwordMinLength) {
      setPasswordError(`New password must be at least ${passwordMinLength} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const { changePassword } = await import("@/lib/firebaseAuth");
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") {
        setPasswordError("Current password is incorrect.");
      } else if (err.code === "auth/weak-password") {
        setPasswordError("New password is too weak. Use at least 6 characters.");
      } else if (err.code === "auth/requires-recent-login") {
        setPasswordError("Please log out and log back in before changing your password.");
      } else {
        setPasswordError(err.message || "Failed to change password.");
      }
    }
    setChangingPassword(false);
  };

  // ── Forgot Password (send reset email) ──
  const handleSendReset = async () => {
    setSendingReset(true);
    setPasswordError("");
    setResetSent(false);
    try {
      const { sendPasswordResetEmail } = await import("@/lib/firebaseAuth");
      // Use the currently authenticated user's email
      const { getAuth } = await import("firebase/auth");
      const auth = getAuth();
      const email = auth.currentUser?.email;
      if (email) {
        await sendPasswordResetEmail(email);
      }
    } catch {
      // Swallow — generic message below
    }
    setResetSent(true);
    setSendingReset(false);
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
          <p className="text-xs text-warm-gray font-body text-center py-8">No shipping zones configured. Click &ldquo;Add Zone&rdquo; to create one.</p>
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

      {/* ── Security Section ── */}
      <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8 mb-8">
        <h2 className="font-serif text-lg font-medium text-charcoal dark:text-[#E8E0D8] mb-6">Security</h2>

        {passwordSuccess && (
          <div className="mb-6 px-4 py-3 border text-xs font-body bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400">
            {passwordSuccess}
          </div>
        )}

        {passwordError && (
          <div className="mb-6 px-4 py-3 border text-xs font-body bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
            {passwordError}
          </div>
        )}

        {resetSent && (
          <div className="mb-6 px-4 py-3 border text-xs font-body bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400">
            If that email is registered, a password reset link has been sent.
          </div>
        )}

        {/* Change Password */}
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold"
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold"
              placeholder={`At least ${passwordMinLength} characters`}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-gold/20 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold"
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-[10px] text-red-500 font-body mt-1">Passwords do not match.</p>
            )}
            {newPassword.length > 0 && newPassword.length < passwordMinLength && (
              <p className="text-[10px] text-warm-gray font-body mt-1">Minimum {passwordMinLength} characters.</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={!canSubmitPassword || changingPassword}
            className="bg-charcoal dark:bg-gold px-6 py-3 text-[10px] tracking-[0.25em] uppercase text-ivory dark:text-charcoal font-body transition-all hover:bg-gold hover:text-charcoal dark:hover:bg-ivory disabled:opacity-50"
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </div>

        <hr className="border-gold/10 my-6" />

        {/* Forgot Password */}
        <div>
          <button
            type="button"
            onClick={handleSendReset}
            disabled={sendingReset}
            className="text-[10px] tracking-[0.15em] uppercase text-warm-gray hover:text-charcoal dark:hover:text-[#E8E0D8] font-body transition-colors underline"
          >
            {sendingReset ? "Sending..." : "Forgot your password? Send reset email"}
          </button>
          <p className="text-[9px] text-warm-gray/60 font-body mt-1">
            A Firebase Auth reset link will be sent to your email.
          </p>
        </div>
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
