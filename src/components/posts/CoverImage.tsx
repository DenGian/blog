"use client";
import Image from "next/image";
import { useState } from "react";
export function CoverImage({
  src,
  alt,
  priority = false,
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed)
    return (
      <div
        className="cover-placeholder"
        role="img"
        aria-label={`Geen coverafbeelding voor ${alt}`}
      >
        <span>Stagejournaal</span>
      </div>
    );
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 760px) 100vw, 50vw"
      className="cover-image"
      priority={priority}
      unoptimized={src.startsWith("http")}
      onError={() => setFailed(true)}
    />
  );
}
