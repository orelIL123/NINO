import Link from "next/link";

export default function SectionHeader({
  title,
  href,
  linkLabel,
  align = "between",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  align?: "between" | "center";
}) {
  if (align === "center") {
    return (
      <div className="mb-8 text-center">
        <h2 className="font-display text-3xl font-light md:text-4xl">{title}</h2>
        {href && linkLabel && (
          <Link
            href={href}
            className="link-underline mt-3 inline-block text-xs tracking-widest uppercase"
          >
            {linkLabel}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mb-7 flex items-end justify-between gap-4 border-b border-line pb-4">
      <h2 className="font-display text-2xl font-light md:text-3xl">{title}</h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="link-underline shrink-0 text-xs tracking-widest uppercase"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
