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
import { getGRNReport } from "../api/services/products.service";
import { formatHeader } from "../utils";

type ReportType = "Regular Report" | "Detailed" | "Supplier Wise" | "Item Wise";
type ReportRow = Record<string, unknown>;

const getText = (value: unknown) => String(value ?? "").trim();

const headers: Record<string, string> = {
  grnNo: "GRN No",
  grnDate: "GRN Date",
  grnTime: "GRN Time",
  poNo: "PO No",
  poDate: "PO Date",
  supCode: "Supplier Code",
  supplier: "Supplier",
  billed: "Bill No",
  grnStatus: "GRN Status",
  storeID: "Store ID",
  storeId: "Store ID",
  itemCode: "Item Code",
  itemName: "Item Name",
  pItemQty: "GRN Qty",
  poItemRate: "Item Rate",
  unit: "Unit",
  orderBy: "Order By",
  gsTno: "GST No",
  cgsT_Per: "CGST %",
  cgsT_Amount: "CGST Amount",
  sgsT_Per: "SGST %",
  sgsT_Amount: "SGST Amount",
  cess_Per: "Cess %",
  cess_Amount: "Cess Amount",
  vaT_Per: "VAT %",
  vaT_Amount: "VAT Amount",
  missChargeAmount: "Misc. Charge Amount",
  totalamount: "Total Amount",
  totalTaxAmount: "Total Tax Amount",
  grossAmount: "Gross Amount",
};

const formatAmount = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value: unknown) => {
  if (!value) return "-";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime())
    ? getText(value)
    : parsed.toLocaleDateString("en-IN");
};

export default function Grnreport() {
  const today = new Date();

  const formattedToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const [reportType, setReportType] = useState<ReportType>("Regular Report");
  const [fromDate, setFromDate] = useState(formattedToday);
  const [toDate, setToDate] = useState(formattedToday);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<ReportRow[]>([]);
  const [summaries, setSummaries] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch the report automatically when dates change.
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

        const branchcode = localStorage.getItem("branch") || "";

        const formatDateForApi = (date: string) => {
          const [year, month, day] = date.split("-");
          return `${month}/${day}/${year}`;
        };

        const response = await getGRNReport(
          formatDateForApi(fromDate),
          formatDateForApi(toDate),
          branchcode,
        );

        if (cancelled) return;

        // Support Axios/nested response wrappers: { details: [...], summaries: [...] }
        const payloadCandidates = [
          response,
          response?.data,
          response?.data?.data,
        ];
        const reportPayload = payloadCandidates.find(
          (candidate) => candidate && Array.isArray(candidate.details),
        );

        const summaryRows: ReportRow[] = Array.isArray(reportPayload?.summaries)
          ? reportPayload.summaries
          : Array.isArray(response?.data?.summaries)
            ? response.data.summaries
            : Array.isArray(response?.data?.data?.summaries)
              ? response.data.data.summaries
              : [];
        setSummaries(summaryRows);

        const rows: ReportRow[] = Array.isArray(reportPayload?.details)
          ? reportPayload.details
          : Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.data?.data)
                ? response.data.data
                : [];

        setData(rows);
        setSelectedSupplier("");
        setSelectedItem("");
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch GRN Report:", err);
          setData([]);
          setSummaries([]);
          setError("Failed to load the report. Please try changing the dates.");
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

  // Supplier options from actual API response.
  const suppliers = useMemo(() => {
    const unique = new Map<string, string>();

    data.forEach((row) => {
      const code = getText(row.supCode);
      const name = getText(row.supplier);

      if (name) {
        unique.set(code || name, name);
      }
    });

    return Array.from(unique.entries()).map(([code, name]) => ({
      code,
      name,
    }));
  }, [data]);

  // Item options from actual API response.
  const items = useMemo(() => {
    const unique = new Map<string, string>();

    data.forEach((row) => {
      const code = getText(row.itemCode);
      const name = getText(row.itemName);

      if (name) unique.set(code || name, name);
    });

    return Array.from(unique.entries()).map(([code, name]) => ({
      code,
      name,
    }));
  }, [data]);

  // Summary lookup by documentNo (matching grnNo)
  const summaryByGrn = useMemo(() => {
    const map = new Map<string, ReportRow>();
    summaries.forEach((summary) => {
      const docNo = getText(summary.documentNo);
      if (docNo) map.set(docNo, summary);
    });
    return map;
  }, [summaries]);

  const getGrnSummary = (grnNo: unknown, fallback?: ReportRow) => {
    const summary = summaryByGrn.get(getText(grnNo));
    return {
      purchase:
        Number(
          summary?.totalAmount ??
            fallback?.totalamount ??
            fallback?.totalAmount,
        ) || 0,
      tax:
        Number(
          summary?.totalTaxAmount ??
            fallback?.totalTaxAmount ??
            fallback?.taxAmount,
        ) || 0,
      misc:
        Number(summary?.missChargeAmount ?? fallback?.missChargeAmount) || 0,
      gross: Number(summary?.grossAmount ?? fallback?.grossAmount) || 0,
    };
  };

  // Apply supplier/item filters and sort details.
  const filteredRows = useMemo(() => {
    let rows = [...data];

    if (reportType === "Supplier Wise" && selectedSupplier) {
      rows = rows.filter((row) => getText(row.supCode) === selectedSupplier);
    }

    if (reportType === "Item Wise" && selectedItem) {
      rows = rows.filter((row) => getText(row.itemCode) === selectedItem);
    }

    if (reportType === "Supplier Wise") {
      rows.sort((a, b) => {
        const supplierCompare = getText(a.supplier).localeCompare(
          getText(b.supplier),
          undefined,
          { sensitivity: "base" },
        );
        if (supplierCompare !== 0) return supplierCompare;
        return Number(a.grnNo) - Number(b.grnNo);
      });
    } else if (reportType === "Item Wise") {
      rows.sort((a, b) => {
        const itemCompare = getText(a.itemName).localeCompare(
          getText(b.itemName),
          undefined,
          { sensitivity: "base" },
        );
        if (itemCompare !== 0) return itemCompare;
        return Number(a.grnNo) - Number(b.grnNo);
      });
    } else {
      rows.sort((a, b) => Number(a.grnNo) - Number(b.grnNo));
    }

    return rows;
  }, [data, reportType, selectedSupplier, selectedItem]);

  // Item Wise rows sorted by item then GRN number (omitting document totals from item lines)
  const itemWiseRows = useMemo(() => {
    const docTotalFields = new Set([
      "totalamount",
      "totalAmount",
      "totalTaxAmount",
      "taxAmount",
      "grossAmount",
    ]);

    return filteredRows
      .map(
        (row) =>
          Object.fromEntries(
            Object.entries(row).filter(([key]) => !docTotalFields.has(key)),
          ) as ReportRow,
      )
      .sort((a, b) => {
        const itemCompare = getText(a.itemName).localeCompare(
          getText(b.itemName),
          undefined,
          { sensitivity: "base" },
        );
        if (itemCompare !== 0) return itemCompare;
        return Number(a.grnNo) - Number(b.grnNo);
      });
  }, [filteredRows]);

  // Regular Report: 1 row per GRN
  const regularReportRows = useMemo(() => {
    const detailsByGrn = new Map<string, ReportRow>();
    data.forEach((row) => {
      const grnNo = getText(row.grnNo);
      if (grnNo && !detailsByGrn.has(grnNo)) detailsByGrn.set(grnNo, row);
    });

    return Array.from(detailsByGrn.entries())
      .map(([grnNo, row]) => {
        const summary = summaryByGrn.get(grnNo);
        return {
          grnNo: row.grnNo,
          grnDate: row.grnDate,
          poNo: row.poNo,
          poDate: row.poDate,
          supplier: row.supplier,
          billed: row.billed,
          orderBy: row.orderBy,
          gsTno: row.gsTno,
          totalamount:
            summary?.totalAmount ?? row.totalamount ?? row.totalAmount,
          totalTaxAmount:
            summary?.totalTaxAmount ?? row.totalTaxAmount ?? row.taxAmount,
          missChargeAmount: summary?.missChargeAmount ?? row.missChargeAmount,
          grossAmount: summary?.grossAmount ?? row.grossAmount,
        } as ReportRow;
      })
      .sort((a, b) => Number(a.grnNo) - Number(b.grnNo));
  }, [data, summaryByGrn]);

  // Detailed rows omit document-level totals so they don't repeat on each item row
  const detailReportRows = useMemo(() => {
    const docTotalFields = new Set([
      "totalamount",
      "totalAmount",
      "totalTaxAmount",
      "taxAmount",
      "grossAmount",
    ]);

    return filteredRows.map(
      (row) =>
        Object.fromEntries(
          Object.entries(row).filter(([key]) => !docTotalFields.has(key)),
        ) as ReportRow,
    );
  }, [filteredRows]);

  // Current report rows
  const reportRows = useMemo(() => {
    if (reportType === "Regular Report") return regularReportRows;
    if (reportType === "Item Wise") return itemWiseRows;
    return detailReportRows;
  }, [reportType, regularReportRows, itemWiseRows, detailReportRows]);

  // Search filter
  const displayedRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return reportRows;

    return reportRows.filter((row) =>
      Object.values(row).some((value) =>
        getText(value).toLowerCase().includes(query),
      ),
    );
  }, [reportRows, search]);

  // Display columns (hide internal ids/codes like itemCode, supCode, storeID, grnStatus)
  const columns = useMemo(
    () =>
      displayedRows.length
        ? Object.keys(displayedRows[0]).filter(
            (column) =>
              column !== "itemCode" &&
              column !== "supCode" &&
              column !== "storeID" &&
              column !== "storeId" &&
              column !== "grnStatus",
          )
        : [],
    [displayedRows],
  );

  const sortedRows = useMemo(() => {
    if (!sortColumn) return displayedRows;

    return [...displayedRows].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue == null || aValue === "") return 1;
      if (bValue == null || bValue === "") return -1;

      let comparison = 0;

      const aNumber = Number(aValue);
      const bNumber = Number(bValue);

      if (
        String(aValue).trim() !== "" &&
        String(bValue).trim() !== "" &&
        Number.isFinite(aNumber) &&
        Number.isFinite(bNumber)
      ) {
        comparison = aNumber - bNumber;
      } else {
        comparison = String(aValue).localeCompare(String(bValue), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [displayedRows, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Detailed view row spans for merged GRN header info
  const grnRowSpans = useMemo(() => {
    const spans: Record<number, number> = {};
    const mergedColumns = new Set([
      "grnNo",
      "grnDate",
      "grnTime",
      "poNo",
      "poDate",
      "supplier",
      "billed",
      "orderBy",
      "gsTno",
    ]);

    if (reportType !== "Detailed")
      return { spans, mergedColumns: new Set<string>() };

    let index = 0;
    while (index < displayedRows.length) {
      const grnNumber = getText(displayedRows[index].grnNo);
      let end = index + 1;
      while (
        end < displayedRows.length &&
        getText(displayedRows[end].grnNo) === grnNumber
      ) {
        end++;
      }
      spans[index] = end - index;
      for (let i = index + 1; i < end; i++) spans[i] = 0;
      index = end;
    }
    return { spans, mergedColumns };
  }, [displayedRows, reportType]);

  const spanData = grnRowSpans;

  // Build grouped export rows for PDF, Excel, and Print
  const buildExportRows = () => {
    const escapeHtml = (value: unknown) =>
      getText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const sourceRows = filteredRows.filter((row) => {
      const query = search.trim().toLowerCase();
      return (
        !query ||
        Object.values(row).some((value) =>
          getText(value).toLowerCase().includes(query),
        )
      );
    });

    const money = (value: unknown) => {
      const amount = Number(value);
      return Number.isFinite(amount) ? formatAmount(amount) : "-";
    };

    const date = (value: unknown) => {
      if (!value) return "-";
      const parsed = new Date(String(value));
      return Number.isNaN(parsed.getTime())
        ? getText(value)
        : parsed.toLocaleDateString("en-GB");
    };

    const output: Array<{
      kind:
        | "header"
        | "group"
        | "meta"
        | "column"
        | "data"
        | "subtotal"
        | "total";
      cells: string[];
    }> = [];

    const add = (kind: (typeof output)[number]["kind"], ...cells: unknown[]) =>
      output.push({
        kind,
        cells: cells.map((value) =>
          value == null || value === "" ? "-" : String(value),
        ),
      });

    add(
      "header",
      `GRN Report${reportType === "Regular Report" ? "" : ` (${reportType})`}`,
    );
    add("meta", `From ${fromDate} To ${toDate}`);

    if (reportType === "Regular Report") {
      const grnMap = new Map<string, ReportRow>();
      sourceRows.forEach((row) => {
        const key = getText(row.grnNo);
        if (key && !grnMap.has(key)) grnMap.set(key, row);
      });

      add(
        "column",
        "GRN No.",
        "GRN Date",
        "PO No.",
        "PO Date",
        "Supplier",
        "Bill No.",
        "Order By",
        "GST No.",
        "Tax Amount",
        "Total Amount",
        "Gross Amount",
      );

      let taxTotal = 0,
        amountTotal = 0,
        grossTotal = 0;

      Array.from(grnMap.values())
        .sort((a, b) => Number(a.grnNo) - Number(b.grnNo))
        .forEach((row) => {
          const totals = getGrnSummary(row.grnNo, row);
          taxTotal += totals.tax;
          amountTotal += totals.purchase;
          grossTotal += totals.gross;
          add(
            "data",
            row.grnNo,
            date(row.grnDate),
            row.poNo,
            date(row.poDate),
            row.supplier,
            row.billed,
            row.orderBy,
            row.gsTno,
            money(totals.tax),
            money(totals.purchase),
            money(totals.gross),
          );
        });

      add(
        "total",
        "GRAND TOTAL",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        money(taxTotal),
        money(amountTotal),
        money(grossTotal),
      );
    } else if (reportType === "Item Wise") {
      add(
        "column",
        "GRN No.",
        "GRN Date",
        "PO No.",
        "Supplier",
        "Order By",
        "GRN Qty",
        "Unit",
        "Item Rate",
        "Amount",
      );

      const groups = new Map<string, ReportRow[]>();
      sourceRows.forEach((row) => {
        const key = `${getText(row.itemCode)}|${getText(row.itemName)}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(row);
      });

      let grandTotal = 0;
      Array.from(groups.entries())
        .sort((a, b) =>
          getText(a[1][0]?.itemName).localeCompare(getText(b[1][0]?.itemName)),
        )
        .forEach(([, rows]) => {
          const first = rows[0];
          add(
            "group",
            `(${getText(first.itemCode)}) ${getText(first.itemName)}`,
          );
          let subtotal = 0;
          rows.forEach((row) => {
            const amount =
              (Number(row.pItemQty) || 0) * (Number(row.poItemRate) || 0);
            subtotal += amount;
            add(
              "data",
              row.grnNo,
              date(row.grnDate),
              row.poNo,
              row.supplier,
              row.orderBy,
              row.pItemQty,
              row.unit,
              money(row.poItemRate),
              money(amount),
            );
          });
          grandTotal += subtotal;
          add(
            "subtotal",
            "SUB TOTAL",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            money(subtotal),
          );
        });

      add(
        "total",
        "GRAND TOTAL",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        money(grandTotal),
      );
    } else {
      // Detailed and Supplier Wise
      const groupMap = new Map<string, ReportRow[]>();
      sourceRows.forEach((row) => {
        const key =
          reportType === "Supplier Wise"
            ? `${getText(row.supplier) || "Unknown Supplier"}|${getText(row.grnNo) || "Unknown GRN"}`
            : getText(row.grnNo) || "Unknown GRN";
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key)!.push(row);
      });

      add(
        "column",
        "Item Code",
        "Item Name",
        "GRN Qty",
        "Unit",
        "Rate",
        "CGST Amount",
        "SGST Amount",
        "Amount",
      );

      let grandTotal = 0;
      Array.from(groupMap.entries()).forEach(([_groupName, rows]) => {
        const first = rows[0];
        add(
          "group",
          reportType === "Supplier Wise"
            ? `SUPPLIER: ${getText(first.supplier)}`
            : `GRN NO: ${getText(first.grnNo)} | GRN DATE: ${date(first.grnDate)} | PO NO: ${getText(first.poNo)} | SUPPLIER: ${getText(first.supplier)}`,
        );
        add(
          "meta",
          reportType === "Supplier Wise"
            ? `GRN No: ${getText(first.grnNo)} | Date: ${date(first.grnDate)} | PO No: ${getText(first.poNo)} | Bill No: ${getText(first.billed)} | GST No: ${getText(first.gsTno)}`
            : `Bill No: ${getText(first.billed)} | Order By: ${getText(first.orderBy)} | GST No: ${getText(first.gsTno)}`,
        );

        const seenGrn = new Set<string>();
        let subtotal = 0;
        rows.forEach((row) => {
          const amount =
            (Number(row.pItemQty) || 0) * (Number(row.poItemRate) || 0);
          add(
            "data",
            row.itemCode,
            row.itemName,
            row.pItemQty,
            row.unit,
            money(row.poItemRate),
            money(row.cgsT_Amount),
            money(row.sgsT_Amount),
            money(amount),
          );

          const grnKey = getText(row.grnNo);
          if (grnKey && !seenGrn.has(grnKey)) {
            seenGrn.add(grnKey);
            subtotal += getGrnSummary(grnKey, row).gross;
          }
        });
        grandTotal += subtotal;
        add("subtotal", "GRN TOTAL", "", "", "", "", "", "", money(subtotal));
      });

      add("total", "GRAND TOTAL", "", "", "", "", "", "", money(grandTotal));
    }

    return { output, escapeHtml };
  };

  // Export Excel
  const handleExportExcel = () => {
    const { output, escapeHtml } = buildExportRows();
    const columnCount = Math.max(...output.map((row) => row.cells.length), 1);
    const rowsHtml = output
      .map(({ kind, cells }) => {
        const style =
          kind === "header"
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
        return `<tr ${style}>${
          fullRow
            ? `<td colspan="${columnCount}">${escapeHtml(cells.join(" "))}</td>`
            : cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")
        }</tr>`;
      })
      .join("");

    const workbook = `<!doctype html><html><head><meta charset="utf-8"></head><body><table border="1" style="border-collapse:collapse;font-family:Arial;font-size:10pt">${rowsHtml}</table></body></html>`;
    const blob = new Blob(["\ufeff", workbook], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GRN_Report_${reportType.replace(/\s+/g, "_")}_${fromDate}_to_${toDate}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  // Export PDF
  const handleExportPdf = () => {
    const { output } = buildExportRows();
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const body: Array<
      { content: string; colSpan?: number; styles?: Record<string, unknown> }[]
    > = [];
    let header: string[] = [];

    output.forEach(({ kind, cells }) => {
      if (kind === "header" || kind === "meta") return;
      if (kind === "column") {
        header = cells;
      } else if (kind === "group") {
        body.push([
          {
            content: cells.join(" "),
            colSpan: Math.max(header.length, cells.length, 1),
            styles: {
              fontStyle: "bold",
              textColor: [40, 118, 58],
              fillColor: [245, 245, 245],
            },
          },
        ]);
      } else if (kind === "subtotal" || kind === "total") {
        body.push(
          cells.map((content, index) => ({
            content,
            styles: {
              fontStyle: "bold",
              textColor: [127, 48, 48],
              halign: index === 0 ? "left" : "right",
            },
          })),
        );
      } else {
        body.push(cells.map((content) => ({ content })));
      }
    });

    const title = `GRN Report${reportType === "Regular Report" ? "" : ` (${reportType})`}`;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(title, 14, 13);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`From ${fromDate} To ${toDate}`, 14, 19);

    autoTable(pdf, {
      startY: 23,
      head: header.length ? [header] : [],
      body: body as any,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: "linebreak",
        lineColor: [187, 187, 187],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [222, 222, 222],
        textColor: [110, 48, 48],
        fontStyle: "bold",
      },
      margin: { left: 10, right: 10 },
      didParseCell: (data: any) => {
        const rowKind = output[data.row.index + 2]?.kind;
        if (rowKind === "subtotal" || rowKind === "total")
          data.cell.styles.fontStyle = "bold";
      },
    });

    pdf.save(
      `GRN_Report_${reportType.replace(/\s+/g, "_")}_${fromDate}_to_${toDate}.pdf`,
    );
    setExportMenuOpen(false);
  };

  // Print
  const handlePrint = () => {
    const escapeHtml = (value: unknown) =>
      getText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const dateLabel = (value: string) => {
      if (!value) return "";
      const [year, month, day] = value.split("-");
      return `${day}/${month}/${year}`;
    };

    const dateValue = (value: unknown) => {
      if (!value) return "-";
      const parsed = new Date(String(value));
      return Number.isNaN(parsed.getTime())
        ? escapeHtml(value)
        : parsed.toLocaleDateString("en-GB");
    };

    const money = (value: unknown) => {
      const amount = Number(value);
      return Number.isFinite(amount) ? formatAmount(amount) : "-";
    };

    const cell = (value: unknown, className = "") =>
      `<td class="${className}">${escapeHtml(value == null || value === "" ? "-" : value)}</td>`;

    const moneyCell = (value: unknown) =>
      `<td class="number">${money(value)}</td>`;

    const sourceRows = filteredRows.filter((row) => {
      const query = search.trim().toLowerCase();
      return (
        !query ||
        Object.values(row).some((value) =>
          getText(value).toLowerCase().includes(query),
        )
      );
    });

    const pageTitle =
      reportType === "Regular Report"
        ? "GRN Report"
        : `GRN Report (${reportType})`;

    let tableContent = "";
    let grandTotal = 0;

    if (reportType === "Regular Report") {
      const grnMap = new Map<string, ReportRow>();
      sourceRows.forEach((row) => {
        const key = getText(row.grnNo);
        if (key && !grnMap.has(key)) grnMap.set(key, row);
      });

      const rows = Array.from(grnMap.values()).sort(
        (a, b) => Number(a.grnNo) - Number(b.grnNo),
      );

      const totalAmount = rows.reduce(
        (sum, row) => sum + getGrnSummary(row.grnNo, row).purchase,
        0,
      );
      const totalTax = rows.reduce(
        (sum, row) => sum + getGrnSummary(row.grnNo, row).tax,
        0,
      );
      const totalGross = rows.reduce(
        (sum, row) => sum + getGrnSummary(row.grnNo, row).gross,
        0,
      );

      tableContent = `<table><thead><tr><th>GRN No.</th><th>GRN Date</th><th>PO No.</th><th>PO Date</th><th>Supplier</th><th>Bill No.</th><th>Order By</th><th>GST No.</th><th>Tax Amount</th><th>Total Amount</th><th>Gross Amount</th></tr></thead><tbody>${rows
        .map((row) => {
          const totals = getGrnSummary(row.grnNo, row);
          return `<tr>${cell(row.grnNo)}${cell(dateValue(row.grnDate))}${cell(row.poNo)}${cell(dateValue(row.poDate))}${cell(row.supplier)}${cell(row.billed)}${cell(row.orderBy)}${cell(row.gsTno)}${moneyCell(totals.tax)}${moneyCell(totals.purchase)}${moneyCell(totals.gross)}</tr>`;
        })
        .join(
          "",
        )}<tr class="total"><td colspan="8">GRAND TOTAL</td>${moneyCell(totalTax)}${moneyCell(totalAmount)}${moneyCell(totalGross)}</tr></tbody></table>`;
    } else if (reportType === "Item Wise") {
      const groups = new Map<string, ReportRow[]>();
      sourceRows.forEach((row) => {
        const key = `${getText(row.itemCode)}|${getText(row.itemName)}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(row);
      });

      tableContent = `<table><thead><tr><th>GRN No.</th><th>GRN Date</th><th>PO No.</th><th>Supplier</th><th>Order By</th><th>GRN Qty</th><th>Unit</th><th>Item Rate</th><th>Amount</th></tr></thead><tbody>${Array.from(
        groups.entries(),
      )
        .sort((a, b) =>
          getText(a[1][0]?.itemName).localeCompare(getText(b[1][0]?.itemName)),
        )
        .map(([, rows]) => {
          const first = rows[0];
          const subtotal = rows.reduce(
            (sum, row) =>
              sum + (Number(row.pItemQty) || 0) * (Number(row.poItemRate) || 0),
            0,
          );
          grandTotal += subtotal;
          return `<tr class="group"><td colspan="9">(${escapeHtml(first.itemCode)}) &nbsp; ${escapeHtml(first.itemName)}</td></tr>${rows.map((row) => `<tr>${cell(row.grnNo)}${cell(dateValue(row.grnDate))}${cell(row.poNo)}${cell(row.supplier)}${cell(row.orderBy)}${cell(row.pItemQty, "number")}${cell(row.unit)}${moneyCell(row.poItemRate)}${moneyCell((Number(row.pItemQty) || 0) * (Number(row.poItemRate) || 0))}</tr>`).join("")}<tr class="subtotal"><td colspan="8">SUB TOTAL</td>${moneyCell(subtotal)}</tr>`;
        })
        .join(
          "",
        )}<tr class="total"><td colspan="8">GRAND TOTAL</td>${moneyCell(grandTotal)}</tr></tbody></table>`;
    } else {
      const groupMap = new Map<string, ReportRow[]>();
      sourceRows.forEach((row) => {
        const key =
          reportType === "Supplier Wise"
            ? `${getText(row.supplier) || "Unknown Supplier"}|${getText(row.grnNo) || "Unknown GRN"}`
            : getText(row.grnNo) || "Unknown GRN";
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key)!.push(row);
      });

      tableContent =
        Array.from(groupMap.entries())
          .map(([groupName, rows]) => {
            const first = rows[0];
            const uniqueGrnRows = new Map<string, ReportRow>();
            rows.forEach((row) => {
              const key = getText(row.grnNo);
              if (key && !uniqueGrnRows.has(key)) uniqueGrnRows.set(key, row);
            });
            const subtotal = Array.from(uniqueGrnRows.values()).reduce(
              (sum, row) => sum + getGrnSummary(row.grnNo, row).gross,
              0,
            );
            grandTotal += subtotal;
            const sectionTitle =
              reportType === "Supplier Wise"
                ? `SUPPLIER: ${escapeHtml(groupName)}`
                : `GRN NO: ${escapeHtml(first.grnNo)} &nbsp;&nbsp; GRN DATE: ${dateValue(first.grnDate)} &nbsp;&nbsp; PO NO: ${escapeHtml(first.poNo)} &nbsp;&nbsp; SUPPLIER: ${escapeHtml(first.supplier)}`;
            return `<tr class="group"><td colspan="8">${sectionTitle}</td></tr><tr class="meta"><td colspan="8">${reportType === "Supplier Wise" ? `GRN No: ${escapeHtml(first.grnNo)} &nbsp;&nbsp; Date: ${dateValue(first.grnDate)} &nbsp;&nbsp; PO No: ${escapeHtml(first.poNo)} &nbsp;&nbsp; Bill No: ${escapeHtml(first.billed)} &nbsp;&nbsp; GST No: ${escapeHtml(first.gsTno)}` : `Bill No: ${escapeHtml(first.billed)} &nbsp;&nbsp; Order By: ${escapeHtml(first.orderBy)} &nbsp;&nbsp; GST No: ${escapeHtml(first.gsTno)}`}</td></tr><tr class="subhead"><th>Item Code</th><th>Item Name</th><th>GRN Qty</th><th>Unit</th><th>Rate</th><th>CGST</th><th>SGST</th><th>Amount</th></tr>${rows.map((row) => `<tr>${cell(row.itemCode)}${cell(row.itemName)}${cell(row.pItemQty, "number")}${cell(row.unit)}${moneyCell(row.poItemRate)}${moneyCell(row.cgsT_Amount)}${moneyCell(row.sgsT_Amount)}${moneyCell((Number(row.pItemQty) || 0) * (Number(row.poItemRate) || 0))}</tr>`).join("")}<tr class="subtotal"><td colspan="7">GRN TOTAL</td>${moneyCell(subtotal)}</tr>`;
          })
          .join("") +
        `<tr class="total"><td colspan="7">GRAND TOTAL</td>${moneyCell(grandTotal)}</tr>`;

      tableContent = `<table><thead><tr><th colspan="8">${reportType === "Detailed" ? "GRN Details" : "Supplier GRN Details"}</th></tr></thead><tbody>${tableContent}</tbody></table>`;
    }

    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) {
      alert("Please allow pop-ups to print this report.");
      return;
    }

    printWindow.document.open();
    printWindow.document
      .write(`<!doctype html><html><head><title>${pageTitle}</title><meta charset="utf-8" /><style>
      @page { size: A4 landscape; margin: 12mm; }
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; color: #111; font-size: 10px; }
      .company { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
      .subtitle { font-size: 12px; color: #7f3030; margin: 12px 0; border-bottom: 1px solid #777; padding-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; margin: 0 0 12px; }
      th { background: #dedede; color: #6e3030; text-align: left; font-weight: bold; }
      th, td { padding: 6px 7px; border-bottom: 1px solid #bbb; vertical-align: top; }
      .number { text-align: right; }
      .group td { color: #28763a; font-weight: bold; background: #f5f5f5; border-top: 1px solid #777; padding-top: 10px; }
      .meta td { color: #28763a; }
      .subhead th { background: #eee; }
      .subtotal td, .total td { color: #7f3030; font-weight: bold; text-align: right; }
      .subtotal td:first-child, .total td:first-child { text-align: right; }
      .total td { border-top: 2px solid #555; }
      @media print { .no-print { display: none; } tr { break-inside: avoid; } }
    </style></head><body>
      <div class="company">Goods Received Note (GRN) Report</div>
      <div>Branch: ${escapeHtml(localStorage.getItem("branch") || "-")}</div>
      <div class="subtitle">${pageTitle} &nbsp; From ${dateLabel(fromDate)} To ${dateLabel(toDate)}</div>
      ${tableContent}
      <div style="margin-top:18px;font-size:9px">Printed on: ${new Date().toLocaleString("en-IN")}</div>
      <script>window.onload = function(){ window.focus(); window.print(); };<\/script>
    </body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <Header showNeworderButton={false} />

      <div className="flex-1 overflow-auto p-3 sm:p-5">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
            <FileBarChart className="text-indigo-600" size={21} />
            <h1 className="text-lg font-bold text-gray-800">
              Goods Received Note (GRN) Report
            </h1>
          </div>

          {/* Filters */}
          <div className="p-4 border-b">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => {
                    setReportType(e.target.value as ReportType);
                    setSelectedSupplier("");
                    setSelectedItem("");
                    setSearch("");
                  }}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="Regular Report">Regular Report</option>
                  <option value="Detailed">Detailed</option>
                  <option value="Supplier Wise">Supplier Wise</option>
                  <option value="Item Wise">Item Wise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  max={toDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {reportType === "Supplier Wise" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Select Supplier
                  </label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="">All Suppliers</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.code} value={supplier.code}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {reportType === "Item Wise" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Select Item
                  </label>
                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="">All Items</option>
                    {items.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar / Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <h2 className="font-semibold text-gray-800">{reportType} Report</h2>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrint}
                disabled={loading || displayedRows.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Printer size={16} />
                Print
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExportMenuOpen((open) => !open)}
                  disabled={loading || displayedRows.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileDown size={16} />
                  Export
                  <ChevronDown size={15} />
                </button>
                {exportMenuOpen && (
                  <div className="absolute right-0 top-full z-30 mt-1 min-w-36 overflow-hidden rounded border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileDown size={15} /> PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleExportExcel();
                        setExportMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileSpreadsheet size={15} /> Excel
                    </button>
                  </div>
                )}
              </div>
              <div className="relative w-full sm:w-72">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search report..."
                  className="w-full rounded border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-[calc(100vh-300px)]">
            <table className="min-w-full text-sm text-left">
              <thead className="sticky top-0 z-10 bg-indigo-700 text-white">
                <tr>
                  {columns.length ? (
                    columns.map((column) => (
                      <th
                        key={column}
                        onClick={() => handleSort(column)}
                        className="whitespace-nowrap px-4 py-3 font-semibold cursor-pointer select-none hover:bg-indigo-800"
                      >
                        <div className="flex items-center gap-2">
                          <span>{formatHeader(column, headers)}</span>

                          {sortColumn === column ? (
                            sortDirection === "asc" ? (
                              <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} />
                            )
                          ) : (
                            <ArrowUpDown size={14} className="opacity-60" />
                          )}
                        </div>
                      </th>
                    ))
                  ) : (
                    <th className="px-4 py-3">Report Details</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={Math.max(columns.length, 1)}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      Loading report...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={Math.max(columns.length, 1)}
                      className="px-4 py-10 text-center text-red-600"
                    >
                      {error}
                    </td>
                  </tr>
                ) : sortedRows.length ? (
                  sortedRows.map((row, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0
                          ? "border-b bg-white hover:bg-indigo-50"
                          : "border-b bg-slate-50 hover:bg-indigo-50"
                      }
                    >
                      {columns.map((column) => {
                        const shouldMerge =
                          reportType === "Detailed" &&
                          spanData.mergedColumns.has(column);

                        if (shouldMerge && spanData.spans[index] === 0) {
                          return null;
                        }

                        const value = row[column];

                        const isMoneyColumn = [
                          "itemAmount",
                          "poItemRate",
                          "totalamount",
                          "totalAmount",
                          "totalTaxAmount",
                          "grossAmount",
                          "cgsT_Amount",
                          "sgsT_Amount",
                          "cess_Amount",
                          "vaT_Amount",
                          "missChargeAmount",
                        ].includes(column);

                        const isDateColumn = ["grnDate", "poDate"].includes(
                          column,
                        );

                        const displayValue =
                          typeof value === "number" && isMoneyColumn
                            ? formatAmount(value)
                            : isDateColumn && value
                              ? formatDate(value)
                              : value == null
                                ? "-"
                                : String(value);

                        return (
                          <td
                            key={column}
                            rowSpan={
                              shouldMerge
                                ? spanData.spans[index] || 1
                                : undefined
                            }
                            className={`whitespace-nowrap px-4 py-3 text-gray-700 align-middle ${
                              typeof value === "number" && isMoneyColumn
                                ? "text-right"
                                : ""
                            }`}
                          >
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={Math.max(columns.length, 1)}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No report data available for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center gap-3 px-4 py-3 border-t bg-gray-50 text-sm">
            <span className="text-gray-600">
              Total Records: {displayedRows.length}
            </span>
            <span className="font-semibold text-gray-700">{reportType}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
