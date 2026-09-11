import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Loader from "../components/Loader";

import {
  getInventoryItemStoreList,
  getNextIdCode,
  loadPurchaseDetailData,
  purchaseItemDamageSave,
} from "../api/services/products.service";
import toast from "react-hot-toast";

type InventoryItem = {
  itemCode: number;
  itemName: string;
  purchaseRate?: string | number;
  itemRate?: string | number;
  branch_Code?: string;
  unitName?: string;
  barCode?: string;
};

type DamageItem = {
  id: number;
  code: string;
  name: string;
  rate: number;
  qty: number;
  damageQty: number;
  amount: number;
  pNo: number;
  isAlreadyIssued: boolean;
  message: string;
};

const ItemDamageEntry: React.FC = () => {
  const [formData, setFormData] = useState({
    transactionNo: "",
    date: new Date().toISOString().split("T")[0],
  });
  const loadNextTransactionNo = async () => {
    try {
      setLoadingItems(true);

      const branchCode =
        localStorage.getItem("branchCode") ||
        localStorage.getItem("branch") ||
        "";

      const response = await getNextIdCode({
        tableName: "ItemDamageMaster",
        columnName: "DNo",
        conditionName: "Branch_Code",
        branch: branchCode,
      });

      console.log("Next Transaction Number Response:", response);

      if (response?.success) {
        setFormData((prev) => ({
          ...prev,
          transactionNo: String(
            response?.data ?? response?.nextNumber ?? response?.nextId ?? "",
          ),
        }));
      }
    } catch (error) {
      console.error("Error loading next transaction number:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  // =========================================================
  // INVENTORY ITEMS
  // =========================================================
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const [itemSearch, setItemSearch] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Combined loader for all API calls
  const isLoading = loadingItems || loadingDetails;

  // =========================================================
  // DAMAGE ITEMS
  // =========================================================
  const [items, setItems] = useState<DamageItem[]>([]);

  // =========================================================
  // STYLES
  // =========================================================
  const inputClass =
    "h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "mb-1.5 block text-xs font-semibold text-gray-600";

  // =========================================================
  // LOAD INVENTORY ITEM LIST
  // =========================================================

  const loadInventoryItems = async () => {
    try {
      setLoadingItems(true);

      const branchCode =
        localStorage.getItem("branchCode") ||
        localStorage.getItem("branch") ||
        "";

      const response = await getInventoryItemStoreList(branchCode);

      console.log("Inventory Item Store List:", response);

      if (response?.success && Array.isArray(response?.data)) {
        setInventoryItems(response.data);
      } else {
        setInventoryItems([]);
      }
    } catch (error) {
      console.error("Error loading inventory items:", error);

      setInventoryItems([]);
    } finally {
      setLoadingItems(false);
    }
  };
  useEffect(() => {
    loadNextTransactionNo();

    loadInventoryItems();
  }, []);

  // =========================================================
  // FILTER SEARCH ITEMS
  // =========================================================
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

  // =========================================================
  // SELECT ITEM
  // =========================================================
  const handleSelectItem = async (selectedItem: InventoryItem) => {
    try {
      // Show selected item in search box
      setItemSearch(`${selectedItem.itemCode} - ${selectedItem.itemName}`);

      // Hide dropdown
      setShowItemDropdown(false);

      // Show loading
      setLoadingDetails(true);

      const branchCode =
        localStorage.getItem("branchCode") ||
        localStorage.getItem("branch") ||
        selectedItem.branch_Code ||
        "";

      // =====================================================
      // CALL PURCHASE DETAIL RETURN API
      // =====================================================
      const response = await loadPurchaseDetailData({
        itemCode: Number(selectedItem.itemCode),
        branchCode,
      });

      console.log("Purchase Detail Return Response:", response);

      if (!response?.success || !Array.isArray(response?.data)) {
        setItems([]);
        return;
      }

      // =====================================================
      // MAP API RESPONSE TO TABLE
      // =====================================================
      const newItems: DamageItem[] = response.data.map(
        (detail: any, index: number) => {
          const damageQty = Number(detail.damageQty || 0);

          const rate = Number(detail.rate || 0);

          return {
            id: Date.now() + index,

            // API itemCode
            code: String(detail.itemCode ?? selectedItem.itemCode),

            // API itemName is empty,
            // so use selected item's name
            name: detail.itemName || selectedItem.itemName || "",

            // API rate
            rate,

            // API available quantity
            qty: Number(detail.availQty || 0),

            // IMPORTANT:
            // Use damageQty returned by API
            damageQty,

            // Calculate amount using
            // existing damageQty
            amount: damageQty * rate,

            // API pNo
            pNo: Number(detail.pNo || 0),

            // API already issued flag
            isAlreadyIssued: detail.isAlreadyIssued === true,

            // API message
            message: detail.message || "",
          };
        },
      );

      console.log("Mapped Damage Items:", newItems);

      setItems(newItems);
    } catch (error) {
      console.error("Error loading purchase details:", error);

      setItems([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSave = async () => {
    // =====================================================
    // ONLY ITEMS WITH DAMAGE QTY > 0
    // =====================================================
    const damageItems = items.filter(
      (item) => !item.isAlreadyIssued && Number(item.damageQty || 0) > 0,
    );

    // At least one item must have damage quantity
    if (damageItems.length === 0) {
      toast.error("Please enter Damage Qty for at least one item.");
      return;
    }

    try {
      setLoadingDetails(true);

      const branchCode =
        localStorage.getItem("branchCode") ||
        localStorage.getItem("branch") ||
        "";

      // =====================================================
      // SAVE PAYLOAD
      // =====================================================
      const payload = {
        dNo: Number(formData.transactionNo || 0),

        dDate: new Date(formData.date).toISOString(),

        dTotalAmount: totalAmount,

        taxAmount: 0,

        grossAmount: totalAmount,

        missChargeAmount: 0,

        cgstAmount: 0,

        sgstAmount: 0,

        branchCode,

        // =================================================
        // ONLY SEND ITEMS WHERE DAMAGE QTY > 0
        // =================================================
        details: damageItems.map((item) => ({
          dNo: Number(formData.transactionNo || 0),

          itemCode: Number(item.code || 0),

          dItemRate: Number(item.rate || 0),

          dItemQty: Number(item.damageQty || 0),

          itemQty: Number(item.qty || 0),

          itemBalQty: Number(item.qty || 0) - Number(item.damageQty || 0),

          pNo: Number(item.pNo || 0),

          unit: "",

          unitCode: 0,

          mainUnitConverstion: "",

          mainUnit: "",

          branch_Code: branchCode,
        })),
      };

      console.log("Purchase Item Damage Save Payload:", payload);

      // =====================================================
      // SAVE API
      // =====================================================
      const response = await purchaseItemDamageSave(payload);

      console.log("Purchase Item Damage Save Response:", response);

      if (response?.success) {
        toast.success("Damage Entry saved successfully.");
      } else {
        toast.error(response?.message || "Failed to save Damage Entry.");
      }
    } catch (error) {
      console.error("Error saving Damage Entry:", error);

      toast.error("Failed to save Damage Entry.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // =========================================================
  // UPDATE DAMAGE QTY
  // =========================================================
  const updateDamageQty = (id: number, value: string) => {
    let damageQty = Math.max(0, Number(value || 0));

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        // Already issued items cannot be damaged
        if (item.isAlreadyIssued) {
          return item;
        }

        // Damage Qty cannot be greater than
        // available quantity
        if (damageQty > item.qty) {
          damageQty = item.qty;
        }

        return {
          ...item,
          damageQty,
          amount: damageQty * Number(item.rate || 0),
        };
      }),
    );
  };

  // =========================================================
  // SAVE
  // =========================================================

  // =========================================================
  // TOTAL DAMAGE QTY
  // =========================================================
  const totalDamageQty = items.reduce(
    (sum, item) => sum + Number(item.damageQty || 0),
    0,
  );

  // =========================================================
  // TOTAL AMOUNT
  // =========================================================
  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:px-6">
      {/* ================================================= */}
      {/* GLOBAL API LOADER */}
      {/* ================================================= */}
      {isLoading && <Loader />}

      <Header />

      <div className="mx-auto w-full max-w-[1600px]">
        {/* ================================================= */}
        {/* PAGE HEADER */}
        {/* ================================================= */}
        <div className="mb-5 mt-2">
          <h1 className="text-2xl font-bold leading-tight text-gray-800">
            Item Damage Entry
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Enter required detail for item damage entry
          </p>
        </div>

        {/* ================================================= */}
        {/* MAIN CONTAINER */}
        {/* ================================================= */}
        <div className="relative z-[50] rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
          {/* ================================================= */}
          {/* MASTER DETAILS */}
          {/* ================================================= */}
          <section className="relative z-[100] overflow-visible rounded-xl border border-gray-200">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="text-sm font-bold text-gray-800">
                Item Damage Entry
              </h2>

              
            </div>

            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* ================================================= */}
                {/* TRANS NO */}
                {/* ================================================= */}
                <div className="min-w-0">
                  <label className={labelClass}>Trans No.</label>

                  <input
                    type="text"
                    value={formData.transactionNo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        transactionNo: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>

                {/* ================================================= */}
                {/* DATE */}
                {/* ================================================= */}
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

                {/* ================================================= */}
                {/* SEARCH ITEM */}
                {/* ================================================= */}
                <div className="relative z-[9999] min-w-0 md:col-span-2">
                  <label className={labelClass}>Search Item</label>

                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => {
                      setItemSearch(e.target.value);
                      setShowItemDropdown(true);
                    }}
                    onFocus={() => setShowItemDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => setShowItemDropdown(false), 150);
                    }}
                    placeholder="Search item..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />

                  {/* ================================================= */}
                  {/* ITEM DROPDOWN */}
                  {/* ================================================= */}
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
                            onClick={() => handleSelectItem(item)}
                            className="w-full border-b border-gray-100 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            {item.itemCode} - {item.itemName}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ================================================= */}
          {/* DAMAGE DETAILS */}
          {/* ================================================= */}
          <section className="relative z-10 mt-6 overflow-visible rounded-xl border border-gray-200">
            {/* TAB HEADER */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                type="button"
                className="border-r border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-blue-600"
              >
                Damage Item Detail
              </button>
            </div>

            {/* TABLE */}
            <div className="p-4 md:p-5">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[1100px] text-sm">
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
                        Qty
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        Damage Qty
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        Amount
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        PNo
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-10 text-center text-sm text-gray-500"
                        >
                          Select an item to load purchase details.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-100 ${
                            item.isAlreadyIssued
                              ? "bg-gray-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {/* S.NO */}
                          <td className="px-4 py-3 text-gray-700">
                            {index + 1}
                          </td>

                          {/* CODE */}
                          <td className="px-4 py-3 font-medium text-gray-700">
                            {item.code || "-"}
                          </td>

                          {/* NAME */}
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {item.name || "-"}
                          </td>

                          {/* RATE */}
                          <td className="px-4 py-3 text-right text-gray-700">
                            {Number(item.rate || 0).toFixed(2)}
                          </td>

                          {/* AVAILABLE QTY */}
                          <td className="px-4 py-3 text-right font-medium text-gray-800">
                            {Number(item.qty || 0).toFixed(2)}
                          </td>

                          {/* DAMAGE QTY */}
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              min="0"
                              max={item.qty}
                              step="0.01"
                              value={item.damageQty}
                              disabled={item.isAlreadyIssued}
                              onChange={(e) =>
                                updateDamageQty(item.id, e.target.value)
                              }
                              className={`h-9 w-28 rounded-md border px-2 text-right text-sm outline-none ${
                                item.isAlreadyIssued
                                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                  : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              }`}
                            />
                          </td>

                          {/* AMOUNT */}
                          <td className="px-4 py-3 text-right font-semibold text-gray-800">
                            ₹ {Number(item.amount || 0).toFixed(2)}
                          </td>

                          {/* PNO */}
                          <td className="px-4 py-3 text-right font-medium text-gray-700">
                            {item.pNo || "-"}
                          </td>

                          {/* STATUS */}
                          <td className="px-4 py-3">
                            {item.isAlreadyIssued ? (
                              <div>
                                <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">
                                  Already Issued
                                </span>

                                {item.message && (
                                  <div className="mt-1 max-w-[250px] text-xs font-medium text-red-500">
                                    {item.message}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-600">
                                Available
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ================================================= */}
          {/* SUMMARY */}
          {/* ================================================= */}
          <div className="mt-5 flex justify-end">
            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-5 sm:w-[420px]">
              <h3 className="mb-4 text-base font-bold text-gray-800">
                Damage Summary
              </h3>

              <div className="space-y-3">
                {/* TOTAL DAMAGE QTY */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Total Quantity</span>

                  <span className="min-w-[120px] text-right font-medium text-gray-800">
                    {totalDamageQty.toFixed(2)}
                  </span>
                </div>

                {/* TOTAL AMOUNT */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Total Amount</span>

                  <span className="min-w-[120px] text-right font-medium text-gray-800">
                    ₹ {totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* GRAND TOTAL */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base font-bold text-gray-800">
                      Grand Total
                    </span>

                    <span className="min-w-[120px] text-right text-lg font-bold text-blue-600">
                      ₹ {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* BUTTONS */}
          {/* ================================================= */}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="h-10 rounded-lg border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="h-10 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDamageEntry;
