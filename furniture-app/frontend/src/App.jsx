import { StoreProvider, useStore } from "../../store/store";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import CategoryPage from "./pages/CategoryPage";
import PaymentReturn from "./pages/PaymentReturn";

function Router() {
  const { page, selectedCategory } = useStore();

  // Check if payment return
  const urlParams = new URLSearchParams(window.location.search);
  const isPaymentReturn = urlParams.has("vnp_TxnRef");

  if (isPaymentReturn) return <PaymentReturn />;
  if (page === "category" && selectedCategory) return <CategoryPage />;
  if (page === "shop") return <ShopPage />;
  if (page === "cart") return <CartPage />;
  return <HomePage />;
}

export default function App() {
  return (
    <StoreProvider>
      <Navbar />
      <Router />
    </StoreProvider>
  );
}