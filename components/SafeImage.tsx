"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

type SafeImageProps = Omit<ImageProps, "onError"> & {
  hideOnError?: boolean;
};

export function SafeImage({ hideOnError = true, ...props }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (!props.src) return null;
  if (error && hideOnError) return null;
  if (error) return null;

  return <Image {...props} onError={() => setError(true)} />;
}
