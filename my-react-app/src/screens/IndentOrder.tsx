import toast from "react-hot-toast";
import Header from "../components/Header";
import Loader from "../components/Loader";
import {
  getNextIdCode,
  getStoreMasterList,
  getDepartmentList,
  getInventoryItemStoreList,
  getItemDetailsIndentOrder,
  saveIndentOrder,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState } from "react";

type Store = {
  storeId: number;
  storeName: string;
  storeLocation?: string;
  storeIncharge?: string;
  branch_Code?: string;
};

type InventoryItem = {
  itemCode: number;
  itemName: string;
  purchaseRate?: string | number;
  itemRate?: string | number;
  branch_Code?: string;
  unitName?: string;
  barCode?: string;
};

type ItemIndentDetails = {
  itemCode: number;
  itemName: string;
  itemRate: number;
  availableQty: number;
  unitName: string;
  unitCode: number;
  mainUnit: string;
  mainUnitConverstion: string;
};

type IndentItem = ItemIndentDetails & {
  id: number;
  indentQty: number;
};

const IndentOrder: React.FC = () => {
  const { appData } = useAppContext();

  const branch = appData?.user?.branch_code;

  const [formData, setFormData] = useState({
    indentNo: "",
    date: new Date().toISOString().split("T")[0],
    store: null as Store | null,
    departmentCode: "",
    departmentName: "",
    enteredBy: "",
  });

  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);

  const [departmentList, setDepartmentList] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingItemDetails, setLoadingItemDetails] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] =
    useState<ItemIndentDetails | null>(null);
  const [indentQty, setIndentQty] = useState("");

  const [indentItems, setIndentItems] = useState<IndentItem[]>([]);

  const [apiLoadingCount, setApiLoadingCount] = useState(0);

  const inputClass =
    "h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "mb-1.5 block text-xs font-semibold text-gray-600";

  const startApiLoading = () => {
    setApiLoadingCount((count) => count + 1);
  };

  const stopApiLoading = () => {
    setApiLoadingCount((count) => Math.max(0, count - 1));
  };

  // ============================================================
  // GET NEXT INDENT NUMBER
  // ============================================================
  const fetchIndentNo = async () => {
    if (!branch) return;

    startApiLoading();

    try {
      const res = await getNextIdCode({
        tableName: "IndentOrderMaster",
        columnName: "IONo",
        conditionName: "Branch_Code",
        branch,
      });

      console.log("Next Indent No Response:", res);

      if (res?.success) {
        setFormData((prev) => ({
          ...prev,
          indentNo: String(res.data),
        }));
      } else {
        toast.error(res?.message || "Failed to get next Indent No.");
      }
    } catch (error) {
      console.error("Error fetching next Indent No:", error);
      toast.error("Failed to get next Indent No.");
    } finally {
      stopApiLoading();
    }
  };

  // ============================================================
  // GET STORE LIST - SAME API AS ITEM PURCHASE
  // ============================================================
  const fetchStores = async () => {
    if (!branch) return;

    startApiLoading();

    try {
      setLoadingStores(true);

      const res = await getStoreMasterList(branch);

      console.log("Store List Response:", res);

      if (res?.success) {
        const rawStoreData = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.supplies)
            ? res.data.supplies
            : Array.isArray(res?.supplies)
              ? res.supplies
              : [];

        const storeData: Store[] = rawStoreData
          .map((item: any) => ({
            storeId: Number(item?.storeId ?? item?.storeID ?? item?.id ?? 0),
            storeName: String(
              item?.storeName ?? item?.store_name ?? item?.name ?? "",
            ),
            storeLocation: String(
              item?.storeLocation ?? item?.storelocation ?? "",
            ),
            storeIncharge: String(
              item?.storeIncharge ?? item?.storeInCharge ?? "",
            ),
            branch_Code: String(item?.branch_Code ?? item?.branchCode ?? ""),
          }))
          .filter((item: Store) => item.storeId > 0 && item.storeName);

        setStores(storeData);

        if (storeData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            store:
              storeData.find(
                (store) => store.storeId === prev.store?.storeId,
              ) || storeData[0],
          }));
        }
      } else {
        setStores([]);
        toast.error(res?.message || "Failed to load stores");
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStores([]);
      toast.error("Failed to load stores");
    } finally {
      setLoadingStores(false);
      stopApiLoading();
    }
  };

  // ============================================================
  // GET DEPARTMENT LIST - SAME API AS ITEM PURCHASE
  // ============================================================
  const fetchDepartmentList = async () => {
    if (!branch) return;

    startApiLoading();

    try {
      setLoadingDepartments(true);

      const res = await getDepartmentList(branch);

      console.log("Department List Response:", res);

      if (res?.success && Array.isArray(res?.data)) {
        const departmentData = res.data.filter(
          (item: any) => String(item?.depName ?? "").trim() !== "",
        );

        setDepartmentList(departmentData);
      } else {
        setDepartmentList([]);
      }
    } catch (error) {
      console.error("Error fetching department list:", error);
      setDepartmentList([]);
      toast.error("Failed to load departments");
    } finally {
      setLoadingDepartments(false);
      stopApiLoading();
    }
  };

  // ============================================================
  // GET INVENTORY ITEM LIST
  // SAME API AS ITEM DAMAGE ENTRY
  // ============================================================
  const fetchInventoryItems = async () => {
    if (!branch) return;

    startApiLoading();

    try {
      setLoadingItems(true);

      const response = await getInventoryItemStoreList(branch);

      console.log("Inventory Item Store List:", response);

      if (response?.success && Array.isArray(response?.data)) {
        setInventoryItems(response.data);
      } else {
        setInventoryItems([]);
        toast.error(response?.message || "Failed to load items");
      }
    } catch (error) {
      console.error("Error loading inventory items:", error);

      setInventoryItems([]);
      toast.error("Failed to load items");
    } finally {
      setLoadingItems(false);
      stopApiLoading();
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================
  useEffect(() => {
    if (!branch) return;

    fetchIndentNo();
    fetchStores();
    fetchDepartmentList();
    fetchInventoryItems();
  }, [branch]);

  // ============================================================
  // FILTER SEARCH ITEMS
  // SAME SEARCH AS ITEM DAMAGE ENTRY
  // ============================================================
  const filteredItems = inventoryItems.filter((item) => {
    const search = itemSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      String(item.itemCode).toLowerCase().includes(search) ||
      item.itemName?.toLowerCase().includes(search) ||
      item.barCode?.toLowerCase().includes(search)
    );
  });

  // ============================================================
  // SELECT ITEM
  // CALL INDENT ORDER ITEM DETAILS API
  // ============================================================
  const handleSelectItem = async (selectedItem: InventoryItem) => {
    try {
      console.log("Selected Item:", selectedItem);

      setItemSearch(`${selectedItem.itemCode} - ${selectedItem.itemName}`);
      setShowItemDropdown(false);
      setSelectedItemDetails(null);
      setIndentQty("");
      setLoadingItemDetails(true);

      const branchCode =
        branch ||
        localStorage.getItem("branchCode") ||
        localStorage.getItem("branch") ||
        selectedItem.branch_Code ||
        "";

      const storeId = formData.store?.storeId;

      if (!branchCode) {
        toast.error("Branch code not found.");
        return;
      }

      if (!storeId) {
        toast.error("Please select a store first.");
        return;
      }

      const response = await getItemDetailsIndentOrder({
        branchCode,
        StoreId: storeId,
        ItemCode: Number(selectedItem.itemCode),
      });

      console.log("GetItemDetailsIndentOrder Response:", response);

      if (!response?.success || !response?.data) {
        toast.error(response?.message || "Item details not found.");
        return;
      }

      const data = response.data;

      const details: ItemIndentDetails = {
        itemCode: Number(data.itemCode ?? selectedItem.itemCode ?? 0),
        itemName: String(data.itemName ?? selectedItem.itemName ?? ""),
        itemRate: Number(data.itemRate ?? 0),
        availableQty: Number(data.availableQty ?? 0),
        unitName: String(data.unitName ?? ""),
        unitCode: Number(data.unitCode ?? 0),
        mainUnit: String(data.mainUnit ?? ""),
        mainUnitConverstion: String(data.mainUnitConverstion ?? ""),
      };

      setSelectedItemDetails(details);
    } catch (error) {
      console.error("Error loading indent item details:", error);
      setSelectedItemDetails(null);
      toast.error("Failed to load item details.");
    } finally {
      setLoadingItemDetails(false);
    }
  };

  // ============================================================
  // ADD ITEM TO INDENT TABLE
  // ============================================================
  const handleAddIndentItem = () => {
    if (!selectedItemDetails) {
      toast.error("Please select an item first.");
      return;
    }

    const qty = Number(indentQty);

    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Please enter a valid Indent Qty.");
      return;
    }

    if (qty > selectedItemDetails.availableQty) {
      toast.error("Indent Qty cannot be greater than Available Qty.");
      return;
    }

    const existingIndex = indentItems.findIndex(
      (item) => item.itemCode === selectedItemDetails.itemCode,
    );

    if (existingIndex >= 0) {
      setIndentItems((prev) =>
        prev.map((item, index) =>
          index === existingIndex
            ? { ...item, indentQty: item.indentQty + qty }
            : item,
        ),
      );
    } else {
      setIndentItems((prev) => [
        ...prev,
        {
          ...selectedItemDetails,
          id: Date.now(),
          indentQty: qty,
        },
      ]);
    }

    setSelectedItemDetails(null);
    setIndentQty("");
    setItemSearch("");
    toast.success("Item added to indent table.");
  };

  const handleIndentQtyChange = (id: number, value: string) => {
    if (value === "") {
      setIndentItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, indentQty: 0 } : item)),
      );
      return;
    }

    const qty = Number(value);
    if (!Number.isFinite(qty) || qty < 0) return;

    setIndentItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              indentQty: Math.min(qty, item.availableQty),
            }
          : item,
      ),
    );
  };

  const handleRemoveIndentItem = (id: number) => {
    setIndentItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ============================================================
  // STORE CHANGE
  // ============================================================
  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storeId = Number(e.target.value);

    const selectedStore = stores.find((item) => item.storeId === storeId);

    setFormData((prev) => ({
      ...prev,
      store: selectedStore || null,
    }));
  };

  // ============================================================
  // CLEAR FORM
  // ============================================================
  const handleClear = async () => {
    const today = new Date().toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      indentNo: "",
      date: today,
      store: stores[0] || null,
      departmentCode: "",
      departmentName: "",
      enteredBy: "",
    }));

    setItemSearch("");
    setShowItemDropdown(false);
    setSelectedItemDetails(null);
    setIndentQty("");
    setIndentItems([]);

    await fetchIndentNo();

    toast.success("Form cleared");
  };

  const handleSaveIndentOrder = async () => {
    try {
      // Validate store
      if (!formData.store) {
        toast.error("Please select a store.");
        return;
      }
         if (!formData.enteredBy.trim()) {
      toast.error("Please enter Entered By.");
      return;
    }


      // Validate department
      if (!formData.departmentCode) {
        toast.error("Please select a department.");
        return;
      }

      // Validate items
      if (indentItems.length === 0) {
        toast.error("Please add at least one item.");
        return;
      }

      // Validate indent quantities
      const invalidQty = indentItems.some(
        (item) =>
          !Number.isFinite(Number(item.indentQty)) ||
          Number(item.indentQty) <= 0,
      );

      if (invalidQty) {
        toast.error("Please enter a valid Indent Qty for all items.");
        return;
      }

      // Branch code
      const branchCode =
        branch ||
        localStorage.getItem("branchCode") ||
        localStorage.getItem("branch") ||
        "";

      if (!branchCode) {
        toast.error("Branch code not found.");
        return;
      }


      const payload = {
        ioNo: Number(formData.indentNo) || 0,

        billed: "",

        ioDate: formData.date ?? "",

        storeCode: String(formData.store.storeId),

        orderBy: String(formData.enteredBy || ""),

        depCode: String(formData.departmentCode || ""),

        branchCode: String(branchCode),

        cgstAmount: 0,

        sgstAmount: 0,

        missChargeAmount: 0,

        totalAmount: 0,

        taxAmount: 0,

        grossAmount: 0,

        storeId: String(formData.store.storeId),
        status: "IO",
        // ==========================================================
        // ITEMS
        // ==========================================================

        items: indentItems.map((item) => ({
          itemCode: Number(item.itemCode),

          itemName: String(item.itemName || ""),

          ioItemQty: Number(item.indentQty || 0),

          ioItemRate: Number(item.itemRate || 0),

          unit: String(item.unitName || ""),

          unitCode: Number(item.unitCode || 0),

          mainUnitConverstion: String(item.mainUnitConverstion || ""),

          mainUnit: String(item.mainUnit || ""),

          ioAvailableQty: Number(item.availableQty - item.indentQty),

          ioOrginalQty: Number(item.availableQty || 0),
        })),
      };

      console.log("========================================");
      console.log("SaveIndentOrder Payload:", payload);
      console.log("========================================");

      // Call API
      const response = await saveIndentOrder(payload);

      console.log("SaveIndentOrder Response:", response);

      // Success
      if (response?.success) {
        toast.success(response?.message || "Indent Order saved successfully.");

        // Clear added items
        setIndentItems([]);

        // Get next indent number
        await fetchIndentNo();
      } else {
        toast.error(response?.message || "Failed to save Indent Order.");
      }
    } catch (error: any) {
      console.error("Error saving Indent Order:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save Indent Order.",
      );
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:px-6">
      {apiLoadingCount > 0 && <Loader />}

      <Header />

      <div className="mx-auto w-full max-w-[1600px]">
        {/* PAGE TITLE */}
        <div className="mb-5 mt-2">
          <h1 className="text-2xl font-bold leading-tight text-gray-800">
            Indent Order
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Enter required details for indent order
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
          {/* ============================================================
              MASTER DETAILS
          ============================================================ */}
          <section className="overflow-hidden rounded-xl border border-gray-200">
            {/* SECTION HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Indent Order
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Enter indent order details
                </p>
              </div>
            </div>

            {/* FORM */}
            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* STORE NAME */}
                <div className="min-w-0">
                  <label className={labelClass}>Store Name</label>

                  <select
                    value={formData.store?.storeId ?? ""}
                    onChange={handleStoreChange}
                    disabled={loadingStores}
                    className={`${inputClass} ${
                      loadingStores ? "cursor-not-allowed bg-gray-100" : ""
                    }`}
                  >
                    <option value="">
                      {loadingStores ? "Loading stores..." : "Select Store"}
                    </option>

                    {stores.map((item) => (
                      <option key={item.storeId} value={item.storeId}>
                        {item.storeName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DEPARTMENT */}
                <div className="min-w-0">
                  <label className={labelClass}>Department</label>

                  <select
                    value={formData.departmentCode}
                    onChange={(e) => {
                      const selectedCode = e.target.value;

                      const selectedDepartment = departmentList.find(
                        (dept: any) => String(dept?.depCode) === selectedCode,
                      );

                      setFormData((prev) => ({
                        ...prev,
                        departmentCode: selectedCode,
                        departmentName: selectedDepartment?.depName ?? "",
                      }));
                    }}
                    disabled={loadingDepartments}
                    className={`${inputClass} ${
                      loadingDepartments ? "cursor-not-allowed bg-gray-100" : ""
                    }`}
                  >
                    <option value="">
                      {loadingDepartments
                        ? "Loading Departments..."
                        : "Select Department"}
                    </option>

                    {departmentList.map((dept: any) => (
                      <option key={dept.depCode} value={dept.depCode}>
                        {dept.depName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* INDENT NO */}
                <div className="min-w-0">
                  <label className={labelClass}>Indent No.</label>

                  <input
                    type="text"
                    value={formData.indentNo}
                    disabled
                    placeholder="Indent No."
                    className={`${inputClass} cursor-not-allowed bg-gray-100`}
                  />
                </div>

                {/* DATE */}
                <div className="min-w-0">
                  <label className={labelClass}>Date</label>

                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>

                {/* ENTERED BY */}
                <div className="min-w-0">
                  <label className={labelClass}>Entered By</label>

                  <input
                    type="text"
                    value={formData.enteredBy}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        enteredBy: e.target.value,
                      }))
                    }
                    placeholder="Entered By"
                    className={`${inputClass} bg-gray-100`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================
              ITEM SEARCH
          ============================================================ */}
          <section className="relative z-[100] mt-6 overflow-visible rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <h2 className="text-sm font-bold text-gray-800">Item Search</h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Search and select an item
                </p>
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="relative max-w-xl">
                <label className={labelClass}>Search Item</label>

                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => {
                    setItemSearch(e.target.value);
                    setShowItemDropdown(true);
                  }}
                  onFocus={() => setShowItemDropdown(true)}
                  placeholder="Search item by code, name or barcode..."
                  className={inputClass}
                />

                {/* ITEM DROPDOWN */}
                {showItemDropdown && (
                  <div className="absolute left-0 right-0 top-full z-[99999] mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-2xl">
                    {loadingItems ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Loading items...
                      </div>
                    ) : filteredItems.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No items found.
                      </div>
                    ) : (
                      filteredItems.map((item) => (
                        <button
                          key={item.itemCode}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectItem(item);
                          }}
                          className="w-full border-b border-gray-100 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          <div className="font-semibold text-gray-800">
                            {item.itemCode} - {item.itemName}
                          </div>

                          {item.barCode && (
                            <div className="mt-1 text-xs text-gray-500">
                              Barcode: {item.barCode}
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ============================================================
              SELECTED ITEM DETAILS FORM
          ============================================================ */}
          <section className="relative z-10 mt-6 overflow-visible rounded-xl border border-gray-200">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="text-sm font-bold text-gray-800">Item Details</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Item details are loaded automatically. Enter the Indent Qty and
                add the item to the table.
              </p>
            </div>

            <div className="p-4 md:p-5">
              {loadingItemDetails ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  Loading item details...
                </div>
              ) : selectedItemDetails ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className={labelClass}>Item Code</label>
                    <input
                      value={selectedItemDetails.itemCode}
                      disabled
                      className={`${inputClass} cursor-not-allowed bg-gray-100`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Item Name</label>
                    <input
                      value={selectedItemDetails.itemName}
                      disabled
                      className={`${inputClass} cursor-not-allowed bg-gray-100`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Unit</label>
                    <input
                      value={selectedItemDetails.unitName}
                      disabled
                      className={`${inputClass} cursor-not-allowed bg-gray-100`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Available Qty</label>
                    <input
                      value={selectedItemDetails.availableQty}
                      disabled
                      className={`${inputClass} cursor-not-allowed bg-gray-100`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Indent Qty</label>
                    <input
                      type="number"
                      min="0"
                      max={selectedItemDetails.availableQty}
                      step="any"
                      value={indentQty}
                      onChange={(e) => setIndentQty(e.target.value)}
                      placeholder="Enter Indent Qty"
                      className={inputClass}
                    />
                  </div>

                  <div className="flex items-end sm:col-span-2 lg:col-span-4">
                    <button
                      type="button"
                      onClick={handleAddIndentItem}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  Select an item above to load item details.
                </div>
              )}
            </div>
          </section>

          {/* ============================================================
              INDENT ITEMS TABLE
          ============================================================ */}
          <section className="relative z-10 mt-6 overflow-visible rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <h2 className="text-sm font-bold text-gray-800">
                  Indent Item Detail
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Added items and their manually entered indent quantities.
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {indentItems.length} Item(s)
              </span>
            </div>

            <div className="p-4 md:p-5">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[1250px] text-sm">
                  <thead className="bg-gray-100">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        S.No.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Name
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        Rate
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        Available Qty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Unit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-blue-700">
                        Indent Qty
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {indentItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-10 text-center text-sm text-gray-500"
                        >
                          No items added yet. Select an item, enter Indent Qty
                          and click Add Item.
                        </td>
                      </tr>
                    ) : (
                      indentItems.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-gray-700">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-700">
                            {item.itemCode}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {item.itemName}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {item.itemRate.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-800">
                            {item.availableQty}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {item.unitName || "-"}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              min="0"
                              max={item.availableQty}
                              step="any"
                              value={item.indentQty === 0 ? "" : item.indentQty}
                              onChange={(e) =>
                                handleIndentQtyChange(item.id, e.target.value)
                              }
                              className="h-9 w-28 rounded-md border border-blue-300 px-2 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveIndentItem(item.id)}
                              className="text-sm font-semibold text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ============================================================
              ACTION BUTTONS
          ============================================================ */}
          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={handleClear}
              disabled={apiLoadingCount > 0 || loadingItemDetails}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleSaveIndentOrder}
              disabled={
                apiLoadingCount > 0 ||
                loadingItemDetails ||
                indentItems.length === 0
              }
              title={
                indentItems.length === 0
                  ? "Add at least one item before saving"
                  : "Save Indent Order"
              }
              className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {apiLoadingCount > 0 ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndentOrder;
