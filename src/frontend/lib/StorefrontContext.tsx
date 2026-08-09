"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCatalog, getStoreConfig } from "./api-client";
import type { CatalogCategory, Product, StoreConfig } from "./types";

type LoadState = "loading" | "success" | "error";

interface StorefrontContextValue {
  products: Product[];
  categories: CatalogCategory[];
  config: StoreConfig | null;
  catalogState: LoadState;
  configState: LoadState;
  retryCatalog: () => void;
  retryConfig: () => void;
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [catalogState, setCatalogState] = useState<LoadState>("loading");
  const [configState, setConfigState] = useState<LoadState>("loading");
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [configAttempt, setConfigAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setCatalogState("loading");
    getCatalog()
      .then((catalog) => {
        if (!active) return;
        setProducts(catalog.products);
        setCategories(catalog.categories);
        setCatalogState("success");
      })
      .catch(() => {
        if (active) setCatalogState("error");
      });
    return () => {
      active = false;
    };
  }, [catalogAttempt]);

  useEffect(() => {
    let active = true;
    setConfigState("loading");
    getStoreConfig()
      .then(({ config: nextConfig }) => {
        if (!active) return;
        setConfig(nextConfig);
        setConfigState("success");
      })
      .catch(() => {
        if (active) setConfigState("error");
      });
    return () => {
      active = false;
    };
  }, [configAttempt]);

  const retryCatalog = useCallback(
    () => setCatalogAttempt((attempt) => attempt + 1),
    [],
  );
  const retryConfig = useCallback(
    () => setConfigAttempt((attempt) => attempt + 1),
    [],
  );

  const value = useMemo(
    () => ({
      products,
      categories,
      config,
      catalogState,
      configState,
      retryCatalog,
      retryConfig,
    }),
    [
      products,
      categories,
      config,
      catalogState,
      configState,
      retryCatalog,
      retryConfig,
    ],
  );

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront(): StorefrontContextValue {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error("useStorefront must be used inside StorefrontProvider");
  }
  return context;
}
