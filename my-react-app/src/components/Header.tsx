import React from "react";
import { ChefHat, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

type HeaderProps = {
  onNewOrder?: () => void;
};

const Header: React.FC<HeaderProps> = ({ onNewOrder }) => {
  const navigate = useNavigate();

  const handleNewOrder = () => {
    if (onNewOrder) {
      onNewOrder();
    }
    navigate("/NewOrder");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B1B34] text-white shadow-md">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-3">

        {/* LEFT SECTION */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          
          {/* Icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#026388] flex items-center justify-center">
            <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-white/80">
            POS powered by Cogwave
          </p>

          {/* New Order */}
          <button
            onClick={handleNewOrder}
            className="flex items-center gap-2 bg-[#026388] hover:bg-[#0288A1] transition px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium"
          >
            + New Order
          </button>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full sm:w-auto flex justify-end">
          <button
            onClick={handleDashboard}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs sm:text-sm"
          >
            <LogOut size={16} />
            Dashboard
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;