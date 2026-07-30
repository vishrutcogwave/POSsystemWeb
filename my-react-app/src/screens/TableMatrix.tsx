import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { getCombinedOutletAndTableMasterList } from "../api/services/products.service";

type Table = {
  tblCode: number | null;
  tblNo: string | null;
  tblSeatCount: number | null;
  tableStatus: string | null;
  kotStatus: string |null;
  c?: number;
};

type Outlet = {
  oltCode: string;
  oltName: string;
  tables: Table[];
};

function TableMatrix() {
  const { appData } = useAppContext();

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState("All");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getCombinedOutletAndTableMasterList(
        appData.user.branch_code,
        appData.user.userCode
      );

      setOutlets(res || []);
    } catch (err) {
      console.log(err);
    }
  };

  const getColor = (status: string | null, kotStatus: string | null) => {
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

  const filteredOutlets =
    selectedOutlet === "All"
      ? outlets
      : outlets.filter((o) => o.oltCode === selectedOutlet);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold">Table Matrix</h1>

        <select
          value={selectedOutlet}
          onChange={(e) => setSelectedOutlet(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Outlets</option>

          {outlets.map((outlet) => (
            <option key={outlet.oltCode} value={outlet.oltCode}>
              {outlet.oltName}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {filteredOutlets.map((outlet) => (
          <div
            key={outlet.oltCode}
            className="bg-white rounded-xl shadow border p-4"
          >
            <h2 className="font-semibold text-gray-700 mb-4">
              {outlet.oltName}
            </h2>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
              {outlet.tables
                .filter((table) => table.tblNo)
                .map((table) => (
                  <div
                    key={table.tblCode}
                    className={`relative ${getColor(
                      table.tableStatus,
                      table.kotStatus
                    )} border rounded-lg p-2 pt-6 h-20 flex flex-col items-center justify-center transition hover:shadow-md active:scale-95 cursor-pointer`}
                  >
                    {/* Bill Badge */}
                    {table.tableStatus === "Unsettled" && (
                      <div className="absolute top-1 left-1 right-1 flex justify-center">
                        <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[9px] font-medium">
                          🧾 Bill {table.c}
                        </div>
                      </div>
                    )}

                    {/* Table Number */}
                    <div className="font-bold text-base text-center truncate w-full">
                      {table.tblNo}
                    </div>

                    {/* Status */}
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-center truncate w-full">
                      {table.tableStatus}
                    </div>

                    {/* Transfer Icon */}
                   
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableMatrix;