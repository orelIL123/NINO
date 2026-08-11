# Firebase — how to plug it in

The storefront never talks to a database directly. Every read goes through
`src/lib/api/products.ts`, and every order goes through `src/lib/api/orders.ts`.
Those two files are the seam. Swap their bodies and the whole site switches from
demo data to live data.

## 1. Install

```bash
npm i firebase firebase-admin
```

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill it in.

Client SDK (safe to expose, they are public by design):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Admin SDK, used only from server components / route handlers — never expose:

```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 3. Firestore collections

```
products/{productId}
  slug            string    unique, used in the URL
  sku             string
  title           { he, en }
  description     { he, en }
  details         { he: string[], en: string[] }
  brand           string    -> brands/{slug}
  category        string    -> categories/{slug}
  group           'new' | 'women' | 'men' | 'shoes' | 'accessories' | 'sale'
  gender          'women' | 'men' | 'unisex'
  price           number    ILS, tax included
  compareAtPrice  number?   original price when discounted
  color           { name: { he, en }, hex }
  sizes           [{ label: string, stock: number }]
  images          string[]  Storage download URLs
  badges          string[]  'new' | 'bestseller' | 'last-units'
  popularity      number    0-100
  active          boolean   hide without deleting
  createdAt       timestamp
  updatedAt       timestamp

categories/{slug}   { title: {he,en}, group, gender, image, featured, order }
brands/{slug}       { name, country: {he,en}, description: {he,en}, order }

orders/{orderId}
  number          string    human-facing order number
  status          'pending' | 'paid' | 'packed' | 'shipped' | 'cancelled'
  lines           [{ productId, slug, title, size, quantity, price, image }]
  subtotal        number
  shipping        number
  total           number
  customer        { firstName, lastName, email, phone }
  delivery        { method: 'courier' | 'pickup', city, street, zip, notes }
  payment         { provider, transactionId, status }
  createdAt       timestamp

newsletter/{email}  { email, locale, createdAt }
```

Suggested indexes: `products` on `(active, group, createdAt desc)`,
`(active, category, price)`, `(active, compareAtPrice)`.

## 4. Security rules (starting point)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id}   { allow read: if true; allow write: if isAdmin(); }
    match /categories/{id} { allow read: if true; allow write: if isAdmin(); }
    match /brands/{id}     { allow read: if true; allow write: if isAdmin(); }

    // Orders are written by the server (Admin SDK) only.
    match /orders/{id} {
      allow read: if isAdmin();
      allow write: if false;
    }

    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

Give the shop owner the admin claim once:

```js
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

## 5. Swapping the demo data out

In `src/lib/api/products.ts`, replace the body of `getProducts` with something like:

```ts
import { adminDb } from "@/lib/firebase/admin";

export async function getProducts(query: ProductQuery = {}) {
  let ref = adminDb.collection("products").where("active", "==", true);
  if (query.category) ref = ref.where("category", "==", query.category);
  if (query.group) ref = ref.where("group", "==", query.group);
  const snap = await ref.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}
```

Keep the narrower filters (size, colour, price) in memory unless the catalog
grows past a few thousand items — Firestore charges per document read and the
boutique's catalog is small.

## 6. Images

Upload product photos to Storage under `products/{slug}/1.jpg` and store the
download URLs in `images`. Then add the bucket to `next.config.ts`:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "firebasestorage.googleapis.com" },
  ],
}
```
