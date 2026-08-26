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
  createPurchaseOrder,
  printPurchaseOrder,
  getInventoryUnitConversionList,
  createPurchaseOrderApproval,
  getPurchaseOrderApprovalPrint,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import { useLocation, useNavigate } from "react-router-dom";

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
  unitCode: number;
  // Unit conversion quantity
  // Example: 1 box = 30
  unitQty: number;

  // Quantity entered by user
  // Example: user enters 2
  enteredQty: number;

  // Actual quantity used for calculation
  // Example: 2 × 30 = 60
  qty: number;

  rate: number;
  total: number;
  taxName: string;
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
  const navigate = useNavigate();
  const location = useLocation();

  const editPurchaseOrder = location.state?.editPurchaseOrder;

  console.log("Received Edit Purchase Order:", editPurchaseOrder);
  /* =========================
      FORM STATE
  ========================= */

  const [orderNo, setOrderNo] = useState("");

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  /* =========================
      SUPPLIER
  ========================= */

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [selectedUnitQty, setSelectedUnitQty] = useState(0);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  /* =========================
      STORE
  ========================= */

  const [store, setStore] = useState<Store | null>(null);

  const [stores, setStores] = useState<Store[]>([]);

  const [loadingStores, setLoadingStores] = useState(false);

  /* =========================
      GLOBAL API LOADER
  ========================= */

  const [apiLoadingCount, setApiLoadingCount] = useState(0);

  const startApiLoading = () => {
    setApiLoadingCount((count) => count + 1);
  };

  const stopApiLoading = () => {
    setApiLoadingCount((count) => Math.max(0, count - 1));
  };

  /* =========================
      OTHER FORM FIELDS
  ========================= */

  const [orderedBy, setOrderedBy] = useState("");
  const [approved, setapproved] = useState("");
  const [instruction, setInstruction] = useState("");

  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [effectiveTo, setEffectiveTo] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [remarks, setRemarks] = useState("");

  /* =========================
      DETAIL INPUT
  ========================= */
  const [taxName, setTaxName] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [unitCode, setUnitCode] = useState<number>(0);
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");

  /* =========================
      INVENTORY ITEM STATE
  ========================= */

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const [loadingInventoryItems, setLoadingInventoryItems] = useState(false);

  const [itemSearch, setItemSearch] = useState("");

  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  /* =========================
      PURCHASE ITEMS
  ========================= */

  const [items, setItems] = useState<PurchaseItem[]>([]);

  const [calculationResponse, setCalculationResponse] = useState<any>(null);

  /* =========================
      MISCELLANEOUS
  ========================= */

  const [miscList, setMiscList] = useState<InventoryMisc[]>([]);

  const [loadingMiscList, setLoadingMiscList] = useState(false);

  const [miscRows, setMiscRows] = useState<MiscRow[]>([]);
  const [miscChargeId, setMiscChargeId] = useState("");
  const [miscAmount, setMiscAmount] = useState("");
  const [isApprovalPrint, setIsApprovalPrint] = useState(false);
  /* =========================
      FETCH NEXT ORDER CODE
  ========================= */
  const [printData, setPrintData] = useState<any>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const [unitConversions, setUnitConversions] = useState<
    InventoryUnitConversion[]
  >([]);

  const [_loadingUnitConversions, setLoadingUnitConversions] = useState(false);

  const [showUnitConversion, setShowUnitConversion] = useState(false);
  const fetchNextCode = async () => {
    startApiLoading();

    try {
      const res = await getNextIdCode({
        tableName: "PurchaseOrderMaster",
        columnName: "PONo",
        conditionName: "Branch_Code",
        branch: appData?.user?.branch_code,
      });

      console.log("Next Order No Response:", res);

      if (res?.success) {
        setOrderNo(res.data.toString());
      }
    } catch (err) {
      console.error("Error fetching order no", err);
    } finally {
      stopApiLoading();
    }
  };

  /* =========================
      FETCH SUPPLIERS
  ========================= */
  const fetchInventoryUnitConversions = async () => {
    const branch = appData?.user?.branch_code || "";

    if (!branch) {
      setUnitConversions([]);
      return;
    }

    startApiLoading();

    try {
      setLoadingUnitConversions(true);

      const res = await getInventoryUnitConversionList(branch);

      console.log("Inventory Unit Conversion Response:", res);

      if (res?.success) {
        setUnitConversions(
          (res?.data || []).filter(
            (unit: InventoryUnitConversion) => unit.isActive,
          ),
        );
      } else {
        setUnitConversions([]);

        console.error(res?.message || "Failed to fetch unit conversions");
      }
    } catch (error) {
      console.error("Error fetching unit conversions:", error);

      setUnitConversions([]);
    } finally {
      setLoadingUnitConversions(false);
      stopApiLoading();
    }
  };
  const fetchSuppliers = async () => {
    startApiLoading();

    try {
      setLoadingSuppliers(true);

      const res = await getSupplierList(appData?.user?.branch_code);

      if (res?.success) {
        setSuppliers(res?.data || []);
      } else {
        setSuppliers([]);

        console.error(res?.message || "Failed to fetch suppliers");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);

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

      const res = await getStoreMasterList(appData?.user?.branch_code);

      if (res?.success) {
        setStores(res?.data || []);
      } else {
        setStores([]);

        console.error(res?.message || "Failed to fetch stores");
      }
    } catch (error) {
      console.error("Error fetching store master list:", error);

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

      const res = await getItemStoreListByStoreId(
        appData?.user?.branch_code,
        String(store.storeId),
      );

      if (res?.success) {
        setInventoryItems(res?.data || []);
      } else {
        setInventoryItems([]);

        console.error(res?.message || "Failed to fetch inventory items");
      }
    } catch (error) {
      console.error("Error fetching inventory item store list:", error);

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
    const branch = appData?.user?.branch_code || "";

    if (!branch) {
      setMiscList([]);
      return;
    }

    startApiLoading();

    try {
      setLoadingMiscList(true);

      const res = await getInventoryMiscList(branch);

      console.log("Inventory Miscellaneous Response:", res);

      if (res?.success) {
        setMiscList(res?.data || []);
      } else {
        setMiscList([]);

        console.error(res?.message || "Failed to fetch miscellaneous charges");
      }
    } catch (error) {
      console.error("Error fetching miscellaneous charges:", error);

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
    if (!appData?.user?.branch_code) return;

    fetchSuppliers();
    fetchStores();
    fetchInventoryMiscList();
    fetchInventoryUnitConversions();

    // Only generate a new PO number for CREATE mode.
    // In EDIT mode, use the existing PO number from editPurchaseOrder.master.poNo.
    if (!editPurchaseOrder) {
      fetchNextCode();
    }
  }, [appData?.user?.branch_code, editPurchaseOrder]);
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

  const filteredInventoryItems = inventoryItems.filter((item) => {
    const search = itemSearch.trim().toLowerCase();

    if (!search) return true;

    return (
      item.itemCode.toString().toLowerCase().includes(search) ||
      item.itemName.toLowerCase().includes(search)
    );
  });

  /* =========================
      SELECT INVENTORY ITEM
  ========================= */

  const handleInventoryItemSelect = (item: InventoryItem) => {
    const existingItem = items.find(
      (orderItem, index) =>
        orderItem.code === item.itemCode.toString() && index !== editingItemId,
    );

    if (existingItem) {
      toast.error(`${item.itemName} is already added to the order`);

      return;
    }

    setCode(item.itemCode.toString());
    setName(item.itemName);

    // Unit always comes from the selected inventory item.
    // It is shown as read-only in the main entry row.
    setUnit(item.unitName || "");
    setUnitCode(Number(item.unitCode || 0));
    // Unit conversion is optional.
    setSelectedUnitQty(0);
    setShowUnitConversion(false);

    // User will manually enter Rate
    setRate(String(item.itemRate));

    setTaxName(item.taxName || "");

    setItemSearch(`${item.itemCode} - ${item.itemName}`);

    setShowItemDropdown(false);
  };

  /* =========================
      ITEM SEARCH CHANGE
  ========================= */

  const handleItemSearchChange = (value: string) => {
    setItemSearch(value);
    setShowItemDropdown(true);

    if (!value.trim()) {
      setCode("");
      setName("");
      setUnit("");
      setSelectedUnitQty(0);
      setRate("");
    }
  };

  /* =========================
      NEW ENTRY
  ========================= */

  /* =========================
      SUPPLIER CHANGE
  ========================= */

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supCode = Number(e.target.value);

    if (!supCode) {
      setSupplier(null);
      return;
    }

    const selectedSupplier = suppliers.find((item) => item.supCode === supCode);

    setSupplier(selectedSupplier || null);
  };

  /* =========================
      STORE CHANGE
  ========================= */

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storeId = Number(e.target.value);

    if (!storeId) {
      setStore(null);
      return;
    }

    const selectedStore = stores.find((item) => item.storeId === storeId);

    setStore(selectedStore || null);
  };

  /* =========================
      ADD / UPDATE ITEM
  ========================= */
  const handleAddItem = async () => {
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

    if (!enteredQty || enteredQty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!itemRate || itemRate <= 0) {
      toast.error("Please enter a valid rate");
      return;
    }

    // Unit conversion is optional.
    // Without conversion:
    //   enteredQty = 1.5 -> actualQty = 1.5
    //
    // With conversion:
    //   enteredQty = 2, conversionQty = 30
    //   actualQty = 2 × 30 = 60
    const actualQty =
      conversionQty > 0 ? enteredQty * conversionQty : enteredQty;

    const newItem: PurchaseItem = {
      id: editingItemId !== null ? items[editingItemId].id : Date.now(),

      code,
      name,
      unit,
      unitCode: Number(unitCode || 0),
      // Unit conversion
      unitQty: conversionQty,

      // Quantity entered by user
      enteredQty: enteredQty,

      // Actual quantity used for calculation
      qty: actualQty,

      // Manually entered rate
      rate: itemRate,

      // Actual quantity × rate
      total: actualQty * itemRate,

      taxName,
    };

    let nextItems: PurchaseItem[];

    if (editingItemId !== null) {
      nextItems = items.map((item, index) =>
        index === editingItemId ? newItem : item,
      );
    } else {
      nextItems = [...items, newItem];
    }

    setItems(nextItems);

    // Recalculate using actual quantity
    await calculatePurchaseOrder(nextItems);

    // Clear form after add/update
    setEditingItemId(null);
    setCode("");
    setName("");
    setUnit("");
    setSelectedUnitQty(0);
    setQty("");
    setRate("");
    setTaxName("");
    setItemSearch("");
  };
  /* =========================
      CANCEL ITEM EDIT
  ========================= */

  const cancelEditItem = () => {
    setEditingItemId(null);

    setCode("");
    setName("");
    setUnit("");
    setSelectedUnitQty(0);
    setQty("");
    setRate("");

    setItemSearch("");
    setShowItemDropdown(false);
  };

  /* =========================
      EDIT ITEM
  ========================= */

  const handleEditItem = (index: number) => {
    const item = items[index];

    if (!item) return;

    setEditingItemId(index);

    // Restore item
    setCode(item.code);
    setName(item.name);

    // Restore selected unit
    setUnit(item.unit);

    // IMPORTANT:
    // Show the quantity user originally entered,
    // NOT the converted/actual quantity.
    setQty(item.enteredQty.toString());

    // Restore unit conversion
    setSelectedUnitQty(Number(item.unitQty) > 0 ? Number(item.unitQty) : 0);

    setShowUnitConversion(false);

    // Restore manually entered rate
    setRate(item.rate.toString());

    // Restore tax
    setTaxName(item.taxName);

    // Restore item search display
    setItemSearch(`${item.code} - ${item.name}`);

    // Optional: scroll back to item entry section
  };

  /* =========================
      REMOVE ITEM
  ========================= */

  const handleRemoveItem = (index: number) => {
    const item = items[index];

    const nextItems = items.filter((_, itemIndex) => itemIndex !== index);

    setItems(nextItems);

    if (editingItemId === index) {
      cancelEditItem();
    }

    toast.success(`${item?.name || "Item"} removed`);
  };

  /* =========================
      PURCHASE ORDER CALCULATION
  ========================= */

  const calculatePurchaseOrder = async (
    nextItems: PurchaseItem[],
    nextMiscRows: MiscRow[] = miscRows,
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
        unitCode: Number(item.unitCode || 0),
        poItemSuplyQty: Number(item.qty),
        cpoItemQty: Number(item.qty),
      })),

      // ✅ ALL miscellaneous charges
      poMiscDetail: nextMiscRows.map((row) => {
        const selectedCharge = miscList.find(
          (charge) => charge.chargeId === row.chargeId,
        );

        return {
          miscCharge: Number(row.amount || 0),
          miscChargeCode: Number(row.chargeId || 0),
          miscTaxCode: String(selectedCharge?.taxCode ?? ""),
        };
      }),
    };

    console.log("Purchase Order Calculation Payload:", payload);

    const calculationRes = await purchaseOrderCalculation(payload);

    console.log("Purchase Order Calculation Response:", calculationRes);

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
      (charge) => charge.chargeId === Number(miscChargeId),
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

    const nextMiscRows = [...miscRows, newRow];

    setMiscRows(nextMiscRows);

    // Call purchaseOrderCalculation immediately when Misc is added.
    // The API receives the selected Misc amount, charge code and tax code.
    startApiLoading();

    try {
      await calculatePurchaseOrder(items, nextMiscRows);
      toast.success("Miscellaneous charge added");
    } catch (error) {
      console.error(
        "Error calculating purchase order with miscellaneous charge:",
        error,
      );

      toast.error("Miscellaneous charge added, but calculation failed");
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
    const nextMiscRows = miscRows.filter((row) => row.id !== id);

    setMiscRows(nextMiscRows);

    // Recalculate after removing a Misc charge.
    startApiLoading();

    try {
      // const lastMisc =
      //   nextMiscRows[nextMiscRows.length - 1];

      await calculatePurchaseOrder(items, nextMiscRows);
      toast.success("Miscellaneous charge removed");
    } catch (error) {
      console.error(
        "Error recalculating purchase order after removing miscellaneous charge:",
        error,
      );

      toast.error("Miscellaneous charge removed, but calculation failed");
    } finally {
      stopApiLoading();
    }
  };

  /* =========================
      MISC TOTAL
  ========================= */

  /* =========================
      SUB TOTAL
  ========================= */

  const subTotal = items.reduce((sum, item) => sum + item.total, 0);

  /* =========================
      GRAND TOTAL
  ========================= */

  const calculatedGrandTotal = Number(
    calculationResponse?.grandTotal ?? subTotal,
  );

  /* =========================
      SAVE
  ========================= */

  const handleSave = async () => {
    if (!supplier) {
      toast.error("Please select a supplier");
      return;
    }

    if (!store) {
      toast.error("Please select a store");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const invalidMisc = miscRows.some(
      (row) => !row.chargeId || !row.amount || row.amount <= 0,
    );

    if (invalidMisc) {
      toast.error(
        "Please select particular and enter valid amount for all miscellaneous charges",
      );
      return;
    }

    // Make sure calculation has been completed
    if (!calculationResponse) {
      toast.error("Please calculate the purchase order before saving");
      return;
    }

    startApiLoading();

    try {
      /*
       * =========================
       * MASTER
       * =========================
       */

      const master = {
        cgstAmount: calculationResponse?.cgstAmt,
        sgstAmount: calculationResponse?.sgstAmt,
        poNo: Number(orderNo || 0),

        poDate: new Date(date).toISOString(),

        supCode: Number(supplier.supCode),

        billed: "N",

        branch_Code: appData?.user?.branch_code || "",

        orderBy: orderedBy,

        effectiveFrom: new Date(effectiveFrom).toISOString(),

        effectiveTo: new Date(effectiveTo).toISOString(),

        instruction,

        remarks,

        totalAmount: Number(calculationResponse.totalAmount || 0),

        taxAmount: Number(calculationResponse.taxAmount || 0),

        missChargeAmount: Number(calculationResponse.miscTotalAmount || 0),

        grossAmount: Number(calculationResponse.grandTotal || 0),

        storeId: Number(store.storeId),

        status: "O",

        poValidDate: new Date(effectiveTo).toISOString(),

        deliverydate: new Date(effectiveTo).toISOString(),
      };

      /*
       * =========================
       * DETAILS
       * =========================
       */

      const details = items.map((item) => ({
        poNo: Number(orderNo || 0),

        itemCode: Number(item.code),

        poItemQty: Number(item.qty),

        poItemRate: Number(item.rate),

        branch_Code: appData?.user?.branch_code || "",

        unit: `${item.unit}`,
        unitCode: Number(item.unitCode || 0),

        poItemSuplyQty: 0,

        cpoItemQty: 0,

        aproovedBy: orderedBy || "",

        aproovedDate: new Date().toISOString(),
      }));

      /*
       * =========================
       * FINAL PAYLOAD
       *
       * calculationResponse contains:
       * totalAmount
       * totalQty
       * cgstPer
       * cgstAmt
       * sgstPer
       * sgstAmt
       * serviceChargePer
       * serviceCharge
       * taxAmount
       * grandTotal
       * discountPer
       * discount
       * discountIn
       * discountRemarks
       * roundOff
       * miscCharge
       * miscChargeCode
       * miscTaxCode
       * miscCGSTPer
       * miscCGSTAmt
       * miscSGSTPer
       * miscSGSTAmt
       * miscTaxAmount
       * miscTotalAmount
       * taxList
       * miscTaxList
       * =========================
       */
      const taxes = calculationResponse?.taxList || [];
      const miscellaneous = calculationResponse?.miscTaxList || [];
      const payload = {
        master,

        details,

        taxes,

        miscellaneous,
      };

      console.log("Create Purchase Order Payload:", payload);

      /*
       * =========================
       * SAVE API
       * =========================
       */

      const response = await createPurchaseOrder(payload);

      console.log("Create Purchase Order Response:", response);
      if (response?.success === false) {
        toast.error(response?.message || "Failed to save purchase order");
        return;
      }

      const createdPONo = Number(response?.data);

      console.log("Created PO No:", createdPONo);

      if (createdPONo) {
        try {
          const printResponse = await printPurchaseOrder(
            createdPONo,
            appData?.user?.branch_code || "",
          );

          console.log("Print Purchase Order Response:", printResponse);

          if (printResponse?.success) {
            setPrintData(printResponse.data);
            setIsApprovalPrint(false);
            setShowPrintPreview(true);
          } else {
            toast.error(
              printResponse?.message ||
                "Unable to get purchase order print data",
            );
          }
        } catch (printError) {
          console.error("Error getting purchase order print data:", printError);

          toast.error(
            "Purchase order saved, but print preview could not be loaded",
          );
        }
      }

      toast.success("Purchase Order saved successfully");
    } catch (error: any) {
      console.error("Error saving purchase order:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save purchase order",
      );
    } finally {
      stopApiLoading();
    }
  };

  /* =========================
      COMMON CLASSES
  ========================= */

  const inputClass =
    "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "mb-1.5 block text-xs font-semibold text-gray-600";
  const formatPrintDate = (date?: string) => {
    if (!date) return "-";

    const d = new Date(date);

    if (isNaN(d.getTime())) return "-";

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!editPurchaseOrder) return;

    const master = editPurchaseOrder?.master;

    if (master?.poNo !== undefined && master?.poNo !== null) {
      setOrderNo(String(master.poNo));
    }

    if (master?.poDate) {
      setDate(master.poDate.split("T")[0]);
    }

    if (master?.supCode && suppliers.length > 0) {
      const selectedSupplier = suppliers.find(
        (supplier) => Number(supplier.supCode) === Number(master.supCode),
      );

      if (selectedSupplier) {
        setSupplier(selectedSupplier);
      }
    }

    if (master?.storeId && stores.length > 0) {
      const selectedStore = stores.find(
        (store) => Number(store.storeId) === Number(master.storeId),
      );

      if (selectedStore) {
        setStore(selectedStore);
      }
    }

    if (master?.orderBy !== undefined) {
      setOrderedBy(master.orderBy || "");
    }
     if (master?.approvedBy !== undefined) {
      setapproved(master.approvedBy || "");
    }


    if (master?.effectiveFrom) {
      setEffectiveFrom(master.effectiveFrom.split("T")[0]);
    }

    if (master?.effectiveTo) {
      setEffectiveTo(master.effectiveTo.split("T")[0]);
    }

    if (master?.instruction !== undefined) {
      setInstruction(master.instruction || "");
    }

    if (master?.remarks !== undefined) {
      setRemarks(master.remarks || "");
    }
  }, [editPurchaseOrder, suppliers, stores]);

  useEffect(() => {
    if (!editPurchaseOrder) return;

    const details = editPurchaseOrder.details || [];
    const miscellaneous = editPurchaseOrder.miscellaneous || [];

    if (!inventoryItems.length) return;

    // =========================
    // ITEMS
    // =========================

    const mappedItems: PurchaseItem[] = details
      .map((detail: any, index: number) => {
        const selectedItem = inventoryItems.find(
          (item) => Number(item.itemCode) === Number(detail.itemCode),
        );

        if (!selectedItem) {
          console.warn("Item not found:", detail.itemCode);
          return null;
        }

        const qty = Number(detail.poItemQty || 0);

        const rate = Number(detail.poItemRate || 0);

        return {
          id: Date.now() + index,

          code: String(selectedItem.itemCode),
          name: selectedItem.itemName,

          unit: detail.unit,
          unitCode: Number(detail.unitCode || 0),

          unitQty: 0,
          enteredQty: qty,
          qty: qty,

          rate: rate,

          total: qty * rate,

          taxName: selectedItem.taxName || detail.taxName || "",

          taxPercent: 0,

          taxCode: Number(detail.taxCode || selectedItem.taxCode || 0),
        };
      })
      .filter((item: any): item is PurchaseItem => item !== null);

    // =========================
    // MISCELLANEOUS CHARGES
    // =========================

    const mappedMiscRows: MiscRow[] = miscellaneous.map(
      (charge: any, index: number) => ({
        id: Date.now() + 1000 + index,

        chargeId: Number(charge.chargeId || 0),

        chargeName: charge.chargeName || "",

        amount: Number(charge.chargeAmt || 0),
      }),
    );

    console.log("Edit PO Items:", mappedItems);

    console.log("Edit PO Miscellaneous:", mappedMiscRows);

    // Bind both directly to tables
    setItems(mappedItems);

    setMiscRows(mappedMiscRows);

    // Calculate using both
    calculatePurchaseOrder(mappedItems, mappedMiscRows);
  }, [editPurchaseOrder, inventoryItems]);

  const handleApprove = async () => {
    if (!supplier) {
      toast.error("Please select a supplier");
      return;
    }
    if(!approved){
       toast.error("Please select approved By");
       return
    }

    if (!store) {
      toast.error("Please select a store");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const invalidMisc = miscRows.some(
      (row) => !row.chargeId || !row.amount || row.amount <= 0,
    );

    if (invalidMisc) {
      toast.error(
        "Please select particular and enter valid amount for all miscellaneous charges",
      );
      return;
    }

    // Make sure calculation has been completed
    if (!calculationResponse) {
      toast.error("Please calculate the purchase order before saving");
      return;
    }

    startApiLoading();

    try {
      /*
       * =========================
       * MASTER
       * =========================
       */

      const master = {
        cgstAmount: calculationResponse?.cgstAmt,
        sgstAmount: calculationResponse?.sgstAmt,
        poNo: Number(orderNo || 0),

        poDate: new Date(date).toISOString(),

        supCode: Number(supplier.supCode),

        billed: "N",

        branch_Code: appData?.user?.branch_code || "",

        orderBy: orderedBy,

        effectiveFrom: new Date(effectiveFrom).toISOString(),

        effectiveTo: new Date(effectiveTo).toISOString(),

        instruction,

        remarks,

        totalAmount: Number(calculationResponse.totalAmount || 0),

        taxAmount: Number(calculationResponse.taxAmount || 0),

        missChargeAmount: Number(calculationResponse.miscTotalAmount || 0),

        grossAmount: Number(calculationResponse.grandTotal || 0),

        storeId: Number(store.storeId),

        status: "A",

        poValidDate: new Date(effectiveTo).toISOString(),

        deliverydate: new Date(effectiveTo).toISOString(),
           approvedBy: approved || "",
            aproovedDate: new Date().toISOString(),
      };

      /*
       * =========================
       * DETAILS
       * =========================
       */

      const details = items.map((item) => ({
        poNo: Number(orderNo || 0),

        itemCode: Number(item.code),

        poItemQty: Number(item.qty),

        poItemRate: Number(item.rate),
        approvedBy: approved || "",
        branch_Code: appData?.user?.branch_code || "",
        poOrderQty: Number(item.rate),
        unit: `${item.unit}`,
        unitCode: Number(item.unitCode || 0),

        poItemSuplyQty: 0,

        cpoItemQty: 0,

        aproovedBy: orderedBy || "",

        aproovedDate: new Date().toISOString(),
      }));

      /*
       * =========================
       * FINAL PAYLOAD
       *
       * calculationResponse contains:
       * totalAmount
       * totalQty
       * cgstPer
       * cgstAmt
       * sgstPer
       * sgstAmt
       * serviceChargePer
       * serviceCharge
       * taxAmount
       * grandTotal
       * discountPer
       * discount
       * discountIn
       * discountRemarks
       * roundOff
       * miscCharge
       * miscChargeCode
       * miscTaxCode
       * miscCGSTPer
       * miscCGSTAmt
       * miscSGSTPer
       * miscSGSTAmt
       * miscTaxAmount
       * miscTotalAmount
       * taxList
       * miscTaxList
       * =========================
       */
      const taxes = calculationResponse?.taxList || [];
      const miscellaneous = calculationResponse?.miscTaxList || [];
      const payload = {
        master,

        details,

        taxes,

        miscellaneous,
      };

      console.log("Create Purchase Order Payload:", payload);

      /*
       * =========================
       * SAVE API
       * =========================
       */

      const response = await createPurchaseOrderApproval(payload);

      console.log("Create Purchase Order Response:", response);
      if (response?.success === false) {
        toast.error(response?.message || "Failed to save purchase order");
        return;
      }

      const createdPONo = Number(editPurchaseOrder?.master?.poNo);

      console.log("Created PO No:", createdPONo);

      if (createdPONo) {
        try {
          const printResponse = await getPurchaseOrderApprovalPrint(
            createdPONo,
            appData?.user?.branch_code || "",
          );

          console.log("Print Purchase Order Response:", printResponse);

          if (printResponse?.success) {
            setPrintData(printResponse.data);
            setShowPrintPreview(true);
            setIsApprovalPrint(true);
          } else {
            toast.error(
              printResponse?.message ||
                "Unable to get purchase order print data",
            );
          }
        } catch (printError) {
          console.error("Error getting purchase order print data:", printError);

          toast.error(
            "Purchase order saved, but print preview could not be loaded",
          );
        }
      }

      toast.success("Purchase Order saved successfully");
    } catch (error: any) {
      console.error("Error saving purchase order:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save purchase order",
      );
    } finally {
      stopApiLoading();
    }
  };

  const handleReject = async () => {
    if (!supplier) {
      toast.error("Please select a supplier");
      return;
    }

    if (!store) {
      toast.error("Please select a store");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const invalidMisc = miscRows.some(
      (row) => !row.chargeId || !row.amount || row.amount <= 0,
    );

    if (invalidMisc) {
      toast.error(
        "Please select particular and enter valid amount for all miscellaneous charges",
      );
      return;
    }

    // Make sure calculation has been completed
    if (!calculationResponse) {
      toast.error("Please calculate the purchase order before saving");
      return;
    }

    startApiLoading();

    try {
      /*
       * =========================
       * MASTER
       * =========================
       */

      const master = {
        cgstAmount: calculationResponse?.cgstAmt,
        sgstAmount: calculationResponse?.sgstAmt,
        poNo: Number(orderNo || 0),

        poDate: new Date(date).toISOString(),

        supCode: Number(supplier.supCode),

        billed: "N",

        branch_Code: appData?.user?.branch_code || "",

        orderBy: orderedBy,

        effectiveFrom: new Date(effectiveFrom).toISOString(),

        effectiveTo: new Date(effectiveTo).toISOString(),

        instruction,

        remarks,

        totalAmount: Number(calculationResponse.totalAmount || 0),

        taxAmount: Number(calculationResponse.taxAmount || 0),

        missChargeAmount: Number(calculationResponse.miscTotalAmount || 0),

        grossAmount: Number(calculationResponse.grandTotal || 0),

        storeId: Number(store.storeId),

        status: "R",

        poValidDate: new Date(effectiveTo).toISOString(),

        deliverydate: new Date(effectiveTo).toISOString(),
      };

      /*
       * =========================
       * DETAILS
       * =========================
       */

      const details = items.map((item) => ({
        poNo: Number(orderNo || 0),

        itemCode: Number(item.code),

        poItemQty: Number(item.qty),

        poItemRate: Number(item.rate),
        approvedBy: appData?.user?.userName || "",
        branch_Code: appData?.user?.branch_code || "",

        unit: `${item.unit}`,
        unitCode: Number(item.unitCode || 0),

        poItemSuplyQty: 0,
        poOrderQty: Number(item.rate),
        cpoItemQty: 0,

        aproovedBy: orderedBy || "",

        aproovedDate: new Date().toISOString(),
      }));

      /*
       * =========================
       * FINAL PAYLOAD
       *
       * calculationResponse contains:
       * totalAmount
       * totalQty
       * cgstPer
       * cgstAmt
       * sgstPer
       * sgstAmt
       * serviceChargePer
       * serviceCharge
       * taxAmount
       * grandTotal
       * discountPer
       * discount
       * discountIn
       * discountRemarks
       * roundOff
       * miscCharge
       * miscChargeCode
       * miscTaxCode
       * miscCGSTPer
       * miscCGSTAmt
       * miscSGSTPer
       * miscSGSTAmt
       * miscTaxAmount
       * miscTotalAmount
       * taxList
       * miscTaxList
       * =========================
       */
      const taxes = calculationResponse?.taxList || [];
      const miscellaneous = calculationResponse?.miscTaxList || [];
      const payload = {
        master,

        details,

        taxes,

        miscellaneous,
      };

      console.log("Create Purchase Order Payload:", payload);

      /*
       * =========================
       * SAVE API
       * =========================
       */

      const response = await createPurchaseOrderApproval(payload);

      console.log("Create Purchase Order Response:", response);
      if (response?.success === false) {
        toast.error(response?.message || "Failed to save purchase order");
        return;
      }

      toast.success("Purchase Order saved successfully");
      navigate(-1);
    } catch (error: any) {
      console.error("Error saving purchase order:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save purchase order",
      );
    } finally {
      stopApiLoading();
    }
  };

  return (
    <>
      {/* =========================
        OPTIONAL UNIT CONVERSION
    ========================= */}
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
                      Number(conversion.qty) === Number(selectedUnitQty) &&
                      conversion.unitName !== unit,
                  )?.unitCode || ""
                }
                onChange={(e) => {
                  const selected = unitConversions.find(
                    (conversion) =>
                      conversion.unitCode === Number(e.target.value),
                  );

                  if (selected) {
                    setSelectedUnitQty(Number(selected.qty));
                    // setQty(String(selected.qty))
                  } else {
                    setSelectedUnitQty(0);
                  }
                }}
                className={inputClass}
              >
                <option value="">No conversion</option>

                {unitConversions
                  .filter((conversion) => conversion.unitName !== unit)
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
                          Number(conversion.qty) === Number(selectedUnitQty) &&
                          conversion.unitName !== unit,
                      )?.unitName || "conversion"}
                    </span>{" "}
                    = {selectedUnitQty} {unit || "base units"}
                  </>
                ) : (
                  <>
                    No conversion selected. Quantity will be used exactly as
                    entered.
                  </>
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

      {showPrintPreview && printData && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 p-4">
          <div className="mx-auto my-6 w-full max-w-[900px]">
            {/* =========================
          PREVIEW HEADER
      ========================= */}

            <div className="mb-3 flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-lg">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {isApprovalPrint
                    ? "Purchase Order Approval Preview"
                    : "Purchase Order Preview"}
                </h2>

                <p className="text-xs text-gray-500">
                  PO No: {printData.master?.poNo}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  🖨 Print
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>

            {/* =========================
          PRINT AREA
      ========================= */}

            <div
              id="purchase-order-print"
              className="bg-white px-10 py-8 text-[13px] text-gray-800 shadow-xl"
            >
              {/* COMPANY HEADER */}

              <div className="mb-5 text-center">
                <h1 className="text-xl font-bold tracking-wide">COGWAVE POS</h1>

                <div className="mt-1 text-xs leading-5 text-gray-600">
                  Basavanagudi
                  <br />
                  Bangalore - 560004
                  <br />
                  PH : 7338818178
                  <br />
                  Email : 0<br />
                  GST : -
                </div>
              </div>

              {/* TITLE */}

              <div className="mb-4 text-center">
                <h2 className="text-lg font-semibold text-red-600">
                  Purchase Order
                </h2>
              </div>

              {/* MASTER DETAILS */}

              <div className="grid grid-cols-2 border border-gray-800">
                {/* LEFT */}

                <div className="border-r border-gray-800 p-3">
                  <div className="mb-2">
                    <span className="font-semibold">Vendor:</span>{" "}
                    {printData.master?.vendorName || "-"}
                  </div>

                  <div className="mb-2">
                    <span className="font-semibold">Address:</span>{" "}
                    {printData.master?.vendorAddress || "-"}
                  </div>

                  <div className="mb-2">
                    <span className="font-semibold">Phone No:</span>{" "}
                    {printData.master?.phoneNo || "-"}
                  </div>

                  <div className="mb-2">
                    <span className="font-semibold">Mobile No:</span>{" "}
                    {printData.master?.mobileNo || "-"}
                  </div>

                  <div className="mb-2">
                    <span className="font-semibold">GST No:</span>{" "}
                    {printData.master?.gstNo || "-"}
                  </div>

                  <div>
                    <span className="font-semibold">State Code:</span>{" "}
                    {printData.master?.stateCode || "-"}
                  </div>
                </div>

                {/* RIGHT */}

                <div className="p-3">
                  <div className="mb-2">
                    <span className="font-semibold">PO No:</span>{" "}
                    {printData.master?.poNo || "-"}
                  </div>

                  <div className="mb-2">
                    <span className="font-semibold">PO Date:</span>{" "}
                    {formatPrintDate(printData.master?.poDate)}
                  </div>

                  <div className="mb-2">
                    <span className="font-semibold">Order By:</span>{" "}
                    {printData.master?.orderBy || "-"}
                  </div>

                  <div className="mb-2">
                    <span className="font-semibold">Effective From:</span>{" "}
                    {formatPrintDate(printData.master?.effectiveFrom)}
                  </div>

                  <div>
                    <span className="font-semibold">Effective To:</span>{" "}
                    {formatPrintDate(printData.master?.effectiveTo)}
                  </div>
                </div>
              </div>

              {isApprovalPrint && (
                <div className="mt-5 border border-gray-800">
                  <div className="bg-gray-200 px-3 py-2 font-semibold">
                    Approval Details
                  </div>

                  <div className="grid grid-cols-2">
                    <div className="border-r border-gray-800 p-3">
                      <span className="font-semibold">Approved By:</span>{" "}
                      {printData.details?.[0]?.approvedBy || "-"}
                    </div>

                    <div className="p-3">
                      <span className="font-semibold">Approved Date:</span>{" "}
                      {formatPrintDate(printData.details?.[0]?.approvedDate)}
                    </div>
                  </div>
                </div>
              )}
              {/* ITEMS */}

              <div className="mt-3 overflow-hidden border border-gray-800">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200 text-xs font-bold">
                      <th className="border border-gray-800 px-2 py-2 text-left">
                        Code
                      </th>

                      <th className="border border-gray-800 px-2 py-2 text-left">
                        Description
                      </th>

                      <th className="border border-gray-800 px-2 py-2 text-center">
                        Unit
                      </th>

                      <th className="border border-gray-800 px-2 py-2 text-right">
                        Rate
                      </th>

                      <th className="border border-gray-800 px-2 py-2 text-right">
                        Qty
                      </th>

                      {isApprovalPrint && (
                        <th className="border border-gray-800 px-2 py-2 text-right">
                          Approved Qty
                        </th>
                      )}

                      <th className="border border-gray-800 px-2 py-2 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {printData.details?.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-800 px-2 py-2">
                          {item.itemCode}
                        </td>

                        <td className="border border-gray-800 px-2 py-2">
                          {item.itemName}
                        </td>

                        <td className="border border-gray-800 px-2 py-2 text-center">
                          {item.unit}
                        </td>

                        <td className="border border-gray-800 px-2 py-2 text-right">
                          ₹ {Number(item.itemRate || 0).toFixed(2)}
                        </td>

                        <td className="border border-gray-800 px-2 py-2 text-right">
                          {item.itemQty}
                        </td>

                        {isApprovalPrint && (
                          <td className="border border-gray-800 px-2 py-2 text-right font-semibold">
                            {item.poOrderQty ?? 0}
                          </td>
                        )}

                        <td className="border border-gray-800 px-2 py-2 text-right font-medium">
                          ₹ {Number(item.total || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* SUMMARY */}

              <div className="mt-6 flex justify-end">
                <div className="w-[330px]">
                  <div className="flex justify-between border-b border-gray-300 py-2">
                    <span>Amount Before Tax</span>
                    <span>
                      ₹ {Number(printData.master?.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-300 py-2">
                    <span>Additional Tax</span>
                    <span>
                      ₹ {Number(printData.master?.tax || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-300 py-2">
                    <span>Misc Charges</span>
                    <span>
                      ₹{" "}
                      {Number(printData.master?.missChargeAmount || 0).toFixed(
                        2,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between border-b-2 border-gray-800 py-3 text-base font-bold">
                    <span>Final Amount</span>
                    <span>
                      ₹ {Number(printData.master?.grossAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {printData.termsMaster?.length > 0 && (
                <div className="mt-5 border-t border-gray-800 pt-3">
                  <h3 className="mb-2 font-semibold">Terms & Conditions</h3>

                  {printData.termsMaster.map((term: any, index: number) => (
                    <div key={index} className="mb-3">
                      <div className="font-semibold">{term.termsTitle}</div>

                      <div className="mt-1 whitespace-pre-line text-xs leading-5">
                        {term.termsDescription}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* INSTRUCTION */}

              <div className="mt-5 border-t border-gray-800 pt-2">
                <div className="font-semibold">Instruction</div>

                <div className="mt-1 min-h-[35px]">
                  {printData.master?.instruction || "-"}
                </div>
              </div>

              {/* REMARKS */}

              <div className="mt-3 border-t border-gray-300 pt-2">
                <div className="font-semibold">Remarks</div>

                <div className="mt-1 min-h-[35px]">
                  {printData.master?.remarks || "-"}
                </div>
              </div>

              {/* SIGNATURE SECTION */}

              <div className="mt-12 border-t border-gray-800 pt-6">
                <div className="grid grid-cols-4 gap-6 text-center">
                  {/* Prepared By */}
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-full border-b border-gray-800"></div>
                    <div className="mt-2 font-semibold text-sm">
                      Prepared By
                    </div>
                    <div className="mt-1 text-xs text-gray-500">Signature</div>
                  </div>

                  {/* Head of Department */}
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-full border-b border-gray-800"></div>
                    <div className="mt-2 font-semibold text-sm">
                      Head of Dept.
                    </div>
                    <div className="mt-1 text-xs text-gray-500">Signature</div>
                  </div>

                  {/* Finance */}
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-full border-b border-gray-800"></div>
                    <div className="mt-2 font-semibold text-sm">Finance</div>
                    <div className="mt-1 text-xs text-gray-500">Signature</div>
                  </div>

                  {/* AGM */}
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-full border-b border-gray-800"></div>
                    <div className="mt-2 font-semibold text-sm">AGM</div>
                    <div className="mt-1 text-xs text-gray-500">Signature</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:px-6">
        {apiLoadingCount > 0 && <Loader />}

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
              </div>

              <div className="p-4 md:p-5">
                <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* ORDER NO */}

                  <div>
                    <label className={`${labelClass} h-[18px]`}>
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
                    <label className={`${labelClass} h-[18px]`}>Date</label>

                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* SUPPLIER */}

                  <div>
                    <label className={`${labelClass} h-[18px]`}>Supplier</label>

                    <select
                      value={supplier?.supCode ?? ""}
                      onChange={handleSupplierChange}
                      disabled={loadingSuppliers}
                      className={`${inputClass} ${
                        loadingSuppliers ? "cursor-not-allowed bg-gray-100" : ""
                      }`}
                    >
                      <option value="">
                        {loadingSuppliers
                          ? "Loading suppliers..."
                          : "Select Supplier"}
                      </option>

                      {suppliers.map((item) => (
                        <option key={item.supCode} value={item.supCode}>
                          {item.supName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* STORE */}

                  <div>
                    <label className={`${labelClass} h-[18px]`}>Store</label>

                    <select
                      value={store?.storeId ?? ""}
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
                          {item.storeId} - {item.storeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ORDERED BY */}

                  <div>
                    <label className={`${labelClass} h-[18px]`}>
                      Ordered By
                    </label>

                    <input
                      type="text"
                      value={orderedBy}
                      onChange={(e) => setOrderedBy(e.target.value)}
                      placeholder="Enter ordered by"
                      className={inputClass}
                    />
                  </div>

                  {editPurchaseOrder && (
                    <div>
                      <label className={`${labelClass} h-[18px]`}>
                        Approved By
                      </label>

                      <input
                        type="text"
                        value={approved}
                        onChange={(e) => setapproved(e.target.value)}
                        placeholder="Enter Approved by"
                        className={inputClass}
                      />
                    </div>
                  )}

                  {/* EFFECTIVE FROM */}

                  <div>
                    <label className={`${labelClass} h-[18px]`}>
                      Effective From
                    </label>

                    <input
                      type="date"
                      value={effectiveFrom}
                      onChange={(e) => setEffectiveFrom(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* EFFECTIVE TO */}

                  <div>
                    <label className={`${labelClass} h-[18px]`}>
                      Effective To
                    </label>

                    <input
                      type="date"
                      value={effectiveTo}
                      onChange={(e) => setEffectiveTo(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* INSTRUCTION */}

                  <div className="sm:col-span-2">
                    <label className={`${labelClass} h-[18px]`}>
                      Instruction
                    </label>

                    <textarea
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      rows={2}
                      placeholder="Enter instruction"
                      className="min-h-[80px] w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* REMARKS */}

                  <div className="sm:col-span-2">
                    <label className={`${labelClass} h-[18px]`}>Remarks</label>

                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 items-end">
                  {/* ITEM - KEEP THIS LOGIC EXACTLY */}
                  {/* ITEM */}
                  <div className="relative col-span-1 sm:col-span-2 lg:col-span-4">
                    <label className={`${labelClass} h-[18px]`}>Item</label>

                    <input
                      value={itemSearch}
                      onChange={(e) => handleItemSearchChange(e.target.value)}
                      onFocus={() => setShowItemDropdown(true)}
                      onBlur={() => {
                        setTimeout(() => setShowItemDropdown(false), 150);
                      }}
                      placeholder={
                        loadingInventoryItems
                          ? "Loading items..."
                          : "Search code or item name"
                      }
                      disabled={loadingInventoryItems}
                      className={`${inputClass} ${
                        loadingInventoryItems
                          ? "cursor-not-allowed bg-gray-100"
                          : ""
                      }`}
                    />

                    {showItemDropdown && (
                      <div className="absolute left-0 right-0 top-full z-[9999] mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                        {filteredInventoryItems.length === 0 ? (
                          <div className="px-3 py-4 text-center text-sm text-gray-500">
                            No items found
                          </div>
                        ) : (
                          filteredInventoryItems.map((item) => (
                            <button
                              type="button"
                              key={item.itemCode}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleInventoryItemSelect(item)}
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

                  {/* CODE */}
                  <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                    <label className={`${labelClass} h-[18px]`}>Code</label>

                    <input
                      value={code}
                      disabled
                      placeholder="Code"
                      className={`${inputClass} w-full cursor-not-allowed bg-gray-100`}
                    />
                  </div>

                  {/* NAME */}
                  <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                    <label className={`${labelClass} h-[18px]`}>Name</label>

                    <input
                      value={name}
                      disabled
                      placeholder="Item Name"
                      className={`${inputClass} w-full cursor-not-allowed bg-gray-100`}
                    />
                  </div>

                  {/* UNIT */}
                  <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                    <label className={`${labelClass} h-[18px]`}>Unit</label>

                    <input
                      value={unit}
                      disabled
                      placeholder="Unit"
                      className={`${inputClass} w-full cursor-not-allowed bg-gray-100`}
                    />
                  </div>

                  {/* QTY */}
                  <div className="col-span-1 sm:col-span-1 lg:col-span-1">
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
                      className={`${inputClass} w-full text-right`}
                    />
                  </div>
                  {/* RATE */}
                  <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                    <label className={`${labelClass} h-[18px]`}>Rate</label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder="Rate"
                      className={`${inputClass} w-full text-right`}
                    />
                  </div>

                  {/* ADD */}
                  <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="h-10 w-full whitespace-nowrap rounded-lg bg-green-600 px-2 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      {editingItemId !== null ? "Update" : "+ Add"}
                    </button>
                  </div>
                </div>
              </div>

              {/* ITEM TABLE */}

              <div className="relative z-0 overflow-x-auto border-t border-gray-200">
                <table className="w-full min-w-[850px] text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-600">
                      <th className="px-4 py-3 text-left">Code</th>

                      <th className="px-4 py-3 text-left">Name</th>

                      <th className="px-4 py-3 text-left">Unit</th>

                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Tax Name</th>

                      <th className="px-4 py-3 text-right">Rate</th>

                      <th className="px-4 py-3 text-right">Total</th>

                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-sm text-gray-400"
                        >
                          No items added to this purchase order
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-t border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">{item.code}</td>

                          <td className="px-4 py-3 font-medium text-gray-800">
                            {item.name}
                          </td>

                          <td className="px-4 py-3">{item.unit}</td>

                          <td className="px-4 py-3 text-right">{item.qty}</td>

                          <td className="px-4 py-3 text-right">
                            {item.taxName}
                          </td>

                          <td className="px-4 py-3 text-right">
                            ₹ {item.rate.toFixed(2)}
                          </td>

                          <td className="px-4 py-3 text-right font-semibold">
                            ₹ {item.total.toFixed(2)}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleEditItem(index)}
                                className="rounded-md px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="rounded-md px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
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
                    <label className={labelClass}>Particular</label>

                    <select
                      value={miscChargeId}
                      onChange={(e) => setMiscChargeId(e.target.value)}
                      disabled={loadingMiscList}
                      className={`${inputClass} ${
                        loadingMiscList ? "cursor-not-allowed bg-gray-100" : ""
                      }`}
                    >
                      <option value="">
                        {loadingMiscList
                          ? "Loading charges..."
                          : "Select Particular"}
                      </option>

                      {miscList.map((charge) => (
                        <option key={charge.chargeId} value={charge.chargeId}>
                          {charge.chargeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* AMOUNT */}

                  <div className="sm:col-span-1 lg:col-span-4">
                    <label className={labelClass}>Amount</label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={miscAmount}
                      onChange={(e) => setMiscAmount(e.target.value)}
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
                        <th className="px-4 py-3 text-left">Particular</th>

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
                              onClick={() => removeMiscRow(row.id)}
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
                    <span className="text-gray-600">Total Quantity</span>

                    <span className="min-w-[110px] text-right font-medium text-gray-800">
                      {Number(
                        calculationResponse?.totalQty ??
                          items.reduce(
                            (sum, item) => sum + Number(item.qty || 0),
                            0,
                          ),
                      )}
                    </span>
                  </div>

                  {/* TOTAL AMOUNT */}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">Total Amount</span>

                    <span className="min-w-[110px] text-right font-medium text-gray-800">
                      ₹{" "}
                      {Number(
                        calculationResponse?.totalAmount ?? subTotal ?? 0,
                      ).toFixed(2)}
                    </span>
                  </div>

                  {/* CGST */}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">CGST</span>

                    <span className="min-w-[110px] text-right font-medium text-gray-800">
                      ₹ {Number(calculationResponse?.cgstAmt ?? 0).toFixed(2)}
                    </span>
                  </div>

                  {/* SGST */}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">SGST</span>

                    <span className="min-w-[110px] text-right font-medium text-gray-800">
                      ₹ {Number(calculationResponse?.sgstAmt ?? 0).toFixed(2)}
                    </span>
                  </div>

                  {/* MISCELLANEOUS */}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">Miscellaneous</span>

                    <span className="min-w-[110px] text-right font-medium text-gray-800">
                      ₹ {calculationResponse?.miscTotalAmount}
                    </span>
                  </div>

                  {/* GRAND TOTAL */}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-base font-bold text-gray-800">
                        Grand Total
                      </span>

                      <span className="min-w-[110px] text-right text-lg font-bold text-blue-600">
                        ₹ {calculatedGrandTotal.toFixed(2)}
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
                onClick={() => navigate(-1)}
                className="h-10 rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              {editPurchaseOrder ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="h-10 rounded-lg bg-green-600 px-6 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={handleReject}
                    className="h-10 rounded-lg bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  className="h-10 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Save Purchase Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchaseOrder;
