import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        // ── Identity ─────────────────────────────────────────────────────────
        fullName: {
            type: String,
            required: [true, "Họ tên là bắt buộc"],
            trim: true,
            maxlength: [100, "Họ tên tối đa 100 ký tự"],
        },
        email: {
            type: String,
            required: [true, "Email là bắt buộc"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không hợp lệ"],
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        dob: {
            type: Date,
            default: null,
        },
        avatar: {
            type: String,
            default: "",
        },

        // ── Auth ─────────────────────────────────────────────────────────────
        password: {
            type: String,
            minlength: [8, "Mật khẩu tối thiểu 8 ký tự"],
            select: false,      // không trả về password trong query mặc định
        },
        role: {
            type: String,
            enum: ["user", "admin", "staff"],
            default: "user",
        },
        isActive: {
            type: Boolean,
            default: true,
        },

        // ── Google OAuth ─────────────────────────────────────────────────────
        googleId: {
            type: String,
            sparse: true,   // cho phép null nhưng unique nếu có
            default: null,
        },
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },

        // ── Password reset via OTP ────────────────────────────────────────────
        resetOTP: { type: String, select: false, default: null },
        resetOTPExpires: { type: Date, select: false, default: null },
        resetOTPVerified: { type: Boolean, select: false, default: false },
    },
    {
        timestamps: true,
    }
);

// ─── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// ─── Instance method: check password ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
};

// ─── Instance method: safe public profile ────────────────────────────────────
userSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        fullName: this.fullName,
        email: this.email,
        phone: this.phone,
        dob: this.dob,
        avatar: this.avatar,
        role: this.role,
        authProvider: this.authProvider,
        createdAt: this.createdAt,
    };
};

export default mongoose.model("User", userSchema);