import { useState, useEffect, useCallback } from "react";
import { useStore } from "../../../store/store";
import { products as mockProducts } from "../../../data/products";
import ProductCard from "../components/ProductCard";
import FadeUp from "../components/FadeUp";

const C = {
  cream: "#FAF7F2", beige: "#F0E8DC", dark: "#4A2C1A",
  wood: "#8B5E3C", sand: "#D9C9B0", tan: "#C4A882",
};

const CATEGORIES = ["LIVING ROOM", "KITCHEN", "BEDROOM", "BATHROOM", "DECORATION", "DINING ROOM"];
const PRICE_RANGES = [
  { label: "Tất cả mức giá", min: null, max: null },
  { label: "Dưới 1 triệu", min: 0, max: 1_000_000 },
  { label: "1 - 3 triệu", min: 1_000_000, max: 3_000_000 },
  { label: "3 - 6 triệu", min: 3_000_000, max: 6_000_000 },
  { label: "Trên 6 triệu", min: 6_000_000, max: null },
];
const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "best_selling", label: "Bán chạy nhất" },
];

export default function ShopPage() {
  const { searchQuery, setSearchQuery, navigate, setSelectedProduct } = useStore();

  const [filters, setFilters] = useState({
    category: "",
    priceIdx: 0,
    sort: "newest",
  });
  const [localSearch, setLocalSearch] = useState(searchQuery || "");
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Apply searchQuery từ Navbar
  useEffect(() => { if (searchQuery) setLocalSearch(searchQuery); }, [searchQuery]);

  // Filter & sort products (client-side trên mock data; thay bằng API khi có MongoDB)
  const filtered = useCallback(() => {
    let list = [...mockProducts];

    if (localSearch.trim()) {
      const q = localSearch.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    }
    if (filters.category) {
      list = list.filter(p => p.category === filters.category);
    }
    const pr = PRICE_RANGES[filters.priceIdx];
    if (pr.min !== null) list = list.filter(p => p.price >= pr.min);
    if (pr.max !== null) list = list.filter(p => p.price <= pr.max);

    switch (filters.sort) {
      case "price_asc": list.sort((a, b) => a.price - b.price); break;
      case "price_desc": list.sort((a, b) => b.price - a.price); break;
      case "best_selling": list.sort((a, b) => (b.sold || 0) - (a.sold || 0)); break;
      default: break;
    }
    return list;
  }, [localSearch, filters]);

  const allFiltered = filtered();
  const PER_PAGE = 12;
  const totalPages = Math.ceil(allFiltered.length / PER_PAGE);
  const paged = allFiltered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const setFilter = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setPage(1); };

  const handleProductClick = (product) => {
    setSelectedProduct(product._id || product.id);
    navigate("product");
  };

  const clearAll = () => {
    setFilters({ category: "", priceIdx: 0, sort: "newest" });
    setLocalSearch("");
    setSearchQuery("");
    setPage(1);
  };

  const activeFiltersCount = (filters.category ? 1 : 0) + (filters.priceIdx !== 0 ? 1 : 0);

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: C.beige, borderBottom: `1px solid ${C.sand}`, padding: "36px 40px 28px", textAlign: "center" }}>
        <FadeUp>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 700, color: C.dark, margin: 0 }}>
            Cửa hàng
          </h1>
          <p style={{ fontSize: 13, color: C.tan, marginTop: 8 }}>
            Trang chủ <span style={{ margin: "0 6px" }}>/</span>
            <span style={{ color: C.wood, fontWeight: 500 }}>Shop</span>
          </p>
        </FadeUp>
      </div>

      {/* Toolbar */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.sand}`, padding: "14px 40px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.wood} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search" placeholder="Tìm kiếm sản phẩm..."
            value={localSearch}
            onChange={(e) => { setLocalSearch(e.target.value); setPage(1); }}
            style={{ width: "100%", paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: `1px solid ${C.sand}`, borderRadius: 6, fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: "none", color: C.dark }}
            onFocus={(e) => (e.target.style.borderColor = C.wood)}
            onBlur={(e) => (e.target.style.borderColor = C.sand)}
          />
        </div>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => setFilter("sort", e.target.value)}
          style={{ padding: "8px 12px", border: `1px solid ${C.sand}`, borderRadius: 6, fontSize: 13, fontFamily: "'Poppins', sans-serif", color: C.dark, outline: "none", cursor: "pointer", background: "#fff" }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Result count */}
        <span style={{ fontSize: 13, color: "#999", marginLeft: "auto" }}>
          {allFiltered.length} sản phẩm
        </span>

        {/* Sidebar toggle */}
        <button onClick={() => setSidebarOpen(p => !p)}
          style={{ background: "none", border: `1px solid ${C.sand}`, borderRadius: 6, padding: "8px 14px", fontSize: 13, cursor: "pointer", color: C.dark, fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="10" y2="18" />
          </svg>
          Lọc {activeFiltersCount > 0 && <span style={{ background: C.wood, color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{activeFiltersCount}</span>}
        </button>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 40px", display: "grid", gridTemplateColumns: sidebarOpen ? "260px 1fr" : "1fr", gap: 32 }}>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside>
            <div style={{ background: "#fff", borderRadius: 8, border: `1px solid ${C.sand}`, padding: 24, position: "sticky", top: 80 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", color: C.dark, margin: 0 }}>Bộ lọc</h3>
                {activeFiltersCount > 0 && (
                  <button onClick={clearAll} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.wood }}>
                    Xoá tất cả
                  </button>
                )}
              </div>

              {/* Category */}
              <div style={{ marginBottom: 28 }}>
                <p style={styles.filterLabel}>Danh mục</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={styles.radio}>
                    <input type="radio" name="cat" checked={!filters.category} onChange={() => setFilter("category", "")} style={{ accentColor: C.wood }} />
                    Tất cả
                  </label>
                  {CATEGORIES.map(cat => (
                    <label key={cat} style={styles.radio}>
                      <input type="radio" name="cat" checked={filters.category === cat} onChange={() => setFilter("category", cat)} style={{ accentColor: C.wood }} />
                      {cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p style={styles.filterLabel}>Mức giá</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PRICE_RANGES.map((pr, i) => (
                    <label key={i} style={styles.radio}>
                      <input type="radio" name="price" checked={filters.priceIdx === i} onChange={() => setFilter("priceIdx", i)} style={{ accentColor: C.wood }} />
                      {pr.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Products grid */}
        <div>
          {paged.length === 0 ? (
            <FadeUp>
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.sand} strokeWidth="1.5" style={{ marginBottom: 16 }}>
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <p style={{ fontSize: 16, color: C.dark, marginBottom: 8 }}>Không tìm thấy sản phẩm</p>
                <button onClick={clearAll} style={{ background: C.wood, color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 13, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                  Xoá bộ lọc
                </button>
              </div>
            </FadeUp>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24, marginBottom: 40 }}>
                {paged.map(p => (
                  <FadeUp key={p._id || p.id}>
                    <div onClick={() => handleProductClick(p)} style={{ cursor: "pointer" }}>
                      <ProductCard product={p} />
                    </div>
                  </FadeUp>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...styles.pageBtn, opacity: page === 1 ? 0.4 : 1 }}>←</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)}
                      style={{ ...styles.pageBtn, background: n === page ? C.dark : "#fff", color: n === page ? "#fff" : C.dark, border: `1px solid ${n === page ? C.dark : C.sand}` }}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...styles.pageBtn, opacity: page === totalPages ? 0.4 : 1 }}>→</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  filterLabel: { fontSize: 11, fontWeight: 700, color: C.dark, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" },
  radio: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#666", cursor: "pointer" },
  pageBtn: { width: 36, height: 36, border: `1px solid ${C.sand}`, borderRadius: 6, background: "#fff", color: C.dark, cursor: "pointer", fontSize: 13, fontFamily: "'Poppins', sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" },
};