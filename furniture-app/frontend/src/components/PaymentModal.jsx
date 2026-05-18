import { useState } from "react";
import { createPayment, generateOrderCode } from "../services/paymentService";

const colors = {
  cream: "#FAF7F2",
  beige: "#F0E8DC",
  dark: "#4A2C1A",
  wood: "#8B5E3C",
  sand: "#D9C9B0",
  error: "#C47B5A",
  success: "#6B7C5C",
};

export default function PaymentModal({ isOpen, onClose, cartItems, total, discount, shipping }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";
    if (!formData.city.trim()) newErrors.city = "Vui lòng chọn tỉnh/thành phố";
    if (!formData.district.trim()) newErrors.district = "Vui lòng nhập quận/huyện";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const orderCode = generateOrderCode();

      const paymentResult = await createPayment({
        amount: total,
        orderCode,
        orderDescription: `Đơn hàng nội thất - ${cartItems.length} sản phẩm`,
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
          notes: formData.notes,
          items: cartItems,
          total,
          discount,
          shipping,
        },
      });

      if (paymentResult.success && paymentResult.paymentUrl) {
        // Redirect to VNPay payment page
        window.location.href = paymentResult.paymentUrl;
      } else {
        alert("Không thể tạo thanh toán. Vui lòng thử lại.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Lỗi thanh toán. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Thông tin thanh toán</h2>
          <button
            onClick={onClose}
            style={styles.closeBtn}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Row 1: Full Name & Email */}
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Họ và tên *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nguyễn Văn A"
                style={{
                  ...styles.input,
                  borderColor: errors.fullName ? colors.error : colors.sand,
                }}
                disabled={loading}
              />
              {errors.fullName && <p style={styles.error}>{errors.fullName}</p>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                style={{
                  ...styles.input,
                  borderColor: errors.email ? colors.error : colors.sand,
                }}
                disabled={loading}
              />
              {errors.email && <p style={styles.error}>{errors.email}</p>}
            </div>
          </div>

          {/* Row 2: Phone & City */}
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Số điện thoại *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0912345678"
                style={{
                  ...styles.input,
                  borderColor: errors.phone ? colors.error : colors.sand,
                }}
                disabled={loading}
              />
              {errors.phone && <p style={styles.error}>{errors.phone}</p>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tỉnh/Thành phố *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="TP. Hồ Chí Minh"
                style={{
                  ...styles.input,
                  borderColor: errors.city ? colors.error : colors.sand,
                }}
                disabled={loading}
              />
              {errors.city && <p style={styles.error}>{errors.city}</p>}
            </div>
          </div>

          {/* Row 3: District & Ward */}
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Quận/Huyện *</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Quận 1"
                style={{
                  ...styles.input,
                  borderColor: errors.district ? colors.error : colors.sand,
                }}
                disabled={loading}
              />
              {errors.district && <p style={styles.error}>{errors.district}</p>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phường/Xã</label>
              <input
                type="text"
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                placeholder="Phường Bến Nghé"
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          {/* Row 4: Address */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Địa chỉ chi tiết *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="123 Đường Nguyễn Huệ"
              style={{
                ...styles.input,
                borderColor: errors.address ? colors.error : colors.sand,
              }}
              disabled={loading}
            />
            {errors.address && <p style={styles.error}>{errors.address}</p>}
          </div>

          {/* Row 5: Notes */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Ghi chú</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Ghi chú thêm về đơn hàng (tuỳ chọn)"
              style={styles.textarea}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Order Summary */}
          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <span>Tạm tính ({cartItems.length} sản phẩm)</span>
              <span>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(total - discount + shipping)}
              </span>
            </div>
            {discount > 0 && (
              <div style={styles.summaryRow}>
                <span>Giảm giá</span>
                <span style={{ color: colors.success }}>
                  -{new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(discount)}
                </span>
              </div>
            )}
            <div style={styles.summaryRow}>
              <span>Phí vận chuyển</span>
              <span>
                {shipping === 0
                  ? "Miễn phí"
                  : new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(shipping)}
              </span>
            </div>
            <div style={styles.summaryTotal}>
              <span>Tổng cộng</span>
              <span>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(total)}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={{
                ...styles.btnSecondary,
                opacity: loading ? 0.5 : 1,
              }}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                ...styles.btnPrimary,
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Tiến hành thanh toán"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    background: "#fff",
    borderRadius: 12,
    maxWidth: 600,
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: `1px solid ${colors.beige}`,
    backgroundColor: colors.cream,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24,
    fontWeight: 600,
    color: colors.dark,
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    color: colors.dark,
    padding: "0 8px",
    transition: "opacity 0.2s",
  },
  form: {
    padding: "24px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 20,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.dark,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    padding: "10px 12px",
    border: `1px solid ${colors.sand}`,
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "'Poppins', sans-serif",
    transition: "border-color 0.2s",
  },
  textarea: {
    padding: "10px 12px",
    border: `1px solid ${colors.sand}`,
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "'Poppins', sans-serif",
    resize: "none",
    transition: "border-color 0.2s",
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    margin: "4px 0 0 0",
  },
  summary: {
    backgroundColor: colors.beige,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
    fontSize: 14,
    color: colors.dark,
  },
  summaryTotal: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 12,
    borderTop: `1px solid ${colors.sand}`,
    fontSize: 16,
    fontWeight: 600,
    color: colors.dark,
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  btnPrimary: {
    padding: "12px 20px",
    backgroundColor: colors.wood,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  btnSecondary: {
    padding: "12px 20px",
    backgroundColor: colors.beige,
    color: colors.dark,
    border: `1px solid ${colors.sand}`,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};
