import { useEffect, useMemo, useState } from "react";
import { FileBarChart, FileSpreadsheet, Printer, Search } from "lucide-react";
import Header from "../components/Header";
import Loader from "../components/Loader";
import {
  getSupplierList,
  getSupplierPaymentReport,
} from "../api/services/products.service";
import { formatHeader } from "../utils";

type Supplier = { supCode: string | number; supName: string };
type ReportRow = Record<string, any>;
const text = (value: any) => String(value ?? "").trim();
const dateInput = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const getRows = (response: any): ReportRow[] => {
  // The endpoint may return the payment rows directly or wrap them in one or
  // more API envelope objects (for example { success, data: [...] }).
  const candidates = [
    response,
    response?.data,
    response?.details,
    response?.result,
    response?.items,
    response?.data?.data,
    response?.data?.details,
    response?.data?.result,
    response?.data?.items,
    response?.data?.data?.details,
  ];
  return candidates.find(Array.isArray) || [];
};

export default function SupplierPaymentReport() {
  const today = dateInput(new Date());
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [data, setData] = useState<ReportRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const branchCode = localStorage.getItem("branch") || "";

  useEffect(() => {
    let active = true;
    getSupplierList(branchCode).then((response) => {
      const raw = response?.data;
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      if (active) setSuppliers(list);
    }).catch((err: any) => {
      console.error("Failed to load suppliers:", err);
      if (active) setError(err.response?.data?.message || "Failed to load suppliers.");
    });
    return () => { active = false; };
  }, [branchCode]);

  useEffect(() => {
    if (!selectedSupplier) {
      setData([]);
      setError("");
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    getSupplierPaymentReport(selectedSupplier, branchCode)
      .then((response) => {
        if (!active) return;
        const rows = getRows(response);
        setData(rows);
        if (!rows.length) setError(response?.message || "No supplier payment data available.");
      })
      .catch((err: any) => {
        if (!active) return;
        setData([]);
        setError(err.response?.data?.message || "Failed to load supplier payment report.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedSupplier, branchCode]);

  const dateFilteredRows = useMemo(() => data.filter((row) => {
    const rawDate = row.paymentDate;
    if (!rawDate) return false;
    // Keep the calendar date from ISO timestamps as written by the API;
    // converting through Date can shift it across days in some time zones.
    const isoDate = String(rawDate).match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    const parsed = isoDate ? null : new Date(rawDate);
    if (!isoDate && (!parsed || Number.isNaN(parsed.getTime()))) return false;
    const rowDate = isoDate || dateInput(parsed as Date);
    return (!fromDate || rowDate >= fromDate) && (!toDate || rowDate <= toDate);
  }), [data, fromDate, toDate]);
  const displayedRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? dateFilteredRows.filter((row) => Object.values(row).some((value) => text(value).toLowerCase().includes(query))) : dateFilteredRows;
  }, [dateFilteredRows, search]);
  const columns = useMemo(() => displayedRows.length ? Object.keys(displayedRows[0]).filter((key) => key !== "branch_Code") : [], [displayedRows]);
  const supplierName = suppliers.find((supplier) => String(supplier.supCode) === selectedSupplier)?.supName || "";

  const escapeHtml = (value: any) => text(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const handlePrint = () => {
    if (!displayedRows.length) return;
    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) { alert("Please allow pop-ups to print this report."); return; }
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Supplier Payment Report</title><style>body{font-family:Arial,sans-serif;padding:20px;font-size:11px}h2{text-align:center}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:7px;text-align:left}th{background:#dedede}@page{size:landscape;margin:10mm}</style></head><body><h2>Supplier Payment Report</h2><p>Branch: ${escapeHtml(branchCode || "-")}<br/>Supplier: ${escapeHtml(supplierName || "-")}<br/>From: ${fromDate} &nbsp;&nbsp; To: ${toDate}</p><table><thead><tr>${columns.map((col) => `<th>${escapeHtml(formatHeader(col, {}))}</th>`).join("")}</tr></thead><tbody>${displayedRows.map((row) => `<tr>${columns.map((col) => `<td>${escapeHtml(row[col] ?? "-")}</td>`).join("")}</tr>`).join("")}</tbody></table><script>window.onload=function(){window.focus();window.print();};</script></body></html>`);
    printWindow.document.close();
  };
  const handleExport = () => {
    if (!displayedRows.length) return;
    const table = `<table border="1"><thead><tr>${columns.map((col) => `<th>${escapeHtml(formatHeader(col, {}))}</th>`).join("")}</tr></thead><tbody>${displayedRows.map((row) => `<tr>${columns.map((col) => `<td>${escapeHtml(row[col] ?? "-")}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    const blob = new Blob(["\ufeff", table], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Supplier_Payment_Report_${selectedSupplier}_${fromDate}_${toDate}.xls`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  };

  return <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
    {loading && <Loader />}
    <Header showNeworderButton={false} />
    <div className="flex-1 overflow-auto p-3 sm:p-5"><div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50"><FileBarChart className="text-indigo-600" size={21} /><h1 className="text-lg font-bold text-gray-800">Supplier Payment Report</h1></div>
      <div className="p-4 border-b"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Supplier</label><select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"><option value="">Select Supplier</option>{suppliers.map((supplier) => <option key={supplier.supCode} value={supplier.supCode}>{supplier.supCode} - {supplier.supName}</option>)}</select></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">From Date</label><input type="date" value={fromDate} max={toDate} onChange={(e) => setFromDate(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" /></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">To Date</label><input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" /></div>
      </div></div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4"><h2 className="font-semibold text-gray-800">Supplier Payment Details{supplierName ? ` - ${supplierName}` : ""}</h2><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={handlePrint} disabled={loading || !displayedRows.length} className="inline-flex items-center gap-2 rounded bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-50"><Printer size={16} />Print</button><button type="button" onClick={handleExport} disabled={loading || !displayedRows.length} className="inline-flex items-center gap-2 rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><FileSpreadsheet size={16} />Excel</button><div className="relative w-full sm:w-72"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search supplier payments..." className="w-full rounded border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500" /></div></div></div>
      {error && <div className="mx-4 mb-3 rounded bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">{error}</div>}
      <div className="overflow-auto max-h-[calc(100vh-340px)]"><table className="min-w-full text-sm text-left"><thead className="sticky top-0 z-10 bg-indigo-700 text-white"><tr>{columns.length ? columns.map((col) => <th key={col} className="whitespace-nowrap px-4 py-3 font-semibold">{formatHeader(col, {})}</th>) : <th className="px-4 py-3">Report Details</th>}</tr></thead><tbody>{loading ? <tr><td colSpan={Math.max(columns.length, 1)} className="px-4 py-10 text-center text-gray-500">Loading supplier payment report...</td></tr> : displayedRows.length ? displayedRows.map((row, index) => <tr key={index} className={index % 2 === 0 ? "border-b bg-white hover:bg-indigo-50" : "border-b bg-slate-50 hover:bg-indigo-50"}>{columns.map((col) => <td key={col} className="whitespace-nowrap px-4 py-3 text-gray-700">{row[col] == null || row[col] === "" ? "-" : String(row[col])}</td>)}</tr>) : <tr><td colSpan={Math.max(columns.length, 1)} className="px-4 py-10 text-center text-gray-500">{selectedSupplier ? "No report data available for the selected dates." : "Select a supplier to view payment details."}</td></tr>}</tbody></table></div>
      <div className="flex justify-between items-center gap-3 px-4 py-3 border-t bg-gray-50"><span className="text-sm text-gray-600">Total Records: {displayedRows.length}</span><span className="text-xs text-gray-500">Supplier Payment Report</span></div>
    </div></div>
  </div>;
}
