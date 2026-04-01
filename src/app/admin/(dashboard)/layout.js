"use client";
// src/app/admin/(dashboard)/layout.js
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppProvider, useApp } from "@/context/AppContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Spinner } from "@/components/ui";

function AdminGuard({ children }) {
  const { user, hydrated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace(user.role === "seller" ? "/seller" : "/buyer");
  }, [user, hydrated, router]);

  if (!hydrated || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner size={32} /></div>;
  return <DashboardLayout role="admin">{children}</DashboardLayout>;
}

export default function AdminLayout({ children }) {
  return <AppProvider><AdminGuard>{children}</AdminGuard></AppProvider>;
}
