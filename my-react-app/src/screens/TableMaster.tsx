import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import Header from "../components/Header";

import {
  DataTable,
  type Column,
} from "../components/DataTableForMasters";


import {
  createItemMasterWithImage,
  createTableMaster,
  deleteTableMaster,
  getCombinedOutletAndTableMasterList,
  getNextIdCode,
  getTableMasterList,
  updateTableMaster,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";

import toast from "react-hot-toast";

import Loader from "../components/Loader";
import { Download, ImageOff } from "lucide-react";

type TableMaster = {
  id: number;
  tblCode: number;
  oltCode: string;
  tblNo: string;
  tblSeatCount: number;
  userCode: string;
  lastModify: string;
  poscode: string;
  branch_Code: string;

  tableQRImage?: string;
};
type Outlet = {
  oltCode: number;
  oltName: string;
};
export default function TableMaster() {
  const { appData } = useAppContext();

  const [loading, setLoading] =
    useState(false);

  const [isEdit, setIsEdit] =
    useState(false);

  const [data, setData] = useState<
    TableMaster[]
  >([]);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [deleteRow, setDeleteRow] =
    useState<TableMaster | null>(null);
const [outlets, setOutlets] =
  useState<Outlet[]>([]);
const [form, setForm] =
  useState<TableMaster>({
    id: 0,
    tblCode: 0,
    oltCode: "",
    tblNo: "",
    tblSeatCount: 0,
    userCode: "",
    lastModify: "",
    poscode: "1",
    branch_Code:
      appData?.user?.branch_code || "",

    tableQRImage: "",
  });
const fetchOutlets = async () => {
  try {
    const branch =
      localStorage.getItem("branch") || "";

    const res =
      await getCombinedOutletAndTableMasterList(
        branch
      );

    if (res) {
      const formatted =
        res.map((item: any) => ({
          oltCode: item.oltCode,
          oltName: item.oltName,
        }));

      setOutlets(formatted);
    }
  } catch (err) {
    console.error(err);

    toast.error(
      "Failed to fetch outlets"
    );
  }
};


  const columns: Column<TableMaster>[] = [
    {
      header: "Table Code",
      accessor: "tblCode",
    },

{
  header: "Outlet",
  accessor: "oltCode",

  cell: (row) => {
    const outlet = outlets.find(
      (o) =>
        String(o.oltCode) ===
        String(row.oltCode)
    );

    return outlet?.oltName || "-";
  },
},
    {
      header: "Table No",
      accessor: "tblNo",
    },

    {
      header: "Seats",
      accessor: "tblSeatCount",
    },
{
  header: "QR Code",
  accessor: "tableQRImage",
  className: "text-center",

  cell: (row) => {
    const isValidImage =
      row.tableQRImage &&
      row.tableQRImage.trim() !== "";

    if (!isValidImage) {
      return (
        <div className="flex items-center justify-center">
          <ImageOff
            size={18}
            className="text-gray-400"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center">
        <a
          href={row.tableQRImage}
          download={`QR_${row.tblNo}.png`}
          className="text-blue-500 hover:text-blue-700"
          title="Download QR"
        >
          <Download size={18} />
        </a>
      </div>
    );
  },
},
  ];

  const fetchNextCode = async () => {
    try {
      const res = await getNextIdCode({
        tableName: "TableMaster",

        columnName: "TblCode",

        conditionName: "Branch_Code",

        branch:
          appData?.user?.branch_code,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,

          tblCode: Number(res.data),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTables = async () => {
    try {
      setLoading(true);

      const res =
        await getTableMasterList(
          appData?.user?.branch_code
        );

      if (res?.success) {
        setData(res.data || []);
      }
    } catch (err: any) {
  console.error(err);

  toast.error(
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong"
  );
} finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchNextCode();

  fetchTables();

  fetchOutlets();
}, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        name === "tblCode" ||
        name === "tblSeatCount"
          ? Number(value)
          : value,
    }));
  };

  const resetForm = async () => {
    setForm({
        id:0,
      tblCode: 0,

      oltCode: "",

      tblNo: "",

      tblSeatCount: 0,

      userCode: "",

      lastModify: "",

      poscode: "1",

      branch_Code:
        appData?.user?.branch_code || "",

      tableQRImage: "",
    });

    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsEdit(false);

    await fetchNextCode();
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      let qrUrl = "";

      if (selectedImage) {
        const imageRes =
          await createItemMasterWithImage(
            selectedImage
          );

        if (imageRes?.success) {
          const baseUrl =
            localStorage.getItem(
              "baseUrl"
            ) || "";

          const cleanBaseUrl =
            baseUrl.endsWith("/")
              ? baseUrl.slice(0, -1)
              : baseUrl;

          const fileName =
            imageRes.data
              .split("/")
              .pop();

          qrUrl = `${cleanBaseUrl}/Images/${fileName}`;
        }
      }

      const payload = {
        tblCode: form.tblCode,

        oltCode: form.oltCode,

        tblNo: form.tblNo,

        tblSeatCount:
          form.tblSeatCount,

        userCode:
          String(
            appData?.user?.userCode
          ) || "",

        lastModify:
          new Date().toISOString(),

        poscode: form.poscode,

        branch_Code:
          appData?.user?.branch_code ||
          "",

        tableQRImage: qrUrl,
      };

      const res =
        await createTableMaster(
          payload
        );

      if (res?.success) {
        toast.success(
          res.message ||
            "Table created successfully"
        );

        fetchTables();

        resetForm();
      } else {
        toast.error(
          res?.message ||
            "Failed to create"
        );
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          "Error creating table"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: TableMaster) => {
    setIsEdit(true);

    setSelectedImage(null);

    setForm({
      ...row,
    });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      let qrUrl =
        form.tableQRImage || "";

      if (selectedImage) {
        const imageRes =
          await createItemMasterWithImage(
            selectedImage
          );

        if (imageRes?.success) {
          const baseUrl =
            localStorage.getItem(
              "baseUrl"
            ) || "";

          const cleanBaseUrl =
            baseUrl.endsWith("/")
              ? baseUrl.slice(0, -1)
              : baseUrl;

          const fileName =
            imageRes.data
              .split("/")
              .pop();

          qrUrl = `${cleanBaseUrl}/Images/${fileName}`;
        }
      }

      const payload = {
        ...form,

        userCode:
          String(
            appData?.user?.userCode
          ) || "",

        lastModify:
          new Date().toISOString(),

        branch_Code:
          appData?.user?.branch_code ||
          "",

        tableQRImage: qrUrl,
      };

      const res =
        await updateTableMaster(
          payload
        );

      if (res?.success) {
        toast.success(
          res.message ||
            "Updated successfully"
        );

        fetchTables();

        resetForm();
      } else {
        toast.error(
          res?.message ||
            "Update failed"
        );
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          "Error updating"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRow = (
    row: TableMaster
  ) => {
    setDeleteRow(row);
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;

    try {
      setLoading(true);

      const res =
        await deleteTableMaster(
          deleteRow.tblCode
        );

      if (res?.success) {
        toast.success(
          "Deleted successfully"
        );

        fetchTables();

        resetForm();
      } else {
        toast.error(
          res?.message ||
            "Delete failed"
        );
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          "Error deleting"
      );
    } finally {
      setLoading(false);

      setDeleteRow(null);
    }
  };

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            Table Master
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* TABLE CODE */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Table Code
              </label>

              <input
                type="number"
                name="tblCode"
                value={form.tblCode}
                disabled
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* OUTLET */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Outlet Name
              </label>

              <select
                name="oltCode"
                value={form.oltCode}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">
                  Select Outlet
                </option>

            {outlets.map((o) => (
  <option
    key={o.oltCode}
    value={o.oltCode}
  >
    {o.oltName}
  </option>
))}
              </select>
            </div>

            {/* TABLE NO */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Table No
              </label>

              <input
                type="text"
                name="tblNo"
                value={form.tblNo}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* SEAT COUNT */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Seat Count
              </label>

              <input
                type="number"
                name="tblSeatCount"
                value={
                  form.tblSeatCount
                }
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* QR CODE */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">
                QR Code
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (file) {
                    const maxSize =
                      100 * 1024;

                    if (
                      file.size >
                      maxSize
                    ) {
                      toast.error(
                        "Image size must be less than 100 KB"
                      );

                      e.target.value =
                        "";

                      return;
                    }

                    setSelectedImage(
                      file
                    );
                  }
                }}
                className="border rounded-lg px-3 py-2"
              />

              {selectedImage && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(
                      selectedImage
                    )}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(
                        null
                      );

                      if (
                        fileInputRef.current
                      ) {
                        fileInputRef.current.value =
                          "";
                      }
                    }}
                    className="text-red-500 text-sm mt-1"
                  >
                    Remove
                  </button>
                </div>
              )}

              {!selectedImage &&
                form.tableQRImage && (
                  <div className="mt-2">
                    <img
                      src={form.tableQRImage}
                      alt="QR"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            {!isEdit ? (
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                  Update
                </button>

                <button
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* TABLE LIST */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Table List
          </h2>

          <DataTable
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={handleDeleteRow}
          />

          {deleteRow && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm">
                <h2 className="text-lg font-semibold mb-3">
                  Confirm Delete
                </h2>

                <p className="text-sm text-gray-600 mb-5">
                  Are you sure you want
                  to delete table{" "}
                  <span className="font-semibold">
                    {deleteRow.tblNo}
                  </span>
                  ?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() =>
                      setDeleteRow(null)
                    }
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}