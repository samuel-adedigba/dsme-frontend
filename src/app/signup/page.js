"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ChevronDown, ShoppingBag, Store } from "lucide-react";
import { AppProvider, useApp } from "@/context/AppContext";
import { authAPI } from "@/lib/api";
import { Button, Input } from "@/components/ui";
import clsx from "clsx";

function SignupForm() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "", role: "" });
  const [roleOpen, setRoleOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const router = useRouter();

  const roles = [
    { value: "buyer", label: "Buyer", desc: "Browse products and make secure purchases", icon: <ShoppingBag size={18} className="text-orange-500" /> },
    { value: "seller", label: "Seller", desc: "List products and receive escrow payments", icon: <Store size={18} className="text-orange-500" /> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) { setError("Please select your account type."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      const { user, token } = res.data.data;
      login(user, token);
      router.push(user.role === "seller" ? "/seller" : "/buyer");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              DSME<span className="text-orange-500">Market</span>
            </span>
          </Link>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Join DSME Market for secure escrow commerce</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">I am a...</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleOpen(!roleOpen)}
                className={clsx(
                  "input flex items-center justify-between w-full text-left",
                  !form.role && "text-gray-400"
                )}
              >
                <span>
                  {form.role
                    ? roles.find((r) => r.value === form.role)?.label
                    : "Select account type"}
                </span>
                <ChevronDown size={15} className={clsx("transition-transform", roleOpen && "rotate-180")} />
              </button>

              {roleOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => { setForm({ ...form, role: r.value }); setRoleOpen(false); }}
                      className={clsx(
                        "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-orange-50 transition",
                        form.role === r.value && "bg-orange-50"
                      )}
                    >
                      <span className="mt-0.5 inline-flex">{r.icon}</span>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{r.label}</p>
                        <p className="text-xs text-gray-500">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Input label="Full name" placeholder="Amaka Okonkwo" value={form.full_name} onChange={set("full_name")} required />
          <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
          <Input label="Phone number" type="tel" placeholder="08012345678" value={form.phone} onChange={set("phone")} required />
          <Input label="Password" type="password" placeholder="At least 8 characters" value={form.password} onChange={set("password")} required minLength={8} />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-500 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return <AppProvider><SignupForm /></AppProvider>;
}
