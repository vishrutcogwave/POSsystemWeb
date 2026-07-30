import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  Menu,
  X,
  LayoutDashboard,
  Grid2X2,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import SalesDashboard from "../components/SalesDashboard";
import TableMatrix from "./TableMatrix";

function RealDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");

const reports = [
  "Daily Sales",
  "Item Sales",
  "Chance Sheet",
  "Void KOT",
  "NCKOT",
  "KOT Cancellation",
  "Bill Cancellation",
  "Daily Sale Category Wise",
  "KOT Register",
];

  const handleMenuClick = (menu: string) => {
    setSelectedMenu(menu);
    setSidebarOpen(false);
  };

const handleReportNavigation = (report: string) => {
  const routes: Record<string, string> = {
    "Daily Sales": "/pos/dailysales",
    "Item Sales": "/pos/itemsales",
    "Chance Sheet": "/pos/chancesheet",
    "Void KOT": "/pos/voidkot",
    "NCKOT": "/pos/nckot",
    "KOT Cancellation": "/pos/kotcancellation",
    "Bill Cancellation": "/pos/billcancellation",
    "Daily Sale Category Wise": "/pos/dailysalecategorywise",
    "KOT Register": "/pos/kotregister",
  };

  setSidebarOpen(false);
  navigate(routes[report]);
};
  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <Header />

      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow px-4 py-3 flex items-center">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu size={26} />
        </button>

        <h2 className="ml-4 font-bold text-lg">{selectedMenu}</h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static
            top-0 left-0
            h-full
            w-64
            bg-[#0B1736]
            text-white
            z-50
            transform
            transition-transform
            duration-300
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
        >
          {/* Mobile Close */}
          <div className="lg:hidden flex justify-end p-4">
            <button onClick={() => setSidebarOpen(false)}>
              <X />
            </button>
          </div>

          <nav className="mt-4 px-3 space-y-2">
            {/* Dashboard */}
            <button
              onClick={() => handleMenuClick("Dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                selectedMenu === "Dashboard"
                  ? "bg-blue-600"
                  : "hover:bg-[#16224A]"
              }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>

            {/* Table Matrix */}
            <button
              onClick={() => handleMenuClick("Table Matrix")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                selectedMenu === "Table Matrix"
                  ? "bg-blue-600"
                  : "hover:bg-[#16224A]"
              }`}
            >
              <Grid2X2 size={20} />
              Table Matrix
            </button>

            {/* Reports */}
            <button
              onClick={() => setReportsOpen(!reportsOpen)}
              className="w-full flex justify-between items-center px-4 py-3 rounded-lg hover:bg-[#16224A]"
            >
              <div className="flex items-center gap-3">
                <FileText size={20} />
                Reports
              </div>

              {reportsOpen ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>

            {/* Report Submenus */}
            {reportsOpen && (
              <div className="ml-7 space-y-1">
                {reports.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleReportNavigation(item)}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm transition hover:bg-[#16224A]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </nav>
        </aside>

        {/* Right Content */}
        <main className="flex-1 overflow-auto p-3 md:p-5 lg:p-6">
          <div className="bg-white rounded-xl shadow min-h-full p-4 md:p-6">
          {selectedMenu === "Dashboard" && <SalesDashboard />}

              {selectedMenu === "Table Matrix" && <TableMatrix />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default RealDashboard;