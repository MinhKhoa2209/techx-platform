"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addToCart,
  loadCart,
  reconcileCart,
  saveCart,
  updateCartQuantity,
} from "./cart";
import { useStorefront } from "./StorefrontContext";
import type { CartItem, Product } from "./types";

interface CartState {
  items: CartItem[];
  ready: boolean;
}

type CartAction =
  | { type: "INIT"; items: CartItem[] }
  | { type: "REPLACE"; items: CartItem[] }
  | { type: "ADD"; product: Product; quantity: number; maximum: number }
  | { type: "UPDATE_QTY"; productId: string; quantity: number; maximum: number }
  | { type: "REMOVE"; productId: string }
  | { type: "CLEAR" };

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  ready: boolean;
  reconciliationNotice: boolean;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  dismissReconciliationNotice: () => void;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "INIT":
      return { items: action.items, ready: true };
    case "REPLACE":
      return { ...state, items: action.items };
    case "ADD":
      return {
        ...state,
        items: addToCart(
          state.items,
          action.product,
          action.quantity,
          action.maximum,
        ),
      };
    case "UPDATE_QTY":
      return {
        ...state,
        items: updateCartQuantity(
          state.items,
          action.productId,
          action.quantity,
          action.maximum,
        ),
      };
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter(
          (item) => item.product.id !== action.productId,
        ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products, catalogState, config } = useStorefront();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    ready: false,
  });
  const [reconciliationNotice, setReconciliationNotice] = useState(false);
  const initialised = useRef(false);
  const reconciledCatalog = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    dispatch({ type: "INIT", items: loadCart(window.sessionStorage) });
  }, []);

  useEffect(() => {
    if (
      !state.ready ||
      catalogState !== "success" ||
      !config ||
      reconciledCatalog.current
    ) {
      return;
    }
    reconciledCatalog.current = true;
    const reconciled = reconcileCart(
      state.items,
      products,
      config.maxQuantityPerItem,
    );
    if (reconciled.changed) {
      dispatch({ type: "REPLACE", items: reconciled.items });
      setReconciliationNotice(true);
    }
  }, [catalogState, config, products, state.items, state.ready]);

  useEffect(() => {
    if (state.ready) saveCart(window.sessionStorage, state.items);
  }, [state.items, state.ready]);

  const maximum = config?.maxQuantityPerItem ?? Number.MAX_SAFE_INTEGER;
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalCents = state.items.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  );

  const addItem = useCallback(
    (product: Product, quantity = 1) =>
      dispatch({ type: "ADD", product, quantity, maximum }),
    [maximum],
  );
  const updateQuantity = useCallback(
    (productId: string, quantity: number) =>
      dispatch({ type: "UPDATE_QTY", productId, quantity, maximum }),
    [maximum],
  );
  const removeItem = useCallback(
    (productId: string) => dispatch({ type: "REMOVE", productId }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const dismissReconciliationNotice = useCallback(
    () => setReconciliationNotice(false),
    [],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount,
      subtotalCents,
      ready: state.ready,
      reconciliationNotice,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      dismissReconciliationNotice,
    }),
    [
      addItem,
      clearCart,
      dismissReconciliationNotice,
      itemCount,
      reconciliationNotice,
      removeItem,
      state.items,
      state.ready,
      subtotalCents,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
