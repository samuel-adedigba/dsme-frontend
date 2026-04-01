"use client";
// src/app/admin/(dashboard)/transactions/page.js
import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api";
import { StatusBadge, Spinner } from "@/components/ui";
import { TRANSACTION_STATES } from "@/lib/constants";

const FILTERS = ["All", "AWAITING_BUYER_STAKE", "STAKED", "AWAITING_APPROVAL", "COMPLETED", "DISPUTED", "RESOLVED"];

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminAPI.getAllTransactions(filter === "All" ? null : filter)
      .then((r) => setTransactions(r.data.data || []))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">All Transactions</h1>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === f ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f === "All" ? "All" : f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Item", "Seller", "Buyer", "Price", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No transactions found.</td></tr>
                ) : transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">{tx.item_name || tx.itemName}</td>
                    <td className="px-4 py-3 text-gray-600">{tx.seller?.fullName || tx.seller_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{tx.buyer?.fullName  || tx.buyer_name  || "—"}</td>
                    <td className="px-4 py-3 font-medium">₦{(Number(tx.price_kobo || tx.priceKobo || 0) / 100).toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                    <td className="px-4 py-3 text-gray-400">{new Date(tx.created_at || tx.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
