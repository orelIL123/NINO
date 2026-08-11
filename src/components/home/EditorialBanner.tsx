import Link from "next/link";

export default function EditorialBanner({
  image,
  eyebrow,
  title,
  text,
  cta,
  href,
  height = "tall",
  align = "start",
  tone = "light",
}: {
  image: string;
  eyebrow?: string;
  title: string;
  text?: string;
  cta: string;
  href: string;
  height?: "tall" | "short";
  align?: "start" | "center" | "end";
  tone?: "light" | "dark";
}) {
  const alignment = {
    start: "items-start text-start",
    center: "items-center text-center",
    end: "items-end text-end",
  }[align];

  return (
    <section
      className={`relative isolate flex overflow-hidden ${
        height === "tall" ? "min-h-[440px] md:min-h-[560px]" : "min-h-[300px]"
      }`}
    >
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-0 -z-10 ${
          tone === "dark" ? "bg-black/35" : "bg-white/10"
        }`}
        aria-hidden="true"
      />

      <div
        className={`container-nino flex flex-1 flex-col justify-center gap-4 py-20 ${alignment} ${
          tone === "dark" ? "text-white" : "text-ink"
        }`}
      >
        {eyebrow && <p className="eyebrow opacity-80">{eyebrow}</p>}
        <h2 className="max-w-xl font-display text-4xl leading-tight font-light md:text-5xl">
          {title}
        </h2>
        {text && <p className="max-w-md text-sm md:text-base">{text}</p>}
        <Link
          href={href}
          className={`btn mt-3 ${
            tone === "dark"
              ? "border-white bg-white text-ink hover:bg-transparent hover:text-white"
              : "btn-primary"
          }`}
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}
