import FadeUp from "./FadeUp";

const colors = {
  cream: "#FAF7F2",
  matcha: "#A8C55B",
  matchaLight: "#D4E5B0",
  dark: "#4A2C1A",
};

export default function MatchaConcept() {
  return (
    <section style={styles.section}>
      {/* Header */}
      <div style={styles.header}>
        <FadeUp>
          <h2 style={styles.title}>MATCHA CONCEPT</h2>
        </FadeUp>
      </div>

      {/* Grid Layout */}
      <div style={styles.container}>
        <div style={styles.grid}>
          {matchaImages.map((img, i) => (
            <FadeUp key={i}>
              <div
                style={{
                  ...styles.imageBox,
                  ...(img.span && styles.imageSpan),
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
                  alt={`Matcha ${i + 1}`}
                  style={styles.image}
                />
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Content Side */}
        <div style={styles.content}>
          <FadeUp>
            <h3 style={styles.contentTitle}>Matcha Lifestyle</h3>
            <p style={styles.contentText}>
              Khám phá vẻ đẹp tự nhiên của nội thất matcha. Sự kết hợp hoàn hảo
              giữa màu sắc xanh nhạt và thiết kế hiện đại tạo nên không gian
              sống đầy bình yên và thoải mái.
            </p>
            <button style={styles.button}>Khám phá thêm</button>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── Data ───────────────────────────────────────────────────────────────
const matchaImages = [
  {
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=400&h=300&fit=crop",
    span: false,
  },
  {
    src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
    span: false,
  },
  {
    src: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=400&h=300&fit=crop",
    span: false,
  },
  {
    src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=300&fit=crop",
    span: false,
  },
];

// ─── Styles ─────────────────────────────────────────────────────────────
const styles = {
  section: {
    padding: "80px 40px",
    background: colors.matchaLight,
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
  container: {
    maxWidth: 1400,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 60,
    alignItems: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  imageBox: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 12,
    height: 250,
    cursor: "pointer",
    transition: "transform 0.4s ease",
  },
  imageSpan: {
    gridColumn: "1 / -1",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  contentTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 32,
    fontWeight: 600,
    color: colors.dark,
    margin: 0,
  },
  contentText: {
    fontSize: 15,
    color: colors.dark,
    lineHeight: 1.8,
    margin: 0,
  },
  button: {
    alignSelf: "flex-start",
    padding: "12px 28px",
    backgroundColor: colors.matcha,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.3s",
  },
};
