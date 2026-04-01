"use client";
// src/app/admin/(dashboard)/page.js
import { useState, useEffect } from "react";
import { CheckCircle2, Lock, AlertTriangle, Flag, Banknote, Landmark, Wallet, Store, ShoppingBag } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { Spinner } from "@/components/ui";

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then((r) => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  const cards = [
    { label: "Completed", value: stats?.completed_count || 0, icon: <CheckCircle2 size={18} />, color: "text-green-600 bg-green-50" },
    { label: "Active (Staked)", value: stats?.active_count || 0, icon: <Lock size={18} />, color: "text-blue-600 bg-blue-50" },
    { label: "Disputed", value: stats?.disputed_count || 0, icon: <AlertTriangle size={18} />, color: "text-red-600 bg-red-50" },
    { label: "Resolved", value: stats?.resolved_count || 0, icon: <Flag size={18} />, color: "text-gray-600 bg-gray-50" },
    { label: "Total Released", value: `₦${(Number(stats?.total_released_kobo || 0) / 100).toLocaleString()}`, icon: <Banknote size={18} />, color: "text-purple-600 bg-purple-50" },
    { label: "Total Locked", value: `₦${(Number(stats?.total_locked_kobo || 0) / 100).toLocaleString()}`, icon: <Landmark size={18} />, color: "text-orange-600 bg-orange-50" },
    { label: "Total Available", value: `₦${(Number(stats?.total_available_kobo || 0) / 100).toLocaleString()}`, icon: <Wallet size={18} />, color: "text-teal-600 bg-teal-50" },
    { label: "Sellers", value: stats?.seller_count || 0, icon: <Store size={18} />, color: "text-indigo-600 bg-indigo-50" },
    { label: "Buyers", value: stats?.buyer_count || 0, icon: <ShoppingBag size={18} />, color: "text-pink-600 bg-pink-50" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Platform Overview</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`card p-5 ${c.color.split(" ")[1]}`}>
            <div className={`mb-2 ${c.color.split(" ")[0]}`}>{c.icon}</div>
            <p className={`text-xl font-bold ${c.color.split(" ")[0]}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
