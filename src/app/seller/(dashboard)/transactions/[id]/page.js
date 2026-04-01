"use client";
// src/app/seller/(dashboard)/transactions/[id]/page.js
// Key seller actions: stake caution fee, upload milestone proof via base64.

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { transactionAPI, milestoneAPI, walletAPI } from "@/lib/api";
import { StatusBadge, Button, Spinner, Modal } from "@/components/ui";

export default function SellerTransactionDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [tx, setTx] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staking, setStaking] = useState(false);
  const [proofModal, setProofModal] = useState(null); // milestone object
  const [proofFile, setProofFile] = useState(null);
  const [proofNotes, setProofNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const fileRef = useRef();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, walletRes] = await Promise.all([transactionAPI.getById(id), walletAPI.getWallet()]);
      setTx(txRes.data.data);
      setWallet(walletRes.data.data);
    } catch { setMsg({ text: "Could not load transaction.", type: "error" }); }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleStake = async () => {
    setStaking(true);
    setMsg({ text: "", type: "" });
    try {
      await transactionAPI.stakeSeller(id);
      setMsg({ text: "Caution fee staked. Transaction is now active. You may begin work.", type: "success" });
      load();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Staking failed.", type: "error" });
    } finally { setStaking(false); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProofFile({ base64: reader.result, mime: file.type, name: file.name });
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!proofFile) { setMsg({ text: "Please select an image file.", type: "error" }); return; }
    setSubmitting(true);
    setMsg({ text: "", type: "" });
    try {
      await milestoneAPI.submitProof({
        milestone_id: proofModal.id,
        image_base64: proofFile.base64,
        mime_type: proofFile.mime,
        notes: proofNotes || undefined,
      });
      setMsg({ text: "Proof submitted! Waiting for buyer to approve.", type: "success" });
      setProofModal(null);
      setProofFile(null);
      setProofNotes("");
      load();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Submission failed.", type: "error" });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;
  if (!tx) return <div className="text-center py-20 text-gray-400">Transaction not found.</div>;

  const price      = Number(tx.price_kobo || tx.priceKobo || 0);
  const stakeAmt   = Number(tx.seller_stake_kobo || tx.sellerStakeKobo || 0);
  const available  = Number(wallet?.availableBalanceKobo || wallet?.available_balance_kobo || 0);
  const milestones = tx.milestones || [];
  const hasEnough  = available >= stakeAmt;
  const currentIdx = tx.current_milestone_index ?? tx.currentMilestoneIndex ?? 0;
  const activeMilestone = milestones.find((m) => (m.order_index ?? m.orderIndex) === currentIdx);
  const canSubmitProof  = tx.status === "STAKED" || tx.status === "MILESTONE_APPROVED";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={18} /></button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 truncate">{tx.item_name || tx.itemName}</h1>
          <p className="text-xs text-gray-500">Buyer: {tx.buyer_name || tx.buyer?.fullName} · {tx.id.slice(0, 8)}...</p>
        </div>
        <StatusBadge status={tx.status} />
      </div>

      {msg.text && (
        <div className={`rounded-lg p-3 text-sm ${
          msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" :
          msg.type === "info"    ? "bg-blue-50 text-blue-700 border border-blue-200" :
          "bg-red-50 text-red-600 border border-red-200"
        }`}>{msg.text}</div>
      )}

      {/* Summary */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm text-gray-900 mb-3">Transaction Summary</h3>
        <div className="space-y-2 text-sm">
          {[
            ["Item price", `₦${(price / 100).toLocaleString()}`],
            ["Your caution fee (5%)", `₦${(stakeAmt / 100).toLocaleString()}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-gray-600"><span>{k}</span><span>{v}</span></div>
          ))}
        </div>
      </div>

      {/* Stake action */}
      {tx.status === "AWAITING_SELLER_STAKE" && (
        <div className="card p-5 border-orange-200">
          <h3 className="font-semibold text-sm text-orange-800 mb-2">Action Required: Stake Caution Fee</h3>
          <p className="text-xs text-gray-500 mb-3">
            The buyer has staked their funds. Deposit your caution fee (₦{(stakeAmt / 100).toLocaleString()}) to activate the transaction.
          </p>
          <div className={`rounded-lg p-3 mb-3 text-sm ${hasEnough ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            Wallet balance: <strong>₦{(available / 100).toLocaleString()}</strong>
            {!hasEnough && ` — need ₦${((stakeAmt - available) / 100).toLocaleString()} more`}
          </div>
          <Button className="w-full" loading={staking} disabled={!hasEnough} onClick={handleStake}>
            {hasEnough ? `Stake ₦${(stakeAmt / 100).toLocaleString()}` : "Top up wallet first"}
          </Button>
        </div>
      )}

      {/* Milestones */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm text-gray-900 mb-4">Milestones</h3>
        <div className="space-y-4">
          {milestones.map((m, idx) => {
            const isApproved  = m.is_approved ?? m.isApproved;
            const isActive    = (m.order_index ?? m.orderIndex) === currentIdx;
            const releaseAmt  = Math.round((m.percentage / 100) * price);
            const hasProof    = !!(m.proof_url || m.proofUrl);
            const canUpload   = canSubmitProof && isActive && !hasProof && tx.status !== "AWAITING_APPROVAL";

            return (
              <div key={m.id} className={`border rounded-lg p-4 ${
                isApproved  ? "border-green-200 bg-green-50" :
                isActive && tx.status === "AWAITING_APPROVAL" ? "border-purple-200 bg-purple-50" :
                isActive    ? "border-blue-200 bg-blue-50" :
                "border-gray-100"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">Milestone {idx + 1}</span>
                      <span className="text-xs text-gray-400">· {m.percentage}% = ₦{(releaseAmt / 100).toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{m.description}</p>

                    {/* Proof status */}
                    {hasProof && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-purple-600">
                        <Upload size={11} />
                        Proof submitted — awaiting buyer approval
                      </div>
                    )}
                  </div>
                  {isApproved ? (
                    <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                  ) : isActive ? (
                    <Clock size={18} className="text-blue-400 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
                  )}
                </div>

                {/* Upload proof button */}
                {canUpload && (
                  <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => setProofModal(m)}>
                    <Upload size={13} />
                    Upload Proof for This Milestone
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {tx.status === "COMPLETED" && (
        <div className="card p-5 bg-green-50 border-green-200 text-center">
          <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-800">Transaction Completed!</p>
          <p className="text-sm text-green-600 mt-1">All payments have been released to your wallet.</p>
        </div>
      )}

      {tx.status === "DISPUTED" && (
        <div className="card p-5 bg-red-50 border-red-200 text-center">
          <AlertTriangle size={32} className="text-red-500 mx-auto mb-2" />
          <p className="font-semibold text-red-800">Under Dispute</p>
          <p className="text-sm text-red-600 mt-1">Funds are frozen. An admin will review and contact both parties.</p>
        </div>
      )}

      {/* Proof upload modal */}
      <Modal open={!!proofModal} onClose={() => { setProofModal(null); setProofFile(null); setProofNotes(""); }} title="Upload Milestone Proof">
        {proofModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">{proofModal.description}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {proofModal.percentage}% = ₦{(Math.round((proofModal.percentage / 100) * price) / 100).toLocaleString()}
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Proof image (photo, receipt, screenshot)</label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                  proofFile ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-orange-400 hover:bg-orange-50"
                }`}
              >
                {proofFile ? (
                  <div>
                    <img src={proofFile.base64} className="w-32 h-24 object-cover rounded-lg mx-auto mb-2" />
                    <p className="text-xs text-green-600 font-medium">{proofFile.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Click to change</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload image</p>
                    <p className="text-xs text-gray-400">JPEG, PNG or WebP</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Notes (optional)</label>
              <textarea
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                placeholder="e.g. Fabric purchased from Balogun Market. Receipt in photo."
                rows={3}
                className="input resize-none"
              />
            </div>

            {msg.text && msg.type === "error" && <p className="text-xs text-red-500">{msg.text}</p>}

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setProofModal(null); setProofFile(null); }}>Cancel</Button>
              <Button className="flex-1" loading={submitting} disabled={!proofFile} onClick={handleSubmitProof}>Submit Proof</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
