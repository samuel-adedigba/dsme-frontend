"use client";
// src/components/ui/BvnVerificationModal.js
// Modal for BVN verification with bank selection

import { useState } from "react";
import { Shield, AlertCircle, CheckCircle, X, Loader2 } from "lucide-react";
import { authAPI } from "@/lib/api";
import { NIGERIAN_BANKS } from "@/data/banks";
import clsx from "clsx";

export function BvnVerificationModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    bvn: "",
    account_number: "",
    bank_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Local UI components to avoid circular imports
  const Button = ({ children, variant = "primary", size = "md", loading, className, ...props }) => {
    const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-orange-500 hover:bg-orange-600 text-white",
      secondary: "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
    };
    return (
      <button
        className={clsx(base, variants[variant], sizes[size], className)}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {children}
      </button>
    );
  };

  const Input = ({ label, error, className, ...props }) => (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-gray-600">{label}</label>}
      <input
        className={clsx(
          "input",
          error ? "border-red-400 ring-red-200" : "",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  const Select = ({ label, error, children, className, ...props }) => (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-gray-600">{label}</label>}
      <select
        className={clsx("input", error ? "border-red-400" : "", className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authAPI.verifyBvn(form);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      }
    } catch (err) {
      const message = err.response?.data?.message;
      if (err.response?.status === 429) {
        setError("Too many verification attempts. Please try again in 15 minutes.");
      } else if (message) {
        setError(message);
      } else {
        setError("Verification failed. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setError("");
  };

  // Local Modal component
  const Modal = ({ open, onClose, title, children, maxWidth = "max-w-lg" }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className={clsx("card w-full p-6", maxWidth)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  if (success) {
    return (
      <Modal open={open} onClose={onClose} title="Verification Successful">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">BVN Verified Successfully</h3>
          <p className="text-sm text-gray-500">Your account is now fully verified for transactions.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Complete Account Verification" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Warning banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-orange-700">
              <p className="font-medium mb-1">Verification Required</p>
              <p>You must verify your BVN to access wallet features and make transactions on DSME Market.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="BVN Number"
            type="text"
            placeholder="Enter 11-digit BVN"
            value={form.bvn}
            onChange={updateForm("bvn")}
            maxLength={11}
            pattern="[0-9]{11}"
            required
            error={error && !form.bvn.match(/^[0-9]{11}$/) ? "BVN must be 11 digits" : ""}
          />

          <Select
            label="Bank"
            value={form.bank_code}
            onChange={updateForm("bank_code")}
            required
          >
            <option value="">Select your bank</option>
            {NIGERIAN_BANKS.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </Select>

          <Input
            label="Account Number"
            type="text"
            placeholder="Enter 10-digit account number"
            value={form.account_number}
            onChange={updateForm("account_number")}
            maxLength={10}
            pattern="[0-9]{10}"
            required
            error={error && !form.account_number.match(/^[0-9]{10}$/) ? "Account number must be 10 digits" : ""}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              loading={loading} 
              type="submit"
              disabled={!form.bvn.match(/^[0-9]{11}$/) || !form.account_number.match(/^[0-9]{10}$/) || !form.bank_code}
            >
              Verify BVN
            </Button>
          </div>
        </form>

        {/* Security note */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={12} className="text-gray-400" />
            <span className="font-medium text-gray-600">Secure Verification</span>
          </div>
          <p>Your BVN is used solely for identity verification through Paystack's secure system. We do not store your BVN details.</p>
        </div>
      </div>
    </Modal>
  );
}
