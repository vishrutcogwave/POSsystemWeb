import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;

  formData: {
    outlet: string;
    billDate: string;
    billNo: string;
    billTime: string;
    discount: number;
    reason: string;
    guestName: string;
    address: string;
    gstNo: string;
    stateCode: string;
    guestGST: boolean;
  };

  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onPrint: () => void;
};

const BillReprint: React.FC<Props> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onPrint,
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
      
      {/* MAIN CONTAINER (HEIGHT FIXED) */}
      <div className="w-full max-w-5xl h-[90vh] bg-white sm:rounded-xl rounded-none shadow-xl flex flex-col">

        {/* HEADER (FIXED) */}
        <div className="bg-[#0576B2] text-white px-4 py-3 flex justify-between items-center shrink-0">
          <h2 className="font-semibold text-lg">BILL REPRINT : =====</h2>
          <button onClick={onClose}>×</button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 pr-2">

          <div className="border p-4 grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">

            {/* LEFT SECTION */}
            <div className="border p-4 min-w-0">

              <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[140px_1fr] gap-y-4 items-start">

                <label>Outlet</label>
                <select
                  value={formData.outlet}
                  onChange={(e) => handleChange("outlet", e.target.value)}
                  className="border px-2 py-1 w-full"
                >
                  <option>Select</option>
                  <option value="Outlet1">Outlet 1</option>
                </select>

                <label>Bill Date</label>
                <input
                  type="date"
                  value={formData.billDate}
                  onChange={(e) => handleChange("billDate", e.target.value)}
                  className="border px-2 py-1 w-full"
                />

                <label>Bill No.</label>
                <input
                  value={formData.billNo}
                  onChange={(e) => handleChange("billNo", e.target.value)}
                  className="border px-2 py-1 w-full"
                />

                <label>Bill Time</label>
                <input
                  value={formData.billTime}
                  onChange={(e) => handleChange("billTime", e.target.value)}
                  className="border px-2 py-1 w-full"
                />

                <label>Discount (Rs.)</label>
                <input
                  value={formData.discount}
                  onChange={(e) => handleChange("discount", e.target.value)}
                  className="border px-2 py-1 w-full"
                />

                <label>Reason</label>
                <input
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  className="border px-2 py-1 w-full"
                />

              </div>


            </div>

            {/* RIGHT SECTION */}
            <div className="border p-4 min-w-0">

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={formData.guestGST}
                  onChange={(e) => handleChange("guestGST", e.target.checked)}
                />
                <label>Guest GST</label>
              </div>

              <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[140px_1fr] gap-y-4 items-start">

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

        {/* FOOTER (FIXED) */}
        <div className="border-t p-3 flex justify-between shrink-0">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Cancel
          </button>

          <button
            onClick={onPrint}
            className="px-4 py-2 rounded bg-gray-400 text-white"
          >
            Print
          </button>
        </div>

      </div>
    </div>
  );
};

export default BillReprint;