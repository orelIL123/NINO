import Link from "next/link";

/**
 * NINO Boutique Logo - elegant serif branding
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
    sm: "h-8 w-auto",
    md: "h-12 md:h-16 w-auto",
    lg: "h-20 md:h-28 w-auto",
  } as const;

  return (
    <Link
      href={href}
      aria-label="NINO Boutique"
      className={`inline-block select-none ${className}`}
    >
      <svg
        viewBox="0 0 400 200"
        className={`${sizes[size]} text-ink`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <style>
            {`.nino-text { font-family: 'Georgia', 'Garamond', serif; font-weight: 400; }
              .nino-main { font-size: 72px; letter-spacing: 8px; }
              .nino-sub { font-size: 36px; letter-spacing: 4px; font-weight: 300; }`}
          </style>
        </defs>
        <text
          x="200"
          y="90"
          textAnchor="middle"
          className="nino-text nino-main"
          fill="currentColor"
        >
          NINO
        </text>
        <text
          x="200"
          y="140"
          textAnchor="middle"
          className="nino-text nino-sub"
          fill="currentColor"
        >
          BOUTIQUE
        </text>
      </svg>
    </Link>
  );
}
