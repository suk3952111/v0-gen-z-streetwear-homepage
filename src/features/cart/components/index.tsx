"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Sparkles, X } from "lucide-react";
import { vibeCategories } from "@/mocks/cart";
import { products as mockProducts } from "@/features/products/mocks/products";
import { useI18n } from "@/lib/i18n/use-i18n";
import { NoiseOverlay } from "@/components/ui";
import { createSupabaseClient } from "@/lib/supabase/client";
import {
  getCartItemsByUserId,
  removeCartItem,
  updateCartItemQuantity,
} from "@/features/cart/services";

type CartEntry = {
  key: string;
  productId: string;
  quantity: number;
  size: string;
  dbId?: string;
};

const LOCAL_CART_KEY = "vibe-check-cart";
const DEFAULT_LOCAL_CART: CartEntry[] = [
  { key: "hoodie-001", productId: "hoodie-001", quantity: 1, size: "L" },
  { key: "bottom-001", productId: "bottom-001", quantity: 2, size: "M" },
  { key: "acc-001", productId: "acc-001", quantity: 1, size: "ONE SIZE" },
];

export function CartView() {
  const { locale, t } = useI18n("cart");
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [storageMode, setStorageMode] = useState<"local" | "supabase">("local");
  const [entries, setEntries] = useState<CartEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadLocalCart = useCallback(() => {
    const saved = localStorage.getItem(LOCAL_CART_KEY);
    if (!saved) {
      setEntries(DEFAULT_LOCAL_CART);
      return;
    }
    try {
      setEntries(JSON.parse(saved) as CartEntry[]);
    } catch {
      setEntries(DEFAULT_LOCAL_CART);
    }
  }, []);

  const loadSupabaseCart = useCallback(
    async (userId: string) => {
      try {
        const rows = await getCartItemsByUserId(supabase, userId);
        setEntries(rows);
      } catch {
        setEntries([]);
      }
    },
    [supabase],
  );

  useEffect(() => {
    let isActive = true;

    const initialize = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isActive) return;

      if (!user) {
        setStorageMode("local");
        setCurrentUserId(null);
        loadLocalCart();
        return;
      }

      setStorageMode("supabase");
      setCurrentUserId(user.id);
      await loadSupabaseCart(user.id);
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      if (!user) {
        setStorageMode("local");
        setCurrentUserId(null);
        loadLocalCart();
        return;
      }

      setStorageMode("supabase");
      setCurrentUserId(user.id);
      await loadSupabaseCart(user.id);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [loadLocalCart, loadSupabaseCart, supabase]);

  useEffect(() => {
    if (storageMode === "local") {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(entries));
    }
  }, [entries, storageMode]);

  const items = useMemo(() => {
    return entries
      .map((entry) => {
        const product = mockProducts.find((p) => p.id === entry.productId);
        if (!product) return null;
        const vibeTag =
          product.tags[0]?.replace("#", "").toUpperCase() ?? "VIBE";
        return {
          id: entry.key,
          dbId: entry.dbId,
          productId: entry.productId,
          name: product.name.includes("?")
            ? entry.productId.replace(/-/g, " ").toUpperCase()
            : product.name,
          price: product.priceUSD,
          priceKRW: product.price,
          size: entry.size,
          quantity: entry.quantity,
          image: product.image,
          vibeTag,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [entries]);

  const updateQuantity = async (id: string, delta: number) => {
    const current = entries.find((entry) => entry.key === id);
    if (!current) return;
    const nextQuantity = Math.max(1, current.quantity + delta);

    setEntries((prev) =>
      prev.map((entry) =>
        entry.key === id ? { ...entry, quantity: nextQuantity } : entry,
      ),
    );

    if (storageMode === "supabase" && current.dbId && currentUserId) {
      await updateCartItemQuantity(
        supabase,
        current.dbId,
        currentUserId,
        nextQuantity,
      );
    }
  };

  const removeItem = async (id: string) => {
    const current = entries.find((entry) => entry.key === id);
    setEntries((prev) => prev.filter((entry) => entry.key !== id));

    if (storageMode === "supabase" && current?.dbId && currentUserId) {
      await removeCartItem(supabase, current.dbId, currentUserId);
    }
  };

  const formatPrice = (usd: number, krw: number) => {
    return locale === "KR" ? `${krw.toLocaleString()}원` : `$${usd}`;
  };

  const subtotal = items.reduce(
    (acc, item) =>
      acc + (locale === "KR" ? item.priceKRW : item.price) * item.quantity,
    0,
  );

  const orderNumber =
    "VC" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const currentDate = new Date().toLocaleDateString(
    locale === "KR" ? "ko-KR" : "en-US",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <section className="relative pt-24 pb-20 px-4 md:px-8">
        <NoiseOverlay />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-12 border-b-4 border-[#CCFF00] pb-6">
            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-none">
              {t("title")}
              <span className="text-[#CCFF00]">{t("titleAccent")}</span>
            </h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#888888] text-2xl uppercase tracking-wider mb-8">
                {t("empty")}
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] text-xl font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
              >
                {t("shopNow")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-4 md:p-6 flex flex-col md:flex-row gap-6"
                  >
                    <div className="relative w-full md:w-40 h-40 border-2 border-[#CCFF00] flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-1 bg-[#0a0a0a] border border-[#CCFF00] text-[#CCFF00] text-xs font-bold">
                        {item.vibeTag}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">
                          {item.name}
                        </h3>
                        <p className="text-[#888888] uppercase text-sm mt-1">
                          SIZE: {item.size}
                        </p>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[#888888] text-sm uppercase mr-2">
                            {t("quantity")}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-10 h-10 border-2 border-[#CCFF00] text-[#CCFF00] flex items-center justify-center hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 h-10 border-2 border-[#CCFF00] text-white flex items-center justify-center font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-10 h-10 border-2 border-[#CCFF00] text-[#CCFF00] flex items-center justify-center hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6">
                          <p className="text-[#CCFF00] text-2xl font-bold">
                            {formatPrice(
                              item.price * item.quantity,
                              item.priceKRW * item.quantity,
                            )}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex items-center gap-2 text-[#888888] hover:text-[#ff4444] transition-colors uppercase text-sm"
                            aria-label="Remove item"
                          >
                            <X className="w-5 h-5" />
                            <span className="hidden md:inline">
                              {t("remove")}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-[#CCFF00]" />
                    <h3 className="text-xl font-bold text-[#CCFF00] uppercase tracking-wider">
                      {t("aiAnalyzer")}
                    </h3>
                  </div>
                  <p className="text-[#888888] text-sm uppercase tracking-wider mb-4">
                    {t("vibeScore")}
                  </p>
                  <div className="space-y-4">
                    {vibeCategories.map((vibe) => (
                      <div key={vibe.name}>
                        <div className="flex justify-between mb-2">
                          <span className="text-white font-bold uppercase text-sm">
                            {vibe.name}
                          </span>
                          <span className="text-white font-bold">
                            {vibe.percentage}%
                          </span>
                        </div>
                        <div className="h-3 bg-[#1a1a1a] border border-[#333333]">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${vibe.percentage}%`,
                              backgroundColor: vibe.color,
                              boxShadow: `0 0 10px ${vibe.color}`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] sticky top-24">
                  <div className="border-b-4 border-dashed border-[#CCFF00] p-6 text-center">
                    <h2 className="text-3xl font-bold text-[#CCFF00] tracking-tighter">
                      VIBE CHECK
                    </h2>
                    <p className="text-[#888888] text-xs uppercase tracking-[0.3em] mt-2">
                      STREETWEAR RECEIPT
                    </p>
                  </div>

                  <div className="p-6 space-y-4 font-mono text-sm">
                    <div className="flex justify-between text-[#888888]">
                      <span>{t("orderNumber")}</span>
                      <span className="text-white">{orderNumber}</span>
                    </div>
                    <div className="flex justify-between text-[#888888]">
                      <span>{t("date")}</span>
                      <span className="text-white">{currentDate}</span>
                    </div>

                    <div className="border-t border-dashed border-[#333333] my-4" />

                    <div className="space-y-2">
                      <p className="text-[#888888] uppercase">{t("items")}</p>
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-white text-xs"
                        >
                          <span className="truncate max-w-[60%]">
                            {item.quantity}x {item.name}
                          </span>
                          <span>
                            {formatPrice(
                              item.price * item.quantity,
                              item.priceKRW * item.quantity,
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-[#333333] my-4" />

                    <div className="flex justify-between text-[#888888]">
                      <span>{t("subtotal")}</span>
                      <span className="text-white">
                        {locale === "KR"
                          ? `${subtotal.toLocaleString()}원`
                          : `$${subtotal}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#888888]">
                      <span>{t("shipping")}</span>
                      <span className="text-white text-xs">
                        {t("shippingValue")}
                      </span>
                    </div>

                    <div className="border-t-4 border-[#CCFF00] my-4" />

                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-white">{t("total")}</span>
                      <span className="text-[#CCFF00]">
                        {locale === "KR"
                          ? `${subtotal.toLocaleString()}원`
                          : `$${subtotal}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 pt-0 space-y-4">
                    <button className="w-full py-4 bg-[#CCFF00] text-[#0a0a0a] text-xl font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors">
                      {t("checkout")}
                    </button>
                    <Link
                      href="/"
                      className="block text-center text-[#888888] text-sm uppercase tracking-wider hover:text-[#CCFF00] transition-colors"
                    >
                      {t("continueShop")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
