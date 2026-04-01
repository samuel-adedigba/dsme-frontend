"use client";
// src/app/admin/(dashboard)/disputes/page.js
import { useState, useEffect, useCallback } from "react";
import { ExternalLink, Scale, CheckCircle2, AlertTriangle } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { Button, Spinner, Modal, EmptyState } from "@/components/ui";

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState(null); // dispute object
  const [resolution, setResolution] = useState("release_to_seller");
  const [adminNotes, setAdminNotes] = useState("");
  const [resolving, setResolving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.getDisputes()
      .then((r) => setDisputes(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleResolve = async () => {
    if (!adminNotes.trim() || adminNotes.length < 5) {
      setMsg("Please add admin notes before resolving.");
      return;
    }
    setResolving(true);
    setMsg("");
    try {
      await adminAPI.resolveDispute({
        transaction_id: resolveModal.id,
        resolution,
        admin_notes: adminNotes,
      });
      setResolveModal(null);
      setAdminNotes("");
      setResolution("release_to_seller");
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Resolution failed.");
    } finally {
      setResolving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Disputed Transactions</h1>

      {disputes.length === 0 ? (
        <EmptyState icon={<CheckCircle2 size={44} className="text-green-500" />} title="No active disputes" description="All disputes have been resolved." />
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => {
            const price      = Number(d.price_kobo || d.priceKobo || 0);
            const cautionFee = Number(d.caution_fee_kobo || d.cautionFeeKobo || 0);
            const latestDispute = Array.isArray(d.disputes) && d.disputes.length > 0
              ? [...d.disputes].sort(
                  (a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0)
                )[0]
              : null;
            const disputedStep =
              latestDispute?.milestone?.description ||
              d.disputed_milestone ||
              d.disputedMilestone ||
              "Not specified";
            const buyerReason =
              latestDispute?.reason ||
              d.reason ||
              "No buyer reason was provided.";
            const zohoTicket =
              latestDispute?.zohoTicketId ||
              latestDispute?.zoho_ticket_id ||
              d.zoho_ticket_id ||
              d.zohoTicketId;
            return (
              <div key={d.id} className="card p-5 border-red-100">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{d.item_name || d.itemName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Buyer: <strong>{d.buyer_name || d.buyer?.fullName}</strong> ·
                      Seller: <strong>{d.seller_name || d.seller?.fullName}</strong>
                    </p>
                  </div>
                  <Button size="sm" variant="danger" onClick={() => setResolveModal(d)}>
                    <Scale size={13} />
                    Resolve
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3 text-xs">
                  {[
                    ["Item Price", `₦${(price / 100).toLocaleString()}`],
                    ["Caution Fee (each)", `₦${(cautionFee / 100).toLocaleString()}`],
                    ["Disputed Step", disputedStep],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-400">{k}</p>
                      <p className="font-medium text-gray-900 mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-red-50 rounded-lg p-3 text-xs">
                  <p className="font-medium text-red-700 mb-1">Buyer&apos;s Reason:</p>
                  <p className="text-red-600">{buyerReason}</p>
                </div>

                {zohoTicket && (
                  <a
                    href={`https://crm.zoho.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                  >
                    <ExternalLink size={11} />
                    Zoho Ticket: {zohoTicket}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve modal */}
      <Modal open={!!resolveModal} onClose={() => { setResolveModal(null); setAdminNotes(""); setMsg(""); }} title="Resolve Dispute" maxWidth="max-w-lg">
        {resolveModal && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
              <p className="font-medium mb-1 inline-flex items-center gap-1">
                <AlertTriangle size={12} />
                Resolution consequences:
              </p>
              <p><strong>Release to seller:</strong> buyer&apos;s caution fee is forfeited. Remaining funds go to seller.</p>
              <p className="mt-1"><strong>Refund to buyer:</strong> seller&apos;s caution fee is forfeited. All funds returned to buyer.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Resolution</label>
              {[
                { value: "release_to_seller", label: "Release funds to seller", desc: "Buyer's claim is invalid. Buyer forfeits caution fee." },
                { value: "refund_to_buyer", label: "Refund buyer", desc: "Seller failed to deliver. Seller forfeits caution fee." },
              ].map((r) => (
                <label key={r.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  resolution === r.value ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:bg-gray-50"
                }`}>
                  <input type="radio" name="resolution" value={r.value} checked={resolution === r.value}
                    onChange={() => setResolution(r.value)} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.label}</p>
                    <p className="text-xs text-gray-500">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Admin notes (required for audit trail)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Document your reasoning for this resolution..."
                rows={3}
                className="input resize-none"
              />
            </div>

            {msg && <p className="text-xs text-red-500">{msg}</p>}

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setResolveModal(null); setAdminNotes(""); setMsg(""); }}>Cancel</Button>
              <Button variant="danger" className="flex-1" loading={resolving} onClick={handleResolve}>Confirm Resolution</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
