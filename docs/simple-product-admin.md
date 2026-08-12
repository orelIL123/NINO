# ממשק ניהול המוצרים של NINO

הממשק נמצא בנתיב `/admin` באתר הפרודקשן. הוא נועד להחליף את מסך יצירת המוצר
העמוס של Shopify, אבל Shopify נשאר מקור האמת למוצרים, תמונות, מחירים ומלאי.

## מה הממשק עושה

- כניסה בסיסמה פרטית ועוגיית session חתומה ל־12 שעות.
- העלאה של 1–3 תמונות. תמונות גדולות מוקטנות בדפדפן לפני העלאה.
- יצירת `Size` ו־`Color` בדיוק בשמות שהחנות דורשת.
- יצירת וריאנט לכל מידה, מעקב מלאי ו־SKU.
- תגיות קבוצה ומגדר אוטומטיות, עם `new` ו־`bestseller` לפי בחירה.
- מחיר מבצע רק כאשר ממלאים מחיר קודם גבוה יותר.
- תרגום עברי אופציונלי לכותרת ולתיאור.
- שמירה כטיוטה או פרסום ל־Online Store.

המוצר נוצר תחילה כטיוטה. רק לאחר שהתמונות, הווריאנטים והמלאי נשמרו הוא הופך
לפעיל ומתפרסם. כך תקלה באמצע לא מציגה ללקוחות מוצר חלקי.

## הגדרה חד־פעמית

ב־Vercel → Project → Settings → Environment Variables יש להוסיף:

```env
SHOPIFY_STORE_DOMAIN=p9xvga-8t.myshopify.com
SHOPIFY_CLIENT_ID=<Dev Dashboard client ID>
SHOPIFY_CLIENT_SECRET=<Dev Dashboard client secret>
SHOPIFY_API_VERSION=2026-01
ADMIN_PANEL_PASSWORD=<סיסמה פרטית חזקה>
ADMIN_SESSION_SECRET=<מפתח אקראי של לפחות 32 תווים>
```

את `ADMIN_SESSION_SECRET` אפשר ליצור כך:

```bash
openssl rand -base64 48
```

### הרשאות Shopify הנדרשות

אפליקציית ה־Dev Dashboard צריכה את ההרשאות הבאות:

- `write_products`, `read_products`
- `write_inventory`, `read_inventory`, `read_locations`
- `write_publications`, `read_publications`
- `write_translations`, `read_translations`
- `write_files`, `read_files`

ה־Client secret נשאר בצד השרת בלבד. השרת מחליף אותו לטוקן קצר־חיים ומחדש אותו
אוטומטית. אסור לקרוא למשתני הסוד בשם שמתחיל ב־`NEXT_PUBLIC_`.

## שימוש

1. פותחים `https://<הדומיין>/admin`.
2. נכנסים עם `ADMIN_PANEL_PASSWORD`.
3. מעלים 1–3 תמונות וממלאים את השדות.
4. לוחצים “יצירת מוצר”.
5. המוצר מופיע ב־Shopify ובקולקציות האוטומטיות בהתאם לתגיות.

אם יצירת המוצר נעצרת אחרי שנוצרה טיוטה, הממשק מציג זאת במפורש. אפשר לפתוח את
הטיוטה ב־Shopify, לתקן או למחוק אותה בלי שלקוחות יראו אותה.
