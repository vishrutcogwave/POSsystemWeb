import { useState } from "react";
import type { CartItem } from "../utils";

type CartPanelProps = {
  items: CartItem[];
  pastItems: CartItem[];
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
  kotLoading
}: CartPanelProps) {

  const [showPast, setShowPast] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
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
                {item.note ? (
                  <span className="text-xs text-gray-500 italic truncate max-w-[140px]">
                    {item.note}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400"></span>
                )}

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
      <div className="border-t p-4 space-y-2 text-sm bg-white">

        <div className="flex justify-between">
          <span className="text-gray-500">SUBTOTAL</span>
          <span>₹ {subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">TAX (5%)</span>
          <span>₹ {tax.toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-bold text-blue-700">
          <span>TOTAL</span>
          <span>₹ {total.toFixed(2)}</span>
        </div>

        <button
          disabled={kotLoading}
          onClick={onKOT}
          className="w-full bg-green-600 text-white py-2 rounded mt-3"
        >
          {kotLoading ? "Creating KOT..." : "KOT"}
        </button>

      </div>

    </aside>
  );
}