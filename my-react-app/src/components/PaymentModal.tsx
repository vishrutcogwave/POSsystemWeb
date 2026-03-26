import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
};

const PaymentModal: React.FC<Props> = ({
  isOpen,
  runApi,
  onClose,
  onPay,
  paymentModes,
  unbillData,
}) => {
  const handleClose = () => {
  setSelectedMulti({});
  setPaymentDetails([]);
  onClose(); // existing close
};
  const [selectedMulti, setSelectedMulti] = useState<Record<string, string>>(
    {},
  );
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([]);

  const PAYABLE_AMOUNT = Number(unbillData?.[0]?.total || 0);

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

      return [
        ...prev,
        {
          mode: modeType,
          subMode: "",
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

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = () => {
    if (difference !== 0) {
      toast.error(`Amount must match ₹${PAYABLE_AMOUNT}`);
      return;
    }

    const finalPayload = {
      ...unbillData?.[0],
      paymentDetails: paymentDetails.map((p) => ({
        ...p,
        remarks: (p.remarks || "").trim() || null,
      })),
    };

    console.log("FINAL DATA:", finalPayload);
    toast.success("Payment successful");
    onPay(finalPayload);
  };

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
              {paymentModes.map((m) => {
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-medium">{p.mode}</span>
                  <input
                    type="text" // ✅ removes arrows
                    inputMode="numeric" // ✅ mobile keypad
                    value={p.amount || ""}
                    onChange={(e) => {
                      const value = e.target.value;

                      // ✅ allow only digits
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
                    className="w-full sm:w-24 border rounded px-2 py-1 text-right" // 👈 SAME STYLE (unchanged)
                  />
                </div>

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
            onClick={handleSubmit}
            disabled={difference !== 0}
            className={`w-full sm:w-auto px-4 py-2 rounded text-white ${
              difference === 0
                ? "bg-green-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
