import { useEffect, useState } from "react";
import Header from "../components/Header";
import ReportTable from "../components/ReportDataTable";
import {  getNCKOTReport, getOutletList } from "../api/services/products.service";


type Row = Record<string, any>; // Generic row type

export default function Nckot() {
  const [data, setData] = useState<Row[]>([]);
  const [columns, setColumns] = useState<{ key: string; label: string }[]>([]);
  const [outlets, setOutlets] = useState<{ id: string; label: string }[]>([]);
  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

  const [fromDate, setFromDate] = useState(formattedToday);
  const [toDate, setToDate] = useState(formattedToday);
  const [selectedOutlet, setSelectedOutlet] = useState("All");

  // Fetch outlets from API
const fetchOutletData = async () => {
  try {
    const branchcode = localStorage.getItem("branch") || "";

    const response = await getOutletList(branchcode);

    const formattedOutlets = (response.data || []).map((outlet: any) => ({
      id: outlet.oltCode.toString(),
      label: outlet.oltName.trim(),
    }));

    setOutlets(formattedOutlets);
  } catch (error) {
    console.error("Error fetching outlets:", error);
    setOutlets([]);
  }
};

  // Fetch report data based on selected outlet and dates
  const fetchData = async () => {
    try {
      const outletId: string | number =
        selectedOutlet === "All"
          ? "All"
          : Number(outlets.find((o) => o.label === selectedOutlet)?.id);

      if (!outletId || (typeof outletId === "number" && isNaN(outletId))) return;

      const res = await getNCKOTReport(fromDate, toDate, outletId);

      if (res.length > 0) {
        const dynamicColumns = Object.keys(res[0]).map((key) => ({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
        }));
        setColumns(dynamicColumns);
      }

      setData(res);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  useEffect(() => {
    fetchOutletData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate, selectedOutlet, outlets]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header showNeworderButton={false} />
      <div className="flex-1 overflow-auto">
        <ReportTable
        title="NC Kot Report"
          columns={columns}
          data={data}
          outlets={outlets}
          fromDate={fromDate}
          toDate={toDate}
          outlet={selectedOutlet}
          setOutlet={setSelectedOutlet}
          setFromDate={setFromDate}
          setToDate={setToDate}
        />
      </div>
    </div>
  );
}