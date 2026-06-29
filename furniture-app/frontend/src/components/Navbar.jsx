import { useState, useEffect, useRef } from "react";
import { useStore } from "../../../store/store";
import { theme } from "../../../styles/theme";

export default function Navbar() {
  const { navigate, cartCount, wishlist, searchQuery, setSearchQuery, currentUser, isLoggedIn, logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "staff";

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: scrolled ? "rgba(245,237,227,0.97)" : "#F5EDE3", backdropFilter: scrolled ? "blur(8px)" : "none", boxShadow: scrolled ? "0 2px 20px rgba(74,44,26,0.08)" : "none", transition: "background 0.3s, box-shadow 0.3s" }}>
      <nav style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", height: 64, display: "flex", alignItems: "center", gap: 24 }}>

        {/* Logo */}
        <button onClick={() => navigate("home")} style={S.logoBtn}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="4" fill="#8B5E3C" />
            <path d="M7 20V10l7-4 7 4v10" stroke="#FAF7F2" strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="11" y="14" width="6" height="6" rx="1" fill="#FAF7F2" />
          </svg>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", color: theme.dark, fontWeight: 700 }}>Funiro.</span>
        </button>

        {/* Desktop nav */}
        <div className="desktop-menu" style={{ display: "flex", gap: 24, flexShrink: 0 }}>
          {[
            { label: "Products", page: "shop" },
            { label: "Rooms", page: "home" },
            { label: "Inspirations", page: "blog" },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.page)} style={S.navBtn}
              onMouseEnter={(e) => (e.currentTarget.style.color = theme.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.dark)}>
              {item.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", maxWidth: 360 }}>
          <div style={{ position: "relative", width: "100%" }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="search" placeholder="Tìm kiếm nội thất..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchQuery.trim() && navigate("shop")}
              style={S.searchInput}
              onFocus={e => (e.target.style.borderColor = theme.primary)}
              onBlur={e => (e.target.style.borderColor = "#ddd")} />
          </div>
        </div>

        {/* Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          {/* Wishlist */}
          <div style={{ position: "relative" }}>
            <button style={S.iconBtn} title="Wishlist" onMouseEnter={e => (e.currentTarget.style.color = theme.primary)} onMouseLeave={e => (e.currentTarget.style.color = theme.dark)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
            {wishlist?.length > 0 && <Badge count={wishlist.length} />}
          </div>

          {/* Cart */}
          <div style={{ position: "relative" }}>
            <button onClick={() => navigate("cart")} style={S.iconBtn} title="Giỏ hàng" onMouseEnter={e => (e.currentTarget.style.color = theme.primary)} onMouseLeave={e => (e.currentTarget.style.color = theme.dark)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61H19.4a2 2 0 001.99-1.61L23 6H6" />
              </svg>
            </button>
            {cartCount > 0 && <Badge count={cartCount} />}
          </div>

          {/* Profile */}
          {isLoggedIn ? (
            <div style={{ position: "relative" }} ref={profileRef}>
              <button onClick={() => setProfileOpen(p => !p)} style={{ ...S.iconBtn, padding: 0 }}>
                {currentUser?.avatar
                  ? <img src={currentUser.avatar} alt="avatar" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: `2px solid ${theme.primary}` }} />
                  : <div style={{ width: 34, height: 34, borderRadius: "50%", background: theme.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                    {currentUser?.fullName?.[0]?.toUpperCase() || "U"}
                  </div>
                }
              </button>

              {profileOpen && (
                <div style={S.dropdown}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #F0E8DC" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#4A2C1A", margin: 0 }}>{currentUser?.fullName}</p>
                    <p style={{ fontSize: 11, color: "#bbb", margin: "2px 0 0" }}>{currentUser?.email}</p>
                    {isAdmin && <span style={{ fontSize: 10, background: "#4A2C1A", color: "#fff", padding: "2px 8px", borderRadius: 10, fontWeight: 700, display: "inline-block", marginTop: 4 }}>{currentUser?.role?.toUpperCase()}</span>}
                  </div>

                  {[
                    { icon: "👤", label: "Tài khoản", action: () => navigate("home") },
                    { icon: "📦", label: "Đơn hàng của tôi", action: () => navigate("orders") },
                    { icon: "❤️", label: "Wishlist", action: () => navigate("home") },
                    ...(isAdmin ? [{ icon: "⚙️", label: "Admin Dashboard", action: () => navigate("admin-dashboard") }] : []),
                  ].map(item => (
                    <button key={item.label} onClick={() => { item.action(); setProfileOpen(false); }} style={S.dropdownItem}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F5EDE3")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <span>{item.icon}</span> {item.label}
                    </button>
                  ))}

                  <div style={{ borderTop: "1px solid #F0E8DC" }}>
                    <button onClick={() => { logout(); setProfileOpen(false); }} style={{ ...S.dropdownItem, color: "#C47B5A" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#FBF0ED")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <span>🚪</span> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate("login")} style={{ background: "#4A2C1A", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins',sans-serif", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#8B5E3C")}
              onMouseLeave={e => (e.currentTarget.style.background = "#4A2C1A")}>
              Đăng nhập
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ ...S.iconBtn, display: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "absolute", top: 64, left: 0, right: 0, background: "#F5EDE3", borderTop: "1px solid #E8D9C8", padding: "12px 24px", zIndex: 99, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}>
          {[
            { label: "Trang chủ", page: "home" },
            { label: "Cửa hàng", page: "shop" },
            { label: "Inspirations", page: "blog" },
            { label: "Giỏ hàng", page: "cart" },
            ...(isLoggedIn ? [{ label: "Đơn hàng", page: "orders" }] : [{ label: "Đăng nhập", page: "login" }]),
            ...(isAdmin ? [{ label: "Admin", page: "admin-dashboard" }] : []),
          ].map(item => (
            <button key={item.label} onClick={() => { navigate(item.page); setMenuOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "12px 0", fontSize: 14, color: theme.dark, fontFamily: "'Poppins',sans-serif", cursor: "pointer", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function Badge({ count }) {
  return (
    <div style={{ position: "absolute", top: -6, right: -8, background: "#C47B5A", color: "#fff", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, pointerEvents: "none" }}>
      {count > 99 ? "99+" : count}
    </div>
  );
}

const S = {
  logoBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  navBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#4A2C1A", fontFamily: "'Poppins',sans-serif", fontWeight: 500, padding: "4px 0", transition: "color 0.2s" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", color: "#4A2C1A", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, transition: "color 0.2s" },
  searchInput: { width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, borderRadius: 6, border: "1px solid #ddd", outline: "none", background: "#fff", fontSize: 13, fontFamily: "'Poppins',sans-serif", transition: "border-color 0.2s" },
  dropdown: { position: "absolute", top: 46, right: 0, background: "#fff", borderRadius: 8, boxShadow: "0 8px 32px rgba(74,44,26,0.12)", border: "1px solid #F0E8DC", minWidth: 220, zIndex: 200, overflow: "hidden" },
  dropdownItem: { display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "11px 16px", fontSize: 13, color: "#4A2C1A", fontFamily: "'Poppins',sans-serif", cursor: "pointer", transition: "background 0.15s" },
};