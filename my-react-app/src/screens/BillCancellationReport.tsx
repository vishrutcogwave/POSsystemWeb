import { useEffect, useState } from "react";
import Header from "../components/Header";

import {
  getCombinedOutletAndTableMasterList,
  getBillCancellationReport,
} from "../api/services/products.service";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { DataTable } from "../components/DataTableForMasters";

type Row = {
  id: number;
  billNo: string;
  billDate: string;
  billTime: string;
  totalAmount: number;
  outlet: string;
};

export default function BillCancellationReport() {
  const [data, setData] = useState<Row[]>([]);

  const [outlets, setOutlets] = useState<
    { id: string; label: string }[]
  >([]);

  const today = new Date();

  const formattedToday =
    today.toISOString().split("T")[0];

  const [fromDate, setFromDate] =
    useState(formattedToday);

  const [toDate, setToDate] =
    useState(formattedToday);

  const [selectedOutlet, setSelectedOutlet] =
    useState("All");

  const [isBetweenDates, setIsBetweenDates] =
    useState(true);

  // FETCH OUTLETS
  const fetchOutletData = async () => {
    try {
      const res: any[] =
        await getCombinedOutletAndTableMasterList(
          localStorage.getItem("branch") || ""
        );

      const formattedOutlets = res.map(
        (outlet) => ({
          id: outlet.oltCode.toString(),
          label: outlet.oltName.trim(),
        })
      );

      setOutlets(formattedOutlets);
    } catch (error) {
      console.error(
        "Error fetching outlets:",
        error
      );
    }
  };

  // FETCH REPORT
  const fetchData = async () => {
    try {
      const outletId: string | number =
        selectedOutlet === "All"
          ? "All"
          : Number(
              outlets.find(
                (o) =>
                  o.label === selectedOutlet
              )?.id
            );

      if (
        !outletId &&
        selectedOutlet !== "All"
      )
        return;

      const response =
        await getBillCancellationReport({
          BranchCode:
            localStorage.getItem("branch") ||
            "",

          IsAsOnDate: !isBetweenDates,

          IsBetweenDates: isBetweenDates,

          Date: null,

          FromDate: fromDate,

          ToDate: toDate,

          BillingType: "C",

          OutletCode: outletId,
        });

      setData(
        (response || []).map(
          (item: any, index: number) => ({
            id: index + 1,
            ...item,
          })
        )
      );
    } catch (error) {
      console.error(
        "Error fetching Bill cancellation report:",
        error
      );
    }
  };

  useEffect(() => {
    fetchOutletData();
  }, []);

  useEffect(() => {
    if (outlets.length > 0) {
      fetchData();
    }
  }, [
    fromDate,
    toDate,
    selectedOutlet,
    isBetweenDates,
    outlets,
  ]);

  // PRINT
  const handlePrint = () => {
    const printWindow = window.open(
      "",
      "_blank"
    );

    if (!printWindow) return;

    const rows = data
      .map(
        (row) => `
      <tr>
        <td>${row.billNo}</td>
        <td>${row.billDate}</td>
        <td>${row.billTime}</td>
        <td>${row.totalAmount}</td>
        <td>${row.outlet}</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Bill Cancellation Report</title>

          <style>
            body {
              font-family: Arial;
              padding: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }

            th {
              background: #f3f4f6;
            }
          </style>
        </head>

        <body>
          <h2>Bill Cancellation Report</h2>

          <table>
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Bill Date</th>
                <th>Bill Time</th>
                <th>Total Amount</th>
                <th>Outlet</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  // DOWNLOAD EXCEL
  const downloadExcel = () => {
    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Bill Cancellation"
    );

    XLSX.writeFile(
      workbook,
      "BillCancellationReport.xlsx"
    );
  };

  // DOWNLOAD PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text(
      "Bill Cancellation Report",
      14,
      15
    );

    autoTable(doc, {
      head: [
        [
          "Bill No",
          "Bill Date",
          "Bill Time",
          "Total Amount",
          "Outlet",
        ],
      ],

      body: data.map((row) => [
        row.billNo,
        row.billDate,
        row.billTime,
        row.totalAmount,
        row.outlet,
      ]),

      startY: 25,
    });

    doc.save(
      "BillCancellationReport.pdf"
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header showNeworderButton={false} />

      <div className="flex-1 overflow-auto p-4">
        {/* FILTERS */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex flex-wrap gap-4 items-center">
          {/* FROM DATE */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
              className="border rounded px-3 py-2"
            />
          </div>

          {/* TO DATE */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
              className="border rounded px-3 py-2"
            />
          </div>

          {/* OUTLET */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Outlet
            </label>

            <select
              value={selectedOutlet}
              onChange={(e) =>
                setSelectedOutlet(
                  e.target.value
                )
              }
              className="border rounded px-3 py-2 min-w-[220px]"
            >
              <option value="All">
                All
              </option>

              {outlets.map((outlet) => (
                <option
                  key={outlet.id}
                  value={outlet.label}
                >
                  {outlet.label}
                </option>
              ))}
            </select>
          </div>

          {/* CHECKBOX */}
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={isBetweenDates}
              onChange={(e) =>
                setIsBetweenDates(
                  e.target.checked
                )
              }
            />

            <label className="text-sm font-medium">
              Is Between Dates
            </label>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-md p-4">
          {/* HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold">
              Bill Cancellation Report
            </h2>

            {/* BUTTONS */}
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Print
              </button>

              <button
                onClick={downloadExcel}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Excel
              </button>

              <button
                onClick={downloadPDF}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                PDF
              </button>
            </div>
          </div>

          {/* DATATABLE */}
          <DataTable
            columns={[
              {
                header: "Bill No",
                accessor: "billNo",
              },
              {
                header: "Bill Date",
                accessor: "billDate",
              },
              {
                header: "Bill Time",
                accessor: "billTime",
              },
              {
                header: "Total Amount",
                accessor: "totalAmount",
              },
              {
                header: "Outlet",
                accessor: "outlet",
              },
            ]}
            data={data}
          />
        </div>
      </div>
    </div>
  );
}
