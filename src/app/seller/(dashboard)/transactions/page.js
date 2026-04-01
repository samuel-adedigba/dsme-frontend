"use client";
// src/app/seller/(dashboard)/transactions/page.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { transactionAPI } from "@/lib/api";
import { StatusBadge, Spinner, EmptyState } from "@/components/ui";

export default function SellerTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionAPI.getAll()
      .then((r) => setTransactions(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  // Separate pending invitations from active/completed transactions
  const pending = transactions.filter((t) => t.status === "AWAITING_SELLER_STAKE");
  const others = transactions.filter((t) => t.status !== "AWAITING_SELLER_STAKE");

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900">My Transactions</h1>

      {pending.length === 0 && others.length === 0 ? (
        <EmptyState icon="📋" title="No transactions yet" description="Transactions will appear here once buyers initiate escrow purchases." />
      ) : (
        <div className="space-y-5">
          {/* Pending invitations section */}
          {pending.length > 0 && (
            <div className="card p-5 border-orange-200 bg-orange-50">
              <h3 className="font-semibold text-sm text-orange-800 mb-3">
                Pending Acceptance ({pending.length})
              </h3>
              <div className="space-y-2">
                {pending.map((tx) => {
                  const price = Number(tx.price_kobo || tx.priceKobo || 0);
                  return (
                    <Link key={tx.id} href={`/seller/transactions/${tx.id}`}
                      className="card p-4 flex items-center justify-between hover:shadow-md transition group bg-white">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium text-sm text-gray-900 truncate">{tx.item_name || tx.itemName}</p>
                          <span className="bg-orange-200 text-orange-800 text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 animate-pulse">
                            Action Required
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Buyer: {tx.buyer?.fullName || tx.buyer_name} · {new Date(tx.created_at || tx.createdAt).toLocaleDateString()}
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
            </div>
          )}

          {/* Other transactions */}
          {others.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-900">All Other Transactions</h3>
              {others.map((tx) => {
                const price = Number(tx.price_kobo || tx.priceKobo || 0);
                return (
                  <Link key={tx.id} href={`/seller/transactions/${tx.id}`}
                    className="card p-4 flex items-center justify-between hover:shadow-md transition group">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{tx.item_name || tx.itemName}</p>
                      <p className="text-xs text-gray-400">
                        Buyer: {tx.buyer?.fullName || tx.buyer_name} · {new Date(tx.created_at || tx.createdAt).toLocaleDateString()}
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
      )}
    </div>
  );
}
