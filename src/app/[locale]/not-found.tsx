import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-nino max-w-lg py-28 text-center">
      <p className="font-display text-6xl font-light">404</p>
      <h1 className="mt-4 text-lg">הדף לא נמצא · Page not found</h1>
      <p className="mt-3 text-sm text-ink-soft">
        הקישור שהגעתם ממנו כנראה כבר לא קיים.
        <br />
        The link you followed no longer exists.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/he" className="btn btn-primary">
          חזרה לדף הבית
        </Link>
        <Link href="/en" className="btn btn-ghost">
          Back home
        </Link>
      </div>
    </div>
  );
}
