"use client";
// src/context/AppContext.js
// Global state: auth user, cart, wishlist.
// Wrap the app in AppProvider to access useApp() hook anywhere.

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI, publicAPI, notificationsAPI } from "@/lib/api";
import { Toast } from "@/components/ui/index";

const AppContext = createContext(null);
const TOAST_EVENT = "dsme:toast";

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState([]);       // [{ product, qty }]
  const [wishlist, setWishlist] = useState([]); // [product]
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [sellerDirectory, setSellerDirectory] = useState({
    list: [],
    byEmail: {},
    loading: false,
    loaded: false,
  });
  
  // Notifications state
  const [notifications, setNotifications] = useState({
    list: [],
    loading: false,
    error: null,
    page: 1,
    limit: 20,
    hasMore: true,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailEnabled: true,
    emailTransactions: true,
    emailPayments: true,
    emailDisputes: true,
    inAppEnabled: true,
    inAppTransactions: true,
    inAppPayments: true,
    inAppDisputes: true,
  });

  const indexSellersByEmail = useCallback((sellers) => {
    return sellers.reduce((acc, seller) => {
      const email = seller?.email?.toLowerCase?.();
      if (!email) return acc;
      acc[email] = seller;
      return acc;
    }, {});
  }, []);

  const refreshSellers = useCallback(async () => {
    setSellerDirectory((prev) => ({ ...prev, loading: true }));
    try {
      const res = await publicAPI.getSellers();
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setSellerDirectory({
        list,
        byEmail: indexSellersByEmail(list),
        loading: false,
        loaded: true,
      });
    } catch {
      setSellerDirectory((prev) => ({ ...prev, loading: false, loaded: true }));
    }
  }, [indexSellersByEmail]);

  const resolveSellerForProduct = useCallback(
    (product) => {
      const email = product?.sellerEmail?.toLowerCase?.();
      const fromDirectory = email ? sellerDirectory.byEmail[email] : null;
      return {
        id: fromDirectory?.id || product?.sellerId || null,
        email: fromDirectory?.email || product?.sellerEmail || null,
        name: fromDirectory?.name || product?.seller || null,
      };
    },
    [sellerDirectory.byEmail]
  );

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("dsme_token");
    const storedUser = localStorage.getItem("dsme_user");
    const storedCart = localStorage.getItem("dsme_cart");
    const storedWishlist = localStorage.getItem("dsme_wishlist");
    const storedNotificationPrefs = localStorage.getItem("dsme_notification_preferences");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    if (storedCart) setCart(JSON.parse(storedCart));
    if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    if (storedNotificationPrefs) {
      try {
        setNotificationPreferences(JSON.parse(storedNotificationPrefs));
      } catch (e) {
        console.warn("Failed to parse notification preferences from localStorage");
      }
    }
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

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("dsme_notification_preferences", JSON.stringify(notificationPreferences));
  }, [notificationPreferences, hydrated]);

  useEffect(() => {
    const handleToastEvent = (event) => {
      const message = event?.detail?.message;
      const type = event?.detail?.type || "info";
      if (!message) return;
      setToast({ message, type });
    };

    window.addEventListener(TOAST_EVENT, handleToastEvent);
    return () => window.removeEventListener(TOAST_EVENT, handleToastEvent);
  }, []);

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => {
      setToast({ message: "", type: "info" });
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    refreshSellers();
  }, [refreshSellers]);

  // Fetch unread count periodically for logged-in users
  useEffect(() => {
    if (!token || !hydrated) return;
    
    const fetchUnreadCount = async () => {
      try {
        // Use different API based on user role
        const isAdmin = user?.role === 'admin';
        const api = isAdmin ? notificationsAPI.getAdminUnreadCount : notificationsAPI.getUnreadCount;
        
        const res = await api();
        // Handle both direct count and nested count formats
        const unreadCount = res.data.data?.unread_count || res.data.data?.unreadCount || 0;
        setUnreadCount(unreadCount);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };

    fetchUnreadCount();
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token, hydrated, user?.role]);

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

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authAPI.getProfile();
      const userData = res.data.data.user;
      setUser(userData);
      localStorage.setItem("dsme_user", JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  }, [token]);

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

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (params = {}) => {
    if (!token) return;
    
    setNotifications((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      // Use different API based on user role
      const isAdmin = user?.role === 'admin';
      const api = isAdmin ? notificationsAPI.getSystemNotifications : notificationsAPI.getNotifications;
      
      const res = await api({
        page: params.page || notifications.page,
        limit: params.limit || notifications.limit,
        category: params.category,
        isRead: params.isRead,
        type: params.type, // For admin notifications
        severity: params.severity, // For admin notifications
        ...params,
      });
      
      const newNotifications = res.data.data?.notifications || res.data.data || [];
      const hasMore = newNotifications.length === notifications.limit;
      
      setNotifications((prev) => ({
        ...prev,
        list: params.page === 1 ? newNotifications : [...prev.list, ...newNotifications],
        loading: false,
        hasMore,
        page: params.page || prev.page,
      }));
    } catch (err) {
      setNotifications((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || "Failed to fetch notifications",
      }));
    }
  }, [token, notifications.page, notifications.limit, user?.role]);

  const markNotificationAsRead = useCallback(async (id) => {
    if (!token) return;
    
    try {
      // Use different API based on user role
      const isAdmin = user?.role === 'admin';
      const api = isAdmin ? notificationsAPI.markAdminAsRead : notificationsAPI.markAsRead;
      
      await api(id);
      
      setNotifications((prev) => ({
        ...prev,
        list: prev.list.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        ),
      }));
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, [token, user?.role]);

  const markAllNotificationsAsRead = useCallback(async () => {
    if (!token) return;
    
    try {
      // Use different API based on user role
      const isAdmin = user?.role === 'admin';
      const api = isAdmin ? notificationsAPI.markMultipleAsRead : notificationsAPI.markAllAsRead;
      
      if (isAdmin) {
        // For admin, we need to pass notification IDs
        const unreadIds = notifications.list.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length > 0) {
          await api(unreadIds);
        }
      } else {
        await api();
      }
      
      setNotifications((prev) => ({
        ...prev,
        list: prev.list.map((notif) => ({ ...notif, isRead: true })),
      }));
      
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, [token, notifications.list, user?.role]);

  const deleteNotification = useCallback(async (id) => {
    if (!token) return;
    
    try {
      // Use different API based on user role
      const isAdmin = user?.role === 'admin';
      const api = isAdmin ? notificationsAPI.deleteAdminNotification : notificationsAPI.deleteNotification;
      
      await api(id);
      
      setNotifications((prev) => {
        const notificationToDelete = prev.list.find((notif) => notif.id === id);
        const wasUnread = notificationToDelete?.isRead === false;
        
        return {
          ...prev,
          list: prev.list.filter((notif) => notif.id !== id),
        };
      });
      
      // Update unread count if deleted notification was unread
      const notificationToDelete = notifications.list.find((notif) => notif.id === id);
      if (notificationToDelete?.isRead === false) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, [token, notifications.list, user?.role]);

  const updateNotificationPreferences = useCallback(async (preferences) => {
    if (!token) return;
    
    try {
      await notificationsAPI.updatePreferences(preferences);
      setNotificationPreferences(preferences);
    } catch (err) {
      console.error("Failed to update notification preferences:", err);
      throw err;
    }
  }, [token]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications({ page: 1 });
    
    // Also refresh unread count
    try {
      const isAdmin = user?.role === 'admin';
      const api = isAdmin ? notificationsAPI.getAdminUnreadCount : notificationsAPI.getUnreadCount;
      const res = await api();
      const unreadCount = res.data.data?.unread_count || res.data.data?.unreadCount || 0;
      setUnreadCount(unreadCount);
    } catch (err) {
      console.error("Failed to refresh unread count:", err);
    }
  }, [fetchNotifications, user?.role]);

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />
      <AppContext.Provider
        value={{
          user, token, hydrated,
          login, logout, refreshProfile,
          cart, addToCart, removeFromCart, clearCart, cartCount, cartTotal,
          wishlist, toggleWishlist, isWishlisted, moveToCart,
          sellers: sellerDirectory.list,
          sellersLoading: sellerDirectory.loading,
          sellersLoaded: sellerDirectory.loaded,
          refreshSellers,
          resolveSellerForProduct,
          // Notifications
          notifications: notifications.list,
          notificationsLoading: notifications.loading,
          notificationsError: notifications.error,
          notificationsHasMore: notifications.hasMore,
          notificationsPage: notifications.page,
          unreadCount,
          notificationPreferences,
          fetchNotifications,
          markNotificationAsRead,
          markAllNotificationsAsRead,
          deleteNotification,
          updateNotificationPreferences,
          refreshNotifications,
        }}
      >
        {children}
      </AppContext.Provider>
    </>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
