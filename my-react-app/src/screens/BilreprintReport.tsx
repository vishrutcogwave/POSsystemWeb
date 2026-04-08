import { useState } from "react";
import Header from "../components/Header";
import BillReprintTable from "../components/BillReprintTable";
import BillReprint from "../components/BillReprint";

export default function BillReprintReport() {
  const [isOpen, setIsOpen] = useState(false);

  const [data] = useState([
    { billNo: "101", date: "2026-04-08", amount: 500 },
    { billNo: "102", date: "2026-04-08", amount: 800 },
  ]);

  const [formData, setFormData] = useState({
    outlet: "Outlet 1",
    billDate: "",
    billNo: "",
    billTime: "",
    discount: 0,
    reason: "",
    guestName: "",
    address: "",
    gstNo: "",
    stateCode: "",
    guestGST: false,
  });

  const handleReprintClick = (row: any) => {
    // ✅ pass row data to popup
    setFormData((prev) => ({
      ...prev,
      billNo: row.billNo,
      billDate: row.date,
    }));

    setIsOpen(true);
  };

  const handlePrint = () => {
    console.log("PRINT DATA:", formData);
    setIsOpen(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">

      {/* HEADER */}
      <Header showNeworderButton={false} />

      {/* TABLE */}
      <div className="flex-1 overflow-auto">
        <BillReprintTable
          title="Bill Reprint Report"
          data={data}
          onReprint={handleReprintClick}
        />
      </div>

      {/* POPUP */}
      <BillReprint
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onPrint={handlePrint}
      />
    </div>
  );
}