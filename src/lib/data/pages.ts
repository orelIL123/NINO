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
            "משלוח שליח לכל הארץ: ₪30.",
            "משלוח חינם בקנייה מעל ₪700.",
            "איסוף מהחנות: ללא עלות.",
          ],
          en: [
            "Courier throughout Israel: ₪30.",
            "Free shipping on orders over ₪700.",
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
            "החזר כספי אפשרי עד שני ימי עסקים ממועד קבלת ההזמנה.",
            "החלפה אפשרית עד שבעה ימים ממועד קבלת ההזמנה.",
            "הפריט צריך להיות ללא שימוש, עם התווית המקורית.",
            "יש לצרף חשבונית או אישור הזמנה.",
            "פריטי הלבשה תחתונה ובגדי ים אינם ניתנים להחזרה מטעמי היגיינה.",
          ],
          en: [
            "Refunds are available within two business days of delivery.",
            "Exchanges are available within seven days of delivery.",
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
            "הזיכוי מבוצע לאמצעי התשלום המקורי עד שני ימי עסקים.",
          ],
          en: [
            "Simplest: bring the item to the store in Netivot.",
            "Or message us on WhatsApp and we'll arrange a pickup.",
            "Refunds are issued to the original payment method within two business days.",
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
            "האתר מופעל על ידי NINO חנות בוטיק, עוסק מורשה 316476308, נתיבות.",
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
    intro: {
      he: "מדיניות זו מסבירה איזה מידע NINO חנות בוטיק אוספת, מדוע, ואיך ניתן לפנות אלינו בענייני פרטיות.",
      en: "This policy explains what information NINO Boutique collects, why, and how to contact us about privacy.",
    },
    blocks: [
      {
        heading: { he: "מי אחראי על המידע", en: "Who is responsible" },
        body: {
          he: [
            "בעלת השליטה במידע היא NINO חנות בוטיק, נתיבות (עוסק מורשה 316476308).",
            "לשאלות או בקשות: Efrattorgeman123@gmail.com או WhatsApp 054-680-9924.",
          ],
          en: [
            "The data controller is NINO Boutique, Netivot (licensed dealer 316476308).",
            "For questions or requests: Efrattorgeman123@gmail.com or WhatsApp +972 54-680-9924.",
          ],
        },
      },
      {
        heading: { he: "איזה מידע נאסף ולשם מה", en: "What we collect and why" },
        body: {
          he: [
            "בעת רכישה או פנייה עשויים להיאסף שם, טלפון, אימייל, כתובת למשלוח, פרטי הזמנה ותוכן הפנייה.",
            "המידע משמש לביצוע הזמנה, סליקה, משלוח/איסוף, שירות לקוחות, מניעת הונאות ושיפור האתר.",
            "האתר אינו מוכר מידע אישי. מידע נמסר רק לספקים הדרושים להפעלת השירות, כגון Shopify, סליקה, משלוח ודוא״ל, ובהיקף הנדרש.",
          ],
          en: [
            "When you purchase or contact us, we may collect your name, phone, email, shipping address, order details and message.",
            "We use it for orders, payment, delivery/pickup, customer service, fraud prevention and site improvement.",
            "We do not sell personal information. We share it only with service providers needed to operate the store, such as Shopify, payment, delivery and email providers, to the extent required.",
          ],
        },
      },
      {
        heading: { he: "עוגיות, שמירה וזכויות", en: "Cookies, retention and your rights" },
        body: {
          he: [
            "עוגיות חיוניות נדרשות להפעלת האתר, סל הקניות והשפה. עוגיות מדידה או שיווק יופעלו רק לאחר בחירתכם בבאנר העוגיות.",
            "נשמור מידע רק כל עוד הוא נחוץ למטרות שלשמן נאסף או לפי חובה חוקית, וננקוט אמצעי אבטחה סבירים.",
            "ניתן לבקש עיון, תיקון או מחיקה של מידע אישי, בכפוף לדין ולחובות שמירת רשומות. ניתן לבטל דיוור בכל עת.",
            "המדיניות עשויה להתעדכן; הגרסה המעודכנת תפורסם בעמוד זה.",
          ],
          en: [
            "Essential cookies are needed for the site, cart and language. Analytics or marketing cookies are enabled only after your choice in the cookie banner.",
            "We retain information only as long as needed for the purposes collected or as required by law, using reasonable security measures.",
            "You may request access, correction or deletion of personal information, subject to law and record-keeping duties. You can unsubscribe at any time.",
            "This policy may be updated; the current version will be published on this page.",
          ],
        },
      },
    ],
  },
  {
    slug: "cookies",
    title: { he: "מדיניות עוגיות", en: "Cookie policy" },
    intro: {
      he: "אנו משתמשים בעוגיות חיוניות כדי שהחנות תעבוד. עוגיות לא חיוניות יופעלו רק בהסכמה.",
      en: "We use essential cookies to operate the store. Non-essential cookies are enabled only with consent.",
    },
    blocks: [
      {
        heading: { he: "סוגי עוגיות", en: "Cookie types" },
        body: {
          he: [
            "עוגיות חיוניות: סל, שפה, אבטחה והעדפת הסכמה. לא ניתן לכבות אותן.",
            "עוגיות מדידה ושיווק: כרגע אינן מופעלות כברירת מחדל; אם יתווספו, יוצגו בבאנר ותוכלו לשנות את הבחירה.",
            "אפשר לשנות את הבחירה בכל עת דרך הקישור ׳ניהול עוגיות׳ בתחתית האתר.",
          ],
          en: [
            "Essential: cart, language, security and consent preferences. They cannot be disabled.",
            "Analytics and marketing: not enabled by default today; if added, they will be shown in the banner and you can change your choice.",
            "You can change your choice at any time through ‘Cookie settings’ in the site footer.",
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
