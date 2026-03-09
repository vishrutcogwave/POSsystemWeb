import React from "react";

type Props = {
  isOpen: boolean;
  bills: string[];
  onSelectBill: (sub: string) => void;
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
          <button onClick={onClose} className="text-xl">
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {bills.map((sub) => (
            <button
              key={sub}
              onClick={() => onSelectBill(sub)}
              className="rounded-lg border p-4 text-left hover:bg-blue-50"
            >
              <p className="font-semibold">{sub}</p>
            </button>
          ))}

          <button
            onClick={onNewBill}
            className="rounded-lg border-2 border-dashed border-[#0576B2] bg-white p-4 text-[#0576B2] font-semibold"
          >
            ➕ New Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default KotModal;
