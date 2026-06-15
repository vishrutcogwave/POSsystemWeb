import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  getChargesDetails,
  getCompanyList,
  getPaymentStatusRequestDQRDevice,
  sendPaymentRequestDQRDevice,
} from "../api/services/products.service";

type SubMode = {
  subModeId: number;
  subModeType: string;
};

type PaymentMode = {
  modeId: number;
  modeType: string;
  subModes: SubMode[];
};

type PaymentDetail = {
  mode: string;
  subMode: string;
  amount: number;
  remarks?: string;
};

type Charge = {
  chargesId: number;
  chargesType: string;
  branchCode: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPay: (data: any) => void;
  paymentModes: PaymentMode[];
  runApi?: () => void;
  unbillData?: any;
  billNo?: any;
  refresh?: () => void;
existingPaymentData?: any;
fullSettlement:boolean

};

const PaymentModal: React.FC<Props> = ({
  billNo,
  isOpen,
  runApi,
  onClose,
  onPay,
  paymentModes,
  unbillData,
  existingPaymentData,
  fullSettlement
}) => {
  const handleClose = () => {
    setSelectedMulti({});

    setPaymentDetails([]);

    setSelectedCharges([]);

    setUpiType("");

    onClose();
  };
  console.log("billNo", billNo);
  const [upiType, setUpiType] = useState<"own" | "device" | "">("");

  const [selectedMulti, setSelectedMulti] = useState<Record<string, string>>(
    {},
  );
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([]);

  const PAYABLE_AMOUNT = Math.round(Number(unbillData?.[0]?.total || 0));
  // inside component states

  const [devicePaymentLoading, setDevicePaymentLoading] = useState(false);

  const [devicePaymentStatus, setDevicePaymentStatus] = useState("");

  const paymentIntervalRef = useRef<any>(null);
  // add this inside component
  const [companies, setCompanies] = useState<any[]>([]);

  const [charges, setCharges] = useState<Charge[]>([]);

  const [selectedCharges, setSelectedCharges] = useState<
    {
      chargeType: string;
      amount: number;
    }[]
  >([]);
  const [_companyLoading, setCompanyLoading] = useState(false);
  const loadCompanies = async () => {
    try {
      setCompanyLoading(true);

      const branch = localStorage.getItem("branch") || "";

      const res = await getCompanyList(branch);

      setCompanies(res?.data || []);
    } catch (error) {
      toast.error("Failed to load companies");
    } finally {
      setCompanyLoading(false);
    }
  };
  const fetchCharges = async () => {
    try {
      const branch = localStorage.getItem("branch") || "";

      const response = await getChargesDetails(branch);

      setCharges(response || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load charges");
    }
  };
  const handleChargeSelect = (chargeType: string) => {
    const alreadyExists = selectedCharges.some(
      (c) => c.chargeType === chargeType,
    );

    if (alreadyExists) {
      return;
    }

    setSelectedCharges((prev) => [
      ...prev,
      {
        chargeType,
        amount: 0,
      },
    ]);
  };

const updateChargeAmount = (
  chargeType: string,
  amount: number
) => {

  // TEMP UPDATED CHARGES
  const updatedCharges =
    selectedCharges.map((c) =>
      c.chargeType === chargeType
        ? { ...c, amount }
        : c
    );

  // TOTAL CHARGES
  const totalCharges =
    updatedCharges.reduce(
      (sum, c) =>
        sum + Number(c.amount || 0),
      0
    );

  // VALIDATION
  if (totalCharges > PAYABLE_AMOUNT) {
    toast.error(
      "Additional charges cannot exceed original amount"
    );

    return;
  }

  // SAVE CHARGES
  setSelectedCharges(updatedCharges);

  // REMAINING AMOUNT
  const remainingAmount =
    PAYABLE_AMOUNT - totalCharges;

  // AUTO UPDATE FIRST PAYMENT
  setPaymentDetails((prev) => {

    if (!prev.length) return prev;

    const updated = [...prev];

    updated[0] = {
      ...updated[0],
      amount:
        remainingAmount > 0
          ? remainingAmount
          : 0,
    };

    return updated;
  });
};
const removeCharge = (
  chargeType: string
) => {

  const updatedCharges =
    selectedCharges.filter(
      (c) =>
        c.chargeType !== chargeType
    );

  setSelectedCharges(
    updatedCharges
  );

  // RECALCULATE CHARGES
  const totalCharges =
    updatedCharges.reduce(
      (sum, c) =>
        sum + Number(c.amount || 0),
      0
    );

  // AUTO UPDATE PAYMENT
  const remainingAmount =
    PAYABLE_AMOUNT -
    totalCharges;

  setPaymentDetails((prev) => {

    if (!prev.length) return prev;

    const updated = [...prev];

    updated[0] = {
      ...updated[0],
      amount:
        remainingAmount > 0
          ? remainingAmount
          : 0,
    };

    return updated;
  });
};
  const startDevicePayment = async (amount: number) => {
    console.log(amount);

    try {
      setDevicePaymentLoading(true);

      const transNo = `TXN${Date.now()}`;

      // SEND PAYMENT
      const sendRes = await sendPaymentRequestDQRDevice(100, transNo);

      console.log("SEND RES", sendRes);

      if (!sendRes?.success) {
        toast.error(sendRes?.message || "Failed to send payment request");

        setDevicePaymentLoading(false);

        return;
      }

      setDevicePaymentStatus("PENDING");

      // CHECK STATUS EVERY 2 SEC
      paymentIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await getPaymentStatusRequestDQRDevice(transNo);

          console.log("STATUS RES", statusRes);

          const status = statusRes?.data?.status;

          setDevicePaymentStatus(status);

          // SUCCESS
          // SUCCESS
          if (status === "SUCCESS") {
            clearInterval(paymentIntervalRef.current);

            setDevicePaymentLoading(false);

            toast.success("Payment Successful");

            // AUTO SUBMIT PAYMENT
            const payload = {
              paymentDetails,
              total: paymentDetails.reduce(
                (sum, p) => sum + Number(p.amount || 0),
                0,
              ),
              difference: 0,
              payableAmount: PAYABLE_AMOUNT,
            };

            onPay(payload);

            setSelectedMulti({});

            setPaymentDetails([]);

            setSelectedCharges([]);

            setUpiType("");

            handleClose();
          }

          // FAILED
          if (status === "FAILED" || status === "DECLINED") {
            clearInterval(paymentIntervalRef.current);

            setDevicePaymentLoading(false);

            toast.error("Payment Failed");
          }
        } catch (error) {
          console.log(error);
        }
      }, 2000);
    } catch (error: any) {
      console.log(error);

      setDevicePaymentLoading(false);

      toast.error(error?.response?.data?.message || "Device payment failed");
    }
  };
  // add cleanup useEffect

  useEffect(() => {
    return () => {
      if (paymentIntervalRef.current) {
        clearInterval(paymentIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCharges();

      if (runApi) runApi();
    }
  }, [isOpen]);
useEffect(() => {

  if (
    isOpen &&
    existingPaymentData
  ) {

    // PAYMENT DETAILS
    setPaymentDetails(
      existingPaymentData
        ?.paymentDetails || []
    );

    // SELECTED MODES
    const selectedObj: Record<
      string,
      string
    > = {};

    (
      existingPaymentData
        ?.paymentDetails || []
    ).forEach((p: any) => {
      selectedObj[p.mode] = "";
    });

    setSelectedMulti(selectedObj);

    // CHARGES
    setSelectedCharges(
      (
        existingPaymentData
          ?.individualCharges || []
      ).map((c: any) => ({
        chargeType:
          c.chargesType,

        amount:
          c.chargesAmount,
      }))
    );
  }

}, [
  isOpen,
  existingPaymentData,
]);


  if (!isOpen) return null;

  /* ---------------- UPDATE PAYMENT ---------------- */
  const updatePayment = (
    modeType: string,
    field: "amount" | "subMode" | "remarks",
    value: any,
  ) => {
    setPaymentDetails((prev) => {
      const index = prev.findIndex((p) => p.mode === modeType);

      if (index !== -1) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
        return updated;
      }

      return [
        ...prev,
        {
          mode: modeType,
          subMode: "",
          amount: 0,
          remarks: "",
        },
      ];
    });
  };

  /* ---------------- SELECT MODE ---------------- */
  const handleModeClick = (modeType: string) => {
    // DEFAULT QR DEVICE FOR UPI
    if (modeType?.toLowerCase().includes("company")) {
      loadCompanies();
    }
    if (modeType === "UPI") {
      setUpiType("device");
    }

    const isSelected = selectedMulti[modeType] !== undefined;

    if (isSelected) {
      setSelectedMulti((prev) => {
        const updated = { ...prev };
        delete updated[modeType];
        return updated;
      });

      setPaymentDetails((prev) => prev.filter((p) => p.mode !== modeType));
      return;
    }

    setSelectedMulti((prev) => ({
      ...prev,
      [modeType]: "",
    }));

    setPaymentDetails((prev) => {
      if (prev.some((p) => p.mode === modeType)) return prev;

      const currentTotal = prev.reduce((sum, p) => sum + p.amount, 0);
   const totalCharges =
  selectedCharges.reduce(
    (sum, c) =>
      sum + Number(c.amount || 0),
    0
  );

const remaining =
  PAYABLE_AMOUNT -
  totalCharges -
  currentTotal;

      const modeObj = paymentModes.find((m) => m.modeType === modeType);
      const firstSubMode = modeObj?.subModes?.[0]?.subModeType || "";

      return [
        ...prev,
        {
          mode: modeType,
          subMode: firstSubMode, // ✅ auto select
          amount:
            prev.length === 0 ? PAYABLE_AMOUNT : remaining > 0 ? remaining : 0,
          remarks: "",
        },
      ];
    });
  };

  /* ---------------- CALCULATIONS ---------------- */
  const total = paymentDetails.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0,
  );

  const totalCharges = selectedCharges.reduce(
    (sum, c) => sum + Number(c.amount || 0),
    0,
  );

  const finalPayable = PAYABLE_AMOUNT;

  const difference =
  PAYABLE_AMOUNT -
  total -
  totalCharges;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="w-full max-w-lg h-full sm:h-[90vh] bg-white sm:rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#0576B2] text-white px-4 py-3 flex justify-between items-center">
          <h2 className="font-semibold text-lg">💳 Payment</h2>
          <button onClick={handleClose}>×</button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* MODES */}
          <div>
            <p className="font-semibold mb-2">Select Payment Mode</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {paymentModes
                .filter(
                  (m) =>
                    m.modeType !== "Online" &&
                    m.modeType !== "Transfer to Company" &&
                    m.modeType !== "Transfer to Room",
                )
                .map((m) => {
                  const isSelected = selectedMulti[m.modeType] !== undefined;

                  return (
                    <button
                      key={m.modeId}
                      onClick={() => handleModeClick(m.modeType)}
                      className={`border rounded px-3 py-3 text-sm font-semibold ${
                        isSelected ? "bg-[#0576B2] text-white" : ""
                      }`}
                    >
                      {m.modeType}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* INPUTS */}
          <div className="space-y-3">
            <p className="font-semibold">Enter Amount</p>

            {paymentDetails.map((p) => (
              <div key={p.mode} className="border p-3 rounded space-y-2">
         {p.mode === "Card" ? (
  <div className="space-y-3">
    {/* SUB MODE DROPDOWN */}
    <select
      value={p.subMode || ""}
      onChange={(e) => {
        updatePayment(p.mode, "subMode", e.target.value);
      }}
      className="w-full border rounded px-3 py-2"
    >
      <option value="">Select Card Type</option>

      {paymentModes
        .find((m) => m.modeType === "Card")
        ?.subModes?.map((sub) => (
          <option key={sub.subModeId} value={sub.subModeType}>
            {sub.subModeType}
          </option>
        ))}
    </select>

    {/* SHOW INPUT ONLY AFTER SELECT */}
    {p.subMode && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded p-2">
        <span className="font-medium">{p.subMode}</span>

        <input
          type="text"
          inputMode="numeric"
          value={p.amount || ""}
          onChange={(e) => {
            const value = e.target.value;

            if (!/^\d*$/.test(value)) return;

            const numValue = Number(value || 0);

            const otherTotal = paymentDetails
              .filter(
                (x) =>
                  !(
                    x.mode === "Card" &&
                    x.subMode === p.subMode
                  ),
              )
              .reduce((sum, x) => sum + x.amount, 0);

            if (numValue + otherTotal > PAYABLE_AMOUNT) {
              toast.error("Total exceeds payable");

              return;
            }

            updatePayment("Card", "amount", numValue);
          }}
          className="w-full sm:w-24 border rounded px-2 py-1 text-right"
        />
      </div>
    )}
  </div>
) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="font-medium">{p.mode}</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={p.amount || ""}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (!/^\d*$/.test(value)) return;

                        const numValue = Number(value || 0);

                        const otherTotal = paymentDetails
                          .filter((x) => x.mode !== p.mode)
                          .reduce((sum, x) => sum + x.amount, 0);

                        if (numValue + otherTotal > PAYABLE_AMOUNT) {
                          toast.error("Total exceeds payable");

                          return;
                        }

                        updatePayment(p.mode, "amount", numValue);
                      }}
                      className="w-full sm:w-24 border rounded px-2 py-1 text-right"
                    />
                  </div>
                )}

                {p.mode === "UPI" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUpiType("own")}
                      className={`flex-1 border rounded py-1 ${
                        upiType === "own" ? "bg-blue-500 text-white" : ""
                      }`}
                    >
                      Own Device
                    </button>

                    <button
                      onClick={() => setUpiType("device")}
                      className={`flex-1 border rounded py-1 ${
                        upiType === "device" ? "bg-blue-500 text-white" : ""
                      }`}
                    >
                      QR Device
                    </button>
                  </div>
                )}

                {p.mode === "UPI" && upiType === "own" && (
                  <div className="border p-3 rounded text-center">
                    <p className="text-sm mb-2">Scan QR to Pay</p>

                    {/* Dummy QR */}
                    <div className="w-32 h-32 mx-auto bg-gray-200 flex items-center justify-center">
                      QR CODE
                    </div>
                  </div>
                )}

                {p.mode === "UPI" && upiType === "device" && (
                  <div className="border p-3 rounded text-center space-y-3">
                    <p className="text-orange-500 font-semibold">
                      Waiting for payment from QR device...
                    </p>

                    <div className="text-sm">
                      Status :{" "}
                      <span
                        className={`font-semibold ${
                          devicePaymentStatus === "SUCCESS"
                            ? "text-green-600"
                            : devicePaymentStatus === "FAILED" ||
                                devicePaymentStatus === "DECLINED"
                              ? "text-red-600"
                              : "text-orange-500"
                        }`}
                      >
                        {devicePaymentStatus || "NOT STARTED"}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={devicePaymentLoading}
                      onClick={() => startDevicePayment(PAYABLE_AMOUNT)}
                      className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                    >
                      {devicePaymentLoading
                        ? "Waiting..."
                        : "Start Device Payment"}
                    </button>
                  </div>
                )}
                {p.mode?.toLowerCase().includes("company") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Select Company
                    </label>

                    <select
                      value={p.subMode || ""}
                      onChange={(e) =>
                        updatePayment(p.mode, "subMode", e.target.value)
                      }
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Select Company</option>

                      {companies.map((c) => (
                        <option key={c.companyCode} value={c.companyCode}>
                          {c.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <textarea
                  value={p.remarks || ""}
                  onChange={(e) =>
                    updatePayment(p.mode, "remarks", e.target.value)
                  }
                  placeholder={`Remarks for ${p.mode}`}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
            ))}
          </div>

          {/* SUMMARY */}
{/* SUMMARY */}
<div className="bg-gray-50 p-4 rounded-xl border space-y-3">

  <div className="flex justify-between text-sm text-gray-600">
    <span>Original Amount</span>
    <span>₹{PAYABLE_AMOUNT}</span>
  </div>

  {totalCharges > 0 && (
    <div className="flex justify-between text-sm text-orange-600">
      <span>Additional Charges</span>
      <span>₹{totalCharges}</span>
    </div>
  )}

  {/* FINAL PAYABLE HIGHLIGHT */}
  <div className="bg-green-100 border border-green-300 rounded-lg px-4 py-3">
    <div className="flex justify-between items-center">
      <span className="text-base font-bold text-green-800">
        Final Payable
      </span>

      <span className="text-2xl font-extrabold text-green-700">
        ₹{finalPayable}
      </span>
    </div>
  </div>

 

  {/* ONLY SHOW REMAINING / EXCESS */}
  {difference !== 0 && (
    <div
      className={`flex justify-between font-bold text-sm ${
        difference > 0
          ? "text-red-600"
          : "text-orange-600"
      }`}
    >
    

    </div>
  )}

  {fullSettlement &&
    paymentDetails.length > 0 &&
    difference !== 0 && (
      <div className="text-xs text-red-500 text-right font-medium">
        ⚠ Payment amount must match ₹{PAYABLE_AMOUNT}
      </div>
  )}
</div>
          <div className="border rounded-lg p-3 space-y-3">
            <h3 className="font-semibold">Additional Charges</h3>

            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleChargeSelect(e.target.value);

                  e.target.value = "";
                }
              }}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Charges</option>

              {charges.map((c) => (
                <option key={c.chargesId} value={c.chargesType}>
                  {c.chargesType}
                </option>
              ))}
            </select>

            {selectedCharges.map((charge, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-2 items-center"
              >
                <input
                  type="text"
                  value={charge.chargeType}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />

                <input
                  type="number"
                  placeholder="Amount"
                  value={charge.amount || ""}
                  onChange={(e) =>
                    updateChargeAmount(
                      charge.chargeType,
                      Number(e.target.value),
                    )
                  }
                  className="w-full sm:w-40 border rounded px-3 py-2"
                />

                <button
                  type="button"
                  onClick={() => removeCharge(charge.chargeType)}
                  className="bg-red-500 text-white px-3 py-2 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t p-3 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto border px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
   onClick={() => {
  // COMPANY VALIDATION
  const companyPayment = paymentDetails.find((p) =>
    p.mode?.toLowerCase().includes("company"),
  );

  if (companyPayment && !companyPayment.subMode) {
    toast.error("Please select company");
    return;
  }

  // CARD VALIDATION
  const cardPayment = paymentDetails.find(
    (p) => p.mode === "Card",
  );

  if (cardPayment) {
    if (!cardPayment.subMode) {
      toast.error("Please select card type");
      return;
    }

    if (!cardPayment.amount || cardPayment.amount <= 0) {
      toast.error("Please enter card amount");
      return;
    }
  }

  // GENERAL PAYMENT VALIDATION
  if (paymentDetails.length === 0) {
    toast.error("Please select payment mode");
    return;
  }

  const invalidAmount = paymentDetails.some(
    (p) => !p.amount || p.amount <= 0,
  );

  if (invalidAmount) {
    toast.error("Please enter valid amount");
    return;
  }
if (
  fullSettlement &&
  paymentDetails.length > 0 &&
  difference !== 0
) {
  toast.error(
    "Payment amount must match payable amount"
  );
  return;
}

  const payload = {
    paymentDetails,
    total,
    difference,
    payableAmount: finalPayable,
    selectedCharges,
    totalCharges,
  };

  onPay(payload);

  // CLEAR TEMP STATE
  setSelectedMulti({});
  setPaymentDetails([]);
  setSelectedCharges([]);
  setUpiType("");
}}
            className="w-full sm:w-auto px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
