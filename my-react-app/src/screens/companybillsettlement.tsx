import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getCompanyList,
  getCompanyTransferBills,
  getPaymentModeMaster,
  saveCompanyBillSettlement,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import Loader from "../components/Loader";
import PaymentModal from "../components/PaymentModelForCompany";

function CompanyBillSettlement() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [openPayment, setOpenPayment] = useState(false);

  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  const [bills, setBills] = useState<any[]>([]);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);

  const [paymentData, setPaymentData] = useState<any>(null);
  const [settlementBills, setSettlementBills] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    paidAmount: 0,
    balanceAmount: 0,
  });

  const [fullSettlement, setFullSettlement] = useState(false);

  const fetchPaymentModes = async () => {
    try {
      const branch = appData?.user?.branch_code;

      const response = await getPaymentModeMaster(branch);

      console.log("PAYMENT MODES", response);

      setPaymentModes(response || []);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load payment modes");
    }
  };
  // Fetch Companies
  const fetchCompanies = async () => {
    try {
      setLoading(true);

      const response = await getCompanyList(appData?.user?.branch_code);

      if (response?.success) {
        setCompanies(response?.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch companies");

        setCompanies([]);
      }
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong");

      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Bills
  const fetchBills = async () => {
    try {
      setLoading(true);

      const response = await getCompanyTransferBills(
        Number(selectedCompany),
        appData?.user?.branch_code,
      );

      if (response?.success) {
        const data = response.data;

        setSummary({
          totalAmount: data?.totalAmount || 0,
          paidAmount: data?.paidAmount || 0,
          balanceAmount: data?.balanceAmount || 0,
        });

        setBills(data?.bills || []);
      } else {
        toast.error(response?.message || "Failed to fetch bills");

        setSummary({
          totalAmount: 0,
          paidAmount: 0,
          balanceAmount: 0,
        });

        setBills([]);
      }
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong");

      setSummary({
        totalAmount: 0,
        paidAmount: 0,
        balanceAmount: 0,
      });

      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchPaymentModes();
  }, []);
  useEffect(() => {
    if (selectedCompany) {
      fetchBills();
    }
  }, [selectedCompany]);
const handlePaymentSubmit = async (
  data: any
) => {

  // FULL SETTLEMENT
  if (fullSettlement) {

    try {

      setLoading(true);

      const payment =
        data?.paymentDetails?.[0];

      const payload = {

        companyCode:
          Number(selectedCompany),

        payingAmount:
          data?.total || 0,

        settleDate:
          new Date().toISOString(),

        bankName: "",

        branchName: "",

        chDDNo: "",

        userCode:
          String(
            appData?.user?.userCode
          ) || "",

        paymentMode:
          payment?.mode || "",

        ccno: "",

        refNo:
          payment?.remarks || "",

        validDate:
          new Date().toISOString(),

        branch_Code:
          appData?.user
            ?.branch_code || "",

        isFullSettlement: true,

        isChargesApplied:
          data?.selectedCharges
            ?.length > 0,

        fullChargesDetails:
          (
            data?.selectedCharges ||
            []
          ).map((c: any) => ({

            chargesType:
              c.chargeType,

            chargesAmount:
              Number(
                c.amount || 0
              ),
          })),

        // ALL FETCHED BILLS
        bills:
          bills.map((bill: any) => {

            const additionalCharges =
              (
                data?.selectedCharges ||
                []
              ).reduce(
                (
                  sum: number,
                  c: any
                ) =>
                  sum +
                  Number(
                    c.amount || 0
                  ),
                0
              );

            // FETCH API amtPaid
            const oldPaid =
              Number(
                bill.amtPaid || 0
              );

            // CURRENT PAYMENT
            const currentPayment =
              Number(
                bill.billAmt || 0
              ) - oldPaid;

            return {

              btId:
                bill.btId,

              billNo:
                bill.billNo,

              billAmount:
                bill.billAmt,

              // TOTAL PAYMENT
              amountPaid:
                currentPayment,

              // PAYMENT EXCLUDING CHARGES
              partialpay:
                Math.max(
                  currentPayment -
                    additionalCharges,
                  0
                ),

              individualChargesApplied:
                data
                  ?.selectedCharges
                  ?.length > 0,

              individualCharges:
                (
                  data?.selectedCharges ||
                  []
                ).map((c: any) => ({

                  chargesType:
                    c.chargeType,

                  chargesAmount:
                    Number(
                      c.amount || 0
                    ),
                })),
            };
          }),
      };

      console.log(
        "FULL SETTLEMENT",
        payload
      );

      const response =
        await saveCompanyBillSettlement(
          payload
        );

      if (response?.success) {

        toast.success(
          response?.message ||
            "Settlement completed"
        );

        setOpenPayment(false);

        setPaymentData(null);

        setSettlementBills([]);

        fetchBills();

      } else {

        toast.error(
          response?.message ||
            "Settlement failed"
        );
      }

    } catch (error) {

      console.log(error);

      toast.error(
        "Settlement failed"
      );

    } finally {

      setLoading(false);
    }

    return;
  }

  // NORMAL SINGLE BILL FLOW
  const billPayload = {

    btId:
      selectedBill?.btId,

    billNo:
      selectedBill?.billNo,

    billAmount:
      selectedBill?.billAmt,

    amountPaid:
      data?.total || 0,

    partialpay:
      data?.total || 0,

    individualChargesApplied:
      data?.selectedCharges
        ?.length > 0,

    individualCharges:
      (
        data?.selectedCharges ||
        []
      ).map((c: any) => ({

        chargesType:
          c.chargeType,

        chargesAmount:
          c.amount,
      })),

    paymentDetails:
      data?.paymentDetails || [],
  };

  setSettlementBills((prev) => {

    const existing =
      prev.findIndex(
        (x) =>
          x.btId ===
          billPayload.btId
      );

    if (existing !== -1) {

      const updated = [...prev];

      updated[existing] =
        billPayload;

      return updated;
    }

    return [
      ...prev,
      billPayload,
    ];
  });

  setPaymentData(data);

  setOpenPayment(false);

  toast.success("Payment Added");
};
  const handleCompanySettlement = async () => {
    if (!selectedBill && !fullSettlement) {
      toast.error("Select bill");

      return;
    }

    if (!paymentData?.paymentDetails?.length) {
      toast.error("Select payment mode");

      return;
    }

    if (!remarks.trim()) {
      toast.error("Enter remarks");

      return;
    }

    try {
      setLoading(true);

      const payment = paymentData.paymentDetails[0];

   const payload = {

  companyCode:
    Number(selectedCompany),

  payingAmount:
    paymentData?.total || 0,

  settleDate:
    new Date().toISOString(),

  bankName: "",

  branchName: "",

  chDDNo: "",

  userCode:
    String(
      appData?.user?.userCode
    ) || "",

  paymentMode:
    payment?.mode || "",

  ccno: "",

  refNo:
    payment?.remarks || "",

  validDate:
    new Date().toISOString(),

  branch_Code:
    appData?.user
      ?.branch_code || "",

  isFullSettlement:
    fullSettlement,

  isChargesApplied:
    paymentData?.selectedCharges
      ?.length > 0,

  // FULL CHARGES
fullChargesDetails:
  fullSettlement
    ? (
        paymentData?.selectedCharges ||
        []
      ).map((c: any) => ({

        chargesType:
          c.chargeType,

        chargesAmount:
          Number(c.amount || 0),
      }))
    : [],
 bills:
  settlementBills.map(
    (bill: any) => {

   const additionalCharges =
  bill?.individualCharges
    ?.reduce(
      (
        sum: number,
        c: any
      ) =>
        sum +
        Number(
          c.chargesAmount || 0
        ),
      0
    ) || 0;

const enteredAmount =
  Number(
    bill.amountPaid || 0
  );

const actualPaid =
  Math.max(
    enteredAmount -
      additionalCharges,
    0
  );

return {

  btId:
    bill.btId,

  billNo:
    bill.billNo,

  billAmount:
    bill.billAmount,

  amountPaid:
    enteredAmount,

  partialpay:
    actualPaid,

  individualChargesApplied:
    bill
      ?.individualChargesApplied ||

    false,

  individualCharges:
    (
      bill
        ?.individualCharges ||
      []
    ).map((c: any) => ({

      chargesType:
        c.chargesType,

      chargesAmount:
        Number(
          c.chargesAmount ||
            0
        ),
    })),
};
    }
  ),
};

      console.log("SETTLEMENT PAYLOAD", payload);

      const response = await saveCompanyBillSettlement(payload);

      if (response?.success) {
        toast.success(response?.message || "Settlement completed");

        // RESET
        setRemarks("");

        setSelectedBill(null);

        setPaymentData(null);

        setSettlementBills([]);

        fetchBills();
      } else {
        toast.error(response?.message || "Settlement failed");
      }
    } catch (error) {
      console.log(error);

      toast.error("Failed to settle company bill");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}

        {/* ================= FORM SECTION ================= */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            Company Bill Settlement
          </h2>

          {/* Company Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Select Company
              </label>

              <select
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(e.target.value);
                  setSelectedBill(null);
                }}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Company</option>

                {companies.map((company: any) => (
                  <option key={company.companyCode} value={company.companyCode}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 border rounded-xl p-4">
              <p className="text-sm text-gray-500">Total Amount</p>

              <p className="text-2xl font-bold text-blue-700 mt-1">
                ₹{summary.totalAmount}
              </p>
            </div>

            <div className="bg-green-50 border rounded-xl p-4">
              <p className="text-sm text-gray-500">Paid Amount</p>

              <p className="text-2xl font-bold text-green-700 mt-1">
                ₹{summary.paidAmount}
              </p>
            </div>

            <div className="bg-red-50 border rounded-xl p-4">
              <p className="text-sm text-gray-500">Balance Amount</p>

              <p className="text-2xl font-bold text-red-700 mt-1">
                ₹{summary.balanceAmount}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={fullSettlement}
                onChange={(e) => setFullSettlement(e.target.checked)}
              />

              <label className="text-sm font-medium">
                Full Company Settlement
              </label>
            </div>

            <button
              onClick={() => {
                if (summary.balanceAmount <= 0) {
                  toast.error("No pending amount");

                  return;
                }

                setOpenPayment(true);
              }}
              disabled={!fullSettlement}
              className={`px-4 py-2 rounded-lg text-sm text-white ${
                fullSettlement
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Pay Full Amount
            </button>
          </div>
        </div>

        {/* ================= BILL LIST ================= */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Company Bills</h2>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto border rounded-lg">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-3 text-sm">Select</th>

                  <th className="border px-3 py-3 text-sm">Bill No</th>

                  <th className="border px-3 py-3 text-sm">Bill Amount</th>

                  <th className="border px-3 py-3 text-sm">Paid Amount</th>

                  <th className="border px-3 py-3 text-sm">Balance</th>

                  <th className="border px-3 py-3 text-sm">Pay Mode</th>

                  <th className="border px-3 py-3 text-sm">Date</th>

                  <th className="border px-3 py-3 text-sm">Settled</th>
                </tr>
              </thead>

              <tbody>
                {bills.length > 0 ? (
                  bills.map((item: any) => {
                    const balance = item.billAmt - item.amtPaid;

                    return (
                      <tr key={item.btId} className="hover:bg-gray-50">
                        <td className="border px-3 py-2 text-center">
                          {settlementBills.some((x) => x.btId === item.btId) ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                                Payment Added
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    const existingPayment =
                                      settlementBills.find(
                                        (x) => x.btId === item.btId,
                                      );

                                    setSelectedBill(item);

                                    setPaymentData(existingPayment);

                                    setOpenPayment(true);
                                  }}
                                  className="text-blue-600 text-xs underline"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => {
                                    // CLOSE MODAL
                                    setOpenPayment(false);

                                    // REMOVE PAYMENT
                                    setSettlementBills((prev) =>
                                      prev.filter((x) => x.btId !== item.btId),
                                    );

                                    // CLEAR CURRENT DATA
                                    setSelectedBill(null);

                                    setPaymentData(null);

                                    // SMALL DELAY FOR RE-OPEN
                                    setTimeout(() => {
                                      setSelectedBill(item);
                                    }, 100);

                                    toast.success("Payment Removed");
                                  }}
                                  className="text-red-600 text-xs underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <input
                              type="radio"
                              name={`selectedBill-${item.btId}`}
                              disabled={fullSettlement}
                              checked={false}
                              onChange={() => {
                                setSelectedBill(item);

                                setPaymentData(null);

                                setOpenPayment(true);
                              }}
                            />
                          )}
                        </td>

                        <td className="border px-3 py-2 text-center">
                          {item.billNo}
                        </td>

                        <td className="border px-3 py-2 text-right">
                          ₹{item.billAmt}
                        </td>

                        <td className="border px-3 py-2 text-right">
                          ₹{item.amtPaid}
                        </td>

                        <td className="border px-3 py-2 text-right text-red-600 font-semibold">
                          ₹{balance}
                        </td>

                        <td className="border px-3 py-2 text-center">
                          {item.pMode || "-"}
                        </td>

                        <td className="border px-3 py-2 text-center">
                          {new Date(item.btDate).toLocaleDateString("en-GB")}
                        </td>

                        <td className="border px-3 py-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.btcSettled
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.btcSettled ? "YES" : "NO"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="border p-4 text-center">
                      No Bills Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {bills.length > 0 ? (
              bills.map((item: any) => {
                const balance = item.billAmt - item.amtPaid;

                return (
                  <div
                    key={item.btId}
                    className="border rounded-xl p-4 bg-white shadow-sm space-y-3"
                  >
                    {/* TOP */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500">Bill No</p>

                        <p className="font-semibold">{item.billNo}</p>
                      </div>

                      <div>
                        {settlementBills.some((x) => x.btId === item.btId) ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                              Payment Added
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const existingPayment = settlementBills.find(
                                    (x) => x.btId === item.btId,
                                  );

                                  setSelectedBill(item);

                                  setPaymentData(existingPayment);

                                  setOpenPayment(true);
                                }}
                                className="text-blue-600 text-xs underline"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => {
                                  setOpenPayment(false);

                                  setSettlementBills((prev) =>
                                    prev.filter((x) => x.btId !== item.btId),
                                  );

                                  setSelectedBill(null);

                                  setPaymentData(null);

                                  setTimeout(() => {
                                    setSelectedBill(item);
                                  }, 100);

                                  toast.success("Payment Removed");
                                }}
                                className="text-red-600 text-xs underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <input
                            type="radio"
                            name="selectedBill"
                            checked={selectedBill?.btId === item.btId}
                            disabled={fullSettlement}
                            onChange={() => {
                              setSelectedBill(item);

                              setPaymentData(null);

                              setOpenPayment(true);
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Bill Amount</p>

                        <p className="font-semibold">₹{item.billAmt}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Paid Amount</p>

                        <p className="font-semibold text-green-600">
                          ₹{item.amtPaid}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Balance</p>

                        <p className="font-semibold text-red-600">₹{balance}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Pay Mode</p>

                        <p className="font-semibold">{item.pMode || "-"}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Date</p>

                        <p className="font-semibold">
                          {new Date(item.btDate).toLocaleDateString("en-GB")}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Settled</p>

                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.btcSettled
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.btcSettled ? "YES" : "NO"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="border rounded-xl p-5 text-center">
                No Bills Found
              </div>
            )}
          </div>
        </div>

        {/* ================= REMARKS ================= */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Remarks</h2>

          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            placeholder="Enter remarks"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex justify-end mt-5">
            <button
              onClick={handleCompanySettlement}
              disabled={
                fullSettlement ||
                !selectedBill ||
                !paymentData?.paymentDetails?.length
              }
              className={`px-5 py-2 rounded-lg text-white ${
                !fullSettlement &&
                selectedBill &&
                paymentData?.paymentDetails?.length
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Settle Company Bill
            </button>
          </div>
        </div>
      </div>
      <PaymentModal
        fullSettlement={fullSettlement}
        existingPaymentData={paymentData}
        isOpen={openPayment}
        billNo={fullSettlement ? "FULL_SETTLEMENT" : selectedBill?.billNo}
        onClose={() => {
          setOpenPayment(false);
        }}
        onPay={handlePaymentSubmit}
        paymentModes={paymentModes}
        unbillData={[
          {
            total: fullSettlement
              ? summary.balanceAmount
              : selectedBill?.billAmt - selectedBill?.amtPaid,
          },
        ]}
      />
    </>
  );
}

export default CompanyBillSettlement;
