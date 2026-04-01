"use client";
// src/app/buyer/(dashboard)/transactions/[id]/page.js
// The most important screen  shows FSM state, milestones, stake button,
// approve/dispute actions. This is where the DSME flow plays out for the buyer.

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertTriangle, Shield, Copy, ArrowLeft, Upload, Clock } from "lucide-react";
import { transactionAPI, milestoneAPI, walletAPI } from "@/lib/api";
import { StatusBadge, Button, Spinner, Modal, Input } from "@/components/ui";

export default function BuyerTransactionDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [tx, setTx] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staking, setStaking] = useState(false);
  const [disputeModal, setDisputeModal] = useState(null); // milestone id
  const [disputeReason, setDisputeReason] = useState("");
  const [approving, setApproving] = useState(null);  // milestone id
  const [disputing, setDisputing] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, walletRes] = await Promise.all([transactionAPI.getById(id), walletAPI.getWallet()]);
      setTx(txRes.data.data);
      setWallet(walletRes.data.data);
    } catch (err) {
      setMsg({ text: "Could not load transaction.", type: "error" });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStake = async () => {
    setStaking(true);
    setMsg({ text: "", type: "" });
    try {
      await transactionAPI.stakeBuyer(id);
      setMsg({ text: "Funds staked successfully! Transaction is now active. Begin working on the first milestone.", type: "success" });
      load();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Staking failed.", type: "error" });
    } finally {
      setStaking(false);
    }
  };

  const handleApprove = async (milestoneId) => {
    setApproving(milestoneId);
    setMsg({ text: "", type: "" });
    try {
      await milestoneAPI.approve(milestoneId);
      setMsg({ text: "Milestone approved! Payment released to seller.", type: "success" });
      load();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Approval failed.", type: "error" });
    } finally {
      setApproving(null);
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim() || disputeReason.length < 10) {
      setMsg({ text: "Please provide a detailed reason (at least 10 characters).", type: "error" });
      return;
    }
    setDisputing(true);
    try {
      await milestoneAPI.dispute({ milestone_id: disputeModal, reason: disputeReason });
      setMsg({ text: "Dispute raised. All funds are frozen pending admin review.", type: "info" });
      setDisputeModal(null);
      setDisputeReason("");
      load();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Dispute failed.", type: "error" });
    } finally {
      setDisputing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;
  if (!tx) return <div className="text-center py-20 text-gray-400">Transaction not found.</div>;

  const price      = Number(tx.price_kobo     || tx.priceKobo     || 0);
  const cautionFee = Number(tx.caution_fee_kobo || tx.cautionFeeKobo || 0);
  const totalStake = Number(tx.buyer_total_kobo || tx.buyerTotalKobo || 0);
  const available  = Number(wallet?.availableBalanceKobo || wallet?.available_balance_kobo || 0);
  const milestones = tx.milestones || [];
  const dva = wallet?.dvaAccountNumber || wallet?.dva_account_number;
  const bank = wallet?.dvaBankName || wallet?.dva_bank_name;
  const hasEnough  = available >= totalStake;
  const currentMilestoneIdx = tx.current_milestone_index ?? tx.currentMilestoneIndex ?? 0;
  const activeMilestone = milestones.find((m) => (m.order_index ?? m.orderIndex) === currentMilestoneIdx);
  const isAwaitingSellerStake = tx.status === "AWAITING_SELLER_STAKE";
  const isAwaitingBuyerStake  = tx.status === "AWAITING_BUYER_STAKE";
  const isAwaitingApproval    = tx.status === "AWAITING_APPROVAL";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 truncate">{tx.item_name || tx.itemName}</h1>
          <p className="text-xs text-gray-500">
            Seller`s name: {tx.seller_name || tx.seller?.fullName}
          </p>
        </div>
        <StatusBadge status={tx.status} />
      </div>

      {/* Message */}
      {msg.text && (
        <div className={`rounded-lg p-3 text-sm ${
          msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" :
          msg.type === "info"    ? "bg-blue-50 text-blue-700 border border-blue-200" :
          "bg-red-50 text-red-600 border border-red-200"
        }`}>
          {msg.text}
        </div>
      )}

      {/* Payment breakdown */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm text-gray-900 mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          {[
            ["Item price", `₦${(price / 100).toLocaleString()}`],
            ["Caution fee (5%)", `₦${(cautionFee / 100).toLocaleString()}`],
            ["Total to stake", `₦${(totalStake / 100).toLocaleString()}`],
          ].map(([k, v], i) => (
            <div key={k} className={`flex justify-between ${i === 2 ? "font-bold pt-2 border-t border-gray-100" : "text-gray-600"}`}>
              <span>{k}</span><span>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AWAITING SELLER ACCEPTANCE  shown initially */}
      {isAwaitingSellerStake && (
        <div className="card p-5 border-blue-200 bg-blue-50">
          <h3 className="font-semibold text-sm text-blue-800 mb-2 flex items-center gap-2">
            <Clock size={15} className="text-blue-500" />
            Awaiting Seller Acceptance
          </h3>
          <p className="text-xs text-blue-700 mb-3">
            <strong>{tx.seller_name || tx.seller?.fullName}</strong> has been notified and must stake their caution fee to accept this transaction. This usually takes a few minutes.
          </p>
          <div className="text-xs text-blue-600 bg-white rounded p-2 border border-blue-100">
            Once the seller accepts, you'll be prompted to lock your funds for the escrow.
          </div>
        </div>
      )}

      {/* STAKE ACTION  shown when awaiting buyer */}
      {isAwaitingBuyerStake && (
        <div className="card p-5 border-orange-200">
          <h3 className="font-semibold text-sm text-orange-800 mb-3 flex items-center gap-2">
            <Shield size={15} className="text-orange-500" />
            Ready to Activate: Stake Your Funds
          </h3>

          <p className="text-xs text-orange-700 mb-3">
            <strong>{tx.seller_name || tx.seller?.fullName}</strong> has accepted! Now lock your funds to activate the transaction.
          </p>

          {/* Wallet balance */}
          <div className={`rounded-lg p-3 mb-3 text-sm ${hasEnough ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            <p>Your wallet balance: <strong>₦{(available / 100).toLocaleString()}</strong></p>
            {!hasEnough && (
              <p className="mt-1">
                You need ₦{((totalStake - available) / 100).toLocaleString()} more. Top up your wallet below.
              </p>
            )}
          </div>

          {/* DVA top-up */}
          {!hasEnough && dva && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-600 mb-2 font-medium">Top up your wallet (transfer to this account):</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono font-bold text-gray-900">{dva}</p>
                  <p className="text-xs text-gray-500">{bank}</p>
                </div>
                <button onClick={() => copy(dva)} className="text-xs text-orange-500 flex items-center gap-1">
                  <Copy size={12} />{copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            loading={staking}
            disabled={!hasEnough}
            onClick={handleStake}
          >
            {hasEnough ? `Stake ₦${(totalStake / 100).toLocaleString()}` : "Top up wallet first"}
          </Button>
        </div>
      )}

      {/* Milestones */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm text-gray-900 mb-4">Milestones</h3>
        <div className="space-y-4">
          {milestones.map((m, idx) => {
            const isActive    = (m.order_index ?? m.orderIndex) === currentMilestoneIdx;
            const isApproved  = m.is_approved ?? m.isApproved;
            const needsAction = isAwaitingApproval && isActive;
            const releaseAmt  = Math.round((m.percentage / 100) * price);

            return (
              <div
                key={m.id}
                className={`border rounded-lg p-4 ${
                  isApproved   ? "border-green-200 bg-green-50" :
                  needsAction  ? "border-orange-300 bg-orange-50" :
                  isActive     ? "border-blue-200 bg-blue-50" :
                  "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">Milestone {idx + 1}</span>
                      <span className="text-xs text-gray-400">· {m.percentage}% = ₦{(releaseAmt / 100).toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{m.description}</p>

                    {/* Proof image if submitted */}
                    {(m.proof_url || m.proofUrl) && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Seller's proof:</p>
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}/api/v1/files/proof/${(m.proof_url || m.proofUrl).split("/").pop()}`}
                          alt="Milestone proof"
                          className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                        {(m.proof_notes || m.proofNotes) && (
                          <p className="text-xs text-gray-500 mt-1 italic">{m.proof_notes || m.proofNotes}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status indicator */}
                  {isApproved ? (
                    <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                  ) : isActive ? (
                    <div className="w-4 h-4 rounded-full border-2 border-orange-400 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
                  )}
                </div>

                {/* Buyer actions  approve or dispute */}
                {needsAction && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-orange-200">
                    <Button
                      size="sm"
                      className="flex-1"
                      loading={approving === m.id}
                      onClick={() => handleApprove(m.id)}
                    >
                      <CheckCircle size={13} />
                      Approve & Release ₦{(releaseAmt / 100).toLocaleString()}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="flex-1"
                      onClick={() => setDisputeModal(m.id)}
                    >
                      <XCircle size={13} />
                      Dispute
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed state */}
      {tx.status === "COMPLETED" && (
        <div className="card p-5 bg-green-50 border-green-200 text-center">
          <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-800">Transaction Completed!</p>
          <p className="text-sm text-green-600 mt-1">Your caution fee has been returned to your wallet.</p>
        </div>
      )}

      {/* Disputed state */}
      {tx.status === "DISPUTED" && (
        <div className="card p-5 bg-red-50 border-red-200 text-center">
          <AlertTriangle size={32} className="text-red-500 mx-auto mb-2" />
          <p className="font-semibold text-red-800">Dispute Under Review</p>
          <p className="text-sm text-red-600 mt-1">All funds are frozen. An admin will review and contact both parties.</p>
        </div>
      )}

      {/* Dispute modal */}
      <Modal open={!!disputeModal} onClose={() => { setDisputeModal(null); setDisputeReason(""); }} title="Raise a Dispute">
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
            <p className="font-medium mb-1 inline-flex items-center gap-1">
              <AlertTriangle size={12} />
              Caution
            </p>
            <p>Raising a dispute freezes all remaining funds. If the admin rules against you, your caution fee will be forfeited. Only dispute if you have a valid reason.</p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">Reason for dispute</label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Describe clearly why you are disputing this milestone..."
              rows={4}
              className="input resize-none"
            />
            <p className="text-[10px] text-gray-400">{disputeReason.length} / 500 characters</p>
          </div>
          {msg.text && msg.type === "error" && (
            <p className="text-xs text-red-500">{msg.text}</p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => { setDisputeModal(null); setDisputeReason(""); }}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={disputing} onClick={handleDispute}>Confirm Dispute</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
