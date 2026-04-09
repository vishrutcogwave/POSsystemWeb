import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;

  formData: {
    outlet: string;
    billDate: string;
    billNo: string;
    discount: number;
    guestName: string;
    address: string;
    gstNo: string;
    stateCode: string;
    guestGST: boolean;
  };

  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onPrint: () => void;
  outlets: { id: string; label: string }[];
  
};

const BillReprint: React.FC<Props> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onPrint,
  outlets,
}) => {
  if (!isOpen) return null;

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      
      <div className="w-full max-w-5xl h-[90vh] bg-white sm:rounded-xl shadow-xl flex flex-col">

        {/* HEADER */}
        <div className="bg-[#0576B2] text-white px-4 py-3 flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            BILL REPRINT : {formData.billNo}
          </h2>
          <button onClick={onClose}>×</button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4">

          <div className="border p-4 grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* LEFT (READ ONLY) */}
            <div className="border p-4">

              <div className="grid grid-cols-[140px_1fr] gap-y-4">

                {/* OUTLET */}
         <label>Outlet</label>
<input
  value={
    outlets.find((o) => o.id === String(formData.outlet))?.label || ""
  }
  disabled
  className="border px-2 py-1 w-full bg-gray-100"
/>

                {/* BILL DATE */}
                <label>Bill Date</label>
                <input
                  type="date"
                  value={formData.billDate}
                  disabled
                  className="border px-2 py-1 w-full bg-gray-100"
                />

                {/* BILL NO */}
                <label>Bill No.</label>
                <input
                  value={formData.billNo}
                  disabled
                  className="border px-2 py-1 w-full bg-gray-100"
                />

                {/* DISCOUNT */}
                <label>Discount (Rs.)</label>
                <input
                  value={formData.discount}
                  disabled
                  className="border px-2 py-1 w-full bg-gray-100"
                />

              </div>

            </div>

            {/* RIGHT (EDITABLE) */}
            <div className="border p-4">

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={formData.guestGST}
                  onChange={(e) => handleChange("guestGST", e.target.checked)}
                />
                <label>Guest GST</label>
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-y-4">

                <label>Guest Name</label>
                <input
                  disabled={!formData.guestGST}
                  value={formData.guestName}
                  onChange={(e) => handleChange("guestName", e.target.value)}
                  className="border px-2 py-1 w-full disabled:bg-gray-100"
                />

                <label>Address</label>
                <textarea
                  disabled={!formData.guestGST}
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="border px-2 py-1 h-24 w-full disabled:bg-gray-100"
                />

                <label>GST No</label>
                <input
                  disabled={!formData.guestGST}
                  value={formData.gstNo}
                  onChange={(e) => handleChange("gstNo", e.target.value)}
                  className="border px-2 py-1 w-full disabled:bg-gray-100"
                />

                <label>State Code</label>
                <input
                  disabled={!formData.guestGST}
                  value={formData.stateCode}
                  onChange={(e) => handleChange("stateCode", e.target.value)}
                  className="border px-2 py-1 w-full disabled:bg-gray-100"
                />

              </div>
            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="border-t p-3 flex justify-between">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Cancel
          </button>

          <button
            onClick={onPrint}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Print
          </button>
        </div>

      </div>
    </div>
  );
};

export default BillReprint;