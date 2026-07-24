"use client";

import { useState } from "react";
import Link from "next/link";

const WHATSAPP_NUMBER = "254725133957";
const DISPLAY_NUMBER = "0725 133 957";

export default function ContactPage() {
  const [message, setMessage] = useState("");

  const openWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(message || "Hii I want to know more about your products");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-cream dark:bg-[#0F0F0F]">
      <div className="mx-auto max-w-4xl px-6 lg:px-12">
        <div className="text-center mb-16">
          <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold-dark font-body font-medium mb-4">
            Get in Touch
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-charcoal dark:text-[#E8E0D8]">
            Contact Us
          </h1>
          <p className="mt-4 font-serif text-base text-warm-gray dark:text-[#A09890] italic max-w-lg mx-auto">
            We&apos;d love to hear from you. Reach out via WhatsApp or follow us on social media.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* WhatsApp Card */}
          <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">💬</span>
              <div>
                <h2 className="font-serif text-xl font-medium text-charcoal dark:text-[#E8E0D8]">WhatsApp</h2>
                <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mt-0.5">{DISPLAY_NUMBER}</p>
              </div>
            </div>
            <p className="font-serif text-sm text-warm-gray dark:text-[#A09890] leading-relaxed mb-6">
              Chat with us directly on WhatsApp. Send us a message and we&apos;ll get back to you as soon as possible.
            </p>
            <form onSubmit={openWhatsApp} className="space-y-4">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Hii I want to know more about your products"
                rows={4}
                className="w-full border border-gold/20 bg-cream dark:bg-[#0F0F0F] px-5 py-4 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold transition-colors font-body resize-none"
              />
              <button
                type="submit"
                className="w-full bg-[#25D366] hover:bg-[#1DA851] py-4 text-[10px] tracking-[0.25em] uppercase text-white font-body transition-colors flex items-center justify-center gap-2"
              >
                <span>Send via WhatsApp</span>
                <span className="text-base">↗</span>
              </button>
            </form>
          </div>

          {/* Social Media & Info */}
          <div className="space-y-8">
            <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8 lg:p-10">
              <h2 className="font-serif text-xl font-medium text-charcoal dark:text-[#E8E0D8] mb-6">Follow Us</h2>
              <div className="space-y-5">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <span className="w-10 h-10 flex items-center justify-center border border-gold/20 text-warm-gray group-hover:text-gold group-hover:border-gold transition-colors text-sm font-body">IG</span>
                  <div>
                    <p className="font-serif text-sm text-charcoal dark:text-[#E8E0D8] group-hover:text-gold transition-colors">Instagram</p>
                    <p className="text-[9px] tracking-[0.15em] uppercase text-warm-gray/60 font-body">@dunia.boutique</p>
                  </div>
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <span className="w-10 h-10 flex items-center justify-center border border-gold/20 text-warm-gray group-hover:text-gold group-hover:border-gold transition-colors text-sm font-body">TK</span>
                  <div>
                    <p className="font-serif text-sm text-charcoal dark:text-[#E8E0D8] group-hover:text-gold transition-colors">TikTok</p>
                    <p className="text-[9px] tracking-[0.15em] uppercase text-warm-gray/60 font-body">@dunia.boutique</p>
                  </div>
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <span className="w-10 h-10 flex items-center justify-center border border-gold/20 text-warm-gray group-hover:text-gold group-hover:border-gold transition-colors text-sm font-body">SC</span>
                  <div>
                    <p className="font-serif text-sm text-charcoal dark:text-[#E8E0D8] group-hover:text-gold transition-colors">Snapchat</p>
                    <p className="text-[9px] tracking-[0.15em] uppercase text-warm-gray/60 font-body">@dunia.boutique</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="border border-gold/10 bg-ivory dark:bg-[#0A0A0A] p-8 lg:p-10">
              <h2 className="font-serif text-xl font-medium text-charcoal dark:text-[#E8E0D8] mb-4">Visit Us</h2>
              <p className="font-serif text-sm text-warm-gray dark:text-[#A09890] leading-relaxed">
                Dunia Boutique<br />
                Nairobi, Kenya
              </p>
              <p className="font-serif text-sm text-warm-gray dark:text-[#A09890] leading-relaxed mt-4">
                <span className="text-charcoal dark:text-[#E8E0D8]">Phone:</span> {DISPLAY_NUMBER}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
