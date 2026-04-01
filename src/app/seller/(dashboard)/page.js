"use client";
// src/app/seller/(dashboard)/page.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Package, Wallet, AlertTriangle, CheckCircle } from "lucide-react";
import { transactionAPI, walletAPI } from "@/lib/api";
import { StatusBadge, Spinner } from "@/components/ui";
import { products } from "@/data/products";
import { useApp } from "@/context/AppContext";

export default function SellerOverview() {
  const { user } = useApp();
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([transactionAPI.getAll(), walletAPI.getWallet()])
      .then(([txRes, walletRes]) => {
        setTransactions(txRes.data.data || []);
        setWallet(walletRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  const available = Number(wallet?.availableBalanceKobo || wallet?.available_balance_kobo || 0);
  const locked    = Number(wallet?.lockedBalanceKobo    || wallet?.locked_balance_kobo    || 0);
  const active    = transactions.filter((t) => ["STAKED", "AWAITING_APPROVAL", "MILESTONE_APPROVED", "AWAITING_SELLER_STAKE"].includes(t.status));
  const completed = transactions.filter((t) => t.status === "COMPLETED");
  const disputed  = transactions.filter((t) => t.status === "DISPUTED");

  // My linked products from seed data
  const myEmail = user?.email;
  const myProducts = products.filter((p) => p.sellerEmail === myEmail);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.fullName || user?.full_name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Available", value: `₦${(available / 100).toLocaleString()}`, icon: <Wallet size={18} className="text-green-500" />, color: "text-green-600" },
          { label: "Locked", value: `₦${(locked / 100).toLocaleString()}`, icon: <Package size={18} className="text-yellow-500" />, color: "text-yellow-600" },
          { label: "Active", value: active.length, icon: <CheckCircle size={18} className="text-blue-500" />, color: "text-blue-600" },
          { label: "Disputed", value: disputed.length, icon: <AlertTriangle size={18} className="text-red-400" />, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center justify-between mb-1">{s.icon}<span className="text-xs text-gray-400">{s.label}</span></div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* My listings */}
      {myProducts.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">My Listed Products</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {myProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <img src={p.image} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-orange-600">₦{(p.priceKobo / 100).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-gray-900">Recent Transactions</h3>
          <Link href="/seller/transactions" className="text-xs text-orange-500 hover:underline">View all</Link>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <Link key={tx.id} href={`/seller/transactions/${tx.id}`}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded px-1 transition group">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.item_name || tx.itemName}</p>
                  <p className="text-xs text-gray-400">{tx.buyer?.fullName || tx.buyer_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={tx.status} />
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-orange-500 transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
