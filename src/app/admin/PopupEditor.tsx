"use client";

import { useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Editor for the popup shown to first-time visitors.                        */
/* -------------------------------------------------------------------------- */

type Popup = {
  enabled: boolean;
  title: { he: string; en: string };
  body: { he: string; en: string };
  ctaLabel: { he: string; en: string };
  ctaHref: string;
  imageUrl: string;
  version: number;
};

const EMPTY: Popup = {
  enabled: false,
  title: { he: "", en: "" },
  body: { he: "", en: "" },
  ctaLabel: { he: "", en: "" },
  ctaHref: "",
  imageUrl: "",
  version: 1,
};

const inputClass =
  "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-black focus:ring-2 focus:ring-black/5";
const labelClass = "mb-2 block text-sm font-semibold text-black/75";

export default function PopupEditor() {
  const [popup, setPopup] = useState<Popup>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/admin/popup", { cache: "no-store" })
      .then(async (response) => (await response.json()) as {
        ok: boolean;
        popup?: Popup;
        error?: string;
      })
      .then((data) => {
        if (cancelled) return;
        if (data.ok && data.popup) setPopup({ ...EMPTY, ...data.popup });
        else setMessage({ tone: "bad", text: data.error ?? "טעינה נכשלה" });
      })
      .catch(() => {
        if (!cancelled) setMessage({ tone: "bad", text: "טעינה נכשלה" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/popup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(popup),
      });
      const data = await res.json();
      if (data.ok) {
        setPopup({ ...EMPTY, ...data.popup });
        setMessage({
          tone: "ok",
          text: "נשמר. מבקרים שכבר סגרו את החלון יראו את הגרסה החדשה.",
        });
      } else {
        const reasons: Record<string, string> = {
          missing_title: "צריך כותרת בעברית ובאנגלית כדי להפעיל",
          cta_must_be_relative: "הקישור חייב להתחיל ב־/ (למשל /shop)",
        };
        setMessage({ tone: "bad", text: reasons[data.error] ?? data.error });
      }
    } catch {
      setMessage({ tone: "bad", text: "השמירה נכשלה" });
    } finally {
      setSaving(false);
    }
  }

  const set = <K extends keyof Popup>(key: K, value: Popup[K]) =>
    setPopup((p) => ({ ...p, [key]: value }));

  const setPair = (key: "title" | "body" | "ctaLabel", lang: "he" | "en", value: string) =>
    setPopup((p) => ({ ...p, [key]: { ...p[key], [lang]: value } }));

  return (
    <section className="mt-14 border-t border-black/10 pt-12">
      <p className="text-xs font-semibold tracking-[0.16em] text-black/40 uppercase">
        Popup Admin
      </p>
      <h2 className="mt-2 text-3xl font-bold">חלון קופץ למבקרים חדשים</h2>
      <p className="mt-2 max-w-2xl text-black/55">
        מופיע פעם אחת לכל מבקר, כ־1.2 שניות אחרי הכניסה. כל שינוי בתוכן מציג
        אותו מחדש גם למי שכבר סגר אותו.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-black/50">טוען…</p>
      ) : (
        <div className="mt-6 space-y-6">
      <label className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-4">
        <input
          type="checkbox"
          checked={popup.enabled}
          onChange={(e) => set("enabled", e.target.checked)}
          className="h-5 w-5 accent-black"
        />
        <span className="text-[15px] font-semibold">
          להציג את החלון למבקרים חדשים
        </span>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <span className={labelClass}>כותרת (עברית)</span>
          <input
            className={inputClass}
            value={popup.title.he}
            onChange={(e) => setPair("title", "he", e.target.value)}
            placeholder="ברוכים הבאים ל־NINO"
          />
        </div>
        <div>
          <span className={labelClass}>Title (English)</span>
          <input
            className={inputClass}
            dir="ltr"
            value={popup.title.en}
            onChange={(e) => setPair("title", "en", e.target.value)}
            placeholder="Welcome to NINO"
          />
        </div>

        <div>
          <span className={labelClass}>טקסט (עברית)</span>
          <textarea
            rows={3}
            className={`${inputClass} resize-y`}
            value={popup.body.he}
            onChange={(e) => setPair("body", "he", e.target.value)}
            placeholder="10% הנחה על ההזמנה הראשונה"
          />
        </div>
        <div>
          <span className={labelClass}>Text (English)</span>
          <textarea
            rows={3}
            dir="ltr"
            className={`${inputClass} resize-y`}
            value={popup.body.en}
            onChange={(e) => setPair("body", "en", e.target.value)}
            placeholder="10% off your first order"
          />
        </div>

        <div>
          <span className={labelClass}>כפתור (עברית)</span>
          <input
            className={inputClass}
            value={popup.ctaLabel.he}
            onChange={(e) => setPair("ctaLabel", "he", e.target.value)}
            placeholder="לקולקציה"
          />
        </div>
        <div>
          <span className={labelClass}>Button (English)</span>
          <input
            className={inputClass}
            dir="ltr"
            value={popup.ctaLabel.en}
            onChange={(e) => setPair("ctaLabel", "en", e.target.value)}
            placeholder="Shop now"
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>קישור הכפתור</span>
        <input
          className={inputClass}
          dir="ltr"
          value={popup.ctaHref}
          onChange={(e) => set("ctaHref", e.target.value)}
          placeholder="/shop"
        />
        <p className="mt-2 text-xs text-black/50">
          נתיב פנימי שמתחיל ב־/ . השפה נוספת אוטומטית. השאירו ריק כדי להסתיר את
          הכפתור.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-black px-6 py-3 text-[15px] font-semibold text-white transition disabled:opacity-50"
        >
          {saving ? "שומר…" : "שמירה"}
        </button>
        <span className="text-xs text-black/45">גרסה {popup.version}</span>
      </div>

          {message && (
            <p
              role="status"
              className={`text-sm ${
                message.tone === "ok" ? "text-green-700" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
