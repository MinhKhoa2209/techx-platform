"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { addToCart, loadCart, saveCart, updateCartQuantity } from "./cart";
import type { CartItem, Product } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
  ready: boolean;
}

type CartAction =
  | { type: "INIT"; items: CartItem[] }
  | { type: "ADD"; product: Product; quantity: number }
  | { type: "UPDATE_QTY"; productId: string; quantity: number }
  | { type: "REMOVE"; productId: string }
  | { type: "CLEAR" };

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalCents: number;
  ready: boolean;
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "INIT":
      return { items: action.items, ready: true };
    case "ADD":
      return {
        ...state,
        items: addToCart(state.items, action.product, action.quantity),
      };
    case "UPDATE_QTY":
      return {
        ...state,
        items: updateCartQuantity(
          state.items,
          action.productId,
          action.quantity,
        ),
      };
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((i) => i.product.id !== action.productId),
      };
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    ready: false,
  });
  const initialised = useRef(false);

  // Load from sessionStorage on mount (client only)
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const stored = loadCart(window.sessionStorage);
    dispatch({ type: "INIT", items: stored });
  }, []);

  // Persist to sessionStorage whenever items change (after init)
  useEffect(() => {
    if (!state.ready) return;
    saveCart(window.sessionStorage, state.items);
  }, [state.items, state.ready]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalCents = state.items.reduce(
    (sum, i) => sum + i.product.priceCents * i.quantity,
    0,
  );

  const addItem = useCallback(
    (product: Product, quantity: number) =>
      dispatch({ type: "ADD", product, quantity }),
    [],
  );
  const updateQuantity = useCallback(
    (productId: string, quantity: number) =>
      dispatch({ type: "UPDATE_QTY", productId, quantity }),
    [],
  );
  const removeItem = useCallback(
    (productId: string) => dispatch({ type: "REMOVE", productId }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount,
      totalCents,
      ready: state.ready,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      addItem,
      clearCart,
      itemCount,
      removeItem,
      state.items,
      state.ready,
      totalCents,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
