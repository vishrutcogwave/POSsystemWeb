import React, { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onStart: (data: { pax: number; waiter: string }) => void;
};

const paxOptions = Array.from({ length: 10 }, (_, i) => i + 1);

const waiters = [
  "John Doe","Jane Smith","Mike Johnson","Sarah Wilson","David Brown",
  "Emily Davis","Robert Miller","Olivia Taylor","Daniel Anderson","Sophia Thomas",
  "James Jackson","Isabella White","William Harris","Ava Martin","Joseph Thompson",
  
];

const TableSessionModal: React.FC<Props> = ({ isOpen, onClose, onStart }) => {
  const [pax, setPax] = useState(2);
  const [waiter, setWaiter] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl bg-white shadow-xl">
        
        {/* HEADER (FIXED) */}
        <div className="flex items-center justify-between rounded-t-xl bg-blue-600 px-5 py-3 text-white">
          <h2 className="text-lg font-semibold">🍽️ Table - New Session</h2>
          <button onClick={onClose} className="text-xl font-bold">×</button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* PAX */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">
                NO. OF PEOPLE (PAX)
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
                {pax} Selected
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {paxOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => setPax(p)}
                  className={`h-10 rounded-lg border text-sm font-semibold
                    ${
                      pax === p
                        ? "bg-blue-600 text-white"
                        : "border-gray-300 text-gray-700"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* WAITER */}
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-600">
              SELECT WAITER
            </p>

            <div className="max-h-48 overflow-y-auto grid grid-cols-2 gap-3 pr-1">
              {waiters.map((w) => (
                <button
                  key={w}
                  onClick={() => setWaiter(w)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium
                    ${
                      waiter === w
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-300 text-gray-700"
                    }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER (FIXED) */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <button
            onClick={onClose}
            className="text-sm font-semibold text-gray-500"
          >
            CANCEL
          </button>

          <button
            disabled={!waiter}
            onClick={() => onStart({ pax, waiter })}
            className="rounded-lg bg-blue-500 px-8 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            START ORDER
          </button>
        </div>

      </div>
    </div>
  );
};

export default TableSessionModal;