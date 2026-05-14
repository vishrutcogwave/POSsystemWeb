import React, { useState } from "react";
import Header from "../components/Header";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
    importItemMasterFromExcel,
  uploadItemMasterExcel,
} from "../api/services/products.service";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { useAppContext } from "../context/AppContext";

export default function ItemMasterImport() {
  const [loading, setLoading] = useState(false);
  const { appData } = useAppContext();
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewData, setPreviewData] = useState<any[]>([]);

  const navigate = useNavigate();

  // PREVIEW EXCEL
  const handlePreview = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

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

        setPreviewData(jsonData as any[]);
      } catch (error) {
        console.error(error);

        toast.error(
          "Failed to read excel file ❌"
        );
      }
    };

    reader.readAsBinaryString(file);
  };

// const handleImport = async () => {
//   if (!selectedFile) {
//     toast.error("Please select excel file");
//     return;
//   }

//   try {
//     setLoading(true);

//     // STEP 1 → Upload excel
// const uploadRes =
//   await uploadItemMasterExcel(
//     selectedFile,
//     appData?.user?.branch_code
//   );

//     if (
//       uploadRes?.validRows &&
//       Array.isArray(uploadRes.validRows) &&
//       uploadRes.validRows.length > 0
//     ) {
//       // STEP 2 → Directly send validRows
//    const importRes =
//   await importItemMasterFromExcel(
//     uploadRes.validRows,
//     appData?.user?.usercode,
//     appData?.user?.branch_code
//   );

//       toast.success(
//         importRes?.message ||
//           `Excel imported successfully ✅ (${uploadRes.validRows.length} rows)`
//       );

//       console.log(
//         "Imported Rows:",
//         uploadRes.validRows
//       );

//       setPreviewData([]);
//       setSelectedFile(null);
//     } else {
//       toast.error(
//         uploadRes?.message ||
//           "No valid rows found ❌"
//       );
//     }
//   } catch (err: any) {
//     console.error(err);

//     toast.error(
//       err?.response?.data?.message ||
//         "Error importing excel ❌"
//     );
//   } finally {
//     setLoading(false);
//   }
// };
const handleImport = async () => {
  if (!selectedFile) {
    toast.error("Please select excel file");
    return;
  }

  try {
    setLoading(true);

    // STEP 1 → Upload excel
    const uploadRes =
      await uploadItemMasterExcel(
        selectedFile,
        appData?.user?.branch_code
      );

    // 🔴 Show validation errors
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

    // ✅ Import valid rows
    if (
      uploadRes?.validRows &&
      Array.isArray(uploadRes.validRows) &&
      uploadRes.validRows.length > 0
    ) {
      const importRes =
        await importItemMasterFromExcel(
          uploadRes.validRows,
          String(appData?.user?.usercode),
          appData?.user?.branch_code
        );

      toast.success(
        importRes?.message ||
          `Excel imported successfully ✅ (${uploadRes.validRows.length} rows)`
      );

      console.log(
        "Imported Rows:",
        uploadRes.validRows
      );

      setPreviewData([]);
      setSelectedFile(null);
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

        {/* TOP */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">

          {/* LEFT */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Import Item Master
            </h1>

            <p className="text-sm text-gray-500">
              Upload excel and preview before
              import
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
                flex items-center gap-2
              "
            >
              <span>←</span>
              <span>Back</span>
            </button>

            {/* SELECT EXCEL */}
            <label
              className="
                cursor-pointer
                bg-blue-600 hover:bg-blue-700
                text-white
                px-5 py-2.5
                rounded-xl
                font-medium
                flex items-center gap-2
                justify-center
                transition-all
                duration-200
                shadow-sm
              "
            >
              <span>📁</span>

              <span>Select Excel</span>

              <input
                type="file"
                accept=".xlsx"
                hidden
                onChange={handlePreview}
              />
            </label>
          </div>
        </div>

        {/* TABLE */}
        <div
  className="
    bg-white
    rounded-xl
    shadow
    overflow-auto
    max-h-[70vh]
  "
>

          <table className="w-full min-w-[1000px]">

            {/* HEADER */}
          <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {previewData.length > 0 ? (
                  Object.keys(
                    previewData[0]
                  ).map((key) => (
                    <th
                      key={key}
                      className="
                        text-left
                        px-4
                        py-3
                        whitespace-nowrap
                        font-semibold
                        text-gray-700
                      "
                    >
                      {key}
                    </th>
                  ))
                ) : (
                  <th className="px-4 py-3 text-left">
                    Preview
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
                        border-t
                        hover:bg-gray-50
                      "
                    >
                      {Object.keys(item).map(
                        (key) => (
                          <td
                            key={key}
                            className="
                              px-4
                              py-3
                              whitespace-nowrap
                              text-sm
                            "
                          >
                            {String(
                              item[key]
                            )}
                          </td>
                        )
                      )}
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

        {/* IMPORT BUTTON */}
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
              className="
                bg-green-600 hover:bg-green-700
                text-white
                px-6 py-2.5
                rounded-xl
                font-medium
              "
            >
              Import Data
            </button>
          </div>
        )}
      </div>
    </>
  );
}