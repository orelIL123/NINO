import "server-only";

import { products } from "@/lib/data/catalog";
import type { CartLine } from "@/lib/data/types";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/shipping";

export interface OrderDraft {
  lines: CartLine[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  delivery: {
    method: "courier" | "pickup";
    city?: string;
    street?: string;
    zip?: string;
    notes?: string;
  };
  locale: string;
}

export interface OrderResult {
  ok: boolean;
  number?: string;
  subtotal?: number;
  shipping?: number;
  total?: number;
  error?: string;
}

/**
 * Creates an order.
 *
 * Right now this only re-prices the basket from the server-side catalog and
 * returns a mock order number — nothing is persisted and no card is charged.
 *
 * To go live:
 *   1. Write the order to Firestore `orders` with status "pending".
 *   2. Create a payment intent / redirect URL with the provider
 *      (Tranzila, CardCom, Meshulam, PayPlus, Stripe…) and return it here.
 *   3. Mark the order "paid" from the provider's server-to-server webhook,
 *      never from the browser.
 */
export async function createOrder(draft: OrderDraft): Promise<OrderResult> {
  if (!draft.lines.length) return { ok: false, error: "empty_cart" };
  if (!draft.customer.email.includes("@"))
    return { ok: false, error: "invalid_email" };
  if (draft.customer.phone.replace(/\D/g, "").length < 9)
    return { ok: false, error: "invalid_phone" };

  // Never trust prices coming from the client — re-price from the catalog.
  let subtotal = 0;
  for (const line of draft.lines) {
    const product = products.find((p) => p.slug === line.slug);
    if (!product) return { ok: false, error: `unknown_product:${line.slug}` };
    const size = product.sizes.find((s) => s.label === line.size);
    if (!size || size.stock < line.quantity)
      return { ok: false, error: `out_of_stock:${line.slug}` };
    subtotal += product.price * line.quantity;
  }

  const shipping =
    draft.delivery.method === "pickup" || subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_COST;

  const number = `NN${Date.now().toString().slice(-8)}`;

  // TODO: persist to Firestore and open a payment session here.

  return { ok: true, number, subtotal, shipping, total: subtotal + shipping };
}
