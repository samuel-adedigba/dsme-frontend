"use client";
// src/components/ui/VerificationBanner.js
// Banner shown to users who haven't completed BVN verification

import { AlertTriangle, Shield, X } from "lucide-react";
import { Button } from "@/components/ui";

export function VerificationBanner({ onVerify, onDismiss, compact = false }) {
  if (compact) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-600" />
            <span className="text-sm text-orange-800 font-medium">
              BVN verification required for transactions
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={onVerify}>
            Verify Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 relative">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-white/70 hover:text-white transition"
      >
        <X size={16} />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield size={20} className="text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">Complete Account Verification</h3>
          <p className="text-orange-100 text-sm mb-3">
            Verify your BVN to unlock wallet features, make transactions, and withdraw funds to your bank account.
          </p>
          
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span>Secure Transactions</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span>Wallet Access</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span>Bank Withdrawals</span>
            </div>
          </div>
          
          <div className="mt-3">
            <Button size="sm" className="bg-gray-900 text-orange-600 hover:bg-orange-50" onClick={onVerify}>
              Verify BVN Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
