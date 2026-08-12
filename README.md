# NINO — חנות אונליין

אתר תדמית + חנות אונליין לבוטיק הגברים **NINO**, נתיבות — ביגוד, נעליים ואקססוריז.
Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · עברית ואנגלית עם RTL מלא.

האתר מחובר ל־**Shopify Storefront API** למוצרים, מלאי, מחירים וקולקציות.
קטלוג הדמה (73 מוצרים) נשאר כנפילה רכה בלבד אם Shopify לא מוגדרת או לא זמינה.

---

## הרצה

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm run start   # בילד production
```

אין צורך במשתני סביבה כדי להריץ את הדמו.

---

## מה יש באתר

| מסך | נתיב |
| --- | --- |
| דף בית | `/he` · `/en` |
| קטגוריה | `/he/category/tshirts` |
| עמודי-על | `/he/clothing` · `/shoes` · `/accessories` · `/sale` |
| דף מוצר | `/he/product/sable-chelsea` |
| מותגים | `/he/brands` · `/he/brands/sable` |
| חיפוש | `/he/search?q=...` |
| סל | `/he/cart` |
| צ׳קאאוט | `/he/checkout` |
| מועדפים | `/he/wishlist` |
| אודות / צור קשר | `/he/about` · `/he/contact` |
| דפי מידע | `/he/info/shipping` · `returns` · `faq` · `terms` · `privacy` · `accessibility` |

בנוסף: `sitemap.xml`, `robots.txt`, JSON-LD למוצרים, ומטא-דאטה דו-לשונית עם
`hreflang`.

**מה עובד:** ניווט עם מגה-מניו, חיפוש, סינון (מותג / מידה / צבע / מחיר / מבצע)
ומיון, גלריית מוצר, בחירת מידה עם מלאי, סל עם דרואר, מועדפים, פס משלוח חינם,
טופס צ׳קאאוט מלא, ומתג שפה ששומר על הנתיב.

---

## מבנה הפרויקט

```
src/
  app/[locale]/          כל המסכים, תחת he/en
  app/api/orders/        נקודת הקצה של יצירת הזמנה
  components/            layout · home · product · collection · cart · ui
  lib/
    api/products.ts      ← שכבת הקריאה. כאן מחליפים ל-Firestore
    api/orders.ts        ← יצירת הזמנה. כאן מחברים סליקה
    data/catalog.ts      קטלוג הדמה
    data/pages.ts        תוכן דפי המידע
    firebase/            קונפיג + README עם סכמת Firestore וכללי אבטחה
    i18n/                מילון he/en + ספק locale
    store/               סל ומועדפים (Context + localStorage)
    site.ts              ← פרטי החנות: טלפון, כתובת, שעות, אינסטגרם
  fonts/                 Assistant + Cormorant, variable woff2, מתארחים מקומית
scripts/
  generate-product-images.mjs   מחולל תמונות הדמה
```

---

## מה צריך לעדכן לפני עלייה לאוויר

1. **`src/lib/site.ts`** — טלפון, כתובת מדויקת, אימייל, שעות פתיחה, וואטסאפ.
2. **תמונות** — להחליף את ה-SVG-ים ב-`public/products` ו-`public/media` בצילומים
   אמיתיים (אותם שמות קבצים, או להצביע על Firebase Storage).
3. **`src/lib/data/catalog.ts`** — או להחליף ב-Firestore, ראו למטה.
4. **תקנון ומדיניות פרטיות** ב-`src/lib/data/pages.ts` — לעבור עם עורך דין.

---

## חיבור Firebase

ההוראות המלאות, כולל סכמת Firestore, אינדקסים וכללי אבטחה:
[`src/lib/firebase/README.md`](src/lib/firebase/README.md)

בקצרה:

```bash
npm i firebase firebase-admin
cp .env.example .env.local     # ולמלא
```

ואז להחליף את גוף הפונקציות ב-`src/lib/api/products.ts`. הממשק לא צריך לדעת
שמשהו השתנה — כל הפונקציות כבר `async`.

---

## חיבור סליקה

`POST /api/orders` כבר קיים. הוא מקבל את הסל, **מתמחר אותו מחדש מהשרת** (לא סומכים
על מחירים שמגיעים מהדפדפן), בודק מלאי, ומחזיר מספר הזמנה.

מה שנשאר:

1. לשמור את ההזמנה ב-Firestore בסטטוס `pending`.
2. לפתוח סשן תשלום מול הספק (טרנזילה / קארדקום / משולם / PayPlus / Stripe)
   ולהחזיר את ה-URL או ה-token.
3. לסמן `paid` **רק** מ-webhook שרת-לשרת, אף פעם לא מהדפדפן.

נקודת החיבור בממשק מסומנת ב-`src/app/[locale]/checkout/CheckoutView.tsx`
(החלק עם המסגרת המקווקוות).

---

## אדמין

ממשק פשוט להוספת מוצרים מחובר ישירות ל־Shopify נמצא ב־`/admin`: העלאת 1–3
תמונות, מחיר, מלאי, מידות, צבע, תגיות ותרגום עברי. הוראות ההגדרה המלאות נמצאות
ב־[`docs/simple-product-admin.md`](docs/simple-product-admin.md).

---

## ביצועים

- 243 עמודים מוגשים סטטית (בית, מוצרים, מותגים, דפי מידע).
- פונטים מתארחים מקומית כ-variable woff2 — ~67KB לשלושתם, בלי בקשה ל-Google.
- אין ספריית אייקונים ואין ספריית UI — הכל SVG inline.
- הקטלוג לא מגיע לדפדפן: הסינון, החיפוש והכרטיסים מרונדרים בשרת. הסל שומר
  snapshot של הפריט, כך שהדרואר לא צריך את הקטלוג.
- תמונות דרך `next/image` עם `sizes` מדויק ו-AVIF/WebP.

---

## פריסה

הכי פשוט — Vercel: לחבר את הריפו, להוסיף את משתני הסביבה, זהו.
עובד גם על כל מקום שמריץ Node 20+ (`npm run build && npm run start`).
