"use client";
// src/app/buyer/(dashboard)/wallet/page.js

import { useState, useEffect, useCallback } from "react";
import { Wallet, ArrowDownLeft, ArrowUpRight, Copy, RefreshCw, CreditCard } from "lucide-react";
import { walletAPI } from "@/lib/api";
import { Button, Spinner, EmptyState, Modal, Input } from "@/components/ui";

const LEDGER_COLORS = {
  DEPOSIT:               "bg-green-100 text-green-700",
  LOCK:                  "bg-yellow-100 text-yellow-700",
  UNLOCK:                "bg-blue-100 text-blue-700",
  MILESTONE_RELEASE:     "bg-purple-100 text-purple-700",
  WITHDRAWAL_PENDING:    "bg-orange-100 text-orange-700",
  WITHDRAWAL_CONFIRMED:  "bg-gray-100 text-gray-600",
  WITHDRAWAL_FAILED:     "bg-red-100 text-red-700",
  FORFEITURE:            "bg-red-100 text-red-700",
};

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await walletAPI.getWallet();
      setWallet(res.data.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async () => {
    const kobo = Math.round(parseFloat(withdrawAmount) * 100);
    if (!kobo || kobo < 10000) { setMsg({ text: "Minimum withdrawal is ₦100.", type: "error" }); return; }
    setWithdrawing(true);
    setMsg({ text: "", type: "" });
    try {
      await walletAPI.withdraw(kobo);
      setMsg({ text: "Withdrawal initiated. It will arrive within minutes.", type: "success" });
      setWithdrawModal(false);
      setWithdrawAmount("");
      load();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Withdrawal failed.", type: "error" });
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;
  if (!wallet) return <EmptyState icon={<CreditCard size={44} className="text-gray-400" />} title="Wallet not found" description="Contact support if this persists." />;

  const available = Number(wallet.availableBalanceKobo || wallet.available_balance_kobo || 0);
  const locked    = Number(wallet.lockedBalanceKobo    || wallet.locked_balance_kobo    || 0);
  const ledger    = wallet.recent_ledger || wallet.ledger || [];
  const dva       = wallet.dvaAccountNumber || wallet.dva_account_number;
  const bank      = wallet.dvaBankName     || wallet.dva_bank_name;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900">My Wallet</h1>

      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-sm text-orange-100 mb-1">Available Balance</p>
          <p className="text-2xl font-bold">₦{(available / 100).toLocaleString()}</p>
          <p className="text-xs text-orange-200 mt-2">Free to use or withdraw</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Locked in Escrow</p>
          <p className="text-2xl font-bold text-gray-900">₦{(locked / 100).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">Released when approved</p>
        </div>
      </div>

      {/* DVA top-up section */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
          <ArrowDownLeft size={16} className="text-green-500" />
          Top Up Your Wallet
        </h3>
        {dva ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Transfer to this account to add funds instantly:</p>
            <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-mono font-bold text-gray-900 text-lg">{dva}</p>
                <p className="text-xs text-gray-500">{bank}</p>
              </div>
              <button onClick={() => copy(dva)} className="text-xs text-orange-500 flex items-center gap-1 hover:underline">
                <Copy size={12} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-gray-400">Any amount transferred here will reflect in your available balance within seconds.</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">DVA not generated yet. Please verify your BVN in settings.</p>
        )}
      </div>

      {/* Withdraw */}
      <div className="card p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-gray-900">Withdraw to Bank</h3>
          <p className="text-xs text-gray-500 mt-0.5">Send available balance to your registered account</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setWithdrawModal(true)}
          disabled={available < 10000}>
          <ArrowUpRight size={14} />
          Withdraw
        </Button>
      </div>

      {/* Ledger */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-gray-900">Recent Activity</h3>
          <button onClick={load} className="text-gray-400 hover:text-gray-600"><RefreshCw size={15} /></button>
        </div>

        {ledger.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No transactions yet. Top up your wallet to get started.</p>
        ) : (
          <div className="space-y-2">
            {ledger.map((entry) => {
              const amount = Number(entry.amountKobo || entry.amount_kobo || 0);
              const isCredit = amount > 0;
              return (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`badge ${LEDGER_COLORS[entry.type] || "bg-gray-100 text-gray-600"}`}>
                      {entry.type?.replace(/_/g, " ")}
                    </span>
                    <p className="text-xs text-gray-500 hidden sm:block truncate max-w-[180px]">
                      {entry.description || entry.transaction?.itemName || entry.transaction?.item_name || ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${isCredit ? "text-green-600" : "text-red-500"}`}>
                      {isCredit ? "+" : ""}₦{(Math.abs(amount) / 100).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(entry.createdAt || entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdraw modal */}
      <Modal open={withdrawModal} onClose={() => setWithdrawModal(false)} title="Withdraw Funds">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Available: <span className="font-semibold text-gray-900">₦{(available / 100).toLocaleString()}</span>
          </p>
          <Input
            label="Amount (NGN)"
            type="number"
            placeholder="e.g. 5000"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            min="100"
          />
          {msg.text && (
            <p className={`text-xs ${msg.type === "error" ? "text-red-500" : "text-green-600"}`}>{msg.text}</p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setWithdrawModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={withdrawing} onClick={handleWithdraw}>Withdraw</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
