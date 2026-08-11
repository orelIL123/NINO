import Link from "next/link";

/**
 * The wordmark. Letter-spacing adds trailing space after the last character,
 * so an equal padding on the leading side keeps it optically centred.
 */
export default function Logo({
  href,
  className = "",
  size = "md",
}: {
  href: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-lg tracking-[0.42em] ps-[0.42em]",
    md: "text-xl md:text-3xl tracking-[0.5em] ps-[0.5em] md:tracking-[0.6em] md:ps-[0.6em]",
    lg: "text-3xl md:text-5xl tracking-[0.55em] ps-[0.55em] md:tracking-[0.7em] md:ps-[0.7em]",
  } as const;

  return (
    <Link
      href={href}
      aria-label="NINO"
      className={`inline-block font-light leading-none text-ink select-none ${sizes[size]} ${className}`}
    >
      <span aria-hidden="true">NINO</span>
    </Link>
  );
}
