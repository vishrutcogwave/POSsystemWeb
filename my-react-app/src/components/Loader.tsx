import React from "react";
import { ChefHat } from "lucide-react";

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B0F19]/90 backdrop-blur-sm">
      <div className="flex flex-col items-center px-4">

        {/* Chef Hat */}
        <ChefHat className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-orange-400 animate-bounce mb-5" />

        {/* Cooking Animation */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32">

          {/* Steam */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="steam"></span>
            <span className="steam delay-200"></span>
            <span className="steam delay-500"></span>
          </div>

          {/* Lid */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-2 bg-gray-400 rounded-full">
            <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-orange-400 rounded-full"></div>
          </div>

          {/* Pot */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-16 h-10 sm:w-20 sm:h-12 bg-slate-700 border-2 border-slate-500 rounded-b-xl overflow-hidden">

            {/* Soup */}
            <div className="absolute left-2 right-2 top-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>

            {/* Spoon */}
            <div className="spoon absolute left-1/2 -translate-x-1/2 -top-1"></div>
          </div>

          {/* Left Handle */}
          <div className="absolute top-[54px] left-[26px] sm:left-[28px] w-3 h-5 border-2 border-slate-500 rounded-l-full"></div>

          {/* Right Handle */}
          <div className="absolute top-[54px] right-[26px] sm:right-[28px] w-3 h-5 border-2 border-slate-500 rounded-r-full"></div>

        </div>

        {/* Text */}
        <h2 className="mt-4 text-white text-base sm:text-lg md:text-xl font-semibold text-center">
          Loading Kitchen
          <span className="inline-flex">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce [animation-delay:200ms]">.</span>
            <span className="animate-bounce [animation-delay:400ms]">.</span>
          </span>
        </h2>

        <p className="text-gray-400 text-xs sm:text-sm mt-2 text-center">
          Please wait...
        </p>
      </div>

      <style>{`
        .steam {
          width: 4px;
          height: 20px;
          background: rgba(255,255,255,.75);
          border-radius: 9999px;
          animation: steam 1.6s ease-in-out infinite;
        }

        .delay-200 {
          animation-delay: .2s;
        }

        .delay-500 {
          animation-delay: .5s;
        }

        .spoon {
          width: 4px;
          height: 34px;
          background: #d1d5db;
          border-radius: 9999px;
          transform-origin: bottom center;
          animation: stir 1.5s ease-in-out infinite;
        }

        @media (min-width:640px) {
          .spoon {
            height: 40px;
          }

          .steam {
            height: 24px;
          }
        }

        @keyframes steam {
          0% {
            opacity: 0;
            transform: translateY(0) scale(1);
          }
          30% {
            opacity: .8;
          }
          100% {
            opacity: 0;
            transform: translateY(-22px) scale(1.3);
          }
        }

        @keyframes stir {
          0%,100% {
            transform: translateX(-50%) rotate(-20deg);
          }
          50% {
            transform: translateX(-50%) rotate(20deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;