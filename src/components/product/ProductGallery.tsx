"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : ["/media/editorial-1.svg"];

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row md:gap-4">
      {list.length > 1 && (
        <div className="hide-scrollbar flex gap-2 overflow-x-auto md:w-20 md:flex-col md:overflow-visible">
          {list.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${alt} — ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-3/4 w-16 shrink-0 overflow-hidden bg-tile transition-opacity md:w-full ${
                i === active ? "ring-1 ring-ink" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain" />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-3/4 flex-1 overflow-hidden bg-tile">
        {list.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={alt}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className={`object-contain transition-opacity duration-300 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
