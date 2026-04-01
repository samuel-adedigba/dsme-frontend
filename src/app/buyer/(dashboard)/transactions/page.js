"use client";
// src/app/buyer/(dashboard)/transactions/page.js

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Package } from "lucide-react";
import { transactionAPI } from "@/lib/api";
import { StatusBadge, Spinner, EmptyState } from "@/components/ui";

export default function BuyerTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([transactionAPI.getAll(), transactionAPI.getPending()])
      .then(([allRes, pendingRes]) => {
        setTransactions(allRes.data.data || []);
        setPending(pendingRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">My Transactions</h1>

      {/* Pending invitations */}
      {pending.length > 0 && (
        <div className="card p-5 border-orange-200 bg-orange-50">
          <h3 className="font-semibold text-sm text-orange-800 mb-3 flex items-center gap-2">
            <Clock size={15} />
            Pending Invitations ({pending.length})
          </h3>
          <div className="space-y-2">
            {pending.map((tx) => (
              <Link
                key={tx.id}
                href={`/buyer/transactions/${tx.id}`}
                className="flex items-center justify-between bg-white rounded-lg p-3 hover:bg-orange-50 transition"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900">{tx.item_name || tx.itemName}</p>
                  <p className="text-xs text-gray-500">
                    from {tx.seller?.fullName || tx.seller_name} · ₦{((Number(tx.buyer_total_kobo || tx.buyerTotalKobo)) / 100).toLocaleString()} to stake
                  </p>
                </div>
                <ArrowRight size={16} className="text-orange-500" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All transactions */}
      {transactions.length === 0 ? (
        <EmptyState
          icon={<Package size={44} className="text-gray-400" />}
          title="No transactions yet"
          description="Browse the shop and make your first escrow purchase."
          action={<Link href="/buyer" className="btn-primary text-sm px-4 py-2 rounded-lg inline-block">Shop Now</Link>}
        />
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const price = Number(tx.price_kobo || tx.priceKobo || 0);
            return (
              <Link
                key={tx.id}
                href={`/buyer/transactions/${tx.id}`}
                className="card p-4 flex items-center justify-between hover:shadow-md transition group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{tx.item_name || tx.itemName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {tx.seller?.fullName || tx.seller_name} · {new Date(tx.created_at || tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <StatusBadge status={tx.status} />
                  <span className="font-semibold text-sm text-gray-900">₦{(price / 100).toLocaleString()}</span>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-500 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
