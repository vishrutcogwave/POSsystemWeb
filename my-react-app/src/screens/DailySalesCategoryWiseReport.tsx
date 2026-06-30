import { useEffect, useState } from "react";
import Header from "../components/Header";

import {
  getDailySaleCategoryWiseReport,
  getCategoryMasterList,
  getSubCategoryMasterList,
  getOutletList,
} from "../api/services/products.service";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { DataTable } from "../components/DataTableForMasters";


type Row = Record<string, any> & {
  id: number;
};

export default function DailysaleCategorywisereport() {
const [data, setData] = useState<Row[]>([]);
const [summary, setSummary] = useState({
  totalQuantity: 0,
  totalTax: 0,
  totalAmount: 0,
  grandAmount: 0,
});

  const [columns, setColumns] = useState<
    { key: string; label: string }[]
  >([]);

  const [outlets, setOutlets] = useState<
    { id: string; label: string }[]
  >([]);
  const [isSubDropdownOpen, setIsSubDropdownOpen] =
  useState(false);

  const [categories, setCategories] =
    useState<
      { id: number; label: string }[]
    >([]);

const [subCategories, setSubCategories] =
  useState<
    {
      id: number;
      label: string;
      catCode: number;
    }[]
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

  const [selectedCategory, setSelectedCategory] =
    useState("All");
const [
  selectedSubCategory,
  setSelectedSubCategory,
] = useState<string[]>([]);

  const [isBetweenDates, setIsBetweenDates] =
    useState(true);

  // FETCH OUTLETS
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

  // FETCH CATEGORY
  const fetchCategoryData = async () => {
    try {
      const res =
        await getCategoryMasterList(
          localStorage.getItem("branch") ||
            ""
        );

      const formatted =
        res.data.map((item: any) => ({
          id: item.catCode,
          label: item.catName,
        }));

      setCategories(formatted);
    } catch (error) {
      console.error(error);
    }
  };

  // FETCH SUB CATEGORY
const fetchSubCategoryData =
  async () => {
    try {
      const res =
        await getSubCategoryMasterList(
          localStorage.getItem(
            "branch"
          ) || ""
        );

      const formatted =
        res.data.map((item: any) => ({
          id: item.subCatCode,
          label: item.subCatName,
          catCode: item.catCode,
        }));

      setSubCategories(formatted);
    } catch (error) {
      console.error(error);
    }
  };

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

  const categoryId =
  selectedCategory === "All"
    ? "All"
    : Number(
        categories.find(
          (c) =>
            c.label ===
            selectedCategory
        )?.id
      );

 const subCategoryId =
  selectedSubCategory.length === 0
    ? subCategories.map(
        (s) => s.id
      ).join(",")
    : subCategories
        .filter((s) =>
          selectedSubCategory.includes(
            s.label
          )
        )
        .map((s) => s.id)
        .join(",");

        
    const response =
      await getDailySaleCategoryWiseReport(
        {
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

          CatCode: categoryId,

          SubCatCode:
            subCategoryId,

      IsSubCategory:
  selectedSubCategory.length > 0,
        }
      );

    // ITEMS
    const items =
      response?.items || [];

    // SUMMARY
    setSummary({
      totalQuantity:
        response?.summary
          ?.totalQuantity || 0,

      totalTax:
        response?.summary
          ?.totalTax || 0,

      totalAmount:
        response?.summary
          ?.totalAmount || 0,

      grandAmount:
        response?.summary
          ?.grandAmount || 0,
    });

    if (items.length > 0) {
      const dynamicColumns =
        Object.keys(items[0]).map(
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
      items.map(
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
    fetchCategoryData();
    fetchSubCategoryData();
  }, []);

  useEffect(() => {
    if (outlets.length > 0) {
      fetchData();
    }
  }, [
    fromDate,
    toDate,
    selectedOutlet,
    selectedCategory,
    selectedSubCategory,
    isBetweenDates,
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
      "DailySalesCategoryWise"
    );

    XLSX.writeFile(
      workbook,
      "DailySalesCategoryWise.xlsx"
    );
  };

  // PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text(
      "Daily Sales Category Wise Report",
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

    doc.save(
      "DailySalesCategoryWise.pdf"
    );
  };

  const selectedCategoryObj =
  categories.find(
    (c) =>
      c.label === selectedCategory
  );

const filteredSubCategories =
  selectedCategory === "All"
    ? []
    : subCategories.filter(
        (sub) =>
          sub.catCode ===
          selectedCategoryObj?.id
      );
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

          {/* CATEGORY */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Category
            </label>

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
              className="border rounded px-3 py-2 min-w-[220px]"
            >
              <option value="All">
                All Categories
              </option>

              {categories.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.label}
                >
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* SUB CATEGORY */}
{/* SUB CATEGORY */}
{selectedCategory !== "All" && (
  <div className="flex flex-col relative min-w-[260px]">
    <label className="text-sm font-medium mb-1">
      Sub Category
    </label>

    <div
      onClick={() =>
        setIsSubDropdownOpen(
          !isSubDropdownOpen
        )
      }
      className="border rounded px-3 py-2 bg-white cursor-pointer min-h-[42px] flex items-center"
    >
      {selectedSubCategory.length === 0
        ? "All Sub Categories"
        : `${selectedSubCategory.length} Selected`}
    </div>

    {isSubDropdownOpen && (
      <div className="absolute top-full mt-1 w-full bg-white border rounded shadow-lg z-50 max-h-[250px] overflow-auto p-2">
        {/* SELECT ALL */}
        <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
          <input
            type="checkbox"
            checked={
              selectedSubCategory.length ===
              filteredSubCategories.length
            }
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedSubCategory(
                  filteredSubCategories.map(
                    (s) => s.label
                  )
                );
              } else {
                setSelectedSubCategory(
                  []
                );
              }
            }}
          />

          <span>Select All</span>
        </label>

        <hr className="my-2" />

        {/* OPTIONS */}
        {filteredSubCategories.map(
          (sub) => (
            <label
              key={sub.id}
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedSubCategory.includes(
                  sub.label
                )}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedSubCategory([
                      ...selectedSubCategory,
                      sub.label,
                    ]);
                  } else {
                    setSelectedSubCategory(
                      selectedSubCategory.filter(
                        (item) =>
                          item !==
                          sub.label
                      )
                    );
                  }
                }}
              />

              <span>
                {sub.label}
              </span>
            </label>
          )
        )}
      </div>
    )}
  </div>
)}
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

        
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-md p-4">
          {/* HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold">
              Daily Sales Category Wise
              Report
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
          <div className="mt-4 border rounded-lg p-4 bg-gray-50">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div>
      <p className="text-sm text-gray-500">
        Total Quantity
      </p>

      <p className="font-semibold text-lg">
        {summary.totalQuantity}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">
        Total Tax
      </p>

      <p className="font-semibold text-lg">
        {summary.totalTax}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">
        Total Amount
      </p>

      <p className="font-semibold text-lg">
        {summary.totalAmount}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">
        Grand Amount
      </p>

      <p className="font-semibold text-lg">
        {summary.grandAmount}
      </p>
    </div>
  </div>
</div>
        </div>
      </div>
    </div>
  );
}
