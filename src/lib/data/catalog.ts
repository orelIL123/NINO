import type { Brand, Category, Product, ProductSize } from "./types";

/* -------------------------------------------------------------------------- */
/*  DEMO CATALOG — men's fashion & footwear                                    */
/*                                                                            */
/*  Everything below is placeholder data so the storefront is fully browsable  */
/*  before the real inventory exists. When Firestore is ready, the functions   */
/*  in src/lib/api/products.ts are the only place that has to change — the UI  */
/*  never imports this file directly.                                         */
/* -------------------------------------------------------------------------- */

export const brands: Brand[] = [
  { slug: "alma", name: "ALMA", country: { he: "תל אביב", en: "Tel Aviv" }, description: { he: "בייסיקים מוקפדים בגזרות רגועות ובדים טבעיים.", en: "Considered basics in relaxed cuts and natural fabrics." } },
  { slug: "maison-noir", name: "MAISON NOIR", country: { he: "פריז", en: "Paris" }, description: { he: "מינימליזם פריזאי בקו מונוכרומטי.", en: "Parisian minimalism in a monochrome line." } },
  { slug: "terra", name: "TERRA", country: { he: "ברצלונה", en: "Barcelona" }, description: { he: "גוונים חמים, כותנה אורגנית ופשתן.", en: "Warm tones, organic cotton and linen." } },
  { slug: "lune", name: "LUNE", country: { he: "קופנהגן", en: "Copenhagen" }, description: { he: "אופנה סקנדינבית שקטה ליום-יום.", en: "Quiet Scandinavian everyday fashion." } },
  { slug: "atelier-nine", name: "ATELIER NINE", country: { he: "מילאנו", en: "Milan" }, description: { he: "טיילורינג איטלקי בגימור נקי.", en: "Italian tailoring with a clean finish." } },
  { slug: "nord", name: "NORD", country: { he: "סטוקהולם", en: "Stockholm" }, description: { he: "מעילים וסריגים לעונה הקרה.", en: "Outerwear and knits for the cold season." } },
  { slug: "sable", name: "SABLE", country: { he: "ליסבון", en: "Lisbon" }, description: { he: "נעליים בעבודת יד מעור מלא.", en: "Hand-finished full-grain leather footwear." } },
  { slug: "riva", name: "RIVA", country: { he: "פירנצה", en: "Florence" }, description: { he: "תיקים ואקססוריז מעור איטלקי.", en: "Italian leather bags and accessories." } },
  { slug: "velo", name: "VELO", country: { he: "אמסטרדם", en: "Amsterdam" }, description: { he: "סניקרס ובגדי ספורט-לוקס.", en: "Sneakers and sport-luxe essentials." } },
  { slug: "olive-co", name: "OLIVE & CO", country: { he: "נתיבות", en: "Netivot" }, description: { he: "המותג הפרטי של הבוטיק.", en: "The boutique's own label." } },
];

export const categories: Category[] = [
  { slug: "new-in", title: { he: "חדש באתר", en: "New in" }, group: "new", gender: "men", image: "/media/editorial-1.svg" },

  { slug: "tshirts", title: { he: "טי-שירט", en: "T-shirts" }, group: "clothing", gender: "men", featured: true },
  { slug: "shirts", title: { he: "חולצות מכופתרות", en: "Shirts" }, group: "clothing", gender: "men" },
  { slug: "knitwear", title: { he: "סריגים", en: "Knitwear" }, group: "clothing", gender: "men" },
  { slug: "hoodies", title: { he: "קפוצ׳ונים וסווטשירטים", en: "Hoodies & sweats" }, group: "clothing", gender: "men" },
  { slug: "pants", title: { he: "מכנסיים", en: "Trousers" }, group: "clothing", gender: "men", featured: true },
  { slug: "jeans", title: { he: "ג׳ינס", en: "Jeans" }, group: "clothing", gender: "men" },
  { slug: "shorts", title: { he: "מכנסיים קצרים", en: "Shorts" }, group: "clothing", gender: "men" },
  { slug: "outerwear", title: { he: "ג׳קטים ומעילים", en: "Jackets & coats" }, group: "clothing", gender: "men" },

  { slug: "sneakers", title: { he: "סניקרס", en: "Sneakers" }, group: "shoes", gender: "men", image: "/media/editorial-2.svg", featured: true },
  { slug: "boots", title: { he: "מגפיים ובוטים", en: "Boots" }, group: "shoes", gender: "men" },
  { slug: "sandals", title: { he: "סנדלים וכפכפים", en: "Sandals & slides" }, group: "shoes", gender: "men" },

  { slug: "bags", title: { he: "תיקים", en: "Bags" }, group: "accessories", gender: "men", featured: true },
  { slug: "hats", title: { he: "כובעים", en: "Hats" }, group: "accessories", gender: "men" },
  { slug: "belts", title: { he: "חגורות", en: "Belts" }, group: "accessories", gender: "men" },
  { slug: "sunglasses", title: { he: "משקפי שמש", en: "Sunglasses" }, group: "accessories", gender: "men" },
  { slug: "scarves", title: { he: "צעיפים", en: "Scarves" }, group: "accessories", gender: "men" },
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
  grey: { hex: "#8f8f8f", he: "אפור", en: "Grey" },
  charcoal: { hex: "#3a3a3a", he: "אפור פחם", en: "Charcoal" },
  mustard: { hex: "#c8a02c", he: "חרדל", en: "Mustard" },
  terracotta: { hex: "#b56a4a", he: "טרקוטה", en: "Terracotta" },
  stone: { hex: "#b7b2a8", he: "אבן", en: "Stone" },
} as const;

export type ColorKey = keyof typeof colors;
export const colorList = Object.entries(colors).map(([key, v]) => ({
  key: key as ColorKey,
  hex: v.hex,
  name: { he: v.he, en: v.en },
}));

const sizeSets = {
  apparel: ["S", "M", "L", "XL", "XXL"],
  waist: ["29", "30", "31", "32", "34", "36"],
  shoes: ["40", "41", "42", "43", "44", "45"],
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
  // --- T-SHIRTS ----------------------------------------------------------
  ["core-heavy-tee-white", "טי כבד CORE", "Core Heavy Tee", "olive-co", "tshirts", "tshirt", 149, 0, "white", "apparel", "new,bestseller"],
  ["core-heavy-tee-black", "טי כבד CORE", "Core Heavy Tee", "olive-co", "tshirts", "tshirt", 149, 0, "black", "apparel", "new"],
  ["core-heavy-tee-olive", "טי כבד CORE", "Core Heavy Tee", "olive-co", "tshirts", "tshirt", 149, 0, "olive", "apparel", ""],
  ["core-heavy-tee-sand", "טי כבד CORE", "Core Heavy Tee", "olive-co", "tshirts", "tshirt", 149, 0, "sand", "apparel", ""],
  ["ravid-pocket-tee", "טי כיס רביד", "Ravid Pocket Tee", "alma", "tshirts", "tshirt", 179, 229, "ecru", "apparel", ""],
  ["shai-boxy-tee", "טי בוקסי שי", "Shai Boxy Tee", "alma", "tshirts", "tshirt", 169, 0, "charcoal", "apparel", "bestseller"],
  ["lior-stripe-tee", "טי פסים ליאור", "Lior Striped Tee", "terra", "tshirts", "tshirt", 199, 259, "navy", "apparel", ""],
  ["nino-logo-tee", "טי לוגו NINO", "NINO Logo Tee", "olive-co", "tshirts", "tshirt", 139, 0, "white", "apparel", "new"],

  // --- SHIRTS ------------------------------------------------------------
  ["idan-oxford-shirt-sky", "חולצת אוקספורד עידן", "Idan Oxford Shirt", "atelier-nine", "shirts", "shirt", 389, 0, "sky", "apparel", "new"],
  ["idan-oxford-shirt-white", "חולצת אוקספורד עידן", "Idan Oxford Shirt", "atelier-nine", "shirts", "shirt", 389, 0, "white", "apparel", ""],
  ["tom-linen-shirt", "חולצת פשתן תום", "Tom Linen Shirt", "terra", "shirts", "shirt", 349, 429, "navy", "apparel", "bestseller"],
  ["tom-linen-shirt-white", "חולצת פשתן תום", "Tom Linen Shirt", "terra", "shirts", "shirt", 349, 429, "white", "apparel", ""],
  ["omer-camp-collar", "חולצת קמפ עומר", "Omer Camp Collar Shirt", "lune", "shirts", "shirt", 329, 0, "sage", "apparel", ""],
  ["assaf-flannel", "חולצת פלאנל אסף", "Assaf Flannel Shirt", "nord", "shirts", "shirt", 379, 469, "burgundy", "apparel", ""],
  ["matan-denim-shirt", "חולצת דנים מתן", "Matan Denim Shirt", "alma", "shirts", "shirt", 359, 0, "denim", "apparel", ""],

  // --- KNITWEAR ----------------------------------------------------------
  ["amit-merino-knit", "סריג מרינו עמית", "Amit Merino Knit", "nord", "knitwear", "knit", 499, 0, "charcoal", "apparel", "new,bestseller"],
  ["amit-merino-knit-navy", "סריג מרינו עמית", "Amit Merino Knit", "nord", "knitwear", "knit", 499, 0, "navy", "apparel", ""],
  ["gil-cable-knit", "סריג קלוע גיל", "Gil Cable Knit", "nord", "knitwear", "knit", 529, 649, "cream", "apparel", ""],
  ["roi-half-zip", "סריג חצי רוכסן רועי", "Roi Half-Zip Knit", "lune", "knitwear", "knit", 459, 0, "stone", "apparel", "new"],
  ["nir-wool-crew", "סריג צמר ניר", "Nir Wool Crew", "terra", "knitwear", "knit", 439, 539, "camel", "apparel", ""],
  ["eran-polo-knit", "פולו סרוג ערן", "Eran Knitted Polo", "atelier-nine", "knitwear", "knit", 419, 0, "forest", "apparel", ""],

  // --- HOODIES & SWEATS --------------------------------------------------
  ["core-hoodie-grey", "קפוצ׳ון CORE", "Core Hoodie", "olive-co", "hoodies", "knit", 289, 0, "grey", "apparel", "bestseller"],
  ["core-hoodie-black", "קפוצ׳ון CORE", "Core Hoodie", "olive-co", "hoodies", "knit", 289, 0, "black", "apparel", ""],
  ["yotam-crew-sweat", "סווטשירט יותם", "Yotam Crew Sweat", "velo", "hoodies", "knit", 259, 329, "ecru", "apparel", ""],
  ["barak-zip-hoodie", "קפוצ׳ון רוכסן ברק", "Barak Zip Hoodie", "velo", "hoodies", "knit", 319, 0, "forest", "apparel", "new"],
  ["nino-club-sweat", "סווטשירט NINO CLUB", "NINO Club Sweat", "olive-co", "hoodies", "knit", 279, 349, "burgundy", "apparel", ""],

  // --- TROUSERS ----------------------------------------------------------
  ["eyal-chino-sand", "צ׳ינו אייל", "Eyal Chino", "atelier-nine", "pants", "pants", 399, 0, "sand", "waist", "bestseller"],
  ["eyal-chino-navy", "צ׳ינו אייל", "Eyal Chino", "atelier-nine", "pants", "pants", 399, 0, "navy", "waist", ""],
  ["eyal-chino-olive", "צ׳ינו אייל", "Eyal Chino", "atelier-nine", "pants", "pants", 399, 0, "olive", "waist", ""],
  ["shaked-wide-trouser", "מכנס רחב שקד", "Shaked Wide Trouser", "lune", "pants", "pants", 449, 549, "charcoal", "waist", "new"],
  ["itai-cargo", "מכנס דגמ״ח איתי", "Itai Cargo Trouser", "velo", "pants", "pants", 369, 0, "stone", "waist", ""],
  ["gaia-pleated-trouser", "מכנס קפלים גיא", "Guy Pleated Trouser", "atelier-nine", "pants", "pants", 479, 0, "black", "waist", ""],

  // --- JEANS -------------------------------------------------------------
  ["dor-relaxed-jeans", "ג׳ינס רלאקסד דור", "Dor Relaxed Jeans", "alma", "jeans", "pants", 359, 459, "denim", "waist", "bestseller"],
  ["dor-relaxed-jeans-black", "ג׳ינס רלאקסד דור", "Dor Relaxed Jeans", "alma", "jeans", "pants", 359, 459, "black", "waist", ""],
  ["niv-straight-jeans", "ג׳ינס ישר ניב", "Niv Straight Jeans", "alma", "jeans", "pants", 389, 0, "navy", "waist", "new"],
  ["oren-selvedge-jeans", "ג׳ינס סלוודג׳ אורן", "Oren Selvedge Jeans", "maison-noir", "jeans", "pants", 599, 0, "denim", "waist", ""],

  // --- SHORTS ------------------------------------------------------------
  ["yoav-sweat-shorts-grey", "מכנס פוטר יואב", "Yoav Sweat Shorts", "olive-co", "shorts", "shorts", 189, 0, "grey", "apparel", "new"],
  ["yoav-sweat-shorts-black", "מכנס פוטר יואב", "Yoav Sweat Shorts", "olive-co", "shorts", "shorts", 189, 0, "black", "apparel", ""],
  ["ziv-swim-shorts", "מכנס ים זיו", "Ziv Swim Shorts", "velo", "shorts", "shorts", 229, 299, "forest", "apparel", ""],
  ["ziv-swim-shorts-navy", "מכנס ים זיו", "Ziv Swim Shorts", "velo", "shorts", "shorts", 229, 299, "navy", "apparel", ""],
  ["adam-linen-shorts", "מכנס פשתן אדם", "Adam Linen Shorts", "terra", "shorts", "shorts", 249, 0, "ecru", "apparel", "bestseller"],

  // --- OUTERWEAR ---------------------------------------------------------
  ["ari-bomber", "בומבר ארי", "Ari Bomber Jacket", "velo", "outerwear", "jacket", 649, 0, "black", "apparel", "bestseller"],
  ["nadav-overshirt", "אוברשירט נדב", "Nadav Overshirt", "terra", "outerwear", "jacket", 479, 599, "olive", "apparel", ""],
  ["nadav-overshirt-brown", "אוברשירט נדב", "Nadav Overshirt", "terra", "outerwear", "jacket", 479, 599, "brown", "apparel", ""],
  ["boaz-wool-coat", "מעיל צמר בועז", "Boaz Wool Coat", "atelier-nine", "outerwear", "coat", 1290, 0, "camel", "apparel", "new"],
  ["yaron-trench", "טרנץ׳ ירון", "Yaron Trench Coat", "nord", "outerwear", "coat", 899, 1190, "stone", "apparel", ""],
  ["guy-denim-jacket", "ג׳קט דנים גיא", "Guy Denim Jacket", "alma", "outerwear", "jacket", 429, 0, "denim", "apparel", ""],
  ["maison-puffer", "מעיל פאפר MAISON", "Maison Puffer", "maison-noir", "outerwear", "coat", 1090, 1390, "black", "apparel", "new"],

  // --- SNEAKERS ----------------------------------------------------------
  ["runner-91-white", "סניקרס RUNNER 91", "Runner 91 Sneaker", "velo", "sneakers", "sneaker", 549, 0, "white", "shoes", "new,bestseller"],
  ["runner-91-grey", "סניקרס RUNNER 91", "Runner 91 Sneaker", "velo", "sneakers", "sneaker", 549, 0, "grey", "shoes", ""],
  ["runner-91-black", "סניקרס RUNNER 91", "Runner 91 Sneaker", "velo", "sneakers", "sneaker", 549, 0, "black", "shoes", ""],
  ["court-low-cream", "סניקרס COURT LOW", "Court Low Sneaker", "velo", "sneakers", "sneaker", 469, 599, "cream", "shoes", ""],
  ["sable-leather-sneaker", "סניקרס עור SABLE", "Sable Leather Sneaker", "sable", "sneakers", "sneaker", 699, 0, "white", "shoes", "bestseller"],
  ["trail-42", "סניקרס TRAIL 42", "Trail 42 Sneaker", "velo", "sneakers", "sneaker", 599, 749, "olive", "shoes", "new"],

  // --- BOOTS -------------------------------------------------------------
  ["sable-chelsea", "מגף צ׳לסי SABLE", "Sable Chelsea Boot", "sable", "boots", "boot", 899, 0, "brown", "shoes", "new"],
  ["sable-chelsea-black", "מגף צ׳לסי SABLE", "Sable Chelsea Boot", "sable", "boots", "boot", 899, 0, "black", "shoes", ""],
  ["sable-desert-boot", "בוט מדברי SABLE", "Sable Desert Boot", "sable", "boots", "boot", 749, 949, "sand", "shoes", "bestseller"],
  ["nord-hiker", "בוט NORD HIKER", "Nord Hiker Boot", "nord", "boots", "boot", 999, 0, "charcoal", "shoes", ""],

  // --- SANDALS -----------------------------------------------------------
  ["nino-slide", "כפכף NINO", "NINO Slide", "olive-co", "sandals", "sandal", 149, 0, "black", "shoes", "bestseller"],
  ["nino-slide-sand", "כפכף NINO", "NINO Slide", "olive-co", "sandals", "sandal", 149, 0, "sand", "shoes", ""],
  ["sable-leather-sandal", "סנדל עור SABLE", "Sable Leather Sandal", "sable", "sandals", "sandal", 399, 499, "brown", "shoes", ""],

  // --- ACCESSORIES -------------------------------------------------------
  ["riva-weekender", "תיק ויקאנדר RIVA", "Riva Weekender Bag", "riva", "bags", "bag", 899, 0, "brown", "one", "bestseller"],
  ["riva-crossbody", "תיק צד RIVA", "Riva Crossbody Bag", "riva", "bags", "bag", 549, 699, "black", "one", "new"],
  ["nino-tote", "תיק בד NINO", "NINO Canvas Tote", "olive-co", "bags", "bag", 129, 0, "ecru", "one", ""],
  ["nino-cap-black", "כובע מצחייה NINO", "NINO Cap", "olive-co", "hats", "cap", 119, 0, "black", "one", ""],
  ["nino-cap-sand", "כובע מצחייה NINO", "NINO Cap", "olive-co", "hats", "cap", 119, 0, "sand", "one", "new"],
  ["nord-beanie", "כובע גרב NORD", "Nord Beanie", "nord", "hats", "cap", 149, 189, "charcoal", "one", ""],
  ["riva-belt-brown", "חגורת עור RIVA", "Riva Leather Belt", "riva", "belts", "belt", 249, 0, "brown", "one", ""],
  ["riva-belt-black", "חגורת עור RIVA", "Riva Leather Belt", "riva", "belts", "belt", 249, 0, "black", "one", ""],
  ["horizon-sunglasses", "משקפי HORIZON", "Horizon Sunglasses", "maison-noir", "sunglasses", "sunglasses", 289, 379, "charcoal", "one", "bestseller"],
  ["aviator-nine", "משקפי AVIATOR NINE", "Aviator Nine Sunglasses", "atelier-nine", "sunglasses", "sunglasses", 349, 0, "black", "one", "new"],
  ["nord-scarf", "צעיף צמר NORD", "Nord Wool Scarf", "nord", "scarves", "scarf", 199, 259, "mustard", "one", ""],
  ["nord-scarf-grey", "צעיף צמר NORD", "Nord Wool Scarf", "nord", "scarves", "scarf", 199, 259, "grey", "one", ""],
];

/* -------------------------------------------------------------------------- */

const groupOf = (categorySlug: string) =>
  categories.find((c) => c.slug === categorySlug)?.group ?? "new";
const genderOf = (categorySlug: string) =>
  categories.find((c) => c.slug === categorySlug)?.gender ?? "men";

const detailCopy: Record<string, { he: string[]; en: string[] }> = {
  default: {
    he: [
      "גזרה רגילה, נופלת יפה על הגוף",
      "בד נעים במיוחד למגע",
      "כביסה עדינה עד 30°",
      "הדוגמן לובש מידה L וגובהו 183 ס״מ",
    ],
    en: [
      "Regular fit that falls cleanly on the body",
      "Exceptionally soft handfeel",
      "Gentle wash up to 30°",
      "Model is 183cm and wears a size L",
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
  boot: {
    he: [
      "עור מלא בעיבוד איטלקי",
      "סוליית גומי עם אחיזה טובה",
      "בטנת עור נושמת",
      "מומלץ לרפד בקרם עור פעם בעונה",
    ],
    en: [
      "Full-grain, Italian-tanned leather",
      "Grippy rubber outsole",
      "Breathable leather lining",
      "Condition with leather cream once a season",
    ],
  },
  sandal: {
    he: [
      "עליונית רכה שלא משפשפת",
      "מדרס אנטומי",
      "עמיד במים",
      "קל לניקוי במים פושרים",
    ],
    en: [
      "Soft upper that won't rub",
      "Contoured footbed",
      "Water resistant",
      "Wipes clean with lukewarm water",
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

const descriptionCopy = (brand: string) => ({
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

  // Spread arrival dates so "new in" mixes categories instead of showing the
  // first block of the list. Items badged "new" land inside the last 3 weeks.
  const created = new Date(2026, 6, 28);
  const daysAgo = badges.includes("new")
    ? (seed + index) % 21
    : 24 + ((seed * 3 + index) % 150);
  created.setDate(created.getDate() - daysAgo);

  return {
    id: `p_${String(index + 1).padStart(3, "0")}`,
    slug,
    sku: `NN-${String(index + 1).padStart(4, "0")}`,
    title: { he: titleHe, en: titleEn },
    description: descriptionCopy(brand.name),
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
