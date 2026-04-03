import React from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

/* -------- TYPES -------- */
interface FoodItem {
  id: number;
  food: string;
  price: number;
  qty: number;
  grpCode?: number;
}

interface Cart {
  outletName: string;
  branch: string;
  table: string;
  subTable: string;
  waiterName: string;
  pax: number;
  food: FoodItem[];
}

interface TaxItem {
  groupCode?: number;
  groupName?: string;
  taxAmount: number;
  taxableAmount?: number;
  cgst?: number;
  sgst?: number;
  taxper?: number;
}

interface Tax {
  totalAmount: number;
  totalQty: number;
  grandTotal: number;
  taxList: TaxItem[];
  taxType?: string;
}

/* ✅ NEW TYPES FROM API */
interface DiscountOption {
  discId: number;
  discountType: string;
}

interface GroupOption {
  grpCode: number;
  grpName: string;
}

interface Props {
  cart: Cart;
  tax: Tax;
  discountOptions: DiscountOption[];
  groupOptions: GroupOption[];
  onClose: () => void;
  onPrint: () => void;

  showDiscount: boolean;
  setShowDiscount: React.Dispatch<React.SetStateAction<boolean>>;

  discountType: string;
  setDiscountType: React.Dispatch<React.SetStateAction<string>>;

  selectedGroups: string[];
  setSelectedGroups: React.Dispatch<React.SetStateAction<string[]>>;

  discountValue: string;
  setDiscountValue: React.Dispatch<React.SetStateAction<string>>;
  reGetBill: () => void;
  discountMode: "amt" | "per";
  setDiscountMode: React.Dispatch<React.SetStateAction<"amt" | "per">>;
}

/* -------- COMPONENT -------- */
const InvoicePopup: React.FC<Props> = ({
  cart,
  tax,
  discountOptions,
  groupOptions,
  onClose,
  onPrint,
  discountType,
  discountValue,
  selectedGroups,
  setDiscountType,
  setDiscountValue,
  setSelectedGroups,
  setShowDiscount,
  showDiscount,
  reGetBill,
  discountMode,
  setDiscountMode,
}) => {
  const { appData } = useAppContext();
  console.log("appData", appData?.userRights[0]);
  const userRights = appData?.userRights?.[0];

  const maxAmount = Number(userRights?.disAmount || 0);
  const maxPercent = Number(userRights?.disPercent || 0);

  const items = cart?.food || [];
  const isGrouped = tax?.taxType === "groupedtax";

  /* -------- TAX NORMALIZE -------- */
  const safeTaxList = (tax?.taxList || []).map((t) => {
    const taxAmount = Number(t.taxAmount || 0);
    return {
      ...t,
      cgst: t.cgst ?? taxAmount / 2,
      sgst: t.sgst ?? taxAmount / 2,
    };
  });

  /* -------- GROUP MAP -------- */
  const groupMap: Record<number, FoodItem[]> = {};
  if (isGrouped) {
    items.forEach((item) => {
      const grp = item.grpCode || 0;
      if (!groupMap[grp]) groupMap[grp] = [];
      groupMap[grp].push(item);
    });
  }

  /* -------- DISCOUNT LOGIC -------- */
  const discountNum = Number(discountValue || 0);

  /* ✅ USE API GROUP OPTIONS */
  const selectedGroupCodes = groupOptions
    .filter((g) => selectedGroups.includes(g.grpName))
    .map((g) => g.grpCode);

  const discountableTotal =
    discountType === "Groupwise"
      ? items
          .filter(
            (i) =>
              i.grpCode !== undefined && selectedGroupCodes.includes(i.grpCode),
          )
          .reduce((sum, i) => sum + i.price * i.qty, 0)
      : tax.totalAmount;

  let calculatedDiscount = 0;
console.log(calculatedDiscount);

  if (discountMode === "per") {
    calculatedDiscount = (discountableTotal * discountNum) / 100;
  } else {
    calculatedDiscount = discountNum;
  }

  const finalTotal = tax.grandTotal || 0;

  const dateStr = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-end sm:items-center z-50">
      <div className="w-full sm:max-w-sm h-[95vh] sm:h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl bg-white">
        {/* HEADER */}
        <div className="bg-[#0576B2] text-white px-5 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xs opacity-80">TAX INVOICE</div>
            <button onClick={onClose}>✕</button>
          </div>

          <div className="font-bold text-lg mt-1">{cart?.outletName}</div>
          <div className="text-sm opacity-80">{cart?.branch}</div>

          <div className="flex gap-2 mt-3 text-xs flex-wrap">
            <Badge text={`🍽 ${cart.table}`} />
            <Badge text={`👤 ${cart.waiterName}`} />
            <Badge text={`🔥 ${cart.pax}`} />
          </div>
        </div>

        {/* DATE */}
        <div className="px-5 py-2 text-xs text-gray-500">{dateStr}</div>

        {/* COLUMN HEADER */}
        <div className="grid grid-cols-4 px-5 py-2 text-xs text-gray-400 font-semibold border-b">
          <span className="col-span-2">ITEM</span>
          <span>QTY</span>
          <span className="text-right">AMT</span>
        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto px-5">
          {isGrouped
            ? Object.entries(groupMap).map(([grp, groupItems]) => {
                const grpNum = Number(grp);

                const groupTaxes = safeTaxList.filter(
                  (t) => t.groupCode === grpNum,
                );

                return (
                  <div key={grp}>
                    <div className="font-semibold text-blue-600 mt-3 border-t pt-2">
                      *** {groupTaxes[0]?.groupName || "OTHERS"} ***
                    </div>

                    {groupItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-4 py-2 text-sm border-b"
                      >
                        <span className="col-span-2 truncate">{item.food}</span>
                        <span>{item.qty}</span>
                        <span className="text-right">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </span>
                      </div>
                    ))}

                    {groupTaxes.map((t, i) => {
                      const half = (t.taxper || 0) / 2;

                      return (
                        <div key={i} className="text-xs text-gray-500 py-1">
                          <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Taxable</span>
                            <span>₹{t.taxableAmount?.toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between">
                            <span>CGST ({half}%)</span>
                            <span>₹{t.cgst?.toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between">
                            <span>SGST ({half}%)</span>
                            <span>₹{t.sgst?.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            : items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-4 py-2 text-sm border-b"
                >
                  <span className="col-span-2">{item.food}</span>
                  <span>{item.qty}</span>
                  <span className="text-right">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
        </div>

        {/* SUBTOTAL */}
        <div className="px-5 py-3 border-t text-sm">
          <div className="flex justify-between font-semibold">
            <span>Subtotal</span>
            <span>₹{tax.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* DISCOUNT HEADER */}
        <div
          onClick={() => setShowDiscount(!showDiscount)}
          className="flex justify-between items-center px-5 py-3 cursor-pointer"
        >
          <div>
            <div className="text-sm font-semibold">💸 Discount</div>
          </div>

          <div
            className={`text-lg transition-transform duration-300 ${
              showDiscount ? "rotate-180" : ""
            }`}
          >
            ▼
          </div>
        </div>

        {/* DISCOUNT BODY */}
        <div
          className={`px-5 overflow-hidden transition-all duration-300 ${
            showDiscount ? "max-h-[300px] pb-3" : "max-h-0"
          }`}
        >
          <div className="space-y-2">
            {/* ✅ DISCOUNT TYPE FROM API */}
            <select
              value={discountType}
              onChange={(e) => {
                setDiscountType(e.target.value);
                setSelectedGroups([]);
                setDiscountValue("");
              }}
              className="w-full border p-2 rounded"
            >
              <option value="">Select</option>
              {discountOptions.map((d) => (
                <option key={d.discId} value={d.discountType}>
                  {d.discountType}
                </option>
              ))}
            </select>

            {/* ✅ GROUP FROM API */}
            {discountType === "Groupwise" && (
              <div className="grid grid-cols-2 gap-2">
                {groupOptions.map((g) => {
                  const checked = selectedGroups.includes(g.grpName);

                  return (
                    <label key={g.grpCode} className="flex gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          checked
                            ? setSelectedGroups(
                                selectedGroups.filter((x) => x !== g.grpName),
                              )
                            : setSelectedGroups([...selectedGroups, g.grpName])
                        }
                      />
                      {g.grpName}
                    </label>
                  );
                })}
              </div>
            )}

         {discountType && (
  <div className="flex gap-2">
    <select
      value={discountMode}
      onChange={(e) => {
        setDiscountMode(e.target.value as "amt" | "per");
        setDiscountValue(""); // reset when mode changes
      }}
      className="w-20 border p-2 rounded"
    >
      <option value="amt">₹</option>
      <option value="per">%</option>
    </select>

    <input
      type="number"
      value={discountValue}
      onChange={(e) => {
        const value = e.target.value;

        if (value === "") {
          setDiscountValue("");
          return;
        }

        const num = Number(value);
        if (isNaN(num)) return;

        if (discountMode === "amt" && num > maxAmount) {
          toast.error(`Max discount amount allowed is ₹${maxAmount}`);
          return;
        }

        if (discountMode === "per" && num > maxPercent) {
          toast.error(`Max discount percent allowed is ${maxPercent}%`);
          return;
        }

        setDiscountValue(value);
      }}
      placeholder={
        discountMode === "per" ? "Enter %" : "Enter amount"
      }
      className="flex-1 border p-2 rounded"
    />

    <button
      onClick={() => {
        const num = Number(discountValue);

        if (!discountValue || num <= 0) return;

        if (discountMode === "amt" && num > maxAmount) {
          toast.error(`Max discount amount allowed is ₹${maxAmount}`);
          return;
        }

        if (discountMode === "per" && num > maxPercent) {
          toast.error(`Max discount percent allowed is ${maxPercent}%`);
          return;
        }

        reGetBill();
      }}
      className="bg-green-600 text-white px-3 rounded"
    >
      Apply
    </button>
  </div>
)}
          </div>
        </div>

        {/* TOTAL */}
        <div className="bg-[#0576B2] text-white px-5 py-3 flex justify-between">
          <span>GRAND TOTAL</span>
          <span>₹{finalTotal.toFixed(2)}</span>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 p-4 bg-gray-50">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2">
            Close
          </button>

          <button
            onClick={onPrint}
            className="flex-1 bg-[#0576B2] text-white rounded-lg py-2"
          >
            🖨 Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePopup;

const Badge = ({ text }: { text: string }) => (
  <div className="bg-white/20 px-3 py-1 rounded-full">{text}</div>
);
