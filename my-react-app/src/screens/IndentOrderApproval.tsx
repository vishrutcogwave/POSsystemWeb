import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Loader from "../components/Loader";

import {
  getIndentOrderList,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

/* ============================================================
   TYPES
============================================================ */

type IndentOrderMaster = {
  depName: string;
  storeName: string;
  ioNo: number;
  billed: string;
  ioDate: string;
  poValidDate: string;
  storeCode: string;
  orderBy: string;
  depCode: string;
  branchCode: string;

  cgstAmount: number;
  sgstAmount: number;
  missChargeAmount: number;
  totalAmount: number;
  taxAmount: number;
  grossAmount: number;

  storeId: string;
  status: string;
};

type IndentOrderDetail = {
  ioNo: number;
  itemCode: number;
  itemName: string;

  ioItemQty: number;
  ioItemRate: number;

  unit: string;
  unitCode: number;

  mainUnitConverstion: string;
  mainUnit: string;

  ioAvailableQty: number;
  ioOrginalQty: number;

  branch_Code: string;

  reamingQty: number;
  approvedQty: number;
};

type IndentOrder = {
  master: IndentOrderMaster;
  details: IndentOrderDetail[];
};

/* ============================================================
   COMPONENT
============================================================ */

const IndentOrderApproval: React.FC = () => {
  const { appData } = useAppContext();
  const navigate = useNavigate();

  const [indentOrders, setIndentOrders] =
    useState<IndentOrder[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  /* ============================================================
     FETCH INDENT ORDERS
  ============================================================ */

  const fetchIndentOrders = async () => {
    const branchCode =
      appData?.user?.branch_code || "";

    if (!branchCode) {
      setIndentOrders([]);
      return;
    }

    setLoading(true);

    try {
      const response =
        await getIndentOrderList(branchCode);

      console.log(
        "Indent Order List Response:",
        response,
      );

      if (response?.success) {
        setIndentOrders(
          response?.data || [],
        );
      } else {
        setIndentOrders([]);

        toast.error(
          response?.message ||
            "Failed to load indent orders",
        );
      }
    } catch (error: any) {
      console.error(
        "Error fetching indent orders:",
        error,
      );

      setIndentOrders([]);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load indent orders",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    if (appData?.user?.branch_code) {
      fetchIndentOrders();
    }
  }, [appData?.user?.branch_code]);

  /* ============================================================
     STATUS LABEL
  ============================================================ */

  const getStatusLabel = (
    status?: string,
  ) => {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "IO":
        return "Pending";

      case "IOA":
        return "Approved";

      case "IOR":
        return "Rejected";

      default:
        return "Unknown";
    }
  };

  /* ============================================================
     STATUS CLASS
  ============================================================ */

  const getStatusClass = (
    status?: string,
  ) => {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "IO":
        return "bg-yellow-100 text-yellow-700";

      case "IOA":
        return "bg-green-100 text-green-700";

      case "IOR":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /* ============================================================
     DATE FORMAT
  ============================================================ */

  const formatDate = (
    date?: string,
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
      },
    );
  };

  /* ============================================================
     FILTER
  ============================================================ */

  const filteredIndentOrders =
    useMemo(() => {
      const searchText =
        search.trim().toLowerCase();

      return indentOrders.filter(
        (indent) => {
          const master =
            indent.master;

          const details =
            indent.details || [];

          const matchesSearch =
            !searchText ||
            String(master.ioNo)
              .toLowerCase()
              .includes(searchText) ||
            String(master.orderBy)
              .toLowerCase()
              .includes(searchText) ||
            String(master.storeCode)
              .toLowerCase()
              .includes(searchText) ||
            String(master.depCode)
              .toLowerCase()
              .includes(searchText) ||
            details.some(
              (item) =>
                String(item.itemCode)
                  .toLowerCase()
                  .includes(searchText) ||
                String(
                  item.itemName || "",
                )
                  .toLowerCase()
                  .includes(searchText),
            );

          let matchesStatus = true;

          if (statusFilter === "PENDING") {
            matchesStatus =
              String(master.status).toUpperCase() ===
              "IO";
          }

          if (statusFilter === "APPROVED") {
            matchesStatus =
              String(master.status).toUpperCase() ===
              "IOA";
          }

          if (statusFilter === "REJECTED") {
            matchesStatus =
              String(master.status).toUpperCase() ===
              "IOR";
          }

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      indentOrders,
      search,
      statusFilter,
    ]);

  /* ============================================================
     EDIT
  ============================================================ */

  const handleEdit = (
    indentOrder: IndentOrder,
  ) => {
    console.log(
      "Edit Indent Order:",
      indentOrder,
    );

    navigate(
      "/purchase/indentorder",
      {
        state: {
          editIndentOrder:
            indentOrder,
        },
      },
    );
  };

  /* ============================================================
     COUNTS
  ============================================================ */

  const totalCount =
    indentOrders.length;

  const pendingCount =
    indentOrders.filter(
      (item) =>
        String(
          item.master.status,
        ).toUpperCase() === "IO",
    ).length;

  const approvedCount =
    indentOrders.filter(
      (item) =>
        String(
          item.master.status,
        ).toUpperCase() === "IOA",
    ).length;

  const rejectedCount =
    indentOrders.filter(
      (item) =>
        String(
          item.master.status,
        ).toUpperCase() === "IOR",
    ).length;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:px-6">
      {loading && <Loader />}

      <Header />

      <div className="mx-auto w-full max-w-[1600px]">

        {/* PAGE TITLE */}

        <div className="mb-5 mt-2">
          <h1 className="text-2xl font-bold leading-tight text-gray-800">
            Indent Order Approval
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review and approve indent orders
          </p>
        </div>

        {/* SUMMARY */}

        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">
              Total
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-800">
              {totalCount}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-yellow-600">
              Pending
            </p>

            <p className="mt-1 text-2xl font-bold text-yellow-700">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-green-600">
              Approved
            </p>

            <p className="mt-1 text-2xl font-bold text-green-700">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-red-600">
              Rejected
            </p>

            <p className="mt-1 text-2xl font-bold text-red-700">
              {rejectedCount}
            </p>
          </div>

        </div>

        {/* MAIN CARD */}

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">

          <section className="overflow-hidden rounded-xl border border-gray-200">

            {/* HEADER */}

            <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Indent Orders
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  View, review and approve indent orders
                </p>
              </div>

              <button
                type="button"
                onClick={fetchIndentOrders}
                className="h-9 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Refresh
              </button>

            </div>

            {/* FILTERS */}

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
                      e.target.value,
                    )
                  }
                  placeholder="Search IO No, Item, Ordered By..."
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                      e.target.value,
                    )
                  }
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="ALL">
                    All
                  </option>

                  <option value="PENDING">
                    Pending
                  </option>

                  <option value="APPROVED">
                    Approved
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>
                </select>
              </div>

            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">

              <table className="min-w-[1000px] w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-600">
                      IO No
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-600">
                      Date
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-600">
                      Store
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-600">
                      Department
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-600">
                      Ordered By
                    </th>

                   
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase text-gray-600">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-600">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredIndentOrders.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center text-sm text-gray-500"
                      >
                        No indent orders found
                      </td>
                    </tr>
                  ) : (
                    filteredIndentOrders.map(
                      (indentOrder) => {
                        const master =
                          indentOrder.master;

                        return (
                          <tr
                            key={
                              master.ioNo
                            }
                            className="hover:bg-gray-50"
                          >

                            <td className="px-4 py-3 text-sm font-bold text-gray-800">
                              #{master.ioNo}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatDate(
                                master.ioDate,
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-600">
                              {master.storeName ||
                                "-"}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-600">
                              {master.depName ||
                                "-"}
                            </td>

                            <td className="px-4 py-3 text-sm font-medium text-gray-700">
                              {master.orderBy ||
                                "-"}
                            </td>

                            <td className="px-4 py-3 text-center">

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                                  master.status,
                                )}`}
                              >
                                {getStatusLabel(
                                  master.status,
                                )}
                              </span>

                            </td>

<td className="px-4 py-3 text-right">
  <button
    type="button"
    disabled={
      String(master.status || "").toUpperCase() !== "IO"
    }
    onClick={() => handleEdit(indentOrder)}
    className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition ${
      String(master.status || "").toUpperCase() === "IO"
        ? "bg-blue-600 hover:bg-blue-700"
        : "cursor-not-allowed bg-gray-400 opacity-60"
    }`}
  >
    Edit
  </button>
</td>



                          </tr>
                        );
                      },
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

export default IndentOrderApproval;
