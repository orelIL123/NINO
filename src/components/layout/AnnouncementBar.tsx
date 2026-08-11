"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ReturnIcon, MapPinIcon, TruckIcon } from "@/components/ui/Icons";

/** Rotating top strip, the same idea as the reference site's promo bar. */
export default function AnnouncementBar() {
  const { dict } = useLocale();
  const messages = [
    { icon: TruckIcon, text: dict.announcement.shipping },
    { icon: ReturnIcon, text: dict.announcement.returns },
    { icon: MapPinIcon, text: dict.announcement.store },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % messages.length),
      4500
    );
    return () => window.clearInterval(id);
  }, [messages.length]);

  return (
    <div className="bg-ink text-white">
      <div className="container-nino flex h-9 items-center justify-center overflow-hidden">
        <div className="relative h-9 w-full max-w-lg">
          {messages.map((m, i) => {
            const Icon = m.icon;
            return (
              <p
                key={m.text}
                aria-hidden={i !== index}
                className={`eyebrow absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-500 ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <Icon size={15} className="shrink-0 opacity-80" />
                {m.text}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
