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
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";

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
  approvedQty: number;
  issueQty: number;
};
const ItemIssue: React.FC = () => {
  const { appData } = useAppContext();
  const branch = appData?.user?.branch_code;

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
  const [loadingIndentOrders, setLoadingIndentOrders] = useState(false);
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
        const groupedItems = details.reduce(
          (acc: Record<number, any>, item: any) => {
            const itemCode = Number(item.itemCode);

            if (!acc[itemCode]) {
              acc[itemCode] = {
                id: itemCode,
                itemCode: itemCode,
                itemName: String(item.itemName),
                itemRate: Number(item.ioItemRate ?? 0),
                approvedQty: Number(item.approvedQty ?? 0),
                unitName: item.unit ?? "",
                unitCode: Number(item.unitCode ?? 0),
                mainUnit: item.mainUnit ?? "",
                mainUnitConverstion: item.mainUnitConverstion ?? "",
                issueQty: 0,
              };
            } else {
              // Merge same item code
              acc[itemCode].approvedQty += Number(item.approvedQty ?? 0);
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
        prev.map((item) => (item.id === id ? { ...item, issueQty: 0 } : item)),
      );
      return;
    }

    const qty = Number(value);

    if (!Number.isFinite(qty) || qty < 0) return;

    setIssueItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              issueQty: Math.min(qty, item.availableQty),
            }
          : item,
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
    setFormData((prev) => ({
      ...prev,
      date: new Date().toISOString().split("T")[0],
      store: stores[0] || null,
      departmentCode: "",
      departmentName: "",
    }));
    setIssueItems([]);

    toast.success("Form cleared");
  };

  const handleSave = () => {
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

    if (issueItems.length === 0) {
      toast.error("Please add at least one item.");
      return;
    }

    const invalidItem = issueItems.find((item) => item.issueQty <= 0);

    if (invalidItem) {
      toast.error("Issue Qty must be greater than zero.");
      return;
    }

    // Keep this payload ready for the Item Issue save API.
    // The exact save API was not present in the available source.
    const payload = {
      transNo: formData.transNo,
      date: formData.date,
      storeId: formData.store.storeId,
      storeName: formData.store.storeName,
      departmentCode: formData.departmentCode,
      departmentName: formData.departmentName,
      branchCode: branch || "",
      items: issueItems.map((item) => ({
        itemCode: item.itemCode,
        itemName: item.itemName,
        itemRate: item.itemRate,
        availableQty: item.availableQty,
        unitCode: item.unitCode,
        unitName: item.unitName,
        mainUnit: item.mainUnit,
        mainUnitConverstion: item.mainUnitConverstion,
        issueQty: item.issueQty,
      })),
    };

    console.log("Item Issue Payload:", payload);

    toast.success(
      "Item Issue data prepared. Connect the Item Issue Save API in handleSave.",
    );
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
                {issueItems.length} Item(s)
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
                          colSpan={9}
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
                            {item.approvedQty}
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
              Clear
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
