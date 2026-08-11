import type { Brand, Category, Product, ProductSize } from "./types";

/* -------------------------------------------------------------------------- */
/*  DEMO CATALOG                                                              */
/*                                                                            */
/*  Everything below is placeholder data so the storefront is fully browsable  */
/*  before the real inventory exists. When Firestore is ready, the functions   */
/*  in src/lib/api/products.ts are the only place that has to change — the UI  */
/*  never imports this file directly.                                         */
/* -------------------------------------------------------------------------- */

export const brands: Brand[] = [
  { slug: "alma", name: "ALMA", country: { he: "תל אביב", en: "Tel Aviv" }, description: { he: "בייסיקים מוקפדים בגזרות רחבות ובדים טבעיים.", en: "Considered basics in relaxed cuts and natural fabrics." } },
  { slug: "maison-noir", name: "MAISON NOIR", country: { he: "פריז", en: "Paris" }, description: { he: "מינימליזם פריזאי עם קו מונוכרומטי.", en: "Parisian minimalism with a monochrome line." } },
  { slug: "terra", name: "TERRA", country: { he: "ברצלונה", en: "Barcelona" }, description: { he: "גוונים חמים, כותנה אורגנית וסריגים.", en: "Warm tones, organic cotton and knitwear." } },
  { slug: "lune", name: "LUNE", country: { he: "קופנהגן", en: "Copenhagen" }, description: { he: "אופנה סקנדינבית שקטה ליום-יום.", en: "Quiet Scandinavian everyday fashion." } },
  { slug: "atelier-nine", name: "ATELIER NINE", country: { he: "מילאנו", en: "Milan" }, description: { he: "טיילורינג איטלקי בגימור נקי.", en: "Italian tailoring with a clean finish." } },
  { slug: "nord", name: "NORD", country: { he: "סטוקהולם", en: "Stockholm" }, description: { he: "מעילים וסריגים לעונה הקרה.", en: "Outerwear and knits for the cold season." } },
  { slug: "sable", name: "SABLE", country: { he: "ליסבון", en: "Lisbon" }, description: { he: "נעליים בעבודת יד מעור מלא.", en: "Hand-finished full-grain leather footwear." } },
  { slug: "riva", name: "RIVA", country: { he: "פירנצה", en: "Florence" }, description: { he: "תיקים ואקססוריז מעור איטלקי.", en: "Italian leather bags and accessories." } },
  { slug: "velo", name: "VELO", country: { he: "אמסטרדם", en: "Amsterdam" }, description: { he: "סניקרס ובגדי ספורט-לוקס.", en: "Sneakers and sport-luxe essentials." } },
  { slug: "olive-co", name: "OLIVE & CO", country: { he: "נתיבות", en: "Netivot" }, description: { he: "המותג הפרטי של הבוטיק.", en: "The boutique's own label." } },
];

export const categories: Category[] = [
  { slug: "new-in", title: { he: "חדש באתר", en: "New in" }, group: "new", gender: "unisex", image: "/media/editorial-1.svg" },

  { slug: "dresses", title: { he: "שמלות", en: "Dresses" }, group: "women", gender: "women", image: "/media/editorial-3.svg", featured: true },
  { slug: "tops", title: { he: "חולצות וטופים", en: "Tops & shirts" }, group: "women", gender: "women", featured: true },
  { slug: "knitwear-women", title: { he: "סריגים", en: "Knitwear" }, group: "women", gender: "women" },
  { slug: "pants-women", title: { he: "מכנסיים", en: "Trousers" }, group: "women", gender: "women" },
  { slug: "skirts", title: { he: "חצאיות", en: "Skirts" }, group: "women", gender: "women" },
  { slug: "outerwear-women", title: { he: "מעילים וג׳קטים", en: "Coats & jackets" }, group: "women", gender: "women" },

  { slug: "tshirts", title: { he: "טי-שירט", en: "T-shirts" }, group: "men", gender: "men", featured: true },
  { slug: "shirts", title: { he: "חולצות מכופתרות", en: "Shirts" }, group: "men", gender: "men" },
  { slug: "knitwear-men", title: { he: "סריגים", en: "Knitwear" }, group: "men", gender: "men" },
  { slug: "pants-men", title: { he: "מכנסיים", en: "Trousers" }, group: "men", gender: "men" },
  { slug: "shorts", title: { he: "מכנסיים קצרים", en: "Shorts" }, group: "men", gender: "men" },
  { slug: "outerwear-men", title: { he: "ג׳קטים", en: "Jackets" }, group: "men", gender: "men" },

  { slug: "sneakers", title: { he: "סניקרס", en: "Sneakers" }, group: "shoes", gender: "unisex", image: "/media/editorial-2.svg", featured: true },
  { slug: "boots", title: { he: "מגפיים", en: "Boots" }, group: "shoes", gender: "unisex" },
  { slug: "heels", title: { he: "עקבים", en: "Heels" }, group: "shoes", gender: "women" },

  { slug: "bags", title: { he: "תיקים", en: "Bags" }, group: "accessories", gender: "unisex", featured: true },
  { slug: "hats", title: { he: "כובעים", en: "Hats" }, group: "accessories", gender: "unisex" },
  { slug: "sunglasses", title: { he: "משקפי שמש", en: "Sunglasses" }, group: "accessories", gender: "unisex" },
  { slug: "belts", title: { he: "חגורות", en: "Belts" }, group: "accessories", gender: "unisex" },
  { slug: "scarves", title: { he: "צעיפים", en: "Scarves" }, group: "accessories", gender: "unisex" },
];

/* -------------------------------------------------------------------------- */

const colors = {
  black: { hex: "#1c1c1c", he: "שחור", en: "Black" },
  white: { hex: "#f2f1ee", he: "לבן", en: "White" },
  cream: { hex: "#e8e0d3", he: "שמנת", en: "Cream" },
  ecru: { hex: "#ded5c6", he: "אקרו", en: "Ecru" },
  sand: { hex: "#cbb89d", he: "חול", en: "Sand" },
  camel: { hex: "#b08d57", he: "קאמל", en: "Camel" },
  brown: { hex: "#6b4f3a", he: "חום", en: "Brown" },
  olive: { hex: "#6f7355", he: "זית", en: "Olive" },
  sage: { hex: "#a8b5a0", he: "מרווה", en: "Sage" },
  forest: { hex: "#2f4739", he: "ירוק בקבוק", en: "Forest" },
  navy: { hex: "#23304a", he: "נייבי", en: "Navy" },
  denim: { hex: "#4a6382", he: "דנים", en: "Denim" },
  sky: { hex: "#a9c3d9", he: "תכלת", en: "Sky" },
  red: { hex: "#9b2c2c", he: "אדום", en: "Red" },
  burgundy: { hex: "#5e2130", he: "בורדו", en: "Burgundy" },
  pink: { hex: "#e2b9bd", he: "ורוד", en: "Pink" },
  blush: { hex: "#f0d9d6", he: "ורוד עתיק", en: "Blush" },
  lilac: { hex: "#b3a6c9", he: "לילך", en: "Lilac" },
  grey: { hex: "#8f8f8f", he: "אפור", en: "Grey" },
  charcoal: { hex: "#3a3a3a", he: "אפור פחם", en: "Charcoal" },
  mustard: { hex: "#c8a02c", he: "חרדל", en: "Mustard" },
  terracotta: { hex: "#b56a4a", he: "טרקוטה", en: "Terracotta" },
} as const;

export type ColorKey = keyof typeof colors;
export const colorList = Object.entries(colors).map(([key, v]) => ({
  key: key as ColorKey,
  hex: v.hex,
  name: { he: v.he, en: v.en },
}));

const sizeSets = {
  apparel: ["XS", "S", "M", "L", "XL"],
  apparelMen: ["S", "M", "L", "XL", "XXL"],
  numeric: ["34", "36", "38", "40", "42"],
  numericMen: ["29", "30", "32", "34", "36"],
  shoesW: ["36", "37", "38", "39", "40"],
  shoesM: ["40", "41", "42", "43", "44", "45"],
  one: ["ONE SIZE"],
} as const;

export type SizeSetKey = keyof typeof sizeSets;
export const allSizes = Array.from(
  new Set(Object.values(sizeSets).flat())
) as string[];

/**
 * Compact row format keeps the demo catalog readable:
 * [slug, title(he), title(en), brand, category, silhouette, price, compareAt, colour, sizeSet, badges]
 */
type Row = [
  string,
  string,
  string,
  string,
  string,
  string,
  number,
  number,
  ColorKey,
  SizeSetKey,
  string
];

const rows: Row[] = [
  // --- WOMEN -------------------------------------------------------------
  ["mila-midi-dress", "שמלת מידי מילה", "Mila Midi Dress", "lune", "dresses", "dress", 429, 0, "cream", "apparel", "new,bestseller"],
  ["mila-midi-dress-black", "שמלת מידי מילה", "Mila Midi Dress", "lune", "dresses", "dress", 429, 0, "black", "apparel", "new"],
  ["noa-slip-dress", "שמלת סאטן נועה", "Noa Slip Dress", "maison-noir", "dresses", "dress", 519, 649, "burgundy", "apparel", ""],
  ["rina-linen-dress", "שמלת פשתן רינה", "Rina Linen Dress", "terra", "dresses", "dress", 389, 0, "sand", "apparel", "bestseller"],
  ["ella-shirt-dress", "שמלת חולצה אלה", "Ella Shirt Dress", "alma", "dresses", "shirt", 349, 449, "sky", "apparel", ""],
  ["yara-poplin-top", "טופ פופלין יערה", "Yara Poplin Top", "alma", "tops", "shirt", 219, 0, "white", "apparel", "new"],
  ["talia-silk-blouse", "בלוזת משי טליה", "Talia Silk Blouse", "maison-noir", "tops", "shirt", 379, 0, "blush", "apparel", ""],
  ["maya-boxy-tee", "טי בוקסי מאיה", "Maya Boxy Tee", "olive-co", "tops", "tshirt", 129, 169, "black", "apparel", "bestseller"],
  ["maya-boxy-tee-white", "טי בוקסי מאיה", "Maya Boxy Tee", "olive-co", "tops", "tshirt", 129, 169, "white", "apparel", ""],
  ["shira-wool-knit", "סריג צמר שירה", "Shira Wool Knit", "nord", "knitwear-women", "knit", 459, 0, "ecru", "apparel", "new"],
  ["dana-cardigan", "קרדיגן דנה", "Dana Cardigan", "terra", "knitwear-women", "knit", 399, 499, "camel", "apparel", ""],
  ["orly-mohair-sweater", "סוודר מוהר אורלי", "Orly Mohair Sweater", "lune", "knitwear-women", "knit", 429, 0, "lilac", "apparel", ""],
  ["gaia-wide-trouser", "מכנסי גאיה רחבים", "Gaia Wide Trouser", "atelier-nine", "pants-women", "pants", 449, 0, "charcoal", "numeric", "bestseller"],
  ["gaia-wide-trouser-cream", "מכנסי גאיה רחבים", "Gaia Wide Trouser", "atelier-nine", "pants-women", "pants", 449, 0, "cream", "numeric", ""],
  ["nili-straight-jeans", "ג׳ינס ישר נילי", "Nili Straight Jeans", "alma", "pants-women", "pants", 329, 429, "denim", "numeric", ""],
  ["hila-satin-skirt", "חצאית סאטן הילה", "Hila Satin Skirt", "maison-noir", "skirts", "skirt", 359, 0, "forest", "numeric", "new"],
  ["adi-pleated-skirt", "חצאית פליסה עדי", "Adi Pleated Skirt", "lune", "skirts", "skirt", 299, 379, "black", "numeric", ""],
  ["sivan-trench", "טרנץ׳ סיוון", "Sivan Trench Coat", "nord", "outerwear-women", "coat", 899, 0, "sand", "apparel", "new,bestseller"],
  ["romi-wool-coat", "מעיל צמר רומי", "Romi Wool Coat", "atelier-nine", "outerwear-women", "coat", 1190, 1490, "grey", "apparel", ""],
  ["noya-crop-jacket", "ג׳קט קרופ נויה", "Noya Crop Jacket", "terra", "outerwear-women", "jacket", 549, 0, "terracotta", "apparel", ""],

  // --- MEN ---------------------------------------------------------------
  ["core-heavy-tee", "טי כבד CORE", "Core Heavy Tee", "olive-co", "tshirts", "tshirt", 149, 0, "white", "apparelMen", "bestseller"],
  ["core-heavy-tee-black", "טי כבד CORE", "Core Heavy Tee", "olive-co", "tshirts", "tshirt", 149, 0, "black", "apparelMen", ""],
  ["core-heavy-tee-olive", "טי כבד CORE", "Core Heavy Tee", "olive-co", "tshirts", "tshirt", 149, 0, "olive", "apparelMen", ""],
  ["ravid-pocket-tee", "טי כיס רביד", "Ravid Pocket Tee", "alma", "tshirts", "tshirt", 179, 229, "ecru", "apparelMen", ""],
  ["idan-oxford-shirt", "חולצת אוקספורד עידן", "Idan Oxford Shirt", "atelier-nine", "shirts", "shirt", 389, 0, "sky", "apparelMen", "new"],
  ["idan-oxford-shirt-white", "חולצת אוקספורד עידן", "Idan Oxford Shirt", "atelier-nine", "shirts", "shirt", 389, 0, "white", "apparelMen", ""],
  ["tom-linen-shirt", "חולצת פשתן תום", "Tom Linen Shirt", "terra", "shirts", "shirt", 349, 429, "navy", "apparelMen", "bestseller"],
  ["amit-merino-knit", "סריג מרינו עמית", "Amit Merino Knit", "nord", "knitwear-men", "knit", 499, 0, "charcoal", "apparelMen", "new"],
  ["gil-cable-knit", "סריג קלוע גיל", "Gil Cable Knit", "nord", "knitwear-men", "knit", 529, 649, "cream", "apparelMen", ""],
  ["eyal-chino", "צ׳ינו אייל", "Eyal Chino", "atelier-nine", "pants-men", "pants", 399, 0, "sand", "numericMen", "bestseller"],
  ["eyal-chino-navy", "צ׳ינו אייל", "Eyal Chino", "atelier-nine", "pants-men", "pants", 399, 0, "navy", "numericMen", ""],
  ["dor-relaxed-jeans", "ג׳ינס רלאקסד דור", "Dor Relaxed Jeans", "alma", "pants-men", "pants", 359, 459, "denim", "numericMen", ""],
  ["yoav-sweat-shorts", "מכנס פוטר יואב", "Yoav Sweat Shorts", "olive-co", "shorts", "shorts", 189, 0, "grey", "apparelMen", "new"],
  ["yoav-sweat-shorts-black", "מכנס פוטר יואב", "Yoav Sweat Shorts", "olive-co", "shorts", "shorts", 189, 0, "black", "apparelMen", ""],
  ["ziv-swim-shorts", "מכנס ים זיו", "Ziv Swim Shorts", "velo", "shorts", "shorts", 229, 299, "forest", "apparelMen", ""],
  ["ari-bomber", "בומבר ארי", "Ari Bomber Jacket", "velo", "outerwear-men", "jacket", 649, 0, "black", "apparelMen", "bestseller"],
  ["nadav-overshirt", "אוברשירט נדב", "Nadav Overshirt", "terra", "outerwear-men", "jacket", 479, 599, "olive", "apparelMen", ""],
  ["boaz-wool-coat", "מעיל צמר בועז", "Boaz Wool Coat", "atelier-nine", "outerwear-men", "coat", 1290, 0, "camel", "apparelMen", "new"],

  // --- SHOES -------------------------------------------------------------
  ["runner-91", "סניקרס RUNNER 91", "Runner 91 Sneaker", "velo", "sneakers", "sneaker", 549, 0, "white", "shoesM", "new,bestseller"],
  ["runner-91-grey", "סניקרס RUNNER 91", "Runner 91 Sneaker", "velo", "sneakers", "sneaker", 549, 0, "grey", "shoesW", ""],
  ["court-low", "סניקרס COURT LOW", "Court Low Sneaker", "velo", "sneakers", "sneaker", 469, 599, "cream", "shoesW", ""],
  ["sable-chelsea", "מגף צ׳לסי SABLE", "Sable Chelsea Boot", "sable", "boots", "boot", 899, 0, "brown", "shoesM", "new"],
  ["sable-rider-boot", "מגף רוכב SABLE", "Sable Rider Boot", "sable", "boots", "boot", 999, 1290, "black", "shoesW", ""],
  ["luna-heel", "עקב לונה", "Luna Heel", "sable", "heels", "heel", 649, 0, "black", "shoesW", ""],
  ["luna-heel-nude", "עקב לונה", "Luna Heel", "sable", "heels", "heel", 649, 799, "sand", "shoesW", ""],

  // --- ACCESSORIES -------------------------------------------------------
  ["riva-tote", "תיק טוט RIVA", "Riva Leather Tote", "riva", "bags", "bag", 799, 0, "camel", "one", "bestseller"],
  ["riva-tote-black", "תיק טוט RIVA", "Riva Leather Tote", "riva", "bags", "bag", 799, 0, "black", "one", ""],
  ["riva-mini-bag", "תיק מיני RIVA", "Riva Mini Bag", "riva", "bags", "bag", 549, 699, "burgundy", "one", "new"],
  ["nino-cap", "כובע מצחייה NINO", "NINO Cap", "olive-co", "hats", "cap", 119, 0, "black", "one", ""],
  ["nino-cap-sand", "כובע מצחייה NINO", "NINO Cap", "olive-co", "hats", "cap", 119, 0, "sand", "one", "new"],
  ["horizon-sunglasses", "משקפי HORIZON", "Horizon Sunglasses", "maison-noir", "sunglasses", "sunglasses", 289, 379, "charcoal", "one", "bestseller"],
  ["riva-belt", "חגורת עור RIVA", "Riva Leather Belt", "riva", "belts", "belt", 249, 0, "brown", "one", ""],
  ["nord-scarf", "צעיף צמר NORD", "Nord Wool Scarf", "nord", "scarves", "scarf", 199, 259, "mustard", "one", ""],
];

/* -------------------------------------------------------------------------- */

const groupOf = (categorySlug: string) =>
  categories.find((c) => c.slug === categorySlug)?.group ?? "new";
const genderOf = (categorySlug: string) =>
  categories.find((c) => c.slug === categorySlug)?.gender ?? "unisex";

const detailCopy: Record<string, { he: string[]; en: string[] }> = {
  default: {
    he: [
      "גזרה רגילה, נופלת יפה על הגוף",
      "בד נעים במיוחד למגע",
      "כביסה עדינה עד 30°",
      "הדוגמנית לובשת מידה S וגובהה 172 ס״מ",
    ],
    en: [
      "Regular fit that falls softly on the body",
      "Exceptionally soft handfeel",
      "Gentle wash up to 30°",
      "Model is 172cm and wears a size S",
    ],
  },
  sneaker: {
    he: [
      "עליונית עור וטקסטיל",
      "סוליית גומי עם ריפוד EVA",
      "מדרס נשלף",
      "מומלץ להזמין את המידה הרגילה שלכם",
    ],
    en: [
      "Leather and textile upper",
      "Rubber outsole with EVA cushioning",
      "Removable insole",
      "We recommend taking your usual size",
    ],
  },
  bag: {
    he: [
      "עור איטלקי בעיבוד מלא",
      "בטנה מבד עם כיס פנימי",
      "רצועה מתכווננת",
      "מגיע בשקית אחסון",
    ],
    en: [
      "Full-grain Italian leather",
      "Fabric lining with inner pocket",
      "Adjustable strap",
      "Comes with a dust bag",
    ],
  },
};

const descriptionCopy = (silhouette: string, brand: string) => ({
  he: `פריט מקולקציית ${brand} שנבחר במיוחד עבור הבוטיק. שילוב של גזרה מוקפדת, בד איכותי וגימור נקי — קל ללבישה ביום-יום ומתאים גם לערב.`,
  en: `A piece from the ${brand} collection, hand-picked for the boutique. A considered cut, quality fabric and a clean finish — easy to wear by day and dressed up at night.`,
});

function buildSizes(setKey: SizeSetKey, seed: number): ProductSize[] {
  const labels = sizeSets[setKey];
  return labels.map((label, i) => {
    const pseudo = (seed * 31 + i * 17) % 11;
    return { label, stock: pseudo === 0 ? 0 : pseudo <= 2 ? 2 : pseudo + 2 };
  });
}

function hashSeed(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) h = (h * 33 + slug.charCodeAt(i)) % 9973;
  return h;
}

export const silhouetteOf: Record<string, string> = {};

export const products: Product[] = rows.map((row, index) => {
  const [
    slug,
    titleHe,
    titleEn,
    brandSlug,
    category,
    silhouette,
    price,
    compareAt,
    colorKey,
    sizeSet,
    badgeStr,
  ] = row;

  silhouetteOf[slug] = silhouette;
  const seed = hashSeed(slug);
  const brand = brands.find((b) => b.slug === brandSlug)!;
  const color = colors[colorKey];
  const badges = badgeStr
    ? (badgeStr.split(",") as Product["badges"])
    : ([] as Product["badges"]);
  const sizes = buildSizes(sizeSet, seed);
  if (sizes.some((s) => s.stock > 0 && s.stock <= 2)) badges.push("last-units");

  // Newest items first in the array order, spaced a couple of days apart.
  const created = new Date(2026, 6, 28);
  created.setDate(created.getDate() - index * 2);

  return {
    id: `p_${String(index + 1).padStart(3, "0")}`,
    slug,
    sku: `NN-${String(index + 1).padStart(4, "0")}`,
    title: { he: titleHe, en: titleEn },
    description: descriptionCopy(silhouette, brand.name),
    details: detailCopy[silhouette] ?? detailCopy.default,
    brand: brandSlug,
    category,
    group: groupOf(category),
    gender: genderOf(category),
    price,
    compareAtPrice: compareAt > 0 ? compareAt : undefined,
    color: { name: { he: color.he, en: color.en }, hex: color.hex },
    sizes,
    images: [`/products/${slug}-1.svg`, `/products/${slug}-2.svg`],
    badges,
    createdAt: created.toISOString(),
    popularity: 40 + ((seed * 7) % 60),
  };
});

// Link colourways of the same style together (matching title in English).
const byTitle = new Map<string, string[]>();
for (const p of products) {
  const key = p.title.en;
  byTitle.set(key, [...(byTitle.get(key) ?? []), p.slug]);
}
for (const p of products) {
  const siblings = byTitle.get(p.title.en) ?? [];
  if (siblings.length > 1) p.relatedColors = siblings;
}

export const priceBounds = {
  min: Math.min(...products.map((p) => p.price)),
  max: Math.max(...products.map((p) => p.price)),
};
