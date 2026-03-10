import { useState ,useEffect } from "react";
import type { CartItem } from "../utils";

type CartPanelProps = {
  items: CartItem[];
  pastItems: CartItem[];
  ncReasons: any[];

  status?: string;
  kotStatus?: string;
  selectedNcCode: number | null;
  setSelectedNcCode: (code: number | null) => void;
  instructions: { spid: number; spinfo: string }[]; 
  ncRemarks: string;
  setNcRemarks: (text: string) => void;

  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onClear: () => void;
  onUpdateNote: (id: number, note: string) => void;
  onKOT: () => void;
  kotLoading: boolean;
};

export default function CartPanel({
  items,
  pastItems,
  onIncrease,
  onDecrease,
  onClear,
  onUpdateNote,
  onKOT,
  ncReasons,
  kotLoading,
  selectedNcCode,
  setSelectedNcCode,
  ncRemarks,
  kotStatus,
  status,
  setNcRemarks,
  instructions
}: CartPanelProps) {
  useEffect(() => {
  if (kotStatus === "NCKOT") {
    setSelectedNcCode(-1); // any value to enable toggle
  }
}, [kotStatus]);

  const [showPast, setShowPast] = useState(false);
  const [openNcModal, setOpenNcModal] = useState(false);

console.log("ncReasons",ncReasons);

const getSpinfo = (spcodes?: string) => {
  if (!spcodes) return "";

  return spcodes
    .split(",")
    .map((id) =>
      instructions.find((i) => i.spid === Number(id))?.spinfo
    )
    .filter(Boolean)
    .join(" • ");
};
  return (
    <>
    <aside className="w-full lg:w-80 xl:w-80 h-full bg-white border-l flex flex-col">

      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-center bg-white">
        <h2 className="font-bold text-sm text-[#0576B2]">CURRENT ORDER</h2>
        <button onClick={onClear} className="text-red-500 text-xs font-semibold">
          CLEAR
        </button>
      </div>

      {/* CART ITEMS */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin">

        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">Cart is empty</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 space-y-2">

              <div className="flex justify-between">
                <span className="font-semibold text-sm">{item.name}</span>
                <span className="font-bold text-sm">
                  ₹ {(item.price * item.qty).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  ₹ {item.price.toFixed(2)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDecrease(item.id)}
                    className="w-6 h-6 border rounded"
                  >
                    –
                  </button>

                  <span className="text-sm">{item.qty}</span>

                  <button
                    onClick={() => onIncrease(item.id)}
                    className="w-6 h-6 bg-[#0576B2] text-white rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
<div className="flex flex-col max-w-[150px] overflow-hidden">

  {item.spcodes && (
    <span className="text-xs text-orange-600 font-medium truncate">
      {getSpinfo(item.spcodes)}
    </span>
  )}

  {item.note && (
    <span className="text-xs text-gray-500 italic truncate">
      {item.note}
    </span>
  )}

</div>
                <button
                  onClick={() => onUpdateNote(item.id, "")}
                  className="text-xs text-[#0576B2] font-semibold"
                >
                  + Add Instructions
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* PAST ITEMS DRAWER */}
      {pastItems.length > 0 && (
        <div className="border-t">

          {/* Toggle */}
          <button
            onClick={() => setShowPast(!showPast)}
            className="w-full text-center text-xs font-semibold py-3 border-y bg-gray-50"
          >
            {showPast ? "HIDE PAST ITEMS ▾" : "SHOW PAST ITEMS ▴"}
          </button>

          {showPast && (
            <div className="max-h-48 overflow-y-auto bg-gray-100 p-3 space-y-2">

              <p className="text-xs font-semibold text-gray-500">
                ALREADY ORDERED
              </p>

              {pastItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border rounded-lg p-3 flex justify-between"
                >
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Quantity: {item.qty}
                    </p>
                  </div>

                  <p className="font-semibold text-sm">
                    ₹ {(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
              ))}

            </div>
          )}
        </div>
      )}

      {/* TOTALS */}
     <div className="border-t p-4 bg-white">

 <div className="border-t p-4 bg-white space-y-3">

  {/* NC TOGGLE BUTTON */}
<div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">

  {/* LEFT SIDE */}
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-orange-700">
      NC (Non Chargeable)
    </span>

  
  </div>

  {/* TOGGLE */}
  <button
  disabled={status !== "Available" }
  onClick={() => {
    if (selectedNcCode) {
      setSelectedNcCode(null);
      setNcRemarks("");
    } else {
      setOpenNcModal(true);
    }
  }}
  className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${
    selectedNcCode ? "bg-orange-500" : "bg-gray-300"
  } ${(status !== "Available" && kotStatus !== "NCKOT")
      ? "opacity-50 cursor-not-allowed"
      : ""}`}
>
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
        selectedNcCode ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>

</div>
  {/* OTHER BUTTONS */}
  <div className="grid grid-cols-2 gap-3">

   
    <button
      disabled={kotLoading}
      onClick={onKOT}
      className="bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm"
    >
      {kotLoading ? "Creating..." : "KOT"}
    </button>
 <button
      disabled={kotLoading}
      onClick={onKOT}
      className="bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm"
    >
      Void
    </button>

    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm">
       Bill
    </button>

  </div>

</div>

</div>

    </aside>
    {openNcModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-lg w-80 p-5 space-y-4">

      <h3 className="font-semibold text-lg text-gray-700">
        Select NC Reason
      </h3>

      {/* DROPDOWN */}
   <select
  className="w-full border rounded px-3 py-2"
  value={selectedNcCode || ""}
  onChange={(e) => setSelectedNcCode(Number(e.target.value))}
>
  <option value="">Select Reason</option>

  {ncReasons.map((r) => (
    <option key={r.ncDepCode} value={r.ncDepCode}>
      {r.ncDepName}
    </option>
  ))}
</select>
<textarea
  placeholder="Enter reason / remarks..."
  value={ncRemarks}
  onChange={(e) => setNcRemarks(e.target.value)}
  className="w-full border rounded px-3 py-2 h-20 resize-none"
/>
      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-2">

        <button
          onClick={() => setOpenNcModal(false)}
          className="px-3 py-1 text-sm border rounded"
        >
          Cancel
        </button>

<button
  onClick={() => {
    console.log("NC Code:", selectedNcCode);
    console.log("NC Remarks:", ncRemarks);

    setOpenNcModal(false);
  }}
  className="px-3 py-1 text-sm bg-orange-500 text-white rounded"
>
  Confirm
</button>

      </div>

    </div>

  </div>
)}</>



  );
}