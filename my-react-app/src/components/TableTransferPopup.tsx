import React from "react";
import type { SubTable } from "../utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  subTables: SubTable[];
  tableData: any;
  transferTypes: any[];
  selectedSubTableTable: string | null;
  setselectedSubTableTable: (val: string | null) => void;
  selectedKotId: number[];
  setSelectedKotId: (id: number[]) => void;
  TransformSelectedTable: string | null;
  setTransformSelectedTable: (val: string | null) => void;
  selectedTable: any;
  selectedTransferType: string;
  setSelectedTransferType: (val: string) => void;
  handleSubmit: () => void;
  oldcartdata: any;
    selectedItems: any[];
  setSelectedItems: React.Dispatch<React.SetStateAction<any[]>>;
};

const TableTransferPopup: React.FC<Props> = ({
  isOpen,
  onClose,
  subTables,
  tableData,
  transferTypes,
  TransformSelectedTable,
  selectedSubTableTable,
  selectedTransferType,
  setSelectedTransferType,
  setTransformSelectedTable,
  setselectedSubTableTable,
  handleSubmit,
  oldcartdata,
  selectedKotId,
  setSelectedKotId,
  selectedTable,
  selectedItems,
  setSelectedItems
}) => {
  if (!isOpen) return null;
  console.log(oldcartdata, "oldcartdata");
  const [activeKot, setActiveKot] = React.useState<any>(null);
  const getStatusStyles = (status: string, kotStatus: string) => {
    if (status === "Available") {
      return "bg-[#E6F3FA] text-[#0576B2] border-[#0576B2]";
    }
    if (status === "Unsettled") {
      return "bg-yellow-100 text-yellow-700 border-yellow-400";
    }
    if (status === "Occupied" && kotStatus === "KOT") {
      return "bg-red-100 text-red-600 border-red-400";
    }
    if (status === "Occupied" && kotStatus === "NCKOT") {
      return "bg-purple-100 text-purple-700 border-purple-400";
    }
    return "bg-gray-100 text-gray-600 border-gray-300";
  };

const toggleKot = (kotId: number) => {
  // ✅ ItemWise → allow only single selection
  if (selectedTransferType === "ItemWise") {
    if (selectedKotId.includes(kotId)) {
      // unselect if clicked again
      setSelectedKotId([]);
      setActiveKot(null); // optional reset items
    } else {
      setSelectedKotId([kotId]); // ✅ only one allowed
    }
    return;
  }

  // ✅ Existing multi-select logic (unchanged)
  if (selectedKotId.includes(kotId)) {
    setSelectedKotId(selectedKotId.filter((id) => id !== kotId));
  } else {
    setSelectedKotId([...selectedKotId, kotId]);
  }
};
  // ✅ SUB TABLE (NO RESTRICTION)
  const selectSubTable = (table: string) => {
    if (selectedSubTableTable === table) {
      setselectedSubTableTable(null);
    } else {
      setselectedSubTableTable(table);
    }
  };
  console.log("tardsfsdf", transferTypes);

  // ✅ MAIN TABLE
  const selectMainTable = (table: string) => {
    setTransformSelectedTable(table);
  };

  // ✅ TRANSFER TYPE FORMAT
  const handleTransferTypeChange = (value: string) => {
    const formatted = value.replace(/\s+/g, "");
    setSelectedTransferType(formatted);
  };
  console.log("selectedTableeeeeeeeeeeeeee", tableData);

  // ✅ ONLY AVAILABLE TABLES
  const filteredTables = tableData?.filter(
    (t: any) => t.tableNumber !== selectedTable.tableNumber && t.status !== "Unsettled" ,
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#0576B2] text-white px-4 py-3 flex justify-between items-center">
          <h2 className="font-semibold text-lg">Table Transfer</h2>
          <button onClick={onClose} className="text-xl font-bold">
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-4">
          {/* TRANSFER TYPE */}
          <div>
            <p className="mb-2 text-gray-600 font-semibold">Transfer Type:</p>
            <select
              className="w-full border rounded px-3 py-2"
              onChange={(e) => handleTransferTypeChange(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Select Transfer Type
              </option>
              {transferTypes?.map((item) => (
                <option key={item.transferId} value={item.transferType}>
                  {item.transferType}
                </option>
              ))}
            </select>
          </div>

          {/* SUB TABLE (FREE SELECTION) */}
          <div>
            <p className="mb-2 text-gray-600 font-semibold">
              Select Sub Table:
            </p>
            {subTables.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {subTables
                  .filter((item) => item.tableStatus !== "Available") // ✅ HIDE AVAILABLE
                  .map((item) => {
                    const sub = item.subTable;

                    return (
                      <button
                        key={sub}
                        onClick={() => selectSubTable(sub)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition
              ${
                selectedSubTableTable === sub
                  ? "bg-[#0576B2] text-white border-[#0576B2]"
                  : "bg-blue-100 text-blue-800 border-transparent"
              }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500">No tables available</p>
            )}
          </div>
          {selectedTransferType !== "TableTransfer" &&
            selectedTransferType !== "" && (
              <div>
                <p className="mb-2 text-gray-600 font-semibold">KOT:</p>

                {oldcartdata?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {oldcartdata.map((kot: any) => {
                      const isSelected = selectedKotId.includes(kot.kotId);

                      return (
                        <button
                          key={kot.kotId}
                          onClick={() => {
  toggleKot(kot.kotId); // ✅ existing logic
  setActiveKot(kot);    // ✅ NEW (for items)
}}
                          className={`px-3 py-1 rounded-full text-sm font-medium border transition
                  ${
                    isSelected
                      ? "bg-[#0576B2] text-white border-[#0576B2]"
                      : "bg-yellow-100 text-yellow-800 border-transparent"
                  }`}
                        >
                          {kot.kotId}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">No KOT available</p>
                )}
              </div>
            )}
{/* ---------------- ITEMS SECTION (NEW) ---------------- */}
{activeKot?.food?.length > 0  &&  selectedTransferType === "ItemWise" &&(
  <div>
    <p className="mb-2 text-gray-600 font-semibold">Items:</p>

    <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
      {activeKot.food.map((item: any, index: number) => {
      const isSelected = selectedItems.includes(item.itemCode);

        return (
          <div
            key={index}
           onClick={() => {
  setSelectedItems((prev: number[]) => {
    const exists = prev.includes(item.itemCode);

    if (exists) {
      // ❌ remove
      return prev.filter((id) => id !== item.itemCode);
    }

    // ✅ add
    return [...prev, item.itemCode];
  });
}}
            className={`px-3 py-1 rounded text-sm font-medium border cursor-pointer
              ${
                isSelected
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-gray-100 text-gray-700"
              }`}
          >
            {item.food}
          </div>
        );
      })}
    </div>
  </div>
)}
          {/* MAIN TABLE (ONLY AVAILABLE) */}
          <div>
            <p className="mb-2 text-gray-600 font-semibold">Transform To:</p>

            {filteredTables?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filteredTables.map((table: any) => {
                  const isSelected =
                    TransformSelectedTable === table.tableNumber;

                  const statusStyles = getStatusStyles(
                    table.status,
                    table.kotStatus,
                  );

                  return (
                    <button
                      key={table.tableNumber}
                      onClick={() => selectMainTable(table.tableNumber)}
                      className={`px-3 py-1 rounded text-sm font-medium border transition
        ${
          isSelected ? "bg-[#0576B2] text-white border-[#0576B2]" : statusStyles
        }
      `}
                    >
                      {table.tableNumber}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No tables available</p>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t p-3 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Close
          </button>
          <button
            disabled={
              !selectedTransferType ||
              !TransformSelectedTable ||
              !selectedSubTableTable
            }
            onClick={handleSubmit}
            className={`px-4 py-2 rounded text-white
              ${
                !selectedTransferType ||
                !TransformSelectedTable ||
                !selectedSubTableTable
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0576B2]"
              }`}
          >
            Transform
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableTransferPopup;
