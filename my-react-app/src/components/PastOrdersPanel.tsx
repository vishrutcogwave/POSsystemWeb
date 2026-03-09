import type { CartItem } from "../utils";

type Props = {
  items: CartItem[];
};

export default function PastOrdersPanel({ items }: Props) {
  if (!items.length) return null;

  return (
    <div className="bg-gray-100 border-b p-3 max-h-56 overflow-y-auto">
      <h3 className="text-xs font-semibold text-gray-500 mb-2">
        ALREADY ORDERED
      </h3>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border rounded-lg p-3 flex justify-between items-center"
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
    </div>
  );
}