import { useEffect, useState } from "react";
import Header from "../components/Header";
import ChangeSheetDataTable from "../components/ChangeSheetDataTable";
import {
  getCombinedOutletAndTableMasterList,
  getChanceSheetReport,
} from "../api/services/products.service";

type Bill = {
  billNo: string;
  billDate: string;
  billTime: string;
  itemSale: number;
  tax: number;
  cgst: number;
  sgst: number;
  total: number;
  roundOff: number;
  grand: number;
  cash: number;
  card: number;
  upi: number;
  online: number;
  cheque: number;
  credit: number;
  kbsRefName: string;
  oltName: string;
};

type Summary = {
  cgst: number;
  sgst: number;
  discount: number;
  total: number;
  grand: number;
  roundOff: number;
  cash: number;
  card: number;
  upi: number;
  online: number;
  cheque: number;
  credit: number;
};

export default function Chancesheet() {
  const [data, setData] = useState<Bill[]>([]);
  const [summary, setSummary] = useState<Summary>({} as Summary);
  const [outlets, setOutlets] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(formattedToday);
  const [toDate, setToDate] = useState(formattedToday);

  // ✅ IMPORTANT: store ID (not label)
  const [selectedOutlet, setSelectedOutlet] = useState<string>("All");

  // ---------------- FETCH OUTLETS ----------------
  const fetchOutletData = async () => {
    try {
      const res: any[] = await getCombinedOutletAndTableMasterList(
        localStorage.getItem("branch") || ""
      );

      const formatted = res.map((o) => ({
        id: o.oltCode.toString(),
        label: o.oltName.trim(),
      }));

      setOutlets(formatted);
    } catch (error) {
      console.error("Outlet error:", error);
    }
  };

  // ---------------- FETCH DATA ----------------
  const fetchData = async () => {
    try {
      setLoading(true);

      const outletId =
        selectedOutlet === "All" ? "All" : Number(selectedOutlet);

      const res = await getChanceSheetReport(fromDate, toDate, outletId);

      setData((res?.data || []) as Bill[]);
      setSummary((res?.summary || {}) as Summary);
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    fetchOutletData();
  }, []);

  // ✅ TRIGGERS ALWAYS WORK NOW
  useEffect(() => {
    fetchData();
  }, [fromDate, toDate, selectedOutlet]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header showNeworderButton={false} />

      {loading && (
        <div className="text-sm text-gray-500 p-2">Loading...</div>
      )}

      <div className="flex-1 overflow-auto">
        <ChangeSheetDataTable
              title="Chance Sheet"
          data={data}
          summary={summary}
          selectedOutlet={selectedOutlet}
          outlets={outlets}
          setOutlet={setSelectedOutlet}
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
        />
      </div>
    </div>
  );
}