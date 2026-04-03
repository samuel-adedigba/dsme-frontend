"use client";
// src/app/notifications/page.js
// Dedicated notifications page with filtering and pagination

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Filter, CheckCheck, Trash2, Settings, Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button, Input, Select, EmptyState, Spinner, Modal } from "@/components/ui";
import { NotificationItem, NotificationPreferences } from "@/components/ui";
import { useApp } from "@/context/AppContext";
import { AppProvider } from "@/context/AppContext";
import clsx from "clsx";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "transaction", label: "Transactions" },
  { value: "payment", label: "Payments" },
  { value: "dispute", label: "Disputes" },
  { value: "account", label: "Account" },
];

const ADMIN_CATEGORIES = [
  { value: "", label: "All Types" },
  { value: "webhook_error", label: "Webhook Errors" },
  { value: "zoho_failure", label: "Zoho Failures" },
  { value: "system_error", label: "System Errors" },
  { value: "admin_alert", label: "Admin Alerts" },
  { value: "info", label: "Information" },
];

const SEVERITY_LEVELS = [
  { value: "", label: "All Severities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

function NotificationsPageContent() {
  const {
    notifications,
    notificationsLoading,
    notificationsError,
    notificationsHasMore,
    notificationsPage,
    unreadCount,
    user,
    fetchNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
  } = useApp();

  const [filters, setFilters] = useState({
    category: "",
    isRead: "",
    search: "",
    type: "",
    severity: "",
  });
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';
  const categories = isAdmin ? ADMIN_CATEGORIES : CATEGORIES;
  const filterOptions = [
    { value: "", label: "All Notifications" },
    { value: "false", label: "Unread Only" },
    { value: "true", label: "Read Only" },
  ];

  // Load initial notifications
  useEffect(() => {
    loadNotifications(1);
  }, [filters.category, filters.isRead, filters.type, filters.severity]);

  const loadNotifications = async (page = 1, search = "") => {
    setLoading(true);
    try {
      await fetchNotifications({
        page,
        category: filters.category || undefined,
        isRead: filters.isRead ? filters.isRead === "true" : filters.isRead === "false" ? false : undefined,
        search: search || undefined,
        type: isAdmin ? filters.type || undefined : undefined,
        severity: isAdmin ? filters.severity || undefined : undefined,
      });
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (search) => {
    setFilters(prev => ({ ...prev, search }));
    loadNotifications(1, search);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setSelectedNotifications(new Set());
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleBulkDelete = async () => {
    const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
    try {
      await Promise.all(promises);
      setSelectedNotifications(new Set());
    } catch (err) {
      console.error("Failed to delete notifications:", err);
    }
  };

  const handleSelectNotification = (id, isSelected) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (!Array.isArray(notifications)) return;
    
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    }
  };

  const loadMore = () => {
    if (!notificationsHasMore || loading) return;
    loadNotifications(notificationsPage + 1, filters.search);
  };

  return (
    <DashboardLayout role={user?.role || "buyer"}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isAdmin ? "System Notifications" : "Notifications"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "All caught up!"}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <CheckCheck size={12} className="mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreferences(true)}
              className="text-xs"
            >
              <Settings size={12} className="mr-1" />
              Preferences
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <div className={`flex flex-col ${isAdmin ? 'lg:flex-row' : 'lg:flex-row'} gap-4`}>
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category/Type Filter */}
            <div className="lg:w-48">
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <Select
                value={filters.isRead}
                onChange={(e) => handleFilterChange("isRead", e.target.value)}
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Admin-specific filters */}
            {isAdmin && (
              <>
                {/* Severity Filter */}
                <div className="lg:w-48">
                  <Select
                    value={filters.severity}
                    onChange={(e) => handleFilterChange("severity", e.target.value)}
                  >
                    {SEVERITY_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.size > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between">
            <p className="text-sm text-orange-700">
              {selectedNotifications.size} notification{selectedNotifications.size > 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNotifications(new Set())}
                className="text-xs"
              >
                Clear selection
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                className="text-xs"
              >
                <Trash2 size={12} className="mr-1" />
                Delete selected
              </Button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-2">
          {/* Select All Checkbox */}
          {Array.isArray(notifications) && notifications.length > 0 && (
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={selectedNotifications.size === notifications.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-orange-500 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Select all</span>
            </label>
          )}

          {loading && (!Array.isArray(notifications) || notifications.length === 0) ? (
            <div className="flex justify-center py-12">
              <Spinner size={24} />
            </div>
          ) : notificationsError ? (
            <div className="text-center py-12">
              <p className="text-sm text-red-500 mb-3">{notificationsError}</p>
              <Button size="sm" onClick={() => loadNotifications(1)}>
                Try again
              </Button>
            </div>
          ) : !Array.isArray(notifications) || notifications.length === 0 ? (
            <EmptyState
              icon={<Bell size={48} className="text-gray-300" />}
              title="No notifications"
              description={filters.search || filters.category || filters.isRead 
                ? "No notifications match your filters. Try adjusting your search criteria."
                : "You're all caught up! Check back later for new updates."
              }
              action={
                (filters.search || filters.category || filters.isRead) && (
                  <Button size="sm" onClick={() => setFilters({ category: "", isRead: "", search: "" })}>
                    Clear filters
                  </Button>
                )
              }
            />
          ) : (
            <>
              {Array.isArray(notifications) && notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={(e) => handleSelectNotification(notification.id, e.target.checked)}
                    className="mt-4 w-4 h-4 text-orange-500 rounded"
                  />
                  <div className="flex-1">
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={markNotificationAsRead}
                      onDelete={deleteNotification}
                    />
                  </div>
                </div>
              ))}

              {/* Load More */}
              {notificationsHasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Load more"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preferences Modal */}
      <NotificationPreferences
        open={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </DashboardLayout>
  );
}

export default function NotificationsPage() {
  return (
    <AppProvider>
      <NotificationsPageContent />
    </AppProvider>
  );
}
