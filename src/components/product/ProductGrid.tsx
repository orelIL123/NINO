import ProductCard from "./ProductCard";
import type { Product } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";

export default function ProductGrid({
  products,
  locale,
  columns = 4,
  priorityCount = 0,
}: {
  products: Product[];
  locale: Locale;
  columns?: 3 | 4 | 5;
  priorityCount?: number;
}) {
  const cols = {
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
  }[columns];

  return (
    <div className={`grid gap-x-3 gap-y-9 md:gap-x-5 md:gap-y-12 ${cols}`}>
      {products.map((product, i) => (
        <ProductCard
          key={product.slug}
          product={product}
          locale={locale}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}
