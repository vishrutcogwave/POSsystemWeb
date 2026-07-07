import React, { useState, useEffect } from "react";
import { getStewardList } from "../api/services/products.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
onStart: (data: { pax: number; waiterCode: string; waiterName: string }) => void;
  branchcode: string;
    initialPax?: number;
  initialWaiter?: string;
  dontopenkotmodel:boolean
};

type Steward = {
  stwCode: number;
  posCode: string;
  stwName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  mobNo: string;
};

const paxOptions = Array.from({ length: 10 }, (_, i) => i + 1);

const TableSessionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onStart,
  initialPax,
  initialWaiter,
  dontopenkotmodel
 
}) => {
  console.log("initialWaiter",initialWaiter);
  
  const [pax, setPax] = useState(initialPax || 2);
const [waiter, setWaiter] = useState(initialWaiter || "");

useEffect(() => {
  if (!isOpen) return;

  if (initialPax) setPax(initialPax);
  if (initialWaiter) setWaiter(initialWaiter);

}, [initialPax, initialWaiter, isOpen]);
  const [stewards, setStewards] = useState<Steward[]>([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  if (!isOpen) return;

  const fetchStewards = async () => {
    try {
      setLoading(true);

      const data = await getStewardList(
        localStorage.getItem("branch") || ""
      );

      setStewards(data);

      // ✅ Auto start only when popup is disabled
      if (dontopenkotmodel && data.length > 0) {
        const firstWaiter = data[0];

        setPax(1);
        setWaiter(String(firstWaiter.stwCode));

        onStart({
          pax: 1,
          waiterCode: String(firstWaiter.stwCode),
          waiterName: firstWaiter.stwName,
        });
      }
    } catch (error) {
      console.error("Error fetching steward list:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchStewards();
}, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl bg-white shadow-xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between rounded-t-xl bg-[#0576B2] px-5 py-3 text-white">
          <h2 className="text-lg font-semibold">🍽️ Table - New Session</h2>
          <button onClick={onClose} className="text-xl font-bold">×</button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* PAX */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">
                NO. OF PEOPLE (PAX)
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-[#0576B2]">
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
                        ? "bg-[#0576B2] text-white"
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

            {loading ? (
              <p className="text-sm text-gray-500">Loading waiters...</p>
            ) : (
              <div className="max-h-48 overflow-y-auto grid grid-cols-2 gap-3 pr-1">
                {stewards.map((steward) => (
                  <button
                    key={steward.stwCode}
                 onClick={() => setWaiter(String(steward.stwCode))}
                    className={`rounded-lg border px-4 py-3 text-sm font-medium
                      ${
                    waiter === String(steward.stwCode)
                          ? "border-[#0576B2] bg-blue-50 text-[#0576B2]"
                          : "border-gray-300 text-gray-700"
                      }`}
                  >
                    {steward.stwName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <button
            onClick={onClose}
            className="text-sm font-semibold text-gray-500"
          >
            CANCEL
          </button>

          <button
            disabled={!waiter}
           onClick={() =>
  onStart({
    pax,
    waiterCode: waiter,
    waiterName:
      stewards.find((s) => String(s.stwCode) === waiter)?.stwName || "",
  })
}
            className="rounded-lg bg-[#0576B2] px-8 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            START ORDER
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableSessionModal;