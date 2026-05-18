import { useStore } from "../../../store/store";
import { theme } from "../../../styles/theme";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { addToCart } = useStore();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -8 }}
      style={{
        background: theme.soft,
        borderRadius: 6,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered
          ? "0 16px 40px rgba(0,0,0,0.15)"
          : "0 2px 8px rgba(0,0,0,0.05)",
        transition: "all 0.3s"
      }}
    >
      {/* IMAGE */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <motion.img
          src={product.img}
          alt={product.name}
          style={{
            width: "100%",
            height: 220,
            objectFit: "cover"
          }}
          animate={{ scale: hovered ? 1.1 : 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* OVERLAY */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            opacity: hovered ? 1 : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "0.3s"
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            style={{
              background: "#fff",
              color: theme.dark,
              padding: "10px 20px",
              border: "none",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: 16 }}>
        <h3 style={{ color: theme.dark, margin: "8px 0" }}>
          {product.name}
        </h3>

        <p style={{ color: theme.primary, fontWeight: 600 }}>
          {product.price.toLocaleString()}₫
        </p>
      </div>
    </motion.div>
  );
}