import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AuthPage from "./AuthPage";
import Header from "../components/Header";
import NewOrder from "./NewOrder";
import OrderingBoard from "./OrderingBoard";
import Dashboard from "./Dashboard";
import Chancesheet from "./Chancesheet";

import Nckot from "./Nckot";
import Voidkot from "./Voidkot";
import Dailysales from "./DailySales";
import Itemsales from "./Itemsales";
import BilreprintReport from "./BilreprintReport";
import CompanyCreation from "../components/CompanyCreation";

function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const showHeader =
    location.pathname === "/NewOrder" || location.pathname === "/OrderingBoard";

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
      {showHeader && <Header showNeworderButton />}

      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/NewOrder" element={<NewOrder />} />
        <Route path="/OrderingBoard" element={<OrderingBoard />} />
        <Route path="/pos/dailysales" element={<Dailysales />} />
        <Route path="/pos/itemsales" element={<Itemsales />} />
        <Route path="/pos/chancesheet" element={<Chancesheet />} />
        <Route path="/pos/voidkot" element={<Voidkot />} />
        <Route path="/pos/nckot" element={<Nckot />} />
        <Route path="/pos/billreprint" element={<BilreprintReport />} />

        <Route path="/master/company" element={<CompanyCreation />} />
      </Routes>
    </>
  );
}

export default LandingPage;
