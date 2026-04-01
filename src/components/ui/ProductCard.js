"use client";
// src/components/ui/ProductCard.js

import Image from "next/image";
import { useEffect, useState } from "react";
import { Heart, ShoppingCart, Shield, Star } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/data/products";
import clsx from "clsx";
import { Toast } from "@/components/ui/index";

export default function ProductCard({ product, onBuyEscrow }) {
  const { addToCart, toggleWishlist, isWishlisted, user } = useApp();
  const router = useRouter();
  const wishlisted = isWishlisted(product.id);
  const isEscrow = !!product.sellerEmail;
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleBuyEscrow = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "buyer") {
      setToastMessage("Only buyers can initiate transactions. Please log in with a buyer account.");
      return;
    }
    onBuyEscrow?.(product);
  };

  return (
    <>
      <Toast message={toastMessage} type="info" onClose={() => setToastMessage("")} />
      <div className="card group overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Wishlist button */}
          <button
            onClick={() => toggleWishlist(product)}
            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition"
          >
            <Heart
              size={15}
              className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          </button>

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Shield size={10} />
              {product.badge}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-[11px] text-gray-400 mb-0.5">{product.seller}</p>
          <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-600">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviews})</span>
          </div>

          {/* Price */}
          <p className="font-bold text-gray-900 text-base mb-3">
            {formatPrice(product.priceKobo)}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            {isEscrow ? (
              <>
                <button
                  onClick={handleBuyEscrow}
                  className="flex-1 flex items-center justify-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                >
                  <Shield size={12} />
                  Buy via Escrow
                </button>
                <button
                  onClick={() => addToCart(product)}
                  className="w-9 h-9 flex items-center justify-center border border-gray-200 hover:bg-gray-50 rounded-lg transition"
                >
                  <ShoppingCart size={15} className="text-gray-600" />
                </button>
              </>
            ) : (
              <button
                onClick={() => addToCart(product)}
                className="flex-1 flex items-center justify-center gap-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium py-2 rounded-lg transition"
              >
                <ShoppingCart size={13} />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
