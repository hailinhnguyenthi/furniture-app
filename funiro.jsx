
// ═══════════════════════════════════════════════════════════════
//  FUNIRO FURNITURE — Full React SPA
//  Architecture: pages/ · components/ · hooks/ · store/ · services/
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// ─────────────────────────────────────────────────────────────
//  STORE  (Zustand-like context state)
// ─────────────────────────────────────────────────────────────
const StoreContext = createContext(null);

const PRODUCTS = [
  { id:1, name:"Sylvester", category:"Sofa", desc:"Rattan & teak — tropical comfort", price:2500000, badge:"NEW", badgeColor:"#6B7C5C", img:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80" },
  { id:2, name:"Levia", category:"Bedroom", desc:"Solid oak — timeless elegance", price:3500000, oldPrice:5000000, badge:"-30%", badgeColor:"#C47B5A", img:"https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&q=80" },
  { id:3, name:"Nacha", category:"Table", desc:"Teak & glass — modern organic", price:1900000, badge:"NEW", badgeColor:"#6B7C5C", img:"https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80" },
  { id:4, name:"Alecto", category:"Chair", desc:"Velvet & walnut — soft luxury", price:2100000, img:"https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=500&q=80" },
  { id:5, name:"Cafe", category:"Dining", desc:"Marble & iron — industrial chic", price:1700000, oldPrice:2000000, badge:"-15%", badgeColor:"#C47B5A", img:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=500&q=80" },
  { id:6, name:"Muggo", category:"Decor", desc:"Ceramic artisan — handcrafted", price:150000, badge:"NEW", badgeColor:"#6B7C5C", img:"https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=500&q=80" },
  { id:7, name:"Pingky", category:"Lighting", desc:"Rattan pendant — warm glow", price:890000, img:"https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=500&q=80" },
  { id:8, name:"Potty", category:"Decor", desc:"Terracotta — botanical accent", price:320000, oldPrice:425000, badge:"-25%", badgeColor:"#C47B5A", img:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80" },
];

function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [page, setPage] = useState("home"); // home | shop | cart | detail
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`✓ ${product.name} đã thêm vào giỏ hàng`);
  }, [showToast]);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id, delta) => {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  }, []);

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const has = prev.find(i => i.id === product.id);
      if (has) return prev.filter(i => i.id !== product.id);
      return [...prev, product];
    });
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <StoreContext.Provider value={{ cart, wishlist, page, setPage, selectedProduct, setSelectedProduct, addToCart, removeFromCart, updateQty, toggleWishlist, cartCount, cartTotal, toast, products: PRODUCTS }}>
      {children}
    </StoreContext.Provider>
  );
}

const useStore = () => useContext(StoreContext);

// ─────────────────────────────────────────────────────────────
//  HOOKS
// ─────────────────────────────────────────────────────────────
function useFadeUp(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.unobserve(el); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useScrolled(offset = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > offset);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [offset]);
  return scrolled;
}

// ─────────────────────────────────────────────────────────────
//  SERVICES  (format helpers)
// ─────────────────────────────────────────────────────────────
const formatPrice = (n) => "Rp " + n.toLocaleString("id-ID");

// ─────────────────────────────────────────────────────────────
//  COMPONENTS
// ─────────────────────────────────────────────────────────────

// Navbar
function Navbar() {
  const { cartCount, setPage, page } = useStore();
  const scrolled = useScrolled();

  const nav = [
    { label: "Home", id: "home" },
    { label: "Products", id: "shop" },
    { label: "Rooms", id: "rooms" },
    { label: "Inspirations", id: "inspiration" },
  ];

  return (
    <header style={{
      position:"fixed", top:0, left:0, right:0, zIndex:50,
      transition:"background 0.35s, box-shadow 0.35s",
      background: scrolled ? "rgba(250,247,242,0.97)" : "transparent",
      boxShadow: scrolled ? "0 2px 20px rgba(74,44,26,0.10)" : "none",
    }}>
      <nav style={{ maxWidth:1280, margin:"0 auto", padding:"1rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {/* Logo */}
        <button onClick={() => setPage("home")} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="4" fill="#8B5E3C"/>
            <path d="M7 20V10l7-4 7 4v10" stroke="#FAF7F2" strokeWidth="1.5" strokeLinejoin="round"/>
            <rect x="11" y="14" width="6" height="6" rx="1" fill="#FAF7F2"/>
          </svg>
          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:"1.25rem", color:"#4A2C1A", fontWeight:700, letterSpacing:"0.03em" }}>Funiro</span>
        </button>

        {/* Menu */}
        <ul style={{ display:"flex", gap:"2.5rem", listStyle:"none", margin:0, padding:0 }}>
          {nav.map(n => (
            <li key={n.id}>
              <button onClick={() => {
                if (n.id === "rooms" || n.id === "inspiration") { setPage("home"); setTimeout(() => document.getElementById(n.id)?.scrollIntoView({ behavior:"smooth" }), 100); }
                else setPage(n.id);
              }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"0.875rem", fontWeight:500, color: page === n.id ? "#8B5E3C" : "#4A2C1A", transition:"color 0.2s", fontFamily:"'Poppins', sans-serif" }}>
                {n.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Icons */}
        <div style={{ display:"flex", alignItems:"center", gap:"1.25rem" }}>
          <button onClick={() => setPage("shop")} style={{ background:"none", border:"none", cursor:"pointer", color:"#4A2C1A" }} aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
          <button onClick={() => setPage("cart")} style={{ position:"relative", background:"none", border:"none", cursor:"pointer", color:"#4A2C1A" }} aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {cartCount > 0 && <span style={{ position:"absolute", top:-6, right:-6, width:16, height:16, background:"#C47B5A", color:"#FAF7F2", fontSize:9, fontWeight:600, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{cartCount}</span>}
          </button>
        </div>
      </nav>
    </header>
  );
}

// Toast
function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div style={{ position:"fixed", bottom:32, right:32, zIndex:9999, background:"#4A2C1A", color:"#FAF7F2", padding:"12px 20px", borderRadius:4, fontSize:"0.8rem", fontFamily:"'Poppins',sans-serif", boxShadow:"0 8px 30px rgba(0,0,0,0.25)", animation:"slideIn 0.3s ease" }}>
      {toast}
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ProductCard component
function ProductCard({ product, compact = false }) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const [hovered, setHovered] = useState(false);
  const isWished = wishlist.find(i => i.id === product.id);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:"#F0E8DC", borderRadius:2, overflow:"hidden", cursor:"pointer",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 16px 40px rgba(74,44,26,0.14)" : "0 2px 8px rgba(74,44,26,0.06)",
        transition:"transform 0.3s, box-shadow 0.3s",
      }}
    >
      <div style={{ position:"relative", overflow:"hidden", height: compact ? 200 : 224 }}>
        <img src={product.img} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover", transform: hovered ? "scale(1.07)" : "scale(1)", transition:"transform 0.6s ease" }} />
        {product.badge && (
          <span style={{ position:"absolute", top:12, left:12, background:product.badgeColor, color:"#FAF7F2", fontSize:10, fontWeight:600, padding:"4px 8px", borderRadius:2, letterSpacing:"0.05em" }}>{product.badge}</span>
        )}
        {/* Overlay */}
        <div style={{ position:"absolute", inset:0, background:"rgba(74,44,26,0.40)", opacity: hovered ? 1 : 0, transition:"opacity 0.35s", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
          <button onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            style={{ background:"#FAF7F2", color:"#4A2C1A", fontSize:11, fontWeight:600, padding:"10px 20px", borderRadius:2, border:"none", cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background="#8B5E3C"; e.currentTarget.style.color="#FAF7F2"; }}
            onMouseLeave={e => { e.currentTarget.style.background="#FAF7F2"; e.currentTarget.style.color="#4A2C1A"; }}>
            Add to Cart
          </button>
          <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
            style={{ background:"transparent", color: isWished ? "#C47B5A" : "#FAF7F2", fontSize:11, fontWeight:500, padding:"6px 16px", borderRadius:2, border:"1px solid rgba(250,247,242,0.5)", cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>
            {isWished ? "♥ Saved" : "♡ Wishlist"}
          </button>
        </div>
      </div>
      <div style={{ padding:16 }}>
        <p style={{ fontSize:10, color:"rgba(139,94,60,0.6)", textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:4 }}>{product.category}</p>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#4A2C1A", margin:"0 0 4px" }}>{product.name}</h3>
        <p style={{ fontSize:11, color:"rgba(139,94,60,0.7)", marginBottom:12, lineHeight:1.5 }}>{product.desc}</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ color:"#8B5E3C", fontWeight:600, fontSize:"0.875rem" }}>{formatPrice(product.price)}</span>
          {product.oldPrice && <span style={{ color:"rgba(139,94,60,0.4)", fontSize:12, textDecoration:"line-through" }}>{formatPrice(product.oldPrice)}</span>}
        </div>
      </div>
    </div>
  );
}

// Section wrapper with fade-up
function Section({ id, children, bg = "#FAF7F2", style = {} }) {
  const [ref, visible] = useFadeUp();
  return (
    <section id={id} style={{ background: bg, padding:"5rem 0", ...style }}>
      <div ref={ref} style={{ maxWidth:1280, margin:"0 auto", padding:"0 1.5rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(32px)", transition:"opacity 0.7s ease, transform 0.7s ease" }}>
        {children}
      </div>
    </section>
  );
}

function SectionHeader({ tag, title, subtitle, tagColor = "#8B5E3C", titleColor = "#4A2C1A" }) {
  return (
    <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
      <p style={{ fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.15em", color: tagColor, fontWeight:600, marginBottom:8 }}>{tag}</p>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"2.5rem", color: titleColor, margin:"0 0 12px" }}>{title}</h2>
      {subtitle && <p style={{ fontSize:"0.875rem", color:"rgba(139,94,60,0.8)", maxWidth:480, margin:"0 auto", lineHeight:1.6 }}>{subtitle}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PAGES
// ─────────────────────────────────────────────────────────────

// ── HomePage ──────────────────────────────────────────────────
function HomePage() {
  const { products, setPage } = useStore();

  // Slider
  const [sliderPos, setSliderPos] = useState(0);
  const slideW = 320 + 16;
  const slides = [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=500&q=80",
    "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=500&q=80",
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&q=80",
  ];
  const maxPos = (slides.length - 3) * slideW;
  const nextSlide = () => setSliderPos(p => Math.min(p + slideW, maxPos));
  const prevSlide = () => setSliderPos(p => Math.max(p - slideW, 0));

  const rooms = [
    { label:"Dining Room", img:"https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=600&q=80" },
    { label:"Kitchen", img:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80" },
    { label:"Bedroom", img:"https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80" },
    { label:"Living Room", img:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80" },
    { label:"Bathroom", img:"https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&q=80" },
    { label:"Decoration", img:"https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600&q=80" },
  ];

  const socialImgs = [
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=300&q=80",
    "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=300&q=80",
    "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=300&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80",
    "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=300&q=80",
  ];

  return (
    <>
      {/* ── HERO ── */}
      <section style={{
        background:"linear-gradient(120deg,rgba(74,44,26,0.55) 0%,rgba(140,100,60,0.25) 60%,transparent 100%),url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80') center/cover no-repeat",
        minHeight:"92vh", display:"flex", alignItems:"center",
      }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"6rem 1.5rem 4rem" }}>
          <div style={{ maxWidth:480, background:"rgba(250,247,242,0.85)", backdropFilter:"blur(8px)", padding:"2.5rem", borderRadius:2, boxShadow:"0 20px 60px rgba(74,44,26,0.15)" }}>
            <p style={{ fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.15em", color:"#8B5E3C", fontWeight:600, marginBottom:12 }}>New Collection 2025</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2.5rem,5vw,3.5rem)", lineHeight:1.2, color:"#4A2C1A", margin:"0 0 1.25rem" }}>
              High-Quality<br/><em>Furniture</em><br/>Just For You
            </h1>
            <p style={{ fontSize:"0.875rem", color:"rgba(139,94,60,0.9)", lineHeight:1.7, marginBottom:"2rem", fontWeight:300 }}>
              Crafted with passion and precision — bring warmth, comfort, and natural beauty into every corner of your home.
            </p>
            <button onClick={() => setPage("shop")} style={{ display:"inline-block", padding:"12px 32px", background:"#8B5E3C", color:"#FAF7F2", fontFamily:"'Poppins',sans-serif", fontWeight:500, letterSpacing:"0.05em", borderRadius:2, border:"none", cursor:"pointer", fontSize:"0.875rem", transition:"all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#4A2C1A"; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#8B5E3C"; e.currentTarget.style.transform="none"; }}>
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURE BAR ── */}
      <section style={{ background:"#F0E8DC", borderTop:"1px solid #D9C9B0", borderBottom:"1px solid #D9C9B0" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"1.5rem 1.5rem", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1.5rem" }}>
          {[
            { icon:<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>, title:"High Quality", sub:"Crafted from finest materials" },
            { icon:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, title:"Warranty Protection", sub:"Over 2 years guarantee" },
            { icon:<><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>, title:"Free Shipping", sub:"Order over $150" },
            { icon:<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.02 1.17a2 2 0 012-1.17h3a2 2 0 012 1.72c.128.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.572 2.81.7A2 2 0 0122 14.92z"/>, title:"24/7 Support", sub:"Dedicated support team" },
          ].map((f, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:16 }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:"#4A2C1A", letterSpacing:"0.03em", margin:0 }}>{f.title}</p>
                <p style={{ fontSize:11, color:"rgba(139,94,60,0.8)", margin:0 }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TROPICAL CONCEPT ── */}
      <Section id="tropical" bg="#FAF7F2">
        <SectionHeader tag="Bộ sưu tập" title="Tropical Concept" subtitle="Đưa hơi thở nhiệt đới vào không gian sống — gỗ tự nhiên, mây tre và tông màu ấm áp." />
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gridTemplateRows:"260px 260px", gap:10 }}>
          <div style={{ gridRow:"1/3", overflow:"hidden", borderRadius:2, position:"relative" }}>
            <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80" alt="Tropical living" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(to top,rgba(74,44,26,0.6),transparent)", padding:20 }}>
              <span style={{ fontFamily:"'Playfair Display',serif", color:"#FAF7F2", fontSize:"1.1rem" }}>Living Space</span>
            </div>
          </div>
          {["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80","https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600&q=80","https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80","https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=600&q=80"].map((src,i) => (
            <div key={i} style={{ overflow:"hidden", borderRadius:2 }}>
              <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            </div>
          ))}
        </div>
      </Section>

      {/* ── MATCHA CONCEPT ── */}
      <Section id="matcha" bg="#F0E8DC">
        <SectionHeader tag="Bộ sưu tập" title="Matcha Concept" subtitle="Thanh thản, dịu nhẹ — những tông xanh sage hài hòa với gỗ sáng tạo nên không gian thiền thức." tagColor="#6B7C5C" titleColor="#4D5C3A" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr", gridTemplateRows:"260px 260px", gap:10 }}>
          {["https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&q=80","https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=600&q=80"].map((src,i) => (
            <div key={i} style={{ overflow:"hidden", borderRadius:2 }}><img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/></div>
          ))}
          <div style={{ gridColumn:3, gridRow:"1/3", overflow:"hidden", borderRadius:2, position:"relative" }}>
            <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=800&q=80" alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(to top,rgba(77,92,58,0.6),transparent)", padding:20 }}>
              <span style={{ fontFamily:"'Playfair Display',serif", color:"#FAF7F2", fontSize:"1.1rem" }}>Nature Harmony</span>
            </div>
          </div>
          {["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80","https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80"].map((src,i) => (
            <div key={i} style={{ overflow:"hidden", borderRadius:2 }}><img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/></div>
          ))}
        </div>
      </Section>

      {/* ── OUR PRODUCTS ── */}
      <Section id="products" bg="#FAF7F2">
        <SectionHeader tag="Khám phá" title="Our Products" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:28 }}>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div style={{ textAlign:"center", marginTop:48 }}>
          <button onClick={() => setPage("shop")} style={{ display:"inline-block", padding:"10px 28px", border:"1.5px solid #8B5E3C", color:"#8B5E3C", fontFamily:"'Poppins',sans-serif", fontWeight:500, letterSpacing:"0.05em", borderRadius:2, background:"transparent", cursor:"pointer", fontSize:"0.875rem", transition:"all 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.background="#8B5E3C"; e.currentTarget.style.color="#FAF7F2"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#8B5E3C"; }}>
            Show More Products
          </button>
        </div>
      </Section>

      {/* ── ROOM CATEGORIES ── */}
      <Section id="rooms" bg="#F0E8DC">
        <SectionHeader tag="Không gian" title="More Products" subtitle="Tìm kiếm nội thất phù hợp theo từng không gian sống của bạn." />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {rooms.map((r, i) => (
            <RoomCard key={i} label={r.label} img={r.img} onClick={() => setPage("shop")} />
          ))}
        </div>
      </Section>

      {/* ── INSPIRATION SLIDER ── */}
      <Section id="inspiration" bg="#FAF7F2">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:40 }}>
          <div>
            <p style={{ fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.15em", color:"#8B5E3C", fontWeight:600, marginBottom:8 }}>Gallery</p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"2.5rem", color:"#4A2C1A", lineHeight:1.2, margin:"0 0 12px" }}>50+ Beautiful<br/><em>rooms inspiration</em></h2>
            <p style={{ fontSize:"0.875rem", color:"rgba(139,94,60,0.8)", maxWidth:280, lineHeight:1.6 }}>Khám phá hàng trăm không gian sống được thiết kế bởi chuyên gia của chúng tôi.</p>
            <button style={{ marginTop:24, display:"inline-block", padding:"12px 32px", background:"#8B5E3C", color:"#FAF7F2", fontFamily:"'Poppins',sans-serif", fontWeight:500, letterSpacing:"0.05em", borderRadius:2, border:"none", cursor:"pointer", fontSize:"0.875rem" }}>
              Explore Now
            </button>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={prevSlide} style={{ width:40, height:40, borderRadius:"50%", border:"1px solid #D9C9B0", background:"transparent", color:"#8B5E3C", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button onClick={nextSlide} style={{ width:40, height:40, borderRadius:"50%", background:"#8B5E3C", color:"#FAF7F2", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        <div style={{ overflow:"hidden" }}>
          <div style={{ display:"flex", gap:16, transition:"transform 0.5s ease", transform:`translateX(-${sliderPos}px)` }}>
            {slides.map((src, i) => (
              <div key={i} style={{ flex:"0 0 320px", height:320, overflow:"hidden", borderRadius:2 }}>
                <img src={src} alt={`Room ${i+1}`} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── HASHTAG COMMUNITY ── */}
      <Section bg="#F0E8DC">
        <SectionHeader tag="Community" title={<em>#FuniroFurniture</em>} subtitle="Chia sẻ không gian của bạn và tag chúng tôi để xuất hiện ở đây." />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
          {socialImgs.map((src, i) => (
            <div key={i} style={{ height:160, overflow:"hidden", borderRadius:2 }}>
              <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.6s ease" }}
                onMouseEnter={e => e.currentTarget.style.transform="scale(1.07)"}
                onMouseLeave={e => e.currentTarget.style.transform="none"}/>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function RoomCard({ label, img, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{ position:"relative", overflow:"hidden", height:208, borderRadius:2, cursor:"pointer" }}>
      <img src={img} alt={label} style={{ width:"100%", height:"100%", objectFit:"cover", transform: hovered ? "scale(1.07)" : "none", transition:"transform 0.6s ease" }}/>
      <div style={{ position:"absolute", inset:0, background: hovered ? "rgba(74,44,26,0.50)" : "rgba(74,44,26,0.30)", transition:"background 0.3s", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontFamily:"'Playfair Display',serif", color:"#FAF7F2", fontSize:"1.25rem", letterSpacing:"0.03em", textShadow:"0 2px 8px rgba(0,0,0,0.3)" }}>{label}</span>
      </div>
    </div>
  );
}

// ── ShopPage ──────────────────────────────────────────────────
function ShopPage() {
  const { products, setPage } = useStore();
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products
    .filter(p => activeCategory === "All" || p.category === activeCategory)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "low") return a.price - b.price;
      if (sortBy === "high") return b.price - a.price;
      return 0;
    });

  return (
    <div style={{ paddingTop:80, minHeight:"100vh", background:"#FAF7F2" }}>
      {/* Shop Header */}
      <div style={{ background:"url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80') center/cover", padding:"4rem 0", textAlign:"center", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"rgba(250,247,242,0.8)" }}/>
        <div style={{ position:"relative" }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"3rem", color:"#4A2C1A", margin:0 }}>Shop</h1>
          <p style={{ fontSize:"0.875rem", color:"rgba(139,94,60,0.7)", marginTop:8 }}>
            <button onClick={() => setPage("home")} style={{ background:"none", border:"none", cursor:"pointer", color:"#8B5E3C", fontFamily:"'Poppins',sans-serif" }}>Home</button>
            {" > Shop"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background:"#F0E8DC", padding:"1rem 0", borderBottom:"1px solid #D9C9B0" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ padding:"6px 16px", borderRadius:2, border:"1px solid", borderColor: activeCategory === cat ? "#8B5E3C" : "#D9C9B0", background: activeCategory === cat ? "#8B5E3C" : "transparent", color: activeCategory === cat ? "#FAF7F2" : "#8B5E3C", fontSize:12, fontFamily:"'Poppins',sans-serif", cursor:"pointer", transition:"all 0.2s" }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ padding:"6px 12px", border:"1px solid #D9C9B0", borderRadius:2, fontSize:12, fontFamily:"'Poppins',sans-serif", background:"transparent", outline:"none", color:"#4A2C1A" }}/>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding:"6px 12px", border:"1px solid #D9C9B0", borderRadius:2, fontSize:12, fontFamily:"'Poppins',sans-serif", background:"transparent", color:"#4A2C1A", cursor:"pointer" }}>
              <option value="default">Default</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"3rem 1.5rem" }}>
        <p style={{ fontSize:12, color:"rgba(139,94,60,0.6)", marginBottom:24 }}>{filtered.length} sản phẩm</p>
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"5rem 0", color:"rgba(139,94,60,0.5)" }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem" }}>Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:24 }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CartPage ──────────────────────────────────────────────────
function CartPage() {
  const { cart, removeFromCart, updateQty, cartTotal, setPage } = useStore();

  if (cart.length === 0) {
    return (
      <div style={{ paddingTop:80, minHeight:"100vh", background:"#FAF7F2", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24 }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#D9C9B0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", color:"rgba(74,44,26,0.4)" }}>Giỏ hàng trống</p>
        <button onClick={() => setPage("shop")} style={{ padding:"12px 32px", background:"#8B5E3C", color:"#FAF7F2", border:"none", borderRadius:2, cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"0.875rem" }}>
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingTop:80, minHeight:"100vh", background:"#FAF7F2" }}>
      {/* Header */}
      <div style={{ background:"#F0E8DC", padding:"3rem 0", textAlign:"center" }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"2.5rem", color:"#4A2C1A", margin:0 }}>Shopping Cart</h1>
        <p style={{ fontSize:"0.875rem", color:"rgba(139,94,60,0.7)", marginTop:8 }}>
          <button onClick={() => setPage("home")} style={{ background:"none", border:"none", cursor:"pointer", color:"#8B5E3C", fontFamily:"'Poppins',sans-serif" }}>Home</button>
          {" > Cart"}
        </p>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"3rem 1.5rem", display:"grid", gridTemplateColumns:"1fr 360px", gap:40 }}>
        {/* Items */}
        <div>
          {/* Table header */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto", gap:16, padding:"12px 16px", background:"#F0E8DC", borderRadius:2, marginBottom:16, fontSize:12, fontWeight:600, color:"#4A2C1A", letterSpacing:"0.05em", textTransform:"uppercase" }}>
            <span>Sản phẩm</span><span>Giá</span><span>Số lượng</span><span>Tổng</span><span></span>
          </div>
          {cart.map(item => (
            <div key={item.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto", gap:16, padding:"16px", background:"#FAF7F2", borderRadius:2, marginBottom:8, alignItems:"center", boxShadow:"0 2px 8px rgba(74,44,26,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <img src={item.img} alt={item.name} style={{ width:70, height:70, objectFit:"cover", borderRadius:2 }}/>
                <div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.95rem", color:"#4A2C1A", margin:0 }}>{item.name}</p>
                  <p style={{ fontSize:11, color:"rgba(139,94,60,0.6)", margin:"2px 0 0" }}>{item.category}</p>
                </div>
              </div>
              <span style={{ fontSize:"0.875rem", color:"#8B5E3C" }}>{formatPrice(item.price)}</span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <button onClick={() => updateQty(item.id, -1)} style={{ width:28, height:28, borderRadius:2, border:"1px solid #D9C9B0", background:"transparent", cursor:"pointer", color:"#8B5E3C", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                <span style={{ fontSize:"0.875rem", color:"#4A2C1A", minWidth:20, textAlign:"center" }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} style={{ width:28, height:28, borderRadius:2, border:"1px solid #D9C9B0", background:"transparent", cursor:"pointer", color:"#8B5E3C", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
              </div>
              <span style={{ fontSize:"0.875rem", color:"#8B5E3C", fontWeight:600 }}>{formatPrice(item.price * item.qty)}</span>
              <button onClick={() => removeFromCart(item.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#C47B5A", fontSize:18 }}>×</button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ background:"#F0E8DC", padding:32, borderRadius:2, alignSelf:"start", position:"sticky", top:100 }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", color:"#4A2C1A", marginTop:0, marginBottom:24 }}>Cart Totals</h3>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <span style={{ fontSize:"0.875rem", color:"rgba(139,94,60,0.7)" }}>Subtotal</span>
            <span style={{ fontSize:"0.875rem", color:"#8B5E3C" }}>{formatPrice(cartTotal)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
            <span style={{ fontSize:"0.875rem", color:"rgba(139,94,60,0.7)" }}>Shipping</span>
            <span style={{ fontSize:"0.875rem", color:"#6B7C5C" }}>Free</span>
          </div>
          <div style={{ borderTop:"1px solid #D9C9B0", paddingTop:16, marginBottom:24, display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontWeight:600, color:"#4A2C1A" }}>Total</span>
            <span style={{ fontWeight:700, color:"#8B5E3C", fontSize:"1.1rem" }}>{formatPrice(cartTotal)}</span>
          </div>
          <button style={{ width:"100%", padding:"14px 0", background:"#8B5E3C", color:"#FAF7F2", border:"none", borderRadius:2, cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontWeight:500, letterSpacing:"0.05em", fontSize:"0.875rem", transition:"background 0.3s" }}
            onMouseEnter={e => e.currentTarget.style.background="#4A2C1A"}
            onMouseLeave={e => e.currentTarget.style.background="#8B5E3C"}>
            Proceed to Checkout
          </button>
          <button onClick={() => setPage("shop")} style={{ width:"100%", marginTop:8, padding:"12px 0", background:"transparent", color:"#8B5E3C", border:"1.5px solid #8B5E3C", borderRadius:2, cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"0.875rem", transition:"all 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.background="#8B5E3C"; e.currentTarget.style.color="#FAF7F2"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#8B5E3C"; }}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  FOOTER
// ─────────────────────────────────────────────────────────────
function Footer() {
  const { setPage } = useStore();
  return (
    <footer style={{ background:"#4A2C1A", color:"rgba(250,247,242,0.8)", paddingTop:64, paddingBottom:32 }}>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 1.5rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:48, marginBottom:48 }}>
          {/* Brand */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="4" fill="#C4A882"/><path d="M7 20V10l7-4 7 4v10" stroke="#4A2C1A" strokeWidth="1.5" strokeLinejoin="round"/><rect x="11" y="14" width="6" height="6" rx="1" fill="#4A2C1A"/></svg>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", color:"#FAF7F2" }}>Funiro</span>
            </div>
            <p style={{ fontSize:11, lineHeight:1.7, color:"rgba(250,247,242,0.5)" }}>400 University Drive Suite 200<br/>Coral Gables, FL 33134 USA</p>
          </div>
          {/* Menu */}
          <div>
            <h4 style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#FAF7F2", marginBottom:20 }}>Menu</h4>
            <ul style={{ listStyle:"none", padding:0, margin:0 }}>
              {["Home","Shop","About","Contact"].map(l => (
                <li key={l} style={{ marginBottom:12 }}>
                  <button onClick={() => l==="Shop" ? setPage("shop") : setPage("home")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"rgba(250,247,242,0.5)", fontFamily:"'Poppins',sans-serif", padding:0, transition:"color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color="#D9C9B0"}
                    onMouseLeave={e => e.currentTarget.style.color="rgba(250,247,242,0.5)"}>{l}</button>
                </li>
              ))}
            </ul>
          </div>
          {/* Account */}
          <div>
            <h4 style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#FAF7F2", marginBottom:20 }}>Account</h4>
            <ul style={{ listStyle:"none", padding:0, margin:0 }}>
              {["My Account","Login / Register","Cart","Wishlist"].map(l => (
                <li key={l} style={{ marginBottom:12 }}>
                  <button onClick={() => l==="Cart" && setPage("cart")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"rgba(250,247,242,0.5)", fontFamily:"'Poppins',sans-serif", padding:0, transition:"color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color="#D9C9B0"}
                    onMouseLeave={e => e.currentTarget.style.color="rgba(250,247,242,0.5)"}>{l}</button>
                </li>
              ))}
            </ul>
          </div>
          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#FAF7F2", marginBottom:20 }}>Stay Connected</h4>
            <p style={{ fontSize:11, color:"rgba(250,247,242,0.5)", lineHeight:1.7, marginBottom:16 }}>Subscribe to get the latest news, articles, and resources.</p>
            <div style={{ display:"flex", alignItems:"flex-end", gap:12 }}>
              <input type="email" placeholder="Your email address" style={{ flex:1, background:"transparent", border:"none", borderBottom:"1px solid rgba(217,201,176,0.5)", color:"#FAF7F2", fontSize:11, padding:"4px 0 8px", outline:"none", fontFamily:"'Poppins',sans-serif" }}/>
              <button style={{ fontSize:11, color:"#C4A882", background:"none", border:"none", cursor:"pointer", fontWeight:600, fontFamily:"'Poppins',sans-serif", letterSpacing:"0.1em", paddingBottom:8 }}>SUBSCRIBE</button>
            </div>
            <div style={{ display:"flex", gap:16, marginTop:24 }}>
              {[
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>,
                <><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>,
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>,
              ].map((icon, i) => (
                <a key={i} href="#" style={{ color:"rgba(250,247,242,0.4)", transition:"color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color="#D9C9B0"}
                  onMouseLeave={e => e.currentTarget.style.color="rgba(250,247,242,0.4)"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={i===0?"currentColor":"none"} stroke={i===0?"none":"currentColor"} strokeWidth="1.8" strokeLinecap="round">{icon}</svg>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop:"1px solid rgba(250,247,242,0.1)", paddingTop:24, textAlign:"center" }}>
          <p style={{ fontSize:11, color:"rgba(250,247,242,0.3)", margin:0 }}>© 2025 Funiro Furniture. All rights reserved. Crafted with ♥ for beautiful homes.</p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
//  APP  (Router)
// ─────────────────────────────────────────────────────────────
function AppContent() {
  const { page } = useStore();

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  return (
    <div style={{ fontFamily:"'Poppins', sans-serif", background:"#FAF7F2", color:"#2D1F0E" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        button { font-family: 'Poppins', sans-serif; }
        input, select { font-family: 'Poppins', sans-serif; }
      `}</style>

      <Navbar />
      <main>
        {page === "home" && <HomePage />}
        {page === "shop" && <ShopPage />}
        {page === "cart" && <CartPage />}
      </main>
      <Footer />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
