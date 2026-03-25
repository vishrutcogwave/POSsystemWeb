import React, { useEffect, useState } from "react";

type SubMode = {
  subModeId: number;
  subModeType: string;
};

type PaymentMode = {
  modeId: number;
  modeType: string;
  subModes: SubMode[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPay: (mode: string, subMode: string) => void;
  paymentModes: PaymentMode[];
  runApi?:()=>void
};

const PaymentModal: React.FC<Props> = ({
  isOpen,
  runApi,
  onClose,
  onPay,
  paymentModes,
}) => {
  const [mode, setMode] = useState<string>("");
  const [subMode, setSubMode] = useState<string>("");

  // ✅ auto select first mode
  useEffect(() => {
    if (paymentModes.length > 0 && !mode) {
      setMode(paymentModes[0].modeType);
    }
  
  }, [paymentModes]);
useEffect(() => {
  if (isOpen && runApi) {
    runApi();
  }
}, [isOpen]);
  

  if (!isOpen) return null;

  // ✅ selected mode
  const selectedMode = paymentModes.find(
    (m) => m.modeType === mode
  );

  // ✅ FIX: safe fallback
  const subModes = selectedMode?.subModes || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex w-full max-w-lg flex-col rounded-xl bg-white shadow-xl">

        {/* HEADER */}
        <div className="flex items-center justify-between rounded-t-xl bg-[#0576B2] px-5 py-3 text-white">
          <h2 className="text-lg font-semibold">💳 Payment</h2>
          <button onClick={onClose} className="text-xl font-bold">×</button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">

          {/* MAIN MODES */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-600">
              SELECT PAYMENT MODE
            </p>

            <div className="grid grid-cols-3 gap-3">
              {paymentModes.map((m) => (
                <button
                  key={m.modeId}
                  onClick={() => {
                    setMode(m.modeType);
                    setSubMode("");
                  }}
                  className={`rounded-lg border px-4 py-3 text-sm font-semibold
                    ${
                      mode === m.modeType
                        ? "bg-[#0576B2] text-white"
                        : "border-gray-300 text-gray-700"
                    }`}
                >
                  {m.modeType.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* SUB MODES */}
          {subModes.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-600">
                SELECT OPTION
              </p>

              <div className="grid grid-cols-2 gap-3">
                {subModes.map((s) => (
                  <button
                    key={s.subModeId}
                    onClick={() => setSubMode(s.subModeType)}
                    className={`rounded-lg border px-4 py-2 text-sm
                      ${
                        subMode === s.subModeType
                          ? "border-[#0576B2] bg-blue-50 text-[#0576B2]"
                          : "border-gray-300"
                      }`}
                  >
                    {s.subModeType}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between border-t px-6 py-4">
          <button
            onClick={onClose}
            className="text-sm font-semibold text-gray-500"
          >
            CANCEL
          </button>

          <button
            disabled={!mode || (subModes.length > 0 && !subMode)}
            onClick={() => onPay(mode, subMode)}
            className="rounded-lg bg-green-600 px-6 py-2 text-white font-semibold disabled:opacity-50"
          >
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;