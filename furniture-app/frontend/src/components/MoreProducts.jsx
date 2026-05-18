import FadeUp from "./FadeUp";
import { useStore } from "../../../store/store";

const colors = {
  cream: "#FAF7F2",
  dark: "#4A2C1A",
  wood: "#8B5E3C",
};

export default function MoreProducts() {
  const { setPage, setSelectedCategory } = useStore();

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setPage("category");
  };

  return (
    <section style={styles.section}>
      {/* Header */}
      <div style={styles.header}>
        <FadeUp>
          <h2 style={styles.title}>MORE PRODUCT</h2>
        </FadeUp>
      </div>

      {/* Category Grid */}
      <div style={styles.container}>
        {categories.map((category) => (
          <FadeUp key={category.id}>
            <button
              onClick={() => handleCategoryClick(category.name)}
              style={{
                ...styles.categoryCard,
                border: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 16px 40px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.05)";
              }}
            >
              {/* Image */}
              <div style={styles.imageContainer}>
                <img
                  src={category.image}
                  alt={category.name}
                  style={styles.image}
                />
              </div>

              {/* Category Name */}
              <h3 style={styles.categoryName}>{category.name}</h3>

              {/* Product Count */}
              <p style={styles.productCount}>{category.count} products</p>
            </button>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

// ─── Data ───────────────────────────────────────────────────────────────
const categories = [
  {
    id: 1,
    name: "LIVING ROOM",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop",
    count: 3,
  },
  {
    id: 2,
    name: "KITCHEN",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop",
    count: 3,
  },
  {
    id: 3,
    name: "BEDROOM",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=500&h=400&fit=crop",
    count: 4,
  },
  {
    id: 4,
    name: "BATHROOM",
    image:
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=400&fit=crop",
    count: 2,
  },
  {
    id: 5,
    name: "DECORATION",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=400&fit=crop",
    count: 6,
  },
];

// ─── Styles ─────────────────────────────────────────────────────────────
const styles = {
  section: {
    padding: "80px 40px",
    background: colors.cream,
  },
  header: {
    textAlign: "center",
    marginBottom: 60,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 40,
    fontWeight: 600,
    color: colors.dark,
    margin: 0,
    letterSpacing: 2,
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 30,
  },
  categoryCard: {
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
    height: 250,
    background: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.4s ease",
  },
  categoryName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 600,
    color: colors.dark,
    padding: "20px 16px 8px",
    margin: 0,
    textAlign: "center",
  },
  productCount: {
    fontSize: 12,
    color: colors.wood,
    padding: "0 16px 16px",
    margin: 0,
    textAlign: "center",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
};
