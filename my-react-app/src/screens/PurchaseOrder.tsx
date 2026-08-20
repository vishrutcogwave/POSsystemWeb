import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Loader from "../components/Loader";
import {
  getNextIdCode,
  getSupplierList,
  getStoreMasterList,
  purchaseOrderCalculation,
  getItemStoreListByStoreId,
  getInventoryMiscList,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";

type Supplier = {
  supCode: number;
  supName: string;
  supCPerson: string;
  supAdd1: string;
  supAdd2: string;
  supAdd3: string;
  supPhone: string;
  supFax: string;
  supMobile: string;
  supLSTNo: string;
  supLSTDate: string | null;
  supCSTNo: string;
  supCSTDate: string | null;
  acGroupCode: number;
  acCode: number;
  email: string;
  branchCode: string;
  suspPincode: string;
  supCity: string;
  gstNo: string;
  tinNo: string;
};

type Store = {
  storeId: number;
  storeName: string;
  storeLocation: string;
  storeIncharge: string;
  branch_Code: string;
};

type InventoryItem = {
  itemCode: number;
  itemName: string;
  catCode: number;
  subCatCode: number;
  storeid: string;
  grpCode: string;
  unitCode: number;
  unitName: string;
  purchaseRate: string;
  noofUnits: number;
  itemRate: number;
  itemOpStock: number;
  itemOpRate: number;
  itemROQ: number;
  itemROL: number;
  barCode: string;
  taxCode: number;
  taxName: string;
  picture: string;
  userCode: string;
  lastModify: string;
  mostRunningItemSrNo: string;
  branch_Code: string;
  firstUnit: number;
  firstUnitDesc: string;
  finalUnit: number;
  finalUnitDesc: string;
};

type PurchaseItem = {
  id: number;
  code: string;
  name: string;
  unit: string;
  qty: number;
  rate: number;
  total: number;
  taxName:string;
};

type InventoryMisc = {
  chargeId: number;
  chargeName: string;
  branch_Code: string;
  taxCode: number;
};

type MiscRow = {
  id: number;
  chargeId: number;
  chargeName: string;
  amount: number;
};

const PurchaseOrder: React.FC = () => {
  const { appData } = useAppContext();

  /* =========================
      FORM STATE
  ========================= */

  const [orderNo, setOrderNo] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  /* =========================
      SUPPLIER
  ========================= */

  const [supplier, setSupplier] = useState<Supplier | null>(
    null
  );

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loadingSuppliers, setLoadingSuppliers] =
    useState(false);

  /* =========================
      STORE
  ========================= */

  const [store, setStore] = useState<Store | null>(null);

  const [stores, setStores] = useState<Store[]>([]);

  const [loadingStores, setLoadingStores] =
    useState(false);

  /* =========================
      GLOBAL API LOADER
  ========================= */

  const [apiLoadingCount, setApiLoadingCount] =
    useState(0);

  const startApiLoading = () => {
    setApiLoadingCount((count) => count + 1);
  };

  const stopApiLoading = () => {
    setApiLoadingCount((count) =>
      Math.max(0, count - 1)
    );
  };

  /* =========================
      OTHER FORM FIELDS
  ========================= */

  const [orderedBy, setOrderedBy] = useState("");
  const [instruction, setInstruction] = useState("");

  const [effectiveFrom, setEffectiveFrom] =
    useState(
      new Date().toISOString().split("T")[0]
    );

  const [effectiveTo, setEffectiveTo] =
    useState(
      new Date().toISOString().split("T")[0]
    );

  const [remarks, setRemarks] = useState("");

  /* =========================
      DETAIL INPUT
  ========================= */
const [taxName, setTaxName] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");

  /* =========================
      INVENTORY ITEM STATE
  ========================= */

  const [inventoryItems, setInventoryItems] =
    useState<InventoryItem[]>([]);

  const [loadingInventoryItems, setLoadingInventoryItems] =
    useState(false);

  const [itemSearch, setItemSearch] = useState("");

  const [showItemDropdown, setShowItemDropdown] =
    useState(false);

  const [editingItemId, setEditingItemId] =
    useState<number | null>(null);

  /* =========================
      PURCHASE ITEMS
  ========================= */

  const [items, setItems] = useState<PurchaseItem[]>([]);

  const [calculationResponse, setCalculationResponse] =
    useState<any>(null);

  /* =========================
      MISCELLANEOUS
  ========================= */

  const [miscList, setMiscList] =
    useState<InventoryMisc[]>([]);

  const [loadingMiscList, setLoadingMiscList] =
    useState(false);

  const [miscRows, setMiscRows] =
    useState<MiscRow[]>([]);
const [miscChargeId, setMiscChargeId] = useState("");
const [miscAmount, setMiscAmount] = useState("");
  /* =========================
      FETCH NEXT ORDER CODE
  ========================= */

  const fetchNextCode = async () => {
    startApiLoading();

    try {
      const res = await getNextIdCode({
        tableName: "PurchaseOrderMaster",
        columnName: "PONo",
        conditionName: "Branch_Code",
        branch: appData?.user?.branch_code,
      });

      console.log(
        "Next Order No Response:",
        res
      );

      if (res?.success) {
        setOrderNo(res.data.toString());
      }
    } catch (err) {
      console.error(
        "Error fetching order no",
        err
      );
    } finally {
      stopApiLoading();
    }
  };

  /* =========================
      FETCH SUPPLIERS
  ========================= */

  const fetchSuppliers = async () => {
    startApiLoading();

    try {
      setLoadingSuppliers(true);

      const res = await getSupplierList(
        appData?.user?.branch_code
      );

      if (res?.success) {
        setSuppliers(res?.data || []);
      } else {
        setSuppliers([]);

        console.error(
          res?.message ||
            "Failed to fetch suppliers"
        );
      }
    } catch (error) {
      console.error(
        "Error fetching suppliers:",
        error
      );

      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
      stopApiLoading();
    }
  };

  /* =========================
      FETCH STORES
  ========================= */

  const fetchStores = async () => {
    startApiLoading();

    try {
      setLoadingStores(true);

      const res = await getStoreMasterList(
        appData?.user?.branch_code
      );

      if (res?.success) {
        setStores(res?.data || []);
      } else {
        setStores([]);

        console.error(
          res?.message ||
            "Failed to fetch stores"
        );
      }
    } catch (error) {
      console.error(
        "Error fetching store master list:",
        error
      );

      setStores([]);
    } finally {
      setLoadingStores(false);
      stopApiLoading();
    }
  };

  /* =========================
      FETCH INVENTORY ITEMS
  ========================= */

  const fetchInventoryItems = async () => {
    if (!store?.storeId) {
      setInventoryItems([]);
      return;
    }

    startApiLoading();

    try {
      setLoadingInventoryItems(true);

      const res =
        await getItemStoreListByStoreId(
          appData?.user?.branch_code,
          String(store.storeId)
        );

      if (res?.success) {
        setInventoryItems(res?.data || []);
      } else {
        setInventoryItems([]);

        console.error(
          res?.message ||
            "Failed to fetch inventory items"
        );
      }
    } catch (error) {
      console.error(
        "Error fetching inventory item store list:",
        error
      );

      setInventoryItems([]);
    } finally {
      setLoadingInventoryItems(false);
      stopApiLoading();
    }
  };

  /* =========================
      FETCH MISC LIST
  ========================= */

  const fetchInventoryMiscList = async () => {
    const branch =
      appData?.user?.branch_code || "";

    if (!branch) {
      setMiscList([]);
      return;
    }

    startApiLoading();

    try {
      setLoadingMiscList(true);

      const res =
        await getInventoryMiscList(branch);

      console.log(
        "Inventory Miscellaneous Response:",
        res
      );

      if (res?.success) {
        setMiscList(res?.data || []);
      } else {
        setMiscList([]);

        console.error(
          res?.message ||
            "Failed to fetch miscellaneous charges"
        );
      }
    } catch (error) {
      console.error(
        "Error fetching miscellaneous charges:",
        error
      );

      setMiscList([]);
    } finally {
      setLoadingMiscList(false);
      stopApiLoading();
    }
  };

  /* =========================
      INITIAL LOAD
  ========================= */

  useEffect(() => {
    if (appData?.user?.branch_code) {
      fetchSuppliers();
      fetchStores();
      fetchNextCode();
      fetchInventoryMiscList();
    }
  }, [appData?.user?.branch_code]);

  /* =========================
      LOAD ITEMS WHEN STORE CHANGES
  ========================= */

  useEffect(() => {
    if (store?.storeId) {
      fetchInventoryItems();
    } else {
      setInventoryItems([]);
    }
  }, [store?.storeId]);

  /* =========================
      FILTER INVENTORY ITEMS
  ========================= */

  const filteredInventoryItems =
    inventoryItems.filter((item) => {
      const search =
        itemSearch.trim().toLowerCase();

      if (!search) return true;

      return (
        item.itemCode
          .toString()
          .toLowerCase()
          .includes(search) ||
        item.itemName
          .toLowerCase()
          .includes(search)
      );
    });

  /* =========================
      SELECT INVENTORY ITEM
  ========================= */

  const handleInventoryItemSelect = (
    item: InventoryItem
  ) => {
    const existingItem = items.find(
      (orderItem, index) =>
        orderItem.code ===
          item.itemCode.toString() &&
        index !== editingItemId
    );

    if (existingItem) {
      toast.error(
        `${item.itemName} is already added to the order`
      );

      setShowItemDropdown(false);
      return;
    }

    const purchaseRate =
      Number(item.purchaseRate) || 0;

    setCode(item.itemCode.toString());
    setName(item.itemName);
    setUnit(item.unitName);
    setRate(purchaseRate.toString());
    setTaxName(item.taxName || "");

    setItemSearch(
      `${item.itemCode} - ${item.itemName}`
    );

    setShowItemDropdown(false);
  };

  /* =========================
      ITEM SEARCH CHANGE
  ========================= */

  const handleItemSearchChange = (
    value: string
  ) => {
    setItemSearch(value);
    setShowItemDropdown(true);

    if (!value.trim()) {
      setCode("");
      setName("");
      setUnit("");
      setRate("");
    }
  };

  /* =========================
      NEW ENTRY
  ========================= */

  const handleNewEntry = async () => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    setDate(today);

    setSupplier(null);
    setStore(null);

    setOrderedBy("");
    setInstruction("");

    setEffectiveFrom(today);
    setEffectiveTo(today);

    setRemarks("");

    setCode("");
    setName("");
    setUnit("");
    setQty("");
    setRate("");
    setMiscRows([]);
setMiscChargeId("");
setMiscAmount("");

    setItemSearch("");
    setShowItemDropdown(false);

    setItems([]);
    setMiscRows([]);
    setCalculationResponse(null);

    setEditingItemId(null);

    await fetchNextCode();
  };

  /* =========================
      SUPPLIER CHANGE
  ========================= */

  const handleSupplierChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const supCode = Number(e.target.value);

    if (!supCode) {
      setSupplier(null);
      return;
    }

    const selectedSupplier =
      suppliers.find(
        (item) =>
          item.supCode === supCode
      );

    setSupplier(
      selectedSupplier || null
    );
  };

  /* =========================
      STORE CHANGE
  ========================= */

  const handleStoreChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const storeId = Number(
      e.target.value
    );

    if (!storeId) {
      setStore(null);
      return;
    }

    const selectedStore = stores.find(
      (item) =>
        item.storeId === storeId
    );

    setStore(
      selectedStore || null
    );
  };

  /* =========================
      ADD / UPDATE ITEM
  ========================= */

  const handleAddItem = async () => {
    if (!code.trim()) {
      toast.error("Please select an item");
      return;
    }

    if (!name.trim()) {
      toast.error("Please select an item");
      return;
    }

    if (!unit.trim()) {
      toast.error("Please select an item");
      return;
    }

    if (!qty || Number(qty) <= 0) {
      toast.error(
        "Please enter a valid quantity"
      );
      return;
    }

    if (!rate || Number(rate) <= 0) {
      toast.error(
        "Selected item does not have a purchase rate"
      );
      return;
    }

    if (!store) {
      toast.error("Please select a store");
      return;
    }

    const duplicateItem = items.some(
      (item, index) =>
        item.code === code &&
        index !== editingItemId
    );

    if (duplicateItem) {
      toast.error(
        `${name} is already added to the order`
      );
      return;
    }

    const quantity = Number(qty);
    const itemRate = Number(rate);

    const newItem: PurchaseItem = {
      id:
        editingItemId !== null
          ? items[editingItemId].id
          : Date.now(),

      code,
      name,
      unit,
      qty: quantity,
      rate: itemRate,
      total: quantity * itemRate,
      taxName
    };

    const nextItems =
      editingItemId !== null
        ? items.map((item, index) =>
            index === editingItemId
              ? newItem
              : item
          )
        : [...items, newItem];

    startApiLoading();

    try {
await calculatePurchaseOrder(
  nextItems,
  miscRows
);
      setItems(nextItems);

      if (editingItemId !== null) {
        toast.success(
          "Item updated successfully"
        );
      } else {
        toast.success(
          "Item added successfully"
        );
      }

      setCode("");
      setName("");
      setUnit("");
      setQty("");
      setRate("");

      setItemSearch("");
      setShowItemDropdown(false);

      setEditingItemId(null);
    } catch (error) {
      console.error(
        "Error calculating purchase order:",
        error
      );

      toast.error(
        "Unable to calculate purchase order"
      );
    } finally {
      stopApiLoading();
    }
  };

  /* =========================
      CANCEL ITEM EDIT
  ========================= */

  const cancelEditItem = () => {
    setEditingItemId(null);

    setCode("");
    setName("");
    setUnit("");
    setQty("");
    setRate("");

    setItemSearch("");
    setShowItemDropdown(false);
  };

  /* =========================
      EDIT ITEM
  ========================= */

  const handleEditItem = (
    index: number
  ) => {
    const item = items[index];

    if (!item) return;

    setEditingItemId(index);

    setCode(item.code);
    setName(item.name);
    setUnit(item.unit);
    setQty(
      item.qty.toString()
    );
    setRate(
      item.rate.toString()
    );

    setItemSearch(
      `${item.code} - ${item.name}`
    );
  };

  /* =========================
      REMOVE ITEM
  ========================= */

  const handleRemoveItem = (
    index: number
  ) => {
    const item = items[index];

    const nextItems =
      items.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );

    setItems(nextItems);

    if (
      editingItemId === index
    ) {
      cancelEditItem();
    }

    toast.success(
      `${item?.name || "Item"} removed`
    );
  };

  /* =========================
      PURCHASE ORDER CALCULATION
  ========================= */

const calculatePurchaseOrder = async (
  nextItems: PurchaseItem[],
  nextMiscRows: MiscRow[] = miscRows
) => {
  if (!store) {
    toast.error("Please select a store");
    return;
  }

  const payload = {
    poNo: Number(orderNo || 0),

    storeId: Number(store.storeId),

    branch: appData?.user?.branch_code || "",

    discount: 0,
    discountIn: "",

    poDetail: nextItems.map((item) => ({
      itemCode: Number(item.code),
      poItemQty: Number(item.qty),
      poItemRate: Number(item.rate),
      unit: item.unit,
      poItemSuplyQty: Number(item.qty),
      cpoItemQty: Number(item.qty),
    })),

    // ✅ ALL miscellaneous charges
    poMiscDetail: nextMiscRows.map((row) => {
      const selectedCharge = miscList.find(
        (charge) => charge.chargeId === row.chargeId
      );

      return {
        miscCharge: Number(row.amount || 0),
        miscChargeCode: Number(row.chargeId || 0),
        miscTaxCode: String(selectedCharge?.taxCode ?? ""),
      };
    }),
  };

  console.log(
    "Purchase Order Calculation Payload:",
    payload
  );

  const calculationRes =
    await purchaseOrderCalculation(payload);

  console.log(
    "Purchase Order Calculation Response:",
    calculationRes
  );

  setCalculationResponse(calculationRes);

  return calculationRes;
};

  /* =========================
      ADD MISC
  ========================= */

const addMiscRow = async () => {
  if (!miscChargeId) {
    toast.error("Please select a particular");
    return;
  }

  if (!miscAmount || Number(miscAmount) <= 0) {
    toast.error("Please enter a valid amount");
    return;
  }

  const selectedCharge = miscList.find(
    (charge) =>
      charge.chargeId === Number(miscChargeId)
  );

  if (!selectedCharge) {
    toast.error("Invalid particular selected");
    return;
  }

  const newRow: MiscRow = {
    id: Date.now(),
    chargeId: selectedCharge.chargeId,
    chargeName: selectedCharge.chargeName,
    amount: Number(miscAmount),
  };

  const nextMiscRows = [
    ...miscRows,
    newRow,
  ];

  setMiscRows(nextMiscRows);

  // Call purchaseOrderCalculation immediately when Misc is added.
  // The API receives the selected Misc amount, charge code and tax code.
  startApiLoading();

  try {
await calculatePurchaseOrder(
  items,
  nextMiscRows
);
    toast.success("Miscellaneous charge added");
  } catch (error) {
    console.error(
      "Error calculating purchase order with miscellaneous charge:",
      error
    );

    toast.error(
      "Miscellaneous charge added, but calculation failed"
    );
  } finally {
    stopApiLoading();
  }

  // Clear input fields after adding
  setMiscChargeId("");
  setMiscAmount("");
};

  /* =========================
      REMOVE MISC
  ========================= */

  const removeMiscRow = async (id: number) => {
    const nextMiscRows = miscRows.filter(
      (row) => row.id !== id
    );

    setMiscRows(nextMiscRows);

    // Recalculate after removing a Misc charge.
    startApiLoading();

    try {
      // const lastMisc =
      //   nextMiscRows[nextMiscRows.length - 1];

  await calculatePurchaseOrder(
  items,
  nextMiscRows
);
      toast.success("Miscellaneous charge removed");
    } catch (error) {
      console.error(
        "Error recalculating purchase order after removing miscellaneous charge:",
        error
      );

      toast.error(
        "Miscellaneous charge removed, but calculation failed"
      );
    } finally {
      stopApiLoading();
    }
  };

  /* =========================
      MISC TOTAL
  ========================= */

  const miscTotal =
    miscRows.reduce(
      (sum, row) =>
        sum +
        Number(row.amount || 0),
      0
    );

  /* =========================
      SUB TOTAL
  ========================= */

  const subTotal =
    items.reduce(
      (sum, item) =>
        sum + item.total,
      0
    );

  /* =========================
      GRAND TOTAL
  ========================= */

  const calculatedGrandTotal =
    Number(
      calculationResponse?.grandTotal ??
        subTotal
    ) + miscTotal;

  /* =========================
      SAVE
  ========================= */

  const handleSave = () => {
    if (!supplier) {
      toast.error(
        "Please select a supplier"
      );
      return;
    }

    if (!store) {
      toast.error(
        "Please select a store"
      );
      return;
    }

    if (items.length === 0) {
      toast.error(
        "Please add at least one item"
      );
      return;
    }

    const invalidMisc =
      miscRows.some(
        (row) =>
          !row.chargeId ||
          !row.amount ||
          row.amount <= 0
      );

    if (invalidMisc) {
      toast.error(
        "Please select particular and enter valid amount for all miscellaneous charges"
      );
      return;
    }

    const purchaseOrder = {
      orderNo,
      date,

      supplierCode:
        supplier.supCode,

      supplierName:
        supplier.supName,

      storeId:
        store.storeId,

      storeName:
        store.storeName,

      orderedBy,
      instruction,

      effectiveFrom,
      effectiveTo,

      remarks,

      items,

      miscellaneous:
        miscRows,

      subTotal,

      miscTotal,

      grandTotal:
        calculatedGrandTotal,
    };

    console.log(
      "Purchase Order:",
      purchaseOrder
    );

    alert(
      "Purchase Order saved successfully"
    );
  };

  /* =========================
      COMMON CLASSES
  ========================= */

  const inputClass =
    "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-1.5 block text-xs font-semibold text-gray-600";

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:px-6">

      {apiLoadingCount > 0 && (
        <Loader />
      )}

      <Header />

      <div className="mx-auto w-full max-w-[1600px]">

        {/* PAGE TITLE */}

        <div className="mb-5 mt-2">

          <h1 className="text-2xl font-bold leading-tight text-gray-800">
            Item Purchase Order
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage purchase orders
          </p>

        </div>

        {/* MAIN CARD */}

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">

          {/* =========================
              PURCHASE ORDER
          ========================= */}

          <section className="mb-6 overflow-hidden rounded-xl border border-gray-200">

            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">

              <div>

                <h2 className="text-base font-semibold text-gray-800">
                  Purchase Order
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Order information
                </p>

              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                New Entry
              </span>

            </div>

            <div className="p-4 md:p-5">

              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* ORDER NO */}

                <div>

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Order No.
                  </label>

                  <input
                    type="text"
                    value={orderNo}
                    disabled
                    className={`${inputClass} cursor-not-allowed bg-gray-100`}
                  />

                </div>

                {/* DATE */}

                <div>

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Date
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) =>
                      setDate(
                        e.target.value
                      )
                    }
                    className={
                      inputClass
                    }
                  />

                </div>

                {/* SUPPLIER */}

                <div>

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Supplier
                  </label>

                  <select
                    value={
                      supplier?.supCode ??
                      ""
                    }
                    onChange={
                      handleSupplierChange
                    }
                    disabled={
                      loadingSuppliers
                    }
                    className={`${inputClass} ${
                      loadingSuppliers
                        ? "cursor-not-allowed bg-gray-100"
                        : ""
                    }`}
                  >

                    <option value="">
                      {loadingSuppliers
                        ? "Loading suppliers..."
                        : "Select Supplier"}
                    </option>

                    {suppliers.map(
                      (item) => (
                        <option
                          key={
                            item.supCode
                          }
                          value={
                            item.supCode
                          }
                        >
                          {item.supName}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* STORE */}

                <div>

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Store
                  </label>

                  <select
                    value={
                      store?.storeId ??
                      ""
                    }
                    onChange={
                      handleStoreChange
                    }
                    disabled={
                      loadingStores
                    }
                    className={`${inputClass} ${
                      loadingStores
                        ? "cursor-not-allowed bg-gray-100"
                        : ""
                    }`}
                  >

                    <option value="">
                      {loadingStores
                        ? "Loading stores..."
                        : "Select Store"}
                    </option>

                    {stores.map(
                      (item) => (
                        <option
                          key={
                            item.storeId
                          }
                          value={
                            item.storeId
                          }
                        >
                          {item.storeId} -{" "}
                          {
                            item.storeName
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* ORDERED BY */}

                <div>

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Ordered By
                  </label>

                  <input
                    type="text"
                    value={orderedBy}
                    onChange={(e) =>
                      setOrderedBy(
                        e.target.value
                      )
                    }
                    placeholder="Enter ordered by"
                    className={
                      inputClass
                    }
                  />

                </div>

                {/* EFFECTIVE FROM */}

                <div>

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Effective From
                  </label>

                  <input
                    type="date"
                    value={
                      effectiveFrom
                    }
                    onChange={(e) =>
                      setEffectiveFrom(
                        e.target.value
                      )
                    }
                    className={
                      inputClass
                    }
                  />

                </div>

                {/* EFFECTIVE TO */}

                <div>

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Effective To
                  </label>

                  <input
                    type="date"
                    value={
                      effectiveTo
                    }
                    onChange={(e) =>
                      setEffectiveTo(
                        e.target.value
                      )
                    }
                    className={
                      inputClass
                    }
                  />

                </div>

                {/* INSTRUCTION */}

                <div className="sm:col-span-2">

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Instruction
                  </label>

                  <textarea
                    value={instruction}
                    onChange={(e) =>
                      setInstruction(
                        e.target.value
                      )
                    }
                    rows={2}
                    placeholder="Enter instruction"
                    className="min-h-[80px] w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* REMARKS */}

                <div className="sm:col-span-2">

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Remarks
                  </label>

                  <textarea
                    value={remarks}
                    onChange={(e) =>
                      setRemarks(
                        e.target.value
                      )
                    }
                    rows={2}
                    placeholder="Enter remarks"
                    className="min-h-[80px] w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

            </div>

          </section>

          {/* =========================
              PURCHASE ORDER DETAILS
          ========================= */}

          <section className="relative z-50 mb-6 overflow-visible rounded-xl border border-gray-200">

            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">

              <h3 className="text-base font-semibold text-gray-800">
                Purchase Order Details
              </h3>

              <p className="mt-0.5 text-xs text-gray-500">
                Select an item, enter quantity, and add it to the order
              </p>

            </div>

            <div className="p-4 md:p-5">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-start">

                {/* ITEM */}

                <div className="relative sm:col-span-2 lg:col-span-4">

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Item
                  </label>

                  <input
                    value={
                      itemSearch
                    }
                    onChange={(e) =>
                      handleItemSearchChange(
                        e.target.value
                      )
                    }
                    onFocus={() =>
                      setShowItemDropdown(
                        true
                      )
                    }
                    onBlur={() => {
                      setTimeout(
                        () =>
                          setShowItemDropdown(
                            false
                          ),
                        150
                      );
                    }}
                    placeholder={
                      loadingInventoryItems
                        ? "Loading items..."
                        : "Search code or item name"
                    }
                    disabled={
                      loadingInventoryItems
                    }
                    className={`${inputClass} ${
                      loadingInventoryItems
                        ? "cursor-not-allowed bg-gray-100"
                        : ""
                    }`}
                  />

                  {showItemDropdown && (
                    <div className="absolute left-0 right-0 top-full z-[9999] mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">

                      {filteredInventoryItems.length ===
                      0 ? (

                        <div className="px-3 py-4 text-center text-sm text-gray-500">
                          No items found
                        </div>

                      ) : (

                        filteredInventoryItems.map(
                          (item) => (

                            <button
                              type="button"
                              key={
                                item.itemCode
                              }
                              onMouseDown={(
                                e
                              ) =>
                                e.preventDefault()
                              }
                              onClick={() =>
                                handleInventoryItemSelect(
                                  item
                                )
                              }
                              className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-blue-50"
                            >

                              <span className="font-medium text-gray-800">
                                {
                                  item.itemCode
                                }{" "}
                                -{" "}
                                {
                                  item.itemName
                                }
                              </span>

                              <span className="shrink-0 text-xs text-gray-500">
                                {
                                  item.unitName
                                }
                              </span>

                            </button>

                          )
                        )

                      )}

                    </div>
                  )}

                </div>

                {/* CODE */}

                <div className="lg:col-span-2">

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Code
                  </label>

                  <input
                    value={code}
                    disabled
                    placeholder="Code"
                    className={`${inputClass} cursor-not-allowed bg-gray-100`}
                  />

                </div>

                {/* NAME */}

                <div className="lg:col-span-2">

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Name
                  </label>

                  <input
                    value={name}
                    disabled
                    placeholder="Item Name"
                    className={`${inputClass} cursor-not-allowed bg-gray-100`}
                  />

                </div>

                {/* UNIT */}

                <div className="lg:col-span-1">

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Unit
                  </label>

                  <input
                    value={unit}
                    disabled
                    placeholder="Unit"
                    className={`${inputClass} cursor-not-allowed bg-gray-100`}
                  />

                </div>

                {/* QTY */}

                <div className="lg:col-span-1">

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Qty
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) =>
                      setQty(
                        e.target.value
                      )
                    }
                    placeholder="Qty"
                    className={`${inputClass} text-right`}
                  />

                </div>

                {/* RATE */}

                <div className="lg:col-span-1">

                  <label
                    className={`${labelClass} h-[18px]`}
                  >
                    Rate
                  </label>

                  <input
                    type="number"
                    value={rate}
                    disabled
                    placeholder="Rate"
                    className={`${inputClass} cursor-not-allowed bg-gray-100 text-right`}
                  />

                </div>

                {/* ADD */}

                <div className="sm:col-span-2 lg:col-span-1 lg:pt-[24px]">

                  <button
                    type="button"
                    onClick={
                      handleAddItem
                    }
                    className="h-10 w-full rounded-lg bg-green-600 px-3 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    {editingItemId !==
                    null
                      ? "Update"
                      : "+ Add"}
                  </button>

                </div>

              </div>

            </div>

            {/* ITEM TABLE */}

            <div className="relative z-0 overflow-x-auto border-t border-gray-200">

              <table className="w-full min-w-[850px] text-sm">

                <thead>

                  <tr className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-600">

                    <th className="px-4 py-3 text-left">
                      Code
                    </th>

                    <th className="px-4 py-3 text-left">
                      Name
                    </th>

                    <th className="px-4 py-3 text-left">
                      Unit
                    </th>

                    <th className="px-4 py-3 text-right">
                      Qty
                    </th>
                      <th className="px-4 py-3 text-right">
                      Tax Name
                    </th>

              


                    <th className="px-4 py-3 text-right">
                      Rate
                    </th>

                    <th className="px-4 py-3 text-right">
                      Total
                    </th>

                    <th className="px-4 py-3 text-center">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {items.length ===
                  0 ? (

                    <tr>

                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-sm text-gray-400"
                      >
                        No items added to this purchase order
                      </td>

                    </tr>

                  ) : (

                    items.map(
                      (
                        item,
                        index
                      ) => (

                        <tr
                          key={
                            item.id
                          }
                          className="border-t border-gray-200 hover:bg-gray-50"
                        >

                          <td className="px-4 py-3">
                            {
                              item.code
                            }
                          </td>

                          <td className="px-4 py-3 font-medium text-gray-800">
                            {
                              item.name
                            }
                          </td>

                          <td className="px-4 py-3">
                            {
                              item.unit
                            }
                          </td>

                          <td className="px-4 py-3 text-right">
                            {
                              item.qty
                            }
                          </td>

                                <td className="px-4 py-3 text-right">
                            {
                              item.taxName
                            }
                          </td>
                           

                          <td className="px-4 py-3 text-right">
                            ₹{" "}
                            {item.rate.toFixed(
                              2
                            )}
                          </td>

                          <td className="px-4 py-3 text-right font-semibold">
                            ₹{" "}
                            {item.total.toFixed(
                              2
                            )}
                          </td>

                          <td className="px-4 py-3 text-center">

                            <div className="flex items-center justify-center gap-3">

                              <button
                                type="button"
                                onClick={() =>
                                  handleEditItem(
                                    index
                                  )
                                }
                                className="rounded-md px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveItem(
                                    index
                                  )
                                }
                                className="rounded-md px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Remove
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </section>

          {/* =========================
              MISCELLANEOUS CHARGES
          ========================= */}

       {/* =========================
    MISCELLANEOUS CHARGES
========================= */}

<section className="mb-6 overflow-hidden rounded-xl border border-gray-200">

  <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">

    <h3 className="text-base font-semibold text-gray-800">
      Miscellaneous Charges
    </h3>

    <p className="mt-0.5 text-xs text-gray-500">
      Add additional purchase order charges
    </p>

  </div>

  {/* =========================
      ADD MISC INPUT
  ========================= */}

  <div className="p-4 md:p-5">

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">

      {/* PARTICULAR */}

      <div className="sm:col-span-2 lg:col-span-6">

        <label className={labelClass}>
          Particular
        </label>

        <select
          value={miscChargeId}
          onChange={(e) =>
            setMiscChargeId(e.target.value)
          }
          disabled={loadingMiscList}
          className={`${inputClass} ${
            loadingMiscList
              ? "cursor-not-allowed bg-gray-100"
              : ""
          }`}
        >

          <option value="">
            {loadingMiscList
              ? "Loading charges..."
              : "Select Particular"}
          </option>

          {miscList.map((charge) => (
            <option
              key={charge.chargeId}
              value={charge.chargeId}
            >
              {charge.chargeName}
            </option>
          ))}

        </select>

      </div>

      {/* AMOUNT */}

      <div className="sm:col-span-1 lg:col-span-4">

        <label className={labelClass}>
          Amount
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          value={miscAmount}
          onChange={(e) =>
            setMiscAmount(e.target.value)
          }
          placeholder="Enter Amount"
          className={`${inputClass} text-right`}
        />

      </div>

      {/* ADD BUTTON */}

      <div className="sm:col-span-1 lg:col-span-2">

        <button
          type="button"
          onClick={addMiscRow}
          className="h-10 w-full rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          + Add Misc
        </button>

      </div>

    </div>

  </div>

  {/* =========================
      ADDED MISC TABLE
  ========================= */}

  {miscRows.length > 0 && (
    <div className="overflow-x-auto border-t border-gray-200">

      <table className="w-full min-w-[700px] text-sm">

        <thead>

          <tr className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-600">

            <th className="px-4 py-3 text-left">
              Particular
            </th>

            <th className="w-[250px] px-4 py-3 text-right">
              Amount
            </th>

            <th className="w-[130px] px-4 py-3 text-center">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {miscRows.map((row) => (

            <tr
              key={row.id}
              className="border-t border-gray-200 hover:bg-gray-50"
            >

              {/* PARTICULAR */}

              <td className="px-4 py-3 font-medium text-gray-800">
                {row.chargeName}
              </td>

              {/* AMOUNT */}

              <td className="px-4 py-3 text-right font-medium text-gray-800">
                ₹ {row.amount.toFixed(2)}
              </td>

              {/* ACTION */}

              <td className="px-4 py-3 text-center">

                <button
                  type="button"
                  onClick={() =>
                    removeMiscRow(row.id)
                  }
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  )}

</section>

          {/* =========================
              ORDER SUMMARY
          ========================= */}

          <div className="mt-6 flex justify-end">

            <div className="w-full max-w-[430px] rounded-xl border border-gray-200 bg-gray-50 p-5">

              <h3 className="mb-4 border-b border-gray-200 pb-3 text-base font-semibold text-gray-800">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">

                {/* TOTAL QUANTITY */}

                <div className="flex items-center justify-between gap-4">

                  <span className="text-gray-600">
                    Total Quantity
                  </span>

                  <span className="min-w-[110px] text-right font-medium text-gray-800">

                    {Number(
                      calculationResponse?.totalQty ??
                        items.reduce(
                          (
                            sum,
                            item
                          ) =>
                            sum +
                            Number(
                              item.qty ||
                                0
                            ),
                          0
                        )
                    )}

                  </span>

                </div>

                {/* TOTAL AMOUNT */}

                <div className="flex items-center justify-between gap-4">

                  <span className="text-gray-600">
                    Total Amount
                  </span>

                  <span className="min-w-[110px] text-right font-medium text-gray-800">

                    ₹{" "}
                    {Number(
                      calculationResponse?.totalAmount ??
                        subTotal ??
                        0
                    ).toFixed(
                      2
                    )}

                  </span>

                </div>

                {/* CGST */}

                <div className="flex items-center justify-between gap-4">

                  <span className="text-gray-600">
                    CGST
                  </span>

                  <span className="min-w-[110px] text-right font-medium text-gray-800">

                    ₹{" "}
                    {Number(
                      calculationResponse?.cgstAmt ??
                        0
                    ).toFixed(
                      2
                    )}

                  </span>

                </div>

                {/* SGST */}

                <div className="flex items-center justify-between gap-4">

                  <span className="text-gray-600">
                    SGST 
                  </span>

                  <span className="min-w-[110px] text-right font-medium text-gray-800">

                    ₹{" "}
                    {Number(
                      calculationResponse?.sgstAmt ??
                        0
                    ).toFixed(
                      2
                    )}

                  </span>

                </div>

                {/* MISCELLANEOUS */}

                <div className="flex items-center justify-between gap-4">

                  <span className="text-gray-600">
                    Miscellaneous
                  </span>

                  <span className="min-w-[110px] text-right font-medium text-gray-800">

                    ₹{" "}
                    {calculationResponse?.miscTotalAmount}

                  </span>

                </div>

                {/* GRAND TOTAL */}

                <div className="border-t border-gray-200 pt-3">

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-base font-bold text-gray-800">
                      Grand Total
                    </span>

                    <span className="min-w-[110px] text-right text-lg font-bold text-blue-600">

                      ₹{" "}
                      {calculatedGrandTotal.toFixed(
                        2
                      )}

                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =========================
              ACTION BUTTONS
          ========================= */}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={
                handleNewEntry
              }
              className="h-10 rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                handleSave
              }
              className="h-10 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Purchase Order
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default PurchaseOrder;