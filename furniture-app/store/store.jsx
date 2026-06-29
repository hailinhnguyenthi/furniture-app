import { createContext, useContext, useState, useCallback, useRef } from "react";

const StoreContext = createContext();

export function StoreProvider({ children }) {

  // ─── Toast ───────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast(typeof msg === "string" ? { message: msg, type } : msg);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // ─── Auth ─────────────────────────────────────────────────────────────────────
  const [currentUser, _setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("funiro_user") || "null"); }
    catch { return null; }
  });

  // Override setCurrentUser để luôn đồng bộ localStorage
  const setCurrentUser = useCallback((user) => {
    if (user) {
      localStorage.setItem("funiro_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("funiro_user");
    }
    _setCurrentUser(user);
  }, []);

  const isLoggedIn = !!currentUser;

  // ─── Navigation ───────────────────────────────────────────────────────────────
  const [page, setPage] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigate = useCallback((newPage, options = {}) => {
    setPage(newPage);
    if (options.category !== undefined) setSelectedCategory(options.category);
    if (options.product !== undefined) setSelectedProduct(options.product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/logout`,
        { method: "POST", credentials: "include" }
      );
    } catch { /* ignore */ }
    setCurrentUser(null);
    navigate("home");
    showToast({ message: "Đã đăng xuất", type: "info" });
  }, [navigate, setCurrentUser, showToast]);

  // ─── Cart ─────────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);

  const addToCart = useCallback((product) => {
    const id = product._id || product.id;
    setCart(prev => {
      const exists = prev.find(i => (i._id || i.id) === id);
      if (exists) return prev.map(i => (i._id || i.id) === id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast({ message: `✓ ${product.name} đã thêm vào giỏ`, type: "success" });
  }, [showToast]);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(i => (i._id || i.id) !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    setCart(prev => prev.map(i => (i._id || i.id) === id ? { ...i, quantity: Math.max(1, quantity) } : i));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((s, i) => s + (i.quantity ?? 1), 0);
  const cartTotal = cart.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0);

  // ─── Wishlist ─────────────────────────────────────────────────────────────────
  const [wishlist, setWishlist] = useState([]);

  const toggleWishlist = useCallback((product) => {
    const id = product._id || product.id;
    setWishlist(prev =>
      prev.find(i => (i._id || i.id) === id)
        ? prev.filter(i => (i._id || i.id) !== id)
        : [...prev, product]
    );
  }, []);

  const isWishlisted = useCallback(
    (id) => wishlist.some(i => (i._id || i.id) === id),
    [wishlist]
  );

  // ─── Search ───────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Context value ────────────────────────────────────────────────────────────
  return (
    <StoreContext.Provider value={{
      // Auth
      currentUser, setCurrentUser, isLoggedIn, logout,
      // Cart
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal,
      // Wishlist
      wishlist, toggleWishlist, isWishlisted,
      // Navigation
      page, setPage, navigate,
      selectedCategory, setSelectedCategory,
      selectedProduct, setSelectedProduct,
      // Toast
      toast, showToast,
      // Search
      searchQuery, setSearchQuery,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
};