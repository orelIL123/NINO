export const PRODUCT_TYPES = [
  "T-shirts",
  "Shirts",
  "Knitwear",
  "Hoodies & sweats",
  "Trousers",
  "Jeans",
  "Shorts",
  "Jackets & coats",
  "Sneakers",
  "Boots",
  "Sandals & slides",
  "Bags",
  "Hats",
  "Belts",
  "Sunglasses",
  "Scarves",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];
export type ProductGroup = "clothing" | "shoes" | "accessories";
export type ProductGender = "men" | "women";

export const MERCHANDISING_CATEGORIES = [
  { slug: "tshirts", label: "טי-שירט", type: "T-shirts" },
  { slug: "shirts", label: "חולצות", type: "Shirts" },
  { slug: "tailored-trousers", label: "מכנס אלגנט", type: "Trousers" },
  { slug: "shorts", label: "מכנסיים קצרים", type: "Shorts" },
  { slug: "bermudas", label: "ברמודות", type: "Shorts" },
  { slug: "swimwear", label: "בגדי ים", type: "Shorts" },
  { slug: "jeans", label: "ג׳ינסים", type: "Jeans" },
  { slug: "hoodies", label: "קפוצ׳ונים", type: "Hoodies & sweats" },
  { slug: "outerwear", label: "ג׳קטים ומעילים", type: "Jackets & coats" },
  { slug: "suits", label: "חליפות", type: "Jackets & coats" },
  { slug: "sneakers", label: "סניקרס", type: "Sneakers" },
  { slug: "sunglasses", label: "משקפי שמש", type: "Sunglasses" },
  { slug: "short-sleeve-shirt-sets", label: "חליפות מכופתר קצרות", type: "Shirts" },
  { slug: "linen-trousers", label: "מכנסי פשתן", type: "Trousers" },
  { slug: "perfumes", label: "בשמים", type: "Bags" },
] as const;

export const PRODUCT_COLORS = [
  { value: "Black", label: "שחור", hex: "#1c1c1c" },
  { value: "White", label: "לבן", hex: "#f2f1ee" },
  { value: "Cream", label: "שמנת", hex: "#e8e0d3" },
  { value: "Ecru", label: "אקרו", hex: "#ded5c6" },
  { value: "Sand", label: "חול", hex: "#cbb89d" },
  { value: "Camel", label: "קאמל", hex: "#b08d57" },
  { value: "Brown", label: "חום", hex: "#6b4f3a" },
  { value: "Olive", label: "זית", hex: "#6f7355" },
  { value: "Sage", label: "מרווה", hex: "#a8b5a0" },
  { value: "Forest", label: "ירוק בקבוק", hex: "#2f4739" },
  { value: "Navy", label: "נייבי", hex: "#23304a" },
  { value: "Denim", label: "דנים", hex: "#4a6382" },
  { value: "Sky", label: "תכלת", hex: "#a9c3d9" },
  { value: "Red", label: "אדום", hex: "#9b2c2c" },
  { value: "Burgundy", label: "בורדו", hex: "#5e2130" },
  { value: "Grey", label: "אפור", hex: "#8f8f8f" },
  { value: "Charcoal", label: "אפור פחם", hex: "#3a3a3a" },
  { value: "Mustard", label: "חרדל", hex: "#c8a02c" },
  { value: "Terracotta", label: "טרקוטה", hex: "#b56a4a" },
  { value: "Stone", label: "אבן", hex: "#b7b2a8" },
] as const;

const SHOES = new Set<ProductType>(["Sneakers", "Boots", "Sandals & slides"]);
const ACCESSORIES = new Set<ProductType>([
  "Bags",
  "Hats",
  "Belts",
  "Sunglasses",
  "Scarves",
]);

export function groupForProductType(type: ProductType): ProductGroup {
  if (SHOES.has(type)) return "shoes";
  if (ACCESSORIES.has(type)) return "accessories";
  return "clothing";
}

export function isProductType(value: string): value is ProductType {
  return (PRODUCT_TYPES as readonly string[]).includes(value);
}

export const DEFAULT_SIZES: Record<ProductGroup, string> = {
  clothing: "S, M, L, XL",
  shoes: "40, 41, 42, 43, 44",
  accessories: "ONE SIZE",
};

export interface AdminProductDraft {
  title: string;
  titleHe?: string;
  description?: string;
  descriptionHe?: string;
  vendor: string;
  productType: ProductType;
  merchandisingCategory?: string;
  gender: ProductGender;
  extraTags: Array<"new" | "bestseller">;
  sizes: string[];
  color: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  skuPrefix?: string;
  publish: boolean;
  media: Array<{ resourceUrl: string; alt: string }>;
}
