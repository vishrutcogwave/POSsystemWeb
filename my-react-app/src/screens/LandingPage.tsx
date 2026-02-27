import { Route, Routes, useLocation } from "react-router-dom";
import AuthPage from "./AuthPage";
import Header from "../components/Header";
import NewOrder from "./NewOrder";
import OrderingBoard from "./OrderingBoard";
import Dashboard from "./Dashboard";

function LandingPage() {
  const location = useLocation();

  // Show header only on specific pages
  const showHeader =
    location.pathname === "/NewOrder" ||
    location.pathname === "/OrderingBoard";

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