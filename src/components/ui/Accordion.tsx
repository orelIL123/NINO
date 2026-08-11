"use client";

import { useId, useState } from "react";
import { MinusIcon, PlusIcon } from "./Icons";

export default function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between py-4 text-start"
        >
          <span className="eyebrow">{title}</span>
          {open ? <MinusIcon size={16} /> : <PlusIcon size={16} />}
        </button>
      </h3>
      <div
        id={id}
        hidden={!open}
        className="animate-fade-in pb-5 text-sm text-ink-soft"
      >
        {children}
      </div>
    </div>
  );
}
