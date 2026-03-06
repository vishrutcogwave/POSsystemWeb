import React from "react";
import type { CartItem } from "../utils";

type Bill = {
  id: number;
  pax: number;
  waiter: string;
  items: CartItem[];
};

type Props = {
  isOpen: boolean;
  bills: Bill[];
  onSelectBill: (id: number) => void;
  onNewBill: () => void;
  onClose: () => void;
};

const KotModal: React.FC<Props> = ({
  isOpen,
  bills,
  onSelectBill,
  onNewBill,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Table Bills</h2>
          <button onClick={onClose} className="text-xl">×</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {bills.map((bill, index) => (
            <button
              key={bill.id}
              onClick={() => onSelectBill(bill.id)}
              className="rounded-lg border p-4 text-left hover:bg-blue-50"
            >
              <p className="font-semibold">Bill {index + 1}</p>
              <p className="text-xs text-gray-500">
                {bill.pax} Pax · {bill.waiter}
              </p>
            </button>
          ))}

          {/* NEW BILL */}
          <button
            onClick={onNewBill}
            className="rounded-lg border-2 border-dashed bg-[#0576B2] p-4 text-[#0576B2] font-semibold"
          >
            ➕ New Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default KotModal;