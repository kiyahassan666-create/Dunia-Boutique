"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80&auto=format&fit=crop";

type SafeImageProps = Omit<ImageProps, "onError"> & {
  fallbackSrc?: string;
};

export function SafeImage({ fallbackSrc = DEFAULT_FALLBACK, ...props }: SafeImageProps) {
  const [error, setError] = useState(false);

  return (
    <Image
      {...props}
      src={error ? fallbackSrc : props.src}
      onError={() => setError(true)}
    />
  );
}
