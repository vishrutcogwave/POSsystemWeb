
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

import {
  getStoreMasterList,
  uploadInventoryItemStoreExcel,
  importInventoryItemStoreExcel,
} from "../api/services/products.service";

import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { useAppContext } from "../context/AppContext";

export default function InventoryItemStoreImport() {
  const { appData } = useAppContext();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // Selected Excel
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  // Excel preview
  const [previewData, setPreviewData] =
    useState<any[]>([]);

  // Stores
  const [stores, setStores] =
    useState<any[]>([]);

  // Selected Store IDs
  const [selectedStoreIds, setSelectedStoreIds] =
    useState<string[]>([]);

  // Store dropdown
  const [showStoreDropdown, setShowStoreDropdown] =
    useState(false);

  // =========================================================
  // FETCH STORES
  // =========================================================

  const getStores = async () => {
    try {
      setLoading(true);

      const res = await getStoreMasterList(
        appData?.user?.branch_code
      );

      console.log("Store Master List:", res);

      if (res?.success) {
        setStores(res.data || []);
      } else {
        toast.error(
          res?.message || "Failed to load stores"
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "Error loading stores"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appData?.user?.branch_code) {
      getStores();
    }
  }, [appData?.user?.branch_code]);

  // =========================================================
  // PREVIEW EXCEL
  // =========================================================

  const handlePreview = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Only Excel
    const isExcel =
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls");

    if (!isExcel) {
      toast.error(
        "Please select an Excel file"
      );

      e.target.value = "";

      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onload = (evt: any) => {
      try {
        const data = evt.target.result;

        const workbook = XLSX.read(data, {
          type: "binary",
        });

        const sheetName =
          workbook.SheetNames[0];

        const worksheet =
          workbook.Sheets[sheetName];

        const jsonData =
          XLSX.utils.sheet_to_json(
            worksheet,
            {
              defval: "",
            }
          );

        console.log(
          "Excel Preview:",
          jsonData
        );

        setPreviewData(
          jsonData as any[]
        );
      } catch (error) {
        console.error(error);

        toast.error(
          "Failed to read excel file ❌"
        );
      }
    };

    reader.readAsBinaryString(file);
  };

  // =========================================================
  // IMPORT EXCEL
  // =========================================================

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error(
        "Please select excel file"
      );

      return;
    }

    // STORE VALIDATION
    if (selectedStoreIds.length === 0) {
      toast.error(
        "Please select at least one store"
      );

      return;
    }

    try {
      setLoading(true);

      // =====================================================
      // STEP 1
      // UPLOAD EXCEL
      // =====================================================

      const uploadRes =
        await uploadInventoryItemStoreExcel(
          selectedFile,
          appData?.user?.branch_code || ""
        );

      console.log(
        "Upload Response:",
        uploadRes
      );

      // =====================================================
      // VALIDATION ERRORS
      // =====================================================

      if (
        uploadRes?.errors &&
        Array.isArray(uploadRes.errors) &&
        uploadRes.errors.length > 0
      ) {
        toast.error(
          uploadRes.errors.join("\n")
        );

        console.log(
          "Import Errors:",
          uploadRes.errors
        );

        return;
      }

      // =====================================================
      // STEP 2
      // IMPORT VALID ROWS
      // =====================================================

      if (
        uploadRes?.validRows &&
        Array.isArray(uploadRes.validRows) &&
        uploadRes.validRows.length > 0
      ) {
        const importRes =
          await importInventoryItemStoreExcel(
            uploadRes.validRows,

            // userCode
            String(
              appData?.user?.userCode || ""
            ),

            // branchCode
            appData?.user?.branch_code || "",

            // storeids
            selectedStoreIds.map(Number)
          );

        console.log(
          "Import Response:",
          importRes
        );

        toast.success(
          importRes?.message ||
            `Excel imported successfully ✅ (${uploadRes.validRows.length} rows)`
        );

        // Clear after successful import
        setPreviewData([]);

        setSelectedFile(null);

        setSelectedStoreIds([]);

        setShowStoreDropdown(false);
      } else {
        toast.error(
          uploadRes?.message ||
            "No valid rows found ❌"
        );
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          "Error importing excel ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header showNeworderButton={false} />

      {loading && <Loader />}

      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

        {/* =====================================================
            TOP HEADER
        ====================================================== */}

        <div
          className="
            flex
            flex-col
            lg:flex-row
            justify-between
            items-start
            lg:items-center
            gap-4
            mb-6
          "
        >
          {/* LEFT */}

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Import Inventory Item Store
            </h1>

            <p className="text-sm text-gray-500">
              Upload excel and preview before import
            </p>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-3 flex-wrap">

            {/* BACK */}

            <button
              onClick={() => navigate(-1)}
              className="
                bg-white
                border
                hover:bg-gray-100
                text-gray-700
                px-4 py-2.5
                rounded-xl
                font-medium
                shadow-sm
                transition-all
                duration-200
                flex
                items-center
                gap-2
              "
            >
              <span>←</span>

              <span>
                Back
              </span>
            </button>

            {/* SELECT EXCEL */}

            <label
              className="
                cursor-pointer
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-5 py-2.5
                rounded-xl
                font-medium
                flex
                items-center
                gap-2
                justify-center
                transition-all
                duration-200
                shadow-sm
              "
            >
              <span>📁</span>

              <span>
                Select Excel
              </span>

              <input
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={handlePreview}
              />
            </label>

          </div>
        </div>

        {/* =====================================================
            STORE MULTI SELECT
        ====================================================== */}

        <div className="bg-white rounded-xl shadow p-4 mb-4">

          <div className="flex flex-col relative max-w-md">

            <label className="text-sm mb-1">
              Stores
            </label>

            {/* SELECT BOX */}

            <div
              onClick={() =>
                setShowStoreDropdown(
                  (prev) => !prev
                )
              }
              className="
                border
                rounded-lg
                px-3
                py-2
                bg-white
                cursor-pointer
                h-[42px]
                flex
                items-center
                justify-between
              "
            >
              <span
                className={`truncate ${
                  selectedStoreIds.length === 0
                    ? "text-gray-500"
                    : "text-black"
                }`}
              >
                {selectedStoreIds.length > 0
                  ? selectedStoreIds.join(", ")
                  : "Select Stores"}
              </span>

              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* DROPDOWN */}

            {showStoreDropdown && (
              <div
                className="
                  absolute
                  top-full
                  left-0
                  mt-1
                  w-full
                  bg-white
                  border
                  rounded-lg
                  shadow-lg
                  z-50
                  max-h-60
                  overflow-y-auto
                "
              >

                {/* SELECT ALL */}

                <label
                  className="
                    flex
                    items-center
                    gap-2
                    px-3
                    py-2
                    border-b
                    hover:bg-gray-100
                    cursor-pointer
                  "
                >
                  <input
                    type="checkbox"
                    checked={
                      stores.length > 0 &&
                      selectedStoreIds.length ===
                        stores.length
                    }
                    onChange={(e) => {
                      if (
                        e.target.checked
                      ) {
                        setSelectedStoreIds(
                          stores.map(
                            (store) =>
                              String(
                                store.storeId
                              )
                          )
                        );
                      } else {
                        setSelectedStoreIds(
                          []
                        );
                      }
                    }}
                  />

                  <span>
                    Select All
                  </span>
                </label>

                {/* STORE LIST */}

                {stores.map(
                  (store) => {
                    const storeId =
                      String(
                        store.storeId
                      );

                    return (
                      <label
                        key={store.storeId}
                        className="
                          flex
                          items-center
                          gap-2
                          px-3
                          py-2
                          hover:bg-gray-100
                          cursor-pointer
                        "
                      >
                        <input
                          type="checkbox"
                          checked={selectedStoreIds.includes(
                            storeId
                          )}
                          onChange={(e) => {
                            if (
                              e.target.checked
                            ) {
                              setSelectedStoreIds(
                                (prev) => [
                                  ...prev,
                                  storeId,
                                ]
                              );
                            } else {
                              setSelectedStoreIds(
                                (prev) =>
                                  prev.filter(
                                    (id) =>
                                      id !==
                                      storeId
                                  )
                              );
                            }
                          }}
                        />

                        <span>
                          {store.storeName}
                        </span>
                      </label>
                    );
                  }
                )}

                {/* NO STORES */}

                {stores.length === 0 && (
                  <div className="px-3 py-3 text-sm text-gray-500">
                    No stores available
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            EXCEL PREVIEW
        ====================================================== */}

        <div
          className="
            bg-white
            rounded-xl
            shadow
            overflow-auto
            max-h-[65vh]
          "
        >
          <table className="w-full min-w-[1000px]">

            {/* HEADER */}

            <thead
              className="
                bg-gray-100
                sticky
                top-0
                z-10
              "
            >
              <tr>

                {previewData.length > 0 ? (
                  Object.keys(
                    previewData[0]
                  ).map((key) => (
                    <th
                      key={key}
                      className="
                        px-4
                        py-3
                        text-left
                        text-sm
                        font-semibold
                        text-gray-700
                        border-b
                      "
                    >
                      {key}
                    </th>
                  ))
                ) : (
                  <th
                    className="
                      px-4
                      py-3
                      text-center
                      text-gray-500
                    "
                  >
                    Excel Preview
                  </th>
                )}

              </tr>
            </thead>

            {/* BODY */}

            <tbody>

              {previewData.length > 0 ? (
                previewData.map(
                  (item, index) => (
                    <tr
                      key={index}
                      className="
                        hover:bg-gray-50
                        border-b
                      "
                    >

                      {Object.keys(
                        previewData[0]
                      ).map((key) => (
                        <td
                          key={key}
                          className="
                            px-4
                            py-3
                            text-sm
                            text-gray-700
                            whitespace-nowrap
                          "
                        >
                          {item[key]}
                        </td>
                      ))}

                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={1}
                    className="
                      text-center
                      py-10
                      text-gray-400
                    "
                  >
                    No preview data
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* =====================================================
            IMPORT BUTTON
        ====================================================== */}

        {selectedFile && (
          <div
            className="
              sticky
              bottom-0
              left-0
              bg-gray-50
              border-t
              mt-6
              py-4
              flex
              justify-end
              z-20
            "
          >

            <button
              onClick={handleImport}
              disabled={loading}
              className="
                bg-green-600
                hover:bg-green-700
                disabled:bg-gray-400
                text-white
                px-6
                py-2.5
                rounded-xl
                font-medium
              "
            >
              {loading
                ? "Importing..."
                : "Import Data"}
            </button>

          </div>
        )}

      </div>
    </>
  );
}