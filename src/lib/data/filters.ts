/** Shared between the server (querying) and the client (filter UI). */
export interface Facets {
  brands: { slug: string; name: string }[];
  sizes: string[];
  colors: { key: string; hex: string; name: { he: string; en: string } }[];
  price: { min: number; max: number };
}

export const PRICE_BANDS = [
  { key: "0-200", min: 0, max: 200 },
  { key: "200-400", min: 200, max: 400 },
  { key: "400-700", min: 400, max: 700 },
  { key: "700-", min: 700, max: 99999 },
] as const;
