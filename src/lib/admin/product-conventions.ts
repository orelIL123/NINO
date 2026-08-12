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
