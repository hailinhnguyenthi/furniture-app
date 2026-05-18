import { useStore } from "../../../store/store";
import { useState } from "react";
import { createPayment, generateOrderCode } from "../services/paymentService";
import PaymentModal from "../components/PaymentModal";

// ─── Inline styles using Funiro color palette ───────────────────────────────
const colors = {
  cream:      "#FAF7F2",
  beige:      "#F0E8DC",
  sand:       "#D9C9B0",
  tan:        "#C4A882",
  wood:       "#8B5E3C",
  espresso:   "#4A2C1A",
  terracotta: "#C47B5A",
  rust:       "#9B4E2E",
  sage:       "#8FA67A",
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: colors.cream,
    fontFamily: "'Poppins', sans-serif",
    color: colors.espresso,
    paddingTop: 80,
  },
  // ── Header breadcrumb ──────────────────────────────────────────────────
  hero: {
    backgroundColor: colors.beige,
    borderBottom: `1px solid ${colors.sand}`,
    padding: "40px 0 32px",
    textAlign: "center",
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 40,
    fontWeight: 600,
    color: colors.espresso,
    margin: 0,
  },
  breadcrumb: {
    fontSize: 13,
    color: colors.tan,
    marginTop: 8,
    letterSpacing: "0.04em",
  },
  breadcrumbActive: {
    color: colors.wood,
    fontWeight: 500,
  },
  // ── Layout ────────────────────────────────────────────────────────────
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "48px 24px",
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    gap: 32,
    alignItems: "start",
  },
  // ── Cart table ────────────────────────────────────────────────────────
  tableWrap: {},
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 40px",
    gap: 12,
    backgroundColor: colors.beige,
    padding: "14px 20px",
    borderRadius: 4,
    marginBottom: 12,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: colors.wood,
  },
  cartItem: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 40px",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    border: `1px solid ${colors.sand}`,
    borderRadius: 6,
    padding: "16px 20px",
    marginBottom: 10,
    transition: "box-shadow 0.25s",
  },
  itemInfo: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 4,
    objectFit: "cover",
    backgroundColor: colors.beige,
    flexShrink: 0,
  },
  itemImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 4,
    backgroundColor: colors.beige,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 15,
    fontWeight: 600,
    color: colors.espresso,
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: colors.tan,
  },
  itemPrice: {
    fontSize: 14,
    color: colors.wood,
    fontWeight: 500,
  },
  // ── Quantity control ──────────────────────────────────────────────────
  qtyControl: {
    display: "flex",
    alignItems: "center",
    border: `1px solid ${colors.sand}`,
    borderRadius: 4,
    overflow: "hidden",
    width: "fit-content",
  },
  qtyBtn: {
    width: 32,
    height: 32,
    border: "none",
    backgroundColor: colors.beige,
    color: colors.wood,
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  qtyValue: {
    width: 36,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 500,
    color: colors.espresso,
    backgroundColor: "#fff",
    border: "none",
    outline: "none",
    padding: "0 4px",
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.wood,
  },
  removeBtn: {
    width: 32,
    height: 32,
    border: "none",
    backgroundColor: "transparent",
    color: colors.tan,
    cursor: "pointer",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    fontSize: 18,
  },
  // ── Summary panel ─────────────────────────────────────────────────────
  summary: {
    backgroundColor: colors.beige,
    borderRadius: 6,
    padding: "28px 24px",
    border: `1px solid ${colors.sand}`,
    position: "sticky",
    top: 100,
  },
  summaryTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24,
    fontWeight: 600,
    color: colors.espresso,
    marginBottom: 24,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    marginBottom: 14,
    borderBottom: `1px solid ${colors.sand}`,
    fontSize: 14,
    color: colors.wood,
  },
  summaryTotal: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 24,
    marginBottom: 24,
    fontSize: 16,
    fontWeight: 600,
    color: colors.espresso,
    borderBottom: `2px solid ${colors.wood}`,
  },
  totalAmount: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    color: colors.wood,
  },
  // ── Promo ─────────────────────────────────────────────────────────────
  promoWrap: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
  },
  promoInput: {
    flex: 1,
    padding: "10px 14px",
    border: `1px solid ${colors.sand}`,
    borderRadius: 4,
    fontSize: 13,
    color: colors.espresso,
    backgroundColor: "#fff",
    outline: "none",
    fontFamily: "'Poppins', sans-serif",
  },
  promoBtn: {
    padding: "10px 16px",
    backgroundColor: "transparent",
    border: `1px solid ${colors.wood}`,
    borderRadius: 4,
    color: colors.wood,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.08em",
    cursor: "pointer",
    transition: "all 0.25s",
    fontFamily: "'Poppins', sans-serif",
  },
  checkoutBtn: {
    display: "block",
    width: "100%",
    padding: "15px 32px",
    backgroundColor: colors.wood,
    color: colors.cream,
    border: "none",
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "background 0.3s, transform 0.15s",
    fontFamily: "'Poppins', sans-serif",
  },
  shopLink: {
    display: "block",
    textAlign: "center",
    marginTop: 14,
    fontSize: 12,
    color: colors.wood,
    textDecoration: "underline",
    letterSpacing: "0.05em",
    cursor: "pointer",
  },
  // ── Trust badges ──────────────────────────────────────────────────────
  trustRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 16,
    borderTop: `1px solid ${colors.sand}`,
  },
  trustItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    fontSize: 10,
    letterSpacing: "0.08em",
    color: colors.tan,
    textTransform: "uppercase",
    textAlign: "center",
  },
  // ── Empty state ───────────────────────────────────────────────────────
  empty: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "80px 40px",
    backgroundColor: "#fff",
    borderRadius: 6,
    border: `1px solid ${colors.sand}`,
  },
  emptyTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    color: colors.espresso,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.tan,
    marginBottom: 28,
  },
  emptyBtn: {
    display: "inline-block",
    padding: "13px 36px",
    backgroundColor: colors.wood,
    color: colors.cream,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
    border: "none",
    fontFamily: "'Poppins', sans-serif",
  },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={colors.tan} strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconTruck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={colors.tan} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 5v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
const IconReturn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={colors.tan} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
const IconChair = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke={colors.tan} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h18M5 7V4a1 1 0 011-1h12a1 1 0 011 1v3M4 7v10M20 7v10M7 17h10M7 17v3M17 17v3" />
  </svg>
);

// ─── Format currency ──────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

// ─── CartPage ──────────────────────────────────────────────────────────────────
export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, setPage } = useStore();

  const [promo, setPromo]           = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const subtotal  = cart.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0);
  const shipping  = subtotal > 1500000 ? 0 : 150000;
  const discount  = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total     = subtotal + shipping - discount;

  const handleQty = (id, delta) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    const next = (item.quantity ?? 1) + delta;
    if (next < 1) return;
    updateQuantity?.(id, next);
  };

  const handlePromo = () => {
    if (promo.trim().toUpperCase() === "FUNIRO10") setPromoApplied(true);
    else alert("Mã giảm giá không hợp lệ. Thử FUNIRO10 nhé!");
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng trống. Vui lòng thêm sản phẩm.");
      return;
    }
    setIsPaymentModalOpen(true);
  };

  // ── Checkout success screen ──────────────────────────────────────────────
  if (checkoutDone) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.hero }}>
          <h1 style={styles.heroTitle}>Đặt hàng thành công!</h1>
        </div>
        <div style={{ maxWidth: 560, margin: "60px auto", textAlign: "center", padding: "0 24px" }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: colors.espresso, marginBottom: 12 }}>
            Cảm ơn bạn đã tin tưởng Funiro
          </h2>
          <p style={{ fontSize: 14, color: colors.tan, lineHeight: 1.8, marginBottom: 32 }}>
            Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ liên hệ xác nhận trong vòng 24 giờ.
          </p>
          <button style={styles.emptyBtn} onClick={() => setCheckoutDone(false)}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ── Hero breadcrumb ─────────────────────────────────────────────── */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Giỏ hàng</h1>
        <p style={styles.breadcrumb}>
          Home <span style={{ margin: "0 8px", color: colors.sand }}>/</span>
          <span style={styles.breadcrumbActive}>Cart</span>
        </p>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────────── */}
      <div style={styles.container}>

        {cart.length === 0 ? (
          /* ── Empty state ──────────────────────────────────────────────── */
          <div style={styles.empty}>
            <div style={{ marginBottom: 20 }}>
              <IconChair />
            </div>
            <h2 style={styles.emptyTitle}>Giỏ hàng của bạn đang trống</h2>
            <p style={styles.emptyText}>
              Khám phá bộ sưu tập nội thất cao cấp của chúng tôi
            </p>
            <button style={styles.emptyBtn} onClick={() => setPage("shop")}>
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <>
            {/* ── Cart table ──────────────────────────────────────────────── */}
            <div style={styles.tableWrap}>
              {/* Table header */}
              <div style={styles.tableHeader}>
                <span style={styles.tableHeaderCell}>Sản phẩm</span>
                <span style={{ ...styles.tableHeaderCell, textAlign: "center" }}>Đơn giá</span>
                <span style={{ ...styles.tableHeaderCell, textAlign: "center" }}>Số lượng</span>
                <span style={{ ...styles.tableHeaderCell, textAlign: "center" }}>Thành tiền</span>
                <span />
              </div>

              {/* Items */}
              {cart.map((item) => {
                const qty      = item.quantity ?? 1;
                const price    = item.price ?? 0;
                const imgSrc   = item.img ?? item.image;
                const subtotalItem = price * qty;

                return (
                  <div
                    key={item.id}
                    style={{
                      ...styles.cartItem,
                      boxShadow: hoveredItem === item.id
                        ? "0 6px 24px rgba(74,44,26,0.10)"
                        : "none",
                    }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Product info */}
                    <div style={styles.itemInfo}>
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={item.name}
                          style={styles.itemImage}
                        />
                      ) : (
                        <div style={styles.itemImagePlaceholder}>
                          <IconChair />
                        </div>
                      )}
                      <div>
                        <div style={styles.itemName}>{item.name}</div>
                        {item.category && (
                          <div style={styles.itemCategory}>{item.category}</div>
                        )}
                        {item.variant && (
                          <div style={{ fontSize: 11, color: colors.tan, marginTop: 4 }}>
                            {item.variant}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Unit price */}
                    <div style={{ ...styles.itemPrice, textAlign: "center" }}>
                      {fmt(price)}
                    </div>

                    {/* Quantity */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div style={styles.qtyControl}>
                        <button
                          style={styles.qtyBtn}
                          onClick={() => handleQty(item.id, -1)}
                          aria-label="Giảm"
                        >
                          −
                        </button>
                        <span style={styles.qtyValue}>{qty}</span>
                        <button
                          style={styles.qtyBtn}
                          onClick={() => handleQty(item.id, 1)}
                          aria-label="Tăng"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div style={{ ...styles.itemSubtotal, textAlign: "center" }}>
                      {fmt(subtotalItem)}
                    </div>

                    {/* Remove */}
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeFromCart?.(item.id)}
                      title="Xóa"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#fee";
                        e.currentTarget.style.color = colors.rust;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = colors.tan;
                      }}
                    >
                      <IconX />
                    </button>
                  </div>
                );
              })}

              {/* Continue shopping hint */}
              <p style={{ fontSize: 12, color: colors.tan, marginTop: 16, letterSpacing: "0.04em" }}>
                💡 Miễn phí vận chuyển cho đơn hàng trên{" "}
                <strong style={{ color: colors.wood }}>1.500.000đ</strong>
              </p>
            </div>

            {/* ── Order summary ──────────────────────────────────────────── */}
            <div style={styles.summary}>
              <h2 style={styles.summaryTitle}>Tóm tắt đơn hàng</h2>

              <div style={styles.summaryRow}>
                <span>Tạm tính ({cart.length} sản phẩm)</span>
                <span>{fmt(subtotal)}</span>
              </div>

              <div style={styles.summaryRow}>
                <span>Phí vận chuyển</span>
                <span style={{ color: shipping === 0 ? colors.sage : colors.espresso }}>
                  {shipping === 0 ? "Miễn phí" : fmt(shipping)}
                </span>
              </div>

              {promoApplied && (
                <div style={{ ...styles.summaryRow, color: colors.sage }}>
                  <span>Giảm giá (FUNIRO10)</span>
                  <span>− {fmt(discount)}</span>
                </div>
              )}

              <div style={styles.summaryTotal}>
                <span>Tổng cộng</span>
                <span style={styles.totalAmount}>{fmt(total)}</span>
              </div>

              {/* Promo code */}
              {!promoApplied && (
                <div style={styles.promoWrap}>
                  <input
                    style={styles.promoInput}
                    placeholder="Mã giảm giá"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePromo()}
                  />
                  <button
                    style={styles.promoBtn}
                    onClick={handlePromo}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.wood;
                      e.currentTarget.style.color = colors.cream;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = colors.wood;
                    }}
                  >
                    ÁP DỤNG
                  </button>
                </div>
              )}

              {promoApplied && (
                <p style={{ fontSize: 12, color: colors.sage, marginBottom: 16, letterSpacing: "0.04em" }}>
                  ✓ Mã FUNIRO10 đã được áp dụng
                </p>
              )}

              {/* Checkout button */}
              <button
                style={styles.checkoutBtn}
                onClick={handleCheckout}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.espresso;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.wood;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Tiến hành thanh toán
              </button>

              <span style={styles.shopLink} onClick={() => setPage("shop")}>
                ← Tiếp tục mua sắm
              </span>

              {/* Trust badges */}
              <div style={styles.trustRow}>
                <div style={styles.trustItem}>
                  <IconShield />
                  <span>Bảo mật</span>
                </div>
                <div style={styles.trustItem}>
                  <IconTruck />
                  <span>Giao nhanh</span>
                </div>
                <div style={styles.trustItem}>
                  <IconReturn />
                  <span>Đổi 30 ngày</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cartItems={cart}
        total={total}
        discount={discount}
        shipping={shipping}
      />
    </div>
  );
}