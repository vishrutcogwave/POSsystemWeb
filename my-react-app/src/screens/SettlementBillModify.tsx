import { useEffect, useState } from "react";

import Header from "../components/Header";

import toast from "react-hot-toast";

import Loader from "../components/Loader";

import {
  settlementBillModify,
  getBillDetails,
  getOutletList,
  getPaymentModeMaster,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";
import PaymentModal from "../components/PaymentModal";

export default function SettlementBillModify() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);

  const [outlets, setOutlets] = useState<any[]>([]);

  const [bills, setBills] = useState<any[]>([]);

  const [selectedOutlet, setSelectedOutlet] = useState("");

  const [selectedBill, setSelectedBill] = useState<any>(null);

  const [reason, setReason] = useState("");

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [fromDate, setFromDate] = useState(getToday());

  const [toDate, setToDate] = useState(getToday());

  const [openPayment, setOpenPayment] = useState(false);

  const [paymentModes, setPaymentModes] = useState<any[]>([]);

  const [paymentData, setPaymentData] = useState<any>(null);

  const fetchPaymentModes = async () => {
    try {
      const branch = appData?.user?.branch_code;

      const data = await getPaymentModeMaster(branch);

      setPaymentModes(data || []);
    } catch (err) {
      toast.error("Failed to load payment modes");
    }
  };

  // ================= FETCH OUTLETS =================

  const fetchOutlets = async () => {
    try {
      const res = await getOutletList(appData?.user?.branch_code);

      if (res?.success) {
        const outletData = res?.data || [];

        setOutlets(outletData);

        if (outletData.length > 0) {
          setSelectedOutlet(outletData[0]?.oltCode?.toString());
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load outlets");
    }
  };

  // ================= FETCH BILLS =================

  const fetchBills = async () => {
    if (!selectedOutlet) return;

    try {
      setLoading(true);

      const res = await getBillDetails(
        Number(selectedOutlet),

        appData?.user?.branch_code,

        fromDate.replaceAll("-", "/"),

        toDate.replaceAll("-", "/"),
      );

      setBills(
        (res || []).filter(
          (item: any) =>
            item.ksmBillSettled === true && item.ksmBillCancled === false,
        ),
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  // ================= MODIFY SETTLEMENT =================

  const handleSettlementModify = async () => {
    if (!paymentData?.paymentDetails?.length) {
      toast.error("Select payment mode");

      return;
    }
    if (!selectedBill) {
      toast.error("Select bill");

      return;
    }

    if (!reason.trim()) {
      toast.error("Enter remarks");

      return;
    }

    try {
      setLoading(true);

      const payload = {
        branch: appData?.user?.branch_code,

        userCode: appData?.user?.userCode,

        companyCode: 0,

        companyName: "",

        guestCode: 0,

        guestName: "",

        checkInNo: "",

        remarks: reason,

        outletCode: Number(selectedOutlet),

        outletName:
          outlets.find((o: any) => o.oltCode === Number(selectedOutlet))
            ?.oltName || "",

        roomNo: "",

        subBillingType: "",

        payMode: "POS",

        bill: {
          oltCode: Number(selectedOutlet),

          userCode: appData?.user?.userCode,

          billId: selectedBill?.ksmId || 0,

          billNo: selectedBill?.ksmBillNo,

          tableNo: selectedBill?.ksmTblNo || "",

          subTableNo: selectedBill?.subTableNo || "",

          discount: selectedBill?.ksmBillDiscount || 0,

          taxAmount: selectedBill?.ksmBillTaxAmt || 0,

          tips: 0,

          changeAmount: 0,

          grandAmount: selectedBill?.ksmBillAmount || 0,

          refNo: "",

          cardName: "",

          billDate: selectedBill?.ksmBillDate,

          branchCode: appData?.user?.branch_code,

          paymentDetails:
            paymentData?.paymentDetails?.map((p: any) => ({
              mode: p.mode,
              subMode: p.subMode,
              amount: Number(p.amount || 0),
              remarks: reason,
            })) || [],
        },
      };

      console.log("Settlement Modify Payload", payload);

      const res = await settlementBillModify(payload);

      toast.success(res?.message || "Settlement Modified Successfully");

      fetchBills();

      setSelectedBill(null);

      setReason("");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to modify settlement",
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= INITIAL =================

  useEffect(() => {
    fetchOutlets();

    fetchPaymentModes();
  }, []);
  // ================= AUTO FETCH =================

  useEffect(() => {
    if (selectedOutlet && fromDate && toDate) {
      fetchBills();
    }
  }, [selectedOutlet, fromDate, toDate]);
  const handlePaymentSubmit = async (data: any) => {
    setPaymentData(data);

    setOpenPayment(false);
  };

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 bg-gray-50">
        {loading && <Loader />}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* HEADER */}
          <div className="p-5 border-b">
            <h2 className="text-lg font-semibold">Settlement Bill Modify</h2>
          </div>
          {/* FILTERS */}

          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-medium">
                OUTLET
              </label>

              <select
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
              >
                {outlets.map((o: any) => (
                  <option key={o.oltCode} value={o.oltCode}>
                    {o.oltName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">
                FROM DATE
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">
                TO DATE
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-auto border-t border-b max-h-[500px]">
            <table className="min-w-[900px] w-full border-collapse">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr className="text-sm">
                  <th className="border px-3 py-2">Select</th>

                  <th className="border px-3 py-2">Bill No</th>

                  <th className="border px-3 py-2">Table</th>

                  <th className="border px-3 py-2">Amount</th>

                  <th className="border px-3 py-2">Tax</th>

                  <th className="border px-3 py-2">Discount</th>

                  <th className="border px-3 py-2">Settled</th>

                  <th className="border px-3 py-2">Cancelled</th>

                  <th className="border px-3 py-2">Bill Date</th>

                   <th className="border px-3 py-2">Payment Status</th>
                </tr>
              </thead>

              <tbody>
                {bills.length > 0 ? (
                  bills.map((item: any, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-blue-50 ${
                        selectedBill?.kotId === item?.kotId ? "bg-blue-100" : ""
                      }`}
                    >
                      <td className="border px-3 py-2 text-center">
                        <input
                          type="radio"
                          checked={selectedBill?.ksmBillNo === item?.ksmBillNo}
                          onChange={() => {
                            setSelectedBill(item);

                            setOpenPayment(true);
                          }}
                        />
                      </td>

                      <td className="border px-3 py-2">{item?.ksmBillNo}</td>

                      <td className="border px-3 py-2">{item?.ksmTblNo}</td>

                      <td className="border px-3 py-2">
                        ₹{item?.ksmBillAmount}
                      </td>

                      <td className="border px-3 py-2">
                        ₹{item?.ksmBillTaxAmt}
                      </td>

                      <td className="border px-3 py-2">
                        ₹{item?.ksmBillDiscount}
                      </td>

                      <td className="border px-3 py-2">
                        {item?.ksmBillSettled ? "Yes" : "No"}
                      </td>

                      <td className="border px-3 py-2">
                        {item?.ksmBillCancled ? "Yes" : "No"}
                      </td>

                      <td className="border px-3 py-2">
                        {item?.ksmBillDate?.split("T")[0]}
                      </td>

                             <td className="border px-3 py-2">
                        {item?.paymentStatus}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="border px-3 py-5 text-center text-gray-500"
                    >
                      No Bills Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* REMARKS */}

          <div className="p-5">
            <label className="text-xs text-gray-500 font-medium">REMARKS</label>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Enter remarks"
              className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-400"
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSettlementModify}
                className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium"
              >
                Modify Settlement
              </button>
            </div>
          </div>
        </div>
        <PaymentModal
          isOpen={openPayment}
          onClose={() => {
            setOpenPayment(false);

            setSelectedBill(null);

            setPaymentData(null);
          }}
          onPay={handlePaymentSubmit}
          paymentModes={paymentModes}
          unbillData={[
            {
              total: selectedBill?.grandTotal || 0,
            },
          ]}
        />
      </div>
    </>
  );
}
