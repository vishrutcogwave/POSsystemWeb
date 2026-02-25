import { Route, Routes, useLocation } from "react-router-dom";
import AuthPage from "./AuthPage";
import Header from "../components/Header";
import NewOrder from "./NewOrder";
import OrderingBoard from "./OrderingBoard";

function LandingPage() {
  const location = useLocation();

  // hide header only on login page
  const hideHeader = location.pathname === "/";

  return (
    <>
      {!hideHeader && <Header />}

      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/NewOrder" element={<NewOrder />} />
        <Route path="/OrderingBoard" element={<OrderingBoard />} />
      </Routes>
    </>
  );
}

export default LandingPage;
