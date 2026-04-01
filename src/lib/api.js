// src/lib/api.js
// Central Axios instance. Every backend call goes through this file.
// Base URL reads from NEXT_PUBLIC_API_URL env var  defaults to localhost:5000.
// JWT is attached automatically from localStorage on every request.

import axios from "axios";

const TOAST_EVENT = "dsme:toast";

function emitToast(message, type = "info") {
  if (typeof window === "undefined" || !message) return;
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: { message, type },
    })
  );
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach JWT from localStorage before every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("dsme_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401  clear auth and redirect to login
api.interceptors.response.use(
  (res) => {
    const method = res?.config?.method?.toLowerCase();
    if (method === "post") {
      const message = res?.data?.message;
      if (message) emitToast(message, "success");
    }
    return res;
  },
  (err) => {
    const method = err?.config?.method?.toLowerCase();
    if (method === "post") {
      const message = err?.response?.data?.message;
      if (message) emitToast(message, "error");
    }

    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("dsme_token");
      localStorage.removeItem("dsme_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ── PUBLIC ────────────────────────────────────────────────────────────────────
export const publicAPI = {
  getSellers: () => api.get("/public/sellers"),
};

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  verifyBvn: (data) => api.post("/auth/verify-bvn", data),
  updateBankAccount: (data) => api.patch("/auth/bank-account", data),
  getProfile: () => api.get("/auth/profile"),
};

// ── WALLET ────────────────────────────────────────────────────────────────────
export const walletAPI = {
  getWallet: () => api.get("/wallet"),
  getLedger: (params) => api.get("/wallet/ledger", { params }),
  withdraw: (amount_kobo) => api.post("/wallet/withdraw", { amount_kobo }),
};

// ── TRANSACTIONS ──────────────────────────────────────────────────────────────
export const transactionAPI = {
  create: (data) => api.post("/transactions", data),
  getAll: () => api.get("/transactions"),
  getPending: () => api.get("/transactions/pending"),
  getById: (id) => api.get(`/transactions/${id}`),
  stakeBuyer: (id) => api.post(`/transactions/${id}/stake-buyer`),
  stakeSeller: (id) => api.post(`/transactions/${id}/stake-seller`),
};

// ── MILESTONES ────────────────────────────────────────────────────────────────
export const milestoneAPI = {
  submitProof: (data) => api.post("/milestones/proof", data),
  approve: (milestone_id) => api.post("/milestones/approve", { milestone_id }),
  dispute: (data) => api.post("/milestones/dispute", data),
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getAllTransactions: (status) =>
    api.get("/admin/transactions", { params: status ? { status } : {} }),
  getDisputes: () => api.get("/admin/disputes"),
  resolveDispute: (data) => api.post("/admin/disputes/resolve", data),
};
