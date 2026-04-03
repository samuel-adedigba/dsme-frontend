"use client";
// src/app/settings/page.js
// User settings page for bank account management

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, CreditCard, CheckCircle, AlertTriangle, Bell, Settings } from "lucide-react";
import { authAPI } from "@/lib/api";
import { NIGERIAN_BANKS } from "@/data/banks";
import { Button, Input, Select, BvnVerificationModal, Spinner, NotificationPreferences } from "@/components/ui";
import { AppProvider, useApp } from "@/context/AppContext";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Loading component for before AppProvider is available
function SettingsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner size={32} />
        <p className="mt-4 text-sm text-gray-600">Loading settings...</p>
      </div>
    </div>
  );
}

function SettingsContent() {
  const { user, refreshProfile } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showNotificationPreferences, setShowNotificationPreferences] = useState(false);
  const [bankForm, setBankForm] = useState({
    account_number: "",
    bank_code: "",
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("dsme_token");
    const storedUser = localStorage.getItem("dsme_user");
    
    if (!token || !storedUser) {
      router.push("/login");
      return;
    }
    
    // Small delay to ensure context is hydrated
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  const handleBankUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await authAPI.updateBankAccount(bankForm);
      setMessage({ text: "Bank account updated successfully!", type: "success" });
      setBankForm({ account_number: "", bank_code: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update bank account";
      setMessage({ text: msg, type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const handleVerificationSuccess = async () => {
    await refreshProfile();
    setShowVerificationModal(false);
  };

  // Get user role for DashboardLayout
  const userRole = user?.role || "buyer";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your verification and bank details</p>
      </div>

      {/* Verification Status */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={16} className="text-orange-500" />
          Identity Verification
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                user?.bvnVerified ? "bg-green-100" : "bg-orange-100"
              }`}>
                {user?.bvnVerified ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <AlertTriangle size={16} className="text-orange-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">BVN Verification</p>
                <p className="text-xs text-gray-500">
                  {user?.bvnVerified ? "Verified" : "Not verified"}
                </p>
              </div>
            </div>
            {!user?.bvnVerified && (
              <Button size="sm" onClick={() => setShowVerificationModal(true)}>
                Verify Now
              </Button>
            )}
          </div>
          
          {user?.bvnVerified && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700">
                <strong>Verification Complete!</strong> Your account is fully verified for transactions and withdrawals.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
          <Bell size={16} className="text-orange-500" />
          Notification Preferences
        </h3>
        
        <p className="text-xs text-gray-500 mb-4">
          Manage how you receive notifications for different activities.
        </p>

        <Button 
          variant="outline" 
          onClick={() => setShowNotificationPreferences(true)}
          className="text-sm"
        >
          <Settings size={14} className="mr-2" />
          Configure Notifications
        </Button>
      </div>

      {/* Bank Account Management */}
      {user?.bvnVerified && (
        <div className="card p-5">
          <h3 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-orange-500" />
            Bank Account Details
          </h3>
          
          <p className="text-xs text-gray-500 mb-4">
            Update your bank account for withdrawals. Only one account can be active at a time.
          </p>

          <form onSubmit={handleBankUpdate} className="space-y-4">
            <Select
              label="Bank"
              value={bankForm.bank_code}
              onChange={(e) => setBankForm({ ...bankForm, bank_code: e.target.value })}
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
              value={bankForm.account_number}
              onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
              maxLength={10}
              pattern="[0-9]{10}"
              required
            />

            {message.text && (
              <div className={`p-3 rounded-lg text-xs ${
                message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {message.text}
              </div>
            )}

            <Button 
              type="submit" 
              loading={updating}
              disabled={!bankForm.bank_code || !bankForm.account_number.match(/^[0-9]{10}$/)}
            >
              Update Bank Account
            </Button>
          </form>
        </div>
      )}

      {!user?.bvnVerified && (
        <div className="card p-5 bg-gray-50">
          <div className="text-center py-6">
            <CreditCard size={48} className="text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Bank Account Management</h3>
            <p className="text-sm text-gray-500 mb-4">
              Complete BVN verification to manage your bank account details for withdrawals.
            </p>
            <Button onClick={() => setShowVerificationModal(true)}>
              Complete Verification
            </Button>
          </div>
        </div>
      )}

      {/* BVN Verification Modal */}
      <BvnVerificationModal
        open={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={handleVerificationSuccess}
      />

      {/* Notification Preferences Modal */}
      <NotificationPreferences
        open={showNotificationPreferences}
        onClose={() => setShowNotificationPreferences(false)}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppProvider>
      <DashboardLayout role="buyer">
        <SettingsContent />
      </DashboardLayout>
    </AppProvider>
  );
}
