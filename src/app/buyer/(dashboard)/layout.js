// src/app/buyer/(dashboard)/layout.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppProvider, useApp } from "@/context/AppContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Spinner } from "@/components/ui";

function BuyerGuard({ children }) {
  const { user, hydrated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (user.role === "seller") router.replace("/seller");
    else if (user.role === "admin") router.replace("/admin");
  }, [user, hydrated, router]);

  if (!hydrated || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size={32} /></div>;
  }

  return <DashboardLayout role="buyer">{children}</DashboardLayout>;
}

export default function BuyerLayout({ children }) {
  return <AppProvider><BuyerGuard>{children}</BuyerGuard></AppProvider>;
}
