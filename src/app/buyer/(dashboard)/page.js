"use client";
// src/app/buyer/(dashboard)/page.js
// Shop view for logged-in buyers — same product grid, escrow modal wired to API.

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import PublicNavbar from "@/components/layout/PublicNavbar";
import ProductCard from "@/components/ui/ProductCard";
import { Modal, Button } from "@/components/ui";
import { products, CATEGORIES } from "@/data/products";
import { transactionAPI } from "@/lib/api";
import { useApp } from "@/context/AppContext";

export default function BuyerShop() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [escrowModal, setEscrowModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const { user } = useApp();
  const router = useRouter();

  const filtered = useMemo(() =>
    activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const handleInitiate = async () => {
    if (!escrowModal) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await transactionAPI.create({
        item_name: escrowModal.name,
        item_description: escrowModal.description,
        price_kobo: escrowModal.priceKobo,
        buyer_email: user.email,
        caution_rate: 0.05,
        milestones: [
          { description: "Materials sourced / initial work", percentage: 30, order_index: 0 },
          { description: "Final delivery confirmed", percentage: 70, order_index: 1 },
        ],
      });
      const txId = res.data.data.transaction.id;
      setEscrowModal(null);
      router.push(`/buyer/transactions/${txId}`);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to create transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Category strip reused from public navbar */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeCategory === cat
                  ? "bg-orange-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onBuyEscrow={setEscrowModal} />
        ))}
      </div>

      <Modal open={!!escrowModal} onClose={() => setEscrowModal(null)} title="Start Escrow Transaction" maxWidth="max-w-md">
        {escrowModal && (
          <div className="space-y-4">
            <div className="flex gap-3 p-3 bg-orange-50 rounded-lg">
              <img src={escrowModal.image} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{escrowModal.name}</p>
                <p className="text-xs text-gray-500">{escrowModal.seller}</p>
                <p className="font-bold text-orange-600 mt-1">₦{(escrowModal.priceKobo / 100).toLocaleString()}</p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 text-sm">
              {[
                ["Item price", `₦${(escrowModal.priceKobo / 100).toLocaleString()}`],
                ["Caution fee (5%)", `₦${(escrowModal.priceKobo * 0.05 / 100).toLocaleString()}`],
                ["Total to stake", `₦${(escrowModal.priceKobo * 1.05 / 100).toLocaleString()}`],
              ].map(([label, val], i) => (
                <div key={label} className={`flex justify-between px-3 py-2 ${i === 2 ? "font-semibold" : "text-gray-600"}`}>
                  <span>{label}</span><span>{val}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-blue-700 bg-blue-50 rounded-lg p-3">
              Top up your wallet first, then confirm to lock funds. You approve each milestone before the seller is paid.
            </p>

            {msg && <p className="text-xs text-red-500">{msg}</p>}

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setEscrowModal(null)}>Cancel</Button>
              <Button className="flex-1" loading={loading} onClick={handleInitiate}>Confirm Escrow</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
