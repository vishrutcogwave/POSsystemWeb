import React from "react";
import { ChefHat, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

type HeaderProps = {
  onNewOrder?: () => void;
  showNeworderButton?:boolean;
};

const Header: React.FC<HeaderProps> = ({ onNewOrder ,showNeworderButton}) => {
  const navigate = useNavigate();

const handleNewOrder = () => {
  if (onNewOrder) onNewOrder();

  navigate("/NewOrder", {
    state: { reset: true }, // ✅ IMPORTANT
  });
};
  const handleDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B1B34] text-white shadow-md">
      
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">

          {/* Icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#0576B2] flex items-center justify-center">
            <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>

          {/* Subtitle (hide on very small screens if needed) */}
          <p className="hidden sm:block text-sm text-white/80">
            POS powered by Cogwave 
          </p>

          {/* New Order */}
          {showNeworderButton&&
          <button
            onClick={handleNewOrder}
            className="flex items-center gap-2 bg-[#0576B2] hover:bg-[#0576B2] transition px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium"
          >
            + New Order
          </button>}
        </div>

        {/* RIGHT SIDE */}
        <button
          onClick={handleDashboard}
          className="flex items-center justify-center sm:gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          <LogOut size={18} />
          
          {/* Hide text on mobile */}
          <span className="text-sm">
            Dashboard
          </span>
        </button>

      </div>
    </header>
  );
};

export default Header;