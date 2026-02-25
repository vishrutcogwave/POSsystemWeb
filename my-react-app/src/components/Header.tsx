import React from "react";
import { ChefHat } from "lucide-react";
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

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B1B34] text-white px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
      
      {/* Left Section */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        
        {/* Kitchen Icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#026388] flex items-center justify-center">
          <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>

        {/* Subtitle Only */}
        <p className="text-xs sm:text-sm text-white/80 whitespace-nowrap">
          POS powered by Cogwave
        </p>

        {/* New Order Button */}
        <button
          onClick={handleNewOrder}
          className="ml-2 flex items-center gap-1 sm:gap-2 bg-[#026388] hover:bg-[#0288A1] transition px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base font-medium whitespace-nowrap"
        >
          + New Order
        </button>
      </div>
    </header>
  );
};

export default Header;