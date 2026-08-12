"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades its children up as they scroll into view, once.
 *
 * The observer is disconnected on the first intersection — a reveal that
 * replays on every scroll past is distracting on a long product page.
 *
 * If IntersectionObserver is unavailable the content is shown immediately
 * rather than left transparent; a missing animation is a far smaller failure
 * than a blank section.
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

    // Without an observer there is nothing to wait for, so reveal straight
    // away by touching the DOM rather than scheduling another render.
    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("reveal-in");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      // Trigger a little before the element is fully on screen so the motion
      // finishes as it settles, instead of starting once it is already read.
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
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
