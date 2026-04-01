"use client";
// src/context/AppContext.js
// Global state: auth user, cart, wishlist.
// Wrap the app in AppProvider to access useApp() hook anywhere.

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "@/lib/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState([]);       // [{ product, qty }]
  const [wishlist, setWishlist] = useState([]); // [product]
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("dsme_token");
    const storedUser = localStorage.getItem("dsme_user");
    const storedCart = localStorage.getItem("dsme_cart");
    const storedWishlist = localStorage.getItem("dsme_wishlist");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    if (storedCart) setCart(JSON.parse(storedCart));
    if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    setHydrated(true);
  }, []);

  // Persist cart and wishlist to localStorage whenever they change
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("dsme_cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("dsme_wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  // ── AUTH ────────────────────────────────────────────────────────────────────
  const login = useCallback((userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("dsme_token", jwtToken);
    localStorage.setItem("dsme_user", JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem("dsme_token");
    localStorage.removeItem("dsme_user");
    window.location.href = "/";
  }, []);

  // ── CART ─────────────────────────────────────────────────────────────────────
  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  // ── WISHLIST ──────────────────────────────────────────────────────────────────
  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
    });
  }, []);

  const isWishlisted = useCallback(
    (productId) => wishlist.some((p) => p.id === productId),
    [wishlist]
  );

  const moveToCart = useCallback(
    (product) => {
      addToCart(product);
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
    },
    [addToCart]
  );

  return (
    <AppContext.Provider
      value={{
        user, token, hydrated,
        login, logout,
        cart, addToCart, removeFromCart, clearCart, cartCount, cartTotal,
        wishlist, toggleWishlist, isWishlisted, moveToCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
