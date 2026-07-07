import React from "react";
import { ArrowRightLeft } from "lucide-react";

type TableCardProps = {
  tableNumber: string | number;
  status: "Occupied" | "Available" | "Unsettled" | string;
  kotStatus?: "KOT" | "NCKOT" | string;
  peopleCount?: number;
  handleCardClick: () => void;
  billNo: number;
  handleOpenTableTransfer: () => void;
};

const TableCard: React.FC<TableCardProps> = ({
  billNo,
  tableNumber,
  status,
  handleCardClick,
  kotStatus,
  handleOpenTableTransfer
}) => {
  let statusStyles = "bg-gray-100 text-gray-600 border-gray-300";

  if (status === "Available") {
    statusStyles = "bg-[#E6F3FA] text-[#0576B2] border-[#0576B2]";
  }
  if (status === "Unsettled") {
    statusStyles = "bg-yellow-100 text-yellow-700 border-yellow-400";
  }
  if (status === "Occupied" && kotStatus === "KOT") {
    statusStyles = "bg-red-100 text-red-600 border-red-400";
  }
  if (status === "Occupied" && kotStatus === "NCKOT") {
    statusStyles = "bg-purple-100 text-purple-700 border-purple-400";
  }

  return (
    <div
    onClick={handleCardClick}
    
      className={`relative ${statusStyles} border rounded-lg p-2 pt-7 flex flex-col items-center justify-center gap-1 sm:gap-2 transition hover:shadow-md active:scale-95 cursor-pointer`}
    >
      {/* Badge Row */}

      <span  >
      <div  className="absolute top-1 left-1 right-1 flex justify-center">
        {status === "Unsettled" && (
          <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-medium">
            🧾 Bill {billNo}
          </div>
        )}
      </div>

      {/* Table Number */}
      <div   className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-center truncate w-full">
        {tableNumber}
      </div>

      {/* Status */}
      <div className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide text-center truncate w-full">
        {status}
      </div>
      </span>

      {/* 🔁 Transfer Icon (only for Occupied) */}
      {status === "Occupied" && (
        <div onClick={handleOpenTableTransfer} className="absolute -top-3 bg-white rounded-full p-2 shadow-md border">
          <ArrowRightLeft size={16} className="text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default TableCard;