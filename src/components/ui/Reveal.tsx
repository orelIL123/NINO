/**
 * Marks a block to fade up as it scrolls into view.
 *
 * Intentionally a server component with no client JavaScript. The motion is
 * defined entirely in CSS via a scroll-driven `animation-timeline: view()`,
 * which means:
 *
 *   - nothing is shipped to the browser for it
 *   - the section is visible by default, so a browser without scroll-driven
 *     animation support just renders it plainly
 *   - there is no failure mode where the content stays invisible
 *
 * Earlier revisions drove this from JavaScript (IntersectionObserver, then a
 * scroll listener). Both were observed silently never firing in a real
 * environment, which left every wrapped section stuck at opacity 0. Content
 * visibility should not depend on script running correctly.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  as?: "div" | "section" | "li";
  className?: string;
}) {
  return <Tag className={`reveal ${className}`}>{children}</Tag>;
}
