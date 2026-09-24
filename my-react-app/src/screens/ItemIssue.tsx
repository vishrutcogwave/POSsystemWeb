import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Loader from "../components/Loader";
import {
  getStoreMasterList,
  getDepartmentList,
  searchIndentOrder,
  getNextIdCode,
  getIndentOrderApprovalData,
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
  reamingQty:number
  stockRows: {
    pNo: number;
    approvedQty: number;
    issueQty: number;
    stockSource: string;
    stockReferenceNo: number;
    reamingQty:number;

  
  }[];
};
const ItemIssue: React.FC = () => {
  const { appData } = useAppContext();
  const branch = appData?.user?.branch_code;
const navigate = useNavigate();
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

        // -----------------------------
        // Bind Store
        // -----------------------------
        const storeId = Number(master?.storeId);

        const selectedStore = stores.find((store) => store.storeId === storeId);

        // -----------------------------
        // Bind Department
        // -----------------------------
        const departmentCode = String(master?.depCode ?? "");

        const selectedDepartment = departmentList.find(
          (dept: any) => String(dept?.depCode) === departmentCode,
        );

        // -----------------------------
        // Bind Master Form
        // -----------------------------
        setFormData((prev) => ({
          ...prev,
          indentNo: selectedIndentNo,

          date: master?.ioDate ? master.ioDate.split("T")[0] : prev.date,

          store: selectedStore || null,

          departmentCode: departmentCode,

          departmentName: selectedDepartment?.depName ?? "",
        }));

        // -----------------------------
        // Bind Details to Item Table
        // -----------------------------
        // Same itemCode is merged ONLY for display. Every original pNo is
        // retained inside stockRows so Save can send separate detail rows.
        const groupedItems = details.reduce(
          (acc: Record<number, IssueItem>, item: any, index: number) => {
            const itemCode = Number(item.itemCode ?? 0);
            const approvedQty = Number(item.approvedQty ?? 0);
            const pNo = Number(item.pNo ?? index + 1);

            const stockRow = {
              pNo,
              approvedQty,
              issueQty: 0,
              stockSource: String(item.stockSource ?? ""),
              stockReferenceNo: Number(item.stockReferenceNo ?? 0),
              reamingQty:Number(item.reamingQty ?? 0),
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

                issueQty: 0,
                branchCode: String(
                  item.branchCode ?? master?.branch_Code ?? branch ?? "",
                ),
                reamingQty:Number(item.reamingQty ?? 0),
                stockSource: String(item.stockSource ?? ""),
                stockReferenceNo: Number(item.stockReferenceNo ?? 0),
                stockRows: [stockRow],
              };
          } else {
  acc[itemCode].approvedQty += approvedQty;
  acc[itemCode].reamingQty += Number(item.reamingQty ?? 0);
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
  useEffect(() => {
    if (!branch) return;

    fetchStores();
    fetchDepartments();
    fetchIndentOrders();
    fetchNextTransNo();
  }, [branch]);
  // ------------------------------------------------------------
  // Transaction number
  //
  // Keep this separate because the exact Item Issue transaction
  // number API was not present in the available source.
  // Bind your Item Issue transaction-number API here when available.
  // ------------------------------------------------------------
  useEffect(() => {
    const savedTransNo = sessionStorage.getItem("itemIssueTransNo");

    if (savedTransNo) {
      setFormData((prev) => ({ ...prev, transNo: savedTransNo }));
    }
  }, []);

  const handleIssueQtyChange = (id: number, value: string) => {
    if (value === "") {
      setIssueItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                issueQty: 0,
                stockRows: item.stockRows.map((row) => ({
                  ...row,
                  issueQty: 0,
                })),
              }
            : item,
        ),
      );
      return;
    }

    if (!/^\d*\.?\d*$/.test(value)) return;

    const requestedQty = Number(value);
    if (!Number.isFinite(requestedQty)) return;

    const item = issueItems.find((item) => item.id === id);
    if (!item) return;

    if (requestedQty > item.reamingQty) {
      toast.error(`Issue Qty cannot exceed approved Qty ${item.reamingQty}`);
      return;
    }

    // Distribute the entered Issue Qty across the original pNo rows.
    // Example: pNo 1 approved 20, pNo 2 approved 30, entered 40 =>
    // pNo 1 issue 20 and pNo 2 issue 20.
    let remainingQty = requestedQty;

    const updatedStockRows = item.stockRows.map((row) => {
      const rowIssueQty = Math.min(remainingQty, row.approvedQty);
      remainingQty -= rowIssueQty;

      return {
        ...row,
        issueQty: rowIssueQty,
      };
    });

    setIssueItems((prev) =>
      prev.map((currentItem) =>
        currentItem.id === id
          ? {
              ...currentItem,
              issueQty: requestedQty,
              stockRows: updatedStockRows,
            }
          : currentItem,
      ),
    );
  };

  const handleRemoveItem = (id: number) => {
    setIssueItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storeId = Number(e.target.value);

    const selectedStore = stores.find((item) => item.storeId === storeId);

    setFormData((prev) => ({
      ...prev,
      store: selectedStore || null,
    }));
  };

 const handleClear = () => {
  navigate(-1);
};

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
};
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

  const totalIssueQty = issueItems.reduce(
    (total, item) => total + Number(item.issueQty || 0),
    0
  );

  if (totalIssueQty <= 0) {
    toast.error("Please enter Issue Qty.");
    return;
  }

  // Calculate total remaining quantity from ALL stock rows
  const totalRemainingQty = issueItems.reduce(
    (total, item) => {
      const rowTotal = (item.stockRows || []).reduce(
        (rowTotal, row) =>
          rowTotal + Number(row.reamingQty || 0),
        0
      );

      return total + rowTotal;
    },
    0
  );

  if (totalIssueQty > totalRemainingQty) {
    toast.error(
      `Issue Qty cannot exceed remaining Qty ${totalRemainingQty}.`
    );
    return;
  }

  const userCode = Number(
    appData?.user?.userCode ??
      appData?.user?.userid ??
      appData?.user?.userId ??
      0
  );

  const detailItems: any[] = [];

  /**
   * Process EVERY item.
   *
   * For each item:
   *   item.issueQty = quantity requested for that item
   *
   * Then distribute that quantity across its stockRows
   * according to reamingQty.
   */
  for (const item of issueItems) {
    let remainingIssueQty = Number(item.issueQty || 0);

    const stockRows = [...(item.stockRows || [])];

    for (const row of stockRows) {
      const rowRemainingQty = Number(row.reamingQty || 0);

      let issueFromThisRow = 0;

      // If there is issue quantity remaining,
      // take it from this row based on reamingQty.
      if (
        remainingIssueQty > 0 &&
        rowRemainingQty > 0
      ) {
        issueFromThisRow = Math.min(
          remainingIssueQty,
          rowRemainingQty
        );

        remainingIssueQty -= issueFromThisRow;
      }

      /**
       * IMPORTANT:
       * Add EVERY row to the payload.
       *
       * Even when:
       * reamingQty = 0
       *
       * it will be sent with:
       * issueQty = 0
       */
      detailItems.push({
        iNo: Number(formData.transNo),

        itemCode: item.itemCode,
        itemName: item.itemName,

        issueQty: issueFromThisRow,

        itemRate: item.itemRate,

        unit: item.unitName,
        unitCode: item.unitCode,

        pNo: row.pNo,

        qtyPer: Number(
          item.mainUnitConverstion || 0
        ),

        noOfQty: issueFromThisRow,

        branch_Code:
          item.branchCode || branch || "",

        availableQty: Math.max(
          0,
          rowRemainingQty - issueFromThisRow
        ),

        orginalQty: row.approvedQty ?? 0,

        returnQty: 0,

        mainUnit: item.mainUnit,

        mainUnitConverstion:
          item.mainUnitConverstion,

        stockSource: row.stockSource,

        stockReferenceNo:
          row.stockReferenceNo,
      });
    }

    // Safety check
    if (remainingIssueQty > 0) {
      toast.error(
        `Insufficient remaining quantity for ${item.itemName}. Remaining: ${remainingIssueQty}`
      );
      return;
    }
  }

  if (detailItems.length === 0) {
    toast.error("No items available to save.");
    return;
  }

  const totalAmount = detailItems.reduce(
    (total, item) =>
      total +
      Number(item.issueQty || 0) *
        Number(item.itemRate || 0),
    0
  );

  const payload = {
    trasnsactionNo: String(formData.transNo),

    iNo: Number(formData.transNo),

    issueDate: new Date(
      formData.date
    ).toISOString(),

    depCode: Number(
      formData.departmentCode
    ),

    totalAmount,

    billNo: 0,

    branch_Code: branch || "",

    userCode,

    pNo: 0,

    issueType: "Issue",

    indentNo: Number(
      formData.indentNo
    ),

    isMinibar: false,

    storeId: String(
      formData.store.storeId
    ),

    status: "ISS",

    // ALL ITEMS ARE SENT
    items: detailItems,
  };

  console.log(
    "Item Issue Save Payload:",
    payload
  );
debugger
  try {
    startLoading();

    const response =
      await saveItemIssue(payload);

    if (response?.success) {
      toast.success(
        response?.message ||
          "Item Issue saved successfully"
      );

      clearFormAfterSave();

      fetchNextTransNo();
    } else {
      toast.error(
        response?.message ||
          "Failed to save Item Issue"
      );
    }
  } catch (error: any) {
    console.error(
      "Error saving item issue:",
      error?.response?.data ||
        error?.message ||
        error
    );

    toast.error(
      error?.response?.data?.message ||
        "Failed to save Item Issue"
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
                {/* STORE NAME */}
                <div className="min-w-0">
                  <label className={labelClass}>Store Name</label>

                  <select
                    value={formData.store?.storeId ?? ""}
                    onChange={handleStoreChange}
                    disabled
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
                    disabled
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
              </div>
            </div>
          </section>

          <section className="relative z-10 mt-6 overflow-visible rounded-xl border border-gray-200">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="text-sm font-bold text-gray-800">Item Details</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Enter the Issue Qty and add the item to the table.
              </p>
            </div>
          </section>
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
                  Added items and their issue quantities.
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
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {issueItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-10 text-center text-sm text-gray-500"
                        >
                          No items added yet. Select an item, enter Issue Qty
                          and click Add Item.
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

                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              min="0"
                              max={item.reamingQty}
                              step="any"
                              value={item.issueQty === 0 ? "" : item.issueQty}
                              onChange={(e) =>
                                handleIssueQtyChange(item.id, e.target.value)
                              }
                              className="h-9 w-28 rounded-md border border-blue-300 px-2 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </td>

                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
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
