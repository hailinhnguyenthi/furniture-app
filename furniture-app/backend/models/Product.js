import mongoose from "mongoose";

// ─── Sub-schema: Specification ────────────────────────────────────────────────
const specSchema = new mongoose.Schema({
    key: { type: String, required: true },  // "Kích thước", "Chất liệu"
    value: { type: String, required: true },  // "120 x 60 x 75 cm", "Gỗ sồi"
}, { _id: false });

// ─── Main schema ──────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, "Tên sản phẩm là bắt buộc"], trim: true, maxlength: [200, "Tên tối đa 200 ký tự"] },
        slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
        description: { type: String, default: "", maxlength: [5000, "Mô tả tối đa 5000 ký tự"] },
        price: { type: Number, required: [true, "Giá là bắt buộc"], min: [0, "Giá không âm"] },
        salePrice: {
            type: Number, default: null,
            validate: {
                validator(v) { return v === null || v < this.price; },
                message: "Giá khuyến mãi phải nhỏ hơn giá gốc",
            },
        },

        // Category — enum khớp với FR-06
        category: {
            type: String,
            required: [true, "Danh mục là bắt buộc"],
            enum: {
                values: ["LIVING ROOM", "KITCHEN", "BEDROOM", "BATHROOM", "DECORATION", "DINING ROOM"],
                message: "Danh mục không hợp lệ",
            },
            index: true,
        },

        // Images — images[0] luôn là ảnh chính
        images: {
            type: [String],
            validate: {
                validator(arr) { return arr.length > 0; },
                message: "Cần ít nhất 1 ảnh sản phẩm",
            },
        },
        img: { type: String, default: "" },  // shortcut = images[0]

        // Inventory — FR-13
        stock: { type: Number, default: 0, min: [0, "Tồn kho không âm"] },
        sold: { type: Number, default: 0 },

        // Meta
        tags: [{ type: String, trim: true, lowercase: true }],
        specifications: [specSchema],          // bảng thông số kỹ thuật UC-06
        style: { type: String, default: "" },  // "Tối giản", "Hàn Quốc"...

        // Flags
        isActive: { type: Boolean, default: true, index: true },
        isFeatured: { type: Boolean, default: false },
        isNewProduct: { type: Boolean, default: false },

        // Ratings (aggregate từ Reviews)
        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        suppressReservedKeysWarning: true,
    }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
productSchema.index({ name: "text", description: "text", tags: "text" });  // NFR-09
productSchema.index({ price: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ sold: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

// ─── Virtual: discountPercent ──────────────────────────────────────────────────
productSchema.virtual("discountPercent").get(function () {
    if (!this.salePrice || this.salePrice >= this.price) return 0;
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
});

// ─── Pre-save: auto slug + sync img ───────────────────────────────────────────
productSchema.pre("save", function (next) {
    if ((this.isModified("name") || !this.slug) && this.name) {
        const base = this.name
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/gi, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");
        this.slug = `${base}-${this._id.toString().slice(-6)}`;
    }
    // img luôn = images[0]
    if (this.images?.length > 0) this.img = this.images[0];
    next();
});

// ─── Static: updateRating ────────────────────────────────────────────────────
productSchema.statics.updateRating = async function (productId) {
    const Review = mongoose.model("Review");
    const stats = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    await this.findByIdAndUpdate(productId, {
        rating: stats[0]?.avg ? Math.round(stats[0].avg * 10) / 10 : 0,
        reviewCount: stats[0]?.count ?? 0,
    });
};

export default mongoose.models.Product || mongoose.model("Product", productSchema);