// Image preloading utility for performance optimization
export function preloadImage(src: string): void {
  if (!src) return;
  try {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  } catch {
    // Silently fail if preload not supported
  }
}

export function preloadImages(sources: string[]): void {
  sources.forEach((src) => preloadImage(src));
}

// Prefetch Firebase Storage domain
export function prefetchFirebaseStorage(): void {
  if (typeof window !== "undefined") {
    try {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = "https://firebasestorage.googleapis.com";
      document.head.appendChild(link);

      const link2 = document.createElement("link");
      link2.rel = "dns-prefetch";
      link2.href = "https://firebasestorage.googleapis.com";
      document.head.appendChild(link2);
    } catch {
      // Silently fail
    }
  }
}
