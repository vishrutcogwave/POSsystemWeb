import { useMemo, useState, Fragment } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Menu, Transition } from "@headlessui/react";

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
  pluxee:number
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

type OutletWiseSummary = {
  outletName: string;
  totalAmount: number;
};
type Props = {
  title: string;
  data: Bill[];
  summary: Summary;
  remarksSummary: RemarksSummary[];
  outletWiseSummary: OutletWiseSummary[];

  selectedOutlet: string;
  outlets: { id: string; label: string }[];
  setOutlet: (val: string) => void;

  fromDate: string;
  toDate: string;
  setFromDate: (val: string) => void;
  setToDate: (val: string) => void;
};
export default function ChangeSheetDataTable({
  title,
  data,
  summary,
  remarksSummary,
  outletWiseSummary,
  selectedOutlet,
  outlets,
  setOutlet,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
}: Props) {
  const [search, setSearch] = useState("");

  const formatDate = (val: string) =>
    val?.includes("T") ? val.split("T")[0] : val || "--";

  // REMOVE DUPLICATES
  const uniqueData = useMemo(() => {
    const map = new Map();
    data.forEach((row) => {
      const key = `${row.billNo}-${row.billTime}`;
      if (!map.has(key)) map.set(key, row);
    });
    return Array.from(map.values());
  }, [data]);

  // FILTER
  const filteredData = useMemo(() => {
    return uniqueData.filter((row) => {
      const textMatch = Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

   const selectedOutletName =
  outlets.find((o) => o.id === selectedOutlet)?.label;

const outletMatch =
  selectedOutlet === "All" ||
  row.oltName === selectedOutletName;

      return textMatch && outletMatch;
    });
  }, [uniqueData, search, selectedOutlet]);

  // GROUPING
  const groupedData = useMemo(() => {
    const map: Record<string, Bill[]> = {};
    filteredData.forEach((row) => {
      const key = row.oltName || "Unknown";
      if (!map[key]) map[key] = [];
      map[key].push(row);
    });
    return map;
  }, [filteredData]);

  // EXPORT
const handleExcel = () => {
  const wsData: any[][] = [];

  Object.entries(groupedData).forEach(([outletName, rows]) => {
    // Outlet Heading
    wsData.push([outletName]);

    // Column Headers
    wsData.push([
      "Bill No",
      "Date",
      "Time",
      "Sale",
      "Tax",
      "CGST",
      "SGST",
      "Total",
      "Round",
      "Grand",
      "Cash",
      "Card",
      "UPI",
      "Online",
      "Cheque",
      "Credit",
      "Status",
    ]);

    // Data
    rows.forEach((row) => {
      wsData.push([
        row.billNo,
        formatDate(row.date),
        row.billTime,
        row.itemSale,
        row.tax,
        row.cgst,
        row.sgst,
        row.total,
        row.roundOff,
        row.grand,
        row.cash,
        row.card,
        row.upi,
        row.online,
        row.cheque,
        row.credit,
        row.kbsRefName || "-",
      ]);
    });

    // Outlet Total
    wsData.push([
      "Outlet Total",
      "",
      "",
      rows.reduce((s, r) => s + Number(r.itemSale || 0), 0).toFixed(2),
      rows.reduce((s, r) => s + Number(r.tax || 0), 0).toFixed(2),
      rows.reduce((s, r) => s + Number(r.cgst || 0), 0).toFixed(2),
      rows.reduce((s, r) => s + Number(r.sgst || 0), 0).toFixed(2),
      rows.reduce((s, r) => s + Number(r.total || 0), 0).toFixed(2),
      rows.reduce((s, r) => s + Number(r.roundOff || 0), 0).toFixed(2),
      rows.reduce((s, r) => s + Number(r.grand || 0), 0).toFixed(2),
      rows.reduce((s, r) => s + Number(r.cash || 0), 0).toFixed(2),
      rows.reduce((s, r) => s + Number(r.card || 0), 0).toFixed(2),
      rows.reduce((s, r) => s + Number(r.upi || 0), 0).toFixed(2),
      rows.reduce((s, r) => s + Number(r.online || 0), 0).toFixed(2),
      rows.reduce((s, r) => s + Number(r.cheque || 0), 0).toFixed(2),
      rows.reduce((s, r) => s + Number(r.credit || 0), 0).toFixed(2),
      "",
    ]);

    wsData.push([]);
  });

  // ==========================
  // Overall Summary (Box Layout)
  // ==========================
  wsData.push([]);
  wsData.push(["OVERALL SUMMARY"]);
  wsData.push([]);

  wsData.push([
    "Sale",
    Number(summary.total || 0).toFixed(2),
    "",
    "CGST",
    Number(summary.cgst || 0).toFixed(2),
    "",
    "SGST",
    Number(summary.sgst || 0).toFixed(2),
  ]);

  wsData.push([
    "Grand",
    Number(summary.grand || 0).toFixed(2),
    "",
    "Round",
    Number(summary.roundOff || 0).toFixed(2),
    "",
    "Cash",
    Number(summary.cash || 0).toFixed(2),
  ]);

  wsData.push([
    "Card",
    Number(summary.card || 0).toFixed(2),
    "",
    "UPI",
    Number(summary.upi || 0).toFixed(2),
    "",
    "Online",
    Number(summary.online || 0).toFixed(2),
  ]);

  wsData.push([
    "Cheque",
    Number(summary.cheque || 0).toFixed(2),
    "",
    "Credit",
    Number(summary.credit || 0).toFixed(2),
  ]);

  // ==========================
  // Remarks Summary
  // ==========================
  if (remarksSummary.length > 0) {
    wsData.push([]);
    wsData.push(["REMARKS SUMMARY"]);
    wsData.push(["Particular", "Amount"]);

    remarksSummary.forEach((item) => {
      wsData.push([
        item.particulars,
        Number(item.amount || 0).toFixed(2),
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto column width
  ws["!cols"] = [
    { wch: 18 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 6 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Change Sheet");

  XLSX.writeFile(
    wb,
    `${title.replace(/\s+/g, "_")}_${fromDate}_to_${toDate}.xlsx`
  );
};

  const handlePDF = () => {
    const doc = new jsPDF();

    Object.entries(groupedData).forEach(([outlet, rows], i) => {
      const startY =
        i === 0 ? 20 : (doc as any).lastAutoTable?.finalY + 10 || 20;

      doc.text(outlet, 14, startY);

      autoTable(doc, {
        head: [[
          "BillNo","Date","Time","Sale","Tax","CGST","SGST",
          "Total","Round","Grand","Cash","Online","Status"
        ]],
        body: rows.map((r) => [
          r.billNo,
          formatDate(r.date),
          r.billTime,
          r.itemSale,
          r.tax,
          r.cgst,
          r.sgst,
          r.total,
          r.roundOff,
          r.grand,
          r.cash,
          r.online,
          r.kbsRefName,
        ]),
        startY: startY + 5,
      });
    });

    doc.save("changesheet.pdf");
    doc.text("Summary", 14, (doc as any).lastAutoTable?.finalY + 10 || 20);

autoTable(doc, {
  startY: (doc as any).lastAutoTable?.finalY + 15 || 25,
  body: [
    ["Total", summary.total],
    ["Grand", summary.grand],
    ["CGST", summary.cgst],
    ["SGST", summary.sgst],
    ["RoundOff", summary.roundOff],
    ["Cash", summary.cash],
    ["Online", summary.online],
    ["Card", summary.card],
  ],
});
  };

  // PRINT
const handlePrint = () => {
  const sections = Object.entries(groupedData)
    .map(
      ([outlet, rows]) => `
      <h3>${outlet}</h3>
      <table>
        <thead>
          <tr>
            <th>BillNo</th><th>Date</th><th>Time</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr>
              <td>${r.billNo}</td>
              <td>${formatDate(r.date)}</td>
              <td>${r.billTime}</td>
              <td>${r.grand}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table><br/>
    `
    )
    .join("");

  const summaryHtml = `
    <h3>Summary</h3>
    <table>
      <tr><td>Total</td><td>${summary.total}</td></tr>
      <tr><td>Grand</td><td>${summary.grand}</td></tr>
      <tr><td>CGST</td><td>${summary.cgst}</td></tr>
      <tr><td>SGST</td><td>${summary.sgst}</td></tr>
      <tr><td>RoundOff</td><td>${summary.roundOff}</td></tr>
      <tr><td>Cash</td><td>${summary.cash}</td></tr>
      <tr><td>Online</td><td>${summary.online}</td></tr>
      <tr><td>Card</td><td>${summary.card}</td></tr>
    </table>
  `;

  const html = `
    <html>
      <head>
        <style>
          table { width:100%; border-collapse: collapse; margin-bottom:10px; }
          th, td { border:1px solid #333; padding:5px; }
          h3 { margin-top:20px; }
        </style>
      </head>
      <body>
    <h2>${title}</h2>
        ${sections}
        ${summaryHtml}
      </body>
    </html>
  `;

  const win = window.open("", "_blank");
  win?.document.write(html);
  win?.document.close();
  win?.print();
};
  return (
    <div className="p-4">
  <h2 className="text-lg md:text-xl font-semibold text-center mb-4">
  {title}
</h2>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <select
            value={selectedOutlet}
            onChange={(e) => setOutlet(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="All">All</option>
         {outlets.map((o) => (
  <option key={o.id} value={o.id}>
    {o.label}
  </option>
))}
          </select>
        </div>

        <div className="flex gap-2">
          <input
            placeholder="Search..."
            className="border rounded px-3 py-2 text-sm w-32 md:w-48"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={handlePrint}
            className="bg-blue-500 text-white px-3 py-2 rounded text-sm"
          >
            🖨
          </button>

          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="bg-green-500 text-white px-3 py-2 rounded text-sm">
              ⬇ Download
            </Menu.Button>

            <Transition as={Fragment}>
              <Menu.Items className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleExcel}
                        className={`${active ? "bg-gray-100" : ""} w-full text-left px-4 py-2 text-sm`}
                      >
                        Excel
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handlePDF}
                        className={`${active ? "bg-gray-100" : ""} w-full text-left px-4 py-2 text-sm`}
                      >
                        PDF
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* GROUPED TABLE WITH ALIGNMENT */}
      {Object.entries(groupedData).map(([outletName, rows]) => (
        <div key={outletName} className="mb-6">
          <h3 className="text-md font-semibold mb-2">{outletName}</h3>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">BillNo</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-right">Sale</th>
                  <th className="px-4 py-2 text-right">Tax</th>
                  <th className="px-4 py-2 text-right">CGST</th>
                  <th className="px-4 py-2 text-right">SGST</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-right">Round</th>
                  <th className="px-4 py-2 text-right">Grand</th>
                  <th className="px-4 py-2 text-right">Cash</th>
                   <th className="px-4 py-2 text-right">Card</th>
                  <th className="px-4 py-2 text-right">Online</th>
                   <th className="px-4 py-2 text-right">Pluxee</th>
                  <th className="px-4 py-2 text-left">kbsRefName</th>
                </tr>
              </thead>

          <tbody>
  {rows.map((row, i) => (
    <tr
      key={i}
      className={`border-t ${
        i % 2 === 0 ? "bg-white" : "bg-gray-50"
      } hover:bg-gray-100`}
    >
      <td className="px-4 py-2">{row.billNo}</td>
      <td className="px-4 py-2">{formatDate(row.date)}</td>
      <td className="px-4 py-2">{row.billTime}</td>
      <td className="px-4 py-2 text-right">{row.itemSale}</td>
      <td className="px-4 py-2 text-right">{row.tax}</td>
      <td className="px-4 py-2 text-right">{row.cgst}</td>
      <td className="px-4 py-2 text-right">{row.sgst}</td>
      <td className="px-4 py-2 text-right">{row.total}</td>
      <td className="px-4 py-2 text-right">{row.roundOff}</td>
      <td className="px-4 py-2 text-right">{row.grand}</td>
      <td className="px-4 py-2 text-right">{row.cash}</td>
      <td className="px-4 py-2 text-right">{row.card}</td>
      <td className="px-4 py-2 text-right">{row.upi}</td>
       <td className="px-4 py-2 text-right">{row.pluxee}</td>
      <td className="px-4 py-2">
        {row.kbsRefName || "-"}
      </td>
    </tr>
  ))}

  {/* Total Row */}
  <tr className="bg-green-600 text-white font-bold border-t-2">
    <td colSpan={3} className="px-4 py-2">
      Total
    </td>

    <td className="text-right px-4 py-2">
      {rows.reduce((s, r) => s + Number(r.itemSale || 0), 0).toFixed(2)}
    </td>
    <td className="text-right px-4 py-2">
      {rows.reduce((s, r) => s + Number(r.tax || 0), 0).toFixed(2)}
    </td>
    <td className="text-right px-4 py-2">
      {rows.reduce((s, r) => s + Number(r.cgst || 0), 0).toFixed(2)}
    </td>
    <td className="text-right px-4 py-2">
      {rows.reduce((s, r) => s + Number(r.sgst || 0), 0).toFixed(2)}
    </td>
    <td className="text-right px-4 py-2">
      {rows.reduce((s, r) => s + Number(r.total || 0), 0).toFixed(2)}
    </td>
    <td className="text-right px-4 py-2">
      {rows.reduce((s, r) => s + Number(r.roundOff || 0), 0).toFixed(2)}
    </td>
    <td className="text-right px-4 py-2">
      {rows.reduce((s, r) => s + Number(r.grand || 0), 0).toFixed(2)}
    </td>
    <td className="text-right px-4 py-2">
      {rows.reduce((s, r) => s + Number(r.cash || 0), 0).toFixed(2)}
    </td>
    <td className="text-right px-4 py-2">
      {rows.reduce((s, r) => s + Number(r.card || 0), 0).toFixed(2)}
    </td>
    <td className="text-right px-4 py-2">
      {rows.reduce((s, r) => s + Number(r.upi || 0), 0).toFixed(2)}
    </td>
        <td className="text-right px-4 py-2">
      {rows.reduce((s, r) => s + Number(r.pluxee || 0), 0).toFixed(2)}
    </td>


    <td>-</td>
  </tr>
</tbody>
            </table>
          </div>
        </div>
      ))}

     {/* Overall Summary */}
<div className="mt-6 border rounded p-4 bg-green-600 text-white">
  <h3 className="font-semibold mb-3">Overall Total</h3>

  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
    <div>
      Sale:{" "}
      {filteredData
        .reduce((s, r) => s + Number(r.itemSale || 0), 0)
        .toFixed(2)}
    </div>

    <div>
      Tax:{" "}
      {filteredData
        .reduce((s, r) => s + Number(r.tax || 0), 0)
        .toFixed(2)}
    </div>

    <div>
      CGST:{" "}
      {filteredData
        .reduce((s, r) => s + Number(r.cgst || 0), 0)
        .toFixed(2)}
    </div>

    <div>
      SGST:{" "}
      {filteredData
        .reduce((s, r) => s + Number(r.sgst || 0), 0)
        .toFixed(2)}
    </div>

    <div>
      Total:{" "}
      {filteredData
        .reduce((s, r) => s + Number(r.total || 0), 0)
        .toFixed(2)}
    </div>

    <div>
      Round:{" "}
      {filteredData
        .reduce((s, r) => s + Number(r.roundOff || 0), 0)
        .toFixed(2)}
    </div>

    <div>
      Grand:{" "}
      {filteredData
        .reduce((s, r) => s + Number(r.grand || 0), 0)
        .toFixed(2)}
    </div>

    <div>
      Cash:{" "}
      {filteredData
        .reduce((s, r) => s + Number(r.cash || 0), 0)
        .toFixed(2)}
    </div>

    <div>
      Card:{" "}
      {filteredData
        .reduce((s, r) => s + Number(r.card || 0), 0)
        .toFixed(2)}
    </div>

    <div>
      Online:{" "}
      {filteredData
        .reduce((s, r) => s + Number(r.upi || 0), 0)
        .toFixed(2)}
    </div>
  </div>
</div>
{/* Remarks Summary */}
{remarksSummary.length > 0 && (
  <div className="mt-6 border rounded p-4 bg-green-600 text-white">
    <h3 className="font-semibold mb-3">Remarks Summary</h3>

    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
      {remarksSummary.map((item, index) => (
        <div key={index}>
          {item.particulars}: {Number(item.amount || 0).toFixed(2)}
        </div>
      ))}
    </div>
    
  </div>
)}
{outletWiseSummary.length > 0 && (
  <div className="mt-6 border rounded p-4 bg-green-600 text-white">
    <h3 className="font-semibold mb-3">Outlet Wise Summary</h3>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
      {outletWiseSummary.map((item, index) => (
        <div
          key={index}
          className="bg-white/10 rounded p-3"
        >
          <div className="font-semibold">{item.outletName}</div>
          <div>₹ {Number(item.totalAmount).toFixed(2)}</div>
        </div>
      ))}
    </div>
  </div>
)}
    </div>
  );
}