import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true },    // "CREATE", "UPDATE", "DELETE", "STATUS_CHANGE"
    entity: { type: String, required: true },    // "Product", "Order", "Voucher", "User"
    entityId: { type: String, required: true },
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
    ip: { type: String, default: "" },
    note: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now, index: true },
});

auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ user: 1, createdAt: -1 });

// Helper: ghi log từ bất kỳ route nào
auditLogSchema.statics.log = async function ({ user, action, entity, entityId, before, after, ip, note }) {
    try {
        await this.create({ user, action, entity, entityId: String(entityId), before, after, ip: ip || "", note: note || "" });
    } catch (err) {
        console.error("AuditLog error:", err.message);  // không được crash main flow
    }
};

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);