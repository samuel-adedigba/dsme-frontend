"use client";
// src/app/buyer/(dashboard)/page.js
// Shop view for logged-in buyers  same product grid, escrow modal wired to API.

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import { Modal, Button } from "@/components/ui";
import { products, CATEGORIES } from "@/data/products";
import { transactionAPI } from "@/lib/api";
import {
  DEFAULT_MILESTONE_COUNT,
  MILESTONE_COUNT_OPTIONS,
  getMilestonesForCount,
} from "@/lib/constants";
import { useApp } from "@/context/AppContext";

export default function BuyerShop() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [escrowModal, setEscrowModal] = useState(null);
  const [milestoneCount, setMilestoneCount] = useState(DEFAULT_MILESTONE_COUNT);
  const [milestones, setMilestones] = useState(getMilestonesForCount(DEFAULT_MILESTONE_COUNT));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const { user } = useApp();
  const router = useRouter();

  const filtered = useMemo(() =>
    activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const totalPercentage = milestones.reduce((sum, milestone) => {
    const value = Number(milestone.percentage);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  const handleMilestoneCountChange = (countValue) => {
    const count = Number(countValue);
    setMilestoneCount(count);
    setMilestones(getMilestonesForCount(count));
  };

  const updateMilestone = (index, field, value) => {
    setMilestones((prev) =>
      prev.map((milestone, milestoneIndex) =>
        milestoneIndex === index
          ? {
              ...milestone,
              [field]: value,
            }
          : milestone
      )
    );
  };

  const handleInitiate = async () => {
    if (!escrowModal) return;
    if (totalPercentage !== 100) {
      setMsg("Milestone percentages must sum to 100%.");
      return;
    }

    const hasInvalidMilestone = milestones.some((milestone) => {
      const value = Number(milestone.percentage);
      return !milestone.description.trim() || !Number.isFinite(value) || value <= 0;
    });

    if (hasInvalidMilestone) {
      setMsg("Each milestone needs a description and a percentage greater than 0.");
      return;
    }

    setLoading(true);
    setMsg("");
    try {
      const res = await transactionAPI.create({
        item_name: escrowModal.name,
        item_description: escrowModal.description,
        price_kobo: escrowModal.priceKobo,
        buyer_email: user.email,
        caution_rate: 0.05,
        milestones: milestones.map((milestone, index) => ({
          description: milestone.description.trim(),
          percentage: Number(milestone.percentage),
          order_index: index,
        })),
      });
      const txId = res.data.data.transaction.id;
      setEscrowModal(null);
      setMilestoneCount(DEFAULT_MILESTONE_COUNT);
      setMilestones(getMilestonesForCount(DEFAULT_MILESTONE_COUNT));
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

            <div className="border border-gray-100 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium text-gray-600">Milestones</label>
                <select
                  value={milestoneCount}
                  onChange={(event) => handleMilestoneCountChange(event.target.value)}
                  className="input w-28 h-9 text-xs"
                >
                  {MILESTONE_COUNT_OPTIONS.map((count) => (
                    <option key={count} value={count}>
                      {count} milestone{count > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {milestones.map((milestone, index) => (
                  <div key={`milestone-${index}`} className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 text-xs text-gray-400">{index + 1}</span>
                    <input
                      value={milestone.description}
                      onChange={(event) => updateMilestone(index, "description", event.target.value)}
                      placeholder={`Milestone ${index + 1} description`}
                      className="input col-span-7 h-9 text-xs"
                    />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={milestone.percentage}
                      onChange={(event) => updateMilestone(index, "percentage", event.target.value)}
                      className="input col-span-3 h-9 text-xs"
                    />
                    <span className="col-span-1 text-xs text-gray-500">%</span>
                  </div>
                ))}
              </div>

              <p className={`text-xs ${totalPercentage === 100 ? "text-green-600" : "text-red-500"}`}>
                Total: {totalPercentage}% (must be 100%)
              </p>
            </div>

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
