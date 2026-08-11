import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

import {
  getUnsettledBillDetails,
  getPaymentModeMaster,
  settleBill,
} from "../api/services/products.service";

import Header from "./Header";
import PaymentModal from "./PaymentModal";

type Bill = {
  grandTotal:number
  ksmId: number;
  oltCode: number;
  ksmBillNo: string;
  ksmBillDate: string;
  ksmBillTime: string;
  ksmBillAmount: number;
  ksmBillTaxAmt: number;
  ksmBillDiscount: number;
  ksmBillCancled: boolean;
  ksmBillSettled: boolean;
  ksmTblNo: string;
  ksmBillTransfered: boolean;
  ksmIsRoomService: boolean;
  billCancelled: boolean;
  ksmSettledAmt: number;
  ksmServiceTaxAmt: number;
  ksmBillNoofTime: boolean;
  ksmsubtblno: string;
  stewcode: number;
  guestCode: string | null;
  branch_Code: string;

  // Optional because they are not present
  // in the GetUnsettledBillDetails response
  userCode?: number;
  tips?: number;
};

type SubMode = {
  subModeId: number;
  subModeType: string;
};

type PaymentMode = {
  modeId: number;
  modeType: string;
  subModes: SubMode[];
};

export default function BillClear() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [kotLoading, setKotLoading] = useState(false);

  const [data, setData] = useState<Bill[]>([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ============================
  // PAYMENT MODAL
  // ============================

  const [openUnsettledPayment, setOpenUnsettledPayment] =
    useState(false);

  const [selectedBill, setSelectedBill] =
    useState<Bill | null>(null);

  const [paymentModes, setPaymentModes] =
    useState<PaymentMode[]>([]);

  // ============================
  // FETCH UNSETTLED BILLS
  // ============================

  const fetchUnsettledBills = async (
    from: string,
    to: string
  ) => {
    if (!from || !to) {
      return;
    }

    try {
      setLoading(true);

      const res = await getUnsettledBillDetails(
        from.replaceAll("-", "/"),
        to.replaceAll("-", "/"),
        appData?.user?.branch_code || ""
      );

      console.log(
        "Unsettled Bill Response:",
        res
      );

      if (res?.success) {
        setData(res.data || []);

        if (!res.data?.length) {
          toast("No unsettled bills found");
        }
      } else {
        setData([]);

        toast.error(
          res?.message ||
            "Failed to fetch unsettled bills"
        );
      }
    } catch (error) {
      console.error(
        "Error fetching unsettled bills:",
        error
      );

      setData([]);

      toast.error(
        "Error fetching unsettled bills"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // FETCH PAYMENT MODES
  // ============================

  const fetchPaymentModes = async () => {
    try {
      const branch =
        localStorage.getItem("branch") || "";

      const data =
        await getPaymentModeMaster(branch);

      console.log(
        "Payment Modes:",
        data
      );

      setPaymentModes(
        (data || []) as PaymentMode[]
      );
    } catch (err) {
      console.error(
        "Failed to fetch payment modes",
        err
      );
    }
  };

  // ============================
  // INITIAL LOAD
  // ============================

  useEffect(() => {
    const today = new Date();

    const formattedToday =
      today.toISOString().split("T")[0];

    setFromDate(formattedToday);
    setToDate(formattedToday);

    fetchUnsettledBills(
      formattedToday,
      formattedToday
    );

    fetchPaymentModes();
  }, []);

  // ============================
  // SETTLE BILL
  // ============================

  const handleSettleBill = (
    bill: Bill
  ) => {
    console.log(
      "Selected Bill:",
      bill
    );

    setSelectedBill(bill);
    setOpenUnsettledPayment(true);
  };

  // ============================
  // BILL SETTLEMENT
  // ============================

  const handleBillSettlement = async (
    paymentData: any
  ) => {
    debugger;

    const {
      paymentDetails,
      difference,
      payableAmount,
      isTransferToRoom,
      selectedTransferRoom,
    } = paymentData;

    console.log(
      "Selected Transfer Room:",
      selectedTransferRoom
    );

    // ============================
    // AMOUNT VALIDATION
    // ============================

    if (difference !== 0) {
      toast.error(
        `Amount must match ₹${payableAmount}`
      );
      return;
    }

    // ============================
    // BILL VALIDATION
    // ============================

    if (!selectedBill) {
      toast.error(
        "No bill selected"
      );
      return;
    }

    // IMPORTANT:
    // After this check TypeScript knows
    // selectedBill is a Bill.
    const bill: Bill = selectedBill;

    // ============================
    // PAYMENT VALIDATION
    // ============================

    for (const p of paymentDetails) {
      const mode = paymentModes.find(
        (m) => m.modeType === p.mode
      );

      if (
        mode &&
        mode.subModes.length > 0 &&
        !p.subMode
      ) {
        toast.error(
          `Select sub mode for ${p.mode}`
        );
        return;
      }

      if (
        !p.amount ||
        Number(p.amount) <= 0
      ) {
        toast.error(
          `Enter valid amount for ${p.mode}`
        );
        return;
      }
    }

    // ============================
    // FINAL PAYLOAD
    // ============================

    const finalPayload = {
      oltCode: Number(
        bill.oltCode || 0
      ),

      userCode: Number(
        bill.userCode || 0
      ),

      billId: Number(
        bill.ksmId || 0
      ),

      billNo: Number(
        bill.ksmBillNo || 0
      ),

      tableNo: isTransferToRoom
        ? selectedTransferRoom?.roomNo || ""
        : bill.ksmTblNo || "",

      subTableNo:
        bill.ksmsubtblno || "",

      subBillType: "",

      plan: "",

      guestCode:
        selectedTransferRoom?.guestCode ||
        bill.guestCode ||
        "",

      guestName:
        selectedTransferRoom?.guestName ||
        "",

      checkInNo:
        selectedTransferRoom?.checkinNo ||
        "",

      discount: Number(
        bill.ksmBillDiscount || 0
      ),

      taxAmount: Number(
        bill.ksmBillTaxAmt || 0
      ),

      tips: Number(
        bill.tips || 0
      ),

      changeAmount: 0,

      grandAmount: Number(
        payableAmount || 0
      ),

      billDate:
        new Date().toISOString(),

      branchCode:
        bill.branch_Code || "",

      paymentDetails:
        paymentDetails.map(
          (p: any) => ({
            mode: p.mode,

            subMode:
              p.mode?.toLowerCase() ===
              "cash"
                ? "Cash"
                : p.mode?.toLowerCase() ===
                  "pluxee"
                ? "Pluxee"
                : p.mode?.toLowerCase() ===
                  "neft"
                ? "neft"
                : (
                    p.subMode || ""
                  ).trim(),

            amount: Number(
              p.amount
            ),

            remarks:
              (
                p.remarks || ""
              ).trim(),
          })
        ),
    };

    console.log(
      "FINAL DATA:",
      finalPayload
    );

    // ============================
    // SETTLE BILL API
    // ============================

    try {
      setKotLoading(true);

      const res =
        await settleBill(
          finalPayload
        );

      console.log(
        "Settlement Response:",
        res
      );

      if (
        res?.success === false
      ) {
        toast.error(
          res?.message ||
            "Settlement Failed ❌"
        );
        return;
      }

      toast.success(
        "Bill Settled Successfully ✅"
      );

      // Close modal
      setOpenUnsettledPayment(
        false
      );

      // Clear selected bill
      setSelectedBill(null);

      // Refresh bill list
      await fetchUnsettledBills(
        fromDate,
        toDate
      );
    } catch (err) {
      console.error(
        "Settlement error:",
        err
      );

      toast.error(
        "Settlement Failed ❌"
      );
    } finally {
      setKotLoading(false);
    }
  };

  // ============================
  // FORMAT DATE
  // ============================

  const formatDate = (
    value: string
  ) => {
    if (!value) {
      return "--";
    }

    return value.split("T")[0];
  };

  // ============================
  // FORMAT TIME
  // ============================

  const formatTime = (
    value: string
  ) => {
    if (!value) {
      return "--";
    }

    if (value.includes("T")) {
      return (
        value
          .split("T")[1]
          ?.substring(0, 5) ||
        "--"
      );
    }

    return value;
  };

  return (
    <div className="p-4 md:p-6">
      <Header />

      <div className="bg-white rounded-xl shadow p-4 md:p-6">

        {/* ============================
            HEADER
        ============================ */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              Bill Clear
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Select unsettled bills
            </p>
          </div>

          <div className="text-sm font-medium text-gray-600">
            Bills:

            <span className="ml-1 text-blue-600 font-bold">
              {data.length}
            </span>
          </div>

        </div>

        {/* ============================
            DATE FILTER
        ============================ */}

        <div className="flex flex-col md:flex-row gap-3 mb-5">

          {/* FROM DATE */}

          <div className="flex flex-col">

            <label className="text-sm font-medium text-gray-600 mb-1">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                const newFromDate =
                  e.target.value;

                setFromDate(
                  newFromDate
                );

                if (
                  newFromDate &&
                  toDate
                ) {
                  fetchUnsettledBills(
                    newFromDate,
                    toDate
                  );
                }
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* TO DATE */}

          <div className="flex flex-col">

            <label className="text-sm font-medium text-gray-600 mb-1">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                const newToDate =
                  e.target.value;

                setToDate(
                  newToDate
                );

                if (
                  fromDate &&
                  newToDate
                ) {
                  fetchUnsettledBills(
                    fromDate,
                    newToDate
                  );
                }
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </div>

        {/* ============================
            LOADING
        ============================ */}

        {loading && (
          <div className="text-center py-3 text-sm text-blue-600">
            Loading bills...
          </div>
        )}

        {/* ============================
            TABLE
        ============================ */}

        <div className="overflow-x-auto border border-gray-200 rounded-lg">

          <table className="w-full text-sm">

            <thead className="bg-gray-100">

              <tr>

                <th className="px-4 py-3 text-left">
                  Bill No
                </th>

                <th className="px-4 py-3 text-left">
                  Bill Date
                </th>

                <th className="px-4 py-3 text-left">
                  Bill Time
                </th>

                <th className="px-4 py-3 text-left">
                  Table
                </th>

                <th className="px-4 py-3 text-left">
                  Sub Table
                </th>

                <th className="px-4 py-3 text-right">
                  Amount
                </th>

                <th className="px-4 py-3 text-right">
                  Tax
                </th>

                <th className="px-4 py-3 text-right">
                  Discount
                </th>

                <th className="px-4 py-3 text-center">
                  Settled
                </th>

                <th className="px-4 py-3 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {data.length === 0 ? (

                <tr>

                  <td
                    colSpan={10}
                    className="text-center py-10 text-gray-500"
                  >
                    No unsettled bills found
                  </td>

                </tr>

              ) : (

                data.map(
                  (item) => (

                    <tr
                      key={
                        item.ksmId
                      }
                      className="border-t hover:bg-gray-50 transition"
                    >

                      {/* BILL NO */}

                      <td className="px-4 py-3 font-medium">
                        {item.ksmBillNo}
                      </td>

                      {/* BILL DATE */}

                      <td className="px-4 py-3">
                        {formatDate(
                          item.ksmBillDate
                        )}
                      </td>

                      {/* BILL TIME */}

                      <td className="px-4 py-3">
                        {formatTime(
                          item.ksmBillTime
                        )}
                      </td>

                      {/* TABLE */}

                      <td className="px-4 py-3">
                        {item.ksmTblNo ||
                          "--"}
                      </td>

                      {/* SUB TABLE */}

                      <td className="px-4 py-3">
                        {item.ksmsubtblno ||
                          "--"}
                      </td>

                      {/* AMOUNT */}

                      <td className="px-4 py-3 text-right font-medium">
                        ₹{" "}
                        {Number(
                          item.ksmBillAmount ||
                            0
                        ).toFixed(2)}
                      </td>

                      {/* TAX */}

                      <td className="px-4 py-3 text-right">
                        ₹{" "}
                        {Number(
                          item.ksmBillTaxAmt ||
                            0
                        ).toFixed(2)}
                      </td>

                      {/* DISCOUNT */}

                      <td className="px-4 py-3 text-right">
                        ₹{" "}
                        {Number(
                          item.ksmBillDiscount ||
                            0
                        ).toFixed(2)}
                      </td>

                      {/* SETTLED */}

                      <td className="px-4 py-3 text-center">

                        {item.ksmBillSettled ? (

                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            Yes
                          </span>

                        ) : (

                          <span className="px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                            No
                          </span>

                        )}

                      </td>

                      {/* SETTLE */}

                      <td className="px-4 py-3 text-center">

                        <button
                          onClick={() =>
                            handleSettleBill(
                              item
                            )
                          }
                          disabled={
                            loading ||
                            kotLoading
                          }
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-xs font-medium"
                        >
                          Settle
                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ============================
          PAYMENT MODAL
      ============================ */}

      {selectedBill && (
        <PaymentModal
          isOpen={
            openUnsettledPayment
          }

          onClose={() => {
            setOpenUnsettledPayment(
              false
            );

            setSelectedBill(
              null
            );
          }}

          billNo={
            selectedBill.ksmBillNo
          }

          /*
           * PaymentModal expects
           * unbillData[0].total.
           *
           * We keep the complete bill
           * and add total.
           */
          unbillData={[
            {
              ...selectedBill,
              total:
                selectedBill.grandTotal,
            },
          ]}

          paymentModes={
            paymentModes
          }

          onPay={
            handleBillSettlement
          }

          /*
           * PaymentModal calls this
           * whenever it opens.
           */
          runApi={
            fetchPaymentModes
          }

          roomServiceList={{
            data: [],
          }}
        />
      )}

    </div>
  );
}