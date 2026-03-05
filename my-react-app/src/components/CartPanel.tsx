import type { CartItem } from "../utils";

type CartPanelProps = {
  items: CartItem[];
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onClear: () => void;
  onUpdateNote: (id: number, note: string) => void; // NEW
};

export default function CartPanel({
  items,
  onIncrease,
  onDecrease,
  onClear,
  onUpdateNote,
}: CartPanelProps) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <aside className="w-full lg:w-80 xl:w-80 h-full bg-white border-l flex flex-col">
      {/* HEADER – ALWAYS VISIBLE */}
      <div className="p-4 border-b flex justify-between items-center bg-white">
        <h2 className="font-bold text-sm text-blue-700">CURRENT ORDER</h2>
        <button
          onClick={onClear}
          className="text-red-500 text-xs font-semibold"
        >
          CLEAR
        </button>
      </div>

      {/* CART ITEMS – ONLY THIS SCROLLS */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">Cart is empty</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 space-y-2">
              {/* Name + Total Price */}
              <div className="flex justify-between">
                <span className="font-semibold text-sm">{item.name}</span>
                <span className="font-bold text-sm">
                  ₹ {(item.price * item.qty).toFixed(2)}
                </span>
              </div>

              {/* Quantity Controls */}
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
                    className="w-6 h-6 bg-blue-600 text-white rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Special Instructions Input */}
              {/* Special Instructions */}
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
                  className="text-xs text-blue-600 font-semibold"
                >
                  + Add Instuctions
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TOTALS – ALWAYS VISIBLE */}
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

        <div className="flex gap-2 mt-3">
          <button className="flex-1 bg-orange-500 text-white py-2 rounded">
            KOT
          </button>
          <button className="flex-1 bg-green-600 text-white py-2 rounded">
            BILL
          </button>
        </div>
      </div>
    </aside>
  );
}
