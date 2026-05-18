import ProductCard from "../components/ProductCard";
import FadeUp from "../components/FadeUp";
import { products } from "../../../data/products";

export default function ShopPage() {
  return (
    <div style={{ paddingTop: 80 }}>
      {/* HEADER */}
      <div style={{
        backgroundColor: "#FAF7F2",
        borderBottom: "1px solid #D9C9B0",
        padding: "40px 0 32px",
        textAlign: "center"
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 40,
          fontWeight: 600,
          color: "#4A2C1A",
          margin: 0
        }}>
          Cửa hàng
        </h1>
        <p style={{
          fontSize: 13,
          color: "#C4A882",
          marginTop: 8,
          letterSpacing: "0.04em"
        }}>
          Home <span style={{ margin: "0 8px", color: "#D9C9B0" }}>/</span>
          <span style={{ color: "#8B5E3C", fontWeight: 500 }}>Shop</span>
        </p>
      </div>

      {/* PRODUCTS GRID */}
      <div className="container" style={{ padding: "60px 0" }}>
        <FadeUp>
          <h2 style={{
            textAlign: "center",
            marginBottom: 40,
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            color: "#4A2C1A"
          }}>
            Tất cả sản phẩm
          </h2>
        </FadeUp>

        <div className="grid grid-4">
          {products.map(product => (
            <FadeUp key={product.id}>
              <ProductCard product={product} />
            </FadeUp>
          ))}
        </div>
      </div>
    </div>
  );
}