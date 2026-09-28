import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Loader from "../components/Loader";
import {
  getStoreMasterList,
  getDepartmentList,
  searchIndentOrder,
  getNextIdCode,
  getIndentOrderApprovalData,
  getInventoryItemStoreList,
  getItemDetailsIndentOrder,
  saveItemIssue,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

type Store = {
  storeId: number;
  storeName: string;
  storeLocation?: string;
  storeIncharge?: string;
  branch_Code?: string;
};

type ItemDetails = {
  itemCode: number;
  itemName: string;
  itemRate: number;
  availableQty: number;
  unitName: string;
  unitCode: number;
  mainUnit: string;
  mainUnitConverstion: string;
};

type IssueItem = ItemDetails & {
  id: number;
  pNo: number;
  ioNo: number;
  approvedQty: number;
  issueQty: number;
  branchCode: string;
  stockSource: string;
  stockReferenceNo: number;
  reamingQty: number;
  stockRows: {
    pNo: number;
    approvedQty: number;
    issueQty: number;
    stockSource: string;
    stockReferenceNo: number;
    reamingQty: number;
  }[];
};

const ItemIssue: React.FC = () => {
  const { appData } = useAppContext();
  const branch = appData?.user?.branch_code;
  const navigate = useNavigate();

  const [directIssue, setDirectIssue] = useState(false);

  const [formData, setFormData] = useState({
    transNo: "",
    indentNo: "",
    date: new Date().toISOString().split("T")[0],
    store: null as Store | null,
    departmentCode: "",
    departmentName: "",
  });

  const [stores, setStores] = useState<Store[]>([]);
  const [departmentList, setDepartmentList] = useState<any[]>([]);
  const [indentOrderList, setIndentOrderList] = useState<any[]>([]);
  const [_loadingIndentOrders, setLoadingIndentOrders] = useState(false);
  const [issueItems, setIssueItems] = useState<IssueItem[]>([]);

  // Direct Issue item entry
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const itemDropdownRef = useRef<HTMLDivElement>(null);
  const [directItemDetails, setDirectItemDetails] = useState<any | null>(null);
  const [directIssueQty, setDirectIssueQty] = useState("");
  const [loadingDirectItem, setLoadingDirectItem] = useState(false);
  const [loadingInventoryItems, setLoadingInventoryItems] = useState(false);

  const [loadingStores, setLoadingStores] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [apiLoadingCount, setApiLoadingCount] = useState(0);

  const inputClass =
    "h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "mb-1.5 block text-xs font-semibold text-gray-600";

  const startLoading = () => setApiLoadingCount((count) => count + 1);

  const stopLoading = () =>
    setApiLoadingCount((count) => Math.max(0, count - 1));

  // ------------------------------------------------------------
  // Store list
  // ------------------------------------------------------------
  const fetchStores = async () => {
    if (!branch) return;

    startLoading();
    setLoadingStores(true);

    try {
      const res = await getStoreMasterList(branch);

      if (res?.success) {
        const raw = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.supplies)
            ? res.data.supplies
            : Array.isArray(res?.supplies)
              ? res.supplies
              : [];

        const data: Store[] = raw
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

        setStores(data);

        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            store:
              data.find((store) => store.storeId === prev.store?.storeId) ||
              data[0],
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
      stopLoading();
    }
  };

  // ------------------------------------------------------------
  // Department list
  // ------------------------------------------------------------
  const fetchDepartments = async () => {
    if (!branch) return;

    startLoading();
    setLoadingDepartments(true);

    try {
      const res = await getDepartmentList(branch);

      if (res?.success && Array.isArray(res?.data)) {
        setDepartmentList(
          res.data.filter(
            (item: any) => String(item?.depName ?? "").trim() !== "",
          ),
        );
      } else {
        setDepartmentList([]);
        toast.error(res?.message || "Failed to load departments");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);

      setDepartmentList([]);
      toast.error("Failed to load departments");
    } finally {
      setLoadingDepartments(false);
      stopLoading();
    }
  };

  // ------------------------------------------------------------
  // Indent orders
  // ------------------------------------------------------------
  const fetchIndentOrders = async () => {
    if (!branch) return;

    startLoading();
    setLoadingIndentOrders(true);

    try {
      const res = await searchIndentOrder(branch);

      if (res?.success && Array.isArray(res?.data)) {
        setIndentOrderList(res.data);
      } else {
        setIndentOrderList([]);
        toast.error(res?.message || "Failed to load indent orders");
      }
    } catch (error) {
      console.error("Error fetching indent orders:", error);

      setIndentOrderList([]);
      toast.error("Failed to load indent orders");
    } finally {
      setLoadingIndentOrders(false);
      stopLoading();
    }
  };

  // ------------------------------------------------------------
  // Transaction number
  // ------------------------------------------------------------
  const fetchNextTransNo = async () => {
    if (!branch) return;

    startLoading();

    try {
      const res = await getNextIdCode({
        tableName: "ItemIssueMaster",
        columnName: "TrasnsactionNo",
        conditionName: "Branch_Code",
        branch: branch,
      });

      if (res?.success) {
        setFormData((prev) => ({
          ...prev,
          transNo: res.data.toString(),
        }));
      }
    } catch (error) {
      console.error("Error fetching next Trans No:", error);
    } finally {
      stopLoading();
    }
  };

  // ------------------------------------------------------------
  // Indent selection
  // ------------------------------------------------------------
  const handleIndentNoChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedIndentNo = e.target.value;

    setFormData((prev) => ({
      ...prev,
      indentNo: selectedIndentNo,
    }));

    if (!selectedIndentNo || !branch) {
      setIssueItems([]);
      return;
    }

    try {
      startLoading();

      const response = await getIndentOrderApprovalData(
        branch,
        Number(selectedIndentNo),
      );

      console.log("Indent Order Approval Response:", response);

      if (response?.success && response?.data?.length > 0) {
        const master = response.data[0]?.master;

        const details = response.data[0]?.details || [];

        // ------------------------------------------------------------
        // Bind Store
        // ------------------------------------------------------------
        const storeId = Number(master?.storeId);

        const selectedStore = stores.find((store) => store.storeId === storeId);

        // ------------------------------------------------------------
        // Bind Department
        // ------------------------------------------------------------
        const departmentCode = String(master?.depCode ?? "");

        const selectedDepartment = departmentList.find(
          (dept: any) => String(dept?.depCode) === departmentCode,
        );

        // ------------------------------------------------------------
        // Bind Master
        // ------------------------------------------------------------
        setFormData((prev) => ({
          ...prev,
          indentNo: selectedIndentNo,

          date: master?.ioDate ? master.ioDate.split("T")[0] : prev.date,

          store: selectedStore || null,

          departmentCode: departmentCode,

          departmentName: selectedDepartment?.depName ?? "",
        }));

        // ------------------------------------------------------------
        // Bind item details
        // ------------------------------------------------------------
        //
        // Same itemCode is merged only for display.
        // Every original PNo remains inside stockRows.
        //
        const groupedItems = details.reduce(
          (acc: Record<number, IssueItem>, item: any, index: number) => {
            const itemCode = Number(item.itemCode ?? 0);

            const approvedQty = Number(item.approvedQty ?? 0);

            const reamingQty = Number(item.reamingQty ?? 0);

            const pNo = Number(item.pNo ?? index + 1);

            // --------------------------------------------------------
            // IMPORTANT:
            // Issue Qty is directly bound to Reaming Qty
            // --------------------------------------------------------
            const stockRow = {
              pNo,

              approvedQty,

              // Issue Qty = Reaming Qty
              issueQty: reamingQty,

              stockSource: String(item.stockSource ?? ""),

              stockReferenceNo: Number(item.stockReferenceNo ?? 0),

              reamingQty,
            };

            if (!acc[itemCode]) {
              acc[itemCode] = {
                id: itemCode,

                pNo,

                ioNo: Number(item.ioNo ?? master?.ioNo ?? 0),

                itemCode,

                itemName: String(item.itemName ?? ""),

                itemRate: Number(item.ioItemRate ?? item.itemRate ?? 0),

                availableQty: Number(item.availableQty ?? 0),

                approvedQty,

                unitName: String(item.unit ?? item.unitName ?? ""),

                unitCode: Number(item.unitCode ?? 0),

                mainUnit: String(item.mainUnit ?? ""),

                mainUnitConverstion: String(item.mainUnitConverstion ?? ""),

                // --------------------------------------------------
                // IMPORTANT:
                // Issue Qty = Reaming Qty
                // --------------------------------------------------
                issueQty: reamingQty,

                branchCode: String(
                  item.branchCode ?? master?.branch_Code ?? branch ?? "",
                ),

                reamingQty,

                stockSource: String(item.stockSource ?? ""),

                stockReferenceNo: Number(item.stockReferenceNo ?? 0),

                stockRows: [stockRow],
              };
            } else {
              acc[itemCode].approvedQty += approvedQty;

              acc[itemCode].reamingQty += reamingQty;

              // Add remaining qty to Issue Qty
              acc[itemCode].issueQty += reamingQty;

              acc[itemCode].stockRows.push(stockRow);
            }

            return acc;
          },
          {},
        );

        const mappedItems: IssueItem[] = Object.values(groupedItems);

        setIssueItems(mappedItems);

        console.log("Mapped Item Issue Items:", mappedItems);
      } else {
        setIssueItems([]);

        toast.error(response?.message || "No indent order details found");
      }
    } catch (error) {
      console.error("Error fetching indent order approval data:", error);

      setIssueItems([]);

      toast.error("Failed to load indent order details");
    } finally {
      stopLoading();
    }
  };

  // ------------------------------------------------------------
  // Direct Issue inventory items
  // ------------------------------------------------------------
const fetchInventoryItems = async () => {
  if (!branch) return;

  startLoading();
  setLoadingInventoryItems(true);

  try {
    const res = await getInventoryItemStoreList(branch);

    console.log("Inventory Item API Response:", res);

    if (res?.success) {
      const rawItems =
        Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.items)
            ? res.data.items
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : Array.isArray(res?.items)
                ? res.items
                : Array.isArray(res?.supplies)
                  ? res.supplies
                  : [];

      console.log("Inventory Items:", rawItems);

      setInventoryItems(rawItems);

      if (rawItems.length === 0) {
        console.warn("No inventory items found from API.");
      }
    } else {
      setInventoryItems([]);
      toast.error(res?.message || "Failed to load items");
    }
  } catch (error) {
    console.error("Error loading inventory items:", error);
    setInventoryItems([]);
    toast.error("Failed to load items");
  } finally {
    setLoadingInventoryItems(false);
    stopLoading();
  }
};

  const filteredDirectItems = inventoryItems.filter((item: any) => {
    const search = itemSearch.trim().toLowerCase();
    if (!search) return true;

    return (
      String(item?.itemCode ?? "").toLowerCase().includes(search) ||
      String(item?.itemName ?? "").toLowerCase().includes(search) ||
      String(item?.barCode ?? "").toLowerCase().includes(search)
    );
  });

  const handleDirectItemSelect = async (item: any) => {
    if (!branch) {
      toast.error("Branch code not found.");
      return;
    }

    if (!formData.store?.storeId) {
      toast.error("Please select Store Name.");
      return;
    }

    setItemSearch(`${item.itemCode} - ${item.itemName}`);
    setShowItemDropdown(false);
    setDirectItemDetails(null);
    setDirectIssueQty("");
    setLoadingDirectItem(true);

    try {
  const res = await getItemDetailsIndentOrder({
  branchCode: branch,
  StoreId: Number(formData.store?.storeId ?? 0),
  ItemCode: Number(item.itemCode),
});

      if (!res?.success || !res?.data) {
        toast.error(res?.message || "Item details not found.");
        return;
      }

      const data = Array.isArray(res.data) ? res.data[0] : res.data;

      setDirectItemDetails({
        itemCode: Number(data?.itemCode ?? item.itemCode ?? 0),
        itemName: String(data?.itemName ?? item.itemName ?? ""),
        itemRate: Number(data?.itemRate ?? data?.ioItemRate ?? item?.itemRate ?? item?.purchaseRate ?? 0),
        availableQty: Number(data?.availableQty ?? 0),
        unitName: String(data?.unitName ?? data?.unit ?? item?.unitName ?? ""),
        unitCode: Number(data?.unitCode ?? 0),
        mainUnit: String(data?.mainUnit ?? ""),
        mainUnitConverstion: String(data?.mainUnitConverstion ?? ""),
        pNo: Number(data?.pNo ?? 0),
        stockSource: String(data?.stockSource ?? ""),
        stockReferenceNo: Number(data?.stockReferenceNo ?? 0),
        branchCode: String(data?.branch_Code ?? data?.branchCode ?? branch),
      });
    } catch (error) {
      console.error("Error loading direct issue item details:", error);
      setDirectItemDetails(null);
      toast.error("Failed to load item details.");
    } finally {
      setLoadingDirectItem(false);
    }
  };

  const handleAddDirectItem = () => {
    if (!directItemDetails) {
      toast.error("Please select an item first.");
      return;
    }

    const qty = Number(directIssueQty);
    const availableQty = Number(directItemDetails.availableQty || 0);

    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Please enter a valid Issue Qty.");
      return;
    }

    if (qty > availableQty) {
      toast.error(`Issue Qty cannot exceed Available Qty ${availableQty}.`);
      return;
    }

    const itemCode = Number(directItemDetails.itemCode);
    const existingIndex = issueItems.findIndex((item) => item.itemCode === itemCode);

    if (existingIndex >= 0) {
      const existing = issueItems[existingIndex];
      const newQty = Number(existing.issueQty || 0) + qty;

      if (newQty > availableQty) {
        toast.error(`Total Issue Qty cannot exceed Available Qty ${availableQty}.`);
        return;
      }

      setIssueItems((prev) =>
        prev.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                approvedQty: newQty,
                issueQty: newQty,
                reamingQty: newQty,
                stockRows: item.stockRows.map((row, rowIndex) =>
                  rowIndex === 0
                    ? { ...row, approvedQty: newQty, issueQty: newQty, reamingQty: newQty }
                    : row,
                ),
              }
            : item,
        ),
      );
    } else {
      const pNo = Number(directItemDetails.pNo || 0);
      const newItem: IssueItem = {
        id: Date.now(),
        pNo,
        ioNo: 0,
        itemCode,
        itemName: directItemDetails.itemName,
        itemRate: Number(directItemDetails.itemRate || 0),
        availableQty,
        approvedQty: qty,
        issueQty: qty,
        unitName: directItemDetails.unitName || "",
        unitCode: Number(directItemDetails.unitCode || 0),
        mainUnit: directItemDetails.mainUnit || "",
        mainUnitConverstion: directItemDetails.mainUnitConverstion || "",
        branchCode: directItemDetails.branchCode || branch || "",
        stockSource: directItemDetails.stockSource || "",
        stockReferenceNo: Number(directItemDetails.stockReferenceNo || 0),
        reamingQty: qty,
        stockRows: [
          {
            pNo,
            approvedQty: qty,
            issueQty: qty,
            stockSource: directItemDetails.stockSource || "",
            stockReferenceNo: Number(directItemDetails.stockReferenceNo || 0),
            reamingQty: qty,
          },
        ],
      };

      setIssueItems((prev) => [...prev, newItem]);
    }

    setItemSearch("");
    setShowItemDropdown(false);
    setDirectItemDetails(null);
    setDirectIssueQty("");
    toast.success("Item added to issue table.");
  };

  // ------------------------------------------------------------
  // Close item dropdown when clicking/touching outside
  // ------------------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        itemDropdownRef.current &&
        !itemDropdownRef.current.contains(event.target as Node)
      ) {
        setShowItemDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // ------------------------------------------------------------
  // Initial loading
  // ------------------------------------------------------------
  useEffect(() => {
    if (!branch) return;

    fetchStores();
    fetchDepartments();
    fetchIndentOrders();
    fetchInventoryItems();
    fetchNextTransNo();
  }, [branch]);

  // ------------------------------------------------------------
  // Saved transaction number
  // ------------------------------------------------------------
  useEffect(() => {
    const savedTransNo = sessionStorage.getItem("itemIssueTransNo");

    if (savedTransNo) {
      setFormData((prev) => ({
        ...prev,
        transNo: savedTransNo,
      }));
    }
  }, []);

  // ------------------------------------------------------------
  // Remove item
  // ------------------------------------------------------------
  // const handleRemoveItem = (id: number) => {
  //   setIssueItems((prev) => prev.filter((item) => item.id !== id));
  // };

  // ------------------------------------------------------------
  // Direct Issue toggle
  // ------------------------------------------------------------
  const handleDirectIssueChange = (checked: boolean) => {
    setDirectIssue(checked);

    setIssueItems([]);
    setItemSearch("");
    setShowItemDropdown(false);
    setDirectItemDetails(null);
    setDirectIssueQty("");

    setFormData((prev) => ({
      ...prev,
      indentNo: checked ? "" : prev.indentNo,
      store: checked ? prev.store : null,
      departmentCode: checked ? prev.departmentCode : "",
      departmentName: checked ? prev.departmentName : "",
    }));
  };

  // ------------------------------------------------------------
  // Store change
  // ------------------------------------------------------------
  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storeId = Number(e.target.value);

    const selectedStore = stores.find((item) => item.storeId === storeId);

    setFormData((prev) => ({
      ...prev,
      store: selectedStore || null,
    }));
  };

  // ------------------------------------------------------------
  // Clear / Back
  // ------------------------------------------------------------
  const handleClear = () => {
    navigate(-1);
  };

  // ------------------------------------------------------------
  // Clear form after save
  // ------------------------------------------------------------
  const clearFormAfterSave = () => {
    setFormData({
      transNo: "",
      indentNo: "",
      date: new Date().toISOString().split("T")[0],
      store: null,
      departmentCode: "",
      departmentName: "",
    });

    setIssueItems([]);
    setDirectIssue(false);
    setItemSearch("");
    setShowItemDropdown(false);
    setDirectItemDetails(null);
    setDirectIssueQty("");
  };

  // ------------------------------------------------------------
  // SAVE
  // ------------------------------------------------------------
  const handleSave = async () => {
    if (!formData.store?.storeId) {
      toast.error("Please select Store Name.");
      return;
    }

    if (!formData.transNo.trim()) {
      toast.error("Please enter Trans No.");
      return;
    }

    if (!formData.departmentCode) {
      toast.error("Please select Department.");
      return;
    }

    if (!directIssue && !formData.indentNo.trim()) {
      toast.error("Please select Indent No.");
      return;
    }

    // ------------------------------------------------------------
    // Issue Qty is automatically Reaming Qty
    // ------------------------------------------------------------
    const totalIssueQty = issueItems.reduce(
      (total, item) => total + Number(item.reamingQty || 0),
      0,
    );

    if (totalIssueQty <= 0) {
      toast.error("No remaining quantity available to issue.");
      return;
    }

    // ------------------------------------------------------------
    // Calculate total remaining quantity
    // ------------------------------------------------------------
    const totalRemainingQty = issueItems.reduce((total, item) => {
      const rowTotal = (item.stockRows || []).reduce(
        (rowTotal, row) => rowTotal + Number(row.reamingQty || 0),
        0,
      );

      return total + rowTotal;
    }, 0);

    if (totalIssueQty > totalRemainingQty) {
      toast.error(
        `Issue Qty cannot exceed remaining Qty ${totalRemainingQty}.`,
      );
      return;
    }

    const userCode = Number(
      appData?.user?.userCode ??
        appData?.user?.userid ??
        appData?.user?.userId ??
        0,
    );

    const detailItems: any[] = [];

    // ------------------------------------------------------------
    // Process EVERY item
    //
    // Issue Qty is automatically the Reaming Qty.
    // Distribute it PNo-wise according to each row's Reaming Qty.
    // ------------------------------------------------------------
    for (const item of issueItems) {
      let remainingIssueQty = Number(item.reamingQty || 0);

      const stockRows = [...(item.stockRows || [])];

      for (const row of stockRows) {
        const rowRemainingQty = Number(row.reamingQty || 0);

        let issueFromThisRow = 0;

        if (remainingIssueQty > 0 && rowRemainingQty > 0) {
          issueFromThisRow = Math.min(remainingIssueQty, rowRemainingQty);

          remainingIssueQty -= issueFromThisRow;
        }

        // ----------------------------------------------------------
        // Add EVERY row to payload
        // ----------------------------------------------------------
        detailItems.push({
          iNo: Number(formData.transNo),

          itemCode: item.itemCode,

          itemName: item.itemName,

          issueQty: issueFromThisRow,

          itemRate: item.itemRate,

          unit: item.unitName,

          unitCode: item.unitCode,

          pNo: row.pNo,

          qtyPer: Number(item.mainUnitConverstion || 0),

          noOfQty: issueFromThisRow,

          branch_Code: item.branchCode || branch || "",

          availableQty: Math.max(0, rowRemainingQty - issueFromThisRow),

          orginalQty: row.approvedQty ?? 0,

          returnQty: 0,

          mainUnit: item.mainUnit,

          mainUnitConverstion: item.mainUnitConverstion,

          stockSource: row.stockSource,

          stockReferenceNo: row.stockReferenceNo,
        });
      }

      // ------------------------------------------------------------
      // Safety check
      // ------------------------------------------------------------
      if (remainingIssueQty > 0) {
        toast.error(
          `Insufficient remaining quantity for ${item.itemName}. Remaining: ${remainingIssueQty}`,
        );

        return;
      }
    }

    if (detailItems.length === 0) {
      toast.error("No items available to save.");
      return;
    }

    // ------------------------------------------------------------
    // Total Amount
    // ------------------------------------------------------------
    const totalAmount = detailItems.reduce(
      (total, item) =>
        total + Number(item.issueQty || 0) * Number(item.itemRate || 0),
      0,
    );

    // ------------------------------------------------------------
    // Payload
    // ------------------------------------------------------------
    const payload = {
      trasnsactionNo: String(formData.transNo),

      iNo: Number(formData.transNo),

      issueDate: new Date(formData.date).toISOString(),

      depCode: Number(formData.departmentCode),

      totalAmount,

      billNo: 0,

      branch_Code: branch || "",

      userCode,

      pNo: 0,

      issueType: "Issue",

      indentNo: directIssue ? 0 : Number(formData.indentNo),

      isMinibar: false,

      storeId: String(formData.store.storeId),

      status: "ISS",

      items: detailItems,
    };

    console.log("Item Issue Save Payload:", payload);

    debugger;

    try {
      startLoading();

      const response = await saveItemIssue(payload);

      if (response?.success) {
        toast.success(response?.message || "Item Issue saved successfully");

        clearFormAfterSave();

        fetchNextTransNo();
      } else {
        toast.error(response?.message || "Failed to save Item Issue");
      }
    } catch (error: any) {
      console.error(
        "Error saving item issue:",
        error?.response?.data || error?.message || error,
      );

      toast.error(
        error?.response?.data?.message || "Failed to save Item Issue",
      );
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:px-6">
      {apiLoadingCount > 0 && <Loader />}

      <Header />

      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-5 mt-2">
          <h1 className="text-2xl font-bold leading-tight text-gray-800">
            Item Issue
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Enter required details for item issue
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
          {/* ============================================================
              MASTER DETAILS
          ============================================================ */}
          <section className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Item Issue
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Enter item issue details
                </p>
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* INDENT NO */}
                {!directIssue && (
                  <div className="min-w-0">
                    <label className={labelClass}>Indent No.</label>

                    <select
                      value={formData.indentNo}
                      onChange={handleIndentNoChange}
                      className={inputClass}
                    >
                      <option value="">Select Indent No.</option>

                      {indentOrderList.map((item, index) => (
                        <option key={index} value={item.ioNo}>
                          {item.ioNo}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* STORE */}
                <div className="min-w-0">
                  <label className={labelClass}>Store Name</label>

                  <select
                    value={formData.store?.storeId ?? ""}
                    onChange={handleStoreChange}
                    disabled={!directIssue || loadingStores}
                    className={`${inputClass} ${
                      loadingStores ? "cursor-not-allowed bg-gray-100" : ""
                    }`}
                  >
                    <option value="">
                      {loadingStores ? "Loading stores..." : "Select Store"}
                    </option>

                    {stores.map((store) => (
                      <option key={store.storeId} value={store.storeId}>
                        {store.storeName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TRANS NO */}
                <div className="min-w-0">
                  <label className={labelClass}>Trans No.</label>

                  <input
                    type="text"
                    value={formData.transNo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        transNo: e.target.value,
                      }))
                    }
                    disabled
                    placeholder="Trans No."
                    className={inputClass}
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
                    disabled={!directIssue || loadingDepartments}
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

                {/* DIRECT ISSUE */}
                <div className="min-w-0 flex items-end">
                  <label className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={directIssue}
                      onChange={(e) => handleDirectIssueChange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Direct Issue</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================
              ITEM DETAILS
          ============================================================ */}
          {directIssue && (
  <section className="relative z-[100] mt-6 overflow-visible rounded-xl border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h2 className="text-sm font-bold text-gray-800">Item Details</h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Select an item, enter Issue Qty and add it to the issue table.
                </p>
              </div>

              <div className="p-4 md:p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
               <div
  ref={itemDropdownRef}
  className="relative min-w-0 lg:col-span-2"
>
  <label className={labelClass}>Item</label>

  <input
    type="text"
    value={itemSearch}
    onChange={(e) => {
      setItemSearch(e.target.value);
      setShowItemDropdown(true);
      setDirectItemDetails(null);
    }}
    onFocus={() => {
      setShowItemDropdown(true);
    }}
    placeholder={
      loadingInventoryItems
        ? "Loading items..."
        : "Select / Search Item"
    }
    className={inputClass}
    disabled={!formData.store?.storeId || loadingInventoryItems}
  />

  {/* ITEM DROPDOWN */}
  {showItemDropdown && (
    <div className="absolute left-0 right-0 top-[68px] z-[999999] max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-2xl">
      
      {loadingInventoryItems ? (
        <div className="px-3 py-3 text-sm text-gray-500">
          Loading items...
        </div>
      ) : filteredDirectItems.length === 0 ? (
        <div className="px-3 py-3 text-sm text-gray-500">
          No items found.
        </div>
      ) : (
        filteredDirectItems.slice(0, 50).map((item: any, index: number) => (
          <button
            key={`${item?.itemCode}-${index}`}
            type="button"
            onClick={() => handleDirectItemSelect(item)}
            className="block w-full border-b border-gray-100 px-3 py-2.5 text-left hover:bg-blue-50"
          >
            <div className="font-semibold text-gray-800">
              {item?.itemCode} - {item?.itemName}
            </div>

            {item?.barCode && (
              <div className="mt-0.5 text-xs text-gray-500">
                Barcode: {item.barCode}
              </div>
            )}
          </button>
        ))
      )}
    </div>
  )}
</div>

                  <div className="min-w-0">
                    <label className={labelClass}>Item Code</label>
                    <input value={directItemDetails?.itemCode ?? ""} disabled className={`${inputClass} bg-gray-100`} />
                  </div>

                  <div className="min-w-0">
                    <label className={labelClass}>Item Rate</label>
                    <input value={directItemDetails?.itemRate ?? ""} disabled className={`${inputClass} bg-gray-100`} />
                  </div>

                  <div className="min-w-0">
                    <label className={labelClass}>Available Qty</label>
                    <input value={loadingDirectItem ? "Loading..." : directItemDetails?.availableQty ?? ""} disabled className={`${inputClass} bg-gray-100`} />
                  </div>

                  <div className="min-w-0">
                    <label className={labelClass}>Unit</label>
                    <input value={directItemDetails?.unitName ?? ""} disabled className={`${inputClass} bg-gray-100`} />
                  </div>

                  <div className="min-w-0">
                    <label className={labelClass}>Issue Qty</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={directIssueQty}
                      onChange={(e) => setDirectIssueQty(e.target.value)}
                      disabled={!directItemDetails || loadingDirectItem}
                      placeholder="Enter Qty"
                      className={inputClass}
                    />
                  </div>

                  <div className="flex items-end min-w-0 sm:col-span-2 lg:col-span-6 lg:justify-end">
                    <button
                      type="button"
                      onClick={handleAddDirectItem}
                      disabled={!directItemDetails || loadingDirectItem}
                      className="h-10 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ============================================================
              ITEM ISSUE TABLE
          ============================================================ */}
          <section className="relative z-10 mt-6 overflow-visible rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <h2 className="text-sm font-bold text-gray-800">
                  Item Issue Detail
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Issue Qty is automatically bound to Reaming Qty.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {issueItems.length} Unique Item(s)
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
                        approved Qty
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Unit
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-semibold text-blue-700">
                        Issue Qty
                      </th>

                      {/* <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                        Action
                      </th> */}
                    </tr>
                  </thead>

                  <tbody>
                    {issueItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-10 text-center text-sm text-gray-500"
                        >
                          No items added yet. Select an item.
                        </td>
                      </tr>
                    ) : (
                      issueItems.map((item, index) => (
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
                            {item.reamingQty}
                          </td>

                          <td className="px-4 py-3 text-gray-700">
                            {item.unitName || "-"}
                          </td>

                          {/* ==================================================
                                ISSUE QTY
                                DIRECTLY BOUND TO REAMING QTY
                                ================================================== */}
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              value={item.reamingQty}
                              disabled
                              className="h-9 w-28 cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-2 text-right text-sm text-gray-700"
                            />
                          </td>

                          {/* <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-sm font-semibold text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </td> */}
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
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemIssue;
