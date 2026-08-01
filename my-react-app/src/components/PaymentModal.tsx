import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  checkOwnDevicePaymentStatus,
  getCompanyList,
  getOnlinePaymentType,
  getPaymentStatusRequestDQRDevice,
  sendPaymentRequestDQRDevice,
  sendPaymentRequestOwnDevice,
} from "../api/services/products.service";
import QRCode from "react-qr-code";
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPay: (data: any) => void;
  paymentModes: PaymentMode[];
  runApi?: () => void;
  unbillData?: any;
  billNo?: any;
  refresh?: () => void;
};

const PaymentModal: React.FC<Props> = ({
  billNo,
  isOpen,
  runApi,
  onClose,
  onPay,
  paymentModes,
  unbillData,
}) => {
  const [isQRActive, setIsQRActive] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadPaymentType = async () => {
      try {
        const res = await getOnlinePaymentType();
        setIsQRActive(res?.isQRActive ?? false);
      } catch (err) {
        console.error(err);
        setIsQRActive(false);
      }
    };

    loadPaymentType();

    if (runApi) runApi();
  }, [isOpen]);

  console.log("paymentModes", paymentModes);

  const handleClose = () => {
    setSelectedMulti({});
    setPaymentDetails([]);
    onClose();
    setUpiType("");
  };
  console.log("billNo", billNo);

  const [ownQrString, setOwnQrString] = useState("");
  const [ownPaymentLoading, setOwnPaymentLoading] = useState(false);
  const [ownPaymentStatus, setOwnPaymentStatus] = useState("");

  const ownPaymentIntervalRef = useRef<any>(null);
  const [upiType, setUpiType] = useState<"own" | "device" | "">("");

  const [selectedMulti, setSelectedMulti] = useState<Record<string, string>>(
    {},
  );
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);


  const PAYABLE_AMOUNT = Math.round(Number(unbillData?.[0]?.total || 0));
  // inside component states

  const [devicePaymentLoading, setDevicePaymentLoading] = useState(false);

  const [devicePaymentStatus, setDevicePaymentStatus] = useState("");

  const paymentIntervalRef = useRef<any>(null);
  // add this inside component
  const [companies, setCompanies] = useState<any[]>([]);
  const [_companyLoading, setCompanyLoading] = useState(false);

  const startOwnDevicePayment = async (amount: number) => {
    const amountInPaise = Math.round(amount * 100);

    try {
      setOwnPaymentLoading(true);

      const transNo = `TXN${Date.now()}`;

      const sendRes = await sendPaymentRequestOwnDevice(amountInPaise, transNo);

      console.log("OWN SEND", sendRes);

      if (!sendRes?.success) {
        toast.error(sendRes?.message || "Failed to create QR");

        setOwnPaymentLoading(false);

        return;
      }

      const qrString = sendRes?.data?.qrString;

      setOwnQrString(qrString);

      setOwnPaymentStatus("PENDING");

      ownPaymentIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await checkOwnDevicePaymentStatus(transNo);

          console.log("OWN STATUS", statusRes);

          const code = statusRes?.code;

          // SUCCESS
          if (code === "PAYMENT_SUCCESS") {
            clearInterval(ownPaymentIntervalRef.current);

            setOwnPaymentStatus("SUCCESS");

            setOwnPaymentLoading(false);

            toast.success("Payment Successful");

            onPay({
              paymentDetails,
              total: paymentDetails.reduce(
                (sum, p) => sum + Number(p.amount || 0),
                0,
              ),
              difference: 0,
              payableAmount: PAYABLE_AMOUNT,
            });

            handleClose();
          }
        } catch (err) {
          console.log(err);
        }
      }, 2000);
    } catch (error: any) {
      console.log(error);

      setOwnPaymentLoading(false);

      toast.error(error?.response?.data?.message || "Payment failed");
    }
  };

  useEffect(() => {
    return () => {
      if (paymentIntervalRef.current) {
        clearInterval(paymentIntervalRef.current);
      }

      if (ownPaymentIntervalRef.current) {
        clearInterval(ownPaymentIntervalRef.current);
      }
    };
  }, []);

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
  const startDevicePayment = async (amount: number) => {
    console.log(amount);

    try {
      setDevicePaymentLoading(true);

      const transNo = `TXN${Date.now()}`;
      const amountInPaise = Math.round(amount * 100);
      // SEND PAYMENT
      const sendRes = await sendPaymentRequestDQRDevice(amountInPaise, transNo);

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
            onPay({
              paymentDetails,
              total: paymentDetails.reduce(
                (sum, p) => sum + Number(p.amount || 0),
                0,
              ),
              difference: 0,
              payableAmount: PAYABLE_AMOUNT,
            });

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
    if (isOpen && runApi) runApi();
  }, [isOpen]);

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
    if (modeType === "UPI" && !upiType) {
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
      const remaining = PAYABLE_AMOUNT - currentTotal;

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

  const difference = PAYABLE_AMOUNT - total;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="w-full max-w-lg h-full sm:h-[90vh] bg-white sm:rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#0576B2] text-white px-4 py-3 flex justify-between items-center">
          <h2 className="font-semibold text-lg">💳 Payment</h2>
          <button onClick={handleClose}>×</button>
        </div>
  
      <h1 className="p-3 text-lg text-black">
        Bill No: <span className="font-semibold">{billNo}</span>
      </h1>
        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* MODES */}
          <div>
            <p className="font-semibold mb-2">Select Payment Mode</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {paymentModes
                .filter((m) => m.modeType !== "Online")
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
                    {/* CARD SUBMODE DROPDOWN */}
                    <select
                      value={p.subMode || ""}
                      onChange={(e) =>
                        updatePayment(p.mode, "subMode", e.target.value)
                      }
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

                    {/* SHOW TEXTBOX ONLY AFTER SELECT */}
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

                {p.mode === "UPI" && upiType === "own" && (
                  <div className="border p-3 rounded text-center space-y-3">
                    {ownPaymentLoading && !ownQrString && (
                      <p>Generating QR...</p>
                    )}

                    {ownQrString && (
                      <>
                        <p className="font-medium">Scan QR to Pay</p>

                        <div className="flex justify-center">
                          <QRCode value={ownQrString} size={220} />
                        </div>

                        <div className="text-sm">
                          Status :
                          <span className="font-semibold ml-2">
                            {ownPaymentStatus}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {/* {p.mode === "UPI" && (
  <div className="flex gap-2 mb-3">
    <button
      type="button"
    onClick={() => {
  setUpiType("own");

  if (!ownQrString) {
    startOwnDevicePayment(
      PAYABLE_AMOUNT
    );
  }
}}
      className={`flex-1 border rounded py-2 ${
        upiType === "own"
          ? "bg-blue-500 text-white"
          : ""
      }`}
    >
      Own Device
    </button>

    <button
      type="button"
      onClick={() => setUpiType("device")}
      className={`flex-1 border rounded py-2 ${
        upiType === "device"
          ? "bg-blue-500 text-white"
          : ""
      }`}
    >
      QR Device
    </button>
  </div>
)} */}
                {p.mode === "UPI" &&
                  (isQRActive ? (
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          setUpiType("own");

                          if (!ownQrString) {
                            startOwnDevicePayment(PAYABLE_AMOUNT);
                          }
                        }}
                        className={`flex-1 border rounded py-2 ${
                          upiType === "own" ? "bg-blue-500 text-white" : ""
                        }`}
                      >
                        Own QR
                      </button>

                      <button
                        type="button"
                        onClick={() => setUpiType("device")}
                        className={`flex-1 border rounded py-2 ${
                          upiType === "device" ? "bg-blue-500 text-white" : ""
                        }`}
                      >
                        QR Device
                      </button>
                    </div>
                  ) : (
                    <select
                      value={p.subMode || ""}
                      onChange={(e) =>
                        updatePayment(p.mode, "subMode", e.target.value)
                      }
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Select UPI</option>

                      {paymentModes
                        .find((m) => m.modeType === "UPI")
                        ?.subModes.map((sub) => (
                          <option key={sub.subModeId} value={sub.subModeType}>
                            {sub.subModeType}
                          </option>
                        ))}
                    </select>
                  ))}

                {isQRActive && p.mode === "UPI" && upiType === "device" && (
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
          <div className="bg-gray-50 p-3 rounded-lg border space-y-2">
            <div className="flex justify-between text-sm font-semibold text-gray-600">
              <span>Payable</span>
              <span>₹{PAYABLE_AMOUNT}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Entered</span>
              <span>₹{total}</span>
            </div>

            <div
              className={`flex justify-between font-bold ${
                difference === 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <span>
                {difference === 0
                  ? "Balanced"
                  : difference > 0
                    ? "Remaining"
                    : "Excess"}
              </span>
              <span>₹{Math.abs(difference)}</span>
            </div>

            {difference !== 0 && (
              <div className="text-xs text-red-500 text-right">
                ⚠ Amount must match ₹{PAYABLE_AMOUNT}
              </div>
            )}
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
  onClick={async () => {
    if (submitLoading) return;

    setSubmitLoading(true);

    try {
      // ✅ COMPANY VALIDATION
      const companyPayment = paymentDetails.find((p) =>
        p.mode?.toLowerCase().includes("company"),
      );

      if (companyPayment && !companyPayment.subMode) {
        toast.error("Please select company");
        return;
      }

      await onPay({
        paymentDetails,
        total,
        difference,
        payableAmount: PAYABLE_AMOUNT,
      });
    } finally {
      setSubmitLoading(false);
    }
  }}
  disabled={difference !== 0 || submitLoading}
  className={`w-full sm:w-auto px-4 py-2 rounded text-white ${
    difference === 0 && !submitLoading
      ? "bg-green-600"
      : "bg-gray-400 cursor-not-allowed"
  }`}
>
  {submitLoading ? "Submitting..." : "Submit"}
</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
