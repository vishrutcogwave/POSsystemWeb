// // 

// import React, { useEffect, useState } from "react";
// import type { SubTable } from "../utils";

// type Props = {
//   isOpen: boolean;
//   bills: SubTable[];
//   onSelectBill: (sub: string) => void;
//   onNewBill: () => void;
//   onClose: () => void;
//   onUnsettledClick: (item: SubTable) => void;
// };

// const KotModal: React.FC<Props> = ({
//   isOpen,
//   bills,
//   onSelectBill,
//   onNewBill,
//   onClose,
//   onUnsettledClick
// }) => {
//   const [, setCurrentTime] = useState(Date.now());

//   // Update timer every second
//   useEffect(() => {
//     if (!isOpen) return;

//     const interval = setInterval(() => {
//       setCurrentTime(Date.now());
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [isOpen]);

//   if (!isOpen) return null;

//   console.log("bills", bills);

//   const getStatusStyle = (status: string, kotStatus?: string) => {
//     let styles = "bg-gray-100 text-gray-600 border-gray-300";

//     if (status === "Available") {
//       styles = "bg-[#E6F3FA] text-[#0576B2] border-[#0576B2]";
//     }

//     if (status === "Unsettled") {
//       styles = "bg-yellow-100 text-yellow-700 border-yellow-400";
//     }

//     if (status === "Occupied" && kotStatus === "KOT") {
//       styles = "bg-red-100 text-red-600 border-red-400";
//     }

//     if (status === "Occupied" && kotStatus === "NCKOT") {
//       styles = "bg-purple-100 text-purple-700 border-purple-400";
//     }

//     if (status === "Occupied" && !kotStatus) {
//       styles = "bg-red-100 text-red-600 border-red-400";
//     }

//     return styles;
//   };

//   // Calculate time passed from kotTime
//   const getTimePassed = (kotTime?: string) => {
//     if (!kotTime) return "-";

//     const startTime = new Date(kotTime).getTime();
//     const now = Date.now();

//     let diff = Math.floor((now - startTime) / 1000);

//     // Prevent negative time
//     if (diff < 0) diff = 0;

//     const hours = Math.floor(diff / 3600);
//     const minutes = Math.floor((diff % 3600) / 60);
//     const seconds = diff % 60;

//     if (hours > 0) {
//       return `${hours}h ${minutes}m ${seconds}s`;
//     }

//     if (minutes > 0) {
//       return `${minutes}m ${seconds}s`;
//     }

//     return `${seconds}s`;
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//       <div className="w-full max-w-lg rounded-xl bg-white p-6">

//         <div className="mb-4 flex items-center justify-between">
//           <h2 className="text-lg font-semibold">
//             Table Bills
//           </h2>

//           <button
//             onClick={onClose}
//             className="text-xl"
//           >
//             ×
//           </button>
//         </div>

//         <div className="grid grid-cols-2 gap-4">

//           {bills
//             .filter((item) => item.tableStatus !== "Available")
//             .map((item) => {

//               const statusStyle = getStatusStyle(
//                 item.tableStatus,
//                 item.kotStatus
//               );

//               return (
//                 <button
//                   key={item.subTable}
//                   onClick={() => {
//                     if (item.tableStatus === "Unsettled") {
//                       onUnsettledClick(item);
//                     } else {
//                       onSelectBill(item.subTable);
//                     }
//                   }}
//                   className={`rounded-lg border p-4 text-left transition ${statusStyle}`}
//                 >

//                   {/* Header */}
//                   <div className="flex justify-between items-center">
//                     <p className="font-semibold text-lg">
//                       {item.subTable}
//                     </p>

//                     {item.billNo && (
//                       <span className="text-xs font-medium bg-white px-2 py-1 rounded">
//                         #{item.billNo}
//                       </span>
//                     )}
//                   </div>

//                   {/* Status */}
//                   <p className="text-xs mt-1">
//                     {item.tableStatus}
//                   </p>

//                   {/* Time Passed */}
//                   {item.kotTime && (
//                     <div className="mt-2 flex items-center gap-1">
//                       <span className="text-xs">
//                         ⏱️
//                       </span>

//                       <span className="text-sm font-semibold">
//                         {getTimePassed(item.kotTime)}
//                       </span>
//                     </div>
//                   )}

//                   {/* KOT Time */}
//                   {item.kotTime && (
//                     <p className="text-[11px] mt-1 opacity-70">
//                       KOT:{" "}
//                       {new Date(item.kotTime).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit"
//                       })}
//                     </p>
//                   )}

//                 </button>
//               );
//             })}

//           {/* New Bill */}
//           <button
//             onClick={onNewBill}
//             className="rounded-lg border-2 border-dashed border-[#0576B2] bg-white p-4 text-[#0576B2] font-semibold"
//           >
//             ➕ New Bill
//           </button>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default KotModal;



import React, { useEffect, useState } from "react";
import type { SubTable } from "../utils";

type Props = {
  isOpen: boolean;
  bills: SubTable[];
  onSelectBill: (sub: string) => void;
  onNewBill: () => void;
  onClose: () => void;
  onUnsettledClick: (item: SubTable) => void;
};

const KotModal: React.FC<Props> = ({
  isOpen,
  bills,
  onSelectBill,
  onNewBill,
  onClose,
  onUnsettledClick
}) => {
  const [, setCurrentTime] = useState(Date.now());

  // Update timer every second
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  console.log("bills", bills);

  const getStatusStyle = (status: string, kotStatus?: string) => {
    let styles = "bg-gray-100 text-gray-600 border-gray-300";

    if (status === "Available") {
      styles = "bg-[#E6F3FA] text-[#0576B2] border-[#0576B2]";
    }

    if (status === "Unsettled") {
      styles = "bg-yellow-100 text-yellow-700 border-yellow-400";
    }

    if (status === "Occupied" && kotStatus === "KOT") {
      styles = "bg-red-100 text-red-600 border-red-400";
    }

    if (status === "Occupied" && kotStatus === "NCKOT") {
      styles = "bg-purple-100 text-purple-700 border-purple-400";
    }

    if (status === "Occupied" && !kotStatus) {
      styles = "bg-red-100 text-red-600 border-red-400";
    }

    return styles;
  };

  // Calculate time passed from kotTime
  const getTimePassed = (kotTime?: string) => {
    if (!kotTime) return "-";

    const startTime = new Date(kotTime).getTime();
    const now = Date.now();

    let diff = Math.floor((now - startTime) / 1000);

    // Prevent negative time
    if (diff < 0) diff = 0;

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6">

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Table Bills
          </h2>

          <button
            onClick={onClose}
            className="text-xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
{bills
  .filter((item) => item.tableStatus !== "Available")
  .map((item) => {
    const statusStyle = getStatusStyle(
      item.tableStatus,
      item.kotStatus
    );

    return (
    <button
  key={item.subTable}
  onClick={() => {
    if (item.tableStatus === "Unsettled") {
      onUnsettledClick(item);
    } else {
      onSelectBill(item.subTable);
    }
  }}
  className={`relative rounded-lg border p-3 text-left transition ${statusStyle}`}
>
  {/* Timer - TOP RIGHT ONLY FOR OCCUPIED */}
  {item.tableStatus === "Occupied" && item.kotTime && (
    <span className="absolute top-2 right-2 rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
      ⏱ {getTimePassed(item.kotTime)}
    </span>
  )}

  {/* Table Number */}
  <p className="font-semibold text-base">
    {item.subTable}
  </p>

  {/* Bill Number */}
  {item.billNo && (
    <span className="mt-1 inline-block rounded bg-white px-1.5 py-0.5 text-[10px] font-medium">
      #{item.billNo}
    </span>
  )}

  {/* Status */}
  <p className="mt-1 text-[11px]">
    {item.tableStatus}
  </p>
</button>
    );
  })}

          {/* New Bill */}
          <button
            onClick={onNewBill}
            className="rounded-lg border-2 border-dashed border-[#0576B2] bg-white p-4 text-[#0576B2] font-semibold"
          >
            ➕ New Bill
          </button>

        </div>
      </div>
    </div>
  );
};

export default KotModal;