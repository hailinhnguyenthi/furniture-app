import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Voucher from "../models/Voucher.js";
import { protect, requireAdmin, requireStaff } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Helper: generate order code ─────────────────────────────────────────────
function genOrderCode() {
    return `FNR${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
}

// ─── POST /api/orders — Tạo đơn hàng ─────────────────────────────────────────
router.post("/", protect, async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod = "vnpay", voucherCode } = req.body;

        if (!items?.length) return res.status(400).json({ message: "Giỏ hàng trống" });
        if (!shippingAddress) return res.status(400).json({ message: "Thiếu địa chỉ giao hàng" });

        // ── 1. Kiểm tra tồn kho từng sản phẩm ─────────────────────────────────
        const productIds = items.map(i => i.productId);
        const dbProducts = await Product.find({ _id: { $in: productIds }, isActive: true });
        const productMap = new Map(dbProducts.map(p => [p._id.toString(), p]));

        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            const p = productMap.get(item.productId);

            // Fallback: nếu dùng data mock (numeric id) thì không kiểm tra DB stock
            if (p) {
                if (p.stock < item.quantity) {
                    return res.status(400).json({
                        message: `Sản phẩm "${p.name}" chỉ còn ${p.stock} trong kho`,
                    });
                }
            }

            const unitPrice = p ? (p.salePrice || p.price) : item.price;
            const sub = unitPrice * item.quantity;
            subtotal += sub;

            orderItems.push({
                product: p?._id || item.productId,
                productId: item.productId,
                name: p?.name || item.name,
                img: p?.img || item.img,
                price: unitPrice,
                quantity: item.quantity,
                subtotal: sub,
            });
        }

        // ── 2. Tính phí vận chuyển ────────────────────────────────────────────
        const shippingFee = subtotal >= 5_000_000 ? 0 : 50_000;

        // ── 3. Áp dụng voucher ────────────────────────────────────────────────
        let discount = 0;
        let voucherDoc = null;

        if (voucherCode) {
            voucherDoc = await Voucher.findOne({ code: voucherCode.toUpperCase() });
            if (!voucherDoc) return res.status(400).json({ message: "Mã voucher không tồn tại" });

            const validity = voucherDoc.isValid(subtotal);
            if (!validity.ok) return res.status(400).json({ message: validity.msg });

            discount = voucherDoc.calcDiscount(subtotal);
        }

        const total = Math.max(0, subtotal - discount + shippingFee);

        // ── 4. Tạo đơn hàng ───────────────────────────────────────────────────
        const order = await Order.create({
            orderCode: genOrderCode(),
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            subtotal,
            discount,
            shippingFee,
            total,
            paymentMethod,
            voucher: voucherDoc?._id || null,
            voucherCode: voucherCode?.toUpperCase() || "",
            status: "pending",
            paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
            statusHistory: [{ status: "pending", note: "Đơn hàng mới tạo" }],
        });

        // ── 5. Trừ tồn kho ────────────────────────────────────────────────────
        const bulkOps = orderItems
            .filter(i => productMap.has(String(i.product)))
            .map(i => ({
                updateOne: {
                    filter: { _id: i.product },
                    update: { $inc: { stock: -i.quantity, sold: i.quantity } },
                },
            }));
        if (bulkOps.length) await Product.bulkWrite(bulkOps);

        // ── 6. Tăng usedCount voucher ─────────────────────────────────────────
        if (voucherDoc) {
            voucherDoc.usedCount += 1;
            await voucherDoc.save();
        }

        res.status(201).json({ success: true, order });
    } catch (err) {
        console.error("Create order error:", err);
        res.status(500).json({ message: err.message || "Lỗi tạo đơn hàng" });
    }
});

// ─── GET /api/orders/my — Lịch sử đơn hàng của user ─────────────────────────
router.get("/my", protect, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const filter = { user: req.user._id };
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const [orders, total] = await Promise.all([
            Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            Order.countDocuments(filter),
        ]);

        res.json({
            success: true,
            orders,
            pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// ─── GET /api/orders/my/:orderCode — Chi tiết đơn hàng ───────────────────────
router.get("/my/:orderCode", protect, async (req, res) => {
    try {
        const order = await Order.findOne({ orderCode: req.params.orderCode, user: req.user._id });
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// ─── POST /api/orders/my/:orderCode/cancel — Huỷ đơn ────────────────────────
router.post("/my/:orderCode/cancel", protect, async (req, res) => {
    try {
        const order = await Order.findOne({ orderCode: req.params.orderCode, user: req.user._id });
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        if (!order.canCancel()) {
            return res.status(400).json({ message: "Đơn hàng đang giao hoặc đã hoàn tất — không thể huỷ" });
        }

        order.status = "cancelled";
        order.cancelReason = req.body.reason || "Khách hàng huỷ";
        order.cancelledBy = "user";
        order.statusHistory.push({ status: "cancelled", note: req.body.reason || "Khách hàng huỷ", updatedBy: req.user._id });
        await order.save();

        // Hoàn lại tồn kho
        const bulkOps = order.items
            .filter(i => i.product?.toString().length === 24)
            .map(i => ({
                updateOne: {
                    filter: { _id: i.product },
                    update: { $inc: { stock: i.quantity, sold: -i.quantity } },
                },
            }));
        if (bulkOps.length) await Product.bulkWrite(bulkOps);

        res.json({ success: true, message: "Đã huỷ đơn hàng", order });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// ─── POST /api/orders/validate-voucher ───────────────────────────────────────
router.post("/validate-voucher", protect, async (req, res) => {
    try {
        const { code, orderTotal } = req.body;
        const voucher = await Voucher.findOne({ code: code?.toUpperCase() });
        if (!voucher) return res.status(404).json({ message: "Mã voucher không tồn tại" });

        const validity = voucher.isValid(Number(orderTotal));
        if (!validity.ok) return res.status(400).json({ message: validity.msg });

        const discount = voucher.calcDiscount(Number(orderTotal));
        res.json({
            success: true,
            discount,
            voucherCode: voucher.code,
            description: voucher.description,
            type: voucher.type,
            value: voucher.value,
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// ─── Admin: GET /api/orders — Tất cả đơn hàng ────────────────────────────────
router.get("/", protect, requireStaff, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const [orders, total] = await Promise.all([
            Order.find(filter).populate("user", "fullName email").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Order.countDocuments(filter),
        ]);

        res.json({ success: true, orders, pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) } });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// ─── Admin: PUT /api/orders/:id/status ───────────────────────────────────────
router.put("/:id/status", protect, requireStaff, async (req, res) => {
    try {
        const { status, note } = req.body;
        const validFlow = { pending: ["confirmed", "cancelled"], confirmed: ["shipping", "cancelled"], shipping: ["completed"] };

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        const allowed = validFlow[order.status] || [];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: `Không thể chuyển từ "${order.status}" sang "${status}"` });
        }

        order.status = status;
        order.statusHistory.push({ status, note: note || "", updatedBy: req.user._id });
        if (status === "completed" && order.paymentMethod === "cod") {
            order.paymentStatus = "paid";
            order.paidAt = new Date();
        }
        await order.save();
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// ─── Webhook: PUT /api/orders/payment-sync ───────────────────────────────────
// Được gọi từ payment route sau khi VNPay callback xác nhận
router.put("/payment-sync", async (req, res) => {
    try {
        const { orderCode, transactionNo, payDate } = req.body;
        const order = await Order.findOne({ orderCode });
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

        order.paymentStatus = "paid";
        order.transactionNo = transactionNo;
        order.paidAt = payDate ? new Date(payDate) : new Date();
        if (order.status === "pending") {
            order.status = "confirmed";
            order.statusHistory.push({ status: "confirmed", note: "Thanh toán VNPay thành công" });
        }
        await order.save();
        res.json({ success: true, message: "Đồng bộ thanh toán thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

export default router;