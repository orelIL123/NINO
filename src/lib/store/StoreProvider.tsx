"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { CartLine, WishlistItem } from "@/lib/data/types";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/shipping";

export { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/shipping";

const CART_KEY = "nino.cart.v1";
const WISH_KEY = "nino.wishlist.v1";

type State = { cart: CartLine[]; wishlist: WishlistItem[]; ready: boolean };

type Action =
  | { type: "hydrate"; cart: CartLine[]; wishlist: WishlistItem[] }
  | { type: "add"; line: CartLine }
  | { type: "remove"; slug: string; size: string }
  | { type: "qty"; slug: string; size: string; quantity: number }
  | { type: "clear" }
  | { type: "wishlist"; item: WishlistItem };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { cart: action.cart, wishlist: action.wishlist, ready: true };
    case "add": {
      const i = state.cart.findIndex(
        (l) => l.slug === action.line.slug && l.size === action.line.size
      );
      if (i === -1) return { ...state, cart: [...state.cart, action.line] };
      const cart = [...state.cart];
      cart[i] = {
        ...cart[i],
        quantity: Math.min(10, cart[i].quantity + action.line.quantity),
      };
      return { ...state, cart };
    }
    case "remove":
      return {
        ...state,
        cart: state.cart.filter(
          (l) => !(l.slug === action.slug && l.size === action.size)
        ),
      };
    case "qty":
      return {
        ...state,
        cart: state.cart
          .map((l) =>
            l.slug === action.slug && l.size === action.size
              ? { ...l, quantity: action.quantity }
              : l
          )
          .filter((l) => l.quantity > 0),
      };
    case "clear":
      return { ...state, cart: [] };
    case "wishlist": {
      const exists = state.wishlist.some((w) => w.slug === action.item.slug);
      return {
        ...state,
        wishlist: exists
          ? state.wishlist.filter((w) => w.slug !== action.item.slug)
          : [action.item, ...state.wishlist],
      };
    }
    default:
      return state;
  }
}

interface StoreValue extends State {
  cartCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (line: CartLine) => void;
  removeFromCart: (slug: string, size: string) => void;
  setQuantity: (slug: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (item: WishlistItem) => void;
  inWishlist: (slug: string) => boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    cart: [],
    wishlist: [],
    ready: false,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Restoring from localStorage has to happen after mount, otherwise the first
  // client render would not match the server HTML. One dispatch, once.
  useEffect(() => {
    dispatch({
      type: "hydrate",
      cart: readStorage<CartLine[]>(CART_KEY, []),
      wishlist: readStorage<WishlistItem[]>(WISH_KEY, []),
    });
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
      window.localStorage.setItem(WISH_KEY, JSON.stringify(state.wishlist));
    } catch {
      /* storage full or blocked — the cart still works for this session */
    }
  }, [state]);

  // Lock body scroll while the cart drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const addToCart = useCallback((line: CartLine) => {
    dispatch({ type: "add", line });
    setDrawerOpen(true);
  }, []);

  const value = useMemo<StoreValue>(() => {
    const subtotal = state.cart.reduce((s, l) => s + l.price * l.quantity, 0);
    const shipping =
      subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    return {
      ...state,
      cartCount: state.cart.reduce((s, l) => s + l.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addToCart,
      removeFromCart: (slug, size) => dispatch({ type: "remove", slug, size }),
      setQuantity: (slug, size, quantity) =>
        dispatch({ type: "qty", slug, size, quantity }),
      clearCart: () => dispatch({ type: "clear" }),
      toggleWishlist: (item) => dispatch({ type: "wishlist", item }),
      inWishlist: (slug) => state.wishlist.some((w) => w.slug === slug),
    };
  }, [state, drawerOpen, addToCart]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
