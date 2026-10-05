import { useState, useEffect, useRef } from "react";
import {
  LayoutGrid,
  ChevronDown,
  Monitor,
  Settings,
  Database,
  Boxes,
  FileBarChart,
  LogOut,
  Menu,
  X,
  FileText,
  BarChart3,
  ClipboardList,
  Ban,
  FileX,
  Building2,
  Receipt,
  Store,
  Package,
  UserCog,
  ShieldCheck,
  Printer,
  Wrench,
  CreditCard,
  FilePen,
  Home,
  ShieldAlert,
  XCircle,
  Truck,
  Keyboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DayEntryPopup from "./DayEntryPopup";
import { useAppContext } from "../context/AppContext";
import BillCancellationPopup from "./BillCancellationPopup";
import { getProductLicenceKey } from "../api/services/products.service";
import toast from "react-hot-toast";

const DashboardHeader: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDayPopup, setShowDayPopup] = useState(false);
  const [showBillCancelPopup, setShowBillCancelPopup] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { userRights, clearAppData } = useAppContext();
  console.log("userRightslllllllllllll", userRights);
  const [license, setlicense] = useState<any>({});
  const [showLicensePopup, setShowLicensePopup] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);
  const [showLicenseAlert, setShowLicenseAlert] = useState(false);
  useEffect(() => {
    if (!license?.validDate) return;

    const today = new Date();

    const expiry = new Date(license.validDate);

    // remove time
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diff = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    setRemainingDays(diff);

    if (diff <= 15 && diff >= 0) {
      setShowLicenseAlert(true);
    } else {
      setShowLicenseAlert(false);
    }
  }, [license]);
  const hasMainMenuAccess = (menuName: string) => {
    return userRights?.some(
      (menu: any) =>
        menu.menuName?.toLowerCase() === menuName.toLowerCase() &&
        menu.menuPermission === true,
    );
  };
  const handleNavigation = (name: string) => {
    if (name === "Day Close") {
      setShowDayPopup(true);
      setActiveMenu(null);
      return;
    }

    if (name === "Bill Cancellation") {
      setShowBillCancelPopup(true);
      setActiveMenu(null);
      return;
    }

    if (routeMap[name]) {
      navigate(routeMap[name]);
    }

    setActiveMenu(null);
    setMobileOpen(false);
  };

  const hasSubMenuAccess = (subMenuName: string) => {
    return userRights?.some((menu: any) =>
      menu.subMenus?.some(
        (sub: any) =>
          sub.subMenuName?.toLowerCase() === subMenuName.toLowerCase() &&
          sub.isPermission === true,
      ),
    );
  };

  console.log("userRightsfromtheocntext", userRights);

  const inventoryItems = [
    {
      name: "Supplier Master",
      icon: Truck,
      permissionName: "Supplier",
    },
    {
      name: "Inventory Category",
      icon: Package,
      permissionName: "InventoryItemCategory",
    },
    {
      name: "Inventory Sub Category",
      icon: Package,
      permissionName: "InventoryItemSubCategory",
    },
    {
      name: "Inventory Store",
      icon: Store,
      permissionName: "Inventory Store",
    },
    {
      name: "Inventory Item Store",
      icon: Store,
      permissionName: "Inventory Item Store",
    },
    {
      name: "Miscellaneous",
      icon: Receipt,
      permissionName: "Miscellaneous",
    },
    {
      name: "Opening Stock",
      icon: Package,
      permissionName: "Opening Stock",
    },
    //   {
    //   name: "Inventory GRN Miscellaneous",
    //   icon: Receipt,
    //   permissionName: "InventoryGRNMiscellaneous",
    // },
  ];
  // 🔥 POS dropdown items
  const posDropdownItems = [
    {
      name: "Touch Screen",
      icon: Monitor,
      permissionName: "Touch Screen",
    },
    {
      name: "Keyboard Screen",
      icon: Keyboard,
      permissionName: "Keyboard Screen",
    },
    {
      name: "Day Close",
      icon: LogOut,
      permissionName: "Day Close",
    },
    {
      name: "Bill Cancellation",
      icon: Ban,
      permissionName: "Bill Cancellation",
    },
    {
      name: "Settlement Modification",
      icon: FilePen,
      permissionName: "Settlement Modification",
    },
    {
      name: "Company Bill Settlement",
      icon: CreditCard,
      permissionName: "Company Bill Settlement",
    },
    {
      name: "Bill Modification",
      icon: FilePen,
      permissionName: "Bill Modification",
    },
  ];

  // 🔥 POS Reports dropdown items WITH ICONS
  const posReportItems = [
    {
      name: "DailySales",
      icon: BarChart3,
      permissionName: "DailySales",
    },
    {
      name: "ItemSales",
      icon: FileText,
      permissionName: "ItemSales",
    },
    {
      name: "ChanceSheet",
      icon: ClipboardList,
      permissionName: "ChanceSheet",
    },
    {
      name: "VoidKot",
      icon: Ban,
      permissionName: "VoidKot",
    },
    {
      name: "Nckot",
      icon: FileX,
      permissionName: "Nckot",
    },
    {
      name: "BillReprint",
      icon: FileText,
      permissionName: "BillReprint",
    },
    {
      name: "KotCancellation",
      icon: Ban,
      permissionName: "KotCancellation",
    },
    {
      name: "BillCancellation",
      icon: Ban,
      permissionName: "BillCancellation",
    },
    {
      name: "DailysaleCategorywise",
      icon: BarChart3,
      permissionName: "DailysaleCategorywise",
    },
    {
      name: "KotRegister",
      icon: ClipboardList,
      permissionName: "KotRegister",
    },
  ];
  // 🔥 MASTER DROPDOWN
  const masterItems = [
    {
      name: "Company Master",
      icon: Building2,
      permissionName: "Company Master",
    },
    {
      name: "Tax Master",
      icon: Receipt,
      permissionName: "Tax Master",
    },
    {
      name: "Tax Description Master",
      icon: Receipt,
      permissionName: "Tax Description Master",
    },
    {
      name: "Department Master",
      icon: Boxes,
      permissionName: "Department Master",
    },
    {
      name: "Outlet Master",
      icon: Store,
      permissionName: "Outlet Master",
    },
    {
      name: "Item Master",
      icon: Package,
      permissionName: "Item Master",
    },
    {
      name: "Unit Master",
      icon: Package,
      permissionName: "Unit Master",
    },
    {
      name: "Group Master",
      icon: Package,
      permissionName: "Group Master",
    },
    {
      name: "Category Master",
      icon: Package,
      permissionName: "Category Master",
    },
    {
      name: "Sub Category Master",
      icon: Package,
      permissionName: "Sub Category Master",
    },
    {
      name: "Steward Master",
      icon: UserCog,
      permissionName: "Steward Master",
    },
    {
      name: "NC Department Master",
      icon: ShieldCheck,
      permissionName: "NC Department Master",
    },
    {
      name: "Printing Master",
      icon: Printer,
      permissionName: "Printing Master",
    },
    {
      name: "Table Master",
      icon: LayoutGrid,
      permissionName: "Table Master",
    },
    {
      name: "Property Master",
      icon: Building2,
      permissionName: "Property Master",
    },
    {
      name: "Branch Master",
      icon: Store,
      permissionName: "Branch Master",
    },
    {
      name: "User Master",
      icon: UserCog,
      permissionName: "User Master",
    },
    {
      name: "User Rights Master",
      icon: ShieldCheck,
      permissionName: "User Rights Master",
    },
  ];
  // 🔥 SUB MASTER DROPDOWN
  const subMasterItems = [
    {
      name: "Outlet Items Details",
      icon: Package,
      permissionName: "Outlet Items Details",
    },
  ];
  // 🔥 UTILITY DROPDOWN
  const utilityItems = [
    {
      name: "Utility Settings",
      icon: Wrench,
      permissionName: "Utility Settings",
    },
    {
      name: "Printer Settings",
      icon: Printer,
      permissionName: "Printer Settings",
    },
  ];

  const purchaseItems = [
    {
      name: "Purchase Order",
      icon: FilePen,
      permissionName: "Purchase Order",
    },
    {
      name: "Purchase Order Approval",
      icon: ShieldCheck,
      permissionName: "Purchase Order Approval",
    },
    {
      name: "Goods Received Note",
      icon: Package,
      permissionName: "Goods Received Note",
    },
    {
      name: "Item Purchase",
      icon: Receipt,
      permissionName: "Item Purchase",
    },
    {
      name: "Purchase Unit Master",
      icon: Package,
      permissionName: "Purchase Unit Master",
    },
    {
      name: "Purchase Return",
      icon: Receipt,
      permissionName: "Purchase Return",
    },
    {
      name: "Purchase Damage",
      icon: FileX,
      permissionName: "Purchase Damage",
    },
    {
      name: "Indent Order",
      icon: ClipboardList,
      permissionName: "Indent Order",
    },
    {
      name: "Indent Order Approval",
      icon: ShieldCheck,
      permissionName: "Indent Order Approval",
    },
    {
      name: "Item Issue",
      icon: ShieldCheck,
      permissionName: "Item Issue",
    },
    {
      name: "Item Return",
      icon: Receipt,
      permissionName: "Item Return",
    },
  ];
  // 🔥 Navigation map
  const routeMap: Record<string, string> = {
    Dashboard: "/dashboard",
    "Bill Modification": "/pos/BillModification",
    KotRegister: "/pos/kotregister",
    "Touch Screen": "/NewOrder",
    "Keyboard Screen": "/KeyboardScreen",

    DailySales: "/pos/dailysales",
    ItemSales: "/pos/itemsales",
    ChanceSheet: "/pos/chancesheet",
    VoidKot: "/pos/voidkot",
    Nckot: "/pos/nckot",
    BillReprint: "/pos/billreprint",
    "Company Master": "/master/company",
    "Tax Master": "/master/tax",
    "Tax Description Master": "/master/taxdescrip",
    "Department Master": "/master/departmentmaster",
    "Outlet Master": "/master/outletmaster",
    "Outlet Items Details": "/submaster/outletitemsdetails",
    "Item Master": "/master/itemmaster",
    "Unit Master": "/master/unitmaster",
    "Group Master": "/master/groupmaster",
    "Category Master": "/master/categorymaster",
    "Sub Category Master": "/master/subcategorymaster",
    "Steward Master": "/master/stewardmaster",
    "NC Department Master": "/master/ncdepartmentmaster",
    "Printing Master": "/master/printingmaster",
    "Table Master": "/master/tablemaster",
    "Property Master": "/master/propertymaster",
    "Branch Master": "/master/branchmaster",
    "User Master": "/master/usermaster",
    "User Rights Master": "/master/userrightsmaster",
    KotCancellation: "/pos/kotcancellation",
    BillCancellation: "/pos/billcancellation",
    DailysaleCategorywise: "/pos/dailysalecategorywise",
    "Utility Settings": "/utility/utilitysettings",
    "Settlement Modification": "/pos/settlementmodification",
    "Company Bill Settlement": "/pos/companybillsettlement",
    "Printer Settings": "/utility/printersettings",
    "Supplier Master": "/inventory/supplier",
    "Inventory Category": "/inventory/inventoryitemcategory",
    "Inventory Sub Category": "/inventory/inventoryitemsubcategory",
    "Inventory Store": "/inventory/inventorystore",
    "Inventory Item Store": "/inventory/inventoryitemstore",
    Miscellaneous: "/inventory/Miscellaneous",
    "Inventory GRN Miscellaneous": "/inventory/InventoryGRNMiscellaneous",
    "Purchase Order": "/purchase/purchaseorder",
    "Purchase Unit Master": "/purchase/purchaseunitmaster",
    "Purchase Order Approval": "/purchase/purchaseorderapproval",
    "Goods Received Note": "/purchase/goodsreceivednote",
    "Item Purchase": "/purchase/itempurchase",
    "Purchase Return": "/purchase/purchasereturn",
    "Purchase Damage": "/purchase/purchasedamage",
    "Indent Order": "/purchase/indentorder",
    "Indent Order Approval": "/purchase/indentorderapproval",
    "Item Issue": "/purchase/itemissue",
    "Item Return": "/purchase/itemreturn",
    "Opening Stock": "/inventory/openingstock",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearAppData();
    navigate("/", { replace: true });
  };

  const toggleMenu = (menu: string) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const getProductKeyDetails = async () => {
    const branchCode = localStorage.getItem("branch") || "";
    try {
      const res = await getProductLicenceKey(branchCode);
      console.log(res.data);
      setlicense(res.data);
    } catch (e: any) {
      toast.error(e);
    }
  };

  useEffect(() => {
    getProductKeyDetails();

    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setActiveMenu(null);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="w-full bg-gray-100 border-b shadow-sm">
      {/* Top Title */}
      <div className="px-3 sm:px-6 py-2 bg-gray-200 border-b flex items-center gap-2 whitespace-nowrap">
        <span className="text-[10px] sm:text-sm font-semibold text-gray-800 truncate flex-1">
          POINT OF SALE : COGWAVE SOFTWARE TECHNOLOGIES BANGALORE INDIA
        </span>

        <span className="text-[9px] sm:text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md shrink-0 tracking-wide">
          Version 3.0
        </span>
      </div>

      {/* Main Menu */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-gray-100 text-sm font-medium text-gray-800">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Mobile Toggle */}
          <button
            className="sm:hidden"
            onClick={(e) => {
              e.stopPropagation();
              setMobileOpen(!mobileOpen);
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-6">
            {/* MASTER DROPDOWN */}
            {/* DASHBOARD */}
            {hasMainMenuAccess("Dashboard") && (
              <button
                onClick={() => navigate("/RealDashboard")}
                className="flex items-center gap-2 hover:text-green-600"
              >
                <Home size={16} className="text-green-600" />
                Dashboard
              </button>
            )}
            {hasMainMenuAccess("Master") && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu("MASTER")}
                  className="flex items-center gap-2 hover:text-blue-600"
                >
                  <Settings size={16} className="text-blue-600" />
                  Master
                  <ChevronDown size={14} />
                </button>

                {activeMenu === "MASTER" && (
                  <div className="absolute left-0 mt-2 w-52 bg-white border rounded shadow-md z-50 max-h-96 overflow-y-auto">
                    {masterItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, index) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={index}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <Icon size={16} />
                            {item.name}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
            {/* SUB MASTER DROPDOWN */}
            {hasMainMenuAccess("Sub Master") && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu("SUB_MASTER")}
                  className="flex items-center gap-2 hover:text-purple-600"
                >
                  <Database size={16} className="text-purple-600" />
                  Sub Master
                  <ChevronDown size={14} />
                </button>

                {activeMenu === "SUB_MASTER" && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border rounded shadow-md z-50">
                    {subMasterItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, index) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={index}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <Icon size={16} />
                            {item.name}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
            {/* <button className="flex items-center gap-2 hover:text-green-600">
              <Boxes size={16} className="text-green-600" />
              Inventory
            </button> */}

            {/* POS Dropdown */}
            {hasMainMenuAccess("POS") && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu("POS")}
                  className="flex items-center gap-2 hover:text-orange-600"
                >
                  <LayoutGrid size={16} className="text-orange-600" />
                  POS
                  <ChevronDown size={14} />
                </button>

                {activeMenu === "POS" && (
                  <div className="absolute left-0 mt-2 w-52 bg-white border rounded shadow-md z-50 max-h-96 overflow-y-auto">
                    {posDropdownItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, index) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={index}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <Icon size={16} />
                            {item.name}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* POS REPORTS DROPDOWN */}
            {hasMainMenuAccess("POS Reports") && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu("POS_REPORTS")}
                  className="flex items-center gap-2 hover:text-red-600"
                >
                  <FileBarChart size={16} className="text-red-600" />
                  POS Reports
                  <ChevronDown size={14} />
                </button>

                {activeMenu === "POS_REPORTS" && (
                  <div className="absolute left-0 mt-2 w-52 bg-white border rounded shadow-md z-50 max-h-96 overflow-y-auto">
                    {posReportItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, index) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={index}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <Icon size={16} />
                            {item.name}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* UTILITY DROPDOWN */}
            {hasMainMenuAccess("POS Reports") && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu("UTILITY")}
                  className="flex items-center gap-2 hover:text-teal-600"
                >
                  <Wrench size={16} className="text-teal-600" />
                  Utility
                  <ChevronDown size={14} />
                </button>

                {activeMenu === "UTILITY" && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border rounded shadow-md z-50">
                    {utilityItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, index) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={index}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <Icon size={16} />
                            {item.name}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
            {hasMainMenuAccess("Inventory") && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu("INVENTORY")}
                  className="flex items-center gap-2 hover:text-indigo-600"
                >
                  <Boxes size={16} className="text-indigo-600" />
                  Inventory Master
                  <ChevronDown size={14} />
                </button>

                {activeMenu === "INVENTORY" && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border rounded shadow-md z-50">
                    {inventoryItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, index) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={index}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <Icon size={16} />
                            {item.name}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* PURCHASE DROPDOWN */}
            {hasMainMenuAccess("Purchase") && (
              <div className="relative">
                <button
                  onClick={() => toggleMenu("PURCHASE")}
                  className="flex items-center gap-2 hover:text-green-600"
                >
                  <Receipt size={16} className="text-green-600" />
                  Purchase
                  <ChevronDown size={14} />
                </button>

                {activeMenu === "PURCHASE" && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border rounded shadow-md z-50">
                    {purchaseItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, index) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={index}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <Icon size={16} />
                            {item.name}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
            {/* 
            <button className="flex items-center gap-2 hover:text-indigo-600">
              <FileBarChart size={16} className="text-indigo-600" />
              Inventory Reports
            </button>

            <button className="flex items-center gap-2 hover:text-teal-600">
              <Wrench size={16} className="text-teal-600" />
              Utility
            </button> */}
          </div>
        </div>

        {/* LOGOUT */}

        <div className="flex items-center gap-3">
          {showLicenseAlert && (
            <button
              onClick={() => setShowLicensePopup(true)}
              className="relative"
              title="License Expiring Soon"
            >
              <ShieldAlert size={28} className="text-red-600 animate-pulse" />

              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold">
                !
              </span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="sm:hidden bg-white border-t shadow-md">
          <div className="px-3 py-3 space-y-1">
            {/* DASHBOARD */}
            {hasMainMenuAccess("Dashboard") && (
              <button
                onClick={() => {
                  navigate("/RealDashboard");
                  setMobileOpen(false);
                  setActiveMenu(null);
                }}
                className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-left
                     hover:bg-green-50 active:bg-green-100 transition-colors"
              >
                <Home size={18} className="text-green-600 shrink-0" />
                <span className="flex-1">Dashboard</span>
              </button>
            )}

            {/* MASTER */}
            {hasMainMenuAccess("Master") && (
              <div>
                <button
                  onClick={() => toggleMenu("MASTER")}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg
                       hover:bg-blue-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Settings size={18} className="text-blue-600 shrink-0" />
                    <span>Master</span>
                  </span>

                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      activeMenu === "MASTER" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeMenu === "MASTER" && (
                  <div className="ml-4 mt-1 pl-3 border-l-2 border-blue-100 space-y-1">
                    {masterItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, i) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={i}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center w-full gap-3 px-3 py-2 rounded-md
                                 text-left text-gray-700 hover:bg-blue-50
                                 hover:text-blue-600 transition-colors"
                          >
                            <Icon
                              size={16}
                              className="text-gray-500 shrink-0"
                            />

                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* SUB MASTER */}
            {hasMainMenuAccess("Sub Master") && (
              <div>
                <button
                  onClick={() => toggleMenu("SUB_MASTER")}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg
                       hover:bg-purple-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Database size={18} className="text-purple-600 shrink-0" />
                    <span>Sub Master</span>
                  </span>

                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      activeMenu === "SUB_MASTER" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeMenu === "SUB_MASTER" && (
                  <div className="ml-4 mt-1 pl-3 border-l-2 border-purple-100 space-y-1">
                    {subMasterItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, i) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={i}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center w-full gap-3 px-3 py-2 rounded-md
                                 text-left text-gray-700 hover:bg-purple-50
                                 hover:text-purple-600 transition-colors"
                          >
                            <Icon
                              size={16}
                              className="text-gray-500 shrink-0"
                            />

                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* POS */}
            {hasMainMenuAccess("POS") && (
              <div>
                <button
                  onClick={() => toggleMenu("POS")}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg
                       hover:bg-orange-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <LayoutGrid
                      size={18}
                      className="text-orange-600 shrink-0"
                    />
                    <span>POS</span>
                  </span>

                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      activeMenu === "POS" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeMenu === "POS" && (
                  <div className="ml-4 mt-1 pl-3 border-l-2 border-orange-100 space-y-1">
                    {posDropdownItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, i) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={i}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center w-full gap-3 px-3 py-2 rounded-md
                                 text-left text-gray-700 hover:bg-orange-50
                                 hover:text-orange-600 transition-colors"
                          >
                            <Icon
                              size={16}
                              className="text-gray-500 shrink-0"
                            />

                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* POS REPORTS */}
            {hasMainMenuAccess("POS Reports") && (
              <div>
                <button
                  onClick={() => toggleMenu("POS_REPORTS")}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg
                       hover:bg-red-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <FileBarChart size={18} className="text-red-600 shrink-0" />
                    <span>POS Reports</span>
                  </span>

                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      activeMenu === "POS_REPORTS" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeMenu === "POS_REPORTS" && (
                  <div className="ml-4 mt-1 pl-3 border-l-2 border-red-100 space-y-1">
                    {posReportItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, i) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={i}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center w-full gap-3 px-3 py-2 rounded-md
                                 text-left text-gray-700 hover:bg-red-50
                                 hover:text-red-600 transition-colors"
                          >
                            <Icon
                              size={16}
                              className="text-gray-500 shrink-0"
                            />

                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* UTILITY */}
            {hasMainMenuAccess("POS Reports") && (
              <div>
                <button
                  onClick={() => toggleMenu("UTILITY")}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg
                       hover:bg-teal-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Wrench size={18} className="text-teal-600 shrink-0" />
                    <span>Utility</span>
                  </span>

                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      activeMenu === "UTILITY" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeMenu === "UTILITY" && (
                  <div className="ml-4 mt-1 pl-3 border-l-2 border-teal-100 space-y-1">
                    {utilityItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, i) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={i}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center w-full gap-3 px-3 py-2 rounded-md
                                 text-left text-gray-700 hover:bg-teal-50
                                 hover:text-teal-600 transition-colors"
                          >
                            <Icon
                              size={16}
                              className="text-gray-500 shrink-0"
                            />

                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* INVENTORY */}
            {hasMainMenuAccess("Inventory") && (
              <div>
                <button
                  onClick={() => toggleMenu("INVENTORY")}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg
                       hover:bg-indigo-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Boxes size={18} className="text-indigo-600 shrink-0" />
                    <span>Inventory Master</span>
                  </span>

                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      activeMenu === "INVENTORY" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeMenu === "INVENTORY" && (
                  <div className="ml-4 mt-1 pl-3 border-l-2 border-indigo-100 space-y-1">
                    {inventoryItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, i) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={i}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center w-full gap-3 px-3 py-2 rounded-md
                                 text-left text-gray-700 hover:bg-indigo-50
                                 hover:text-indigo-600 transition-colors"
                          >
                            <Icon
                              size={16}
                              className="text-gray-500 shrink-0"
                            />

                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* PURCHASE */}
            {hasMainMenuAccess("Purchase") && (
              <div>
                <button
                  onClick={() => toggleMenu("PURCHASE")}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg
                       hover:bg-green-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Receipt size={18} className="text-green-600 shrink-0" />
                    <span>Purchase</span>
                  </span>

                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      activeMenu === "PURCHASE" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeMenu === "PURCHASE" && (
                  <div className="ml-4 mt-1 pl-3 border-l-2 border-green-100 space-y-1">
                    {purchaseItems
                      .filter((item) => hasSubMenuAccess(item.permissionName))
                      .map((item, i) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={i}
                            onClick={() => handleNavigation(item.name)}
                            className="flex items-center w-full gap-3 px-3 py-2 rounded-md
                                 text-left text-gray-700 hover:bg-green-50
                                 hover:text-green-600 transition-colors"
                          >
                            <Icon
                              size={16}
                              className="text-gray-500 shrink-0"
                            />

                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <DayEntryPopup
        isOpen={showDayPopup}
        onClose={() => setShowDayPopup(false)}
      />

      <BillCancellationPopup
        isOpen={showBillCancelPopup}
        onClose={() => setShowBillCancelPopup(false)}
      />
      {showLicensePopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl w-[400px] p-6 shadow-xl relative">
            <button
              onClick={() => setShowLicensePopup(false)}
              className="absolute right-3 top-3"
            >
              <XCircle className="text-gray-500" />
            </button>

            <div className="flex justify-center mb-4">
              <ShieldAlert size={60} className="text-red-600 animate-bounce" />
            </div>

            <h2 className="text-xl font-bold text-center text-red-600">
              License Expiring Soon
            </h2>

            <p className="text-center mt-4 text-gray-700">
              Your license will expire in
              <span className="font-bold text-red-600">
                {" "}
                {remainingDays} day{remainingDays !== 1 ? "s" : ""}
              </span>
            </p>

            <div className="mt-5 bg-red-50 rounded-lg p-3">
              <p>
                <strong>Expiry Date :</strong>{" "}
                {new Date(license.validDate).toLocaleDateString()}
              </p>

              <p className="mt-2">
                Please renew your license before it expires.
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowLicensePopup(false)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
