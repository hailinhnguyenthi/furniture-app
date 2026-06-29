// ─── Base URL ─────────────────────────────────────────────────────────────────
// Vite injects VITE_* env vars at build time.
// Set VITE_API_URL in .env.local for local dev, or in Vercel/host env for prod.
// Default falls back to localhost so existing local setup still works.
const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payment`;

// ─── CREATE PAYMENT ───────────────────────────────────────────────────────────
export async function createPayment({ amount, orderCode, orderDescription, customerInfo }) {
  const response = await fetch(`${API_URL}/create-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, orderCode, orderDescription, customerInfo }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create payment");
  }

  return response.json();
}

// ─── CHECK PAYMENT STATUS ─────────────────────────────────────────────────────
export async function checkPaymentStatus(orderCode) {
  const response = await fetch(`${API_URL}/status/${encodeURIComponent(orderCode)}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to check payment status");
  }

  return response.json();
}

// ─── GET ALL ORDERS (Admin) ───────────────────────────────────────────────────
export async function getAllOrders() {
  const response = await fetch(`${API_URL}/orders`);

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
}

// ─── GENERATE ORDER CODE ──────────────────────────────────────────────────────
export function generateOrderCode() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `FNR${timestamp}${random}`;
}

// ─── FORMAT CURRENCY (VND) ────────────────────────────────────────────────────
export function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}