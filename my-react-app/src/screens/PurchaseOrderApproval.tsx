import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Loader from "../components/Loader";
import {
  getPurchaseOrderList,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

type PurchaseOrderMaster = {
  poNo: number;
  poDate: string;
  supCode: number;
  billed: string;
  branch_Code: string;
  orderBy: string;
  effectiveFrom: string;
  effectiveTo: string;
  instruction: string;
  remarks: string;
  totalAmount: number;
  taxAmount: number;
  missChargeAmount: number;
  grossAmount: number;
  storeId: number;
  status: string;
  poValidDate: string;
  deliverydate: string;
};

type PurchaseOrderDetail = {
  poNo: number;
  itemCode: number;
  poItemQty: number;
  approvedQty: number;
  poItemRate: number;
  branch_Code: string;
  unit: string;
  unitCode: number;
  poItemSuplyQty: number;
  cpoItemQty: number;
  approvedBy: string;
  approvedDate: string;
  taxCode: number;
  taxName: string;
};

type PurchaseOrder = {
  master: PurchaseOrderMaster;
  details: PurchaseOrderDetail[];
  taxes: any[];
  miscellaneous: any[];
};

const PurchaseOrderApproval: React.FC = () => {
  const { appData } = useAppContext();
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState<
    PurchaseOrder[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  /*
   * =========================
   * FETCH PURCHASE ORDERS
   * =========================
   */

  const fetchPurchaseOrders = async () => {
    const branchCode =
      appData?.user?.branch_code || "";

    if (!branchCode) {
      setPurchaseOrders([]);
      return;
    }

    setLoading(true);

    try {
      const response =
        await getPurchaseOrderList(branchCode);

      console.log(
        "Purchase Order List Response:",
        response
      );

      if (response?.success) {
        setPurchaseOrders(
          response?.data || []
        );
      } else {
        setPurchaseOrders([]);

        toast.error(
          response?.message ||
            "Failed to load purchase orders"
        );
      }
    } catch (error: any) {
      console.error(
        "Error fetching purchase orders:",
        error
      );

      setPurchaseOrders([]);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load purchase orders"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================
   * INITIAL LOAD
   * =========================
   */

  useEffect(() => {
    if (appData?.user?.branch_code) {
      fetchPurchaseOrders();
    }
  }, [appData?.user?.branch_code]);

  /*
   * =========================
   * STATUS
   * =========================
   */

  const getStatusLabel = (
    status?: string
  ) => {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "O":
        return "Pending";

      case "A":
        return "Approved";

      case "R":
        return "Rejected";

      default:
        return "Unknown";
    }
  };

  const getStatusClass = (
    status?: string
  ) => {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "O":
        return "bg-yellow-100 text-yellow-700";

      case "A":
        return "bg-green-100 text-green-700";

      case "R":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /*
   * =========================
   * DATE FORMAT
   * =========================
   */

  const formatDate = (
    date?: string
  ) => {
    if (!date) return "-";

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  /*
   * =========================
   * FILTER
   * =========================
   */

  const filteredPurchaseOrders =
    useMemo(() => {
      const searchText =
        search.trim().toLowerCase();

      return purchaseOrders.filter(
        (po) => {
          const master =
            po.master;

          const matchesSearch =
            !searchText ||
            String(
              master.poNo
            )
              .toLowerCase()
              .includes(searchText) ||
            String(
              master.supCode
            )
              .toLowerCase()
              .includes(searchText) ||
            String(
              master.orderBy
            )
              .toLowerCase()
              .includes(searchText);

          const matchesStatus =
            statusFilter === "ALL" ||
            String(
              master.status
            ).toUpperCase() ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      purchaseOrders,
      search,
      statusFilter,
    ]);

  /*
   * =========================
   * EDIT
   * =========================
   */

const handleEdit = (
  purchaseOrder: PurchaseOrder
) => {
  console.log(
    "Edit Purchase Order:",
    purchaseOrder
  );

  navigate("/purchase/purchaseorder", {
    state: {
      editPurchaseOrder: purchaseOrder,
    },
  });
};

  /*
   * =========================
   * COMMON CLASSES
   * =========================
   */

  const inputClass =
    "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  /*
   * =========================
   * UI
   * =========================
   */

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:px-6">

      {loading && <Loader />}

      <Header />

      <div className="mx-auto w-full max-w-[1600px]">

        {/* =========================
            PAGE TITLE
        ========================= */}

        <div className="mb-5 mt-2">

          <h1 className="text-2xl font-bold leading-tight text-gray-800">
            Purchase Order Approval
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review and manage purchase orders
          </p>

        </div>

        {/* =========================
            MAIN CARD
        ========================= */}

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">

          {/* =========================
              HEADER
          ========================= */}

          <section className="overflow-hidden rounded-xl border border-gray-200">

            <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-base font-semibold text-gray-800">
                  Purchase Orders
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  View, review and edit purchase orders
                </p>

              </div>

              <button
                type="button"
                onClick={fetchPurchaseOrders}
                className="h-9 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Refresh
              </button>

            </div>

            {/* =========================
                FILTERS
            ========================= */}

            <div className="grid grid-cols-1 gap-4 border-b border-gray-200 p-4 sm:grid-cols-2">

              {/* SEARCH */}

              <div>

                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Search
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search PO No, Supplier Code, Ordered By..."
                  className={inputClass}
                />

              </div>

              {/* STATUS */}

              <div>

                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className={inputClass}
                >

                  <option value="ALL">
                    All Status
                  </option>

                  <option value="O">
                    Pending
                  </option>

                  <option value="A">
                    Approved
                  </option>

                  <option value="R">
                    Rejected
                  </option>

                </select>

              </div>

            </div>

            {/* =========================
                SUMMARY
            ========================= */}

            <div className="grid grid-cols-2 gap-3 border-b border-gray-200 bg-white p-4 sm:grid-cols-4">

              <div className="rounded-lg bg-gray-50 p-3">

                <p className="text-xs text-gray-500">
                  Total
                </p>

                <p className="mt-1 text-lg font-bold text-gray-800">
                  {purchaseOrders.length}
                </p>

              </div>

              <div className="rounded-lg bg-yellow-50 p-3">

                <p className="text-xs text-yellow-700">
                  Pending
                </p>

                <p className="mt-1 text-lg font-bold text-yellow-800">
                  {
                    purchaseOrders.filter(
                      (po) =>
                        po.master.status ===
                        "O"
                    ).length
                  }
                </p>

              </div>

              <div className="rounded-lg bg-green-50 p-3">

                <p className="text-xs text-green-700">
                  Approved
                </p>

                <p className="mt-1 text-lg font-bold text-green-800">
                  {
                    purchaseOrders.filter(
                      (po) =>
                        po.master.status ===
                        "A"
                    ).length
                  }
                </p>

              </div>

              <div className="rounded-lg bg-red-50 p-3">

                <p className="text-xs text-red-700">
                  Rejected
                </p>

                <p className="mt-1 text-lg font-bold text-red-800">
                  {
                    purchaseOrders.filter(
                      (po) =>
                        po.master.status ===
                        "R"
                    ).length
                  }
                </p>

              </div>

            </div>

            {/* =========================
                TABLE
            ========================= */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px] text-sm">

                <thead>

                  <tr className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-600">

                    <th className="px-4 py-3 text-left">
                      PO No.
                    </th>

                    <th className="px-4 py-3 text-left">
                      Date
                    </th>

                    <th className="px-4 py-3 text-left">
                      Supplier
                    </th>

                    <th className="px-4 py-3 text-left">
                      Store
                    </th>

                    <th className="px-4 py-3 text-left">
                      Ordered By
                    </th>

                    <th className="px-4 py-3 text-right">
                      Total
                    </th>

                    <th className="px-4 py-3 text-center">
                      Items
                    </th>

                    <th className="px-4 py-3 text-center">
                      Status
                    </th>

                    <th className="px-4 py-3 text-center">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredPurchaseOrders.length ===
                  0 ? (

                    <tr>

                      <td
                        colSpan={9}
                        className="px-4 py-12 text-center text-sm text-gray-400"
                      >
                        No purchase orders found
                      </td>

                    </tr>

                  ) : (

                    filteredPurchaseOrders.map(
                      (purchaseOrder) => {

                        const master =
                          purchaseOrder.master;

                        return (

                          <tr
                            key={
                              master.poNo
                            }
                            className="border-t border-gray-200 transition hover:bg-gray-50"
                          >

                            {/* PO NO */}

                            <td className="px-4 py-3 font-semibold text-gray-800">
                              {master.poNo}
                            </td>

                            {/* DATE */}

                            <td className="px-4 py-3 text-gray-600">
                              {formatDate(
                                master.poDate
                              )}
                            </td>

                            {/* SUPPLIER */}

                            <td className="px-4 py-3">
                              <span className="font-medium text-gray-800">
                                {master.supCode}
                              </span>
                            </td>

                            {/* STORE */}

                            <td className="px-4 py-3 text-gray-600">
                              {master.storeId}
                            </td>

                            {/* ORDERED BY */}

                            <td className="px-4 py-3 text-gray-600">
                              {master.orderBy ||
                                "-"}
                            </td>

                            {/* TOTAL */}

                            <td className="px-4 py-3 text-right font-semibold text-gray-800">
                              ₹{" "}
                              {Number(
                                master.grossAmount ||
                                  0
                              ).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </td>

                            {/* ITEMS */}

                            <td className="px-4 py-3 text-center text-gray-600">
                              {
                                purchaseOrder
                                  .details
                                  ?.length
                              }
                            </td>

                            {/* STATUS */}

                            <td className="px-4 py-3 text-center">

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                  master.status
                                )}`}
                              >
                                {getStatusLabel(
                                  master.status
                                )}
                              </span>

                            </td>

                            {/* ACTION */}

                            <td className="px-4 py-3 text-center">
<button
  type="button"
  disabled={
    String(master.status).toUpperCase() == "R"
  }
  onClick={() => handleEdit(purchaseOrder)}
  className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition ${
    String(master.status).toUpperCase() !== "R"
      ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
      : "cursor-not-allowed bg-gray-200 text-gray-400"
  }`}
>
  Edit
</button>

                            </td>

                          </tr>

                        );
                      }
                    )

                  )}

                </tbody>

              </table>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
};

export default PurchaseOrderApproval;