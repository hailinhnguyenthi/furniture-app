import { useState, useEffect } from "react";
import { useStore } from "../../../store/store";
import { fetchProductDetail } from "../services/orderService";
import { products as mockProducts } from "../../../data/products";
import FadeUp from "../components/FadeUp";
import ProductCard from "../components/ProductCard";

const C = {
    cream: "#FAF7F2", beige: "#F0E8DC", dark: "#4A2C1A",
    wood: "#8B5E3C", sand: "#D9C9B0", error: "#C47B5A",
    green: "#6B7C5C",
};

export default function ProductDetailPage() {
    const { selectedProduct, navigate, addToCart, toggleWishlist, isWishlisted, showToast } = useStore();

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImg, setActiveImg] = useState(0);

    useEffect(() => {
        if (!selectedProduct) { navigate("shop"); return; }
        setLoading(true);
        setQuantity(1);
        setActiveImg(0);

        // Thử fetch từ API, fallback sang mock data
        fetchProductDetail(selectedProduct)
            .then((data) => {
                setProduct(data.product);
                setRelated(data.related || []);
            })
            .catch(() => {
                // Fallback: tìm trong mock data
                const found = mockProducts.find(
                    (p) => p.id === Number(selectedProduct) || p.id === selectedProduct
                );
                if (found) {
                    setProduct(found);
                    setRelated(mockProducts.filter(p => p.category === found.category && p.id !== found.id).slice(0, 4));
                } else {
                    navigate("shop");
                }
            })
            .finally(() => setLoading(false));
    }, [selectedProduct]);

    if (loading) return <LoadingScreen />;
    if (!product) return null;

    const images = product.images?.length ? product.images : [product.img];
    const inWish = isWishlisted(product._id || product.id);
    const unitPrice = product.salePrice || product.price;
    const discount = product.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) addToCart(product);
        showToast({ message: `✓ Đã thêm ${quantity} x ${product.name} vào giỏ hàng`, type: "success" });
    };

    return (
        <div style={{ background: C.cream, minHeight: "100vh" }}>

            {/* Breadcrumb */}
            <div style={{ background: C.beige, borderBottom: `1px solid ${C.sand}`, padding: "14px 40px" }}>
                <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#999" }}>
                    <button onClick={() => navigate("home")} style={styles.breadBtn}>Trang chủ</button>
                    <span>/</span>
                    <button onClick={() => navigate("shop")} style={styles.breadBtn}>Cửa hàng</button>
                    <span>/</span>
                    <button onClick={() => { navigate("category", { category: product.category }); }} style={styles.breadBtn}>
                        {product.category}
                    </button>
                    <span>/</span>
                    <span style={{ color: C.wood, fontWeight: 500 }}>{product.name}</span>
                </div>
            </div>

            {/* Main content */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 40px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>

                    {/* ── Left: Images ────────────────────────────────────────────── */}
                    <FadeUp>
                        <div>
                            {/* Main image */}
                            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: C.beige, marginBottom: 16, aspectRatio: "1/1" }}>
                                <img
                                    src={images[activeImg]}
                                    alt={product.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.3s" }}
                                />
                                {discount > 0 && (
                                    <div style={{ position: "absolute", top: 16, left: 16, background: C.error, color: "#fff", borderRadius: 4, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
                                        -{discount}%
                                    </div>
                                )}
                                {product.isNew && (
                                    <div style={{ position: "absolute", top: discount > 0 ? 48 : 16, left: 16, background: C.green, color: "#fff", borderRadius: 4, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
                                        NEW
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail strip */}
                            {images.length > 1 && (
                                <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
                                    {images.map((src, i) => (
                                        <button key={i} onClick={() => setActiveImg(i)}
                                            style={{
                                                flexShrink: 0, width: 72, height: 72, borderRadius: 8,
                                                overflow: "hidden", border: `2px solid ${i === activeImg ? C.wood : "transparent"}`,
                                                cursor: "pointer", background: "none", padding: 0, transition: "border-color 0.2s",
                                            }}>
                                            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </FadeUp>

                    {/* ── Right: Info ─────────────────────────────────────────────── */}
                    <FadeUp>
                        <div>
                            {/* Category badge */}
                            <span style={{ fontSize: 11, fontWeight: 600, color: C.wood, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                                {product.category}
                            </span>

                            {/* Name */}
                            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, color: C.dark, margin: "8px 0 16px", lineHeight: 1.3 }}>
                                {product.name}
                            </h1>

                            {/* Price */}
                            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
                                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700, color: product.salePrice ? C.error : C.dark }}>
                                    {unitPrice.toLocaleString("vi-VN")}₫
                                </span>
                                {product.salePrice && (
                                    <span style={{ fontSize: "1.1rem", color: "#bbb", textDecoration: "line-through" }}>
                                        {product.price.toLocaleString("vi-VN")}₫
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, marginBottom: 28 }}>
                                {product.description || "Sản phẩm nội thất cao cấp được làm từ vật liệu chọn lọc, thiết kế tinh tế phù hợp với mọi không gian sống."}
                            </p>

                            {/* Stock */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: (product.stock ?? 99) > 0 ? C.green : C.error }} />
                                <span style={{ fontSize: 13, color: (product.stock ?? 99) > 0 ? C.green : C.error, fontWeight: 500 }}>
                                    {(product.stock ?? 99) > 0 ? `Còn hàng${product.stock ? ` (${product.stock})` : ""}` : "Hết hàng"}
                                </span>
                            </div>

                            {/* Quantity selector */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: C.dark, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                                    Số lượng
                                </label>
                                <div style={{ display: "flex", alignItems: "center", gap: 0, border: `1px solid ${C.sand}`, borderRadius: 6, width: "fit-content", overflow: "hidden" }}>
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyBtn}>−</button>
                                    <span style={{ width: 52, textAlign: "center", fontSize: 15, fontWeight: 600, color: C.dark, padding: "10px 0" }}>
                                        {quantity}
                                    </span>
                                    <button onClick={() => setQuantity(q => Math.min(product.stock ?? 99, q + 1))} style={styles.qtyBtn}>+</button>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={(product.stock ?? 99) <= 0}
                                    style={{
                                        flex: 1, padding: "14px 0",
                                        background: (product.stock ?? 99) > 0 ? C.dark : C.sand,
                                        color: "#fff", border: "none", borderRadius: 6,
                                        fontSize: 14, fontWeight: 600,
                                        fontFamily: "'Poppins', sans-serif",
                                        cursor: (product.stock ?? 99) > 0 ? "pointer" : "not-allowed",
                                        transition: "background 0.2s",
                                    }}
                                    onMouseEnter={(e) => (product.stock ?? 99) > 0 && (e.currentTarget.style.background = C.wood)}
                                    onMouseLeave={(e) => (product.stock ?? 99) > 0 && (e.currentTarget.style.background = C.dark)}
                                >
                                    {(product.stock ?? 99) > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
                                </button>

                                <button
                                    onClick={() => toggleWishlist(product)}
                                    title={inWish ? "Bỏ khỏi wishlist" : "Thêm vào wishlist"}
                                    style={{
                                        width: 48, height: 48, border: `1px solid ${inWish ? C.error : C.sand}`,
                                        borderRadius: 6, background: inWish ? "#FBF0ED" : "#fff",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24"
                                        fill={inWish ? C.error : "none"}
                                        stroke={inWish ? C.error : C.sand}
                                        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Meta info */}
                            <div style={{ borderTop: `1px solid ${C.sand}`, paddingTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                                {[
                                    ["Danh mục", product.category],
                                    ["Mã SKU", `FNR-${(product._id || product.id).toString().slice(-6).toUpperCase()}`],
                                    ["Tình trạng", (product.stock ?? 99) > 0 ? "Còn hàng" : "Hết hàng"],
                                ].map(([label, value]) => (
                                    <div key={label} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                                        <span style={{ color: "#999", minWidth: 80 }}>{label}:</span>
                                        <span style={{ color: C.dark, fontWeight: 500 }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeUp>
                </div>

                {/* ── Related Products ─────────────────────────────────────────────── */}
                {related.length > 0 && (
                    <div style={{ marginTop: 80 }}>
                        <FadeUp>
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 600, color: C.dark, textAlign: "center", marginBottom: 40 }}>
                                Sản phẩm liên quan
                            </h2>
                        </FadeUp>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
                            {related.map((p) => (
                                <FadeUp key={p._id || p.id}>
                                    <ProductCard product={p} />
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function LoadingScreen() {
    return (
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF7F2" }}>
            <div style={{ textAlign: "center" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" strokeWidth="1.5" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <p style={{ fontSize: 13, color: "#8B5E3C", marginTop: 12, fontFamily: "'Poppins', sans-serif" }}>Đang tải...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
    breadBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#999", fontFamily: "'Poppins', sans-serif", padding: 0, transition: "color 0.2s" },
    qtyBtn: { background: "none", border: "none", width: 40, height: 44, fontSize: 18, cursor: "pointer", color: "#8B5E3C", fontFamily: "'Poppins', sans-serif", transition: "background 0.2s" },
};