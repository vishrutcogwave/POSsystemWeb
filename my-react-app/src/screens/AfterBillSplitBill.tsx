import  { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  getBillDropdown,
  getCompanyInfo,
  getKOTSplitBillDetails,
  getOpenDayDetails,
  getOutletList,
  getTaxSettings,
  saveSplitBillDetails,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import { printSplitBill } from "../api/services/printer";

type Outlet = {
  oltCode: number | string;
  oltName: string;
  [key: string]: any;
};

type BillDropdownItem = {
  ksmId: number;
  oltCode: number;
  ksmBillNo: string;
  kotId: number;
  ksmBillDate: string;
  ksmTblNo: string;
  ksmsubtblno: string;
  branch_Code: string;
  [key: string]: any;
};

type SplitItem = {
  key: string;
  itemCode: number;
  itemName: string;
  rate: number;
  availableQty: number;
  discount: number;
  sourceDetails: any[];
};

const formatPOSDate = (dateValue?: string) => {
  if (!dateValue) return "";
  const [year, month, day] = dateValue.split("T")[0].split("-");
  if (!year || !month || !day) return "";
  return `${month}/${day}/${year}`;
};

export default function AfterBillSplitBill() {
  const { appData } = useAppContext();
  const branchCode = appData?.user?.branch_code || "";

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutletCode, setSelectedOutletCode] = useState("");
  const [posDate, setPosDate] = useState("");
  const [billList, setBillList] = useState<BillDropdownItem[]>([]);
  const [selectedBill, setSelectedBill] = useState<BillDropdownItem | null>(null);

  const [kotData, setKotData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOutlets, setLoadingOutlets] = useState(false);
  const [loadingBills, setLoadingBills] = useState(false);
  const [loadingKot, setLoadingKot] = useState(false);
  const [savingSplit, setSavingSplit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [billCountInput, setBillCountInput] = useState("2");
  const [allocations, setAllocations] = useState<Record<string, number[]>>({});
const [_companyInfo, setCompanyInfo] = useState<any>(null);
  // Keep each original KOT detail as a separate allocation row. This ensures
  // every split food row is saved against the correct source KOT ID.
   const [taxSettings, setTaxSettings] = useState<any>(null);

    const fetchTaxSettings = async () => {
      try {
        const branch = localStorage.getItem("branch") || "";
        const data = await getTaxSettings(branch);
  
        console.log("Tax Settings:", data);
        setTaxSettings(data);
      } catch (err) {
        console.error("Tax fetch failed", err);
      }
    };
  const fetchCompany = useCallback(async () => {
  try {
    const branch = localStorage.getItem("branch") || branchCode;
    const data = await getCompanyInfo(branch);

    console.log("Company Info:", data);
    setCompanyInfo(data);
  } catch (error) {
    console.error("Company fetch failed:", error);
  }
}, [branchCode]);
const splitItems = useMemo<SplitItem[]>(() => {
  const rows: SplitItem[] = [];

  kotData.forEach((kot: any, kotIndex: number) => {
    (kot.kotDetails || []).forEach((detail: any, detailIndex: number) => {
      const source = {
        ...detail,
        kotId: kot.kotId,
        kotNo: kot.kotNo,
        stwCode: kot.stwCode,
        stwName: kot.stwName,
        kotTblNo: kot.kotTblNo,
        subTable: kot.subTable,
        kotSeatsServed: kot.kotSeatsServed,
        branch_code: kot.branch_code,
      };

      const itemCode = Number(detail.itemCode || 0);
      const rate = Number(detail.kotdRate || 0);
      const discount = Number(detail.itemDiscount || 0);
      const qty = Number(detail.kotdQty || 0);

      rows.push({
        key: `${kot.kotId}_${itemCode}_${rate}_${discount}_${kotIndex}_${detailIndex}`,
        itemCode,
        itemName: detail.itemName || "Unknown Item",
        rate,
        availableQty: qty,
        discount,
        sourceDetails: [source],
      });
    });
  });

  return rows;
}, [kotData]);

  const totalAvailableQty = splitItems.reduce(
    (total, item) => total + item.availableQty,
    0,
  );
  const billCount = Number(billCountInput);

  const fetchOutlets = useCallback(async () => {
    if (!branchCode) return;
    try {
      setLoadingOutlets(true);
      const response = await getOutletList(branchCode);
      const list: Outlet[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setOutlets(list);

      if (list.length) {
        const savedCode = localStorage.getItem("activeOltCode") || "";
        const initial = list.find(
          (item) => String(item.oltCode) === String(savedCode),
        ) || list[0];
        setSelectedOutletCode(String(initial.oltCode));
      } else {
        setSelectedOutletCode("");
      }
    } catch (error) {
      console.error("Failed to fetch outlets:", error);
      toast.error("Unable to load outlets");
    } finally {
      setLoadingOutlets(false);
    }
  }, [branchCode]);

  const fetchOpenDay = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getOpenDayDetails(
        appData?.user?.userCode || 0,
        branchCode,
      );
      setPosDate(formatPOSDate(response?.shiftDate));
      if (!response?.shiftDate) {
        setErrorMessage("POS date is not available in open-day details.");
      } else {
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Failed to fetch open-day details:", error);
      setErrorMessage("Unable to load POS date.");
    } finally {
      setLoading(false);
    }
  }, [appData?.user?.userCode, branchCode]);

  const fetchBills = useCallback(async () => {
    if (!selectedOutletCode || !posDate || !branchCode) {
      setBillList([]);
      setSelectedBill(null);
      return;
    }

    try {
      setLoadingBills(true);
      setBillList([]);
      setSelectedBill(null);
      setKotData([]);
      const response = await getBillDropdown(
        selectedOutletCode,
        posDate,
        branchCode,
      );
      setBillList(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch bill dropdown:", error);
      setBillList([]);
      toast.error("Unable to load bill list");
    } finally {
      setLoadingBills(false);
    }
  }, [selectedOutletCode, posDate, branchCode]);

useEffect(() => {
  void fetchOutlets();
  void fetchOpenDay();
  void fetchCompany();
  void fetchTaxSettings()
}, [fetchOutlets, fetchOpenDay, fetchCompany,fetchTaxSettings]);

  useEffect(() => {
    if (selectedOutletCode) {
      localStorage.setItem("activeOltCode", selectedOutletCode);
    }
    void fetchBills();
  }, [selectedOutletCode, posDate, fetchBills]);

  // Automatically fetch KOT item details whenever a bill is selected.
  const handleBillChange = async (billId: string) => {
    const bill = billList.find(
      (item) => String(item.ksmId) === billId,
    ) || null;

    setSelectedBill(bill);
    setKotData([]);
    setAllocations({});
    setBillCountInput("2");

    if (!bill) return;

    const kotId = Number(bill.kotId || 0);
    if (!kotId) {
      toast.error("KOT ID is missing in the selected bill details");
      return;
    }

    try {
      setLoadingKot(true);
      const payload = [{
        kotId,
        kotNo: String(kotId),
        oltCode: Number(bill.oltCode || selectedOutletCode || 0),
        kotTblNo: String(bill.ksmTblNo || ""),
        subTable: String(bill.ksmsubtblno || "A"),
        posDate: bill.ksmBillDate || "",
        branch_code: bill.branch_Code || localStorage.getItem("branch") || branchCode,
      }];

      console.log("Split Bill Payload:", payload);
      const response = await getKOTSplitBillDetails(payload);
      console.log("Split Bill API Response:", response);

      if (!response?.success) {
        toast.error(response?.message || "Failed to fetch KOT details");
        return;
      }

      const details = response?.data?.kotMasterAndDetails || [];
      if (!Array.isArray(details) || details.length === 0) {
        toast.error("No items available for split bill");
        return;
      }

      setKotData(details);
    } catch (error: any) {
      console.error("KOT split details error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch KOT details",
      );
    } finally {
      setLoadingKot(false);
    }
  };

  // Initialize allocation inputs whenever the selected bill's item list changes.
  useEffect(() => {
    setAllocations(
      Object.fromEntries(
        splitItems.map((item) => [item.key, [0, 0]]),
      ),
    );
  }, [splitItems]);

  // Resize allocation columns when the requested bill count changes.
  useEffect(() => {
    if (
      !Number.isInteger(billCount) ||
      billCount < 2 ||
      billCount > totalAvailableQty
    ) return;

    setAllocations((previous) => {
      const updated = { ...previous };
      splitItems.forEach((item) => {
        const current = updated[item.key] || [];
        updated[item.key] = Array.from(
          { length: billCount },
          (_, index) => current[index] || 0,
        );
      });
      return updated;
    });
  }, [billCount, splitItems, totalAvailableQty]);

  const updateBillCount = (value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value === "") {
      setBillCountInput("");
      return;
    }
    const count = Number(value);
    if (count >= 2 && count > totalAvailableQty) {
      toast.error(`Maximum ${totalAvailableQty} bills allowed based on available quantity`);
      return;
    }
    setBillCountInput(value);
  };

  const updateQuantity = (
    item: SplitItem,
    billIndex: number,
    value: string,
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newQty = Number(value || 0);
    const current = allocations[item.key] || [];
    const allocatedInOtherBills = current.reduce(
      (total, qty, index) => index === billIndex ? total : total + qty,
      0,
    );
    const remainingQty = item.availableQty - allocatedInOtherBills;

    if (newQty > remainingQty) {
      toast.error(`Only ${remainingQty} quantity available for ${item.itemName}`);
      return;
    }

    setAllocations((previous) => {
      const updated = [...(previous[item.key] || [])];
      updated[billIndex] = newQty;
      return { ...previous, [item.key]: updated };
    });
  };

  const getAllocatedQty = (item: SplitItem) =>
    (allocations[item.key] || []).reduce((total, qty) => total + qty, 0);

  const getRemainingQty = (item: SplitItem) =>
    item.availableQty - getAllocatedQty(item);

  const getBillQty = (billIndex: number) =>
    splitItems.reduce(
      (total, item) => total + (allocations[item.key]?.[billIndex] || 0),
      0,
    );

  const getBillTotal = (billIndex: number) =>
    splitItems.reduce((total, item) => {
      const qty = allocations[item.key]?.[billIndex] || 0;
      return total + qty * item.rate;
    }, 0);

  const validBillCount =
    billCountInput !== "" &&
    Number.isInteger(billCount) &&
    billCount >= 2 &&
    billCount <= totalAvailableQty;

  const allItemsFullyAllocated = splitItems.every(
    (item) => getAllocatedQty(item) === item.availableQty,
  );

  const allBillsHaveItems =
    Number.isInteger(billCount) &&
    billCount >= 2 &&
    Array.from({ length: billCount }, (_, index) => getBillQty(index))
      .every((qty) => qty >= 1);

  const canConfirm =
    splitItems.length > 0 &&
    validBillCount &&
    allItemsFullyAllocated &&
    allBillsHaveItems;

  const handleConfirmSplit = async () => {
    if (savingSplit) return;

    if (!selectedBill) {
      toast.error("Please select a bill");
      return;
    }

    if (!validBillCount) {
      toast.error("Minimum 2 bills are required");
      return;
    }

    const emptyBills = Array.from(
      { length: billCount },
      (_, index) => index + 1,
    ).filter((billNo) => getBillQty(billNo - 1) < 1);

    if (emptyBills.length) {
      toast.error(`Bill ${emptyBills.join(", Bill ")} must contain at least 1 quantity`);
      return;
    }

    if (!allItemsFullyAllocated) {
      toast.error("Please allocate the complete quantity of every item");
      return;
    }

    const branch =
      selectedBill.branch_Code ||
      localStorage.getItem("branch") ||
      branchCode;
    const outletCode = Number(selectedBill.oltCode || selectedOutletCode || 0);
    const outletName = selectedOutlet?.oltName || "";
    const now = new Date().toISOString();

    // Tax/discount amounts are not calculated by this allocation screen.
    // Preserve the original bill tax metadata when the dropdown provides it;
    // backend should recalculate split tax if it supports that behavior.
    const originalBillTax = Number(
      selectedBill.ksmBillTaxAmt ?? selectedBill.ksmTaxAmt ?? selectedBill.billTaxAmt ?? 0,
    );
    const originalBillSubtotal = Number(
      selectedBill.ksmBillAmount ?? selectedBill.billAmount ?? selectedBill.ksmSubTotal ?? 0,
    );

    const apiPayload = Array.from({ length: billCount }, (_, billIndex) => {

  const subTableLetter = String.fromCharCode(65 + billIndex);

  // Get allocated items for this bill
  const billItems = splitItems.filter(
    (item) => (allocations[item.key]?.[billIndex] || 0) > 0,
  );

  // Get the source KOT of the first allocated item
  const sourceKot = billItems[0]?.sourceDetails?.[0] || {};

  const allocatedItems = billItems.map((item) => {
    const qty = allocations[item.key]?.[billIndex] || 0;
    const source = item.sourceDetails?.[0] || {};

    return {
      kotId: Number(source.kotId || 0),
      id: Number(item.itemCode),
      food: item.itemName,
      code: String(item.itemCode),
      price: Number(item.rate || 0),
      qty,
      comment: source.comment || source.kotdRemarks || "",
      category: Number(source.catCode || 0),
      grpCode: Number(source.grpcode || 0),
      origQty: qty,
      itemDiscountAllowed: source.itemDiscountAllowed ?? true,
    };
  });

  const subtotal = Number(getBillTotal(billIndex).toFixed(2));

  const proportionalTax = originalBillSubtotal > 0
    ? Number(
        ((originalBillTax * subtotal) / originalBillSubtotal).toFixed(2),
      )
    : 0;

  return {
    afterBill: true,
    billType: "SPLIT",
    billCount,
    noofCount: billIndex + 1,

    kotId: Number(sourceKot.kotId || selectedBill.kotId || 0),
    kotNo: String(sourceKot.kotNo || sourceKot.kotId || selectedBill.kotId || ""),

    ksmId: Number(selectedBill.ksmId || 0),
    ksmBillNo: String(selectedBill.ksmBillNo || ""),

    settledDate: selectedBill.ksmBillDate || now,

    kotTblNo: String(
      sourceKot.kotTblNo || selectedBill.ksmTblNo || "",
    ),

    oltCode: outletCode,
    branch_Code: branch,

    billAmount: subtotal,
    billTaxAmt: proportionalTax,
    billDiscount: 0,

    grpCode: 0,
    reason: "After Bill Split",

    cart: {
      userCode: Number(appData?.user?.userCode || 0),

      table: String(
        sourceKot.kotTblNo || selectedBill.ksmTblNo || "",
      ),

      subTable: subTableLetter,

      outlet: outletCode,
      outletName,

      // Map directly from KOT master response
      waiter: Number(sourceKot.stwCode || 0),
      waiterName: String(sourceKot.stwName || ""),
      pax: Number(sourceKot.kotSeatsServed || 0),

      food: allocatedItems,

      total: subtotal,
      totQty: getBillQty(billIndex),

      branch,
      type: "K",
      ncCode: 0,
      ncRemarks: "",

      discount: 0,
      discountIn: "amt",
      discountType: "",
      discountRemarks: "",
      discountGroups: [""],

      vRemarks: "",
      mode: "ADD",
      subBillType: "",

      plan: selectedBill.plan || selectedBill.planId || "",

      // Guest details from selected bill
      guestName: selectedBill.guestName || "",
      guestCode: selectedBill.guestCode || "",
      checkInNo: selectedBill.checkinNo || selectedBill.checkInNo || "",

      kotMobileNo: "",
      kotMinTimer: 0,

      taxType:   taxSettings?.taxType || "normaltax", // ✅ IMPORTANT

      homeDelivary: {
        guestCode: 0,
        titleGn1: 0,
        guestName: "",
        dob: now,
        address: "",
        city: "",
        phone: "",
        email: "",
        remarks: "",
        lastModify: now,
        discount: 0,
        branch_code: branch,
        isUpdate: 0,
      },
    },
  };
});

    try {
      setSavingSplit(true);
      console.log("AFTER BILL SPLIT SAVE PAYLOAD:", apiPayload);
     debugger
      const kotIds = [
  ...new Set(
    kotData
      .map((kot: any) => Number(kot.kotId))
      .filter((id: number) => id > 0),
  ),
];

if (kotIds.length === 0) {
  toast.error("No valid KOT IDs found");
  return;
}

const multiKots = kotIds.join(",");
const isMultiKOT = kotIds.length > 1;

console.log("Multi KOT IDs:", multiKots);
console.log("Is Multi KOT:", isMultiKOT);

const response = await saveSplitBillDetails(
  apiPayload,
  multiKots,
  isMultiKOT,
);
      console.log("AFTER BILL SPLIT SAVE RESPONSE:", response);

   // Check save response
if (response?.success === false) {
  throw new Error(response?.message || "After bill split save failed");
}

// =====================================
// PRINT ALL AFTER SPLIT BILLS
// =====================================

const splitBills = response?.data || [];

console.log("AFTER BILL SPLIT PRINT DATA:", splitBills);

if (!Array.isArray(splitBills) || splitBills.length === 0) {
  toast.error("Split bills saved, but no print details returned");
} else {
  // Get printer IP from first split bill
  const printerIp =
    splitBills[0]?.printers?.[0]?.ipAddress || "";

  console.log("Printer IP:", printerIp);

  // Print each split bill separately
  const printResult = await printSplitBill(
    splitBills,
    _companyInfo,
    printerIp
  );

  console.log("AFTER BILL SPLIT PRINT RESULT:", printResult);

  if (!printResult.success) {
    toast.error(
      printResult.message || "After bill split printing failed"
    );

  } else {
    toast.success(
      `All ${printResult.printedBills} split bills printed successfully!`
    );
  }
}

// =====================================
// CLEAR AFTER SUCCESSFUL SAVE
// =====================================

toast.success("After Bill Split saved successfully");

setKotData([]);
setAllocations({});
setSelectedBill(null);

setBillList((previous) =>
  previous.filter(
    (bill) => String(bill.ksmId) !== String(selectedBill.ksmId)
  )
);
      toast.success(response?.message || "After bill split saved successfully");
      setKotData([]);
      setAllocations({});
      setSelectedBill(null);
      setBillList((previous) => previous.filter(
        (bill) => String(bill.ksmId) !== String(selectedBill.ksmId),
      ));
    } catch (error: any) {
      console.error("After Bill Split Save Error:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save after bill split",
      );
    } finally {
      setSavingSplit(false);
    }
  };

  const selectedOutlet = outlets.find(
    (outlet) => String(outlet.oltCode) === selectedOutletCode,
  );

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {(loading || loadingOutlets || loadingKot || savingSplit) && <Loader />}

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              After Bill Split
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Select a bill and allocate its item quantities across multiple bills.
            </p>
          </div>
        </div>

        {/* BILL SELECTION */}
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Bill Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Outlet</label>
              <select
                value={selectedOutletCode}
                onChange={(event) => {
                  setSelectedOutletCode(event.target.value);
                  setSelectedBill(null);
                  setBillList([]);
                  setKotData([]);
                  setAllocations({});
                }}
                disabled={loadingOutlets}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">
                  {loadingOutlets ? "Loading outlets..." : "Select Outlet"}
                </option>
                {outlets.map((outlet) => (
                  <option key={String(outlet.oltCode)} value={String(outlet.oltCode)}>
                    {outlet.oltName} ({outlet.oltCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">POS Date</label>
              <input
                value={posDate}
                readOnly
                placeholder="POS Date"
                className="border rounded-lg px-3 py-2 text-sm bg-gray-100"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Bill Number</label>
              <select
                value={selectedBill ? String(selectedBill.ksmId) : ""}
                onChange={(event) => void handleBillChange(event.target.value)}
                disabled={loadingBills || !selectedOutletCode || !posDate}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">
                  {loadingBills
                    ? "Loading Bills..."
                    : billList.length
                      ? "Select Bill"
                      : "No Bills Available"}
                </option>
                {billList.map((bill) => (
                  <option key={bill.ksmId} value={String(bill.ksmId)}>
                    Bill {bill.ksmBillNo} - Table {bill.ksmTblNo}
                    {bill.ksmsubtblno ? ` / ${bill.ksmsubtblno}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600 mt-3">{errorMessage}</p>
          )}

          {selectedBill && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 border rounded-lg p-3 bg-gray-50">
              <div>
                <p className="text-xs text-gray-500">Bill Number</p>
                <p className="font-semibold text-sm">{selectedBill.ksmBillNo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Table</p>
                <p className="font-semibold text-sm">{selectedBill.ksmTblNo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sub Table</p>
                <p className="font-semibold text-sm">{selectedBill.ksmsubtblno || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Outlet</p>
                <p className="font-semibold text-sm">{selectedOutlet?.oltName || selectedBill.oltCode}</p>
              </div>
            </div>
          )}
        </div>

        {/* SPLIT ALLOCATION */}
        {selectedBill && !loadingKot && kotData.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4 md:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-semibold">Split Bill Items</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">
                  Number of Bills
                </label>
                <input
                  type="number"
                  min={2}
                  max={totalAvailableQty}
                  step={1}
                  value={billCountInput}
                  onChange={(event) => updateBillCount(event.target.value)}
                  className="w-full sm:w-36 border rounded-lg px-3 py-2 text-sm text-center"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>Total Items: <strong>{splitItems.length}</strong></span>
              <span>Total Available Quantity: <strong>{totalAvailableQty}</strong></span>
              <span>Table: <strong>{selectedBill.ksmTblNo}</strong></span>
              <span>Sub Table: <strong>{selectedBill.ksmsubtblno || "A"}</strong></span>
            </div>

            {billCountInput !== "" && billCount < 2 && (
              <p className="text-xs text-red-600">Minimum 2 bills are required.</p>
            )}

            {validBillCount ? (
              <>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Allocate Item Quantities
                  </h3>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full min-w-[720px] text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-3 min-w-[180px]">Item</th>
                          <th className="text-center p-3">Rate</th>
                          <th className="text-center p-3">Available</th>
                          {Array.from({ length: billCount }, (_, index) => (
                            <th key={index} className="text-center p-3 min-w-[100px]">
                              Bill {index + 1}
                            </th>
                          ))}
                          <th className="text-center p-3">Remaining</th>
                        </tr>
                      </thead>
                      <tbody>
                        {splitItems.map((item) => (
                          <tr key={item.key} className="border-t hover:bg-gray-50">
                            <td className="p-3">
                              <div className="font-semibold text-gray-800">{item.itemName}</div>
                              <div className="text-xs text-gray-500">Code: {item.itemCode}</div>
                            </td>
                            <td className="text-center p-3">₹{item.rate.toFixed(2)}</td>
                            <td className="text-center p-3 font-semibold">{item.availableQty}</td>
                            {Array.from({ length: billCount }, (_, index) => (
                              <td key={index} className="p-2 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={allocations[item.key]?.[index] ?? 0}
                                  onChange={(event) =>
                                    updateQuantity(item, index, event.target.value)
                                  }
                                  className="w-16 border rounded-md px-2 py-2 text-center outline-none focus:border-[#0576B2]"
                                />
                              </td>
                            ))}
                            <td className="text-center p-3">
                              <span className={`font-semibold ${getRemainingQty(item) === 0 ? "text-green-600" : "text-orange-600"}`}>
                                {getRemainingQty(item)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Bill Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: billCount }, (_, index) => {
                      const qty = getBillQty(index);
                      const empty = qty < 1;
                      return (
                        <div key={index} className={`border rounded-lg p-3 ${empty ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-700">Bill {index + 1}</span>
                            <span className={`text-xs font-semibold ${empty ? "text-red-600" : "text-green-600"}`}>
                              {empty ? "Empty" : "Assigned"}
                            </span>
                          </div>
                          <div className="text-xl font-bold text-[#0576B2] mt-1">
                            ₹{getBillTotal(index).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{qty} total quantity</div>
                          {empty && <p className="text-xs text-red-600 mt-2">Assign at least 1 quantity to this bill.</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={`rounded-lg border p-3 ${canConfirm ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-semibold text-sm">Quantity Allocation</span>
                    <span className={`text-sm font-bold ${canConfirm ? "text-green-700" : "text-orange-700"}`}>
                      {canConfirm ? "Completed" : "Pending"}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-gray-600">
                    {splitItems.reduce((total, item) => total + getAllocatedQty(item), 0)} / {totalAvailableQty} quantities allocated.
                  </p>
                  {!allBillsHaveItems && (
                    <p className="text-xs text-red-600 mt-2">Every bill must contain at least 1 quantity.</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleConfirmSplit}
                    disabled={!canConfirm || savingSplit}
                    className="bg-[#0576B2] hover:bg-blue-700 text-white px-5 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {savingSplit ? "Saving..." : "Confirm Split"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-6">
                Enter at least 2 valid bills to allocate items.
              </div>
            )}
          </div>
        )}

        {selectedBill && !loadingKot && kotData.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-sm text-gray-500">
            No KOT item details to display.
          </div>
        )}
      </div>
    </>
  );
}
