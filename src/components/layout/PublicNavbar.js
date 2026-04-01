"use client";
// src/components/layout/PublicNavbar.js

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, Search, Menu, X, Shield, ChevronDown, LayoutDashboard } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { CATEGORIES } from "@/data/products";

export default function PublicNavbar({ activeCategory, onCategoryChange }) {
  const { user, cartCount, wishlist, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await logout();
  };

  const dashboardPath =
    user?.role === "seller" ? "/seller" :
    user?.role === "admin"  ? "/admin"  : "/buyer";

  const fullName = user?.fullName || user?.full_name || "Unknown User";
  const email = user?.email || "No email";
  const role = user?.role || "user";

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 hidden sm:block">
            DSME<span className="text-orange-500">Market</span>
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
            />
          </div>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Wishlist */}
          <Link
            href={user ? `${dashboardPath}/wishlist` : "/login"}
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
          >
            <Heart size={20} className="text-gray-600" />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href={user ? `${dashboardPath}/cart` : "/login"}
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ShoppingCart size={20} className="text-gray-600" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-gray-700 hover:text-orange-500 px-3 py-1.5 transition"
              >
                Log Out
              </button>
            ) : (
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-orange-500 px-3 py-1.5 transition">
                Log In
              </Link>
            )}
            <Link href="/signup" className="text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full transition">
              Sign Up
            </Link>

            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-full text-sm text-orange-700 font-medium transition"
                >
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {fullName[0] || "U"}
                  </div>
                  Dashboard
                  <ChevronDown size={14} className={profileOpen ? "rotate-180 transition" : "transition"} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-3 z-50">
                    <div className="border-b border-gray-100 pb-2 mb-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Role</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{role}</p>
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
                    </div>
                    <Link
                      href={dashboardPath}
                      onClick={() => setProfileOpen(false)}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition"
                    >
                      <LayoutDashboard size={14} />
                      Go to Dashboard
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden p-2 hover:bg-gray-100 rounded-full"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Category bar */}
      {onCategoryChange && (
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
            <div className="flex gap-1 py-2 min-w-max">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-orange-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="block text-sm font-medium text-gray-700"
            >
              Log Out
            </button>
          ) : (
            <Link href="/login" className="block text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>
              Log In
            </Link>
          )}
          <Link href="/signup" className="block text-sm font-medium text-orange-600" onClick={() => setMobileOpen(false)}>
            Sign Up
          </Link>

          {user ? (
            <>
              <div className="rounded-lg bg-gray-50 p-3 space-y-1">
                <p className="text-xs text-gray-400 capitalize">{role}</p>
                <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
                <p className="text-xs text-gray-500 truncate">{email}</p>
              </div>
              <Link href={dashboardPath} className="inline-flex items-center gap-2 text-sm font-medium text-orange-600" onClick={() => setMobileOpen(false)}>
                <LayoutDashboard size={14} />
                Go to Dashboard
              </Link>
            </>
          ) : null}
        </div>
      )}
    </header>
  );
}
