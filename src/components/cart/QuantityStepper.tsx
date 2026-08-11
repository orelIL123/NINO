"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { MinusIcon, PlusIcon } from "@/components/ui/Icons";

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const { dict } = useLocale();

  return (
    <div
      className="inline-flex items-center border border-line-strong"
      role="group"
      aria-label={dict.product.quantity}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min - 1, value - 1))}
        className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-surface"
        aria-label="−"
      >
        <MinusIcon size={14} />
      </button>
      <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-surface disabled:opacity-30"
        aria-label="+"
      >
        <PlusIcon size={14} />
      </button>
    </div>
  );
}
