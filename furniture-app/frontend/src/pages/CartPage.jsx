import { useState } from "react";
import { useStore } from "../../../store/store";
import { validateVoucher, createOrder } from "../services/orderService";
import { createPayment, generateOrderCode } from "../services/paymentService";
import FadeUp from "../components/FadeUp";

const C = { cream: "#FAF7F2", beige: "#F0E8DC", dark: "#4A2C1A", wood: "#8B5E3C", sand: "#D9C9B0", error: "#C47B5A", green: "#6B7C5C" };
const FREE_SHIP_THRESHOLD = 5_000_000;
const SHIPPING_FEE = 50_000;
const fmt = (n) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, navigate, showToast, isLoggedIn } = useStore();

  // Voucher
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherData, setVoucherData] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  // Checkout modal
  const [showModal, setShowModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", address: "", city: "", district: "", ward: "", notes: "" });
  const [formErrors, setFormErrors] = useState({});

  // ── Derived values ────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = voucherData?.discount || 0;
  const shippingFee = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = Math.max(0, subtotal - discount + shippingFee);
  const progress = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);
  const remaining = FREE_SHIP_THRESHOLD - subtotal;

  // ── Voucher ───────────────────────────────────────────────────────────
  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    setVoucherLoading(true);
    setVoucherError("");
    try {
      const data = await validateVoucher(voucherInput.trim(), subtotal);
      setVoucherData(data);
      showToast({ message: `Áp dụng voucher thành công! Giảm ${fmt(data.discount)}`, type: "success" });
    } catch (err) {
      setVoucherError(err.message);
      setVoucherData(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const removeVoucher = () => { setVoucherData(null); setVoucherInput(""); setVoucherError(""); };

  // ── Form validation ───────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Email không hợp lệ";
    if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phone.replace(/\s/g, ""))) e.phone = "Số điện thoại không hợp lệ";
    if (!formData.address.trim()) e.address = "Vui lòng nhập địa chỉ";
    if (!formData.city.trim()) e.city = "Vui lòng nhập tỉnh/thành phố";
    if (!formData.district.trim()) e.district = "Vui lòng nhập quận/huyện";
    setFormErrors(e);
    return !Object.keys(e).length;
  };

  // ── Submit checkout ───────────────────────────────────────────────────
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setOrderLoading(true);

    try {
      const orderCode = generateOrderCode();

      // 1. Tạo đơn hàng trong DB
      if (isLoggedIn) {
        await createOrder({
          orderCode,
          items: cart.map(i => ({ productId: i._id || i.id, name: i.name, img: i.img, price: i.price, quantity: i.quantity })),
          shippingAddress: formData,
          voucherCode: voucherData?.voucherCode || "",
          paymentMethod: "vnpay",
        });
      }

      // 2. Tạo VNPay URL
      const payment = await createPayment({
        amount: total,
        orderCode,
        orderDescription: `Đơn hàng Funiro - ${cart.length} sản phẩm`,
        customerInfo: { ...formData, items: cart, total, discount, shipping: shippingFee },
      });

      if (payment.success && payment.paymentUrl) {
        window.location.href = payment.paymentUrl;
      } else {
        throw new Error("Không thể tạo URL thanh toán");
      }
    } catch (err) {
      showToast({ message: err.message || "Lỗi thanh toán. Vui lòng thử lại.", type: "error" });
      setOrderLoading(false);
    }
  };

  // ── Empty cart ────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div style={{ background: C.cream, minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FadeUp>
          <div style={{ textAlign: "center", padding: 40 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={C.sand} strokeWidth="1" style={{ marginBottom: 24 }}>
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61H19.4a2 2 0 001.99-1.61L23 6H6" />
            </svg>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: C.dark, margin: "0 0 12px" }}>Giỏ hàng trống</h2>
            <p style={{ fontSize: 14, color: "#999", marginBottom: 28 }}>Khám phá bộ sưu tập nội thất của chúng tôi</p>
            <button onClick={() => navigate("shop")} style={{ background: C.dark, color: "#fff", border: "none", borderRadius: 6, padding: "13px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
              Mua sắm ngay
            </button>
          </div>
        </FadeUp>
      </div>
    );
  }

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: C.beige, borderBottom: `1px solid ${C.sand}`, padding: "32px 40px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: C.dark, margin: 0 }}>Giỏ hàng</h1>
        <p style={{ fontSize: 13, color: C.sand, marginTop: 8 }}>Trang chủ <span style={{ margin: "0 6px" }}>/</span> <span style={{ color: C.wood }}>Cart</span></p>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 40, alignItems: "start" }}>

        {/* ── Cart Items ─────────────────────────────────────────────── */}
        <div>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 40px", gap: 16, padding: "12px 20px", background: C.beige, borderRadius: 8, marginBottom: 16, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.dark }}>
            <span>Sản phẩm</span><span style={{ textAlign: "center" }}>Đơn giá</span>
            <span style={{ textAlign: "center" }}>Số lượng</span><span style={{ textAlign: "right" }}>Thành tiền</span><span />
          </div>

          {cart.map(item => (
            <FadeUp key={item.id}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 40px", gap: 16, padding: "16px 20px", background: "#fff", borderRadius: 8, marginBottom: 12, alignItems: "center", border: `1px solid ${C.sand}` }}>
                {/* Product */}
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <img src={item.img} alt={item.name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, background: C.beige, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.dark, margin: 0 }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: "#bbb", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.category}</p>
                  </div>
                </div>
                {/* Price */}
                <p style={{ textAlign: "center", fontSize: 14, color: "#666", margin: 0 }}>{fmt(item.price)}</p>
                {/* Qty */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.sand}`, borderRadius: 6, overflow: "hidden", width: 100, margin: "0 auto" }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: "none", border: "none", width: 32, height: 36, cursor: "pointer", fontSize: 16, color: C.wood }}>−</button>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.dark, width: 36, textAlign: "center" }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: "none", border: "none", width: 32, height: 36, cursor: "pointer", fontSize: 16, color: C.wood }}>+</button>
                </div>
                {/* Subtotal */}
                <p style={{ textAlign: "right", fontSize: 14, fontWeight: 700, color: C.dark, margin: 0 }}>{fmt(item.price * item.quantity)}</p>
                {/* Remove */}
                <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.sand, fontSize: 18, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.error)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.sand)}>
                  ✕
                </button>
              </div>
            </FadeUp>
          ))}

          {/* Free shipping progress */}
          {remaining > 0 && (
            <div style={{ background: "#fff", borderRadius: 8, padding: "16px 20px", border: `1px solid ${C.sand}`, marginTop: 8 }}>
              <p style={{ fontSize: 13, color: C.dark, margin: "0 0 10px" }}>
                Mua thêm <strong style={{ color: C.wood }}>{fmt(remaining)}</strong> để được miễn phí vận chuyển 🚚
              </p>
              <div style={{ height: 6, background: C.beige, borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${progress}%`, background: C.wood, borderRadius: 3, transition: "width 0.4s" }} />
              </div>
            </div>
          )}
          {remaining <= 0 && (
            <div style={{ background: "#EEF4EA", borderRadius: 8, padding: "12px 20px", border: `1px solid #8FA67A`, marginTop: 8 }}>
              <p style={{ fontSize: 13, color: C.green, margin: 0, fontWeight: 600 }}>✓ Bạn được miễn phí vận chuyển!</p>
            </div>
          )}
        </div>

        {/* ── Order Summary ──────────────────────────────────────────── */}
        <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.sand}`, padding: 28, position: "sticky", top: 84 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: C.dark, margin: "0 0 24px", paddingBottom: 16, borderBottom: `1px solid ${C.beige}` }}>
            Tóm tắt đơn hàng
          </h3>

          {/* Voucher */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.dark, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Mã giảm giá</label>
            {voucherData ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#EEF4EA", borderRadius: 6, padding: "10px 14px", border: `1px solid #8FA67A` }}>
                <span style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>✓ {voucherData.voucherCode}</span>
                <button onClick={removeVoucher} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 16 }}>✕</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text" placeholder="Nhập mã voucher"
                    value={voucherInput}
                    onChange={(e) => { setVoucherInput(e.target.value.toUpperCase()); setVoucherError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                    style={{ flex: 1, padding: "10px 12px", border: `1px solid ${voucherError ? C.error : C.sand}`, borderRadius: 6, fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: "none" }}
                  />
                  <button onClick={handleApplyVoucher} disabled={voucherLoading}
                    style={{ background: C.dark, color: "#fff", border: "none", borderRadius: 6, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif", whiteSpace: "nowrap" }}>
                    {voucherLoading ? "..." : "Áp dụng"}
                  </button>
                </div>
                {voucherError && <p style={{ fontSize: 11, color: C.error, margin: "6px 0 0" }}>{voucherError}</p>}
              </>
            )}
          </div>

          {/* Price breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {[
              ["Tạm tính", fmt(subtotal)],
              ...(discount > 0 ? [["Giảm giá", `-${fmt(discount)}`]] : []),
              ["Vận chuyển", shippingFee === 0 ? "Miễn phí" : fmt(shippingFee)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666" }}>
                <span>{k}</span>
                <span style={{ color: k === "Giảm giá" ? C.green : "inherit", fontWeight: k === "Giảm giá" ? 600 : 400 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: C.dark, borderTop: `1px solid ${C.sand}`, paddingTop: 16, marginBottom: 24 }}>
            <span>Tổng cộng</span>
            <span style={{ color: C.wood }}>{fmt(total)}</span>
          </div>

          <button onClick={() => setShowModal(true)}
            style={{ width: "100%", padding: "14px 0", background: C.dark, color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif", transition: "background 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.wood)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.dark)}>
            Tiến hành thanh toán
          </button>

          <button onClick={() => navigate("shop")}
            style={{ width: "100%", padding: "12px 0", background: "none", border: `1px solid ${C.sand}`, borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer", color: C.dark, fontFamily: "'Poppins', sans-serif", marginTop: 10 }}>
            ← Tiếp tục mua sắm
          </button>
        </div>
      </div>

      {/* ── Checkout Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 12, maxWidth: 600, width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 28px", borderBottom: `1px solid ${C.beige}`, background: C.cream }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: C.dark, margin: 0 }}>Thông tin giao hàng</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#bbb" }}>✕</button>
            </div>

            <div style={{ padding: "24px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <ModalField label="Họ và tên *" error={formErrors.fullName}>
                  <ModalInput name="fullName" placeholder="Nguyễn Văn A" value={formData.fullName} onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))} hasError={!!formErrors.fullName} disabled={orderLoading} />
                </ModalField>
                <ModalField label="Email *" error={formErrors.email}>
                  <ModalInput name="email" type="email" placeholder="email@example.com" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} hasError={!!formErrors.email} disabled={orderLoading} />
                </ModalField>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <ModalField label="Số điện thoại *" error={formErrors.phone}>
                  <ModalInput name="phone" type="tel" placeholder="0912345678" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} hasError={!!formErrors.phone} disabled={orderLoading} />
                </ModalField>
                <ModalField label="Tỉnh/Thành phố *" error={formErrors.city}>
                  <ModalInput name="city" placeholder="TP. Hồ Chí Minh" value={formData.city} onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))} hasError={!!formErrors.city} disabled={orderLoading} />
                </ModalField>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <ModalField label="Quận/Huyện *" error={formErrors.district}>
                  <ModalInput name="district" placeholder="Quận 1" value={formData.district} onChange={(e) => setFormData(p => ({ ...p, district: e.target.value }))} hasError={!!formErrors.district} disabled={orderLoading} />
                </ModalField>
                <ModalField label="Phường/Xã">
                  <ModalInput name="ward" placeholder="Phường Bến Nghé" value={formData.ward} onChange={(e) => setFormData(p => ({ ...p, ward: e.target.value }))} disabled={orderLoading} />
                </ModalField>
              </div>
              <ModalField label="Địa chỉ chi tiết *" error={formErrors.address} style={{ marginBottom: 16 }}>
                <ModalInput name="address" placeholder="123 Đường Nguyễn Huệ" value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} hasError={!!formErrors.address} disabled={orderLoading} />
              </ModalField>
              <ModalField label="Ghi chú" style={{ marginBottom: 24 }}>
                <textarea name="notes" placeholder="Ghi chú thêm..." value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} disabled={orderLoading} rows={2}
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.sand}`, borderRadius: 6, fontSize: 13, fontFamily: "'Poppins', sans-serif", resize: "none", outline: "none", boxSizing: "border-box" }} />
              </ModalField>

              {/* Order total summary */}
              <div style={{ background: C.beige, borderRadius: 8, padding: 16, marginBottom: 20 }}>
                {[["Tạm tính", fmt(subtotal)], ...(discount > 0 ? [["Giảm giá", `-${fmt(discount)}`]] : []), ["Vận chuyển", shippingFee === 0 ? "Miễn phí" : fmt(shippingFee)]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, color: "#666" }}><span>{k}</span><span>{v}</span></div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: C.dark, borderTop: `1px solid ${C.sand}`, paddingTop: 10, marginTop: 4 }}>
                  <span>Tổng cộng</span><span>{fmt(total)}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button onClick={() => setShowModal(false)} disabled={orderLoading}
                  style={{ padding: "13px 0", background: C.beige, border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: C.dark }}>
                  Hủy
                </button>
                <button onClick={handleCheckout} disabled={orderLoading}
                  style={{ padding: "13px 0", background: orderLoading ? C.sand : C.wood, border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: orderLoading ? "not-allowed" : "pointer", color: "#fff", fontFamily: "'Poppins', sans-serif", transition: "background 0.2s" }}>
                  {orderLoading ? "Đang xử lý..." : "Thanh toán VNPay →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalField({ label, error, children, style: s }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...s }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: C.dark, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
      {children}
      {error && <p style={{ margin: 0, fontSize: 11, color: C.error }}>{error}</p>}
    </div>
  );
}

function ModalInput({ hasError, ...props }) {
  return (
    <input {...props} style={{ padding: "10px 12px", border: `1px solid ${hasError ? C.error : C.sand}`, borderRadius: 6, fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: "none", transition: "border-color 0.2s", width: "100%", boxSizing: "border-box" }}
      onFocus={(e) => { if (!hasError) e.target.style.borderColor = C.wood; }}
      onBlur={(e) => { if (!hasError) e.target.style.borderColor = C.sand; }} />
  );
}