"use client";
// src/app/buyer/(dashboard)/wishlist/page.js
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { EmptyState } from "@/components/ui";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, moveToCart } = useApp();

  if (wishlist.length === 0) return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Wishlist</h1>
      <EmptyState icon="🤍" title="Your wishlist is empty" description="Tap the heart icon on any product to save it."
        action={<Link href="/buyer" className="btn-primary text-sm px-4 py-2 rounded-lg inline-block">Browse Products</Link>}
      />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Wishlist ({wishlist.length})</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {wishlist.map((product) => (
          <div key={product.id} className="card overflow-hidden group">
            <div className="relative h-40 bg-gray-100">
              <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm"
              >
                <Heart size={13} className="fill-red-500 text-red-500" />
              </button>
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-400">{product.seller}</p>
              <p className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">{product.name}</p>
              <p className="font-bold text-orange-600 text-sm mb-2">₦{(product.priceKobo / 100).toLocaleString()}</p>
              <button
                onClick={() => moveToCart(product)}
                className="w-full flex items-center justify-center gap-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium py-2 rounded-lg transition"
              >
                <ShoppingCart size={12} />
                Move to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
