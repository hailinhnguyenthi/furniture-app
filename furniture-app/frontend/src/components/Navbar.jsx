import { useState } from "react";
import { useStore } from "../../../store/store";
import { theme } from "../../../styles/theme";

export default function Navbar() {
  const { setPage, cart } = useStore();
  const [open, setOpen] = useState(false);
  
  // Calculate total cart items
  const cartCount = cart?.length || 0;

  return (
    <div style={{
      background: "#F5EDE3",
      padding: "12px 40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>

      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        
        {/* LOGO */}
        <h2 style={{
          color: theme.dark,
          fontWeight: 700,
          cursor: "pointer"
        }}
        onClick={() => setPage("home")}
        >
          Funiro.
        </h2>

        {/* MENU */}
        <div className="desktop-menu" style={{ display: "flex", gap: 20 }}>
          <button 
            onClick={() => setPage("shop")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              color: theme.dark
            }}
          >
            Shop
          </button>
          <button 
            onClick={() => setPage("home")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              color: theme.dark
            }}
          >
            Home
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        margin: "0 40px"
      }}>
        <input
          placeholder="Search for furniture"
          style={{
            width: "60%",
            padding: "10px 16px",
            borderRadius: 6,
            border: "1px solid #ddd",
            outline: "none",
            background: "#fff",
            fontSize: 14
          }}
        />
      </div>

      {/* RIGHT ICONS */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 20
      }}>
        <div style={{ position: "relative" }}>
          <button 
            onClick={() => setPage("cart")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20
            }}
          >
            🛒
          </button>
          
          {/* Badge */}
          {cartCount > 0 && (
            <div style={{
              position: "absolute",
              top: -8,
              right: -8,
              background: "#C47B5A",
              color: "#fff",
              width: 24,
              height: 24,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(196, 123, 90, 0.3)"
            }}>
              {cartCount}
            </div>
          )}
        </div>

        {/* AVATAR */}
        <img
          src="https://i.pravatar.cc/40"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            objectFit: "cover"
          }}
          alt="avatar"
        />
      </div>

      {/* MOBILE BUTTON */}
      <button
        className="menu-btn"
        onClick={() => setOpen(!open)}
        style={{
          fontSize: 20,
          background: "none",
          border: "none",
          cursor: "pointer"
        }}
      >
        ☰
      </button>

      {/* MOBILE MENU */}
      {open && (
        <div style={{
          position: "absolute",
          top: 60,
          right: 20,
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          zIndex: 1000,
          minWidth: 150
        }}>
          <button 
            onClick={() => {
              setPage("home");
              setOpen(false);
            }}
            style={{ 
              display: "block", 
              marginBottom: 10, 
              width: "100%", 
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Home
          </button>
          <button 
            onClick={() => {
              setPage("shop");
              setOpen(false);
            }}
            style={{ 
              display: "block", 
              marginBottom: 10, 
              width: "100%", 
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Shop
          </button>
          <button 
            onClick={() => {
              setPage("cart");
              setOpen(false);
            }}
            style={{ 
              display: "block", 
              width: "100%", 
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Cart
          </button>
        </div>
      )}
    </div>
  );
}