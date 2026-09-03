import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Loader from "../components/Loader";
import {
  getNextIdCode,
  getStoreMasterList,
  getGoodsReceivedList,
  getPurchaseGoodsReceivedList,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";

type Store = {
  storeId: number;
  storeName: string;
  storeLocation: string;
  storeIncharge: string;
  branch_Code: string;
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
    directPurchase: false,
    directIssue: false,
    store: null as Store | null,
  });

  /* =========================
      MASTER DATA
  ========================= */

  const [stores, setStores] = useState<Store[]>([]);
  const [grnList, setGrnList] = useState<string[]>([]);

  /* =========================
      PURCHASE GRN RESPONSE
  ========================= */

  const [purchaseGoodsReceivedData, setPurchaseGoodsReceivedData] =
    useState<any>(null);

  const [loadingStores, setLoadingStores] = useState(false);
  const [loadingGrnList, setLoadingGrnList] = useState(false);

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
      INITIAL LOAD
  ========================= */

  useEffect(() => {
    if (!appData?.user?.branch_code) return;

    fetchTransactionNo();
    fetchStores();
    fetchGoodsReceivedList();
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

  const handleGrnChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const grnNo = e.target.value;

    setFormData((prev) => ({
      ...prev,
      orderNo: grnNo,
    }));

    if (!grnNo) {
      setPurchaseGoodsReceivedData(null);
      return;
    }

    await fetchPurchaseGoodsReceived(grnNo);
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

  const totalQuantity = selectedGrnDetails.reduce(
    (sum: number, item: any) => sum + Number(item?.receivedQty || 0),
    0,
  );

  const totalAmount = Number(selectedGrnMaster?.totalAmount || 0);

  const cgstAmount = Number(selectedGrnMaster?.cgstAmount || 0);

  const sgstAmount = Number(selectedGrnMaster?.sgstAmount || 0);

  const miscellaneousAmount = Number(selectedGrnMaster?.missChargeAmount || 0);

  const grandTotal = Number(selectedGrnMaster?.netAmount || 0);

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

    if (!selectedGrnData) {
      toast.error("Please load GRN details");
      return;
    }

    console.log("Item Purchase Header:", formData);

    console.log("Selected GRN Data:", purchaseGoodsReceivedData);

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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
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

                    <input
                      type="text"
                      value={formData.departmentCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          departmentCode: e.target.value,
                        }))
                      }
                      placeholder="Department"
                      className={inputClass}
                    />
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
                        supplier: checked ? "Direct Purchase" : "",
                      }));

                      // Clear GRN data when switching to Direct Purchase
                      if (checked) {
                        setPurchaseGoodsReceivedData(null);
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        directIssue: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />

                  <span>Direct Issue</span>
                </label>
              </div>
            </div>
          </section>

          {/* =========================
              PURCHASE DETAILS TABLE
          ========================= */}

          {selectedGrnDetails.length > 0 && (
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
                        Received Qty
                      </th>

                

                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        Rate
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedGrnDetails.map((item: any, index: number) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =========================
              ORDER SUMMARY
          ========================= */}

          {selectedGrnData && (
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
          )}

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
