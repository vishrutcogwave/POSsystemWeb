import React, { useEffect, useState } from "react";

import Header from "../components/Header";

import {
  DataTable,
  type Column,
} from "../components/DataTableForMasters";

import {
  createPrintingMaster,
  deletePrintingMaster,
  getNextIdCode,
  getPrintingMasterList,
  updatePrintingMaster,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";

import toast from "react-hot-toast";
import Loader from "../components/Loader";

type PrintingMaster = {
  id: number;

  depCode: number;

  depName: string;

  userCode: string;

  lastModify: string;

  branch_Code: string;

  isUploaded: string;
};

export default function PrintingMaster() {
  const { appData } = useAppContext();

  const [loading, setLoading] =
    useState(false);

  const [isEdit, setIsEdit] =
    useState(false);

  const [data, setData] = useState<
    PrintingMaster[]
  >([]);

  const [deleteRow, setDeleteRow] =
    useState<PrintingMaster | null>(
      null
    );

  const [form, setForm] = useState({
    depCode: "",
    depName: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================
      FETCH NEXT CODE
  ========================= */

  const fetchNextCode = async () => {
    try {
      const res = await getNextIdCode({
        tableName: "PrintingDepartment",

        columnName: "DepCode",

        conditionName: "Branch_Code",

        branch:
          appData?.user?.branch_code,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,

          depCode:
            res.data.toString(),
        }));
      }
    } catch (err) {
      console.error(
        "Error fetching dep code",
        err
      );
    }
  };

  /* =========================
      FETCH LIST
  ========================= */

  const fetchPrintingMasters =
    async () => {
      try {
        setLoading(true);

        const res =
          await getPrintingMasterList(
            appData?.user
              ?.branch_code
          );

        if (res?.success) {
          const formattedData = (
            res.data || []
          ).map((item: any) => ({
            id: item.depCode,

            depCode: item.depCode,

            depName: item.depName,

            userCode:
              item.userCode,

            lastModify:
              item.lastModify,

            branch_Code:
              item.branch_Code,

            isUploaded:
              item.isUploaded,
          }));

          setData(formattedData);
        } else {
          toast.error(
            res?.message ||
              "Failed to fetch ❌"
          );
        }
      } catch (err: any) {
        console.error(err);

        toast.error(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Error fetching ❌"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchNextCode();

    fetchPrintingMasters();
  }, []);

  /* =========================
      SAVE
  ========================= */

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        depCode: Number(
          form.depCode
        ),

        depName: form.depName,

        userCode:
          appData?.user?.userCode?.toString(),

        lastModify:
          new Date().toISOString(),

        branch_Code:
          appData?.user
            ?.branch_code,

        isUploaded: "0",
      };

      const res =
        await createPrintingMaster(
          payload
        );

      if (res?.success) {
        toast.success(
          "Printing Master Created Successfully ✅"
        );

        setForm({
          depCode: "",
          depName: "",
        });

        await fetchNextCode();

        fetchPrintingMasters();
      } else {
        toast.error(
          res?.message ||
            "Failed to create ❌"
        );
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Error creating ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      EDIT
  ========================= */

  const handleEdit = (
    row: PrintingMaster
  ) => {
    setIsEdit(true);

    setForm({
      depCode:
        row.depCode.toString(),

      depName: row.depName,
    });
  };

  /* =========================
      UPDATE
  ========================= */

  const handleUpdate =
    async () => {
      try {
        setLoading(true);

        const payload = {
          depCode: Number(
            form.depCode
          ),

          depName:
            form.depName,

          userCode:
            appData?.user?.userCode?.toString(),

          lastModify:
            new Date().toISOString(),

          branch_Code:
            appData?.user
              ?.branch_code,

          isUploaded: "0",
        };

        const res =
          await updatePrintingMaster(
            payload
          );

        if (res?.success) {
          toast.success(
            "Updated Successfully ✅"
          );

          setIsEdit(false);

          setForm({
            depCode: "",
            depName: "",
          });

          await fetchNextCode();

          fetchPrintingMasters();
        } else {
          toast.error(
            res?.message ||
              "Update failed ❌"
          );
        }
      } catch (err: any) {
        console.error(err);

        toast.error(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Error updating ❌"
        );
      } finally {
        setLoading(false);
      }
    };

  /* =========================
      DELETE
  ========================= */

  const handleDeleteRow = (
    row: PrintingMaster
  ) => {
    setDeleteRow(row);
  };

  const confirmDelete =
    async () => {
      if (!deleteRow) return;

      try {
        setLoading(true);

        const res =
          await deletePrintingMaster(
            deleteRow.depCode,

            appData?.user
              ?.branch_code
          );

        if (res?.success) {
          toast.success(
            "Deleted Successfully ✅"
          );

          await fetchNextCode();

          fetchPrintingMasters();
        } else {
          toast.error(
            res?.message ||
              "Delete failed ❌"
          );
        }
      } catch (err: any) {
        console.error(err);

        toast.error(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Error deleting ❌"
        );
      } finally {
        setLoading(false);

        setDeleteRow(null);
      }
    };

  /* =========================
      TABLE
  ========================= */

  const columns: Column<PrintingMaster>[] =
    [
      {
        header: "Dep Code",

        accessor: "depCode",
      },

      {
        header: "Dep Name",

        accessor: "depName",
      },
    ];

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">

        {loading && <Loader />}

        {/* FORM */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">

          <h2 className="text-lg font-semibold mb-4">
            Printing Master
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* DEP CODE */}

            <div className="flex flex-col">

              <label className="text-sm text-gray-600 mb-1">
                Dep Code
              </label>

              <input
                name="depCode"
                value={form.depCode}
                disabled
                className="border rounded-lg px-3 py-2 text-sm bg-gray-100"
              />
            </div>

            {/* DEP NAME */}

            <div className="flex flex-col">

              <label className="text-sm text-gray-600 mb-1">
                Dep Name
              </label>

              <input
                name="depName"
                value={form.depName}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex gap-3 justify-end mt-6">

            {!isEdit ? (
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Update
                </button>

                <button
                  onClick={async () => {
                    setIsEdit(false);

                    setForm({
                      depCode: "",
                      depName: "",
                    });

                    await fetchNextCode();
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* TABLE */}

        <div>
          <h2 className="text-lg font-semibold mb-3">
            Printing Master List
          </h2>

          <DataTable
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={
              handleDeleteRow
            }
          />
        </div>

        {/* DELETE MODAL */}

        {deleteRow && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm">

              <h2 className="text-lg font-semibold mb-3">
                Confirm Delete
              </h2>

              <p className="text-sm text-gray-600 mb-5">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {
                    deleteRow.depName
                  }
                </span>
                ?
              </p>

              <div className="flex justify-end gap-3">

                <button
                  onClick={() =>
                    setDeleteRow(
                      null
                    )
                  }
                  className="px-4 py-2 rounded-lg border text-gray-600"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    confirmDelete
                  }
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}