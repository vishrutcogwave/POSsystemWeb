import toast from "react-hot-toast";
import Header from "../components/Header";
import Loader from "../components/Loader";
import {
  getPurchaseOrderNumber,
  getPurchaseOrderGRNList,
  getSupplierList,
  getStoreMasterList,
  //   getItemStoreListByStoreId,
  getInventoryMiscList,
  purchaseOrderCalculation,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useEffect, useState } from "react";

type Supplier = {
  supCode: number;
  supName: string;
};

type Store = {
  storeId: number;
  storeName: string;
};

type InventoryItem = {
  itemCode: number;
  itemName: string;
};

type PurchaseOrderNumber = {
  poNo: number;
  status: string;
};

type GRNMaster = {
  poNo: number;
  poDate: string;
  supCode: number;
  branch_Code: string;
  orderBy: string;
  totalAmount: number;
  taxAmount: number;
  missChargeAmount: number;
  grossAmount: number;
  storeId: number;
  status: string;
  cgstAmount: number;
  sgstAmount: number;
  approvedBy: string;
  approvedDate: string;
  isApproved: boolean;
};

type GRNDetail = {
  poNo: number;
  itemCode: number;
  poItemQty: number;
  poOrderQty: number;
  poItemRate: number;
  branch_Code: string;
  unit: string;
  unitCode: number;
  poItemSuplyQty: number;
  cpoItemQty: number;
  taxCode: number;
  taxName: string;
  receivedQty: number;
  balanceQty: number;
};

type GRNResponse = {
  master: GRNMaster;
  details: GRNDetail[];
  taxes: any[];
  miscellaneous: any[];
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

const GoodsReceivedNote: React.FC = () => {
  const { appData } = useAppContext();
  const navigate = useNavigate();

  const branchCode = appData?.user?.branch_code || "";

  const [poNumbers, setPoNumbers] = useState<PurchaseOrderNumber[]>([]);
  const [selectedPoNo, setSelectedPoNo] = useState("");

  const [grnData, setGrnData] = useState<GRNResponse | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const [receivedQuantities, setReceivedQuantities] = useState<
    Record<number, number>
  >({});

  const [miscList, setMiscList] = useState<InventoryMisc[]>([]);
  const [miscRows, setMiscRows] = useState<MiscRow[]>([]);
  const [miscChargeId, setMiscChargeId] = useState("");
  const [miscAmount, setMiscAmount] = useState("");

  const [calculationResponse, setCalculationResponse] = useState<any>(null);

  const [grnNo, setGrnNo] = useState("");
  const [billNo, setBillNo] = useState("");
  const [grnDate, setGrnDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [confirmedBy, setConfirmedBy] = useState("");
  const [inspectedBy, setInspectedBy] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingGRN, setLoadingGRN] = useState(false);
  const [loadingPO, setLoadingPO] = useState(false);

  const inputClass =
    "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const disabledInputClass =
    "h-10 w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 text-sm text-gray-700 outline-none";

  const labelClass = "mb-1.5 block text-xs font-semibold text-gray-600";

  const formatNumber = (value: number | string | undefined) =>
    Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const getSupplierName = (supCode?: number) =>
    suppliers.find((x) => Number(x.supCode) === Number(supCode))?.supName ||
    `Supplier ${supCode || ""}`;

  const getStoreName = (storeId?: number) =>
    stores.find((x) => Number(x.storeId) === Number(storeId))?.storeName ||
    `Store ${storeId || ""}`;

  const getItemName = (itemCode?: number) =>
    inventoryItems.find((x) => Number(x.itemCode) === Number(itemCode))
      ?.itemName || `Item ${itemCode || ""}`;

  const fetchPurchaseOrderNumbers = async () => {
    if (!branchCode) return;

    try {
      setLoadingPO(true);
      const res = await getPurchaseOrderNumber(branchCode);
      if (res?.success) {
        setPoNumbers(res.data || []);
      } else {
        setPoNumbers([]);
        toast.error(res?.message || "Failed to fetch purchase orders");
      }
    } catch (error: any) {
      console.error(error);
      setPoNumbers([]);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch purchase orders",
      );
    } finally {
      setLoadingPO(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await getSupplierList(branchCode);
      setSuppliers(res?.success ? res.data || [] : []);
    } catch (error) {
      console.error("Supplier API error:", error);
      setSuppliers([]);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await getStoreMasterList(branchCode);
      setStores(res?.success ? res.data || [] : []);
    } catch (error) {
      console.error("Store API error:", error);
      setStores([]);
    }
  };

  //   const fetchInventoryItems = async (storeId: number) => {
  //     if (!storeId) return;

  //     try {
  //       const res = await getItemStoreListByStoreId(
  //         branchCode,
  //         String(storeId)
  //       );
  //       setInventoryItems(res?.success ? res.data || [] : []);
  //     } catch (error) {
  //       console.error("Inventory API error:", error);
  //       setInventoryItems([]);
  //     }
  //   };

  const fetchInventoryMiscList = async () => {
    try {
      const res = await getInventoryMiscList(branchCode);
      setMiscList(res?.success ? res.data || [] : []);
    } catch (error) {
      console.error("Misc API error:", error);
      setMiscList([]);
    }
  };

  const calculateGRN = async (
    data: GRNResponse,
    nextReceivedQuantities: Record<number, number>,
    nextMiscRows: MiscRow[] = [],
  ) => {
    if (!data) return null;

    const payload = {
      poNo: Number(data.master?.poNo || 0),

      storeId: Number(data.master?.storeId || 0),

      branch: branchCode,

      discount: 0,

      discountIn: "",

      poDetail: (data.details || []).map((item) => ({
        itemCode: Number(item.itemCode),

        // IMPORTANT:
        // Send current RECEIVED quantity
        poItemQty: Number(nextReceivedQuantities[item.itemCode] ?? 0),

        poItemRate: Number(item.poItemRate || 0),

        unit: item.unit || "",

        unitCode: Number(item.unitCode || 0),

        poItemSuplyQty: Number(nextReceivedQuantities[item.itemCode] ?? 0),

        cpoItemQty: Number(nextReceivedQuantities[item.itemCode] ?? 0),
      })),

      poMiscDetail: nextMiscRows.map((row) => {
        const selectedCharge = miscList.find(
          (charge) => Number(charge.chargeId) === Number(row.chargeId),
        );

        return {
          miscCharge: Number(row.amount || 0),

          miscChargeCode: Number(row.chargeId || 0),

          miscTaxCode: String(selectedCharge?.taxCode ?? ""),
        };
      }),
    };

    console.log("GRN Calculation Payload:", payload);

    const calculationRes = await purchaseOrderCalculation(payload);

    console.log("GRN Calculation Response:", calculationRes);

    setCalculationResponse(calculationRes);

    return calculationRes;
  };

  const fetchGRNDetails = async (poNo: number) => {
    if (!poNo) return;

    try {
      setLoadingGRN(true);

      setCalculationResponse(null);
      setMiscRows([]);
      setInventoryItems([]);

      const res = await getPurchaseOrderGRNList(poNo, branchCode);

      console.log("getPurchaseOrderGRNList Response:", res);

      if (!res?.success || !res?.data || !res.data.length) {
        setGrnData(null);
        setReceivedQuantities({});

        toast.error(res?.message || "No GRN details found");

        return;
      }

      /*
       * =========================
       * COMPLETE API OBJECT
       * =========================
       */

      const selectedGRN: GRNResponse = res.data[0];

      console.log("Selected GRN:", selectedGRN);

      /*
       * =========================
       * MASTER
       * =========================
       */

      setGrnData(selectedGRN);

      /*
       * =========================
       * RECEIVED QUANTITY
       * =========================
       */

      const initialReceivedQty: Record<number, number> = {};

      (selectedGRN.details || []).forEach((item) => {
        initialReceivedQty[item.itemCode] = Number(item.receivedQty || 0);
      });

      setReceivedQuantities(initialReceivedQty);

      const miscellaneous = selectedGRN.miscellaneous || [];

      const mappedMiscRows: MiscRow[] = miscellaneous.map(
        (charge: any, index: number) => ({
          id: Date.now() + 1000 + index,

          chargeId: Number(charge.chargeId || 0),

          chargeName: charge.chargeName || "",

          amount: Number(charge.chargeAmt || 0),
        }),
      );

      setMiscRows(mappedMiscRows);

      /*
       * Initial calculation
       */
      await calculateGRN(selectedGRN, initialReceivedQty, mappedMiscRows);
    } catch (error: any) {
      console.error("GRN API error:", error);

      setGrnData(null);

      setReceivedQuantities({});

      setMiscRows([]);

      setCalculationResponse(null);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch GRN details",
      );
    } finally {
      setLoadingGRN(false);
    }
  };
  const handlePurchaseOrderChange = async (
    selectedOption: {
      value: string;
      label: string;
    } | null,
  ) => {
    const value = selectedOption?.value || "";

    setSelectedPoNo(value);

    setGrnData(null);

    setReceivedQuantities({});

    setMiscRows([]);

    setCalculationResponse(null);

    if (!value) return;

    await fetchGRNDetails(Number(value));
  };
  const handleReceivedQtyChange = async (itemCode: number, value: string) => {
    if (!grnData) return;

    const item = grnData.details.find(
      (x) => Number(x.itemCode) === Number(itemCode),
    );

    if (!item) return;

    /*
     * Empty input
     */
    if (value === "") {
      const nextReceivedQuantities = {
        ...receivedQuantities,
        [itemCode]: 0,
      };

      setReceivedQuantities(nextReceivedQuantities);

      try {
        setLoading(true);

        await calculateGRN(grnData, nextReceivedQuantities, miscRows);
      } catch (error) {
        console.error("Error recalculating GRN:", error);

        toast.error("Quantity changed, but calculation failed");
      } finally {
        setLoading(false);
      }

      return;
    }

    const receivedQty = Number(value);

    const orderedQty = Number(item.poItemQty || 0);

    /*
     * Invalid number
     */
    if (Number.isNaN(receivedQty)) {
      return;
    }

    /*
     * Negative quantity
     */
    if (receivedQty < 0) {
      toast.error("Received quantity cannot be negative");

      return;
    }

    /*
     * More than ordered quantity
     */
    if (receivedQty > orderedQty) {
      toast.error(`Received quantity cannot be more than ${orderedQty}`);

      const nextReceivedQuantities = {
        ...receivedQuantities,
        [itemCode]: orderedQty,
      };

      setReceivedQuantities(nextReceivedQuantities);

      /*
       * Recalculate using corrected quantity
       */
      try {
        setLoading(true);

        await calculateGRN(grnData, nextReceivedQuantities, miscRows);
      } catch (error) {
        console.error("Error recalculating GRN:", error);
      } finally {
        setLoading(false);
      }

      return;
    }

    /*
     * =========================
     * NORMAL QUANTITY CHANGE
     * =========================
     */

    const nextReceivedQuantities = {
      ...receivedQuantities,
      [itemCode]: receivedQty,
    };

    /*
     * Update UI
     */
    setReceivedQuantities(nextReceivedQuantities);

    /*
     * Recalculate immediately
     * using latest quantity
     * + existing miscellaneous
     */
    try {
      setLoading(true);

      await calculateGRN(grnData, nextReceivedQuantities, miscRows);
    } catch (error) {
      console.error(
        "Error recalculating GRN after received quantity change:",
        error,
      );

      toast.error("Received quantity changed, but calculation failed");
    } finally {
      setLoading(false);
    }
  };
  const addMiscRow = async () => {
    if (!miscChargeId) {
      toast.error("Please select a particular");
      return;
    }

    if (!miscAmount || Number(miscAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!grnData) {
      toast.error("Please select a purchase order");
      return;
    }

    const selectedCharge = miscList.find(
      (charge) => Number(charge.chargeId) === Number(miscChargeId),
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

    setMiscChargeId("");
    setMiscAmount("");

    try {
      setLoading(true);

      await calculateGRN(grnData, receivedQuantities, nextMiscRows);

      toast.success("Miscellaneous charge added");
    } catch (error) {
      console.error("Error calculating GRN with miscellaneous charge:", error);

      toast.error("Miscellaneous charge added, but calculation failed");
    } finally {
      setLoading(false);
    }
  };
  const removeMiscRow = async (id: number) => {
    if (!grnData) return;

    const nextMiscRows = miscRows.filter((row) => row.id !== id);

    setMiscRows(nextMiscRows);

    try {
      setLoading(true);

      await calculateGRN(grnData, receivedQuantities, nextMiscRows);

      toast.success("Miscellaneous charge removed");
    } catch (error) {
      console.error(
        "Error recalculating GRN after removing miscellaneous charge:",
        error,
      );

      toast.error("Miscellaneous charge removed, but calculation failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!branchCode) return;

    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPurchaseOrderNumbers(),
          fetchSuppliers(),
          fetchStores(),
          fetchInventoryMiscList(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [branchCode]);

  const details = grnData?.details || [];

  const totalOrderedQty = details.reduce(
    (sum, item) => sum + Number(item.poItemQty || 0),
    0,
  );

  const summaryTotalQty = Number(
    calculationResponse?.totalQty ?? totalOrderedQty,
  );

  const summaryTotalAmount = Number(calculationResponse?.totalAmount ?? "");

  const summaryCgst = Number(
    calculationResponse?.cgstAmt ?? grnData?.master?.cgstAmount ?? 0,
  );

  const summarySgst = Number(
    calculationResponse?.sgstAmt ?? grnData?.master?.sgstAmount ?? 0,
  );

  const summaryMisc = Number(
    calculationResponse?.miscTotalAmount ??
      miscRows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
  );

  const summaryGrandTotal = Number(
    calculationResponse?.grandTotal ?? grnData?.master?.grossAmount ?? "",
  );

  return (
    <>
      {loading && <Loader />}

      <Header />

      <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:px-6">
        <div className="mx-auto w-full max-w-[1600px]">
          {/* HEADER */}
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Goods Received Note
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Select a purchase order and enter received quantities.
              </p>
            </div>
          </div>

          {/* GRN HEADER */}
          <section className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="text-base font-semibold text-gray-800">
                GRN Details
              </h2>
            </div>

            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {/* Order No */}
                <div>
                  <label className={labelClass}>Order No.</label>

                  <Select
                    value={
                      poNumbers
                        .map((po) => ({
                          value: String(po.poNo),
                          label: `${po.poNo}${po.status ? ` - ${po.status}` : ""}`,
                        }))
                        .find((option) => option.value === selectedPoNo) || null
                    }
                    onChange={handlePurchaseOrderChange}
                    options={poNumbers.map((po) => ({
                      value: String(po.poNo),
                      label: `${po.poNo}${po.status ? ` - ${po.status}` : ""}`,
                    }))}
                    isDisabled={loadingPO}
                    isSearchable
                    isClearable
                    placeholder={loadingPO ? "Loading..." : "Search Order No."}
                    noOptionsMessage={() => "No Order No. found"}
                    className="text-sm"
                    classNamePrefix="order-no"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: "40px",
                        height: "40px",
                      }),
                    }}
                  />
                </div>

                {/* PO Date */}
                <div>
                  <label className={labelClass}>PO Date</label>

                  <input
                    type="date"
                    disabled
                    value={formatDate(grnData?.master?.poDate)}
                    className={disabledInputClass}
                  />
                </div>

                {/* Supplier */}
                <div>
                  <label className={labelClass}>Supplier</label>

                  <input
                    disabled
                    value={getSupplierName(grnData?.master?.supCode)}
                    className={disabledInputClass}
                  />
                </div>

                {/* GRN No */}
                <div>
                  <label className={labelClass}>GRN No.</label>

                  <input
                    value={grnNo}
                    onChange={(e) => setGrnNo(e.target.value)}
                    placeholder="GRN No."
                    className={inputClass}
                  />
                </div>

                {/* Bill No */}
                <div>
                  <label className={labelClass}>Bill No.</label>

                  <input
                    value={billNo}
                    onChange={(e) => setBillNo(e.target.value)}
                    placeholder="Bill No."
                    className={inputClass}
                  />
                </div>

                {/* GRN Date */}
                <div>
                  <label className={labelClass}>GRN Date</label>

                  <input
                    type="date"
                    value={grnDate}
                    onChange={(e) => setGrnDate(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Ordered By */}
                <div>
                  <label className={labelClass}>Ordered By</label>

                  <input
                    disabled
                    value={grnData?.master?.orderBy || ""}
                    className={disabledInputClass}
                  />
                </div>

                {/* Confirmed By */}
                <div>
                  <label className={labelClass}>Confirmed By</label>

                  <input
                    value={confirmedBy}
                    onChange={(e) => setConfirmedBy(e.target.value)}
                    placeholder="Confirmed By"
                    className={inputClass}
                  />
                </div>

                {/* Inspected By */}
                <div>
                  <label className={labelClass}>Inspected By</label>

                  <input
                    value={inspectedBy}
                    onChange={(e) => setInspectedBy(e.target.value)}
                    placeholder="Inspected By"
                    className={inputClass}
                  />
                </div>

                {/* Store */}
                <div>
                  <label className={labelClass}>Store</label>

                  <input
                    disabled
                    value={getStoreName(grnData?.master?.storeId)}
                    className={disabledInputClass}
                  />
                </div>

                {/* PO Status */}
                <div>
                  <label className={labelClass}>PO Status</label>

                  <input
                    disabled
                    value={grnData?.master?.status || ""}
                    className={disabledInputClass}
                  />
                </div>

                {/* Approved By */}
                <div>
                  <label className={labelClass}>Approved By</label>

                  <input
                    disabled
                    value={grnData?.master?.approvedBy || ""}
                    className={disabledInputClass}
                  />
                </div>

                {/* Approved Date */}
                <div>
                  <label className={labelClass}>Approved Date</label>

                  <input
                    disabled
                    value={
                      grnData?.master?.approvedDate
                        ? new Date(grnData.master.approvedDate).toLocaleString(
                            "en-IN",
                          )
                        : ""
                    }
                    className={disabledInputClass}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* DETAIL */}
          <section className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="text-base font-semibold text-gray-800">
                GRN Detail
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead>
                  <tr className="bg-gray-100 text-xs font-semibold uppercase text-gray-600">
                    <th className="px-4 py-3 text-center">Sl No</th>
                    <th className="px-4 py-3 text-left">Code</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Unit</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Received Qty</th>
                    <th className="px-4 py-3 text-right">Balance Qty</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingGRN ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-gray-500"
                      >
                        Loading purchase order details...
                      </td>
                    </tr>
                  ) : !selectedPoNo ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-gray-400"
                      >
                        Select a purchase order to view details
                      </td>
                    </tr>
                  ) : details.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-gray-400"
                      >
                        No purchase order items found
                      </td>
                    </tr>
                  ) : (
                    details.map((item, index) => {
                      const orderedQty = Number(item.poItemQty || 0);
                      const receivedQty = Number(
                        receivedQuantities[item.itemCode] ?? 0,
                      );
                      const balanceQty = Math.max(0, orderedQty - receivedQty);

                      return (
                        <tr
                          key={`${item.poNo}-${item.itemCode}-${index}`}
                          className="border-t border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-center">{index + 1}</td>

                          <td className="px-4 py-3 font-medium">
                            {item.itemCode}
                          </td>

                          <td className="px-4 py-3 font-medium">
                            {getItemName(item.itemCode)}
                          </td>

                          <td className="px-4 py-3">{item.unit}</td>

                          <td className="px-4 py-3 text-right font-semibold">
                            {formatNumber(orderedQty)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              min="0"
                              max={orderedQty}
                              step="any"
                              value={receivedQuantities[item.itemCode] ?? 0}
                              onChange={(e) =>
                                handleReceivedQtyChange(
                                  item.itemCode,
                                  e.target.value,
                                )
                              }
                              className="h-9 w-28 rounded-md border border-blue-300 bg-white px-2 text-right text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </td>

                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-flex min-w-[75px] justify-end rounded-md px-2 py-1 font-semibold ${
                                balanceQty === 0
                                  ? "bg-green-50 text-green-700"
                                  : "bg-orange-50 text-orange-700"
                              }`}
                            >
                              {formatNumber(balanceQty)}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            ₹ {formatNumber(item.poItemRate)}
                          </td>

                          <td className="px-4 py-3 text-right font-semibold">
                            ₹{" "}
                            {formatNumber(
                              orderedQty * Number(item.poItemRate || 0),
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* MISCELLANEOUS */}
          <section className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h3 className="text-base font-semibold text-gray-800">
                Miscellaneous Charges
              </h3>
            </div>

            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                <div className="sm:col-span-2 lg:col-span-6">
                  <label className={labelClass}>Particular</label>

                  <select
                    value={miscChargeId}
                    onChange={(e) => setMiscChargeId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select Particular</option>

                    {miscList.map((charge) => (
                      <option key={charge.chargeId} value={charge.chargeId}>
                        {charge.chargeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-4">
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

                <div className="lg:col-span-2">
                  <button
                    type="button"
                    onClick={addMiscRow}
                    className="h-10 w-full rounded-lg bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    + Add Misc
                  </button>
                </div>
              </div>
            </div>

            {miscRows.length > 0 && (
              <div className="overflow-x-auto border-t border-gray-200">
                <table className="w-full min-w-[650px] text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-xs font-semibold uppercase text-gray-600">
                      <th className="px-4 py-3 text-left">Particular</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {miscRows.map((row) => (
                      <tr key={row.id} className="border-t border-gray-200">
                        <td className="px-4 py-3 font-medium">
                          {row.chargeName}
                        </td>

                        <td className="px-4 py-3 text-right font-medium">
                          ₹ {row.amount.toFixed(2)}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeMiscRow(row.id)}
                            className="rounded-md px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
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

          {/* ORDER SUMMARY */}
          <div className="mb-8 flex justify-end">
            <div className="w-full max-w-[430px] rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="mb-4 border-b border-gray-200 pb-3 text-base font-semibold text-gray-800">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Total Quantity</span>
                  <span className="font-medium">
                    {formatNumber(summaryTotalQty)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-medium">
                    ₹ {summaryTotalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">CGST</span>
                  <span className="font-medium">
                    ₹ {summaryCgst.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">SGST</span>
                  <span className="font-medium">
                    ₹ {summarySgst.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Miscellaneous</span>
                  <span className="font-medium">
                    ₹ {summaryMisc.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between gap-4">
                    <span className="text-base font-bold text-gray-800">
                      Grand Total
                    </span>

                    <span className="text-lg font-bold text-blue-600">
                      ₹ {summaryGrandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mb-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GoodsReceivedNote;
