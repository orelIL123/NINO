"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ChevronLeft, ChevronRight } from "@/components/ui/Icons";

/**
 * Horizontal scroll rail with snap points. The cards themselves are rendered on
 * the server and passed in as children, so no product data reaches the client.
 */
export default function ProductRail({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { dir } = useLocale();
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // scrollLeft is negative in RTL on most engines — normalise it.
    const pos = Math.abs(el.scrollLeft);
    setAtStart(pos < 8);
    setAtEnd(pos + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollBy = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8 * direction * (dir === "rtl" ? -1 : 1);
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 md:mx-0 md:gap-5 md:px-0"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(-1)}
        disabled={atStart}
        aria-label="Previous"
        className="absolute top-[38%] start-2 hidden h-10 w-10 items-center justify-center rounded-full bg-canvas/90 shadow-md transition-opacity disabled:pointer-events-none disabled:opacity-0 lg:flex"
      >
        <ChevronLeft size={20} className="rtl:rotate-180" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        disabled={atEnd}
        aria-label="Next"
        className="absolute top-[38%] end-2 hidden h-10 w-10 items-center justify-center rounded-full bg-canvas/90 shadow-md transition-opacity disabled:pointer-events-none disabled:opacity-0 lg:flex"
      >
        <ChevronRight size={20} className="rtl:rotate-180" />
      </button>
    </div>
  );
}
