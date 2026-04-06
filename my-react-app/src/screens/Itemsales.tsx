import { useEffect, useState } from "react";
import Header from "../components/Header";
import { getCombinedOutletAndTableMasterList, getItemSalesReport } from "../api/services/products.service";
import ReportTable from "../components/ItemsSaltesreportTable";

type Row = Record<string, any>; // Generic row type

export default function ItemSales() {
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
      const data: any[] = await getCombinedOutletAndTableMasterList(
        localStorage.getItem("branch") || ""
      );

      const formattedOutlets = data.map((outlet) => ({
        id: outlet.oltCode.toString(),
        label: outlet.oltName.trim(),
      }));
      setOutlets(formattedOutlets);
    } catch (error) {
      console.error("Error fetching outlets:", error);
    }
  };

  // Fetch item sales report data based on selected outlet and dates
  const fetchData = async () => {
    try {
      const outletId: string | number =
        selectedOutlet === "All"
          ? "All"
          : Number(outlets.find((o) => o.label === selectedOutlet)?.id);

      if (!outletId || (typeof outletId === "number" && isNaN(outletId))) return;

      const res = await getItemSalesReport(fromDate, toDate, outletId);

  if (res.length > 0 && res[0].items?.length > 0) {
 const dynamicColumns = Object.keys(res[0].items[0])
  .filter((key) => key !== "groupName" && key !== "outletName")
  .map((key) => ({
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
        title="Item Sales Report"
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