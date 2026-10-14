import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
import {
  getOpenStocksList,
  createOpenStocksMaster,
  deleteOpenStocksDetails,
  getStoreMasterList,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { Printer, Save, RefreshCw } from "lucide-react";

type OpeningStockItem = {
  id: number;
  openingStockId: number;
  itemCode: number;
  itemName: string;
  storeId: string;
  deptCode: string;
  branch_Code: string;
  stockDate: string;
  openingQty: number;
  unitCode: string;
  unitName: string;
  closingQty: number;
  openingRate: number;
  isActive: boolean;
  indentOrderQty: number;
  indentApprovalQty: number;
  issuedQty: number;
  issuedReturnQty: number;
  userCode: string;
};
type StoreMasterModel = {
  id: number;
  storeId: number;
  storeName: string;
  storeLocation: string;
  storeIncharge: string;
  branch_Code: string;
};

const toNumber = (value: unknown): number => {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

export default function OpeningStock() {
  const { appData } = useAppContext();
  const branchCode = String(appData?.user?.branch_code ?? "");
  const userCode = String(appData?.user?.userCode ?? "");
  const [stockDate, setStockDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [data, setData] = useState<OpeningStockItem[]>([]);
  const [originalData, setOriginalData] = useState<OpeningStockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [stores, setStores] = useState<StoreMasterModel[]>([]);
  const [selectedStore, setSelectedStore] = useState("");

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getStoreMasterList(appData?.user?.branch_code);

      if (res?.success) {
        const formattedData: StoreMasterModel[] = (res.data || []).map(
          (item: any) => ({
            id: item.storeId,
            storeId: item.storeId,
            storeName: item.storeName,
            storeLocation: item.storeLocation,
            storeIncharge: item.storeIncharge,
            branch_Code: item.branch_Code,
          }),
        );

        setStores(formattedData);

        // Select the first store initially
        setSelectedStore(
          formattedData.length > 0 ? String(formattedData[0].storeId) : "",
        );
      } else {
        setStores([]);
        setSelectedStore("");
        toast.error(res?.message || "Failed to load stores");
      }
    } catch (error) {
      console.error("Error loading stores:", error);
      toast.error("Error loading stores");
    } finally {
      setLoading(false);
    }
  }, [appData?.user?.branch_code]);

  const handleDelete = async () => {
    try {
      setLoading(true);
if (!selectedStore) {
  toast.error("Please select a store");
  return;
}

const res = await deleteOpenStocksDetails(
  selectedStore,
  branchCode,
);

      if (res?.success) {
        toast.success(res.message || "Opening stocks deleted successfully");
        await fetchOpenStocks();
      } else {
        toast.error(res?.message || "Failed to delete opening stocks");
      }
    } catch (error: any) {
      console.error("Error deleting opening stocks:", error);
      toast.error(
        error?.response?.data?.message || "Error deleting opening stocks",
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchOpenStocks = useCallback(async () => {
    if (!branchCode || !selectedStore) {
      setData([]);
      setOriginalData([]);
      return;
    }

    try {
      setLoading(true);

      const response = await getOpenStocksList(selectedStore, branchCode);

      const rows = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.result)
            ? response.result
            : [];

      const mapped: OpeningStockItem[] = rows.map(
        (item: any, index: number) => ({
          id:
            toNumber(item.openingStockId) ||
            toNumber(item.itemCode) ||
            index + 1,
          openingStockId: toNumber(item.openingStockId),
          itemCode: toNumber(item.itemCode),
          itemName: String(item.itemName ?? item.description ?? ""),
          storeId: String(item.storeId ?? selectedStore),
          deptCode: String(item.deptCode ?? ""),
          branch_Code: String(
            item.branch_Code ?? item.branchCode ?? branchCode,
          ),
          stockDate: String(item.stockDate ?? new Date().toISOString()),
          openingQty: toNumber(item.openingQty),
          unitCode: String(item.unitCode ?? ""),
          unitName: String(item.unitName ?? ""),
          closingQty: toNumber(item.closingQty),
          openingRate: toNumber(item.openingRate),
          isActive: item.isActive ?? true,
          indentOrderQty: toNumber(item.indentOrderQty),
          indentApprovalQty: toNumber(item.indentApprovalQty),
          issuedQty: toNumber(item.issuedQty),
          issuedReturnQty: toNumber(item.issuedReturnQty),
          userCode: String(item.userCode ?? userCode),
        }),
      );

      setData(mapped);
      setOriginalData(mapped.map((item) => ({ ...item })));

      if (mapped.length === 0) {
        toast("No opening stock items found");
      }
    } catch (error) {
      console.error("Error fetching opening stocks:", error);
      toast.error("Error fetching opening stocks");
    } finally {
      setLoading(false);
    }
  }, [branchCode, userCode, selectedStore]);

  // Fetch stores when the branch changes
  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  // Fetch opening stocks whenever the selected store changes
  useEffect(() => {
    void fetchOpenStocks();
  }, [fetchOpenStocks]);

  const handleFieldChange = (
    id: number,
    field: "openingQty" | "openingRate",
    value: string,
  ) => {
    setData((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, [field]: value === "" ? 0 : toNumber(value) }
          : item,
      ),
    );
  };

  const columns: Column<OpeningStockItem>[] = [
    { header: "Item Code", accessor: "itemCode" },
    { header: "Item Name", accessor: "itemName" },
    // { header: "Store", accessor: "storeId" },
    { header: "Unit", accessor: "unitName" },
    {
      header: "Opening Qty",
      accessor: "openingQty",
      cell: (row) => (
        <input
          type="number"
          min="0"
          step="any"
          value={row.openingQty}
          onChange={(event) =>
            handleFieldChange(row.id, "openingQty", event.target.value)
          }
          className="w-[110px] rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={`Opening quantity for ${row.itemName}`}
        />
      ),
    },
    {
      header: "Opening Rate",
      accessor: "openingRate",
      cell: (row) => (
        <input
          type="number"
          min="0"
          step="any"
          value={row.openingRate}
          onChange={(event) =>
            handleFieldChange(row.id, "openingRate", event.target.value)
          }
          className="w-[110px] rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={`Opening rate for ${row.itemName}`}
        />
      ),
    },
  ];

  const filteredData = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((item) =>
      [
        item.itemCode,
        item.itemName,
        item.storeId,
        item.deptCode,
        item.unitName,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [data, search]);

  const handleSave = async () => {
    debugger;
    if (!branchCode) {
      toast.error("Branch code is missing");
      return;
    }

    const changedItems = data.filter((item) => {
      const original = originalData.find((oldItem) => oldItem.id === item.id);
      return (
        !original ||
        original.openingQty !== item.openingQty ||
        original.openingRate !== item.openingRate
      );
    });

    if (changedItems.length === 0) {
      toast.error("Please enter or change Opening Qty or Opening Rate");
      return;
    }

    try {
      setLoading(true);
      const payload = changedItems.map((item) => ({
        openingStockId: item.openingStockId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        storeId: selectedStore,

        deptCode: item.deptCode,
        branch_Code: branchCode,
        stockDate: new Date(`${stockDate}T00:00:00`).toISOString(),
        openingQty: toNumber(item.openingQty),
        unitCode: item.unitCode,
        unitName: item.unitName,
        closingQty: toNumber(item.closingQty),
        openingRate: toNumber(item.openingRate),
        isActive: item.isActive,
        indentOrderQty: toNumber(item.indentOrderQty),
        indentApprovalQty: toNumber(item.indentApprovalQty),
        issuedQty: toNumber(item.issuedQty),
        issuedReturnQty: toNumber(item.issuedReturnQty),
        userCode,
      }));

      console.log("CreateOpenStocksMaster payload:", payload);
      const response = await createOpenStocksMaster(payload);
      if (response?.success === false) {
        toast.error(response?.message || "Failed to save opening stocks");
        return;
      }

      toast.success(response?.message || "Opening stocks saved successfully");
      await fetchOpenStocks();
    } catch (error: any) {
      console.error("Error saving opening stocks:", error);
      toast.error(
        error?.response?.data?.message || "Error saving opening stocks",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print");
      return;
    }

    const escapeHtml = (value: unknown) =>
      String(value ?? "").replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };
        return entities[character];
      });

    const rows = filteredData
      .map(
        (item) => `<tr>
          <td>${escapeHtml(item.itemCode)}</td>
          <td>${escapeHtml(item.itemName)}</td>
          <td>${escapeHtml(item.storeId)}</td>
          <td>${escapeHtml(item.deptCode)}</td>
          <td>${escapeHtml(item.unitName)}</td>
          <td>${escapeHtml(item.openingQty)}</td>
          <td>${escapeHtml(item.openingRate)}</td>
        </tr>`,
      )
      .join("");

    printWindow.document
      .write(`<!doctype html><html><head><title>Opening Stock</title>
      <style>body{font-family:Arial,sans-serif;padding:20px}h2{text-align:center}
      table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:12px}
      th{background:#f3f3f3}</style></head><body><h2>Opening Stock Details</h2>
      <table><thead><tr><th>Item Code</th><th>Item Name</th><th>Store</th><th>Department</th><th>Unit</th><th>Opening Qty</th><th>Opening Rate</th></tr></thead>
      <tbody>${rows}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto bg-gray-50 p-3 sm:p-4 md:p-6">
        {loading && <Loader />}

        <div className="mt-3 rounded-xl bg-white p-4 shadow sm:mt-4 sm:p-5">
          {/* Page Header */}
          <div className="mb-5 border-b border-gray-200 pb-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Opening Stock
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter Opening Qty and Opening Rate for each item.
            </p>
          </div>

          {/* Top Controls */}
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            {/* Left: Stock Date and Search */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:shrink-0 xl:items-end">
              <div className="flex w-full flex-col gap-1.5 sm:w-[155px]">
                <label className="text-sm font-medium text-gray-600">
                  Stock Date
                </label>
                <input
                  type="date"
                  value={stockDate}
                  onChange={(e) => setStockDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex w-full flex-col gap-1.5 sm:w-[180px]">
                <label className="text-sm font-medium text-gray-600">
                  Store
                </label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {stores.length === 0 && (
                    <option value="">No stores available</option>
                  )}

                  {stores.map((store) => (
                    <option key={store.id} value={String(store.storeId)}>
                      {store.storeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex w-full flex-col gap-1.5 sm:w-[180px]">
                <label className="text-sm font-medium text-gray-600">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 xl:ml-auto xl:justify-end">
              <button
                onClick={() => void fetchOpenStocks()}
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gray-600 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-50"
              >
                <RefreshCw size={17} />
                Refresh
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-green-600 disabled:opacity-50"
              >
                <Save size={17} />
                Save
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
              >
                <Printer size={17} />
                Print
              </button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-red-500 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-red-600 disabled:opacity-50"
              >
                <RefreshCw size={17} />
                Clear All Stocks
              </button>
            </div>
          </div>

          {/* Opening Stock Table */}
          <div className="w-full min-w-0 overflow-x-auto">
            <DataTable search={false} columns={columns} data={filteredData} />
          </div>
        </div>
      </div>
    </>
  );
}
