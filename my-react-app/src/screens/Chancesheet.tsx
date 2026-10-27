import { useEffect, useState } from "react";
import Header from "../components/Header";
import ChangeSheetDataTable from "../components/ChangeSheetDataTable";
import Loader from "../components/Loader";
import {
  getChanceSheetReport,
  getOutletList,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";

type OutletWiseSummary = {
  outletName: string;
  totalAmount: number;
};

type Bill = {
  billNo: string;
  date: string;
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
  pluxee: number;
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

type RemarksSummary = {
  particulars: string;
  amount: number;
};

export default function Chancesheet() {
  const [data, setData] = useState<Bill[]>([]);
  const [summary, setSummary] = useState<Summary>({} as Summary);
  const [outlets, setOutlets] = useState<
    { id: string; label: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [remarksSummary, setRemarksSummary] = useState<
    RemarksSummary[]
  >([]);
  const [outletWiseSummary, setOutletWiseSummary] = useState<
    OutletWiseSummary[]
  >([]);

  const { appData } = useAppContext();

  const today = new Date();
  const formattedToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const [fromDate, setFromDate] = useState(formattedToday);
  const [toDate, setToDate] = useState(formattedToday);
  const [selectedOutlet, setSelectedOutlet] = useState<string>("All");

  // FETCH OUTLETS
  const fetchOutletData = async () => {
    try {
      const branchcode = localStorage.getItem("branch") || "";
      const response = await getOutletList(branchcode);

      const formattedOutlets = (response.data || []).map(
        (outlet: any) => ({
          id: outlet.oltCode.toString(),
          label: outlet.oltName.trim(),
        })
      );

      setOutlets(formattedOutlets);
    } catch (error) {
      console.error("Error fetching outlets:", error);
      setOutlets([]);
    }
  };

  // FETCH CHANCE SHEET DATA
  const fetchData = async () => {
    try {
      setLoading(true);

      const outletId =
        selectedOutlet === "All" ? "All" : selectedOutlet;

      const res = await getChanceSheetReport(
        fromDate,
        toDate,
        outletId,
        appData?.user?.branch_code
      );

      setData((res?.data || []) as Bill[]);
      setSummary((res?.summary || {}) as Summary);
      setRemarksSummary(res?.remarksSummary || []);
      setOutletWiseSummary(res?.outletWiseSummary || []);
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // FETCH OUTLETS ON MOUNT
  useEffect(() => {
    fetchOutletData();
  }, []);

  // FETCH REPORT WHEN FILTERS CHANGE
  useEffect(() => {
    fetchData();
  }, [fromDate, toDate, selectedOutlet]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header showNeworderButton={false} />

      {/* ANIMATED LOADER */}
      {loading && <Loader />}

      <div className="flex-1 overflow-auto">
        <ChangeSheetDataTable
          outletWiseSummary={outletWiseSummary}
          title="Chance Sheet"
          data={data}
          summary={summary}
          remarksSummary={remarksSummary}
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