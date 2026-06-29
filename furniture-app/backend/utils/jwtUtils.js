import jwt from "jsonwebtoken";
import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "funiro_jwt_fallback_secret_change_me";
const EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

// ─── JWT ─────────────────────────────────────────────────────────────────────

export function signToken(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

export function verifyToken(token) {
    return jwt.verify(token, SECRET);   // throws if invalid / expired
}

// ─── HttpOnly Cookie ─────────────────────────────────────────────────────────

export function setAuthCookie(res, token) {
    res.cookie("funiro_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 ngày
    });
}

export function clearAuthCookie(res) {
    res.clearCookie("funiro_token", { httpOnly: true, sameSite: "lax" });
}

export function getTokenFromRequest(req) {
    // Ưu tiên HttpOnly cookie, fallback sang Authorization header
    if (req.cookies?.funiro_token) return req.cookies.funiro_token;
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) return auth.slice(7);
    return null;
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

/** Tạo OTP 6 chữ số và thời gian hết hạn */
export function generateOTP() {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);   // 10 phút
    return { otp, expires };
}

/** Kiểm tra OTP còn hợp lệ */
export function isOTPValid(storedOTP, storedExpires, inputOTP) {
    if (!storedOTP || !storedExpires) return false;
    if (new Date() > new Date(storedExpires)) return false;
    return storedOTP === inputOTP;
}