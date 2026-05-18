import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paymentRouter from "./routes/payment.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Furniture Store Backend",
    version: "1.0.0",
    endpoints: {
      payment: "/api/payment",
    },
  });
});

// Payment routes
app.use("/api/payment", paymentRouter);

// ─── ERROR HANDLING ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// ─── START SERVER ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 CORS enabled for: ${process.env.CORS_ORIGIN}`);
  console.log(`💳 VNPay Merchant Code: ${process.env.VNPAY_TMNCODE}`);
});
