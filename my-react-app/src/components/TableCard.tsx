import React from "react";
type TableCardProps = {
  tableNumber: string | number;
  status: "Occupied" | "Available" | "Unsettled" | string;
  kotStatus?: "KOT" | "NCKOT" | string;
  peopleCount?: number;
  handleCardClick: () => void;
};
const TableCard: React.FC<TableCardProps> = ({
  tableNumber,
  status,
  peopleCount,
  handleCardClick,
  kotStatus
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

  const fixedTime = "01:24:18";
  const fixedPrice = "₹ 1,250";

  return (
    <div
      onClick={handleCardClick}
      className={`relative ${statusStyles} border rounded-lg p-2 pt-7 flex flex-col items-center justify-center gap-1 sm:gap-2 transition hover:shadow-md active:scale-95 cursor-pointer`}
    >
      {/* Badge Row */}
      <div className="absolute top-1 left-1 right-1 flex flex-wrap justify-center gap-1 text-[7px] sm:text-[8px] md:text-[9px]">
        {status === "Occupied" && (
          <>
            <div className="bg-white/90 text-gray-700 px-1 py-0.5 rounded-md shadow-sm flex items-center gap-1 whitespace-nowrap">
              ⏱ {fixedTime}
            </div>
            <div className="bg-white/90 text-gray-700 px-1 py-0.5 rounded-md shadow-sm flex items-center gap-1 whitespace-nowrap">
              💰 {fixedPrice}
            </div>
          </>
        )}
        {peopleCount !== undefined && (
          <div className="bg-white/90 text-gray-700 px-1 py-0.5 rounded-md shadow-sm flex items-center gap-1 whitespace-nowrap">
            👥 {peopleCount}
          </div>
        )}
      </div>

      {/* Table Number */}
      <div className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-center truncate w-full">
        {tableNumber}
      </div>

      {/* Status */}
      <div className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide text-center truncate w-full">
        {status}
      </div>
    </div>
  );
};

export default TableCard;