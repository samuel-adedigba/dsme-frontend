"use client";
// src/app/buyer/(dashboard)/cart/page.js
import Link from "next/link";
import { Trash2, ShoppingBag, ShoppingCart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button, EmptyState } from "@/components/ui";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, cartTotal } = useApp();

  if (cart.length === 0) return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Cart</h1>
      <EmptyState icon={<ShoppingCart size={44} className="text-gray-400" />} title="Your cart is empty" description="Browse the shop and add items."
        action={<Link href="/buyer" className="btn-primary text-sm px-4 py-2 rounded-lg inline-block">Shop Now</Link>}
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Cart ({cart.length})</h1>
        <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600">Clear all</button>
      </div>

      <div className="space-y-3">
        {cart.map(({ product, qty }) => (
          <div key={product.id} className="card p-4 flex items-center gap-3">
            <img src={product.image} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
              <p className="text-xs text-gray-500">{product.seller}</p>
              <p className="text-sm font-bold text-orange-600 mt-0.5">
                ₦{(product.priceKobo / 100 * qty).toLocaleString()}
                {qty > 1 && <span className="text-xs text-gray-400 font-normal ml-1">×{qty}</span>}
              </p>
            </div>
            <button onClick={() => removeFromCart(product.id)} className="text-gray-300 hover:text-red-400 transition">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Subtotal</span><span>₦{(cartTotal / 100).toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 text-base mb-4">
          <span>Total</span><span>₦{(cartTotal / 100).toLocaleString()}</span>
        </div>
        <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg mb-4">
          Items in cart are standard purchases. For escrow-protected buying, use &ldquo;Buy via Escrow&rdquo; on product cards.
        </div>
        <Button className="w-full">
          <ShoppingBag size={16} />
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
