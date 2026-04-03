"use client";
// src/components/ui/NotificationPreferences.js
// Modal for managing notification preferences

import { useState } from "react";
import { Mail, Bell, Settings, X } from "lucide-react";
import { Modal, Button, Input } from "@/components/ui";
import { useApp } from "@/context/AppContext";

export function NotificationPreferences({ open, onClose }) {
  const { notificationPreferences, updateNotificationPreferences } = useApp();
  const [preferences, setPreferences] = useState(notificationPreferences);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update local state when context changes
  useState(() => {
    setPreferences(notificationPreferences);
  }, [notificationPreferences]);

  const handleToggle = (field) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    
    try {
      await updateNotificationPreferences(preferences);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPreferences(notificationPreferences);
    setError("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Notification Preferences" maxWidth="max-w-md">
      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Mail size={16} className="text-orange-500" />
            <h4 className="font-medium text-gray-900">Email Notifications</h4>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  checked={preferences.emailEnabled}
                  onChange={() => handleToggle("emailEnabled")}
                  className="w-4 h-4 text-orange-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Enable Email</p>
                  <p className="text-xs text-gray-500">Receive notifications via email</p>
                </div>
              </div>
            </label>

            {preferences.emailEnabled && (
              <>
                <label className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition ml-6">
                  <div className="flex items-center gap-3">
                    <Input
                      type="checkbox"
                      checked={preferences.emailTransactions}
                      onChange={() => handleToggle("emailTransactions")}
                      className="w-4 h-4 text-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Transactions</p>
                      <p className="text-xs text-gray-500">Transaction updates and status changes</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition ml-6">
                  <div className="flex items-center gap-3">
                    <Input
                      type="checkbox"
                      checked={preferences.emailPayments}
                      onChange={() => handleToggle("emailPayments")}
                      className="w-4 h-4 text-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payments</p>
                      <p className="text-xs text-gray-500">Payment confirmations and receipts</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition ml-6">
                  <div className="flex items-center gap-3">
                    <Input
                      type="checkbox"
                      checked={preferences.emailDisputes}
                      onChange={() => handleToggle("emailDisputes")}
                      className="w-4 h-4 text-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Disputes</p>
                      <p className="text-xs text-gray-500">Dispute updates and resolutions</p>
                    </div>
                  </div>
                </label>
              </>
            )}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-orange-500" />
            <h4 className="font-medium text-gray-900">In-App Notifications</h4>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  checked={preferences.inAppEnabled}
                  onChange={() => handleToggle("inAppEnabled")}
                  className="w-4 h-4 text-orange-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Enable In-App</p>
                  <p className="text-xs text-gray-500">Show notifications in the app</p>
                </div>
              </div>
            </label>

            {preferences.inAppEnabled && (
              <>
                <label className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition ml-6">
                  <div className="flex items-center gap-3">
                    <Input
                      type="checkbox"
                      checked={preferences.inAppTransactions}
                      onChange={() => handleToggle("inAppTransactions")}
                      className="w-4 h-4 text-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Transactions</p>
                      <p className="text-xs text-gray-500">Transaction updates and status changes</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition ml-6">
                  <div className="flex items-center gap-3">
                    <Input
                      type="checkbox"
                      checked={preferences.inAppPayments}
                      onChange={() => handleToggle("inAppPayments")}
                      className="w-4 h-4 text-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payments</p>
                      <p className="text-xs text-gray-500">Payment confirmations and receipts</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition ml-6">
                  <div className="flex items-center gap-3">
                    <Input
                      type="checkbox"
                      checked={preferences.inAppDisputes}
                      onChange={() => handleToggle("inAppDisputes")}
                      className="w-4 h-4 text-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Disputes</p>
                      <p className="text-xs text-gray-500">Dispute updates and resolutions</p>
                    </div>
                  </div>
                </label>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            loading={loading}
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </Modal>
  );
}
