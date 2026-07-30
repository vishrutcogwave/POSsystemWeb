import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  getCombinedOutletAndTableMasterList,
  getOldCart,
} from "../api/services/products.service";
import Loader from "../components/Loader";

type Table = {
  tblCode: number | null;
  tblNo: string | null;
  tblSeatCount: number | null;
  tableStatus: string | null;
  kotStatus: string | null;
  c?: number;
};

type Outlet = {
  oltCode: string;
  oltName: string;
  tables: Table[];
};

type FoodItem = {
  food: string;
  qty: number;
  price: number;
  comment: string;
};

type CartItem = {
  waiter: number;
  waiterName: string;
  pax: number;
  kotId: number;
  ncRemarks: string;
  food: FoodItem[];
};

function TableMatrix() {
  const { appData } = useAppContext();

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState("All");

  // Popup states
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState<CartItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
  try {
    setLoading(true);

    const res = await getCombinedOutletAndTableMasterList(
      appData.user.branch_code,
      appData.user.userCode
    );

    setOutlets(res || []);
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

  // Table click
 const handleTableClick = async (
  tableNo: string | null,
  outletCode: string
) => {
  try {
    setLoading(true);

    const res = await getOldCart(
      tableNo,
      outletCode,
      "A",
      appData.user.branch_code
    );

    setCartData(res || []);
    setOpen(true);
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
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
  <>
  {loading && <Loader />}
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
                    onClick={() =>
                      handleTableClick(table.tblNo, outlet.oltCode)
                    }
                    className={`relative ${getColor(
                      table.tableStatus,
                      table.kotStatus
                    )} border rounded-lg p-2 pt-6 h-20 flex flex-col items-center justify-center transition hover:shadow-md active:scale-95 cursor-pointer`}
                  >
                    {table.tableStatus === "Unsettled" && (
                      <div className="absolute top-1 left-1 right-1 flex justify-center">
                        <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[9px] font-medium">
                          🧾 Bill {table.c}
                        </div>
                      </div>
                    )}

                    <div className="font-bold text-base text-center truncate w-full">
                      {table.tblNo}
                    </div>

                    <div className="text-[10px] font-semibold uppercase tracking-wide text-center truncate w-full">
                      {table.tableStatus}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Popup */}
    {open && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-[750px] max-h-[85vh] overflow-hidden">

          <div className="flex justify-between items-center border-b px-5 py-3">
            <h2 className="text-lg font-semibold">
              Table Order Details
            </h2>

            <button
              onClick={() => setOpen(false)}
              className="text-red-500 text-2xl"
            >
              ×
            </button>
          </div>

            <div className="p-5 overflow-y-auto max-h-[75vh]">

              {cartData.length === 0 && (
                <div className="text-center text-gray-500">
                  No Items Found
                </div>
              )}

 {cartData.map((kot: any) => {
  const totalAmount = kot.food.reduce(
    (sum: number, item: any) => sum + item.qty * item.price,
    0
  );

  const totalQty = kot.food.reduce(
    (sum: number, item: any) => sum + item.qty,
    0
  );

  return (
    <div
      key={kot.kotId}
      className="rounded-xl border shadow-sm overflow-hidden bg-white"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">
              🍽 Table {kot.food?.[0]?.kotTblNo}
            </h2>
            <p className="text-xs text-blue-100">
              Order Details
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs">KOT</div>
            <div className="text-2xl font-bold">
              #{kot.kotId}
            </div>
          </div>
        </div>
      </div>

      {/* Waiter & Pax */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border-b">
        <div className="bg-white rounded-lg border shadow-sm p-3">
          <div className="text-xs text-gray-500">
            Waiter
          </div>

          <div className="font-semibold mt-1">
            {kot.waiterName}
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-3">
          <div className="text-xs text-gray-500">
            PAX
          </div>

          <div className="font-semibold mt-1">
            {kot.pax}
          </div>
        </div>
      </div>

      {/* Items */}
      <table className="w-full text-sm">
        <thead className="bg-blue-600 text-white sticky top-0">
          <tr>
            <th className="w-12 py-2">#</th>
            <th className="text-left">Item</th>
            <th className="w-20 text-center">Qty</th>
            <th className="w-24 text-right pr-3">Rate</th>
            <th className="w-24 text-right pr-3">Amount</th>
          </tr>
        </thead>

        <tbody>
          {kot.food.map((item: any, index: number) => (
            <tr
              key={index}
              className={`border-b hover:bg-blue-50 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="text-center py-2">
                {index + 1}
              </td>

              <td className="py-2">
                <div className="font-medium">
                  {item.food}
                </div>
              </td>

              <td className="text-center">
                {item.qty}
              </td>

              <td className="text-right pr-3">
                ₹{item.price}
              </td>

              <td className="text-right pr-3 font-semibold">
                ₹{item.qty * item.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="bg-slate-100 border-t px-5 py-4 flex justify-between items-center">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-gray-500">Items :</span>{" "}
            <span className="font-semibold">
              {kot.food.length}
            </span>
          </div>

          <div>
            <span className="text-gray-500">Qty :</span>{" "}
            <span className="font-semibold">
              {totalQty}
            </span>
          </div>
        </div>

        <div className="text-xl font-bold text-blue-700">
          ₹{totalAmount.toFixed(2)}
        </div>
      </div>
    </div>
  );
})}
            </div>
          
        </div>
      </div>
    )}
  </>
);
}

export default TableMatrix;