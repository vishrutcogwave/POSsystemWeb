import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Loader from "../components/Loader";
import {
  getItemIssueNumber,
  getItemIssueData,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

type IssueNumber = {
  issueNo: number;
  status: string;
};

type IssueMaster = {
  iNo: number;
  issueDate: string;
  depCode: number;
  totalAmount: number;
  billNo: number;
  branch_Code: string;
  userCode: number;
  pNo: number;
  issueType: string;
  indentNo: number;
  isMinibar: boolean;
  storeId: string;
  status: string;
  trasnsactionNo: string;
};

type ReturnItem = {
  iNo: number;
  itemCode: number;
  itemName: string;
  issueQty: number;
  itemRate: number;
  unit: string;
  unitCode: number;
  pNo: number;
  qtyPer: number;
  noOfQty: number;
  branch_Code: string;
  orginalQty: number;
  availableQty: number;
  returnQty: number;
  mainUnit: string;
  mainUnitConverstion: string;
  storeId: string;
  depCode: number;
  stockSource: string;
  stockReferenceNo: number;
  issueType: string;
};

const ItemReturn: React.FC = () => {
  const { appData } = useAppContext();
  const branch = appData?.user?.branch_code;

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    issueNo: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [issueNumbers, setIssueNumbers] = useState<IssueNumber[]>([]);

  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);

  const [issueMaster, setIssueMaster] = useState<IssueMaster | null>(null);

  const [apiLoadingCount, setApiLoadingCount] = useState(0);

  const inputClass =
    "h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass = "mb-1.5 block text-xs font-semibold text-gray-600";

  const startLoading = () => setApiLoadingCount((count) => count + 1);

  const stopLoading = () =>
    setApiLoadingCount((count) => Math.max(0, count - 1));

  // ------------------------------------------------------------
  // Get Issue Number List
  // ------------------------------------------------------------
  const fetchIssueNumbers = async () => {
    if (!branch) return;

    try {
      startLoading();

      const response = await getItemIssueNumber(branch);

      if (response?.success && Array.isArray(response?.data)) {
        setIssueNumbers(response.data);
      } else {
        setIssueNumbers([]);

        toast.error(response?.message || "Failed to load Issue Numbers");
      }
    } catch (error: any) {
      console.error(
        "Error fetching issue numbers:",
        error?.response?.data || error?.message || error,
      );

      setIssueNumbers([]);

      toast.error("Failed to load Issue Numbers");
    } finally {
      stopLoading();
    }
  };

  // ------------------------------------------------------------
  // Get Issue Data
  // ------------------------------------------------------------
  const handleIssueNoChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedIssueNo = e.target.value;

    setFormData((prev) => ({
      ...prev,
      issueNo: selectedIssueNo,
    }));

    setReturnItems([]);
    setIssueMaster(null);

    if (!selectedIssueNo || !branch) {
      return;
    }

    try {
      startLoading();

      const response = await getItemIssueData(branch, Number(selectedIssueNo));

      console.log("Item Issue Data Response:", response);

      if (
        response?.success &&
        Array.isArray(response?.data) &&
        response.data.length > 0
      ) {
        const data = response.data[0];

        const master = data?.master;
        const items = Array.isArray(data?.items) ? data.items : [];

        setIssueMaster(master || null);

        const mappedItems: ReturnItem[] = items.map((item: any) => ({
          iNo: Number(item?.iNo ?? 0),

          itemCode: Number(item?.itemCode ?? 0),

          itemName: String(item?.itemName ?? ""),

          issueQty: Number(item?.issueQty ?? 0),

          itemRate: Number(item?.itemRate ?? 0),

          unit: String(item?.unit ?? ""),

          unitCode: Number(item?.unitCode ?? 0),

          pNo: Number(item?.pNo ?? 0),

          qtyPer: Number(item?.qtyPer ?? 0),

          noOfQty: Number(item?.noOfQty ?? 0),

          branch_Code: String(item?.branch_Code ?? branch ?? ""),

          orginalQty: Number(item?.orginalQty ?? 0),

          availableQty: Number(item?.availableQty ?? 0),

          returnQty: Number(item?.returnQty ?? 0),

          mainUnit: String(item?.mainUnit ?? ""),

          mainUnitConverstion: String(item?.mainUnitConverstion ?? ""),

          storeId: String(item?.storeId ?? ""),

          depCode: Number(item?.depCode ?? 0),

          stockSource: String(item?.stockSource ?? ""),

          stockReferenceNo: Number(item?.stockReferenceNo ?? 0),

          issueType: String(item?.issueType ?? ""),
        }));

        setReturnItems(mappedItems);

        // Bind API issue date if it is valid
        if (master?.issueDate && !master.issueDate.startsWith("0001")) {
          setFormData((prev) => ({
            ...prev,
            date: master.issueDate.split("T")[0],
          }));
        }
      } else {
        setReturnItems([]);
        setIssueMaster(null);

        toast.error(
          response?.message || "No item details found for this Issue No.",
        );
      }
    } catch (error: any) {
      console.error(
        "Error fetching item issue data:",
        error?.response?.data || error?.message || error,
      );

      setReturnItems([]);
      setIssueMaster(null);

      toast.error("Failed to load item issue details");
    } finally {
      stopLoading();
    }
  };

  // ------------------------------------------------------------
  // Return Qty Change
  // ------------------------------------------------------------
  const handleReturnQtyChange = (index: number, value: string) => {
    if (value === "") {
      setReturnItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                returnQty: 0,
              }
            : item,
        ),
      );

      return;
    }

    // Only numbers / decimal
    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }

    const returnQty = Number(value);

    if (!Number.isFinite(returnQty)) {
      return;
    }

    const item = returnItems[index];

    if (!item) {
      return;
    }

    if (returnQty > item.issueQty) {
      toast.error(`Return Qty cannot exceed Issue Qty ${item.issueQty}`);

      return;
    }

    setReturnItems((prev) =>
      prev.map((currentItem, i) =>
        i === index
          ? {
              ...currentItem,
              returnQty,
            }
          : currentItem,
      ),
    );
  };

  // ------------------------------------------------------------
  // Clear / Back
  // ------------------------------------------------------------
  const handleClear = () => {
    navigate(-1);
  };

  // ------------------------------------------------------------
  // Save
  // ------------------------------------------------------------
  const handleSave = async () => {
    if (!formData.issueNo) {
      toast.error("Please select Issue No.");
      return;
    }

    const itemsToReturn = returnItems.filter(
      (item) => Number(item.returnQty || 0) > 0,
    );

    if (itemsToReturn.length === 0) {
      toast.error("Please enter Return Qty.");
      return;
    }

    // Save API will be added here.
    console.log("Issue Master:", issueMaster);
    console.log("Items to Return:", itemsToReturn);

    toast.success("Return details ready to save");
  };

  // ------------------------------------------------------------
  // Initial Load
  // ------------------------------------------------------------
  useEffect(() => {
    if (!branch) return;

    fetchIssueNumbers();
  }, [branch]);

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:px-6">
      {apiLoadingCount > 0 && <Loader />}

      <Header />

      <div className="mx-auto w-full max-w-[1600px]">
        {/* ============================================================
            PAGE TITLE
        ============================================================ */}
        <div className="mb-5 mt-2">
          <h1 className="text-2xl font-bold leading-tight text-gray-800">
            Item Return
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Enter required details for item return
          </p>
        </div>

        {/* ============================================================
            MAIN CONTAINER
        ============================================================ */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
          {/* ============================================================
              MASTER DETAILS
          ============================================================ */}
          <section className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Item Return
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Select the issue number to load issued item details
                </p>
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* ISSUE NO */}
                <div className="min-w-0">
                  <label className={labelClass}>Issue No.</label>

                  <select
                    value={formData.issueNo}
                    onChange={handleIssueNoChange}
                    className={inputClass}
                  >
                    <option value="">Select Issue No.</option>

                    {issueNumbers.map((item) => (
                      <option key={item.issueNo} value={item.issueNo}>
                        {item.issueNo}
                      </option>
                    ))}
                  </select>
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
              </div>
            </div>
          </section>

          {/* ============================================================
              ITEM RETURN TABLE
          ============================================================ */}
          <section className="relative z-10 mt-6 overflow-visible rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <h2 className="text-sm font-bold text-gray-800">
                  Item Return Detail
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Enter the Return Qty for the issued items.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {returnItems.length} Item(s)
              </span>
            </div>

            <div className="p-4 md:p-5">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[1200px] text-sm">
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
                        Issue Qty
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Stock Source
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        Return Qty
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {returnItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-10 text-center text-sm text-gray-500"
                        >
                          Select an Issue No. to load item details.
                        </td>
                      </tr>
                    ) : (
                      returnItems.map((item, index) => (
                        <tr
                          key={`${item.iNo}-${item.itemCode}-${item.pNo}-${index}`}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-left text-gray-700">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3 text-left font-medium text-gray-800">
                            {item.itemCode}
                          </td>

                          <td className="px-4 py-3 text-left text-gray-700">
                            {item.itemName}
                          </td>

                          <td className="px-4 py-3 text-right text-gray-700">
                            {item.itemRate}
                          </td>

                          <td className="px-4 py-3 text-right font-semibold text-gray-800">
                            {item.issueQty}
                          </td>

                          <td className="px-4 py-3 text-left text-gray-700">
                            {item.stockSource}
                          </td>

                          {/* RETURN QTY */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end">
                              <input
                                type="number"
                                min={0}
                                max={item.issueQty}
                                step="any"
                                value={
                                  item.returnQty === 0 ? "" : item.returnQty
                                }
                                onChange={(e) =>
                                  handleReturnQtyChange(index, e.target.value)
                                }
                                className="h-9 w-28 rounded-md border border-blue-300 px-2 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="0"
                              />
                            </div>
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

export default ItemReturn;
