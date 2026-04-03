"use client";
// src/components/ui/NotificationDropdown.js
// Dropdown component for notifications with actions

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Settings, Loader2, X } from "lucide-react";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { NotificationItem } from "./NotificationItem";
import { useApp } from "@/context/AppContext";
import clsx from "clsx";

export function NotificationDropdown({ compact = false }) {
  const {
    notifications,
    notificationsLoading,
    notificationsError,
    unreadCount,
    fetchNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
  } = useApp();
  
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && Array.isArray(notifications) && notifications.length === 0 && !notificationsLoading) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      await fetchNotifications({ page: 1, limit: 10 });
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationAction = async (action, ...args) => {
    try {
      await action(...args);
    } catch (err) {
      console.error("Notification action failed:", err);
    }
  };

  const hasUnread = unreadCount > 0;
  const displayNotifications = Array.isArray(notifications) ? notifications.slice(0, compact ? 5 : 10) : [];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "relative p-2 rounded-full transition-colors",
          isOpen
            ? "bg-orange-100 text-orange-600"
            : "hover:bg-gray-100 text-gray-600"
        )}
      >
        <Bell size={18} />
        {hasUnread && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={clsx(
          "absolute right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50",
          compact ? "w-80" : "w-96 max-h-96"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {hasUnread && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {hasUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-orange-600 hover:text-orange-700"
                >
                  <CheckCheck size={12} className="mr-1" />
                  Mark all read
                </Button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={clsx(
            "overflow-y-auto",
            compact ? "max-h-64" : "max-h-80"
          )}>
            {loading || notificationsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size={20} />
              </div>
            ) : notificationsError ? (
              <div className="p-4 text-center">
                <p className="text-sm text-red-500 mb-3">{notificationsError}</p>
                <Button size="sm" onClick={loadNotifications}>
                  Try again
                </Button>
              </div>
            ) : displayNotifications.length === 0 ? (
              <EmptyState
                icon={<Bell size={32} className="text-gray-300" />}
                title="No notifications"
                description="You're all caught up! Check back later for new updates."
              />
            ) : (
              <div className="p-2 space-y-1">
                {displayNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    compact={compact}
                    onMarkAsRead={(id) => handleNotificationAction(markNotificationAsRead, id)}
                    onDelete={(id) => handleNotificationAction(deleteNotification, id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {displayNotifications.length > 0 && !compact && (
            <div className="p-3 border-t border-gray-100">
              <Button
                variant="ghost"
                className="w-full text-sm text-orange-600 hover:text-orange-700"
                onClick={() => {
                  // Navigate to full notifications page
                  window.location.href = "/notifications";
                }}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
