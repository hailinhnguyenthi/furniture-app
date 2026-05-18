import FadeUp from "./FadeUp";

const colors = {
  cream: "#FAF7F2",
  beige: "#F0E8DC",
  wood: "#8B5E3C",
  dark: "#4A2C1A",
};

export default function TropicalConcept() {
  return (
    <section style={styles.section}>
      {/* Header */}
      <div style={styles.header}>
        <FadeUp>
          <h2 style={styles.title}>TROPICAL CONCEPT</h2>
        </FadeUp>
      </div>

      {/* Grid Images */}
      <div style={styles.grid}>
        {tropicalImages.map((img, i) => (
          <FadeUp key={i}>
            <div
              style={{
                ...styles.imageContainer,
                ...(img.big && styles.imageBig),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <img
                src={img.src}
                alt={`Tropical ${i + 1}`}
                style={styles.image}
              />
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

// ─── Data ───────────────────────────────────────────────────────────────
const tropicalImages = [
  {
    src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop",
    big: true,
  },
  {
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=600&h=400&fit=crop",
  },
  {
    src: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop",
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
    marginBottom: 50,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 40,
    fontWeight: 600,
    color: colors.dark,
    margin: 0,
    letterSpacing: 2,
  },
  grid: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 20,
    height: "400px",
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 12,
    cursor: "pointer",
    transition: "transform 0.4s ease",
  },
  imageBig: {
    gridRow: "1 / 2",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
};
