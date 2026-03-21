import { useState, useEffect, useRef } from "react";
import {
  LayoutGrid,
  ChevronDown,
  Monitor,
  Settings,
  Database,
  Boxes,
  FileBarChart,
  Wrench,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardHeader: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 🔥 POS dropdown items
  const posDropdownItems = [{ name: "Touch Screen", icon: Monitor }];

  // 🔥 POS Reports dropdown items
  const posReportItems = [
    { name: "DailySales" },
    { name: "ItemSales" },
    { name: "ChanceSheet" },
    { name: "VoidKot" },
    { name: "Nckot" },
  ];

  // 🔥 Navigation map (clean)
  const routeMap: Record<string, string> = {
    "Touch Screen": "/NewOrder",
    DailySales: "/pos/dailysales",
    ItemSales: "/pos/itemsales",
    ChanceSheet: "/pos/chancesheet",
    VoidKot: "/pos/voidkot",
    Nckot: "/pos/nckot",
  };

  const handleNavigation = (name: string) => {
    if (routeMap[name]) {
      navigate(routeMap[name]);
    }

    setActiveMenu(null);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ✅ Toggle logic (ONLY ONE OPEN)
  const toggleMenu = (menu: string) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  // ✅ Close on outside click + ESC
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
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
      <div className="px-4 sm:px-6 py-2 bg-gray-200 text-xs sm:text-sm font-semibold text-gray-800 border-b">
        POINT OF SALE : COGWAVE SOFTWARE TECHNOLOGIES BANGALORE INDIA
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
            <button className="flex items-center gap-2 hover:text-blue-600">
              <Settings size={16} className="text-blue-600" />
              Master
            </button>

            <button className="flex items-center gap-2 hover:text-purple-600">
              <Database size={16} className="text-purple-600" />
              Sub Master
            </button>

            <button className="flex items-center gap-2 hover:text-green-600">
              <Boxes size={16} className="text-green-600" />
              Inventory
            </button>

            {/* ✅ POS Dropdown */}
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
                <div className="absolute left-0 mt-2 w-52 bg-white border rounded shadow-md z-50">
                  {posDropdownItems.map((item, index) => {
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

            {/* ✅ POS REPORTS DROPDOWN */}
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
                <div className="absolute left-0 mt-2 w-52 bg-white border rounded shadow-md z-50">
                  {posReportItems.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleNavigation(item.name)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="flex items-center gap-2 hover:text-indigo-600">
              <FileBarChart size={16} className="text-indigo-600" />
              Inventory Reports
            </button>

            <button className="flex items-center gap-2 hover:text-teal-600">
              <Wrench size={16} className="text-teal-600" />
              Utility
            </button>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="sm:hidden flex flex-col gap-3 px-4 py-3 bg-white border-t shadow-md text-sm">
          <button className="flex items-center gap-2">
            <Settings size={16} /> Master
          </button>

          <button className="flex items-center gap-2">
            <Database size={16} /> Sub Master
          </button>

          <button className="flex items-center gap-2">
            <Boxes size={16} /> Inventory
          </button>

          {/* POS */}
          <div>
            <button
              onClick={() => toggleMenu("POS")}
              className="flex justify-between w-full"
            >
              POS <ChevronDown size={16} />
            </button>

            {activeMenu === "POS" && (
              <div className="ml-4 mt-2">
                {posDropdownItems.map((item, i) => (
                  <button key={i} onClick={() => handleNavigation(item.name)}>
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* POS REPORTS */}
          <div>
            <button
              onClick={() => toggleMenu("POS_REPORTS")}
              className="flex justify-between w-full"
            >
              POS Reports <ChevronDown size={16} />
            </button>

            {activeMenu === "POS_REPORTS" && (
              <div className="ml-4 mt-2 flex flex-col gap-2">
                {posReportItems.map((item, i) => (
                  <button key={i} onClick={() => handleNavigation(item.name)}>
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button>Inventory Reports</button>
          <button>Utility</button>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;