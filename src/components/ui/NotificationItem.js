"use client";
// src/components/ui/NotificationItem.js
// Individual notification component with actions

import { useState } from "react";
import { Check, Trash2, ShoppingBag, CreditCard, AlertTriangle, User, Bell } from "lucide-react";
import { Button } from "@/components/ui";

const CATEGORY_CONFIG = {
  transaction: {
    icon: <ShoppingBag size={14} />,
    color: "blue",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  payment: {
    icon: <CreditCard size={14} />,
    color: "green",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-200",
  },
  dispute: {
    icon: <AlertTriangle size={14} />,
    color: "red",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-200",
  },
  account: {
    icon: <User size={14} />,
    color: "purple",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  default: {
    icon: <Bell size={14} />,
    color: "gray",
    bgColor: "bg-gray-50",
    textColor: "text-gray-600",
    borderColor: "border-gray-200",
  },
};

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  compact = false 
}) {
  const [actionLoading, setActionLoading] = useState(false);
  const config = CATEGORY_CONFIG[notification.category] || CATEGORY_CONFIG.default;

  const handleMarkAsRead = async () => {
    if (notification.isRead || actionLoading) return;
    
    setActionLoading(true);
    try {
      await onMarkAsRead(notification.id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (actionLoading) return;
    
    setActionLoading(true);
    try {
      await onDelete(notification.id);
    } finally {
      setActionLoading(false);
    }
  };

  if (compact) {
    return (
      <div className={`
        flex items-start gap-3 p-3 rounded-lg border transition-all
        ${notification.isRead 
          ? "bg-white border-gray-100" 
          : `${config.bgColor} ${config.borderColor}`
        }
      `}>
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
          ${notification.isRead ? "bg-gray-100 text-gray-500" : config.bgColor + " " + config.textColor}
        `}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`
            text-sm font-medium line-clamp-2
            ${notification.isRead ? "text-gray-600" : "text-gray-900"}
          `}>
            {notification.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5"
              onClick={handleMarkAsRead}
              loading={actionLoading}
            >
              <Check size={12} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDelete}
            loading={actionLoading}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      p-4 rounded-lg border transition-all
      ${notification.isRead 
        ? "bg-white border-gray-100" 
        : `${config.bgColor} ${config.borderColor}`
      }
    `}>
      <div className="flex items-start gap-3">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
          ${notification.isRead ? "bg-gray-100 text-gray-500" : config.bgColor + " " + config.textColor}
        `}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`
              text-sm font-semibold
              ${notification.isRead ? "text-gray-600" : "text-gray-900"}
            `}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <span className={`
              text-xs px-2 py-1 rounded-full font-medium
              ${config.bgColor} ${config.textColor}
            `}>
              {notification.category}
            </span>
            
            <div className="flex items-center gap-2">
              {!notification.isRead && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAsRead}
                  loading={actionLoading}
                  className="text-xs"
                >
                  <Check size={12} className="mr-1" />
                  Mark as read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                loading={actionLoading}
                className="text-xs text-red-500 hover:text-red-600"
              >
                <Trash2 size={12} className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
