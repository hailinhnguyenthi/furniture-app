import { useStore } from "../../../store/store";
import { theme } from "../../../styles/theme";
import { motion } from "framer-motion";
import { useState } from "react";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

export default function ProductCard({ product }) {
  const { addToCart, navigate, setSelectedProduct, toggleWishlist, isWishlisted } = useStore();
  const [hovered, setHovered] = useState(false);

  const id = product._id || product.id;
  const inWish = isWishlisted(id);
  const price = product.salePrice || product.price;
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  const handleCardClick = () => {
    setSelectedProduct(id);
    navigate("product");
  };

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6 }}
      onClick={handleCardClick}
      style={{
        background: theme.soft,
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.3s",
        position: "relative",
      }}
    >
      {/* Badges */}
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2, display: "flex", flexDirection: "column", gap: 6 }}>
        {discount > 0 && (
          <span style={{ background: "#C47B5A", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>
            -{discount}%
          </span>
        )}
        {product.isNew && (
          <span style={{ background: "#6B7C5C", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>
            NEW
          </span>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
        style={{
          position: "absolute", top: 12, right: 12, zIndex: 2,
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,0.9)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "transform 0.2s",
          transform: inWish ? "scale(1.1)" : "scale(1)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24"
          fill={inWish ? "#C47B5A" : "none"}
          stroke={inWish ? "#C47B5A" : "#8B5E3C"}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
        </svg>
      </button>

      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden", height: 220 }}>
        <motion.img
          src={product.img}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.4 }}
        />
        {/* Hover overlay — Add to Cart */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.38)",
          opacity: hovered ? 1 : 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "opacity 0.3s",
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            style={{
              background: "#fff",
              color: theme.dark,
              padding: "10px 22px",
              border: "none",
              borderRadius: 4,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Poppins', sans-serif",
              transform: hovered ? "translateY(0)" : "translateY(8px)",
              transition: "transform 0.3s",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
          >
            + Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 18px" }}>
        <p style={{ fontSize: 10, color: "#bbb", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>
          {product.category}
        </p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.95rem", color: theme.dark, margin: "0 0 8px", lineHeight: 1.3 }}>
          {product.name}
        </h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: product.salePrice ? "#C47B5A" : theme.primary }}>
            {fmt(price)}
          </span>
          {product.salePrice && (
            <span style={{ fontSize: "0.8rem", color: "#ccc", textDecoration: "line-through" }}>
              {fmt(product.price)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}