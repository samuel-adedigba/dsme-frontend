"use client";
// src/components/layout/DashboardLayout.js
// Sidebar + topbar shell for all three dashboards.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LogOut, ShoppingCart, Heart, Wallet, ListOrdered, BarChart3, AlertTriangle, Menu, X, Store, ArrowLeft, ChevronDown, LayoutDashboard, Settings, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { walletAPI } from "@/lib/api";
import { NotificationDropdown } from "@/components/ui";
import clsx from "clsx";

const BUYER_NAV = [
  { label: "Shop", href: "/buyer", icon: <Store size={16} /> },
  { label: "My Transactions", href: "/buyer/transactions", icon: <ListOrdered size={16} /> },
  { label: "Cart", href: "/buyer/cart", icon: <ShoppingCart size={16} /> },
  { label: "Wishlist", href: "/buyer/wishlist", icon: <Heart size={16} /> },
  { label: "Wallet", href: "/buyer/wallet", icon: <Wallet size={16} /> },
  { label: "Notifications", href: "/notifications", icon: <Bell size={16} /> },
  { label: "Settings", href: "/settings", icon: <Settings size={16} /> },
];

const SELLER_NAV = [
  { label: "Overview", href: "/seller", icon: <BarChart3 size={16} /> },
  { label: "My Transactions", href: "/seller/transactions", icon: <ListOrdered size={16} /> },
  { label: "Wallet", href: "/seller/wallet", icon: <Wallet size={16} /> },
  { label: "Notifications", href: "/notifications", icon: <Bell size={16} /> },
  { label: "Settings", href: "/settings", icon: <Settings size={16} /> },
];

const ADMIN_NAV = [
  { label: "Stats", href: "/admin", icon: <BarChart3 size={16} /> },
  { label: "Transactions", href: "/admin/transactions", icon: <ListOrdered size={16} /> },
  { label: "Disputes", href: "/admin/disputes", icon: <AlertTriangle size={16} /> },
  { label: "Notifications", href: "/notifications", icon: <Bell size={16} /> },
  { label: "Settings", href: "/settings", icon: <Settings size={16} /> },
];

export default function DashboardLayout({ children, role }) {
  const { user, logout, cartCount, wishlist } = useApp();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [availableBalanceKobo, setAvailableBalanceKobo] = useState(null);

  const nav = role === "seller" ? SELLER_NAV : role === "admin" ? ADMIN_NAV : BUYER_NAV;
  const dashboardPath = role === "seller" ? "/seller" : role === "admin" ? "/admin" : "/buyer";
  const fullName = user?.fullName || user?.full_name || "Unknown User";
  const email = user?.email || "No email";

  useEffect(() => {
    let mounted = true;
    if (!user || role === "admin") return;
    walletAPI.getWallet()
      .then((res) => {
        if (!mounted) return;
        const wallet = res?.data?.data;
        const available = Number(wallet?.availableBalanceKobo || wallet?.available_balance_kobo || 0);
        setAvailableBalanceKobo(available);
      })
      .catch(() => {
        if (mounted) setAvailableBalanceKobo(null);
      });
    return () => { mounted = false; };
  }, [user, role]);

  const handleLogout = async () => {
    setProfileOpen(false);
    setSidebarOpen(false);
    await logout();
  };

  const NavItems = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {nav.map((item) => {
        const active = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
              active
                ? "bg-orange-50 text-orange-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar  desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 fixed h-full z-30">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-gray-100">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">
            DSME<span className="text-orange-500">Market</span>
          </span>
        </div>

        <NavItems />

        {/* User footer */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.fullName?.[0] || user?.full_name?.[0] || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user?.fullName || user?.full_name}</p>
              <p className="text-[11px] text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 bg-white flex flex-col h-full z-50">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
              <span className="font-bold text-gray-900 text-sm">
                DSME<span className="text-orange-500">Market</span>
              </span>
              <button onClick={() => setSidebarOpen(false)}><X size={18} /></button>
            </div>
            <NavItems />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-60 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-20">
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notification Dropdown */}
            <NotificationDropdown compact={true} />

            {role === "buyer" && (
              <>
                <Link href="/buyer/wishlist" className="relative p-2 hover:bg-gray-100 rounded-full">
                  <Heart size={18} className="text-gray-600" />
                  {wishlist.length > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <Link href="/buyer/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
                  <ShoppingCart size={18} className="text-gray-600" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            <Link href="/" className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft size={14} />
              Back to Shop
            </Link>

            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-full text-xs sm:text-sm text-orange-700 font-medium transition"
                >
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {fullName[0] || "U"}
                  </div>
                  <span className="hidden sm:inline">Profile</span>
                  <ChevronDown size={14} className={profileOpen ? "rotate-180 transition" : "transition"} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg p-3 z-50">
                    <div className="border-b border-gray-100 pb-2 mb-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Role</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{user?.role}</p>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-sm text-gray-700 truncate">{email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Full name</p>
                        <p className="text-sm text-gray-900 font-medium truncate">{fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Available balance</p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {availableBalanceKobo === null ? "" : `₦${(availableBalanceKobo / 100).toLocaleString()}`}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link
                        href={dashboardPath}
                        onClick={() => setProfileOpen(false)}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition"
                      >
                        <LayoutDashboard size={14} />
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                      >
                        <LogOut size={14} />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
