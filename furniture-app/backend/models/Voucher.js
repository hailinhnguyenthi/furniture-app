import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
        description: { type: String, default: "" },

        // Loại giảm giá
        type: {
            type: String,
            enum: ["percent", "fixed"],
            required: true,
        },
        value: { type: Number, required: true, min: 0 },  // % hoặc VNĐ
        maxDiscount: { type: Number, default: null },            // giới hạn tối đa (chỉ dùng với percent)

        // Điều kiện áp dụng
        minOrderValue: { type: Number, default: 0 },

        // Giới hạn sử dụng
        usageLimit: { type: Number, default: null },   // null = không giới hạn
        usedCount: { type: Number, default: 0 },

        // Thời hạn
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, required: true },

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// ─── Instance: tính số tiền giảm ─────────────────────────────────────────────
voucherSchema.methods.calcDiscount = function (orderTotal) {
    if (this.type === "percent") {
        const raw = Math.floor(orderTotal * this.value / 100);
        return this.maxDiscount ? Math.min(raw, this.maxDiscount) : raw;
    }
    return Math.min(this.value, orderTotal);   // fixed không giảm quá total
};

// ─── Instance: voucher còn hợp lệ không? ─────────────────────────────────────
voucherSchema.methods.isValid = function (orderTotal) {
    const now = new Date();
    if (!this.isActive) return { ok: false, msg: "Voucher không còn hiệu lực" };
    if (now < this.startDate) return { ok: false, msg: "Voucher chưa đến ngày áp dụng" };
    if (now > this.endDate) return { ok: false, msg: "Voucher đã hết hạn" };
    if (this.usageLimit && this.usedCount >= this.usageLimit)
        return { ok: false, msg: "Voucher đã hết lượt sử dụng" };
    if (orderTotal < this.minOrderValue) return { ok: false, msg: `Đơn hàng tối thiểu ${this.minOrderValue.toLocaleString()}₫` };
    return { ok: true };
};

export default mongoose.model("Voucher", voucherSchema);