import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AuthPage from "./AuthPage";
import Header from "../components/Header";
import NewOrder from "./NewOrder";
import OrderingBoard from "./OrderingBoard";
import Dashboard from "./Dashboard";

function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const showHeader =
    location.pathname === "/NewOrder" ||
    location.pathname === "/OrderingBoard";

  useEffect(() => {
    const token = localStorage.getItem("token");

    // No token → go to login
    if (!token) {
      if (location.pathname !== "/") {
        navigate("/", { replace: true });
      }
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = payload.exp * 1000; // convert to milliseconds
      const currentTime = Date.now();

      // If already expired
      if (currentTime >= expiryTime) {
        localStorage.removeItem("token");
        navigate("/", { replace: true });
        return;
      }

      // 🔥 Auto logout exactly when token expires
      const timeout = expiryTime - currentTime;

      const timer = setTimeout(() => {
        localStorage.removeItem("token");
        navigate("/", { replace: true });
      }, timeout);

      return () => clearTimeout(timer);
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <>
      {showHeader && <Header />}

      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/NewOrder" element={<NewOrder />} />
        <Route path="/OrderingBoard" element={<OrderingBoard />} />
      </Routes>
    </>
  );
}

export default LandingPage;