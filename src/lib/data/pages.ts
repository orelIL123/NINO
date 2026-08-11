import type { Locale } from "@/lib/i18n/config";

export interface InfoBlock {
  heading: Record<Locale, string>;
  body: Record<Locale, string[]>;
}

export interface InfoPage {
  slug: string;
  title: Record<Locale, string>;
  intro?: Record<Locale, string>;
  blocks: InfoBlock[];
}

export const infoPages: InfoPage[] = [
  {
    slug: "shipping",
    title: { he: "משלוחים", en: "Shipping" },
    intro: {
      he: "אנחנו שולחים לכל הארץ, ותמיד אפשר לאסוף מהחנות בנתיבות.",
      en: "We ship across Israel, and pickup from the Netivot store is always available.",
    },
    blocks: [
      {
        heading: { he: "זמני אספקה", en: "Delivery times" },
        body: {
          he: [
            "משלוח שליח עד הבית: 2–5 ימי עסקים.",
            "איסוף עצמי מהחנות: מוכן תוך 24 שעות בימי פעילות.",
            "הזמנות שמתקבלות אחרי 14:00 מטופלות ביום העסקים הבא.",
          ],
          en: [
            "Courier to your door: 2–5 business days.",
            "Store pickup: ready within 24 hours on working days.",
            "Orders placed after 14:00 are handled the next business day.",
          ],
        },
      },
      {
        heading: { he: "עלויות", en: "Costs" },
        body: {
          he: [
            "משלוח שליח: ₪29.",
            "משלוח חינם בקנייה מעל ₪400.",
            "איסוף מהחנות: ללא עלות.",
          ],
          en: [
            "Courier: ₪29.",
            "Free shipping on orders over ₪400.",
            "Store pickup: free.",
          ],
        },
      },
    ],
  },
  {
    slug: "returns",
    title: { he: "החזרות והחלפות", en: "Returns & exchanges" },
    intro: {
      he: "רוצים להחליף? אין בעיה. אנחנו רוצים שתהיו מרוצים מהפריט.",
      en: "Want to exchange? No problem — we want you to love what you bought.",
    },
    blocks: [
      {
        heading: { he: "התנאים", en: "The terms" },
        body: {
          he: [
            "ניתן להחזיר או להחליף תוך 14 יום מקבלת ההזמנה.",
            "הפריט צריך להיות ללא שימוש, עם התווית המקורית.",
            "יש לצרף חשבונית או אישור הזמנה.",
            "פריטי הלבשה תחתונה ובגדי ים אינם ניתנים להחזרה מטעמי היגיינה.",
          ],
          en: [
            "Returns and exchanges within 14 days of delivery.",
            "Items must be unworn with the original tag attached.",
            "Please include the invoice or order confirmation.",
            "Underwear and swimwear cannot be returned for hygiene reasons.",
          ],
        },
      },
      {
        heading: { he: "איך מחזירים", en: "How to return" },
        body: {
          he: [
            "הכי פשוט: להביא את הפריט לחנות בנתיבות.",
            "לחלופין, כתבו לנו בוואטסאפ ונתאם איסוף.",
            "הזיכוי מבוצע לאמצעי התשלום המקורי תוך 7 ימי עסקים.",
          ],
          en: [
            "Simplest: bring the item to the store in Netivot.",
            "Or message us on WhatsApp and we'll arrange a pickup.",
            "Refunds are issued to the original payment method within 7 business days.",
          ],
        },
      },
    ],
  },
  {
    slug: "faq",
    title: { he: "שאלות נפוצות", en: "FAQ" },
    blocks: [
      {
        heading: { he: "איך אני יודע איזו מידה להזמין?", en: "Which size should I order?" },
        body: {
          he: [
            "בכל דף מוצר יש טבלת מידות והמלצה על הגזרה. אם עדיין מתלבטים — כתבו לנו בוואטסאפ ונעזור.",
          ],
          en: [
            "Every product page has a size chart and a fit note. Still unsure? Message us on WhatsApp and we'll help.",
          ],
        },
      },
      {
        heading: { he: "אפשר לשריין פריט?", en: "Can you hold an item for me?" },
        body: {
          he: ["בהחלט. שלחו הודעה עם שם הפריט והמידה, ונשמור אותו ל-48 שעות."],
          en: ["Of course. Send us the item name and size and we'll hold it for 48 hours."],
        },
      },
      {
        heading: { he: "יש כרטיס מתנה?", en: "Do you offer gift cards?" },
        body: {
          he: ["כן, בחנות. כרטיס מתנה דיגיטלי יהיה זמין באתר בקרוב."],
          en: ["Yes, in store. Digital gift cards are coming to the site soon."],
        },
      },
    ],
  },
  {
    slug: "terms",
    title: { he: "תקנון האתר", en: "Terms of use" },
    intro: {
      he: "התקנון מנוסח בלשון זכר מטעמי נוחות בלבד ומתייחס לכל המגדרים.",
      en: "These terms apply to every purchase made through the site.",
    },
    blocks: [
      {
        heading: { he: "כללי", en: "General" },
        body: {
          he: [
            "האתר מופעל על ידי בוטיק NINO, נתיבות.",
            "המחירים באתר כוללים מע״מ ונקובים בשקלים חדשים.",
            "התמונות להמחשה בלבד; ייתכנו הבדלי גוון בין מסכים שונים.",
            "הבוטיק רשאי לעדכן מחירים ומלאי בכל עת.",
          ],
          en: [
            "The site is operated by NINO Boutique, Netivot.",
            "Prices include VAT and are shown in Israeli shekels.",
            "Images are illustrative; colours may vary between screens.",
            "The boutique may update prices and stock at any time.",
          ],
        },
      },
      {
        heading: { he: "ביטול עסקה", en: "Cancellation" },
        body: {
          he: [
            "ביטול עסקה בהתאם לחוק הגנת הצרכן, תשמ״א-1981 ותקנותיו.",
            "ניתן לבטל תוך 14 יום מקבלת המוצר.",
          ],
          en: [
            "Cancellation is subject to the Israeli Consumer Protection Law, 1981.",
            "You may cancel within 14 days of receiving the item.",
          ],
        },
      },
    ],
  },
  {
    slug: "privacy",
    title: { he: "מדיניות פרטיות", en: "Privacy policy" },
    blocks: [
      {
        heading: { he: "איזה מידע נאסף", en: "What we collect" },
        body: {
          he: [
            "פרטים שמסרתם בעת ההזמנה: שם, טלפון, אימייל וכתובת למשלוח.",
            "נתוני שימוש אנונימיים לצורך שיפור האתר.",
          ],
          en: [
            "Details you provide at checkout: name, phone, email and shipping address.",
            "Anonymous usage data used to improve the site.",
          ],
        },
      },
      {
        heading: { he: "שימוש במידע", en: "How we use it" },
        body: {
          he: [
            "לצורך אספקת ההזמנה ושירות לקוחות בלבד.",
            "לא נעביר את פרטיכם לצד שלישי, למעט ספקי משלוח וסליקה.",
            "אפשר לבקש הסרה מרשימת התפוצה בכל רגע.",
          ],
          en: [
            "Only to fulfil your order and provide customer service.",
            "We do not share your details, except with our shipping and payment providers.",
            "You can unsubscribe from our list at any time.",
          ],
        },
      },
    ],
  },
  {
    slug: "accessibility",
    title: { he: "הצהרת נגישות", en: "Accessibility statement" },
    intro: {
      he: "אנחנו משתדלים שהאתר יהיה נגיש לכולם. נתקלתם בבעיה? ספרו לנו ונתקן.",
      en: "We want this site to work for everyone. Found a problem? Tell us and we'll fix it.",
    },
    blocks: [
      {
        heading: { he: "מה נעשה באתר", en: "What we've done" },
        body: {
          he: [
            "ניווט מלא באמצעות מקלדת.",
            "תיאורים חלופיים לתמונות ומבנה כותרות סמנטי.",
            "ניגודיות צבעים בהתאם ל-WCAG 2.1 ברמה AA.",
            "כיבוד העדפת הפחתת אנימציות במערכת ההפעלה.",
          ],
          en: [
            "Full keyboard navigation.",
            "Alternative text for images and a semantic heading structure.",
            "Colour contrast that meets WCAG 2.1 level AA.",
            "Respects the operating system's reduced-motion preference.",
          ],
        },
      },
    ],
  },
];

export function getInfoPage(slug: string) {
  return infoPages.find((p) => p.slug === slug) ?? null;
}
