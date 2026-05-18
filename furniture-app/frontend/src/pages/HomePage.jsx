import { useStore } from "../../../store/store";
import FadeUp from "../components/FadeUp";
import TropicalConcept from "../components/TropicalConcept";
import MatchaConcept from "../components/MatchaConcept";
import MoreProducts from "../components/MoreProducts";

export default function HomePage() {
  const { setPage } = useStore();

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      {/* HERO SECTION */}
      <div style={{
        minHeight: "90vh",
        display: "flex",
        background: "#F0E8DC",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "40px 40px",
        gap: "40px"
      }}>
        {/* LEFT - TEXT */}
        <div style={{ flex: 1 }}>
          <FadeUp>
            <div style={{
              background: "#ffffffcc",
              padding: 40,
              maxWidth: 400,
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
            }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 36,
                color: "#4A2C1A",
                marginBottom: 16,
                margin: 0
              }}>
                High-Quality Furniture Just For You
              </h1>

              <p style={{
                fontSize: 16,
                color: "#8B5E3C",
                marginBottom: 24,
                lineHeight: 1.6
              }}>
                Our furniture is made from selected and best quality materials
              </p>

              <button 
                onClick={() => setPage("shop")}
                style={{
                  background: "#8B5E3C",
                  color: "#fff",
                  padding: "14px 32px",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "0.3s",
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "0.05em"
                }}
                onMouseEnter={(e)=> e.currentTarget.style.background="#4A2C1A"}
                onMouseLeave={(e)=> e.currentTarget.style.background="#8B5E3C"}
              >
                Shop Now
              </button>
            </div>
          </FadeUp>
        </div>

        {/* RIGHT - IMAGES */}
        <div style={{
          flex: 1.2,
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 12,
          height: "500px"
        }}>
          {[
            {
              src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=800",
              big: true
            },
            {
              src: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800"
            },
            {
              src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800"
            }
          ].map((img, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 12,
                gridRow: img.big ? "1 / 3" : "auto",
                cursor: "pointer",
                transition: "transform 0.3s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <img
                src={img.src}
                alt={`Furniture ${i + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block"
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.1)",
                  transition: "0.3s"
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* TROPICAL CONCEPT SECTION */}
      <TropicalConcept />

      {/* MATCHA CONCEPT SECTION */}
      <MatchaConcept />

      {/* MORE PRODUCTS SECTION */}
      <MoreProducts />
    </div>
  );
}