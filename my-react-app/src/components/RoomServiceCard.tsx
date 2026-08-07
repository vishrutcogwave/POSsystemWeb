import React from "react";

type RoomServiceCardProps = {
  room: any;
  onClick: () => void;
};

const RoomServiceCard: React.FC<RoomServiceCardProps> = ({
  room,
  onClick,
}) => {
  let statusStyles = "bg-gray-100 text-gray-600 border-gray-300";

  if (room.tableStatus === "Available") {
    statusStyles = "bg-[#E6F3FA] text-[#0576B2] border-[#0576B2]";
  }

  if (room.tableStatus === "Occupied") {
    statusStyles = "bg-red-100 text-red-600 border-red-400";
  }

  if (room.tableStatus === "Unsettled") {
    statusStyles = "bg-yellow-100 text-yellow-700 border-yellow-400";
  }

  return (
    <div
      onClick={onClick}
     className={`relative ${statusStyles} border rounded-lg p-2 pt-7 flex flex-col items-center justify-center gap-1 sm:gap-2 transition hover:shadow-md active:scale-95 cursor-pointer`}
    >
 
  <div   className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-center truncate w-full">
    {room.roomNo}
      </div>
  

   <div className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide text-center truncate w-full">
     {room.tableStatus}
      </div>

   
    </div>
  );
};

export default RoomServiceCard;