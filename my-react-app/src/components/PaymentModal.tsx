import React, { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPay: (data: {
    mode: string;
    subMode?: string;
  }) => void;
};

const onlineOptions = ["PhonePe", "Google Pay", "Paytm"];
const cardOptions = ["HDFC", "ICICI", "SBI"];

const PaymentModal: React.FC<Props> = ({ isOpen, onClose, onPay }) => {
  const [mode, setMode] = useState<string>("CASH");
  const [subMode, setSubMode] = useState<string>("");

  if (!isOpen) return null;

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
              {["CASH", "ONLINE", "CARD"].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setSubMode("");
                  }}
                  className={`rounded-lg border px-4 py-3 text-sm font-semibold
                    ${
                      mode === m
                        ? "bg-[#0576B2] text-white"
                        : "border-gray-300 text-gray-700"
                    }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* ONLINE OPTIONS */}
          {mode === "ONLINE" && (
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-600">
                SELECT APP
              </p>

              <div className="grid grid-cols-2 gap-3">
                {onlineOptions.map((o) => (
                  <button
                    key={o}
                    onClick={() => setSubMode(o)}
                    className={`rounded-lg border px-4 py-2 text-sm
                      ${
                        subMode === o
                          ? "border-[#0576B2] bg-blue-50 text-[#0576B2]"
                          : "border-gray-300"
                      }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CARD OPTIONS */}
          {mode === "CARD" && (
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-600">
                SELECT BANK
              </p>

              <div className="grid grid-cols-2 gap-3">
                {cardOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSubMode(c)}
                    className={`rounded-lg border px-4 py-2 text-sm
                      ${
                        subMode === c
                          ? "border-[#0576B2] bg-blue-50 text-[#0576B2]"
                          : "border-gray-300"
                      }`}
                  >
                    {c}
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
            disabled={!mode || (mode !== "CASH" && !subMode)}
            onClick={() => onPay({ mode, subMode })}
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