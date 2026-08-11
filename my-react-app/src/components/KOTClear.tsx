import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import {
  getUnsettledKOTDetails,
  updateUnsettledKOT,
} from "../api/services/products.service";
import Header from "./Header";

type KOT = {
  kotId: number;
  kotNo: number;
  oltCode: number;
  kotTblNo: string;
  stwCode: number;
  kotDate: string;
  kotTime: string;
  kotChargeable: boolean;
  kotTotal: number;
  checkinNo: string;
  kotGuestName: string;
  kotCancelled: boolean;
  kotSettled: boolean;
  subTable: string;
  guestCode: string;
  branch_code: string;
};

export default function KOTClear() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<KOT[]>([]);

  const [selectedKOTs, setSelectedKOTs] = useState<number[]>([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ============================
  // FETCH KOT DETAILS
  // ============================

  const fetchUnsettledKOTs = async (
    from: string,
    to: string
  ) => {
    if (!from || !to) {
      return;
    }

    try {
      setLoading(true);

      const res = await getUnsettledKOTDetails(
        from.replaceAll("-", "/"),
        to.replaceAll("-", "/"),
        appData?.user?.branch_code,
      );

      if (res?.success) {
        setData(res.data || []);

        // Clear previous selections
        setSelectedKOTs([]);

        if (!res.data?.length) {
          toast("No unsettled KOT found");
        }
      } else {
        setData([]);
        setSelectedKOTs([]);

        toast.error(
          res?.message || "Failed to fetch unsettled KOT details"
        );
      }
    } catch (error) {
      console.error(error);

      setData([]);
      setSelectedKOTs([]);

      toast.error("Error fetching unsettled KOT details");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // DELETE / CLEAR KOTS
  // ============================

  const handleDeleteKOTs = async () => {
    if (selectedKOTs.length === 0) {
      toast.error("Please select at least one KOT");
      return;
    }

    try {
      setLoading(true);

      const payload = data
        .filter((item) => selectedKOTs.includes(item.kotId))
        .map((item) => ({
          kotId: String(item.kotId),
          oltCode: String(item.oltCode),
          kotDate: item.kotDate,
          branchcode: appData?.user?.branch_code || "",
        }));

      console.log("UpdateUnsettledKOT Payload:", payload);

      const res = await updateUnsettledKOT(payload);

      if (res?.success) {
        toast.success("KOT cleared successfully");

        // Remove cleared KOTs from table
        setData((prev) =>
          prev.filter(
            (item) => !selectedKOTs.includes(item.kotId)
          )
        );

        // Clear selection
        setSelectedKOTs([]);
      } else {
        toast.error(
          res?.message || "Failed to clear KOT"
        );
      }
    } catch (error: any) {
      console.error("Error clearing KOT:", error);

      toast.error(
        error?.response?.data?.message ||
          "Error clearing KOT"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // SELECT SINGLE KOT
  // ============================

  const handleSelectKOT = (kotId: number) => {
    setSelectedKOTs((prev) => {
      if (prev.includes(kotId)) {
        return prev.filter((id) => id !== kotId);
      }

      return [...prev, kotId];
    });
  };

  // ============================
  // SELECT ALL
  // ============================

  const handleSelectAll = () => {
    if (selectedKOTs.length === data.length) {
      setSelectedKOTs([]);
    } else {
      setSelectedKOTs(
        data.map((item) => item.kotId)
      );
    }
  };

  // ============================
  // CLEAR SELECTION
  // ============================

  const clearSelection = () => {
    setSelectedKOTs([]);
  };

  // ============================
  // DEFAULT DATE + AUTO FETCH
  // ============================

  useEffect(() => {
    const today = new Date();

    const formattedToday = today
      .toISOString()
      .split("T")[0];

    setFromDate(formattedToday);
    setToDate(formattedToday);

    // Automatically fetch today's KOTs
    fetchUnsettledKOTs(
      formattedToday,
      formattedToday
    );
  }, []);

  // ============================
  // FORMAT DATE
  // ============================

  const formatDate = (value: string) => {
    if (!value) return "--";

    return value.split("T")[0];
  };

  // ============================
  // FORMAT TIME
  // ============================

  const formatTime = (value: string) => {
    if (!value) return "--";

    if (value.includes("T")) {
      return value
        .split("T")[1]
        ?.substring(0, 5);
    }

    return value;
  };

  // ============================
  // CHECK ALL
  // ============================

  const isAllSelected =
    data.length > 0 &&
    selectedKOTs.length === data.length;

  return (
    <div className="p-4 md:p-6">
      <Header />

      <div className="bg-white rounded-xl shadow p-4 md:p-6">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              KOT Clear
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Select unsettled KOTs
            </p>
          </div>

          {/* SELECTED COUNT */}

          <div className="text-sm font-medium text-gray-600">
            Selected:

            <span className="ml-1 text-blue-600 font-bold">
              {selectedKOTs.length}
            </span>
          </div>

        </div>

        {/* ================= FILTER ================= */}

        <div className="flex flex-col md:flex-row gap-3 mb-5">

          {/* FROM DATE */}

          <div className="flex flex-col">

            <label className="text-sm font-medium text-gray-600 mb-1">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                const newFromDate =
                  e.target.value;

                setFromDate(newFromDate);

                if (newFromDate && toDate) {
                  fetchUnsettledKOTs(
                    newFromDate,
                    toDate
                  );
                }
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* TO DATE */}

          <div className="flex flex-col">

            <label className="text-sm font-medium text-gray-600 mb-1">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                const newToDate =
                  e.target.value;

                setToDate(newToDate);

                if (fromDate && newToDate) {
                  fetchUnsettledKOTs(
                    fromDate,
                    newToDate
                  );
                }
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* CLEAR SELECTION */}

          {selectedKOTs.length > 0 && (
            <div className="flex items-end">

              <button
                onClick={clearSelection}
                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                Clear Selection
              </button>

            </div>
          )}

        </div>

        {/* ================= LOADING ================= */}

        {loading && (
          <div className="text-center py-3 text-sm text-blue-600">
            Loading KOTs...
          </div>
        )}

        {/* ================= TABLE ================= */}

        <div className="overflow-x-auto border border-gray-200 rounded-lg">

          <table className="w-full text-sm">

            {/* TABLE HEADER */}

            <thead className="bg-gray-100">

              <tr>

                <th className="px-4 py-3 text-center w-12">

                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    disabled={
                      data.length === 0 ||
                      loading
                    }
                    className="w-4 h-4 cursor-pointer"
                  />

                </th>

                <th className="px-4 py-3 text-left">
                  KOT No
                </th>

                <th className="px-4 py-3 text-left">
                  Table
                </th>

                <th className="px-4 py-3 text-left">
                  Sub Table
                </th>

                <th className="px-4 py-3 text-left">
                  Guest Name
                </th>

                <th className="px-4 py-3 text-left">
                  KOT Date
                </th>

                <th className="px-4 py-3 text-left">
                  KOT Time
                </th>

                <th className="px-4 py-3 text-right">
                  Total
                </th>

                <th className="px-4 py-3 text-center">
                  Chargeable
                </th>

                <th className="px-4 py-3 text-center">
                  Settled
                </th>

              </tr>

            </thead>

            {/* TABLE BODY */}

            <tbody>

              {data.length === 0 ? (

                <tr>

                  <td
                    colSpan={10}
                    className="text-center py-10 text-gray-500"
                  >
                    No unsettled KOT found
                  </td>

                </tr>

              ) : (

                data.map((item) => {

                  const isSelected =
                    selectedKOTs.includes(
                      item.kotId
                    );

                  return (

                    <tr
                      key={item.kotId}
                      className={`border-t transition ${
                        isSelected
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >

                      {/* CHECKBOX */}

                      <td className="px-4 py-3 text-center">

                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            handleSelectKOT(
                              item.kotId
                            )
                          }
                          className="w-4 h-4 cursor-pointer"
                        />

                      </td>

                      {/* KOT NO */}

                      <td className="px-4 py-3 font-medium">
                        {item.kotNo}
                      </td>

                      {/* TABLE */}

                      <td className="px-4 py-3">
                        {item.kotTblNo || "--"}
                      </td>

                      {/* SUB TABLE */}

                      <td className="px-4 py-3">
                        {item.subTable || "--"}
                      </td>

                      {/* GUEST */}

                      <td className="px-4 py-3">
                        {item.kotGuestName || "--"}
                      </td>

                      {/* DATE */}

                      <td className="px-4 py-3">
                        {formatDate(item.kotDate)}
                      </td>

                      {/* TIME */}

                      <td className="px-4 py-3">
                        {formatTime(item.kotTime)}
                      </td>

                      {/* TOTAL */}

                      <td className="px-4 py-3 text-right font-medium">
                        ₹{" "}
                        {Number(
                          item.kotTotal || 0
                        ).toFixed(2)}
                      </td>

                      {/* CHARGEABLE */}

                      <td className="px-4 py-3 text-center">

                        {item.kotChargeable ? (
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                            No
                          </span>
                        )}

                      </td>

                      {/* SETTLED */}

                      <td className="px-4 py-3 text-center">

                        {item.kotSettled ? (
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                            No
                          </span>
                        )}

                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>

          </table>

        </div>

        {/* ================= SELECTED INFORMATION ================= */}

        {selectedKOTs.length > 0 && (

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

              <div>

                <p className="text-sm text-blue-800 font-medium">
                  {selectedKOTs.length} KOT
                  {selectedKOTs.length > 1
                    ? "s"
                    : ""}{" "}
                  selected
                </p>

                <p className="text-xs text-blue-600 mt-1">
                  KOT IDs:{" "}
                  {selectedKOTs.join(", ")}
                </p>

              </div>

              {/* DELETE */}

              <button
                onClick={handleDeleteKOTs}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                {loading
                  ? "Clearing..."
                  : "Delete"}
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}