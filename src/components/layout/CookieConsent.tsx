"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const STORAGE_KEY = "nino-cookie-consent";

type Choice = { essential: true; analytics: boolean; marketing: boolean };

const copy = {
  he: {
    title: "הגדרות עוגיות",
    text: "אנחנו משתמשים בעוגיות חיוניות כדי להפעיל את האתר. עוגיות מדידה ושיווק יופעלו רק לאחר בחירתכם.",
    accept: "אישור הכל",
    essential: "רק חיוניות",
    settings: "הגדרות",
    save: "שמירת בחירה",
    required: "נדרש",
    analytics: "מדידה ושיפור האתר",
    marketing: "שיווק והתאמה אישית",
    manage: "ניהול עוגיות",
  },
  en: {
    title: "Cookie settings",
    text: "We use essential cookies to run the site. Analytics and marketing cookies are enabled only after your choice.",
    accept: "Accept all",
    essential: "Essential only",
    settings: "Settings",
    save: "Save choices",
    required: "Required",
    analytics: "Analytics and site improvement",
    marketing: "Marketing and personalisation",
    manage: "Cookie settings",
  },
} as const;

export default function CookieConsent() {
  const { locale } = useLocale();
  const t = copy[locale];
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) setChoice(JSON.parse(saved) as Choice);
      } catch {
        // Private browsing or a blocked storage API: the banner remains visible.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function save(next: Choice) {
    setChoice(next);
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      document.cookie = `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(next))}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {
      // The preference still applies for this session.
    }
  }

  if (choice && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 start-4 z-40 border border-line-strong bg-white px-3 py-2 text-xs text-ink shadow-sm transition-colors hover:bg-surface"
      >
        {t.manage}
      </button>
    );
  }

  const current = choice ?? { essential: true, analytics: false, marketing: false };

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label={t.title}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl border border-line-strong bg-white p-5 shadow-xl md:inset-x-auto md:end-6 md:w-[min(42rem,calc(100vw-3rem))]"
    >
      <h2 className="text-base font-medium">{t.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{t.text}</p>

      {open && (
        <div className="mt-4 space-y-3 border-y border-line py-4 text-sm">
          <label className="flex items-center justify-between gap-4">
            <span>{t.required}</span>
            <input type="checkbox" checked disabled aria-label={t.required} />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span>{t.analytics}</span>
            <input
              type="checkbox"
              checked={current.analytics}
              onChange={(event) => setChoice({ ...current, analytics: event.target.checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span>{t.marketing}</span>
            <input
              type="checkbox"
              checked={current.marketing}
              onChange={(event) => setChoice({ ...current, marketing: event.target.checked })}
            />
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => save({ essential: true, analytics: true, marketing: true })} className="bg-ink px-4 py-2 text-xs text-white transition-opacity hover:opacity-80">
          {t.accept}
        </button>
        <button type="button" onClick={() => save({ essential: true, analytics: false, marketing: false })} className="border border-line-strong px-4 py-2 text-xs transition-colors hover:bg-surface">
          {t.essential}
        </button>
        {!open ? (
          <button type="button" onClick={() => setOpen(true)} className="border border-line px-4 py-2 text-xs transition-colors hover:bg-surface">
            {t.settings}
          </button>
        ) : (
          <button type="button" onClick={() => save({ ...current, essential: true })} className="border border-line px-4 py-2 text-xs transition-colors hover:bg-surface">
            {t.save}
          </button>
        )}
      </div>
    </aside>
  );
}
