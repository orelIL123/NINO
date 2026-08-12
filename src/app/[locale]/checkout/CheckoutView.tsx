"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useStore } from "@/lib/store/StoreProvider";
import { formatPrice } from "@/lib/utils/format";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/shipping";
import { CheckIcon, ShieldIcon } from "@/components/ui/Icons";

type Method = "courier" | "pickup";

export default function CheckoutView() {
  const { dict, locale, href } = useLocale();
  const { cart, subtotal, clearCart, ready } = useStore();

  const [method, setMethod] = useState<Method>("courier");
  const [pending, setPending] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shipping =
    method === "pickup" || subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_COST;
  const total = subtotal + shipping;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      lines: cart,
      customer: {
        firstName: String(form.get("firstName") ?? ""),
        lastName: String(form.get("lastName") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
      },
      delivery: {
        method,
        city: String(form.get("city") ?? ""),
        street: String(form.get("street") ?? ""),
        zip: String(form.get("zip") ?? ""),
        notes: String(form.get("notes") ?? ""),
      },
      locale,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "failed");
      setOrderNumber(data.number);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    } finally {
      setPending(false);
    }
  }

  if (orderNumber) {
    return (
      <div className="container-nino py-24 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-success text-success">
          <CheckIcon size={26} />
        </span>
        <h1 className="mt-6 font-display text-3xl font-light">
          {dict.checkout.success}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-ink-soft">
          {dict.checkout.successText}
        </p>
        <p className="mt-5 text-sm">
          {dict.checkout.orderNumber}:{" "}
          <span className="font-medium tracking-wider">{orderNumber}</span>
        </p>
        <Link href={href("/")} className="btn btn-primary mt-8">
          {dict.checkout.backHome}
        </Link>
      </div>
    );
  }

  if (ready && cart.length === 0) {
    return (
      <div className="container-nino py-24 text-center">
        <h1 className="font-display text-3xl font-light">{dict.cart.empty}</h1>
        <Link href={href("/category/new-in")} className="btn btn-primary mt-7">
          {dict.cart.continue}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-nino py-10 md:py-14">
      <h1 className="font-display text-3xl font-light md:text-4xl">
        {dict.checkout.title}
      </h1>

      <form
        onSubmit={submit}
        className="mt-9 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14"
      >
        <div className="space-y-10">
          {/* Contact ---------------------------------------------------- */}
          <fieldset>
            <legend className="eyebrow mb-4">{dict.checkout.contact}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field name="firstName" label={dict.checkout.firstName} required />
              <Field name="lastName" label={dict.checkout.lastName} required />
              <Field
                name="email"
                type="email"
                label={dict.checkout.email}
                required
              />
              <Field name="phone" type="tel" label={dict.checkout.phone} required />
            </div>
          </fieldset>

          {/* Delivery --------------------------------------------------- */}
          <fieldset>
            <legend className="eyebrow mb-4">{dict.checkout.deliveryMethod}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { key: "courier", label: dict.checkout.courier, price: SHIPPING_COST },
                  { key: "pickup", label: dict.checkout.pickup, price: 0 },
                ] as const
              ).map((option) => (
                <label
                  key={option.key}
                  className={`flex cursor-pointer items-center justify-between gap-3 border p-4 text-sm transition-colors ${
                    method === option.key
                      ? "border-ink"
                      : "border-line-strong hover:border-ink"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={option.key}
                      checked={method === option.key}
                      onChange={() => setMethod(option.key)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        method === option.key ? "border-ink" : "border-line-strong"
                      }`}
                    >
                      {method === option.key && (
                        <span className="h-2 w-2 rounded-full bg-ink" />
                      )}
                    </span>
                    {option.label}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {option.price === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
                      ? dict.cart.freeShipping
                      : formatPrice(option.price, locale)}
                  </span>
                </label>
              ))}
            </div>

            {method === "courier" && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field name="city" label={dict.checkout.city} required />
                <Field name="street" label={dict.checkout.street} required />
                <Field name="zip" label={dict.checkout.zip} />
              </div>
            )}

            <div className="mt-3">
              <Field name="notes" label={dict.checkout.notes} textarea />
            </div>
          </fieldset>

          {/* Payment ---------------------------------------------------- */}
          <fieldset>
            <legend className="eyebrow mb-4">{dict.checkout.payment}</legend>
            <div className="border border-dashed border-line-strong bg-surface p-6 text-center">
              <span className="eyebrow inline-block border border-ink px-2 py-1">
                {dict.checkout.demoNotice}
              </span>
              <p className="mx-auto mt-4 max-w-md text-sm text-ink-soft">
                {dict.checkout.paymentNote}
              </p>
              {/*
                Payment integration point.
                Mount the provider's hosted fields / iframe here (Tranzila,
                CardCom, Meshulam, PayPlus, Stripe…), or redirect to the payment
                URL returned by POST /api/orders.
              */}
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-muted">
                <ShieldIcon size={16} />
                SSL · PCI-DSS
              </div>
            </div>
          </fieldset>

          {error && (
            <p className="text-sm text-sale" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Summary ------------------------------------------------------- */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="border border-line p-6">
            <h2 className="eyebrow mb-5">{dict.checkout.summary}</h2>

            <ul className="mb-5 max-h-72 space-y-4 overflow-y-auto">
              {cart.map((line) => (
                <li key={`${line.slug}-${line.size}`} className="flex gap-3">
                  <div className="relative aspect-3/4 w-14 shrink-0 overflow-hidden bg-tile">
                    <Image
                      src={line.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                    <span className="absolute top-0 end-0 flex h-5 w-5 items-center justify-center bg-ink text-[10px] text-white">
                      {line.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs">{line.title[locale]}</p>
                    <p className="text-[11px] text-ink-muted">
                      {line.color} · {line.size}
                    </p>
                  </div>
                  <p className="text-xs">
                    {formatPrice(line.price * line.quantity, locale)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="space-y-3 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">{dict.cart.subtotal}</dt>
                <dd>{formatPrice(subtotal, locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">{dict.cart.shipping}</dt>
                <dd>
                  {shipping === 0
                    ? dict.cart.freeShipping
                    : formatPrice(shipping, locale)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
                <dt>{dict.cart.total}</dt>
                <dd>{formatPrice(total, locale)}</dd>
              </div>
            </dl>

            <button
              type="submit"
              disabled={pending || cart.length === 0}
              className="btn btn-primary mt-6 w-full"
            >
              {pending ? dict.common.loading : dict.checkout.placeOrder}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  textarea = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-ink-soft">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      {textarea ? (
        <textarea name={name} rows={3} className="field resize-y" />
      ) : (
        <input type={type} name={name} required={required} className="field" />
      )}
    </label>
  );
}
