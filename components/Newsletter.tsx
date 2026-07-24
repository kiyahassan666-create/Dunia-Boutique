"use client";

export function Newsletter() {
  return (
    <section className="relative px-6 py-20 lg:px-12 lg:py-28 bg-charcoal dark:bg-black">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="mx-auto max-w-xl text-center">
        <span className="inline-block text-[10px] tracking-[0.35em] uppercase text-gold font-body font-medium mb-3">
          Stay Connected
        </span>
        <h2 className="font-serif text-3xl font-medium text-ivory lg:text-4xl">
          Join the Inner Circle
        </h2>
        <p className="mt-3 font-serif text-base text-ivory/50 italic leading-relaxed">
          Be the first to discover new collections, exclusive drops, and artisan stories.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); alert("Welcome to the Dunia family."); }}
          className="mx-auto mt-10 flex max-w-md border-b border-gold/40"
        >
          <input
            type="email"
            placeholder="Your email address"
            required
            className="flex-1 bg-transparent px-0 py-4 text-sm text-ivory placeholder:text-ivory/30 placeholder:font-serif placeholder:italic outline-none"
          />
          <button
            type="submit"
            className="px-0 py-4 text-[10px] font-medium tracking-[0.25em] uppercase text-gold hover:text-ivory transition-colors whitespace-nowrap font-body"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
