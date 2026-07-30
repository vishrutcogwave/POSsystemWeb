import { useMemo, Fragment, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Menu, Transition } from "@headlessui/react";

type Column<T> = {
  key: keyof T;
  label: string;
};

type Outlet = {
  id: string;
  label: string;
};

type Props<T> = {
  title: string;
  columns: readonly Column<T>[];
  data: T[];
  outlets: Outlet[];

  departments: string[];
  selectedDepartment: string;
  setSelectedDepartment: Dispatch<SetStateAction<string>>;

  fromDate: string;
  toDate: string;
  outlet: string;
  setOutlet: Dispatch<SetStateAction<string>>;
  setFromDate: Dispatch<SetStateAction<string>>;
  setToDate: Dispatch<SetStateAction<string>>;
};
export default function ReportTableforNCReport<T extends Record<string, any>>({
  title,
  columns,
  data,
  outlets,

  departments,
  selectedDepartment,
  setSelectedDepartment,

  fromDate,
  toDate,
  outlet,
  setOutlet,
  setFromDate,
  setToDate,
}: Props<T>) {
  const [search, setSearch] = useState("");

  // -------------------- DETECT DYNAMIC DATE & OUTLET KEYS --------------------
  const dateKey = columns.find((c) =>
    c.key.toString().toLowerCase().includes("date"),
  )?.key;
  const outletKey = columns.find((c) =>
    c.key.toString().toLowerCase().includes("oltname"),
  )?.key;

  // -------------------- FILTER & GROUP DATA --------------------
const filteredData = useMemo(() => {
  return data.filter((row) => {
    let rowDateStr = dateKey && row[dateKey] ? String(row[dateKey]) : "";

    let rowDate = "";

    if (rowDateStr.includes("/")) {
      const [day, month, year] = rowDateStr.split("/");
      rowDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } else if (rowDateStr.includes("T")) {
      rowDate = rowDateStr.split("T")[0];
    } else {
      rowDate = rowDateStr;
    }

    const textMatch = Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const outletMatch =
      outlet === "All" || row.oltName === outlet;

    const departmentMatch =
      selectedDepartment === "All" ||
      row.ncDepName === selectedDepartment;

    const dateMatch =
      (!fromDate || rowDate >= fromDate) &&
      (!toDate || rowDate <= toDate);

    return (
      textMatch &&
      outletMatch &&
      departmentMatch &&
      dateMatch
    );
  });
}, [
  data,
  search,
  outlet,
  selectedDepartment,
  fromDate,
  toDate,
  dateKey,
]);

  const groupedData = useMemo(() => {
    const groups: Record<string, T[]> = {};
    filteredData.forEach((row) => {
      const key = outletKey ? row[outletKey] || "Unknown" : "Unknown";
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });
    return groups;
  }, [filteredData, outletKey]);

  // -------------------- FORMAT VALUE --------------------
  const formatValue = (value: any, key: string) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      String(value).toLowerCase() === "null" ||
      String(value).toLowerCase() === "n/a"
    ) {
      return "--";
    }

    const str = String(value);

    if (str.includes("T")) {
      if (key.toLowerCase().includes("time")) {
        return str.split("T")[1]; // only time
      }
      if (key.toLowerCase().includes("date")) {
        return str.split("T")[0]; // only date
      }
    }

    return str;
  };

  // -------------------- PRINT --------------------
  const handlePrintReport = () => {
    const cols = columns
      .filter((c) => c.key !== outletKey)
      .map((c) => `<th>${c.label}</th>`)
      .join("");

    const sectionsHtml = Object.entries(groupedData)
      .map(([outletName, rows]) => {
        const rowsHtml = rows
          .map(
            (row) =>
              `<tr>${columns
                .filter((c) => c.key !== outletKey)
                .map(
                  (c) => `<td>${formatValue(row[c.key], String(c.key))}</td>`,
                )
                .join("")}</tr>`,
          )
          .join("");
        return `<h3>${outletName}</h3><table><thead><tr>${cols}</tr></thead><tbody>${rowsHtml}</tbody></table><br/>`;
      })
      .join("");

    const html = `
      <html>
        <head>
          <title>Report</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-family: monospace; }
            th, td { border: 1px solid #333; padding: 4px; text-align: left; }
            th { background: #eee; }
            h2, h3 { font-family: sans-serif; }
          </style>
        </head>
        <body>
    <h2>${title}</h2>
          ${sectionsHtml}
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // -------------------- DOWNLOAD --------------------
  const handleDownload = (type: "xlsx" | "pdf") => {
    if (type === "xlsx") {
  const worksheetData: Record<string, any>[] = [];

  const totalColumns = [
    "billamount",
    "discount",
    "tax",
    "roundoff",
    "cgst",
    "sgst",
    "total",
  ];

  Object.entries(groupedData).forEach(([outletName, rows]) => {
    // Outlet Heading
    worksheetData.push({
      [columns[0].label]: outletName,
    });

    // Data Rows
    rows.forEach((row) => {
      const obj: Record<string, any> = {};

      columns
        .filter((c) => c.key !== outletKey)
        .forEach((col) => {
          obj[col.label] = formatValue(row[col.key], String(col.key));
        });

      worksheetData.push(obj);
    });

    // Total Row
    const totalRow: Record<string, any> = {};

    columns
      .filter((c) => c.key !== outletKey)
      .forEach((col, index) => {
        const key = String(col.key).toLowerCase();

        if (index === 0) {
          totalRow[col.label] = "Total";
        } else if (totalColumns.includes(key)) {
          totalRow[col.label] = rows
            .reduce(
              (sum, row) => sum + (parseFloat(row[col.key]) || 0),
              0
            )
            .toFixed(2);
        } else {
          totalRow[col.label] = "-";
        }
      });

    worksheetData.push(totalRow);

    // Empty row between outlets
    worksheetData.push({});
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  XLSX.writeFile(
    workbook,
    `${title.replace(/\s+/g, "_")}_${fromDate}_to_${toDate}.xlsx`
  );
}

    if (type === "pdf") {
      const doc = new jsPDF();

      Object.entries(groupedData).forEach(
        ([outletName, rows], sectionIndex) => {
          const startY =
            sectionIndex === 0
              ? 20
              : (doc as any).lastAutoTable?.finalY + 10 || 20;

          doc.setFontSize(14);
          doc.text(outletName, 14, startY);

          const pdfColumns = columns
            .filter((c) => c.key !== outletKey)
            .map((c) => c.label);
          const pdfData = rows.map((row) =>
            columns
              .filter((c) => c.key !== outletKey)
              .map((c) => formatValue(row[c.key], String(c.key))),
          );

          autoTable(doc, {
            head: [pdfColumns],
            body: pdfData,
            startY: startY + 10,
          });
        },
      );

      doc.save("report.pdf");
    }
  };

const departmentKey = columns.find((c) =>
  String(c.key).toLowerCase().includes("ncdepname")
)?.key;

const displayGroupedData = Object.fromEntries(
  Object.entries(groupedData).map(([outletName, rows]) => [
    outletName,
    rows.filter(
      (row) =>
        selectedDepartment === "All" ||
        (departmentKey && row[departmentKey] === selectedDepartment)
    ),
  ])
).filter
  ? Object.fromEntries(
      Object.entries(groupedData)
        .map(([outletName, rows]) => [
          outletName,
          rows.filter(
            (row) =>
              selectedDepartment === "All" ||
              (departmentKey && row[departmentKey] === selectedDepartment)
          ),
        ])
        .filter(([, rows]) => rows.length > 0)
    )
  : groupedData;
  // -------------------- RENDER --------------------
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
          value={outlet}
          onChange={(e) => setOutlet(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="All">All Outlet</option>
          {outlets.map((o) => (
            <option key={o.id} value={o.label}>
              {o.label}
            </option>
          ))}
        </select>

        <select
      value={selectedDepartment}
onChange={(e) => setSelectedDepartment(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          {departments.map((dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-32 md:w-48"
        />

        <button
          onClick={handlePrintReport}
          className="bg-blue-500 text-white px-3 py-2 rounded text-sm"
        >
          🖨
        </button>

        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="bg-green-500 text-white px-3 py-2 rounded text-sm">
            ⬇ Download
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white border rounded-md shadow-lg z-10">
              <div className="py-1">
                <Menu.Item>
                  {({ active }: any) => (
                    <button
                      onClick={() => handleDownload("xlsx")}
                      className={`${active ? "bg-gray-100" : ""} w-full text-left px-4 py-2 text-sm`}
                    >
                      Excel
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }: any) => (
                    <button
                      onClick={() => handleDownload("pdf")}
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

    {(Object.entries(displayGroupedData) as [string, T[]][]).map(
  ([outletName, rows]) => (
      <div key={outletName} className="mb-6">
        <h3 className="text-md font-semibold mb-2">{outletName}</h3>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                {columns
                  .filter((c) => c.key !== outletKey)
                  .map((col) => (
                    <th
                      key={String(col.key)}
                      className="px-4 py-2 text-left"
                    >
                      {col.label}
                    </th>
                  ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row: T, i: number) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  {columns
                    .filter((c) => c.key !== outletKey)
                    .map((col) => (
                      <td key={String(col.key)} className="px-4 py-2">
                        {formatValue(row[col.key], String(col.key))}
                      </td>
                    ))}
                </tr>
              ))}

              <tr className="bg-green-600 text-white font-bold border-t-2">
                {columns
                  .filter((c) => c.key !== outletKey)
                  .map((col, index) => {
                    const key = String(col.key).toLowerCase();

                    if (index === 0) {
                      return (
                        <td key={key} className="px-4 py-2">
                          Total
                        </td>
                      );
                    }

                    if (key === "kotdqty") {
                      const totalQty =rows.reduce((sum: number, row: T) => sum + Number(row[col.key] || 0),
                        0
                      );

                      return (
                        <td key={key} className="px-4 py-2">
                          {totalQty}
                        </td>
                      );
                    }

                    if (key === "kottotal") {
                      const totalAmount = rows.reduce(
                        (sum, row) => sum + Number(row[col.key] || 0),
                        0
                      );

                      return (
                        <td key={key} className="px-4 py-2">
                          {totalAmount.toFixed(2)}
                        </td>
                      );
                    }

                    return (
                      <td key={key} className="px-4 py-2">
                        -
                      </td>
                    );
                  })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
);
}
