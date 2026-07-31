import { useEffect } from "react";
import type { CartItem } from "../utils";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

type CartPanelProps = {
  items: CartItem[];
  pastItems: CartItem[];
  ncReasons: any[];
  isFastfood: any;
  status?: string;
  kotStatus?: string;
  selectedNcCode: number | null;
  setSelectedNcCode: (code: number | null) => void;
  instructions: { spid: number; spinfo: string }[];
  ncRemarks: string;
  setNcRemarks: (text: string) => void;
onUpdateQty: (id: number, qty: number) => void;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onClear: () => void;
  onUpdateNote: (id: number, note: string) => void;
  onKOT: () => void;
  kotLoading: boolean;
  selectedVoidItems: CartItem[];
  setSelectedVoidItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onVoid: () => void;
  handleGetBill: () => void;
  onConvertion: () => void;
  showPast: boolean;
  setShowPast: React.Dispatch<React.SetStateAction<boolean>>;
  openNcModal: boolean;
  setOpenNcModal: React.Dispatch<React.SetStateAction<boolean>>;
     directbill:boolean;
     totalAmount:number
};

export default function CartPanel({
  openNcModal,
  totalAmount,
  setOpenNcModal,
  setShowPast,
  directbill,
  showPast,
  onConvertion,
  selectedVoidItems,
  setSelectedVoidItems,
  onVoid,
  items,
  onUpdateQty,
  handleGetBill,
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
  instructions,
  isFastfood,
}: CartPanelProps) {
  console.log("isFastfood", isFastfood);
  const { userRights } = useAppContext();
  console.log("userRightslllllllllllll", userRights);
  useEffect(() => {
    if (kotStatus === "NCKOT") {
      // Pick EXCISE or first NC reason as default
      const defaultNc =
        ncReasons.find((r) => r.ncDepName === "EXCISE") || ncReasons[0];
      if (defaultNc) {
        setSelectedNcCode(defaultNc.ncDepCode);
      }
    }
  }, [kotStatus, ncReasons, setSelectedNcCode]);

  console.log("ncReasons", ncReasons);

  const getSpinfo = (spcodes?: string) => {
    if (!spcodes) return "";

    return spcodes
      .split(",")
      .map((id) => instructions.find((i) => i.spid === Number(id))?.spinfo)
      .filter(Boolean)
      .join(" • ");
  };

  const hasSubMenuAccess = (subMenuName: string) => {
    return userRights?.some((menu: any) =>
      menu.subMenus?.some(
        (sub: any) =>
          sub.subMenuName?.toLowerCase() === subMenuName.toLowerCase() &&
          sub.isPermission === true,
      ),
    );
  };

  const hasNcKotPermission =
    hasSubMenuAccess("NC KOT") &&
    userRights?.some(
      (menu: any) =>
        menu.menuName === "KOT" &&
        menu.subMenus?.some((sub: any) => sub.subMenuName === "NC KOT"),
    );
  const hasKotPermission =
    hasSubMenuAccess("KOT") &&
    userRights?.some(
      (menu: any) =>
        menu.menuName === "KOT" &&
        menu.subMenus?.some((sub: any) => sub.subMenuName === "KOT"),
    );

  const hasBillPermission =
    hasSubMenuAccess("BILL") &&
    userRights?.some(
      (menu: any) =>
        menu.menuName === "KOT" &&
        menu.subMenus?.some((sub: any) => sub.subMenuName === "BILL"),
    );
  const hasVoidPermission =
    hasSubMenuAccess("KOT VOID") &&
    userRights?.some(
      (menu: any) =>
        menu.menuName === "KOT" &&
        menu.subMenus?.some((sub: any) => sub.subMenuName === "KOT VOID"),
    );

  const hasNtKPermission =
    hasSubMenuAccess("NC -> KOT || KOT - >NC") &&
    userRights?.some(
      (menu: any) =>
        menu.menuName === "KOT" &&
        menu.subMenus?.some(
          (sub: any) => sub.subMenuName === "NC -> KOT || KOT - >NC",
        ),
    );

  return (
    <>
      <aside className="w-full lg:w-80 xl:w-80 h-full bg-white border-l flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center bg-white">
          <h2 className="font-bold text-sm text-[#0576B2]">CURRENT ORDER</h2>
          <button
            onClick={onClear}
            className="text-red-500 text-xs font-semibold"
          >
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

<input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  value={item.qty}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value === "") return;

    onUpdateQty(item.id, Number(value));
  }}
  className="w-14 h-8 border rounded text-center text-sm outline-none"
/>

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
                {pastItems.map((item, index) => {
                  const selectedItem = selectedVoidItems.find(
                    (i) => i.id === item.id,
                  );
                  const voidQty = selectedItem?.qty || 0;

                  return (
                    <div
                      key={index}
                      className="bg-white border rounded-lg p-3 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        {/* CHECKBOX */}
                        <input
                          type="checkbox"
                          checked={!!selectedItem}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVoidItems((prev) => [
                                ...prev,
                                {
                                  ...item,
                                  origQty: item.qty, // store original ordered qty
                                  qty: item.qty, // remaining qty
                                },
                              ]);
                            } else {
                              setSelectedVoidItems((prev) =>
                                prev.filter((i) => i.id !== item.id),
                              );
                            }
                          }}
                          className="w-4 h-4 cursor-pointer accent-red-500"
                        />

                        <div>
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            Ordered: {item.qty}
                          </p>
                        </div>
                      </div>

                      {/* VOID CONTROL */}
                      {selectedItem ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedVoidItems((prev) =>
                                prev
                                  .map((i) =>
                                    i.id === item.id
                                      ? { ...i, qty: Math.max(i.qty - 1, 0) }
                                      : i,
                                  )
                                  .filter((i) => i.qty > 0),
                              );
                            }}
                            className="w-6 h-6 border rounded"
                          >
                            -
                          </button>

                          <span className="text-sm">{voidQty}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TOTALS */}
        <div className="border-t p-4 bg-white">
          <div className="border-t p-4 bg-white space-y-3">
            {/* TOTAL AMOUNT */}
<div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
  <span className="text-base font-semibold text-gray-700">
    Total Amount
  </span>
  <span className="text-xl font-bold text-[#0576B2]">
  {totalAmount || 0}
  </span>
</div>
            {/* NC TOGGLE BUTTON */}
            {hasNcKotPermission && isFastfood === undefined && (
              <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                {/* LEFT SIDE */}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-orange-700">
                    NC (Non Chargeable)
                  </span>
                </div>

                {/* TOGGLE */}
                <button
                  disabled={status !== "Available"}
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
                  } ${
                    status !== "Available" && kotStatus !== "NCKOT"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                      selectedNcCode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}
            {/* OTHER BUTTONS */}
            <div className="grid grid-cols-2 gap-3">
              {hasKotPermission &&  isFastfood === undefined &&(
                <button
                  disabled={kotLoading}
                  onClick={onKOT}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm"
                >
                  {directbill ? "BILL" : "KOT"}
                </button>
              )}
              {hasVoidPermission &&!directbill && isFastfood === undefined && (
                <button
                  disabled={selectedVoidItems.length < 0}
                  onClick={onVoid}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm"
                >
                  Void
                </button>
              )}
              {hasBillPermission && !directbill&& (
                <button
                  onClick={isFastfood ===undefined ?handleGetBill:onKOT}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm"
                >
                  Bill
                </button>
              )}
              {hasNtKPermission && status === "Occupied" && (
                <button
                  onClick={onConvertion}
                  className="bg-orange-600 hover:bg-orange-700 text-white py-2 rounded text-sm"
                >
                  {kotStatus === "NCKOT" ? "NC → KOT" : "KOT → NC"}
                </button>
              )}
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
                onClick={() => {
                  setOpenNcModal(false);
                  setSelectedNcCode(null);
                  setNcRemarks("");
                }}
                className="px-3 py-1 text-sm border rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  // VALIDATION
                  if (!selectedNcCode) {
                    toast.error("Please select NC Reason");
                    return;
                  }

                  if (!ncRemarks || ncRemarks.trim() === "") {
                    toast.error("Please enter remarks");
                    return;
                  }

                  // SUCCESS → proceed
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
      )}
    </>
  );
}
