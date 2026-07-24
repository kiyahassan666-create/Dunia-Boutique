import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-8 text-center">
      <span className="font-heading text-8xl font-semibold text-gold/30">404</span>
      <h1 className="mt-4 font-heading text-2xl text-charcoal dark:text-[#E8E0D8]">
        Page not found
      </h1>
      <p className="mt-2 font-sub text-lg text-warm-gray/70 dark:text-[#A09890]/70">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex border-b border-gold pb-1 text-[11px] tracking-[0.2em] uppercase text-gold-dark hover:text-charcoal transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
