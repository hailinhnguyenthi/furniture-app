const API_URL = "http://localhost:5000/api/payment";

// ─── CREATE PAYMENT ─────────────────────────────────────────────────────
export async function createPayment({ amount, orderCode, orderDescription, customerInfo }) {
  try {
    const response = await fetch(`${API_URL}/create-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        orderCode,
        orderDescription,
        customerInfo,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create payment");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Payment creation error:", error);
    throw error;
  }
}

// ─── CHECK PAYMENT STATUS ───────────────────────────────────────────────
export async function checkPaymentStatus(orderCode) {
  try {
    const response = await fetch(`${API_URL}/status/${orderCode}`);

    if (!response.ok) {
      throw new Error("Failed to check status");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Status check error:", error);
    throw error;
  }
}

// ─── GET ALL ORDERS (Admin) ─────────────────────────────────────────────
export async function getAllOrders() {
  try {
    const response = await fetch(`${API_URL}/orders`);

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Orders fetch error:", error);
    throw error;
  }
}

// ─── GENERATE ORDER CODE ────────────────────────────────────────────────
export function generateOrderCode() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD${timestamp}${random}`;
}

// ─── FORMAT CURRENCY ────────────────────────────────────────────────────
export function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}
