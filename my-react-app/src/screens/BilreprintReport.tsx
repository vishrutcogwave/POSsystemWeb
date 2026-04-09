import { useEffect, useState } from "react";
import Header from "../components/Header";
import BillReprint from "../components/BillReprint";
import {
  getFilteredBillDetails,
  getCombinedOutletAndTableMasterList,
  getReprintBill,
  getCompanyInfo,
} from "../api/services/products.service";
import BillReprintAdvancedTable from "../components/BillReprintTable";
import { reprintBill } from "../api/services/printer";

export default function BillReprintReport() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);

  // ✅ OUTLETS STATE (same as ItemSales)
  const [outlets, setOutlets] = useState<{ id: string; label: string }[]>([]);

  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [outlet, setOutlet] = useState("");

const [formData, setFormData] = useState({
  outlet: "",
  billDate: "",
  billNo: "",
  discount: 0,
  guestName: "",
  address: "",
  gstNo: "",
  stateCode: "",
  guestGST: false,
});

  const fetchCompany = async () => {
    try {
      const branch = localStorage.getItem("branch") || "";
      const data = await getCompanyInfo(branch);

      console.log("Company Info:", data);
      setCompanyInfo(data);
    } catch (err) {
      console.error("Company fetch failed", err);
    }
  };

  const fetchOutletData = async () => {
    try {
      const res: any[] = await getCombinedOutletAndTableMasterList(
        localStorage.getItem("branch") || "",
      );

      const formatted = res.map((o) => ({
        id: o.oltCode.toString(),
        label: o.oltName.trim(),
      }));

      setOutlets(formatted);

      // ✅ AUTO SELECT FIRST OUTLET
      if (formatted.length > 0) {
        setOutlet(formatted[0].id);
      }
    } catch (err) {
      console.error("Outlet fetch error:", err);
    }
  };

  // ✅ FETCH BILLS
  const fetchBills = async () => {
    try {
      setLoading(true);

      const outletId = outlet;

      if (!outletId) return;

      const res = await getFilteredBillDetails({
        fromDate,
        toDate,
        branchCode: "DEROY",
        outlet: outletId,
      });

      console.log("API RESPONSE:", res);

      setData(res || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOAD OUTLETS FIRST
  useEffect(() => {
    fetchOutletData();
    fetchCompany()
  }, []);

  // ✅ LOAD DATA AFTER OUTLETS + FILTERS
  useEffect(() => {
    if (outlets.length > 0) {
      fetchBills();
    }
  }, [fromDate, toDate, outlet, outlets]);

  // ✅ REPRINT CLICK
 const handleReprintClick = (row: any) => {
  setFormData((prev) => ({
    ...prev,
    billNo: row.ksmBillNo,
    billDate: row.kbsValidDate?.split("T")[0],
    discount: row.kbsDiscount || 0,
    outlet: row.oltCode?.toString(), // ✅ FIXED (important)
  }));

  setIsOpen(true);
};

const handlePrint = async () => {
  try {
    const payload: any = {
      billno: Number(formData.billNo),
      oltcode: formData.outlet,
      branchcode: localStorage.getItem("branch"),
    };

    // ✅ GST fields only if checkbox checked
    if (formData.guestGST) {
      payload.guestName = formData.guestName;
      payload.address = formData.address;
      payload.gstNo = formData.gstNo;
      payload.stateCode = Number(formData.stateCode);
    }

    console.log("FINAL PAYLOAD:", payload);

    // ✅ FIXED CALL
    const res = await getReprintBill(payload);

        const printRes = await reprintBill(
                res,
                formData,
                companyInfo,
              );
    console.log("printRes", printRes);

    setIsOpen(false);
  } catch (error) {
    console.error("Print Error:", error);
  }
};
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header showNeworderButton={false} />

      <div className="flex-1 overflow-auto">
        {loading ? (
          <p className="text-center mt-10">Loading...</p>
        ) : (
          <BillReprintAdvancedTable
            title="Bill Reprint Report"
            data={data}
            outlets={outlets} // ✅ SAME AS ITEM SALES
            fromDate={fromDate}
            toDate={toDate}
            outlet={outlet}
            setFromDate={setFromDate}
            setToDate={setToDate}
            setOutlet={setOutlet}
            onReprint={handleReprintClick}
          />
        )}
      </div>

      <BillReprint
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onPrint={handlePrint} outlets={outlets}      />
    </div>
  );
}
