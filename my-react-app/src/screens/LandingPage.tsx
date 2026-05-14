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
import CompanyCreation from "./CompanyCreation";
import TaxMaster from "./TaxMaster";
import TaxDescriptionMaster from "./TaxDescriptionMaster";
import DepartmentMaster from "./DepartmentMaster";
import OutletMaster from "./OutletMaster";
import OutletItemsDetails from "./OutletItemsDetails";
import ItemMaster from "./ItemMaster";
import ItemMasterImport from "./ItemMasterImport";

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
        <Route path="/master/tax" element={<TaxMaster />} />
        <Route path="/master/taxdescrip" element={<TaxDescriptionMaster />} />
        <Route path="/master/departmentmaster" element={<DepartmentMaster />} />

        <Route path="/master/outletmaster" element={<OutletMaster />} />
     
          <Route path="/master/itemmaster"  element={<ItemMaster />   } />
        <Route
          path="/submaster/outletitemsdetails"
          element={<OutletItemsDetails />}
        />
        <Route
  path="/item-master-import"
  element={<ItemMasterImport />}
/>
      </Routes>
    </>
  );
}

export default LandingPage;
