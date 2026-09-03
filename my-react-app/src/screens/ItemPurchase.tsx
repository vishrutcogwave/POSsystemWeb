import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Loader from "../components/Loader";
import {
  getNextIdCode,
  getStoreMasterList,
  getGoodsReceivedList,
  getPurchaseGoodsReceivedList,
  getDepartmentList,
  purchaseOrderCalculation,
  getItemStoreListByStoreId,
  getInventoryUnitConversionList,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";

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
  unitCode: number;
  unitName: string;
  itemRate: number;
  taxName: string;
  taxCode: number;
};

type PurchaseItem = {
  id: number;
  code: string;
  name: string;
  unit: string;
  unitCode: number;
  unitQty: number;
  enteredQty: number;
  qty: number;
  rate: number;
  total: number;
  taxName: string;
  noOfDays: number;
  expiryDate: string;
};

type InventoryUnitConversion = {
  unitCode: number;
  unitName: string;
  qty: number;
  isActive: boolean;
  branch_Code: string;
  createdBy: string;
  createdDate: string;
};

const ItemPurchase: React.FC = () => {
  const { appData } = useAppContext();

  /* =========================
      FORM STATE
  ========================= */

  const [formData, setFormData] = useState({
    transactionNo: "",
    billNo: "",
    date: new Date().toISOString().split("T")[0],
    orderNo: "",
    supplier: "",
    departmentCode: "",
    departmentName: "",
    directPurchase: false,
    directIssue: false,
    store: null as Store | null,
  });

  /* =========================
      MASTER DATA
  ========================= */

  const [stores, setStores] = useState<Store[]>([]);
  const [grnList, setGrnList] = useState<string[]>([]);
  const [departmentList, setDepartmentList] = useState<any[]>([]);

  /* =========================
      PURCHASE GRN RESPONSE
  ========================= */

  const [purchaseGoodsReceivedData, setPurchaseGoodsReceivedData] =
    useState<any>(null);
  const [loadingStores, setLoadingStores] = useState(false);
  const [loadingGrnList, setLoadingGrnList] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  /* =========================
      DIRECT PURCHASE ITEM STATE
  ========================= */

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingInventoryItems, setLoadingInventoryItems] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [unitCode, setUnitCode] = useState(0);
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");
  const [taxName, setTaxName] = useState("");
  const [noOfDays, setNoOfDays] = useState("");
  const [expiryDate, setExpiryDate] = useState(formData.date);

  const [selectedUnitQty, setSelectedUnitQty] = useState(0);
  const [unitConversions, setUnitConversions] = useState<
    InventoryUnitConversion[]
  >([]);
  const [loadingUnitConversions, setLoadingUnitConversions] = useState(false);
  const [showUnitConversion, setShowUnitConversion] = useState(false);

  const [directPurchaseItems, setDirectPurchaseItems] = useState<
    PurchaseItem[]
  >([]);
  const [editingDirectPurchaseItemIndex, setEditingDirectPurchaseItemIndex] =
    useState<number | null>(null);
  const [directPurchaseCalculation, setDirectPurchaseCalculation] =
    useState<any>(null);

  /* =========================
      API LOADER
  ========================= */

  const [apiLoadingCount, setApiLoadingCount] = useState(0);

  const startApiLoading = () => {
    setApiLoadingCount((count) => count + 1);
  };

  const stopApiLoading = () => {
    setApiLoadingCount((count) => Math.max(0, count - 1));
  };

  /* =========================
      COMMON CLASSES
  ========================= */

  const inputClass =
    "h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "mb-1.5 block text-xs font-semibold text-gray-600";

  /* =========================
      FETCH TRANSACTION NO
  ========================= */

  const fetchTransactionNo = async () => {
    const branch = appData?.user?.branch_code;

    if (!branch) return;

    startApiLoading();

    try {
      const res = await getNextIdCode({
        tableName: "PurchaseMaster",
        columnName: "PNo",
        conditionName: "Branch_Code",
        branch,
      });

      if (res?.success) {
        setFormData((prev) => ({
          ...prev,
          transactionNo: String(res.data),
        }));
      }
    } catch (error) {
      console.error("Error fetching transaction no:", error);
    } finally {
      stopApiLoading();
    }
  };

  /* =========================
      FETCH STORES
  ========================= */

  const fetchStores = async () => {
    const branch = appData?.user?.branch_code;

    if (!branch) return;

    startApiLoading();

    try {
      setLoadingStores(true);

      const res = await getStoreMasterList(branch);

      if (res?.success) {
        const storeData = res.data || [];

        setStores(storeData);

        if (storeData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            store: prev.store || storeData[0],
          }));
        }
      } else {
        setStores([]);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStores([]);
    } finally {
      setLoadingStores(false);
      stopApiLoading();
    }
  };

  /* =========================
      FETCH GRN LIST
  ========================= */

  const fetchGoodsReceivedList = async () => {
    const branch = appData?.user?.branch_code;

    if (!branch) return;

    startApiLoading();

    try {
      setLoadingGrnList(true);

      const res = await getGoodsReceivedList(branch);

      if (res?.success && Array.isArray(res.data)) {
        const grnNumbers = res.data
          .map((item: any) => String(item?.master?.grnNo ?? ""))
          .filter((grnNo: string) => grnNo !== "")
          .sort((a: string, b: string) => Number(a) - Number(b));

        setGrnList(grnNumbers);
      
      } else {
        setGrnList([]);
      }
    } catch (error) {
      console.error("Error fetching Goods Received List:", error);

      setGrnList([]);
    } finally {
      setLoadingGrnList(false);
      stopApiLoading();
    }
  };

  /* =========================
      FETCH SELECTED GRN
  ========================= */

  const fetchPurchaseGoodsReceived = async (grnNo: string) => {
    const branch = appData?.user?.branch_code;

    if (!branch || !grnNo) return;

    startApiLoading();

    try {
      const res = await getPurchaseGoodsReceivedList(branch, Number(grnNo));

      console.log("Purchase Goods Received Response:", res);

      setPurchaseGoodsReceivedData(res);

      // Set Supplier as: supCode - vendorName
      const master = res?.data?.[0]?.master;

      if (master) {
        const supplierValue = `${master?.supCode ?? ""}-${
          master?.vendorName ?? ""
        }`;

        setFormData((prev) => ({
          ...prev,
          supplier: supplierValue,
            billNo: String(master?.billed ?? ""),
        }));
      }
    } catch (error) {
      console.error("Error fetching Purchase Goods Received List:", error);

      setPurchaseGoodsReceivedData(null);

      setFormData((prev) => ({
        ...prev,
        supplier: "",
      }));

      toast.error("Failed to load GRN details");
    } finally {
      stopApiLoading();
    }
  };

  /* =========================
      FETCH DEPARTMENT LIST
  ========================= */

  const fetchDepartmentList = async () => {
    const branch = appData?.user?.branch_code;

    if (!branch) return;

    startApiLoading();

    try {
      setLoadingDepartments(true);

      const res = await getDepartmentList(branch);

      console.log("Department List Response:", res);

      if (res?.success && Array.isArray(res?.data)) {
        // Ignore departments where depName is empty
        const departmentData = res.data.filter(
          (item: any) => String(item?.depName ?? "").trim() !== ""
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

  /* =========================
      FETCH DIRECT PURCHASE ITEMS
  ========================= */

  const fetchInventoryItems = async (storeId?: number) => {
    const branch = appData?.user?.branch_code;
    const selectedStoreId = storeId ?? formData.store?.storeId;

    if (!branch || !selectedStoreId) {
      setInventoryItems([]);
      return;
    }

    startApiLoading();

    try {
      setLoadingInventoryItems(true);

      const res = await getItemStoreListByStoreId(
        branch,
        String(selectedStoreId),
      );

      if (res?.success) {
        setInventoryItems(res?.data || []);
      } else {
        setInventoryItems([]);
      }
    } catch (error) {
      console.error("Error fetching direct purchase inventory items:", error);
      setInventoryItems([]);
    } finally {
      setLoadingInventoryItems(false);
      stopApiLoading();
    }
  };

  /* =========================
      FETCH UNIT CONVERSIONS
  ========================= */

  const fetchInventoryUnitConversions = async () => {
    const branch = appData?.user?.branch_code;

    if (!branch) {
      setUnitConversions([]);
      return;
    }

    startApiLoading();

    try {
      setLoadingUnitConversions(true);

      const res = await getInventoryUnitConversionList(branch);

      if (res?.success) {
        setUnitConversions(
          (res?.data || []).filter(
            (item: InventoryUnitConversion) => item.isActive,
          ),
        );
      } else {
        setUnitConversions([]);
      }
    } catch (error) {
      console.error("Error fetching unit conversions:", error);
      setUnitConversions([]);
    } finally {
      setLoadingUnitConversions(false);
      stopApiLoading();
    }
  };

  useEffect(() => {
    if (appData?.user?.branch_code) {
      fetchInventoryUnitConversions();
    }
  }, [appData?.user?.branch_code]);

useEffect(() => {
  if (formData.store?.storeId) {
    fetchInventoryItems(formData.store.storeId);
  } else {
    setInventoryItems([]);
  }
}, [formData.store?.storeId]);
  /* =========================
      INITIAL LOAD
  ========================= */

  useEffect(() => {
    if (!appData?.user?.branch_code) return;

    fetchTransactionNo();
    fetchStores();
    fetchGoodsReceivedList();
    fetchDepartmentList();
  }, [appData?.user?.branch_code]);

  /* =========================
      STORE CHANGE
  ========================= */

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storeId = Number(e.target.value);

    if (!storeId) {
      setFormData((prev) => ({
        ...prev,
        store: null,
      }));

      return;
    }

    const selectedStore = stores.find((item) => item.storeId === storeId);

    setFormData((prev) => ({
      ...prev,
      store: selectedStore || null,
    }));
  };

  /* =========================
      GRN CHANGE
  ========================= */

const handleGrnChange = async (
  e: React.ChangeEvent<HTMLSelectElement>
) => {
  const grnNo = e.target.value;

  setFormData((prev) => ({
    ...prev,
    orderNo: grnNo,
    // Reset Bill No when no Order No is selected
    billNo: grnNo ? prev.billNo : "",
  }));

  if (!grnNo) {
    setPurchaseGoodsReceivedData(null);

    // Reset supplier also
    setFormData((prev) => ({
      ...prev,
      billNo: "",
      supplier: "",
    }));

    return;
  }

  await fetchPurchaseGoodsReceived(grnNo);
};
  /* =========================
      DIRECT PURCHASE ITEM SEARCH
  ========================= */

  const filteredDirectPurchaseItems = inventoryItems.filter((item) => {
    const search = itemSearch.trim().toLowerCase();

    if (!search) return true;

    return (
      String(item.itemCode).toLowerCase().includes(search) ||
      String(item.itemName || "").toLowerCase().includes(search)
    );
  });

  const handleDirectPurchaseItemSelect = (item: InventoryItem) => {
    const existingItem = directPurchaseItems.find(
      (purchaseItem, index) =>
        purchaseItem.code === String(item.itemCode) &&
        index !== editingDirectPurchaseItemIndex,
    );

    if (existingItem) {
      toast.error(`${item.itemName} is already added`);
      return;
    }

    setCode(String(item.itemCode));
    setName(item.itemName || "");
    setUnit(item.unitName || "");
    setUnitCode(Number(item.unitCode || 0));
    setRate(String(item.itemRate ?? ""));
    setTaxName(item.taxName || "");
    setNoOfDays("0");
    setExpiryDate(formData.date);
    setSelectedUnitQty(0);
    setShowUnitConversion(false);
    setItemSearch(`${item.itemCode} - ${item.itemName}`);
    setShowItemDropdown(false);
  };

  const handleDirectPurchaseItemSearchChange = (value: string) => {
    setItemSearch(value);
    setShowItemDropdown(true);

    if (!value.trim()) {
      setCode("");
      setName("");
      setUnit("");
      setUnitCode(0);
      setSelectedUnitQty(0);
      setRate("");
      setTaxName("");
      setNoOfDays("");
      setExpiryDate(formData.date);
    }
  };

  /* =========================
      EXPIRY DATE CALCULATION
  ========================= */

  const calculateExpiryDate = (date: string, days: number) => {
    if (!date) return "";

    const result = new Date(`${date}T00:00:00`);

    if (Number.isNaN(result.getTime())) return "";

    result.setDate(result.getDate() + Number(days || 0));

    return result.toISOString().split("T")[0];
  };

  /* =========================
      DIRECT PURCHASE CALCULATION
  ========================= */

  const calculateDirectPurchase = async (nextItems: PurchaseItem[]) => {
    if (!formData.store) {
      toast.error("Please select a store");
      return;
    }

    const payload = {
      poNo: 0,
      storeId: Number(formData.store.storeId),
      branch: appData?.user?.branch_code || "",
      discount: 0,
      discountIn: "",
      poDetail: nextItems.map((item) => ({
        itemCode: Number(item.code),
        poItemQty: Number(item.qty),
        poItemRate: Number(item.rate),
        unit: item.unit,
        unitCode: Number(item.unitCode || 0),
        poItemSuplyQty: Number(item.qty),
        cpoItemQty: Number(item.qty),
      })),
      poMiscDetail: [],
    };

    console.log("Direct Purchase Calculation Payload:", payload);

    startApiLoading();

    try {
      const res = await purchaseOrderCalculation(payload);

      console.log("Direct Purchase Calculation Response:", res);

      setDirectPurchaseCalculation(res);
      return res;
    } catch (error) {
      console.error("Error calculating direct purchase:", error);
      toast.error("Failed to calculate purchase");
    } finally {
      stopApiLoading();
    }
  };

  const resetDirectPurchaseItemForm = () => {
    setEditingDirectPurchaseItemIndex(null);
    setCode("");
    setName("");
    setUnit("");
    setUnitCode(0);
    setSelectedUnitQty(0);
    setQty("");
    setRate("");
    setTaxName("");
    setNoOfDays("");
    setExpiryDate(formData.date);
    setItemSearch("");
    setShowItemDropdown(false);
  };

  const handleAddDirectPurchaseItem = async () => {
    if (!code || !name) {
      toast.error("Please select an item");
      return;
    }

    if (!unit) {
      toast.error("Please select a unit");
      return;
    }

    const enteredQty = Number(qty);
    const conversionQty = Number(selectedUnitQty);
    const itemRate = Number(rate);
    const enteredNoOfDays = Number(noOfDays || 0);
    const calculatedExpiryDate = calculateExpiryDate(
      formData.date,
      enteredNoOfDays,
    );

    if (!enteredQty || enteredQty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!itemRate || itemRate <= 0) {
      toast.error("Please enter a valid rate");
      return;
    }

    const actualQty =
      conversionQty > 0 ? enteredQty * conversionQty : enteredQty;

    const newItem: PurchaseItem = {
      id:
        editingDirectPurchaseItemIndex !== null
          ? directPurchaseItems[editingDirectPurchaseItemIndex].id
          : Date.now(),
      code,
      name,
      unit,
      unitCode: Number(unitCode || 0),
      unitQty: conversionQty,
      enteredQty,
      qty: actualQty,
      rate: itemRate,
      total: actualQty * itemRate,
      taxName,
      noOfDays: enteredNoOfDays,
      expiryDate: calculatedExpiryDate,
    };

    const nextItems =
      editingDirectPurchaseItemIndex !== null
        ? directPurchaseItems.map((item, index) =>
            index === editingDirectPurchaseItemIndex ? newItem : item,
          )
        : [...directPurchaseItems, newItem];

    setDirectPurchaseItems(nextItems);
    await calculateDirectPurchase(nextItems);
    resetDirectPurchaseItemForm();
  };

  const handleEditDirectPurchaseItem = (index: number) => {
    const item = directPurchaseItems[index];

    if (!item) return;

    setEditingDirectPurchaseItemIndex(index);
    setCode(item.code);
    setName(item.name);
    setUnit(item.unit);
    setUnitCode(Number(item.unitCode || 0));
    setQty(String(item.enteredQty));
    setSelectedUnitQty(Number(item.unitQty || 0));
    setRate(String(item.rate));
    setTaxName(item.taxName || "");
    setNoOfDays(String(item.noOfDays ?? 0));
    setExpiryDate(
      item.expiryDate ||
        calculateExpiryDate(formData.date, Number(item.noOfDays ?? 0)),
    );
    setItemSearch(`${item.code} - ${item.name}`);
    setShowItemDropdown(false);
  };

  const handleRemoveDirectPurchaseItem = async (index: number) => {
    const item = directPurchaseItems[index];

    const nextItems = directPurchaseItems.filter(
      (_, itemIndex) => itemIndex !== index,
    );

    setDirectPurchaseItems(nextItems);

    if (editingDirectPurchaseItemIndex === index) {
      resetDirectPurchaseItemForm();
    }

    if (nextItems.length > 0) {
      await calculateDirectPurchase(nextItems);
    } else {
      setDirectPurchaseCalculation(null);
    }

    toast.success(`${item?.name || "Item"} removed`);
  };

  /* =========================
      SELECTED GRN DATA
  ========================= */

  const selectedGrnData = purchaseGoodsReceivedData?.data?.[0];

  const selectedGrnMaster = selectedGrnData?.master;

  const selectedGrnDetails = selectedGrnData?.details || [];

  /* =========================
      ORDER SUMMARY VALUES
  ========================= */

  const directPurchaseTotalQuantity = directPurchaseItems.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0,
  );

  const directPurchaseSubTotal = directPurchaseItems.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0,
  );

  const totalQuantity = formData.directPurchase
    ? directPurchaseTotalQuantity
    : selectedGrnDetails.reduce(
        (sum: number, item: any) =>
          sum + Number(item?.receivedQty || 0),
        0,
      );

  const totalAmount = formData.directPurchase
    ? Number(
        directPurchaseCalculation?.totalAmount ??
          directPurchaseSubTotal ??
          0,
      )
    : Number(selectedGrnMaster?.totalAmount || 0);

  const cgstAmount = formData.directPurchase
    ? Number(directPurchaseCalculation?.cgstAmt || 0)
    : Number(selectedGrnMaster?.cgstAmount || 0);

  const sgstAmount = formData.directPurchase
    ? Number(directPurchaseCalculation?.sgstAmt || 0)
    : Number(selectedGrnMaster?.sgstAmount || 0);

  const miscellaneousAmount = formData.directPurchase
    ? Number(directPurchaseCalculation?.miscTotalAmount || 0)
    : Number(selectedGrnMaster?.missChargeAmount || 0);

  const grandTotal = formData.directPurchase
    ? Number(
        directPurchaseCalculation?.grandTotal ??
          directPurchaseSubTotal ??
          0,
      )
    : Number(selectedGrnMaster?.netAmount || 0);

  /* =========================
      SAVE
  ========================= */

  const handleSave = () => {
    if (!formData.store) {
      toast.error("Please select store");
      return;
    }

    if (!formData.billNo.trim()) {
      toast.error("Please enter bill number");
      return;
    }

    if (!formData.supplier.trim()) {
      toast.error("Please enter supplier");
      return;
    }

    if (formData.directIssue && !formData.departmentCode.trim()) {
      toast.error("Please enter department");
      return;
    }

    if (!formData.directPurchase && !formData.orderNo) {
      toast.error("Please select Order No.");
      return;
    }

    if (formData.directPurchase && directPurchaseItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    if (!formData.directPurchase && !selectedGrnData) {
      toast.error("Please load GRN details");
      return;
    }

    console.log("Item Purchase Header:", {
      ...formData,
      departmentCode: formData.departmentCode,
      departmentName: formData.departmentName,
    });

    console.log("Selected GRN Data:", purchaseGoodsReceivedData);
    console.log("Direct Purchase Items:", directPurchaseItems);
    console.log("Direct Purchase Calculation:", directPurchaseCalculation);

    toast.success("Item Purchase details saved");
  };

  /* =========================
      BACK
  ========================= */

  const handleBack = () => {
    setFormData((prev) => ({
      ...prev,
      orderNo: "",
    }));

    setPurchaseGoodsReceivedData(null);
    setDirectPurchaseItems([]);
    setDirectPurchaseCalculation(null);
    resetDirectPurchaseItemForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:px-6">
      {apiLoadingCount > 0 && <Loader />}

      <Header />

      <div className="mx-auto w-full max-w-[1600px]">
        {/* =========================
            PAGE TITLE
        ========================= */}

        <div className="mb-5 mt-2">
          <h1 className="text-2xl font-bold leading-tight text-gray-800">
            Item Purchase
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Enter required detail for purchase
          </p>
        </div>

        {/* =========================
            MAIN CARD
        ========================= */}

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
          {/* =========================
              ITEM PURCHASE HEADER
          ========================= */}

          <section className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Item Purchase
                </h2>
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* STORE */}

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

                {/* TRANSACTION NO */}

                <div className="min-w-0">
                  <label className={labelClass}>Trans No.</label>

                  <input
                    type="text"
                    value={formData.transactionNo}
                    disabled
                    className={`${inputClass} cursor-not-allowed bg-gray-100`}
                  />
                </div>

                {/* BILL NO */}

                <div className="min-w-0">
                  <label className={labelClass}>Bill No.</label>

                  <input
                    type="text"
                    value={formData.billNo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        billNo: e.target.value,
                      }))
                    }
                    placeholder="Bill No."
                    className={inputClass}
                  />
                </div>

                {/* DATE */}

                <div className="min-w-0">
                  <label className={labelClass}>Date</label>

                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      const newDate = e.target.value;

                      setFormData((prev) => ({
                        ...prev,
                        date: newDate,
                      }));

                      if (formData.directPurchase) {
                        setExpiryDate(
                          calculateExpiryDate(
                            newDate,
                            Number(noOfDays || 0),
                          ),
                        );
                      }
                    }}
                    className={inputClass}
                  />
                </div>

                {/* ORDER NO */}

                {/* ORDER NO */}

                {!formData.directPurchase && (
                  <div className="min-w-0">
                    <label className={labelClass}>Order No.</label>

                    <select
                      value={formData.orderNo}
                      onChange={handleGrnChange}
                      disabled={loadingGrnList}
                      className={`${inputClass} ${
                        loadingGrnList ? "cursor-not-allowed bg-gray-100" : ""
                      }`}
                    >
                      <option value="">
                        {loadingGrnList ? "Loading GRN..." : "Select GRN No."}
                      </option>

                      {grnList.map((grnNo, index) => (
                        <option key={`${grnNo}-${index}`} value={grnNo}>
                          {grnNo}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {/* SUPPLIER */}

                <div className="min-w-0">
                  <label className={labelClass}>Supplier</label>

                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        supplier: e.target.value,
                      }))
                    }
                    disabled
                    placeholder="Supplier"
                    className={inputClass}
                  />
                </div>

                {/* DEPARTMENT */}

                {/* DEPARTMENT */}

                {formData.directIssue && (
                  <div className="min-w-0">
                    <label className={labelClass}>Department</label>

                    <select
                      value={formData.departmentCode}
                      onChange={(e) => {
                        const selectedCode = e.target.value;

                        const selectedDepartment = departmentList.find(
                          (dept: any) =>
                            String(dept?.depCode) === selectedCode
                        );

                        setFormData((prev) => ({
                          ...prev,
                          departmentCode: selectedCode,
                          departmentName:
                            selectedDepartment?.depName ?? "",
                        }));
                      }}
                      disabled={loadingDepartments}
                      className={`${inputClass} ${
                        loadingDepartments
                          ? "cursor-not-allowed bg-gray-100"
                          : ""
                      }`}
                    >
                      <option value="">
                        {loadingDepartments
                          ? "Loading Departments..."
                          : "Select Department"}
                      </option>

                      {departmentList.map((dept: any) => (
                        <option
                          key={dept.depCode}
                          value={dept.depCode}
                        >
                          {dept.depName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex min-h-10 items-center gap-6 lg:col-span-2 mt-2">
                <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm font-medium text-gray-700">
                <input
  type="checkbox"
checked={formData.directPurchase}
onChange={(e) => {
  const checked = e.target.checked;

  setFormData((prev) => ({
    ...prev,
    directPurchase: checked,
    orderNo: checked ? "" : prev.orderNo,
    billNo: checked ? "" : prev.billNo,
    supplier: checked ? "Direct Purchase" : "",
  }));

  setPurchaseGoodsReceivedData(null);

  if (!checked) {
    setDirectPurchaseItems([]);
    setDirectPurchaseCalculation(null);
    resetDirectPurchaseItemForm();
  }
}}
  className="h-4 w-4 rounded border-gray-300"
/>
                  <span>Direct Purchase</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.directIssue}
                    onChange={(e) => {
                      const checked = e.target.checked;

                      setFormData((prev) => ({
                        ...prev,
                        directIssue: checked,
                        departmentCode: checked
                          ? prev.departmentCode
                          : "",
                        departmentName: checked
                          ? prev.departmentName
                          : "",
                      }));
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />

                  <span>Direct Issue</span>
                </label>
              </div>
            </div>
          </section>

          {/* =========================
              DIRECT PURCHASE ITEM ENTRY
          ========================= */}

       {/* DIRECT PURCHASE DETAILS - SHOW ONLY FOR DIRECT PURCHASE */}
       {formData.directPurchase && (
       <>
              {showUnitConversion && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 p-4">
                  <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">
                          Unit Conversion
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Optional conversion for {name || "this item"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowUnitConversion(false)}
                        className="rounded-md px-2 py-1 text-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>

                    <div className="p-5">
                      <label className={labelClass}>Select Conversion</label>

                      <select
                        value={
                          unitConversions.find(
                            (conversion) =>
                              Number(conversion.qty) ===
                                Number(selectedUnitQty) &&
                              conversion.unitName !== unit,
                          )?.unitCode || ""
                        }
                        onChange={(e) => {
                          const selected = unitConversions.find(
                            (conversion) =>
                              conversion.unitCode === Number(e.target.value),
                          );

                          setSelectedUnitQty(
                            selected ? Number(selected.qty) : 0,
                          );
                        }}
                        className={inputClass}
                        disabled={loadingUnitConversions}
                      >
                        <option value="">
                          {loadingUnitConversions
                            ? "Loading conversions..."
                            : "No conversion"}
                        </option>

                        {unitConversions
                          .filter(
                            (conversion) => conversion.unitName !== unit,
                          )
                          .map((conversion) => (
                            <option
                              key={conversion.unitCode}
                              value={conversion.unitCode}
                            >
                              {conversion.unitName} ({conversion.qty})
                            </option>
                          ))}
                      </select>

                      <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                        {selectedUnitQty > 0 ? (
                          <>
                            <span className="font-semibold">
                              {unitConversions.find(
                                (conversion) =>
                                  Number(conversion.qty) ===
                                    Number(selectedUnitQty) &&
                                  conversion.unitName !== unit,
                              )?.unitName || "Conversion"}
                            </span>{" "}
                            = {selectedUnitQty} {unit || "base units"}
                          </>
                        ) : (
                          <>No conversion selected. Quantity is used as entered.</>
                        )}
                      </div>

                      <div className="mt-5 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUnitQty(0);
                            setShowUnitConversion(false);
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          No Conversion
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowUnitConversion(false)}
                          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <section className="relative z-50 mt-6 mb-6 overflow-visible rounded-xl border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <h3 className="text-base font-semibold text-gray-800">
                    Direct Purchase Details
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Select an item, enter quantity, unit conversion and rate
                  </p>
                </div>

                <div className="p-4 md:p-5">
                  <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-12">
                    <div className="relative col-span-1 sm:col-span-2 lg:col-span-4">
                      <label className={`${labelClass} h-[18px]`}>Item</label>

                      <input
                        value={itemSearch}
                        onChange={(e) =>
                          handleDirectPurchaseItemSearchChange(e.target.value)
                        }
                        onFocus={() => setShowItemDropdown(true)}
                        onBlur={() =>
                          setTimeout(
                            () => setShowItemDropdown(false),
                            150,
                          )
                        }
                        placeholder={
                          loadingInventoryItems
                            ? "Loading items..."
                            : "Search code or item name"
                        }
                        disabled={loadingInventoryItems || !formData.store}
                        className={`${inputClass} ${
                          loadingInventoryItems || !formData.store
                            ? "cursor-not-allowed bg-gray-100"
                            : ""
                        }`}
                      />

                      {showItemDropdown && formData.store && (
                        <div className="absolute left-0 right-0 top-full z-[9999] mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                          {filteredDirectPurchaseItems.length === 0 ? (
                            <div className="px-3 py-4 text-center text-sm text-gray-500">
                              No items found
                            </div>
                          ) : (
                            filteredDirectPurchaseItems.map((item) => (
                              <button
                                type="button"
                                key={item.itemCode}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() =>
                                  handleDirectPurchaseItemSelect(item)
                                }
                                className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-blue-50"
                              >
                                <span className="font-medium text-gray-800">
                                  {item.itemCode} - {item.itemName}
                                </span>
                                <span className="shrink-0 text-xs text-gray-500">
                                  {item.unitName}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                      <label className={`${labelClass} h-[18px]`}>Unit</label>

                      <input
                        value={unit}
                        readOnly
                        placeholder="Unit"
                        className={`${inputClass} cursor-not-allowed bg-gray-100`}
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                      <button
                        type="button"
                        onClick={() => setShowUnitConversion(true)}
                        disabled={!code}
                        className={`mt-1 text-xs font-medium hover:underline ${
                          !code
                            ? "cursor-not-allowed text-gray-400"
                            : "text-blue-600 hover:text-blue-800"
                        }`}
                      >
                        Unit Conversion
                      </button>

                      <label className={`${labelClass} h-[18px]`}>Qty</label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        placeholder="Qty"
                        className={`${inputClass} text-right`}
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                      <label className={`${labelClass} h-[18px]`}>Rate</label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        placeholder="Rate"
                        className={`${inputClass} text-right`}
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                      <label className={`${labelClass} h-[18px]`}>
                        No. of Days
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={noOfDays}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNoOfDays(value);

                          const days = Number(value || 0);
                          setExpiryDate(
                            calculateExpiryDate(formData.date, days),
                          );
                        }}
                        placeholder="No. of Days"
                        className={`${inputClass} text-right`}
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                      <label className={`${labelClass} h-[18px]`}>
                        Expiry Date
                      </label>

                      <input
                        type="date"
                        value={expiryDate}
                        readOnly
                        className={`${inputClass} cursor-not-allowed bg-gray-100`}
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                      <button
                        type="button"
                        onClick={handleAddDirectPurchaseItem}
                        className="h-10 w-full whitespace-nowrap rounded-lg bg-green-600 px-2 text-sm font-semibold text-white transition hover:bg-green-700"
                      >
                        {editingDirectPurchaseItemIndex !== null
                          ? "Update"
                          : "+ Add"}
                      </button>
                    </div>

                    {editingDirectPurchaseItemIndex !== null && (
                      <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                        <button
                          type="button"
                          onClick={resetDirectPurchaseItemForm}
                          className="h-10 w-full whitespace-nowrap rounded-lg border border-gray-300 bg-white px-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </section>
       </>

       )}

          {/* =========================
              PURCHASE DETAILS TABLE
          ========================= */}

            <section className="mt-6 overflow-hidden rounded-xl border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h2 className="text-base font-semibold text-gray-800">
                  Purchase Details
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Item details for selected GRN
                </p>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1100px] text-sm">
                  <thead className="bg-gray-100">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        S.No.
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Item Code
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Item Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Unit
                      </th>

                  
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                      Qty  
                      </th>

                

                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        Rate
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        Total
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        No. of Days
                      </th>

                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                        Expiry Date
                      </th>

                      {formData.directPurchase && (
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {formData.directPurchase ? (
                      directPurchaseItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={formData.directPurchase ? 10 : 9}
                            className="px-4 py-10 text-center text-sm text-gray-400"
                          >
                            No items added to this purchase
                          </td>
                        </tr>
                      ) : (
                        directPurchaseItems.map((item, index) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                              {index + 1}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-700">
                              {item.code}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">
                              {item.name}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                              {item.unit || "-"}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-800">
                              {Number(item.qty || 0).toFixed(2)}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                              ₹ {Number(item.rate || 0).toFixed(2)}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-800">
                              ₹ {Number(item.total || 0).toFixed(2)}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-800">
                              {Number(item.noOfDays || 0)}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">
                              {item.expiryDate || formData.date}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditDirectPurchaseItem(index)
                                  }
                                  className="rounded-md border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveDirectPurchaseItem(index)
                                  }
                                  className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      selectedGrnDetails.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-4 py-10 text-center text-sm text-gray-400"
                          >
                            No purchase details available
                          </td>
                        </tr>
                      ) : (
                        selectedGrnDetails.map((item: any, index: number) => (
                          <tr
                            key={`${item.itemCode}-${item.rno}-${index}`}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                              {index + 1}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-700">
                              {item.itemCode}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">
                              {item.itemName}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                              {item.unit || "-"}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-800">
                              {Number(item.receivedQty || 0).toFixed(2)}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                              ₹ {Number(item.poItemRate || 0).toFixed(2)}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-800">
                              ₹ {Number(item.receivedQtyTotal || 0).toFixed(2)}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-800">
                              0
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">
                              {formData.date}
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
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
                    <span className="text-gray-600">Total Quantity</span>

                    <span className="min-w-[120px] text-right font-medium text-gray-800">
                      {totalQuantity.toFixed(2)}
                    </span>
                  </div>

                  {/* TOTAL AMOUNT */}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">Total Amount</span>

                    <span className="min-w-[120px] text-right font-medium text-gray-800">
                      ₹ {totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* CGST */}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">CGST</span>

                    <span className="min-w-[120px] text-right font-medium text-gray-800">
                      ₹ {cgstAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* SGST */}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">SGST</span>

                    <span className="min-w-[120px] text-right font-medium text-gray-800">
                      ₹ {sgstAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* MISCELLANEOUS */}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">Miscellaneous</span>

                    <span className="min-w-[120px] text-right font-medium text-gray-800">
                      ₹ {miscellaneousAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* GRAND TOTAL */}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-base font-bold text-gray-800">
                        Grand Total
                      </span>

                      <span className="min-w-[120px] text-right text-lg font-bold text-blue-600">
                        ₹ {grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          

          {/* =========================
              BACK + SAVE BUTTONS
          ========================= */}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleBack}
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

export default ItemPurchase;