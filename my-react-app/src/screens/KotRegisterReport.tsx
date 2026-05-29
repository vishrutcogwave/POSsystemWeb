import { useEffect, useState } from "react";
import Header from "../components/Header";

import {
  getCombinedOutletAndTableMasterList,
  getKotRegisterReport,
  getTableMasterList,
} from "../api/services/products.service";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { DataTable } from "../components/DataTableForMasters";

type Row = Record<string, any> & {
  id: number;
};

export default function KotRegister() {
  const [data, setData] = useState<Row[]>([]);

  const [columns, setColumns] = useState<
    { key: string; label: string }[]
  >([]);

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
    const [tables, setTables] = useState<
  { id: string; label: string }[]
>([]);

const [tableNo, setTableNo] =
  useState("All");

  const [isBetweenDates, setIsBetweenDates] =
    useState(true);

  const [isPendingKot, setIsPendingKot] =
    useState(false);

  // FETCH OUTLETS
  const fetchOutletData = async () => {
    try {
      const res: any[] =
        await getCombinedOutletAndTableMasterList(
          localStorage.getItem("branch") ||
            ""
        );

      const formattedOutlets = res.map(
        (outlet) => ({
          id: outlet.oltCode.toString(),
          label: outlet.oltName.trim(),
        })
      );

      setOutlets(formattedOutlets);
    } catch (error) {
      console.error(error);
    }
  };
const fetchTableData = async () => {
  try {
    const res =
      await getTableMasterList(
        localStorage.getItem("branch") ||
          ""
      );

    const formattedTables =
      res.data.map((table: any) => ({
        id: table.tblCode.toString(),
        label: table.tblNo,
      }));

    setTables(formattedTables);
  } catch (error) {
    console.error(error);
  }
};
  // FETCH DATA
  const fetchData = async () => {
    try {
      const outletId: string | number =
        selectedOutlet === "All"
          ? "All"
          : Number(
              outlets.find(
                (o) =>
                  o.label ===
                  selectedOutlet
              )?.id
            );

      const response =
        await getKotRegisterReport({
          BranchCode:
            localStorage.getItem(
              "branch"
            ) || "",

          IsAsOnDate:
            !isBetweenDates,

          IsBetweenDates:
            isBetweenDates,

          Date: null,

          FromDate: fromDate,

          ToDate: toDate,

          BillingType: "C",

          OutletCode: outletId,

      TableNo: tableNo,

          IsPendingkot:
            isPendingKot,
        });

      if (
        response &&
        response.length > 0
      ) {
        const dynamicColumns =
          Object.keys(response[0]).map(
            (key) => ({
              key,
              label:
                key
                  .charAt(0)
                  .toUpperCase() +
                key.slice(1),
            })
          );

        setColumns(dynamicColumns);
      }

      setData(
        response.map(
          (
            item: any,
            index: number
          ) => ({
            id: index + 1,
            ...item,
          })
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

useEffect(() => {
  fetchOutletData();
  fetchTableData();
}, []);

  useEffect(() => {
    if (outlets.length > 0) {
      fetchData();
    }
  }, [
    fromDate,
    toDate,
    selectedOutlet,
    tableNo,
    isBetweenDates,
    isPendingKot,
    outlets,
  ]);

  // PRINT
  const handlePrint = () => {
    window.print();
  };

  // EXCEL
  const downloadExcel = () => {
    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "KotRegister"
    );

    XLSX.writeFile(
      workbook,
      "KotRegister.xlsx"
    );
  };

  // PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text(
      "KOT Register Report",
      14,
      15
    );

    autoTable(doc, {
      head: [
        columns.map(
          (col) => col.label
        ),
      ],

      body: data.map((row) =>
        columns.map(
          (col) =>
            row[col.key] ?? ""
        )
      ),

      startY: 25,
    });

    doc.save("KotRegister.pdf");
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

          {/* TABLE NO */}
       {/* TABLE NO */}
<div className="flex flex-col">
  <label className="text-sm font-medium mb-1">
    Table No
  </label>

  <select
    value={tableNo}
    onChange={(e) =>
      setTableNo(
        e.target.value
      )
    }
    className="border rounded px-3 py-2 min-w-[220px]"
  >
    <option value="All">
      All
    </option>

    {tables.map((table) => (
      <option
        key={table.id}
        value={table.label}
      >
        {table.label}
      </option>
    ))}
  </select>
</div>

          {/* BETWEEN DATE */}
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

          {/* PENDING KOT */}
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={isPendingKot}
              onChange={(e) =>
                setIsPendingKot(
                  e.target.checked
                )
              }
            />

            <label className="text-sm font-medium">
              Is Pending KOT
            </label>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-md p-4">
          {/* HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold">
              KOT Register Report
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

          <DataTable
            search={true}
            columns={columns.map(
              (col) => ({
                header: col.label,
                accessor:
                  col.key as keyof Row,
              })
            )}
            data={data}
          />
        </div>
      </div>
    </div>
  );
}