import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getSupplierList,
  getSuppliedBills,
  getPaymentModeMaster,
  saveSuppliedSettlement,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import Loader from "../components/Loader";
import PaymentModal from "../components/PaymentModelForCompany";

type Supplier = {
  supCode: string | number;
  supName: string;
  [key: string]: any;
};

type SupplierBill = {
  pNo: number;
  supCode: string;
  supplierName?: string;
  billno: string;
  storeId?: number;
  grnNo?: string;
  pTotalAmount?: number;
  taxAmount?: number;
  discount?: number;
  netamount?: number;
  pType?: string;
  pDate?: string;
  paidAmount?: number;
  balanceAmount?: number;
  [key: string]: any;
};

const emptySummary = {
  totalAmount: 0,
  paidAmount: 0,
  balanceAmount: 0,
};

const money = (value: number | string | undefined) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const SupplierSettlement: React.FC = () => {
  const { appData } = useAppContext();
  const branchCode = appData?.user?.branch_code || "";
  const userCode = String(appData?.user?.userCode || "");

  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [bills, setBills] = useState<SupplierBill[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [selectedBill, setSelectedBill] = useState<SupplierBill | null>(null);
  const [fullSettlement, setFullSettlement] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

const fetchSuppliers = async () => {
  try {
    setLoading(true);

    const response = await getSupplierList(branchCode);
    const data = response?.data;

    const supplierList = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];

    setSuppliers([
      {
        supCode: "0",
        supName: "Direct Purchase",
      },
      ...supplierList,
    ]);

    if (!response?.success) {
      toast.error(response?.message || "Failed to fetch suppliers");
    }
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
    toast.error("Failed to fetch suppliers");

    setSuppliers([
      {
        supCode: "0",
        supName: "Direct Purchase",
      },
    ]);
  } finally {
    setLoading(false);
  }
};

  const fetchPaymentModes = async () => {
    try {
      const response = await getPaymentModeMaster(branchCode);
      setPaymentModes(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error("Failed to fetch payment modes:", error);
      toast.error("Failed to load payment modes");
    }
  };

  const fetchBills = async (supplierCode = selectedSupplier) => {
    if (!supplierCode) {
      setBills([]);
      setSummary(emptySummary);
      return;
    }

    try {
      setLoading(true);
      const response = await getSuppliedBills(Number(supplierCode), branchCode);

      if (!response?.success) {
        toast.error(response?.message || "Failed to fetch supplier bills");
        setBills([]);
        setSummary(emptySummary);
        return;
      }

      // API response: { success, data: { totalAmount, paidAmount, balanceAmount, bills } }
      const data = response.data || {};
      const normalizedBills: SupplierBill[] = (data.bills || []).map((bill: SupplierBill) => {
        const billAmount = Number(bill.netamount ?? bill.pTotalAmount ?? 0);
        const paidAmount = Number(bill.paidAmount || 0);
        // Some API bill-level balanceAmount values can be zero/negative even when
        // the bill still has a pending amount. Calculate the outstanding balance.
        const balanceAmount = Math.max(0, billAmount - paidAmount);
        return { ...bill, billAmount, paidAmount, balanceAmount };
      });

      setSummary({
        totalAmount: Number(data.totalAmount ?? normalizedBills.reduce((sum, bill) => sum + Number(bill.billAmount || 0), 0)),
        paidAmount: Number(data.paidAmount ?? normalizedBills.reduce((sum, bill) => sum + Number(bill.paidAmount || 0), 0)),
        balanceAmount: Number(data.balanceAmount ?? normalizedBills.reduce((sum, bill) => sum + Number(bill.balanceAmount || 0), 0)),
      });
    // Show only bills that have a pending balance
const pendingBills = normalizedBills.filter(
  (bill) => Number(bill.balanceAmount || 0) > 0
);

setBills(pendingBills);
      setSelectedBill(null);
      setPaymentData(null);
    } catch (error) {
      console.error("Failed to fetch supplier bills:", error);
      toast.error("Failed to fetch supplier bills");
      setBills([]);
      setSummary(emptySummary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSuppliers();
    void fetchPaymentModes();
    // Load masters once for this page mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      void fetchBills(selectedSupplier);
    } else {
      setBills([]);
      setSummary(emptySummary);
      setSelectedBill(null);
      setPaymentData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSupplier]);

  const selectedSupplierDetails = useMemo(
    () => suppliers.find((supplier) => String(supplier.supCode) === selectedSupplier),
    [suppliers, selectedSupplier],
  );

  const billsToSettle = useMemo(() => {
    if (fullSettlement) return bills.filter((bill) => Number(bill.balanceAmount || 0) > 0);
    return selectedBill ? [selectedBill] : [];
  }, [bills, fullSettlement, selectedBill]);

  const handlePaymentSubmit = (data: any) => {
    setPaymentData(data);
    setOpenPayment(false);
  };

  const handleSaveSettlement = async () => {
    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }
    if (!fullSettlement && !selectedBill) {
      toast.error("Please select a bill");
      return;
    }
    if (!paymentData?.paymentDetails?.length) {
      toast.error("Please select a payment mode");
      return;
    }
    // The supplied settlement API schema accepts one paymentMode/subPaymentMode.
    if (paymentData.paymentDetails.length > 1) {
      toast.error("Please use one payment mode for this supplier settlement");
      return;
    }
    if (!billsToSettle.length) {
      toast.error("No pending bills to settle");
      return;
    }

    const payment = paymentData.paymentDetails[0];
    const paymentAmount = Number(paymentData.total || 0);
    const payableAmount = fullSettlement
      ? Number(summary.balanceAmount || 0)
      : Number(selectedBill?.balanceAmount || 0);

    if (paymentAmount <= 0 || paymentAmount > payableAmount) {
      toast.error(`Enter a payment amount between ₹0 and ₹${money(payableAmount)}`);
      return;
    }
    if (fullSettlement && paymentAmount !== Number(summary.balanceAmount || 0)) {
      toast.error(`Full settlement amount must equal ₹${money(summary.balanceAmount)}`);
      return;
    }

    const payload = {
      supCode: String(selectedSupplier),
      fullPayingAmount: paymentAmount,
      paymentMode: payment.mode || "",
      subPaymentMode: payment.subMode || "",
      bankName: "",
      branchName: "",
      referenceNo: payment.remarks || "",
      validDate: new Date().toISOString(),
      settleDate: new Date().toISOString(),
      paidBy: userCode,
      userCode,
      branch_Code: branchCode,
      isFullSettlement: fullSettlement,
      bills: billsToSettle.map((bill) => {
        const balance = Number(bill.balanceAmount || 0);
        return {
          pNo: Number(bill.pNo || 0),
          billno: String(bill.billno || ""),
          billAmount: Number(bill.billAmount || bill.netamount || 0),
          amountPaid: Number(bill.paidAmount || 0),
          balanceAmount: balance,
          partialpay: fullSettlement ? balance : paymentAmount,
        };
      }),
    };

    try {
      setLoading(true);
      const response = await saveSuppliedSettlement(payload);
      if (response?.success) {
        toast.success(response?.message || "Supplier settlement completed");
        setOpenPayment(false);
        setPaymentData(null);
        setSelectedBill(null);
        setFullSettlement(false);
        await fetchBills(selectedSupplier);
      } else {
        toast.error(response?.message || "Supplier settlement failed");
      }
    } catch (error: any) {
      console.error("Failed to save supplier settlement:", error);
      toast.error(error?.response?.data?.message || "Failed to save supplier settlement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header showNeworderButton={false} />
      <div className="h-[calc(100vh-100px)] space-y-6 overflow-y-auto bg-gray-50 p-4 md:p-6">
        {loading && <Loader />}

        <section className="rounded-xl bg-white p-4 shadow md:p-6">
          <h1 className="mb-4 text-lg font-semibold">Supplier Settlement</h1>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Select Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(event) => {
                  setSelectedSupplier(event.target.value);
                  setFullSettlement(false);
                  setSelectedBill(null);
                  setPaymentData(null);
                }}
                className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.supCode} value={String(supplier.supCode)}>
                    {supplier.supName} ({supplier.supCode})
                  </option>
                ))}
              </select>
            </div>
            {selectedSupplierDetails && (
              <div className="rounded-lg border bg-gray-50 p-3 text-sm">
                <p><span className="text-gray-500">Supplier:</span> <strong>{selectedSupplierDetails.supName}</strong></p>
                <p><span className="text-gray-500">Supplier Code:</span> <strong>{selectedSupplierDetails.supCode}</strong></p>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-blue-50 p-4">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="mt-1 text-2xl font-bold text-blue-700">₹{money(summary.totalAmount)}</p>
            </div>
            <div className="rounded-xl border bg-green-50 p-4">
              <p className="text-sm text-gray-500">Paid Amount</p>
              <p className="mt-1 text-2xl font-bold text-green-700">₹{money(summary.paidAmount)}</p>
            </div>
            <div className="rounded-xl border bg-red-50 p-4">
              <p className="text-sm text-gray-500">Balance Amount</p>
              <p className="mt-1 text-2xl font-bold text-red-700">₹{money(summary.balanceAmount)}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={fullSettlement}
                onChange={(event) => {
                  setFullSettlement(event.target.checked);
                  setSelectedBill(null);
                  setPaymentData(null);
                }}
                disabled={!selectedSupplier || summary.balanceAmount <= 0}
              />
              Full Supplier Settlement
            </label>
            <button
              type="button"
              disabled={!fullSettlement || summary.balanceAmount <= 0}
              onClick={() => {
                if (summary.balanceAmount <= 0) {
                  toast.error("No pending amount");
                  return;
                }
                setPaymentData(null);
                setOpenPayment(true);
              }}
              className={`rounded-lg px-4 py-2 text-sm text-white ${fullSettlement && summary.balanceAmount > 0 ? "bg-green-600 hover:bg-green-700" : "cursor-not-allowed bg-gray-400"}`}
            >
              Pay Full Amount
            </button>
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Supplier Bills</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  { ["Select", "Bill No", "GRN No", "Type", "Date", "Bill Amount", "Paid Amount", "Balance"].map((heading) => (
                    <th key={heading} className="border px-3 py-3 text-left text-sm">{heading}</th>
                  )) }
                </tr>
              </thead>
              <tbody>
                {bills.length ? bills.map((bill) => {
                  const balance = Number(bill.balanceAmount || 0);
                  const checked = selectedBill?.pNo === bill.pNo;
                  return (
                    <tr key={`${bill.pNo}-${bill.billno}`} className="hover:bg-gray-50">
                      <td className="border px-3 py-2 text-center">
                        <input
                          type="radio"
                          name="supplierBill"
                          checked={checked}
                          disabled={fullSettlement || balance <= 0}
                          onChange={() => {
                            setSelectedBill(bill);
                            setPaymentData(null);
                            setOpenPayment(true);
                          }}
                        />
                      </td>
                      <td className="border px-3 py-2">{bill.billno}</td>
                      <td className="border px-3 py-2">{bill.grnNo || "-"}</td>
                      <td className="border px-3 py-2">{bill.pType || "-"}</td>
                      <td className="border px-3 py-2">{bill.pDate ? new Date(bill.pDate).toLocaleDateString("en-GB") : "-"}</td>
                      <td className="border px-3 py-2 text-right">₹{money(bill.billAmount)}</td>
                      <td className="border px-3 py-2 text-right text-green-700">₹{money(bill.paidAmount)}</td>
                      <td className="border px-3 py-2 text-right font-semibold text-red-600">₹{money(balance)}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={8} className="p-5 text-center text-gray-500">{selectedSupplier ? "No Bills Found" : "Select a supplier to view bills"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {selectedBill && !fullSettlement && (
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
              Selected bill <strong>{selectedBill.billno}</strong> — pending amount: <strong>₹{money(selectedBill.balanceAmount)}</strong>
              {paymentData && <span className="ml-2 text-green-700">Payment details added: ₹{money(paymentData.total)}</span>}
              <button type="button" className="ml-3 text-blue-700 underline" onClick={() => setOpenPayment(true)}>Edit payment</button>
            </div>
          )}
          <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-gray-500">
              {fullSettlement ? `Full settlement selected for ${billsToSettle.length} pending bill(s).` : "Select a bill to enter its payment details."}
            </p>
            <button
              type="button"
              onClick={handleSaveSettlement}
              disabled={!paymentData?.paymentDetails?.length || loading}
              className={`rounded-lg px-5 py-2 text-white ${paymentData?.paymentDetails?.length && !loading ? "bg-blue-600 hover:bg-blue-700" : "cursor-not-allowed bg-gray-400"}`}
            >
              Settle Supplier Bill
            </button>
          </div>
        </section>
      </div>

      <PaymentModal
        fullSettlement={fullSettlement}
        existingPaymentData={paymentData}
        isOpen={openPayment}
        billNo={fullSettlement ? "FULL_SETTLEMENT" : selectedBill?.billno}
        onClose={() => setOpenPayment(false)}
        onPay={handlePaymentSubmit}
        paymentModes={paymentModes}
        unbillData={[{
          total: fullSettlement
            ? summary.balanceAmount
            : Number(selectedBill?.balanceAmount || 0),
        }]}
      />
    </>
  );
};

export default SupplierSettlement;
