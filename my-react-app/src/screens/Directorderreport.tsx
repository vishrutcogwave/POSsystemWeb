import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import {
  Search,
  FileBarChart,
  Printer,
  FileSpreadsheet,
  FileDown,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getPurchaseReport } from "../api/services/products.service";
import { formatHeader } from "../utils";

type ReportType = "Regular Report" | "Detailed" | "Supplier Wise" | "Item Wise";
type ReportRow = Record<string, unknown>;

const getText = (value: unknown) => String(value ?? "").trim();

const headerLabels: Record<string, string> = {
  pNo: "Purchase No.",
  pDate: "Purchase Date",
  supCode: "Supplier Code",
  supplier: "Supplier",
  billed: "Bill No.",
  storeId: "Store ID",
  depCode: "Department Code",
  pType: "Purchase Type",
  grnNo: "GRN No.",
  itemCode: "Item Code",
  itemName: "Item Name",
  pItemQty: "Purchase Qty",
  pItemRate: "Item Rate",
  unit: "Unit",
  gsTno: "GST No.",
  cgsT_Per: "CGST %",
  cgsT_Amount: "CGST Amount",
  sgsT_Per: "SGST %",
  sgsT_Amount: "SGST Amount",
  cess_Per: "Cess %",
  cess_Amount: "Cess Amount",
  vaT_Per: "VAT %",
  vaT_Amount: "VAT Amount",
  missChargeAmount: "Misc. Charge",
  totalamount: "Total Amount",
  totalTaxAmount: "Total Tax Amount",
  grossAmount: "Gross Amount",
};

const moneyFields = new Set([
  "pItemRate", "cgsT_Amount", "sgsT_Amount", "cess_Amount", "vaT_Amount",
  "missChargeAmount", "totalamount", "totalAmount", "totalTaxAmount", "grossAmount",
]);

const formatAmount = (value: number) =>
  value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (value: unknown) => {
  if (!value) return "-";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? getText(value) : parsed.toLocaleDateString("en-IN");
};

const formatDateForApi = (date: string) => {
  const [year, month, day] = date.split("-");
  return `${month}/${day}/${year}`;
};

const getToday = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

export default function Directorderreport() {
  const [reportType, setReportType] = useState<ReportType>("Regular Report");
  const [fromDate, setFromDate] = useState(getToday);
  const [toDate, setToDate] = useState(getToday);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<ReportRow[]>([]);
  const [summaries, setSummaries] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (!fromDate || !toDate || fromDate > toDate) {
      setData([]);
      setSummaries([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");
        const branchCode = localStorage.getItem("branch") || "";
        const response = await getPurchaseReport(
          formatDateForApi(fromDate),
          formatDateForApi(toDate),
          branchCode
        );

        if (cancelled) return;
        const candidates = [response, response?.data, response?.data?.data];
        const payload = candidates.find((candidate) => candidate && Array.isArray(candidate.details));
        setData(Array.isArray(payload?.details) ? payload.details : []);
        setSummaries(Array.isArray(payload?.summaries) ? payload.summaries : []);
        setSelectedSupplier("");
        setSelectedItem("");
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch Direct Purchase Report:", err);
          setData([]);
          setSummaries([]);
          setError("Failed to load the report. Please check the dates and try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReport();
    return () => {
      cancelled = true;
    };
  }, [fromDate, toDate]);

  const suppliers = useMemo(() => {
    const unique = new Map<string, string>();
    data.forEach((row) => {
      const code = getText(row.supCode);
      const name = getText(row.supplier);
      if (name) unique.set(code || name, name);
    });
    return Array.from(unique, ([code, name]) => ({ code, name }));
  }, [data]);

  const items = useMemo(() => {
    const unique = new Map<string, string>();
    data.forEach((row) => {
      const code = getText(row.itemCode);
      const name = getText(row.itemName);
      if (name) unique.set(code || name, name);
    });
    return Array.from(unique, ([code, name]) => ({ code, name }));
  }, [data]);

  const filteredRows = useMemo(() => {
    let rows = [...data];
    if (reportType === "Supplier Wise" && selectedSupplier) {
      rows = rows.filter((row) => getText(row.supCode) === selectedSupplier);
    }
    if (reportType === "Item Wise" && selectedItem) {
      rows = rows.filter((row) => getText(row.itemCode) === selectedItem);
    }
    if (reportType === "Supplier Wise") {
      rows.sort((a, b) =>
        getText(a.supplier).localeCompare(getText(b.supplier), undefined, { sensitivity: "base" }) ||
        Number(a.pNo) - Number(b.pNo)
      );
    } else if (reportType === "Item Wise") {
      rows.sort((a, b) =>
        getText(a.itemName).localeCompare(getText(b.itemName), undefined, { sensitivity: "base" }) ||
        Number(a.pNo) - Number(b.pNo)
      );
    } else {
      rows.sort((a, b) => Number(a.pNo) - Number(b.pNo));
    }
    return rows;
  }, [data, reportType, selectedSupplier, selectedItem]);

  const summaryByDocument = useMemo(() => {
    const map = new Map<string, ReportRow>();
    summaries.forEach((summary) => map.set(getText(summary.documentNo), summary));
    return map;
  }, [summaries]);

  const reportRows = useMemo(() => {
    if (reportType !== "Regular Report") {
      // Totals are document-level values; omit them from each repeated item detail row.
      return filteredRows.map((row) => {
        const copy = { ...row };
        delete copy.totalamount;
        delete copy.totalTaxAmount;
        delete copy.grossAmount;
        return copy;
      });
    }

    const documentMap = new Map<string, ReportRow>();
    filteredRows.forEach((row) => {
      const key = getText(row.pNo);
      if (key && !documentMap.has(key)) {
        const summary = summaryByDocument.get(key);
        documentMap.set(key, {
          pNo: row.pNo,
          pDate: row.pDate,
          supplier: row.supplier,
          billed: row.billed,
          pType: row.pType,
          missChargeAmount: summary?.missChargeAmount ?? row.missChargeAmount,
          totalamount: summary?.totalAmount ?? row.totalamount,
          totalTaxAmount: summary?.totalTaxAmount ?? row.totalTaxAmount,
          grossAmount: summary?.grossAmount ?? row.grossAmount,
        });
      }
    });
    return Array.from(documentMap.values()).sort((a, b) => Number(a.pNo) - Number(b.pNo));
  }, [filteredRows, reportType, summaryByDocument]);

  const displayedRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reportRows;
    return reportRows.filter((row) =>
      Object.values(row).some((value) => getText(value).toLowerCase().includes(query))
    );
  }, [reportRows, search]);

  const columns = useMemo(() => {
    if (!displayedRows.length) return [];
    return Object.keys(displayedRows[0]).filter(
      (key) => !["supCode", "itemCode", "storeId", "depCode", "billed","supplier","grnNo","gsTno"].includes(key) ||
        (reportType === "Regular Report" && key === "billed")
    );
  }, [displayedRows, reportType]);

  const sortedRows = useMemo(() => {
    if (!sortColumn) return displayedRows;
    return [...displayedRows].sort((a, b) => {
      const av = a[sortColumn];
      const bv = b[sortColumn];
      if (av == null || av === "") return 1;
      if (bv == null || bv === "") return -1;
      const an = Number(av);
      const bn = Number(bv);
      const comparison =
        String(av).trim() !== "" && String(bv).trim() !== "" &&
        Number.isFinite(an) && Number.isFinite(bn)
          ? an - bn
          : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [displayedRows, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) setSortDirection((previous) => previous === "asc" ? "desc" : "asc");
    else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Build one shared report layout for Print, PDF, and Excel so all exports
  // have the same headings, grouping, subtotals, and totals as PurchaseOrderReport.
  const buildExportRows = () => {
    const escapeHtml = (value: unknown) => getText(value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    const sourceRows = filteredRows.filter((row) => {
      const query = search.trim().toLowerCase();
      return !query || Object.values(row).some((value) => getText(value).toLowerCase().includes(query));
    });
    const money = (value: unknown) => {
      const amount = Number(value);
      return Number.isFinite(amount) ? formatAmount(amount) : "-";
    };
    const date = (value: unknown) => {
      if (!value) return "-";
      const parsed = new Date(String(value));
      return Number.isNaN(parsed.getTime()) ? getText(value) : parsed.toLocaleDateString("en-GB");
    };
    const getDocumentTotals = (row: ReportRow) => {
      const summary = summaryByDocument.get(getText(row.pNo));
      return {
        purchase: Number(summary?.totalAmount ?? row.totalamount ?? row.totalAmount) || 0,
        tax: Number(summary?.totalTaxAmount ?? row.totalTaxAmount) || 0,
        misc: Number(summary?.missChargeAmount ?? row.missChargeAmount) || 0,
        gross: Number(summary?.grossAmount ?? row.grossAmount) || 0,
      };
    };
    type ExportKind = "header" | "group" | "meta" | "column" | "data" | "subtotal" | "total";
    const output: Array<{ kind: ExportKind; cells: string[] }> = [];
    const add = (kind: ExportKind, ...cells: unknown[]) => output.push({
      kind,
      cells: cells.map((value) => value == null || value === "" ? "-" : String(value)),
    });
    const title = `Direct Purchase Report${reportType === "Regular Report" ? "" : ` (${reportType})`}`;
    add("header", title);
    add("meta", `From ${date(fromDate)} To ${date(toDate)}`);

    if (reportType === "Regular Report") {
      const documentMap = new Map<string, ReportRow>();
      sourceRows.forEach((row) => {
        const key = getText(row.pNo);
        if (key && !documentMap.has(key)) documentMap.set(key, row);
      });
      add("column", "Purchase No.", "Purchase Date", "Supplier", "Bill No.", "Purchase Type", "Misc. Charge", "Purchase Amount", "Tax Amount", "Gross Amount");
      let purchaseTotal = 0, taxTotal = 0, grossTotal = 0, miscTotal = 0;
      Array.from(documentMap.values()).sort((a, b) => Number(a.pNo) - Number(b.pNo)).forEach((row) => {
        const totals = getDocumentTotals(row);
        purchaseTotal += totals.purchase;
        taxTotal += totals.tax;
        grossTotal += totals.gross;
        miscTotal += totals.misc;
        add("data", row.pNo, date(row.pDate), row.supplier, row.billed, row.pType, money(totals.misc), money(totals.purchase), money(totals.tax), money(totals.gross));
      });
      add("total", "GRAND TOTAL", "", "", "", money(miscTotal), money(purchaseTotal), money(taxTotal), money(grossTotal));
    } else if (reportType === "Item Wise") {
      add("column", "Purchase No.", "Purchase Date", "Supplier", "Item Code", "Item Name", "Purchase Qty", "Unit", "Item Rate", "Amount");
      const groups = new Map<string, ReportRow[]>();
      sourceRows.forEach((row) => {
        const key = `${getText(row.itemCode)}|${getText(row.itemName)}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(row);
      });
      let grandTotal = 0;
      Array.from(groups.entries()).sort((a, b) => getText(a[1][0]?.itemName).localeCompare(getText(b[1][0]?.itemName))).forEach(([, rows]) => {
        const first = rows[0];
        add("group", `(${getText(first.itemCode)}) ${getText(first.itemName)}`);
        let subtotal = 0;
        rows.forEach((row) => {
          const amount = (Number(row.pItemQty) || 0) * (Number(row.pItemRate) || 0);
          subtotal += amount;
          add("data", row.pNo, date(row.pDate), row.supplier, row.itemCode, row.itemName, row.pItemQty, row.unit, money(row.pItemRate), money(amount));
        });
        grandTotal += subtotal;
        add("subtotal", "SUB TOTAL", "", "", "", "", "", "", money(subtotal));
      });
      add("total", "GRAND TOTAL", "", "", "", "", "", "", money(grandTotal));
    } else {
      const groups = new Map<string, ReportRow[]>();
      sourceRows.forEach((row) => {
        const key = reportType === "Supplier Wise"
          ? `${getText(row.supplier) || "Unknown Supplier"}|${getText(row.pNo) || "Unknown Purchase"}`
          : getText(row.pNo) || "Unknown Purchase";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(row);
      });
      add("column", "Item Code", "Item Name", "Purchase Qty", "Unit", "Item Rate", "CGST Amount", "SGST Amount", "Cess Amount", "VAT Amount", "Amount");
      let grandTotal = 0;
      groups.forEach((rows) => {
        const first = rows[0];
        const titleText = reportType === "Supplier Wise"
          ? `SUPPLIER: ${getText(first.supplier)}`
          : `PURCHASE NO: ${getText(first.pNo)} | PURCHASE DATE: ${date(first.pDate)} | SUPPLIER: ${getText(first.supplier)}`;
        add("group", titleText);
        add("meta", reportType === "Supplier Wise"
          ? `Purchase No: ${getText(first.pNo)} | Date: ${date(first.pDate)} | GST No: ${getText(first.gsTno)}`
          : `Purchase Type: ${getText(first.pType)} | Bill No: ${getText(first.billed)} | GST No: ${getText(first.gsTno)}`);
        let subtotal = 0;
        const countedDocuments = new Set<string>();
        rows.forEach((row) => {
          const amount = (Number(row.pItemQty) || 0) * (Number(row.pItemRate) || 0);
          add("data", row.itemCode, row.itemName, row.pItemQty, row.unit, money(row.pItemRate), money(row.cgsT_Amount), money(row.sgsT_Amount), money(row.cess_Amount), money(row.vaT_Amount), money(amount));
          const key = getText(row.pNo);
          if (key && !countedDocuments.has(key)) {
            countedDocuments.add(key);
            subtotal += getDocumentTotals(row).gross;
          }
        });
        grandTotal += subtotal;
        add("subtotal", "PURCHASE TOTAL", "", "", "", "", "", "", "", "", money(subtotal));
      });
      add("total", "GRAND TOTAL", "", "", "", "", "", "", "", money(grandTotal));
    }
    return { output, escapeHtml, title };
  };

  const handleExportExcel = () => {
    const { output, escapeHtml } = buildExportRows();
    const columnCount = Math.max(...output.map((row) => row.cells.length), 1);
    const rowsHtml = output.map(({ kind, cells }) => {
      const style = kind === "header"
        ? 'style="font-size:16pt;font-weight:bold;text-align:center;background:#ffffff"'
        : kind === "group"
          ? 'style="font-weight:bold;color:#28763a;background:#f5f5f5"'
          : kind === "meta"
            ? 'style="color:#28763a"'
            : kind === "column"
              ? 'style="font-weight:bold;color:#6e3030;background:#dedede"'
              : kind === "subtotal" || kind === "total"
                ? 'style="font-weight:bold;color:#7f3030;border-top:1px solid #555"'
                : "";
      const fullRow = ["header", "group", "meta"].includes(kind);
      return `<tr ${style}>${fullRow
        ? `<td colspan="${columnCount}">${escapeHtml(cells.join(" "))}</td>`
        : cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`;
    }).join("");
    const workbook = `<!doctype html><html><head><meta charset="utf-8"></head><body><table border="1" style="border-collapse:collapse;font-family:Arial;font-size:10pt">${rowsHtml}</table></body></html>`;
    const blob = new Blob(["\ufeff", workbook], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Direct_Purchase_${reportType.replace(/\s+/g, "_")}_${fromDate}_to_${toDate}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  const handleExportPdf = () => {
    const { output, title } = buildExportRows();
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const body: Array<{ content: string; colSpan?: number; styles?: Record<string, unknown> }[]> = [];
    let header: string[] = [];
    output.forEach(({ kind, cells }) => {
      if (kind === "header" || kind === "meta") return;
      if (kind === "column") {
        header = cells;
      } else if (kind === "group") {
        body.push([{ content: cells.join(" "), colSpan: Math.max(header.length, cells.length, 1), styles: { fontStyle: "bold", textColor: [40, 118, 58], fillColor: [245, 245, 245] } }]);
      } else if (kind === "subtotal" || kind === "total") {
        body.push(cells.map((content, index) => ({ content, styles: { fontStyle: "bold", textColor: [127, 48, 48], halign: index === 0 ? "left" : "right" } })));
      } else {
        body.push(cells.map((content) => ({ content })));
      }
    });
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(title, 14, 13);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`From ${formatDate(fromDate)} To ${formatDate(toDate)}`, 14, 19);
    autoTable(pdf, {
      startY: 23,
      head: header.length ? [header] : [],
      body: body as any,
      styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak", lineColor: [187, 187, 187], lineWidth: 0.1 },
      headStyles: { fillColor: [222, 222, 222], textColor: [110, 48, 48], fontStyle: "bold" },
      margin: { left: 10, right: 10 },
      didParseCell: (cellData: any) => {
        const rowKind = output[cellData.row.index + 2]?.kind;
        if (rowKind === "subtotal" || rowKind === "total") cellData.cell.styles.fontStyle = "bold";
      },
    });
    pdf.save(`Direct_Purchase_${reportType.replace(/\s+/g, "_")}_${fromDate}_to_${toDate}.pdf`);
    setExportMenuOpen(false);
  };

  const handlePrint = () => {
    const { output, escapeHtml, title } = buildExportRows();
    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) {
      alert("Please allow pop-ups to print this report.");
      return;
    }
    const columnCount = Math.max(...output.map((row) => row.cells.length), 1);
    const tableRows = output.filter(({ kind }) => kind !== "header" && kind !== "meta").map(({ kind, cells }) => {
      const fullRow = ["header", "group", "meta"].includes(kind);
      const rowClass = kind === "group" ? "group" : kind === "meta" ? "meta" : kind === "subtotal" ? "subtotal" : kind === "total" ? "total" : kind === "column" ? "column" : kind;
      return `<tr class="${rowClass}">${fullRow
        ? `<td colspan="${columnCount}">${cells.map(escapeHtml).join(" ")}</td>`
        : cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`;
    }).join("");
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><meta charset="utf-8"><style>
      @page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111;font-size:10px}
      .company{font-size:14px;font-weight:bold;margin-bottom:4px}.subtitle{font-size:12px;color:#7f3030;margin:12px 0;border-bottom:1px solid #777;padding-bottom:8px}
      table{width:100%;border-collapse:collapse;margin:0 0 12px}th,.column td{background:#dedede;color:#6e3030;text-align:left;font-weight:bold}
      td{padding:6px 7px;border-bottom:1px solid #bbb;vertical-align:top}tr{break-inside:avoid}
      .group td{color:#28763a;font-weight:bold;background:#f5f5f5;border-top:1px solid #777;padding-top:10px}.meta td{color:#28763a}
      .subtotal td,.total td{color:#7f3030;font-weight:bold;text-align:right}.subtotal td:first-child,.total td:first-child{text-align:left}.total td{border-top:2px solid #555}
      @media print{tr{break-inside:avoid}}
    </style></head><body><div class="company">Direct Purchase Report</div><div>Branch: ${escapeHtml(localStorage.getItem("branch") || "-")}</div>
      <div class="subtitle">${escapeHtml(title)} &nbsp; From ${escapeHtml(formatDate(fromDate))} To ${escapeHtml(formatDate(toDate))}</div>
      <table><tbody>${tableRows}</tbody></table><div style="margin-top:18px;font-size:9px">Printed on: ${new Date().toLocaleString("en-IN")}</div>
      <script>window.onload=function(){window.focus();window.print();};<\/script></body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <Header showNeworderButton={false} />
      <div className="flex-1 overflow-auto p-3 sm:p-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
            <FileBarChart className="text-indigo-600" size={21} />
            <h1 className="text-lg font-bold text-gray-800">Direct Purchase Report</h1>
          </div>

          <div className="p-4 border-b">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Report Type</label>
                <select value={reportType} onChange={(e) => {
                  setReportType(e.target.value as ReportType);
                  setSelectedSupplier("");
                  setSelectedItem("");
                  setSearch("");
                }} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500">
                  <option value="Regular Report">Regular Report</option>
                  <option value="Detailed">Detailed</option>
                  <option value="Supplier Wise">Supplier Wise</option>
                  <option value="Item Wise">Item Wise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                <input type="date" value={fromDate} max={toDate} onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                <input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
              </div>
              {reportType === "Supplier Wise" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Supplier</label>
                  <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500">
                    <option value="">All Suppliers</option>
                    {suppliers.map((supplier) => <option key={supplier.code} value={supplier.code}>{supplier.name}</option>)}
                  </select>
                </div>
              )}
              {reportType === "Item Wise" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Item</label>
                  <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500">
                    <option value="">All Items</option>
                    {items.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div>
              <h2 className="font-semibold text-gray-800">{reportType} Report</h2>
              <p className="text-xs text-gray-500 mt-1">{displayedRows.length} row(s)</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handlePrint} disabled={loading || !displayedRows.length}
                className="inline-flex items-center justify-center gap-2 rounded bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-50">
                <Printer size={16} /> Print
              </button>
              <div className="relative">
                <button type="button" onClick={() => setExportMenuOpen((open) => !open)} disabled={loading || !displayedRows.length}
                  className="inline-flex items-center justify-center gap-2 rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
                  <FileDown size={16} /> Export <ChevronDown size={15} />
                </button>
                {exportMenuOpen && (
                  <div className="absolute right-0 top-full z-30 mt-1 min-w-36 overflow-hidden rounded border border-gray-200 bg-white py-1 shadow-lg">
                    <button type="button" onClick={handleExportPdf} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"><FileDown size={15} /> PDF</button>
                    <button type="button" onClick={handleExportExcel} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"><FileSpreadsheet size={15} /> Excel</button>
                  </div>
                )}
              </div>
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search report..."
                  className="w-full rounded border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500" />
              </div>
            </div>
          </div>

          <div className="overflow-auto max-h-[calc(100vh-300px)]">
            <table className="min-w-full text-sm text-left">
              <thead className="sticky top-0 z-10 bg-indigo-700 text-white">
                <tr>
                  {columns.length ? columns.map((column) => (
                    <th key={column} onClick={() => handleSort(column)}
                      className="whitespace-nowrap px-4 py-3 font-semibold cursor-pointer select-none hover:bg-indigo-800">
                      <div className="flex items-center gap-2">
                        <span>{formatHeader(column, headerLabels)}</span>
                        {sortColumn === column ? (sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-60" />}
                      </div>
                    </th>
                  )) : <th className="px-4 py-3">Report Details</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={Math.max(columns.length, 1)} className="px-4 py-10 text-center text-gray-500">Loading report...</td></tr>
                ) : error ? (
                  <tr><td colSpan={Math.max(columns.length, 1)} className="px-4 py-10 text-center text-red-600">{error}</td></tr>
                ) : sortedRows.length ? sortedRows.map((row, index) => (
                  <tr key={`${getText(row.pNo)}-${getText(row.itemCode)}-${index}`} className={index % 2 === 0 ? "border-b bg-white hover:bg-indigo-50" : "border-b bg-slate-50 hover:bg-indigo-50"}>
                    {columns.map((column) => {
                      const value = row[column];
                      const displayValue = column === "pDate"
                        ? formatDate(value)
                        : moneyFields.has(column) && value != null && value !== ""
                          ? formatAmount(Number(value) || 0)
                          : value == null || value === "" ? "-" : String(value);
                      return <td key={column} className="whitespace-nowrap px-4 py-3 text-gray-700 align-middle">{displayValue}</td>;
                    })}
                  </tr>
                )) : (
                  <tr><td colSpan={Math.max(columns.length, 1)} className="px-4 py-10 text-center text-gray-500">No report data available for the selected filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-3 px-4 py-3 border-t bg-gray-50 text-sm text-gray-600">
            <span>From {fromDate} to {toDate}</span>
            <span>Documents: {new Set(data.map((row) => getText(row.pNo)).filter(Boolean)).size}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
