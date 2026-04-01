"use client";
// src/components/ui/index.js
// Reusable atomic UI components used throughout the app.

import clsx from "clsx";
import { Loader2, X } from "lucide-react";

// ── BUTTON ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = "primary", size = "md", loading, className, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white",
    secondary: "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    ghost: "hover:bg-gray-100 text-gray-600",
    outline: "border border-orange-500 text-orange-500 hover:bg-orange-50",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
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
}

// ── STATUS BADGE ──────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  INITIATED:              "bg-gray-100 text-gray-600",
  AWAITING_BUYER_STAKE:   "bg-yellow-100 text-yellow-700",
  AWAITING_SELLER_STAKE:  "bg-yellow-100 text-yellow-700",
  STAKED:                 "bg-blue-100 text-blue-700",
  AWAITING_APPROVAL:      "bg-purple-100 text-purple-700",
  MILESTONE_APPROVED:     "bg-indigo-100 text-indigo-700",
  COMPLETED:              "bg-green-100 text-green-700",
  DISPUTED:               "bg-red-100 text-red-700",
  RESOLVED:               "bg-teal-100 text-teal-700",
};

const STATUS_LABELS = {
  INITIATED:              "Initiated",
  AWAITING_BUYER_STAKE:   "Awaiting Your Payment",
  AWAITING_SELLER_STAKE:  "Awaiting Seller Stake",
  STAKED:                 "Active",
  AWAITING_APPROVAL:      "Proof Submitted",
  MILESTONE_APPROVED:     "Milestone Approved",
  COMPLETED:              "Completed",
  DISPUTED:               "Disputed",
  RESOLVED:               "Resolved",
};

export function StatusBadge({ status }) {
  return (
    <span className={clsx("badge", STATUS_STYLES[status] || "bg-gray-100 text-gray-600")}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ── SPINNER ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return <Loader2 size={size} className="animate-spin text-orange-500" />;
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = "max-w-md" }) {
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
}

// ── TOAST (simple) ────────────────────────────────────────────────────────────
export function Toast({ message, type = "success", onClose }) {
  if (!message) return null;
  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error:   "bg-red-50 border-red-200 text-red-800",
    info:    "bg-blue-50 border-blue-200 text-blue-800",
  };
  return (
    <div className={clsx("fixed top-4 right-4 z-50 border rounded-lg px-4 py-3 text-sm flex items-center gap-3 shadow-md", styles[type])}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ── INPUT FIELD ───────────────────────────────────────────────────────────────
export function Input({ label, error, className, ...props }) {
  return (
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
}

// ── SELECT ────────────────────────────────────────────────────────────────────
export function Select({ label, error, children, className, ...props }) {
  return (
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
}
