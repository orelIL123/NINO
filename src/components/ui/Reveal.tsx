"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades its children up as they scroll into view, once.
 *
 * Deliberately uses a rAF-throttled scroll check rather than
 * IntersectionObserver. The observer is the more fashionable tool, but it
 * gives no way to tell "not intersecting yet" apart from "never going to
 * fire" — and when it silently does not fire, every wrapped section stays at
 * opacity 0 and the page looks empty. A rect check cannot fail that way: the
 * worst case is a reveal that happens a frame late.
 *
 * The element is also revealed if it is already above the viewport, so
 * restoring a scroll position or deep-linking never leaves a gap.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  /** Stagger in milliseconds, for sibling reveals. */
  delay?: number;
  as?: "div" | "section" | "li";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    let done = false;

    const stop = () => {
      done = true;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };

    const check = () => {
      frame = 0;
      if (done) return;

      const { top, bottom } = node.getBoundingClientRect();
      // Trigger slightly before the top edge lands, so the motion completes
      // as the section settles instead of after it is already being read.
      const entered = top < window.innerHeight * 0.92 && bottom > 0;
      const passed = bottom <= 0;

      if (entered || passed) {
        setShown(true);
        stop();
      }
    };

    const schedule = () => {
      if (!frame && !done) frame = requestAnimationFrame(check);
    };

    // Defer the first check by a frame so the effect body stays free of a
    // synchronous setState, and layout has settled before we measure.
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return stop;
  }, []);

  const Element = Tag as React.ElementType;

  return (
    <Element
      ref={ref}
      className={`reveal ${shown ? "reveal-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Element>
  );
}
