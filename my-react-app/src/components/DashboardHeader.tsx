import { useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardHeader: React.FC = () => {
  const [posOpen, setPosOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleNavigation = (dropdown: string) => {
    if (dropdown === "Touch Screen") {
      navigate("/NewOrder");
    }
    setPosOpen(false);
  };

  const handleLogout = () => {
    // clear storage if needed
    localStorage.clear();
    sessionStorage.clear();

    navigate("/"); // change route if needed
  };

  const posDropdownItems = [{ name: "Touch Screen", icon: Monitor }];

  return (
    <div className="w-full bg-gray-100 border-b shadow-sm">
      {/* Top Title */}
      <div className="px-6 py-2 bg-gray-200 text-sm font-semibold text-gray-800 border-b">
        POINT OF SALE : COGWAVE SOFTWARE TECHNOLOGIES BANGALORE INDIA
      </div>

      {/* Menu Bar */}
      <div className="flex items-center justify-between px-6 py-2 bg-gray-100 text-sm font-medium text-gray-800">
        
        {/* LEFT SIDE MENUS */}
        <div className="flex items-center gap-6">
          
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

          {/* POS Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPosOpen(!posOpen)}
              className="flex items-center gap-2 hover:text-orange-600"
            >
              <LayoutGrid size={16} className="text-orange-600" />
              POS
              <ChevronDown size={14} />
            </button>

            {posOpen && (
              <div className="absolute left-0 mt-2 w-52 bg-white border rounded shadow-md z-50">
                {posDropdownItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      onClick={() => handleNavigation(item.name)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                    >
                      <Icon size={16} className="text-blue-500" />
                      {item.name}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 hover:text-indigo-600">
            <FileBarChart size={16} className="text-indigo-600" />
            Inventory Reports
          </button>

          <button className="flex items-center gap-2 hover:text-red-600">
            <FileBarChart size={16} className="text-red-600" />
            POS Reports
          </button>

          <button className="flex items-center gap-2 hover:text-teal-600">
            <Wrench size={16} className="text-teal-600" />
            Utility
          </button>
        </div>

        {/* RIGHT SIDE LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;