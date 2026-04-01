"use client";
// src/app/page.js — Public storefront landing page

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Zap, Lock, CheckCircle2, Scale, Search } from "lucide-react";
import { AppProvider } from "@/context/AppContext";
import PublicNavbar from "@/components/layout/PublicNavbar";
import ProductCard from "@/components/ui/ProductCard";
import { Modal, Button, Input, Select } from "@/components/ui";
import { products, CATEGORIES } from "@/data/products";
import { transactionAPI } from "@/lib/api";
import { useApp } from "@/context/AppContext";

function StoreFront() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [escrowModal, setEscrowModal] = useState(null); // selected product
  const [milestones, setMilestones] = useState([
    { description: "Materials sourced / initial work", percentage: 30, order_index: 0 },
    { description: "Final delivery confirmed", percentage: 70, order_index: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const router = useRouter();
  const { user } = useApp();

  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("search") || "";

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== "All") list = list.filter((p) => p.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const handleBuyEscrow = (product) => setEscrowModal(product);

  const handleInitiateTransaction = async () => {
    if (!escrowModal) return;
    setLoading(true);
    try {
      const payload = {
        item_name: escrowModal.name,
        item_description: escrowModal.description,
        price_kobo: escrowModal.priceKobo,
        buyer_email: user.email,
        caution_rate: 0.05,
        milestones,
      };
      const res = await transactionAPI.create(payload);
      setToast("Transaction created! Check your dashboard.");
      setEscrowModal(null);
      setTimeout(() => router.push(`/buyer/transactions/${res.data.data.transaction.id}`), 1000);
    } catch (err) {
      setToast(err.response?.data?.message || "Failed to create transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublicNavbar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Shop Safely with Escrow Protection
          </h1>
          <p className="text-orange-100 text-base mb-6 max-w-2xl mx-auto">
            Every purchase backed by dual-staking escrow. Your money is protected until
            you confirm delivery — and sellers commit too.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              { icon: <Lock size={14} className="text-white" />, text: "Funds held securely" },
              { icon: <CheckCircle2 size={14} className="text-white" />, text: "Release on confirmation" },
              { icon: <Scale size={14} className="text-white" />, text: "Dispute protection" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <span className="inline-flex items-center justify-center">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works strip */}
      <section className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { icon: <Shield size={22} className="text-orange-500" />, title: "1. Buyer Stakes", text: "Funds locked from your DSME wallet" },
            { icon: <Lock size={22} className="text-orange-500" />, title: "2. Seller Stakes", text: "Caution fee committed to quality" },
            { icon: <Zap size={22} className="text-orange-500" />, title: "3. Confirm & Release", text: "Approve milestones to release payment" },
          ].map((s) => (
            <div key={s.title} className="flex flex-col items-center gap-2">
              {s.icon}
              <p className="font-semibold text-xs text-gray-900">{s.title}</p>
              <p className="text-xs text-gray-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">
            {activeCategory === "All" ? "All Products" : activeCategory}
            <span className="ml-2 text-sm text-gray-400 font-normal">
              ({filtered.length} items)
            </span>
          </h2>
          {searchQuery && (
            <p className="text-sm text-gray-500">
              Results for &ldquo;<strong>{searchQuery}</strong>&rdquo;
            </p>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Search size={36} className="mx-auto mb-3 text-gray-300" />
            <p>No products found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onBuyEscrow={handleBuyEscrow} />
            ))}
          </div>
        )}
      </main>

      {/* Escrow checkout modal */}
      <Modal
        open={!!escrowModal}
        onClose={() => setEscrowModal(null)}
        title="Buy via Escrow"
        maxWidth="max-w-lg"
      >
        {escrowModal && (
          <div className="space-y-4">
            <div className="flex gap-3 p-3 bg-orange-50 rounded-lg">
              <img src={escrowModal.image} className="w-16 h-16 rounded-lg object-cover" />
              <div>
                <p className="font-medium text-sm text-gray-900">{escrowModal.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">by {escrowModal.seller}</p>
                <p className="font-bold text-orange-600 mt-1">
                  ₦{(escrowModal.priceKobo / 100).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Payment breakdown */}
            <div className="border border-gray-100 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Item price</span>
                <span>₦{(escrowModal.priceKobo / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Caution fee (5%)</span>
                <span>₦{(escrowModal.priceKobo * 0.05 / 100).toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
                <span>Total to stake</span>
                <span>₦{(escrowModal.priceKobo * 1.05 / 100).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              <p className="font-medium mb-1">How this works:</p>
              <p>Your funds will be locked in your DSME wallet. The seller completes work in milestones. You approve each stage to release payment. Your caution fee is returned on completion.</p>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setEscrowModal(null)}>
                Cancel
              </Button>
              <Button className="flex-1" loading={loading} onClick={handleInitiateTransaction}>
                Create Escrow
              </Button>
            </div>
            {toast && <p className="text-xs text-center text-orange-600">{toast}</p>}
          </div>
        )}
      </Modal>
    </>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <StoreFront />
    </AppProvider>
  );
}
