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
import UnitMaster from "./UnitMaster";
import GroupMaster from "./GroupMaster";
import CategoryMaster from "./CategoryMaster";
import SubCategoryMaster from "./SubCategoryMaster";
import StewardMaster from "./StewardMaster";
import NCDepartmentMaster from "./NCDepartmentMaster";
import PrintingMaster from "./PrintingMaster";
import TableMaster from "./TableMaster";
import PropertyMasterCreation from "./PropertyMasterCreation";
import BranchMaster from "./BranchMaster";
import UserMaster from "./UserMaster";
import UserRightsMaster from "./UserRightsMaster";
import KotCancellationReport from "./KotCancellationReport";
import BillCancellationReport from "./BillCancellationReport";
import DailysaleCategorywisereport from "./DailySalesCategoryWiseReport";
import KotRegister from "./KotRegisterReport";
import UtilitySettings from "./UtilitySettings";
import UserMenuOrSubmenuCreation from "./UserMenuOrSubmenuCreation";
import SettlementBillModify from "./SettlementBillModify";
import CompanyBillSettlement from "./companybillsettlement";
import BillModify from "./BillModification";
import PrinterSettings from "./PrinterSettings";
import RealDashboard from "./RealDashboard";
import BillAdjustment from "./BillAdjustment";
import AdminPanel from "./AdminPanel";
import Expired from "./Expired";
import { useAppContext } from "../context/AppContext";
import KOTClear from "../components/KOTClear";
import BillClear from "../components/BillClear";
import SupplierMaster from "./SupplierMaster";
import InventoryItemCategory from "./InventoryItemCategory";
import InventoryItemSubCategory from "./InventoryItemSubCategory";
import InventoryStore from "./InventoryStore";
import Miscellaneous from "./Miscellaneous";
import InventoryItemStore from "./InventoryItemStore";
import InventoryGRNMiscellaneous from "./InventoryGRNMiscellaneous";
import InventoryItemStoreImport from "./InventoryItemStoreImport";
import PurchaseOrder from "./PurchaseOrder";
import PurchaseUnitMaster from "./PurchaseUnitMaster";

function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { appData } = useAppContext();
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

  if (appData?.serialKeyExpired) {
    return <Expired />;
  }
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
        <Route path="RealDashboard" element={<RealDashboard />} />

        <Route
          path="/pos/kotcancellation"
          element={<KotCancellationReport />}
        />

        <Route
          path="/pos/billcancellation"
          element={<BillCancellationReport />}
        />
        <Route path="/pos/BillModification" element={<BillModify />} />
        <Route path="/utility/printersettings" element={<PrinterSettings />} />
        <Route path="/master/company" element={<CompanyCreation />} />
        <Route path="/master/tax" element={<TaxMaster />} />
        <Route path="/master/taxdescrip" element={<TaxDescriptionMaster />} />
        <Route path="/master/departmentmaster" element={<DepartmentMaster />} />

        <Route path="/master/outletmaster" element={<OutletMaster />} />

        <Route path="/master/itemmaster" element={<ItemMaster />} />
        <Route
          path="/submaster/outletitemsdetails"
          element={<OutletItemsDetails />}
        />
        <Route path="/item-master-import" element={<ItemMasterImport />} />
        <Route path="/master/unitmaster" element={<UnitMaster />} />
        <Route
          path="/pos/dailysalecategorywise"
          element={<DailysaleCategorywisereport />}
        />
        <Route path="/master/groupmaster" element={<GroupMaster />} />
        <Route path="/pos/kotregister" element={<KotRegister />} />
        <Route path="/master/categorymaster" element={<CategoryMaster />} />
        <Route path="/billadjustment" element={<BillAdjustment />} />
        <Route path="/utility/utilitysettings" element={<UtilitySettings />} />
        <Route
          path="/master/subcategorymaster"
          element={<SubCategoryMaster />}
        />
        <Route
          path="/user-menu-submenu-creation"
          element={<UserMenuOrSubmenuCreation />}
        />
        <Route path="/master/stewardmaster" element={<StewardMaster />} />
        <Route
          path="/pos/settlementmodification"
          element={<SettlementBillModify />}
        />
        <Route
          path="/master/ncdepartmentmaster"
          element={<NCDepartmentMaster />}
        />
        <Route path="/master/printingmaster" element={<PrintingMaster />} />
        <Route path="/master/tablemaster" element={<TableMaster />} />
        <Route
          path="/master/propertymaster"
          element={<PropertyMasterCreation />}
        />
        <Route path="/master/branchmaster" element={<BranchMaster />} />

        <Route path="/adminpanel" element={<AdminPanel />} />
        <Route path="/master/usermaster" element={<UserMaster />} />
        <Route path="/master/userrightsmaster" element={<UserRightsMaster />} />
        <Route
          path="/pos/companybillsettlement"
          element={<CompanyBillSettlement />}
        />
        <Route path="/showKOTcancelscreen" element={<KOTClear />} />
        <Route path="/showBillsettlescreen" element={<BillClear />} />

              <Route path="/inventory/supplier" element={<SupplierMaster />} />
        <Route
          path="/inventory/inventoryitemcategory"
          element={<InventoryItemCategory />}
        />
        <Route
          path="/inventory/inventoryitemsubcategory"
          element={<InventoryItemSubCategory />}
        />
        <Route
          path="/inventory/inventoryitemstore"
          element={<InventoryItemStore />}
        />
        <Route path="/inventory/inventorystore" element={<InventoryStore />} />
            <Route path="/inventory/Miscellaneous" element={<Miscellaneous />} />
            <Route
  path="/inventory/InventoryGRNMiscellaneous"
  element={<InventoryGRNMiscellaneous />}
/>

          <Route
  path="/inventory-item-store-import"
  element={<InventoryItemStoreImport/>}
/>
        <Route
  path="/purchase/purchaseorder"
  element={<PurchaseOrder/>}
/>
      <Route
  path="/purchase/purchaseunitmaster"
  element={<PurchaseUnitMaster/>}
/>
      </Routes>
    </>
  );
}

export default LandingPage;
