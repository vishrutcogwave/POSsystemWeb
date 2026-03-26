import React from "react";

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
  taxName: string;
  taxAmount: number;
  taxableAmount?: number;
  cgst?: number;
  sgst?: number;
}

interface Tax {
  totalAmount: number;
  totalQty: number;
  grandTotal: number;
  taxList: TaxItem[];
  taxType?: string;
}

interface Props {
  cart: Cart;
  tax: Tax;
  onClose: () => void;
  onPrint: () => void;
}
/* -------- MERGE SAME ITEMS -------- */
const mergeItems = (items: any[] = []) => {
  const map = new Map<string, any>();

  items.forEach((item) => {
    const key = `${item.id}_${item.food}`;

    if (map.has(key)) {
      map.get(key).qty += item.qty;
    } else {
      map.set(key, { ...item });
    }
  });

  return Array.from(map.values());
};
/* -------- SAFE TAX NORMALIZER -------- */
const normalizeTaxList = (taxList: any[] = []) => {
  return taxList.map((t) => {
    const taxable = Number(t.taxableAmount || 0);
    const taxPer = Number(t.taxper || 0);

    const taxAmount =
      t.taxAmount !== undefined
        ? Number(t.taxAmount)
        : (taxable * taxPer) / 100;

    const cgst = t.cgst !== undefined ? Number(t.cgst) : taxAmount / 2;

    const sgst = t.sgst !== undefined ? Number(t.sgst) : taxAmount / 2;

    return {
      ...t,
      taxableAmount: taxable,
      taxAmount,
      cgst,
      sgst,
    };
  });
};
/* -------- COMPONENT -------- */
const InvoicePopup: React.FC<Props> = ({ cart, tax, onPrint, onClose }) => {
  const dateStr = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const rawItems = cart?.food || [];
  const items = mergeItems(rawItems);
  console.log("rawItems", rawItems);

  const isGrouped = tax?.taxType === "groupedtax";

  /* ✅ SAFE TAX LIST */
  const safeTaxList = normalizeTaxList(tax?.taxList);

  /* -------- GROUP LOGIC -------- */
  const groupMap: Record<number, FoodItem[]> = {};

  if (isGrouped) {
    items.forEach((item) => {
      const grp = item.grpCode || 0;
      if (!groupMap[grp]) groupMap[grp] = [];
      groupMap[grp].push(item);
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="w-full max-w-sm h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-xl bg-white">
        {/* HEADER */}
        <div className="bg-[#0576B2] text-white px-5 py-4 shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-xs opacity-80">TAX INVOICE</div>
            <button onClick={onClose} className="text-xl">
              ✕
            </button>
          </div>

          <div className="font-bold text-lg mt-1">
            {cart?.outletName || "-"}
          </div>
          <div className="text-sm opacity-80">{cart?.branch || "-"}</div>

          <div className="flex gap-2 mt-3 text-xs flex-wrap">
            <Badge text={`🍽 ${cart?.table}-${cart?.subTable}`} />
            <Badge text={`👤 ${cart?.waiterName}`} />
            <Badge text={`🔥 ${cart?.pax} Pax`} />
          </div>
        </div>

        {/* DATE */}
        <div className="px-5 py-2 text-xs text-gray-500 shrink-0">
          {dateStr}
        </div>

        {/* COLUMN HEADER */}
        <div className="grid grid-cols-4 px-5 py-2 text-xs text-gray-400 font-semibold border-b shrink-0">
          <span className="col-span-2">ITEM</span>
          <span>QTY</span>
          <span className="text-right">AMT</span>
        </div>

        {/* ✅ SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto px-5 scroll-smooth overscroll-contain">
          {items.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              No items
            </div>
          ) : isGrouped ? (
            Object.entries(groupMap).map(([grp, groupItems]) => {
              const grpNum = Number(grp);
              const groupTaxes = safeTaxList.filter(
                (t) => t.groupCode === grpNum,
              );
              return (
                <div key={grp}>
                  {/* GROUP TITLE */}
                  <div className="font-semibold text-blue-600 mt-3 border-t pt-2">
                    *** {groupTaxes[0]?.groupName || "OTHERS"} ***
                  </div>

                  {/* ITEMS */}
                  {groupItems.map((item) => (
                    <div
                      key={item.id + "-" + grp}
                      className="grid grid-cols-4 py-2 text-sm border-b"
                    >
                      <span className="col-span-2 truncate">{item.food}</span>
                      <span>{item.qty}</span>
                      <span className="text-right">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  {/* GROUP TAX */}
                  {groupTaxes.length > 0 && (
                    <div className="text-xs text-gray-500 py-1 space-y-2">
                      {groupTaxes.map((tax, idx) => {
                        const halfPer = (tax.taxper || 0) / 2;

                        return (
                          <div key={idx} className="border-t pt-1">
                            <div className="flex justify-between text-[10px] text-gray-400">
                              <span>Taxable</span>
                              <span>
                                ₹{(tax.taxableAmount || 0).toFixed(2)}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span>CGST ({halfPer}%)</span>
                              <span>₹{(tax.cgst || 0).toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between">
                              <span>SGST ({halfPer}%)</span>
                              <span>₹{(tax.sgst || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-4 py-3 text-sm border-b"
              >
                <span className="col-span-2 truncate">{item.food}</span>
                <span>{item.qty}</span>
                <span className="text-right">
                  ₹{(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* SUBTOTAL */}
        <div className="px-5 py-3 text-sm border-t bg-white shrink-0">
          <div className="flex justify-between font-semibold">
            <span>Subtotal ({tax?.totalQty || 0} items)</span>
            <span>₹{(tax?.totalAmount || 0).toFixed(2)}</span>
          </div>

          {!isGrouped && (
            <div className="mt-2 text-gray-500 text-xs space-y-1">
              {safeTaxList?.map((t, i) => {
                const halfPer = (t.taxper || 0) / 2;

                return (
                  <div key={i} className="border-t pt-1 mt-1 space-y-1">
                    {/* ✅ GST HEADER */}
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Taxable</span>
                      <span>₹{(t.taxableAmount || 0).toFixed(2)}</span>
                    </div>

                    {/* ✅ CGST */}
                    <div className="flex justify-between">
                      <span>CGST ({halfPer}%)</span>
                      <span>₹{(t.cgst || 0).toFixed(2)}</span>
                    </div>

                    {/* ✅ SGST */}
                    <div className="flex justify-between">
                      <span>SGST ({halfPer}%)</span>
                      <span>₹{(t.sgst || 0).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* GRAND TOTAL */}
        <div className="bg-[#0576B2] text-white px-5 py-3 flex justify-between items-center shrink-0">
          <div>
            <div className="text-xs opacity-80">GRAND TOTAL</div>
            <div className="text-xl font-bold">
              ₹{(tax?.grandTotal || 0).toFixed(2)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs opacity-80">ITEMS</div>
            <div className="text-lg font-semibold">{tax?.totalQty || 0}</div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 p-4 bg-gray-50 shrink-0">
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
