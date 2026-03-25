import React, { useEffect, useState } from "react";
import toast from "react-hot-toast"; // ✅ IMPORT

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
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPay: (data: any) => void;
  paymentModes: PaymentMode[];
  runApi?: () => void;
};

const PaymentModal: React.FC<Props> = ({
  isOpen,
  runApi,
  onClose,
  onPay,
  paymentModes,
}) => {
  const [selectedMulti, setSelectedMulti] = useState<Record<string, string>>({});
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([]);

  const PAYABLE_AMOUNT = 100;
useEffect(() => {
  console.log("paymentDetails",paymentDetails);
  


}, [paymentDetails])

  useEffect(() => {
    if (isOpen && runApi) runApi();
  }, [isOpen]);
  useEffect(() => {
  if (isOpen && paymentModes.length > 0) {
    const firstMode = paymentModes[0].modeType;

    setSelectedMulti({
      // [firstMode]: "",
    });

    setPaymentDetails([
      // {
      //   mode: firstMode,
      //   subMode: "",
      //   amount: PAYABLE_AMOUNT,
      // },
    ]);
  }
}, [isOpen, paymentModes]);

  if (!isOpen) return null;

  // ✅ SAFE UPDATE (NO DUPLICATES)
  const updatePayment = (
    modeType: string,
    field: "amount" | "subMode",
    value: any
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
          subMode: field === "subMode" ? value : "",
          amount: field === "amount" ? Number(value) : 0,
        },
      ];
    });
  };

  // ✅ TOTAL
  const total = paymentDetails.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  // ✅ HANDLE MODE CLICK
  const handleModeClick = (modeType: string) => {
    const isSelected = selectedMulti[modeType] !== undefined;

    if (isSelected) {
      setSelectedMulti((prev) => {
        const updated = { ...prev };
        delete updated[modeType];
        return updated;
      });

      setPaymentDetails((prev) =>
        prev.filter((p) => p.mode !== modeType)
      );

      return;
    }

    setSelectedMulti((prev) => ({
      ...prev,
      [modeType]: "",
    }));

    setPaymentDetails((prev) => {
      if (prev.some((p) => p.mode === modeType)) return prev;

      const isFirst = prev.length === 0;

      return [
        ...prev,
        {
          mode: modeType,
          subMode: "",
          amount: isFirst ? PAYABLE_AMOUNT : 0,
        },
      ];
    });
  };

  // ✅ SUBMIT WITH TOAST
  const handleSubmit = () => {
    // 🔴 Empty / zero amount
    for (const p of paymentDetails) {
      if (!p.amount || Number(p.amount) <= 0) {
        toast.error(`Enter amount for ${p.mode}`);
        return;
      }
    }

    // 🔴 Total mismatch
    if (total !== PAYABLE_AMOUNT) {
      toast.error(`Total must be ₹${PAYABLE_AMOUNT}`);
        return;
    }

    // 🔴 SubMode missing
    for (const key of Object.keys(selectedMulti)) {
      const sub = selectedMulti[key];
      const modeObj = paymentModes.find((m) => m.modeType === key);

      if (modeObj?.subModes.length && !sub) {
        toast.error(`Select sub mode for ${key}`);
        return;
      }
    }

    // ✅ SUCCESS
    toast.success("Payment successful");

    onPay({
      type: "MULTI",
      payments: paymentDetails,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="w-full max-w-lg h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#0576B2] text-white px-4 py-3 flex justify-between items-center">
          <h2 className="font-semibold text-lg">💳 Payment</h2>
          <button onClick={onClose}>×</button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* MODES */}
          <div>
            <p className="font-semibold mb-2">Select Payment Mode</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {paymentModes.map((m) => {
                const isSelected =
                  selectedMulti[m.modeType] !== undefined;

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

          {/* SUB MODES */}
          {Object.keys(selectedMulti).map((modeKey) => {
            const modeObj = paymentModes.find(
              (m) => m.modeType === modeKey
            );

            if (!modeObj || modeObj.subModes.length === 0) return null;

            return (
              <div key={modeKey}>
                <p className="text-sm font-semibold text-gray-600">
                  {modeKey} Options
                </p>

                <div className="flex gap-2 flex-wrap mt-2">
                  {modeObj.subModes.map((s) => (
                    <button
                      key={s.subModeId}
                      onClick={() => {
                        setSelectedMulti((prev) => ({
                          ...prev,
                          [modeKey]: s.subModeType,
                        }));

                        updatePayment(
                          modeKey,
                          "subMode",
                          s.subModeType
                        );
                      }}
                      className={`px-3 py-1 rounded border text-sm ${
                        selectedMulti[modeKey] === s.subModeType
                          ? "bg-blue-100 border-blue-500"
                          : ""
                      }`}
                    >
                      {s.subModeType}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* INPUTS */}
          <div className="space-y-3">
            <p className="font-semibold">Enter Amount</p>

            {paymentDetails.map((p) => (
              <div
                key={p.mode}
                className="flex justify-between items-center border p-3 rounded"
              >
                <span className="font-medium">
                  {p.mode} {p.subMode && `(${p.subMode})`}
                </span>

                <input
                  type="number"
                  value={p.amount || ""}
                  onChange={(e) =>
                    updatePayment(
                      p.mode,
                      "amount",
                      Number(e.target.value)
                    )
                  }
                  className="w-24 border rounded px-2 py-1"
                />
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="text-right font-bold">
            Total: ₹{total}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t p-3 flex justify-between">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;