"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AnnouncementBar from "./AnnouncementBar";
import Logo from "./Logo";
import LocaleSwitcher from "./LocaleSwitcher";
import MobileNav from "./MobileNav";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useStore } from "@/lib/store/StoreProvider";
import type { Category } from "@/lib/data/types";
import {
  BagIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/Icons";

export interface NavGroup {
  key: Category["group"];
  label: string;
  href: string;
  accent?: boolean;
  columns?: { title: string; links: { label: string; href: string }[] }[];
  promo?: { title: string; text: string; href: string; image: string };
}

export default function Header({ categories }: { categories: Category[] }) {
  const { dict, locale, href } = useLocale();
  const { cartCount, openDrawer, wishlist, ready } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<number | null>(null);

  /**
   * Retracts the bar while reading down the page and brings it back on the
   * first upward scroll, or when the pointer reaches the top edge.
   *
   * Starts visible and only ever hides as a result of a scroll we observed, so
   * if this never runs the navigation is simply always on screen.
   */
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      const y = window.scrollY;
      const goingDown = y > lastY.current;

      // Keep it pinned over the top of the page, and ignore the rubber-band
      // region so an overscroll bounce does not flicker the bar.
      if (y < 140) setHidden(false);
      else if (Math.abs(y - lastY.current) > 6) setHidden(goingDown);

      lastY.current = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    // Reaching for the bar should always summon it back.
    const onPointer = (e: PointerEvent) => {
      if (e.clientY < 90) setHidden(false);
    };

    lastY.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  // A menu or the search panel being open outranks the scroll direction.
  const retracted = hidden && !openGroup && !searchOpen && !mobileOpen;

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenGroup(null);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const nav = useMemo<NavGroup[]>(() => {
    const inGroup = (group: Category["group"]) =>
      categories
        .filter((c) => c.group === group)
        .map((c) => ({ label: c.title[locale], href: href(`/category/${c.slug}`) }));

    return [
      {
        key: "new",
        label: dict.nav.new,
        href: href("/category/new-in"),
      },
      {
        key: "clothing",
        label: dict.nav.clothing,
        href: href("/clothing"),
        columns: [{ title: dict.nav.clothing, links: inGroup("clothing") }],
        promo: {
          title: dict.home.editorialTitle,
          text: dict.home.panelClothing,
          href: href("/clothing"),
          image: "/media/editorial-1.svg",
        },
      },
      {
        key: "shoes",
        label: dict.nav.shoes,
        href: href("/shoes"),
        columns: [{ title: dict.nav.shoes, links: inGroup("shoes") }],
        promo: {
          title: dict.home.editorialTitle,
          text: dict.home.panelShoes,
          href: href("/shoes"),
          image: "/media/editorial-2.svg",
        },
      },
      {
        key: "sale",
        label: dict.nav.sale,
        href: href("/sale"),
        accent: true,
      },
    ];
  }, [categories, dict, locale, href]);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenGroup(null), 120);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`${href("/search")}?q=${encodeURIComponent(q)}`);
  };

  const active = nav.find((n) => n.key === openGroup);
  const homeChromeOpen = Boolean(openGroup || searchOpen || mobileOpen);

  return (
    <>
      <div
        className={
          isHome
            ? `absolute inset-x-0 top-0 z-40 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                homeChromeOpen
                  ? "translate-y-0 opacity-100"
                  : "lg:-translate-y-2 lg:opacity-0 lg:hover:translate-y-0 lg:hover:opacity-100 lg:focus-within:translate-y-0 lg:focus-within:opacity-100"
              }`
            : ""
        }
      >
        <AnnouncementBar />

        <header
          className={`border-b backdrop-blur transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
            isHome
              ? "relative border-white/35 bg-white/88 supports-[backdrop-filter]:bg-white/76"
              : `sticky top-0 z-40 border-line bg-canvas/95 supports-[backdrop-filter]:bg-canvas/85 ${
                  retracted ? "-translate-y-full" : "translate-y-0"
                }`
          }`}
          onMouseLeave={scheduleClose}
        >
        <div className="container-nino">
          {/* --- top row -------------------------------------------------- */}
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-20">
            <div className="flex items-center gap-1 md:gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label={dict.header.menu}
                className="p-2 lg:hidden"
              >
                <MenuIcon size={22} />
              </button>

              <button
                type="button"
                onClick={openDrawer}
                aria-label={dict.header.cart}
                className="relative hidden p-2 transition-opacity hover:opacity-60 lg:block"
              >
                <BagIcon size={21} />
                {ready && cartCount > 0 && (
                  <span className="absolute -top-0.5 end-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-white">
                    {cartCount}
                  </span>
                )}
              </button>

              <Link
                href={href("/wishlist")}
                aria-label={dict.header.wishlist}
                className="relative hidden p-2 transition-opacity hover:opacity-60 lg:block"
              >
                <HeartIcon size={21} />
                {ready && wishlist.length > 0 && (
                  <span className="absolute -top-0.5 end-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-white">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <Link
                href={href("/account")}
                aria-label={dict.header.account}
                className="hidden p-2 transition-opacity hover:opacity-60 lg:block"
              >
                <UserIcon size={21} />
              </Link>
            </div>

            <Logo href={href("/")} />

            <div className="flex items-center justify-end gap-1 md:gap-2">
              <div className="hidden lg:block">
                <LocaleSwitcher />
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label={dict.header.search}
                aria-expanded={searchOpen}
                className="flex items-center gap-2 p-2 transition-opacity hover:opacity-60"
              >
                <span className="nav-link hidden md:inline">
                  {dict.header.search}
                </span>
                {searchOpen ? <CloseIcon size={21} /> : <SearchIcon size={21} />}
              </button>
              <button
                type="button"
                onClick={openDrawer}
                aria-label={dict.header.cart}
                className="relative p-2 lg:hidden"
              >
                <BagIcon size={22} />
                {ready && cartCount > 0 && (
                  <span className="absolute -top-0.5 end-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* --- nav row -------------------------------------------------- */}
          <nav
            aria-label="Primary"
            className="hide-scrollbar -mx-4 hidden overflow-x-auto px-4 lg:mx-0 lg:block lg:px-0"
          >
            <ul className="flex items-stretch justify-center gap-7 xl:gap-10">
              {nav.map((item) => (
                <li
                  key={item.key}
                  onMouseEnter={() => {
                    cancelClose();
                    setOpenGroup(item.columns ? item.key : null);
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpenGroup(null)}
                    className={`nav-link flex h-12 items-center border-b-2 transition-colors ${
                      openGroup === item.key
                        ? "border-ink"
                        : "border-transparent"
                    } ${
                      item.accent
                        ? "text-sale hover:text-sale"
                        : "hover:text-ink-soft"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* --- mega menu -------------------------------------------------- */}
        {active?.columns && (
          <div
            className="absolute inset-x-0 top-full hidden border-b border-line bg-canvas shadow-[0_18px_30px_-24px_rgba(0,0,0,0.35)] lg:block"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="container-nino grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-10 py-9">
              {active.columns.map((col) => (
                <div key={col.title}>
                  <p className="eyebrow mb-4 text-ink-muted">{col.title}</p>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setOpenGroup(null)}
                          className="text-sm text-ink-soft transition-colors hover:text-ink"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    <li className="pt-2">
                      <Link
                        href={active.href}
                        onClick={() => setOpenGroup(null)}
                        className="link-underline text-sm font-medium"
                      >
                        {dict.nav.all}
                      </Link>
                    </li>
                  </ul>
                </div>
              ))}

              {active.promo && (
                <Link
                  href={active.promo.href}
                  className="group relative col-span-1 hidden aspect-4/3 overflow-hidden xl:block"
                >
                  {/* Decorative — the alt text lives in the caption below */}
                  <span
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${active.promo.image})` }}
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/45 to-transparent p-5 text-white">
                    <span className="eyebrow block opacity-80">
                      {active.promo.text}
                    </span>
                    <span className="mt-1 block font-display text-2xl">
                      {active.promo.title}
                    </span>
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* --- search panel ----------------------------------------------- */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-full animate-fade-in border-b border-line bg-canvas">
            <form onSubmit={submitSearch} className="container-nino py-8">
              <div className="mx-auto flex max-w-3xl items-center gap-3 border-b border-ink pb-3">
                <SearchIcon size={22} className="shrink-0 text-ink-muted" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={dict.header.searchPlaceholder}
                  aria-label={dict.header.search}
                  className="w-full bg-transparent text-lg outline-none placeholder:text-ink-muted"
                />
                <button type="submit" className="nav-link shrink-0 px-2 py-1">
                  {dict.header.search}
                </button>
              </div>
              <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center gap-2">
                <span className="eyebrow me-2 text-ink-muted">
                  {dict.search.popular}
                </span>
                {["NINO", "Runner 91", dict.nav.sale, dict.nav.new].map((t) => (
                  <Link
                    key={t}
                    href={`${href("/search")}?q=${encodeURIComponent(t)}`}
                    onClick={() => setSearchOpen(false)}
                    className="border border-line px-3 py-1 text-xs transition-colors hover:border-ink"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </form>
          </div>
        )}
        </header>
      </div>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        nav={nav}
      />
    </>
  );
}
