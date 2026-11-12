
import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import Loader from "../components/Loader";

import {
  Search,
  FileBarChart,
  Printer,
  FileSpreadsheet,
} from "lucide-react";

import {
  getStockReport,
  getInventoryItemCategoryList,
  getStoreMasterList,
  getInventoryItemStoreList,
} from "../api/services/products.service";

import { formatHeader } from "../utils";

type ReportType = "ALL" | "ParticularItemStock";
type ReportRow = Record<string, any>;

const getText = (value: any) => String(value ?? "").trim();

const getRows = (response: any): ReportRow[] => {
  const candidates = [
    response?.details,
    response?.data?.details,
    response?.data?.data?.details,
    response?.data,
    response,
  ];

  return candidates.find(Array.isArray) || [];
};


type InventoryItem = {
  itemCode: number;
  itemName: string;
  catCode: number;
  storeid: string;
  unitName: string;
  itemRate: number;
};
export default function StockReport() {
  const today = new Date();

  const formattedToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const [reportType, setReportType] = useState<ReportType>("ALL");

  const [fromDate, setFromDate] = useState(formattedToday);
  const [toDate, setToDate] = useState(formattedToday);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [itemCode, setItemCode] = useState("");

  const [categories, setCategories] = useState<
    { catCode: number; catName: string }[]
  >([]);
  const [stores, setStores] = useState<
    { storeId: number; storeName: string }[]
  >([]);

  const [data, setData] = useState<ReportRow[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const [items, setItems] = useState<InventoryItem[]>([]);
  // Load Category and Store dropdowns
 useEffect(() => {
  const fetchDropdowns = async () => {
    try {
      const branchCode = localStorage.getItem("branch") || "";

      const [
        categoryResponse,
        storeResponse,
        itemResponse,
      ] = await Promise.all([
        getInventoryItemCategoryList(branchCode),
        getStoreMasterList(branchCode),
        getInventoryItemStoreList(branchCode),
      ]);

      setCategories(categoryResponse?.data ?? []);
      setStores(storeResponse?.data ?? []);
      setItems(itemResponse?.data ?? []);

    } catch (err) {
      console.error("Failed to load stock report dropdowns:", err);
    }
  };

  fetchDropdowns();
}, []);



const filteredItems = useMemo(() => {
  return items.filter((item) => {
    const categoryMatch =
      !selectedCategory ||
      String(item.catCode) === selectedCategory;

    const storeMatch =
      !selectedStore ||
      String(item.storeid || "")
        .split(",")
        .map((id) => id.trim())
        .includes(selectedStore);

    return categoryMatch && storeMatch;
  });
}, [items, selectedCategory, selectedStore]);
  // Fetch Stock Report
  const handleGetReport = async () => {
    if (!fromDate || !toDate) {
      setError("Please select From Date and To Date.");
      return;
    }

    if (fromDate > toDate) {
      setError("From Date cannot be greater than To Date.");
      return;
    }

    if (reportType === "ParticularItemStock") {
      if (!selectedCategory) {
        setError("Please select Category.");
        return;
      }

      if (!selectedStore) {
        setError("Please select Store.");
        return;
      }

    if (!itemCode || Number(itemCode) <= 0) {
  setError("Please select a valid Item.");
  return;
}
    }

    try {
      setLoading(true);
      setError("");
      setData([]);

      const branchCode = localStorage.getItem("branch") || "";

      const payload = {
        itemCode:
          reportType === "ParticularItemStock" ? Number(itemCode) : 0,

        selectedType: reportType,

        catCode:
          reportType === "ParticularItemStock" ? Number(selectedCategory) : 0,
        depCode:
          reportType === "ParticularItemStock" ? Number(selectedStore) : 0,

        fromDate: `${fromDate}T00:00:00`,
        toDate: `${toDate}T23:59:59`,

        branchCode,
      };

      console.log("Stock Report Payload:", payload);

      const response = await getStockReport(payload);

      console.log("Stock Report Response:", response);

      const rows = getRows(response);

      setData(rows);

      if (rows.length === 0) {
        setError("No stock report data available.");
      }
    } catch (err: any) {
      console.error(
        "Failed to fetch Stock Report:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Failed to load Stock Report."
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Remember the previous date range so date selection triggers the API immediately.
  const previousDates = useRef({ fromDate, toDate });

  // Automatically fetch whenever a relevant filter changes.
  // ALL uses only dates. Particular Item Stock requires category, store and item code too.
  useEffect(() => {
    const dateChanged =
      previousDates.current.fromDate !== fromDate ||
      previousDates.current.toDate !== toDate;

    previousDates.current = { fromDate, toDate };

    // Do not call the API until both dates are valid.
    if (!fromDate || !toDate || fromDate > toDate) {
      setData([]);
      setError("");
      return;
    }

    // Particular Item Stock requires all its filters before fetching.
    if (
      reportType === "ParticularItemStock" &&
      (!selectedCategory ||
        !selectedStore ||
        !itemCode ||
        Number(itemCode) <= 0)
    ) {
      setData([]);
      setError("");
      return;
    }

    // Date changes call immediately. Item-code typing is debounced to avoid
    // sending a request for every keystroke.
    const delay = dateChanged
      ? 0
      : reportType === "ParticularItemStock" && itemCode
        ? 500
        : 0;

    const timer = window.setTimeout(() => {
      void handleGetReport();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    reportType,
    fromDate,
    toDate,
    selectedCategory,
    selectedStore,
    itemCode,
  ]);

  // Search
  const displayedRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data;

    return data.filter((row) =>
      Object.values(row).some((value) =>
        getText(value).toLowerCase().includes(query)
      )
    );
  }, [data, search]);

  // Dynamic columns
  const columns = useMemo(() => {
    return displayedRows.length
      ? Object.keys(displayedRows[0]).filter(
          (column) =>
            !["itemCode", "catCode", "depCode"].includes(column)
        )
      : [];
  }, [displayedRows]);

  // Print
  const handlePrint = () => {
    if (!displayedRows.length) return;

    const escapeHtml = (value: any) =>
      getText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const tableRows = displayedRows
      .map(
        (row) => `
          <tr>
            ${columns
              .map(
                (column) =>
                  `<td>${escapeHtml(row[column] ?? "-")}</td>`
              )
              .join("")}
          </tr>
        `
      )
      .join("");

    const printWindow = window.open("", "_blank", "width=1200,height=800");

    if (!printWindow) {
      alert("Please allow pop-ups to print this report.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Stock Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            font-size: 11px;
          }

          h2 {
            text-align: center;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 7px;
            text-align: left;
          }

          th {
            background: #dedede;
          }

          @page {
            size: landscape;
            margin: 10mm;
          }
        </style>
      </head>
      <body>
        <h2>Stock Report - ${reportType}</h2>

        <p>
          Branch: ${escapeHtml(localStorage.getItem("branch") || "-")}
          <br/>
          From: ${fromDate} &nbsp;&nbsp; To: ${toDate}
        </p>

        <table>
          <thead>
            <tr>
              ${columns.map((column) => `<th>${escapeHtml(formatHeader(column, {}))}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <script>
          window.onload = function() {
            window.focus();
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Export Excel
  const handleExportExcel = () => {
    if (!displayedRows.length) return;

    const escapeHtml = (value: any) =>
      getText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const table = `
      <table border="1">
        <thead>
          <tr>
            ${columns
              .map(
                (column) =>
                  `<th>${escapeHtml(formatHeader(column, {}))}</th>`
              )
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${displayedRows
            .map(
              (row) => `
                <tr>
                  ${columns
                    .map(
                      (column) =>
                        `<td>${escapeHtml(row[column] ?? "-")}</td>`
                    )
                    .join("")}
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;

    const blob = new Blob(["\ufeff", table], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Stock_Report_${reportType}_${fromDate}.xls`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {loading && <Loader />}
      <Header showNeworderButton={false} />

      <div className="flex-1 overflow-auto p-3 sm:p-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">

          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
            <FileBarChart className="text-indigo-600" size={21} />

            <h1 className="text-lg font-bold text-gray-800">
              Stock Report
            </h1>
          </div>

          {/* Filters */}
          <div className="p-4 border-b">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => {
                    setReportType(e.target.value as ReportType);
                    setItemCode("");
                    setSelectedCategory("");
                    setSelectedStore("");
                    setData([]);
                    setError("");
                  }}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="ALL">ALL</option>
                  <option value="ParticularItemStock">
                    Particular Item Stock
                  </option>
                </select>
              </div>

              {reportType === "ParticularItemStock" && (
                <>
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.catCode} value={category.catCode}>
                          {category.catName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Store */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Store
                    </label>
                    <select
                      value={selectedStore}
                      onChange={(e) => setSelectedStore(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    >
                      <option value="">Select Store</option>
                      {stores.map((store) => (
                        <option key={store.storeId} value={store.storeId}>
                          {store.storeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Item Code */}
              {/* Item Code */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Item Code
  </label>

  <select
    value={itemCode}
    onChange={(e) => setItemCode(e.target.value)}
    className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
  >
    <option value="">Select Item</option>

    {filteredItems.map((item) => (
      <option key={item.itemCode} value={item.itemCode}>
        {item.itemCode} - {item.itemName}
      </option>
    ))}
  </select>
</div>
                </>
              )}

              {/* From Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  max={toDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">

            <h2 className="font-semibold text-gray-800">
              {reportType === "ALL"
                ? "All Stock Report"
                : "Particular Item Stock Report"}
            </h2>

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={handlePrint}
                disabled={loading || displayedRows.length === 0}
                className="inline-flex items-center gap-2 rounded bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-50"
              >
                <Printer size={16} />
                Print
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                disabled={loading || displayedRows.length === 0}
                className="inline-flex items-center gap-2 rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                <FileSpreadsheet size={16} />
                Excel
              </button>

              <div className="relative w-full sm:w-72">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stock report..."
                  className="w-full rounded border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mb-3 rounded bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="overflow-auto max-h-[calc(100vh-340px)]">
            <table className="min-w-full text-sm text-left">

              <thead className="sticky top-0 z-10 bg-indigo-700 text-white">
                <tr>
                  {columns.length ? (
                    columns.map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap px-4 py-3 font-semibold"
                      >
                        {formatHeader(column, {})}
                      </th>
                    ))
                  ) : (
                    <th className="px-4 py-3">
                      Report Details
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={Math.max(columns.length, 1)}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      Loading stock report...
                    </td>
                  </tr>
                ) : displayedRows.length ? (
                  displayedRows.map((row, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0
                          ? "border-b bg-white hover:bg-indigo-50"
                          : "border-b bg-slate-50 hover:bg-indigo-50"
                      }
                    >
                      {columns.map((column) => {
                        const value = row[column];

                        return (
                          <td
                            key={column}
                            className="whitespace-nowrap px-4 py-3 text-gray-700"
                          >
                            {value == null || value === ""
                              ? "-"
                              : String(value)}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={Math.max(columns.length, 1)}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No report data available.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center gap-3 px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              Total Records: {displayedRows.length}
            </span>

            <span className="text-xs text-gray-500">
              Stock Report
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
