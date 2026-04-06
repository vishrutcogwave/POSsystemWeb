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
    title: string; // 👈 add this
  columns: readonly Column<T>[];
  data: T[];
  outlets: Outlet[];
  fromDate: string;
  toDate: string;
  outlet: string;
  setOutlet: Dispatch<SetStateAction<string>>;
  setFromDate: Dispatch<SetStateAction<string>>;
  setToDate: Dispatch<SetStateAction<string>>;
};

export default function ReportTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  outlets,
  fromDate,
  toDate,
  outlet,
  setOutlet,
  setFromDate,
  setToDate,
}: Props<T>) {
  const [search, setSearch] = useState("");

  // -------------------- DETECT DYNAMIC DATE & OUTLET KEYS --------------------

  const outletKey = columns.find((c) =>
    c.key.toString().toLowerCase().includes("oltname"),
  )?.key;

  // -------------------- FILTER & GROUP DATA --------------------
const filteredData = useMemo(() => {
  return data
    .map((group: any) => {
      const filteredItems = (group.items || []).filter((row: any) => {
        const textMatch = Object.values(row)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

        const outletMatch =
          outlet === "All" || row.outletName === outlet;

        return textMatch && outletMatch;
      });

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((g) => g.items.length > 0);
}, [data, search, outlet]);
const flatData = useMemo(() => {
  return filteredData.flatMap((group: any) =>
    (group.items || []).map((item: any) => ({
      ...item,
      groupName: group.groupName, // ensure group exists
    }))
  );
}, [filteredData]);

const groupedData = useMemo(() => {
  const result: Record<string, Record<string, T[]>> = {};

  flatData.forEach((row: any) => {
    const outlet = row.outletName || "Unknown";
    const group = row.groupName || "Others";

    if (!result[outlet]) result[outlet] = {};
    if (!result[outlet][group]) result[outlet][group] = [];

    result[outlet][group].push(row);
  });

  return result;
}, [flatData]);
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
  .map(([outletName, groups]) => {
    return Object.entries(groups)
      .map(([groupName, rows]) => {
        const rowsHtml = (rows as T[])
          .map(
            (row: T) =>
              `<tr>${columns
                .filter((c) => c.key !== outletKey)
                .map(
                  (c) =>
                    `<td>${formatValue(row[c.key], String(c.key))}</td>`,
                )
                .join("")}</tr>`,
          )
          .join("");

        return `<h3>${outletName} - ${groupName}</h3>
          <table>
            <thead><tr>${cols}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table><br/>`;
      })
      .join("");
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

 Object.entries(groupedData).forEach(([outletName, groups]) => {
  Object.entries(groups).forEach(([groupName, rows]) => {
    (rows as T[]).forEach((row: T) => {
      const obj: Record<string, any> = {
        Section: outletName,
        Group: groupName,
      };

      columns
        .filter((c) => c.key !== outletKey)
        .forEach((col) => {
          obj[col.label] = formatValue(row[col.key], String(col.key));
        });

      worksheetData.push(obj);
    });
  });
});

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      XLSX.writeFile(workbook, "report.xlsx");
    }

    if (type === "pdf") {
      const doc = new jsPDF();
Object.entries(groupedData).forEach(([outletName, groups], sectionIndex) => {
  Object.entries(groups).forEach(([groupName, rows]) => {
    const startY =
      sectionIndex === 0
        ? 20
        : (doc as any).lastAutoTable?.finalY + 10 || 20;

    doc.text(`${outletName} - ${groupName}`, 14, startY);

    const pdfColumns = columns
      .filter((c) => c.key !== outletKey)
      .map((c) => c.label);

    const pdfData = (rows as T[]).map((row: T) =>
      columns
        .filter((c) => c.key !== outletKey)
      .map((c) => formatValue(row[c.key], String(c.key)))
    );

    autoTable(doc, {
      head: [pdfColumns],
      body: pdfData,
      startY: startY + 10,
    });
  });
});
      doc.save("report.pdf");
    }
  };

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
            <option value="All">All</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* SEARCH + PRINT/DOWNLOAD */}
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
            title="Print"
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
              <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white border rounded-md shadow-lg focus:outline-none z-10">
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

      {/* TABLE VIEW */}
   {Object.entries(groupedData).map(([outletName, groups]) => (
  <div key={outletName} className="mb-6">
    <h2 className="text-lg font-bold mb-3">{outletName}</h2>

    {Object.entries(groups).map(([groupName, rows]) => (
      <div key={groupName} className="mb-4 ml-4">
        <h3 className="text-md font-semibold mb-2">{groupName}</h3>

        <div className="overflow-x-auto border rounded-lg">
      <table className="w-full table-fixed text-sm">
          <thead className="bg-gray-100">
  <tr>
    {columns.map((col) => (
      <th
        key={String(col.key)}
        className="px-4 py-2 text-left w-1/4"
      >
        {col.label}
      </th>
    ))}
  </tr>
</thead>
          <tbody>
  {(rows as T[]).map((row: T, i: number) => (
    <tr key={i} className="border-t hover:bg-gray-50">
      {columns.map((col) => (
        <td
          key={String(col.key)}
          className="px-4 py-2 w-1/4 truncate"
        >
          {row[col.key]}
        </td>
      ))}
    </tr>
  ))}
</tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
))}
    </div>
  );
}
