import React from "react";

/* -------- TYPES -------- */
interface FoodItem {
  id: number;
  food: string;
  price: number;
  qty: number;
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
  taxName: string;
  taxAmount: number;
}

interface Tax {
  totalAmount: number;
  totalQty: number;
  grandTotal: number;
  taxList: TaxItem[];
}

interface Props {
  cart: Cart;
  tax: Tax;
  onClose: () => void;
  onPrint:()=>void;

}

/* -------- COMPONENT -------- */
const InvoicePopup: React.FC<Props> = ({
  cart,
  tax,
  onPrint,
  onClose,
}) => {
  const dateStr = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const items = cart?.food || [];
  const shouldScroll = items.length > 5;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-xl bg-white">

        {/* HEADER */}
        <div className="bg-[#0576B2] text-white px-5 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xs tracking-wide opacity-80">
              TAX INVOICE
            </div>
            <button onClick={onClose} className="text-xl">✕</button>
          </div>

          <div className="font-bold text-lg mt-1">
            {cart?.outletName || "-"}
          </div>
          <div className="text-sm opacity-80">
            {cart?.branch || "-"}
          </div>

          {/* BADGES */}
          <div className="flex gap-2 mt-3 text-xs flex-wrap">
            <Badge text={`🍽 Table ${cart?.table}-${cart?.subTable}`} />
            <Badge text={`👤 ${cart?.waiterName}`} />
            <Badge text={`🔥 ${cart?.pax} Pax`} />
          </div>
        </div>

        {/* DATE */}
        <div className="flex justify-between px-5 py-2 text-xs text-gray-500">
          <span>{dateStr}</span>
        </div>

        {/* HEADER ROW */}
        <div className="grid grid-cols-4 px-5 py-2 text-xs text-gray-400 font-semibold border-b">
          <span className="col-span-2">ITEM</span>
          <span>QTY</span>
          <span className="text-right">AMT</span>
        </div>

        {/* ITEMS */}
        <div
          className={`px-5 ${
            shouldScroll ? "max-h-[220px] overflow-y-auto" : ""
          }`}
        >
          {items.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              No items
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-4 py-3 text-sm border-b"
              >
                <span className="col-span-2 font-medium truncate">
                  {item.food}
                </span>
                <span>{item.qty}</span>
                <span className="text-right">
                  ₹{(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* SUBTOTAL */}
        <div className="px-5 py-3 text-sm">
          <div className="flex justify-between font-semibold">
            <span>
              Subtotal ({tax?.totalQty || 0} items)
            </span>
            <span>₹{(tax?.totalAmount || 0).toFixed(2)}</span>
          </div>

          {/* TAX */}
          <div className="mt-2 text-gray-500 text-xs space-y-1">
            {tax?.taxList?.map((t, i) => (
              <div key={i} className="flex justify-between">
                <span>{t.taxName}</span>
                <span>₹{t.taxAmount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TOTAL STRIP */}
        <div className="bg-[#0576B2] text-white px-5 py-3 flex justify-between items-center">
          <div>
            <div className="text-xs opacity-80">GRAND TOTAL</div>
            <div className="text-xl font-bold">
              ₹{(tax?.grandTotal || 0).toFixed(2)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs opacity-80">ITEMS</div>
            <div className="text-lg font-semibold">
              {tax?.totalQty || 0}
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 border rounded-lg py-2 text-gray-600 hover:bg-gray-100"
          >
            Close
          </button>

          <button
            onClick={onPrint}
            className="flex-1 bg-[#0576B2] text-white rounded-lg py-2 hover:bg-[#04659c]"
          >
            🖨 Print Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePopup;

/* -------- BADGE -------- */
const Badge = ({ text }: { text: string }) => (
  <div className="bg-white/20 px-3 py-1 rounded-full whitespace-nowrap">
    {text}
  </div>
);