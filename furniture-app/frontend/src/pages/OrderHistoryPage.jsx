import { useState, useEffect } from "react";
import { useStore } from "../../../store/store";
import { getMyOrders, getOrderDetail, cancelOrder } from "../services/orderService";
import FadeUp from "../components/FadeUp";

const C = { cream: "#FAF7F2", beige: "#F0E8DC", dark: "#4A2C1A", wood: "#8B5E3C", sand: "#D9C9B0", error: "#C47B5A", green: "#6B7C5C" };

const STATUS_CONFIG = {
    pending: { label: "Chờ xác nhận", color: "#D4A843", bg: "#FEF9EC" },
    confirmed: { label: "Đã xác nhận", color: "#6B7C5C", bg: "#EEF4EA" },
    shipping: { label: "Đang giao", color: "#4285F4", bg: "#EBF2FE" },
    completed: { label: "Hoàn tất", color: "#6B7C5C", bg: "#EEF4EA" },
    cancelled: { label: "Đã huỷ", color: "#C47B5A", bg: "#FBF0ED" },
};

const STATUS_TABS = [
    { value: "", label: "Tất cả" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "shipping", label: "Đang giao" },
    { value: "completed", label: "Hoàn tất" },
    { value: "cancelled", label: "Đã huỷ" },
];

export default function OrderHistoryPage() {
    const { navigate, showToast } = useStore();
    const [activeTab, setActiveTab] = useState("");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState(null);    // order đang xem chi tiết
    const [detailLoading, setDetailLoading] = useState(false);
    const [cancelTarget, setCancelTarget] = useState(null);    // orderCode cần huỷ
    const [cancelReason, setCancelReason] = useState("");
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        loadOrders();
    }, [activeTab]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await getMyOrders({ status: activeTab || undefined, limit: 20 });
            setOrders(data.orders || []);
            setPagination(data.pagination || {});
        } catch {
            // Fallback: hiện empty state
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const openDetail = async (orderCode) => {
        setDetailLoading(true);
        setDetail("loading");
        try {
            const data = await getOrderDetail(orderCode);
            setDetail(data.order);
        } catch {
            setDetail(null);
            showToast({ message: "Không thể tải chi tiết đơn hàng", type: "error" });
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelTarget) return;
        try {
            await cancelOrder(cancelTarget, cancelReason);
            showToast({ message: "Đã huỷ đơn hàng thành công", type: "success" });
            setCancelTarget(null);
            setCancelReason("");
            setDetail(null);
            loadOrders();
        } catch (err) {
            showToast({ message: err.message, type: "error" });
        }
    };

    const fmt = (n) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

    return (
        <div style={{ background: C.cream, minHeight: "100vh" }}>

            {/* Header */}
            <div style={{ background: C.beige, borderBottom: `1px solid ${C.sand}`, padding: "32px 40px 0" }}>
                <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                    <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#999", marginBottom: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Poppins', sans-serif" }}>
                        ← Trang chủ
                    </button>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700, color: C.dark, margin: "0 0 24px" }}>
                        Đơn hàng của tôi
                    </h1>

                    {/* Status tabs */}
                    <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
                        {STATUS_TABS.map(tab => (
                            <button key={tab.value} onClick={() => { setActiveTab(tab.value); setDetail(null); }}
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    padding: "12px 20px",
                                    fontSize: 13, fontFamily: "'Poppins', sans-serif",
                                    color: activeTab === tab.value ? C.wood : "#888",
                                    fontWeight: activeTab === tab.value ? 600 : 400,
                                    borderBottom: `2px solid ${activeTab === tab.value ? C.wood : "transparent"}`,
                                    whiteSpace: "nowrap", transition: "all 0.2s",
                                }}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 40px" }}>

                {/* Detail panel */}
                {detail && detail !== "loading" && (
                    <FadeUp>
                        <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.sand}`, marginBottom: 32, overflow: "hidden" }}>
                            {/* Panel header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${C.beige}`, background: C.beige }}>
                                <div>
                                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", color: C.dark, margin: 0 }}>
                                        Đơn hàng #{detail.orderCode}
                                    </h3>
                                    <p style={{ fontSize: 12, color: "#999", margin: "4px 0 0" }}>
                                        {new Date(detail.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <StatusBadge status={detail.status} />
                                    <button onClick={() => setDetail(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#bbb" }}>✕</button>
                                </div>
                            </div>

                            {/* Items */}
                            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.beige}` }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: C.dark, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Sản phẩm</p>
                                {detail.items.map((item, i) => (
                                    <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14, paddingBottom: 14, borderBottom: i < detail.items.length - 1 ? `1px solid ${C.beige}` : "none" }}>
                                        <img src={item.img} alt={item.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, background: C.beige, flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: C.dark, margin: "0 0 4px" }}>{item.name}</p>
                                            <p style={{ fontSize: 12, color: "#999", margin: 0 }}>x{item.quantity} × {fmt(item.price)}</p>
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{fmt(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Summary + Address */}
                            <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: C.dark, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>Địa chỉ giao hàng</p>
                                    {detail.shippingAddress && (
                                        <div style={{ fontSize: 13, color: "#666", lineHeight: 1.8 }}>
                                            <p style={{ margin: 0, fontWeight: 600, color: C.dark }}>{detail.shippingAddress.fullName}</p>
                                            <p style={{ margin: 0 }}>{detail.shippingAddress.phone}</p>
                                            <p style={{ margin: 0 }}>{detail.shippingAddress.address}, {detail.shippingAddress.district}, {detail.shippingAddress.city}</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: C.dark, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>Tóm tắt thanh toán</p>
                                    {[
                                        ["Tạm tính", fmt(detail.subtotal)],
                                        ...(detail.discount ? [["Giảm giá", `-${fmt(detail.discount)}`]] : []),
                                        ["Phí vận chuyển", detail.shippingFee === 0 ? "Miễn phí" : fmt(detail.shippingFee)],
                                    ].map(([k, v]) => (
                                        <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, color: "#666" }}>
                                            <span>{k}</span><span>{v}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: C.dark, borderTop: `1px solid ${C.sand}`, paddingTop: 10, marginTop: 4 }}>
                                        <span>Tổng cộng</span><span style={{ color: C.wood }}>{fmt(detail.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            {detail.statusHistory?.length > 0 && (
                                <div style={{ padding: "0 24px 24px" }}>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: C.dark, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Lịch sử trạng thái</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        {[...detail.statusHistory].reverse().map((h, i) => (
                                            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_CONFIG[h.status]?.color || C.sand, marginTop: 5, flexShrink: 0 }} />
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: C.dark, margin: 0 }}>{STATUS_CONFIG[h.status]?.label || h.status}</p>
                                                    {h.note && <p style={{ fontSize: 12, color: "#999", margin: "2px 0 0" }}>{h.note}</p>}
                                                    <p style={{ fontSize: 11, color: "#bbb", margin: "2px 0 0" }}>
                                                        {new Date(h.updatedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cancel button */}
                            {["pending", "confirmed"].includes(detail.status) && (
                                <div style={{ padding: "0 24px 24px" }}>
                                    <button
                                        onClick={() => setCancelTarget(detail.orderCode)}
                                        style={{ background: "none", border: `1px solid ${C.error}`, borderRadius: 6, padding: "10px 20px", fontSize: 13, color: C.error, cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                                        Huỷ đơn hàng
                                    </button>
                                </div>
                            )}
                        </div>
                    </FadeUp>
                )}

                {/* Order list */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: 60, color: "#bbb" }}>Đang tải đơn hàng...</div>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 80 }}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={C.sand} strokeWidth="1" style={{ marginBottom: 20 }}>
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        <p style={{ fontSize: 16, color: C.dark, marginBottom: 8 }}>Chưa có đơn hàng nào</p>
                        <button onClick={() => navigate("shop")}
                            style={{ background: C.wood, color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 13, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                            Mua sắm ngay
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {orders.map(order => (
                            <FadeUp key={order._id}>
                                <div
                                    onClick={() => openDetail(order.orderCode)}
                                    style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.sand}`, padding: 20, cursor: "pointer", transition: "box-shadow 0.2s" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(74,44,26,0.08)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0 }}>#{order.orderCode}</p>
                                            <p style={{ fontSize: 12, color: "#999", margin: "4px 0 0" }}>
                                                {new Date(order.createdAt).toLocaleDateString("vi-VN")} · {order.items.length} sản phẩm
                                            </p>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>

                                    {/* Items preview */}
                                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                                        {order.items.slice(0, 4).map((item, i) => (
                                            <img key={i} src={item.img} alt={item.name}
                                                style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.sand}` }} />
                                        ))}
                                        {order.items.length > 4 && (
                                            <div style={{ width: 44, height: 44, borderRadius: 6, background: C.beige, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.wood, fontWeight: 600 }}>
                                                +{order.items.length - 4}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontSize: 13, color: "#999" }}>Xem chi tiết →</span>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: C.wood }}>{fmt(order.total)}</span>
                                    </div>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                )}
            </div>

            {/* Cancel modal */}
            {cancelTarget && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
                    <div style={{ background: "#fff", borderRadius: 12, padding: 32, maxWidth: 440, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: C.dark, margin: "0 0 8px" }}>Xác nhận huỷ đơn hàng</h3>
                        <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>Bạn có chắc muốn huỷ đơn <strong>#{cancelTarget}</strong>?</p>
                        <textarea
                            placeholder="Lý do huỷ (tuỳ chọn)..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                            style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.sand}`, borderRadius: 6, fontSize: 13, fontFamily: "'Poppins', sans-serif", resize: "none", outline: "none", marginBottom: 20, boxSizing: "border-box" }}
                        />
                        <div style={{ display: "flex", gap: 12 }}>
                            <button onClick={() => { setCancelTarget(null); setCancelReason(""); }}
                                style={{ flex: 1, padding: "12px 0", background: C.beige, border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: C.dark }}>
                                Không
                            </button>
                            <button onClick={handleCancel}
                                style={{ flex: 1, padding: "12px 0", background: C.error, border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#fff" }}>
                                Huỷ đơn hàng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || { label: status, color: "#999", bg: "#f5f5f5" };
    return (
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: cfg.color, background: cfg.bg, padding: "4px 10px", borderRadius: 20 }}>
            {cfg.label}
        </span>
    );
}