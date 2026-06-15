// import React, { useEffect, useState } from "react";
// import toast from "react-hot-toast";

// type SubMode = {
//   subModeId: number;
//   subModeType: string;
// };

// type PaymentMode = {
//   modeId: number;
//   modeType: string;
//   subModes: SubMode[];
// };

// type PaymentDetail = {
//   mode: string;
//   subMode: string;
//   amount: number;
//   remarks?: string;
// };

// type Props = {
//   isOpen: boolean;
//   onClose: () => void;
//   onPay: (data: any) => void;
//   paymentModes: PaymentMode[];
//   runApi?: () => void;
//   unbillData?: any;
//   billNo?: any;
//   refresh?: () => void;
// };

// const PaymentModal: React.FC<Props> = ({
//   isOpen,
//   runApi,
//   onClose,
//   onPay,
//   paymentModes,
//   unbillData,
// }) => {
//   const [selectedMulti, setSelectedMulti] = useState<Record<string, string>>({});
//   const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([]);

//   const PAYABLE_AMOUNT = Math.round(Number(unbillData?.tax?.grandTotal || 0));

//   /* ✅ FIX 1: CALL API ONLY WHEN OPEN */
//   useEffect(() => {
//     if (isOpen && runApi) {
//       runApi();
//     }
//   }, [isOpen]); // ❗ important: no runApi here

//   /* ✅ FIX 2: RESET STATE WHEN OPEN */
//   useEffect(() => {
//     if (isOpen) {
//       setSelectedMulti({});
//       setPaymentDetails([]);
//     }
//   }, [isOpen]);

//   /* ✅ FIX 3: SYNC PAYABLE */
//   useEffect(() => {
//     if (!isOpen) return;

//     setPaymentDetails((prev) =>
//       prev.map((p, index) => ({
//         ...p,
//         amount: index === 0 ? PAYABLE_AMOUNT : p.amount,
//       }))
//     );
//   }, [PAYABLE_AMOUNT, isOpen]);

//   /* ❗ FIX 4: AFTER ALL HOOKS */
//   if (!isOpen) return null;

//   const handleClose = () => {
//     setSelectedMulti({});
//     setPaymentDetails([]);
//     onClose();
//   };

//   /* ---------------- UPDATE PAYMENT ---------------- */
//   const updatePayment = (
//     modeType: string,
//     field: "amount" | "subMode" | "remarks",
//     value: any
//   ) => {
//     setPaymentDetails((prev) => {
//       const index = prev.findIndex((p) => p.mode === modeType);

//       if (index !== -1) {
//         const updated = [...prev];
//         updated[index] = {
//           ...updated[index],
//           [field]: value,
//         };
//         return updated;
//       }

//       return [
//         ...prev,
//         {
//           mode: modeType,
//           subMode: "",
//           amount: 0,
//           remarks: "",
//         },
//       ];
//     });
//   };

//   /* ---------------- SELECT MODE ---------------- */
//   const handleModeClick = (modeType: string) => {
//     const isSelected = selectedMulti[modeType] !== undefined;

//     if (isSelected) {
//       setSelectedMulti((prev) => {
//         const updated = { ...prev };
//         delete updated[modeType];
//         return updated;
//       });

//       setPaymentDetails((prev) => prev.filter((p) => p.mode !== modeType));
//       return;
//     }

//     setSelectedMulti((prev) => ({
//       ...prev,
//       [modeType]: "",
//     }));

//     setPaymentDetails((prev) => {
//       if (prev.some((p) => p.mode === modeType)) return prev;

//       const currentTotal = prev.reduce((sum, p) => sum + p.amount, 0);
//       const remaining = PAYABLE_AMOUNT - currentTotal;

//       return [
//         ...prev,
//         {
//           mode: modeType,
//           subMode: "",
//           amount:
//             prev.length === 0 ? PAYABLE_AMOUNT : remaining > 0 ? remaining : 0,
//           remarks: "",
//         },
//       ];
//     });
//   };

//   /* ---------------- CALCULATIONS ---------------- */
//   const total = paymentDetails.reduce(
//     (sum, p) => sum + Number(p.amount || 0),
//     0
//   );

//   const difference = PAYABLE_AMOUNT - total;

//   return (
//     <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
//       <div className="w-full max-w-lg h-full sm:h-[90vh] bg-white sm:rounded-xl shadow-xl flex flex-col overflow-hidden">

//         {/* HEADER */}
//         <div className="bg-[#0576B2] text-white px-4 py-3 flex justify-between items-center">
//           <h2 className="font-semibold text-lg">💳 Payment</h2>
//           <button onClick={handleClose}>×</button>
//         </div>

//         {/* BODY */}
//         <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">

//           {/* MODES */}
//           <div>
//             <p className="font-semibold mb-2">Select Payment Mode</p>
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//               {paymentModes.map((m) => {
//                 const isSelected = selectedMulti[m.modeType] !== undefined;

//                 return (
//                   <button
//                     key={m.modeId}
//                     onClick={() => handleModeClick(m.modeType)}
//                     className={`border rounded px-3 py-3 text-sm font-semibold ${
//                       isSelected ? "bg-[#0576B2] text-white" : ""
//                     }`}
//                   >
//                     {m.modeType}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* INPUTS */}
//           <div className="space-y-3">
//             <p className="font-semibold">Enter Amount</p>

//             {paymentDetails.map((p) => (
//               <div key={p.mode} className="border p-3 rounded space-y-2">
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//                   <span className="font-medium">{p.mode}</span>

//                   <input
//                     type="text"
//                     inputMode="numeric"
//                     value={p.amount || ""}
//                     onChange={(e) => {
//                       const value = e.target.value;
//                       if (!/^\d*$/.test(value)) return;

//                       const numValue = Number(value || 0);

//                       const otherTotal = paymentDetails
//                         .filter((x) => x.mode !== p.mode)
//                         .reduce((sum, x) => sum + x.amount, 0);

//                       if (numValue + otherTotal > PAYABLE_AMOUNT) {
//                         toast.error("Total exceeds payable");
//                         return;
//                       }

//                       updatePayment(p.mode, "amount", numValue);
//                     }}
//                     className="w-full sm:w-24 border rounded px-2 py-1 text-right"
//                   />
//                 </div>

//                 {/* SUB MODE */}
//                 {(() => {
//                   const mode = paymentModes.find((m) => m.modeType === p.mode);

//                   if (!mode || !mode.subModes || mode.subModes.length === 0)
//                     return null;

//                   return (
//                     <select
//                       value={p.subMode || ""}
//                       onChange={(e) =>
//                         updatePayment(p.mode, "subMode", e.target.value)
//                       }
//                       className="w-full border rounded px-2 py-1 text-sm"
//                     >
//                       <option value="">Select Sub Mode</option>
//                       {mode.subModes.map((s) => (
//                         <option key={s.subModeId} value={s.subModeType}>
//                           {s.subModeType}
//                         </option>
//                       ))}
//                     </select>
//                   );
//                 })()}

//                 <textarea
//                   value={p.remarks || ""}
//                   onChange={(e) =>
//                     updatePayment(p.mode, "remarks", e.target.value)
//                   }
//                   placeholder={`Remarks for ${p.mode}`}
//                   className="w-full border rounded px-2 py-1 text-sm"
//                 />
//               </div>
//             ))}
//           </div>

//           {/* SUMMARY */}
//           <div className="bg-gray-50 p-3 rounded-lg border space-y-2">
//             <div className="flex justify-between text-sm font-semibold text-gray-600">
//               <span>Payable</span>
//               <span>₹{PAYABLE_AMOUNT}</span>
//             </div>

//             <div className="flex justify-between text-sm">
//               <span>Entered</span>
//               <span>₹{total}</span>
//             </div>

//             <div className={`flex justify-between font-bold ${
//               difference === 0 ? "text-green-600" : "text-red-600"
//             }`}>
//               <span>
//                 {difference === 0
//                   ? "Balanced"
//                   : difference > 0
//                   ? "Remaining"
//                   : "Excess"}
//               </span>
//               <span>₹{Math.abs(difference)}</span>
//             </div>
//           </div>

//         </div>

//         {/* FOOTER */}
//         <div className="border-t p-3 flex flex-col sm:flex-row gap-2 sm:justify-between">
//           <button
//             onClick={handleClose}
//             className="w-full sm:w-auto border px-4 py-2 rounded"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={() => {
//               if (paymentDetails.length === 0) {
//                 toast.error("Select at least one payment mode");
//                 return;
//               }

//               if (difference !== 0) {
//                 toast.error(`Amount must match ₹${PAYABLE_AMOUNT}`);
//                 return;
//               }

//               onPay({
//                 paymentDetails,
//                 total,
//                 difference,
//                 payableAmount: PAYABLE_AMOUNT,
//               });
//             }}
//           >
//             Submit
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default PaymentModal;

import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
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
  isOpen,
  runApi,
  onClose,
  onPay,
  paymentModes,
  unbillData,
}) => {
  const [selectedMulti, setSelectedMulti] = useState<
    Record<string, string>
  >({});

  const [paymentDetails, setPaymentDetails] =
    useState<PaymentDetail[]>([]);

  const [upiType, setUpiType] = useState<
    "own" | "device" | ""
  >("");

  const [devicePaymentLoading, setDevicePaymentLoading] =
    useState(false);

  const [devicePaymentStatus, setDevicePaymentStatus] =
    useState("");

  const paymentIntervalRef = useRef<any>(null);

  const PAYABLE_AMOUNT = Math.round(
    Number(unbillData?.tax?.grandTotal || 0)
  );

  /* API */
  useEffect(() => {
    if (isOpen && runApi) {
      runApi();
    }
  }, [isOpen]);

  /* RESET */
  useEffect(() => {
    if (isOpen) {
      setSelectedMulti({});
      setPaymentDetails([]);
      setUpiType("");
      setDevicePaymentStatus("");
    }
  }, [isOpen]);

  /* PAYABLE */
  useEffect(() => {
    if (!isOpen) return;

    setPaymentDetails((prev) =>
      prev.map((p, index) => ({
        ...p,
        amount:
          index === 0
            ? PAYABLE_AMOUNT
            : p.amount,
      }))
    );
  }, [PAYABLE_AMOUNT, isOpen]);

  /* CLEANUP */
  useEffect(() => {
    return () => {
      if (paymentIntervalRef.current) {
        clearInterval(
          paymentIntervalRef.current
        );
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedMulti({});
    setPaymentDetails([]);
    setUpiType("");
    onClose();
  };

  /* DEVICE PAYMENT */
  const startDevicePayment = async (
    amount: number
  ) => {
    try {
      setDevicePaymentLoading(true);

      const transNo = `TXN${Date.now()}`;
console.log(amount);

      const sendRes =
        await sendPaymentRequestDQRDevice(
          100,
          transNo
        );

      if (!sendRes?.success) {
        toast.error(
          sendRes?.message ||
            "Payment request failed"
        );

        setDevicePaymentLoading(false);

        return;
      }

      setDevicePaymentStatus("PENDING");

      paymentIntervalRef.current =
        setInterval(async () => {
          try {
            const statusRes =
              await getPaymentStatusRequestDQRDevice(
                transNo
              );

            const status =
              statusRes?.data?.status;

            setDevicePaymentStatus(status);

         if (status === "SUCCESS") {
  clearInterval(
    paymentIntervalRef.current
  );

  setDevicePaymentLoading(
    false
  );

  toast.success(
    "Payment Successful"
  );

  // AUTO SUBMIT
  onPay({
    paymentDetails,
    total:
      paymentDetails.reduce(
        (sum, p) =>
          sum +
          Number(p.amount || 0),
        0
      ),
    difference: 0,
    payableAmount:
      PAYABLE_AMOUNT,
  });

  handleClose();
}

            if (
              status === "FAILED" ||
              status === "DECLINED"
            ) {
              clearInterval(
                paymentIntervalRef.current
              );

              setDevicePaymentLoading(
                false
              );

              toast.error(
                "Payment Failed"
              );
            }
          } catch (error) {
            console.log(error);
          }
        }, 2000);
    } catch (error: any) {
      console.log(error);

      setDevicePaymentLoading(false);

      toast.error(
        error?.response?.data?.message ||
          "Device payment failed"
      );
    }
  };

  /* UPDATE PAYMENT */
  const updatePayment = (
    modeType: string,
    field:
      | "amount"
      | "subMode"
      | "remarks",
    value: any
  ) => {
    setPaymentDetails((prev) => {
      const index = prev.findIndex(
        (p) => p.mode === modeType
      );

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

  /* SELECT MODE */
const handleModeClick = (modeType: string) => {
  // DEFAULT QR DEVICE FOR UPI
  if (modeType === "UPI") {
    setUpiType("device");
  }

  const isSelected =
    selectedMulti[modeType] !==
    undefined;
    if (isSelected) {
      setSelectedMulti((prev) => {
        const updated = { ...prev };

        delete updated[modeType];

        return updated;
      });

      setPaymentDetails((prev) =>
        prev.filter(
          (p) => p.mode !== modeType
        )
      );

      return;
    }

    setSelectedMulti((prev) => ({
      ...prev,
      [modeType]: "",
    }));

    setPaymentDetails((prev) => {
      if (
        prev.some(
          (p) => p.mode === modeType
        )
      )
        return prev;

      const currentTotal = prev.reduce(
        (sum, p) => sum + p.amount,
        0
      );

      const remaining =
        PAYABLE_AMOUNT - currentTotal;

      return [
        ...prev,
        {
          mode: modeType,
          subMode: "",
          amount:
            prev.length === 0
              ? PAYABLE_AMOUNT
              : remaining > 0
                ? remaining
                : 0,
          remarks: "",
        },
      ];
    });
  };

  /* TOTAL */
  const total = paymentDetails.reduce(
    (sum, p) =>
      sum + Number(p.amount || 0),
    0
  );

  const difference =
    PAYABLE_AMOUNT - total;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="w-full max-w-lg h-full sm:h-[90vh] bg-white sm:rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#0576B2] text-white px-4 py-3 flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            💳 Payment
          </h2>

          <button onClick={handleClose}>
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* MODES */}
          <div>
            <p className="font-semibold mb-2">
              Select Payment Mode
            </p>
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
  {paymentModes
    .filter((m) => m.modeType !== "Transfer To Company")
    .map((m) => {
                const isSelected =
                  selectedMulti[
                    m.modeType
                  ] !== undefined;

                return (
                  <button
                    key={m.modeId}
                    onClick={() =>
                      handleModeClick(
                        m.modeType
                      )
                    }
                    className={`border rounded px-3 py-3 text-sm font-semibold ${
                      isSelected
                        ? "bg-[#0576B2] text-white"
                        : ""
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
            <p className="font-semibold">
              Enter Amount
            </p>

            {paymentDetails.map((p) => (
              <div
                key={p.mode}
                className="border p-3 rounded space-y-2"
              >
                {/* CARD SUB MODES */}
         {p.mode === "Card" ? (
  <div className="space-y-3">
    {/* CARD TYPE DROPDOWN */}
    <select
      value={p.subMode || ""}
      onChange={(e) => {
        updatePayment(
          p.mode,
          "subMode",
          e.target.value
        );
      }}
      className="w-full border rounded px-3 py-2"
    >
      <option value="">
        Select Card Type
      </option>

      {paymentModes
        .find((m) => m.modeType === "Card")
        ?.subModes?.map((sub) => (
          <option
            key={sub.subModeId}
            value={sub.subModeType}
          >
            {sub.subModeType}
          </option>
        ))}
    </select>

    {/* SHOW INPUT ONLY AFTER SELECT */}
    {p.subMode && (
      <div className="border rounded p-2 space-y-2">
        <div className="flex justify-between items-center gap-2">
          <span className="font-medium">
            {p.subMode}
          </span>

          <input
            type="text"
            inputMode="numeric"
            value={p.amount || ""}
            onChange={(e) => {
              const value =
                e.target.value;

              if (
                !/^\d*$/.test(value)
              )
                return;

              const numValue =
                Number(value || 0);

              const otherTotal =
                paymentDetails
                  .filter(
                    (x) =>
                      x.mode !==
                      p.mode
                  )
                  .reduce(
                    (sum, x) =>
                      sum +
                      x.amount,
                    0
                  );

              if (
                numValue +
                  otherTotal >
                PAYABLE_AMOUNT
              ) {
                toast.error(
                  "Total exceeds payable"
                );

                return;
              }

              updatePayment(
                p.mode,
                "amount",
                numValue
              );
            }}
            className="w-24 border rounded px-2 py-1 text-right"
          />
        </div>

        <textarea
          value={p.remarks || ""}
          onChange={(e) =>
            updatePayment(
              p.mode,
              "remarks",
              e.target.value
            )
          }
          placeholder={`Remarks for ${p.subMode}`}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
    )}
  </div>
) : (
                  <>
                    {/* NORMAL MODE */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-medium">
                        {p.mode}
                      </span>

                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          p.amount || ""
                        }
                        onChange={(
                          e
                        ) => {
                          const value =
                            e.target
                              .value;

                          if (
                            !/^\d*$/.test(
                              value
                            )
                          )
                            return;

                          const numValue =
                            Number(
                              value || 0
                            );

                          const otherTotal =
                            paymentDetails
                              .filter(
                                (
                                  x
                                ) =>
                                  x.mode !==
                                  p.mode
                              )
                              .reduce(
                                (
                                  sum,
                                  x
                                ) =>
                                  sum +
                                  x.amount,
                                0
                              );

                          if (
                            numValue +
                              otherTotal >
                            PAYABLE_AMOUNT
                          ) {
                            toast.error(
                              "Total exceeds payable"
                            );

                            return;
                          }

                          updatePayment(
                            p.mode,
                            "amount",
                            numValue
                          );
                        }}
                        className="w-full sm:w-24 border rounded px-2 py-1 text-right"
                      />
                    </div>

                    {/* UPI */}
                    {p.mode ===
                      "UPI" && (
                      <>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setUpiType(
                                "own"
                              )
                            }
                            className={`flex-1 border rounded py-1 ${
                              upiType ===
                              "own"
                                ? "bg-blue-500 text-white"
                                : ""
                            }`}
                          >
                            Own Device
                          </button>

                          <button
                            onClick={() =>
                              setUpiType(
                                "device"
                              )
                            }
                            className={`flex-1 border rounded py-1 ${
                              upiType ===
                              "device"
                                ? "bg-blue-500 text-white"
                                : ""
                            }`}
                          >
                            QR Device
                          </button>
                        </div>

                        {upiType ===
                          "own" && (
                          <div className="border p-3 rounded text-center">
                            <p className="text-sm mb-2">
                              Scan QR to
                              Pay
                            </p>

                            <div className="w-32 h-32 mx-auto bg-gray-200 flex items-center justify-center">
                              QR CODE
                            </div>
                          </div>
                        )}

                        {upiType ===
                          "device" && (
                          <div className="border p-3 rounded text-center space-y-3">
                            <p className="text-orange-500 font-semibold">
                              Waiting
                              for
                              payment
                              from QR
                              device...
                            </p>

                            <div className="text-sm">
                              Status :{" "}
                              <span
                                className={`font-semibold ${
                                  devicePaymentStatus ===
                                  "SUCCESS"
                                    ? "text-green-600"
                                    : devicePaymentStatus ===
                                          "FAILED" ||
                                        devicePaymentStatus ===
                                          "DECLINED"
                                      ? "text-red-600"
                                      : "text-orange-500"
                                }`}
                              >
                                {devicePaymentStatus ||
                                  "NOT STARTED"}
                              </span>
                            </div>

                            <button
                              type="button"
                              disabled={
                                devicePaymentLoading
                              }
                              onClick={() =>
                                startDevicePayment(
                                  PAYABLE_AMOUNT
                                )
                              }
                              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                            >
                              {devicePaymentLoading
                                ? "Waiting..."
                                : "Start Device Payment"}
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    <textarea
                      value={
                        p.remarks || ""
                      }
                      onChange={(
                        e
                      ) =>
                        updatePayment(
                          p.mode,
                          "remarks",
                          e.target
                            .value
                        )
                      }
                      placeholder={`Remarks for ${p.mode}`}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="bg-gray-50 p-3 rounded-lg border space-y-2">
            <div className="flex justify-between text-sm font-semibold text-gray-600">
              <span>Payable</span>
              <span>
                ₹{PAYABLE_AMOUNT}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Entered</span>
              <span>₹{total}</span>
            </div>

            <div
              className={`flex justify-between font-bold ${
                difference === 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              <span>
                {difference === 0
                  ? "Balanced"
                  : difference > 0
                    ? "Remaining"
                    : "Excess"}
              </span>

              <span>
                ₹
                {Math.abs(
                  difference
                )}
              </span>
            </div>
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
              if (
                paymentDetails.length ===
                0
              ) {
                toast.error(
                  "Select at least one payment mode"
                );

                return;
              }

              if (
                difference !== 0
              ) {
                toast.error(
                  `Amount must match ₹${PAYABLE_AMOUNT}`
                );

                return;
              }

              onPay({
                paymentDetails,
                total,
                difference,
                payableAmount:
                  PAYABLE_AMOUNT,
              });
            }}
            className="bg-[#0576B2] text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;