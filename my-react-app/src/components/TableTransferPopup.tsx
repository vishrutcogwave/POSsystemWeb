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

  TransformSelectedTable: string | null;
  setTransformSelectedTable: (val: string | null) => void;

  selectedTransferType: string;
  setSelectedTransferType: (val: string) => void;
  handleSubmit: () => void;
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
}) => {
  if (!isOpen) return null;
  console.log(subTables, "subtablessssssssssss");

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

  // ✅ ONLY AVAILABLE TABLES
  const filteredTables = tableData?.filter(
    (t: any) => t.status === "Available",
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

          {/* MAIN TABLE (ONLY AVAILABLE) */}
          <div>
            <p className="mb-2 text-gray-600 font-semibold">Transform To:</p>

            {filteredTables?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filteredTables.map((table: any) => {
                  const isSelected =
                    TransformSelectedTable === table.tableNumber;

                  return (
                    <button
                      key={table.tableNumber}
                      onClick={() => selectMainTable(table.tableNumber)}
                      className={`px-3 py-1 rounded text-sm font-medium border transition
                        ${
                          isSelected
                            ? "bg-[#0576B2] text-white border-[#0576B2]"
                            : "bg-[#E6F3FA] text-[#0576B2] border-[#0576B2]"
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
