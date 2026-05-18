import express from "express";
import {
  createVNPayPaymentUrl,
  verifyVNPayResponse,
  parseVNPayResponse,
} from "../utils/vnpay.js";

const router = express.Router();

// ─── In-Memory Order Storage (for demo) ────────────────────────────────
// In production, use database
const orders = new Map();

// ─── CREATE PAYMENT URL ─────────────────────────────────────────────────
router.post("/create-payment", (req, res) => {
  try {
    const { amount, orderCode, orderDescription, customerInfo } = req.body;

    // Validate input
    if (!amount || !orderCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get client IP
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    // Create payment URL
    const paymentUrl = createVNPayPaymentUrl({
      amount,
      orderCode,
      orderDescription: orderDescription || "Thanh toán đơn hàng",
      returnUrl: process.env.VNPAY_RETURN_URL,
      ipAddress,
      tmnCode: process.env.VNPAY_TMNCODE,
      hashSecret: process.env.VNPAY_HASHSECRET,
      vnpayUrl: process.env.VNPAY_URL,
    });

    // Store order info
    orders.set(orderCode, {
      amount,
      orderDescription,
      customerInfo,
      createdAt: new Date(),
      status: "pending",
    });

    res.json({
      success: true,
      paymentUrl,
      orderCode,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// ─── PAYMENT CALLBACK/WEBHOOK ──────────────────────────────────────────
router.get("/webhook", (req, res) => {
  try {
    const vnpParams = req.query;

    // Verify signature
    const isValid = verifyVNPayResponse(
      vnpParams,
      process.env.VNPAY_HASHSECRET
    );

    if (!isValid) {
      return res.status(400).json({
        RspCode: "97",
        Message: "Invalid signature",
      });
    }

    const orderCode = vnpParams.vnp_TxnRef;
    const responseData = parseVNPayResponse(vnpParams);

    // Update order status
    if (orders.has(orderCode)) {
      const order = orders.get(orderCode);
      order.status = responseData.isSuccess ? "completed" : "failed";
      order.transactionNo = responseData.transactionNo;
      order.payDate = responseData.payDate;
      orders.set(orderCode, order);
    }

    // Return response to VNPay
    res.json({
      RspCode: "00",
      Message: "Confirm received",
    });
  } catch (error) {
    console.error("Webhook error:", error);
    res.json({
      RspCode: "99",
      Message: "Error processing webhook",
    });
  }
});

// ─── CHECK PAYMENT STATUS ──────────────────────────────────────────────
router.get("/status/:orderCode", (req, res) => {
  try {
    const { orderCode } = req.params;

    if (!orders.has(orderCode)) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders.get(orderCode);

    res.json({
      success: true,
      orderCode,
      status: order.status,
      amount: order.amount,
      message:
        order.status === "completed"
          ? "Thanh toán thành công"
          : order.status === "failed"
            ? "Thanh toán thất bại"
            : "Đang chờ thanh toán",
      transactionNo: order.transactionNo,
      payDate: order.payDate,
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: "Failed to check status" });
  }
});

// ─── GET ALL ORDERS (Admin) ────────────────────────────────────────────
router.get("/orders", (req, res) => {
  try {
    const ordersList = Array.from(orders.entries()).map(([code, data]) => ({
      orderCode: code,
      ...data,
    }));

    res.json({
      success: true,
      total: ordersList.length,
      orders: ordersList,
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
