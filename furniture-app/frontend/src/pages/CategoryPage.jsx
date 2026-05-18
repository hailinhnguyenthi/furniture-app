import { useStore } from "../../../store/store";
import { products } from "../../../data/products";
import ProductCard from "../components/ProductCard";
import FadeUp from "../components/FadeUp";

const colors = {
  cream: "#FAF7F2",
  beige: "#F0E8DC",
  dark: "#4A2C1A",
  wood: "#8B5E3C",
  sand: "#D9C9B0",
};

export default function CategoryPage() {
  const { selectedCategory, setPage } = useStore();

  // Filter products by selected category
  const categoryProducts = products.filter(
    (p) => p.category === selectedCategory
  );

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.hero}>
        <FadeUp>
          <h1 style={styles.heroTitle}>{selectedCategory}</h1>
          <p style={styles.breadcrumb}>
            Home <span style={{ margin: "0 8px", color: colors.sand }}>/</span>
            <span style={styles.breadcrumbActive}>{selectedCategory}</span>
          </p>
        </FadeUp>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.container}>
        {/* FILTERS SIDEBAR */}
        <div style={styles.sidebar}>
          <FadeUp>
            <div style={styles.filterBox}>
              <h3 style={styles.filterTitle}>Lọc sản phẩm</h3>
              <p style={styles.resultCount}>
                Tìm thấy <strong>{categoryProducts.length}</strong> sản phẩm
              </p>
              <button
                onClick={() => setPage("home")}
                style={styles.backButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.wood;
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = colors.wood;
                }}
              >
                ← Quay lại
              </button>
            </div>
          </FadeUp>
        </div>

        {/* PRODUCTS GRID */}
        <div style={styles.content}>
          {categoryProducts.length === 0 ? (
            <FadeUp>
              <div style={styles.empty}>
                <p style={{ fontSize: 16, color: colors.dark }}>
                  Không có sản phẩm trong danh mục này
                </p>
              </div>
            </FadeUp>
          ) : (
            <div style={styles.grid}>
              {categoryProducts.map((product) => (
                <FadeUp key={product.id}>
                  <ProductCard product={product} />
                </FadeUp>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: colors.cream,
  },
  // Hero
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
    color: colors.dark,
    margin: 0,
  },
  breadcrumb: {
    fontSize: 13,
    color: "#C4A882",
    marginTop: 8,
    letterSpacing: "0.04em",
  },
  breadcrumbActive: {
    color: colors.wood,
    fontWeight: 500,
  },
  // Layout
  container: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "48px 24px",
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: 40,
    alignItems: "start",
  },
  // Sidebar
  sidebar: {
    position: "sticky",
    top: 100,
  },
  filterBox: {
    background: "#fff",
    borderRadius: 8,
    padding: 24,
    border: `1px solid ${colors.sand}`,
  },
  filterTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 600,
    color: colors.dark,
    margin: 0,
    marginBottom: 16,
  },
  resultCount: {
    fontSize: 13,
    color: "#999",
    margin: 0,
    marginBottom: 20,
  },
  backButton: {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "transparent",
    border: `1px solid ${colors.wood}`,
    borderRadius: 4,
    color: colors.wood,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  // Content
  content: {
    minHeight: "500px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 24,
  },
  empty: {
    textAlign: "center",
    padding: "60px 40px",
    background: "#fff",
    borderRadius: 8,
    border: `1px solid ${colors.sand}`,
  },
};
