import React from "react";
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
  if (!isOpen) return null;
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

  // fallback Occupied
  if (status === "Occupied" && !kotStatus) {
    styles = "bg-red-100 text-red-600 border-red-400";
  }

  return styles;
};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Table Bills</h2>
          <button onClick={onClose} className="text-xl">
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
{bills
  .filter((item) => item.tableStatus !== "Available") // ✅ HIDE AVAILABLE
  .map((item) => {
    const statusStyle = getStatusStyle(item.tableStatus, item.kotStatus);

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
        className={`rounded-lg border p-4 text-left transition ${statusStyle}`}
      >
        <div className="flex justify-between items-center">
          <p className="font-semibold text-lg">{item.subTable}</p>

          {item.billNo && (
            <span className="text-xs font-medium bg-white px-2 py-1 rounded">
              #{item.billNo}
            </span>
          )}
        </div>

        <p className="text-xs mt-1">{item.tableStatus}</p>
      </button>
    );
  })}
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
