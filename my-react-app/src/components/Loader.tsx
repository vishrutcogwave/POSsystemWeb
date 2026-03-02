import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F19]/80 backdrop-blur-sm px-4">
      <div className="flex flex-col items-center gap-4">

        {/* Spinner */}
        <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent 
        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"></div>

        {/* Text */}
        <p className="text-gray-300 text-xs sm:text-sm md:text-base">
          Authenticating...
        </p>

      </div>
    </div>
  );
};

export default Loader;