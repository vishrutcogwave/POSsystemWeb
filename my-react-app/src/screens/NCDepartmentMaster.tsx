import React, { useEffect, useState } from "react";

import Header from "../components/Header";

import {
  DataTable,
  type Column,
} from "../components/DataTableForMasters";

import {
  createNCDepartmentMaster,
  deleteNCDepartmentMaster,
  getNCDepartmentMasterList,
  getNextIdCode,
  updateNCDepartmentMaster,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";

import toast from "react-hot-toast";
import Loader from "../components/Loader";

type NCDepartmentMaster = {
  id: number;

  ncDepCode: number;

  ncDepName: string;

  userid: string;

  lastModify: string;

  branch_Code: string;
};

export default function NCDepartmentMaster() {
  const { appData } = useAppContext();

  const [loading, setLoading] =
    useState(false);

  const [isEdit, setIsEdit] =
    useState(false);

  const [data, setData] = useState<
    NCDepartmentMaster[]
  >([]);

  const [deleteRow, setDeleteRow] =
    useState<NCDepartmentMaster | null>(
      null
    );

  const [form, setForm] = useState({
    ncDepCode: "",
    ncDepName: "",
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
        tableName:
          "NCDepartment",

        columnName:
          "NCDepCode",

        conditionName:
          "Branch_Code",

        branch:
          appData?.user
            ?.branch_code,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,

          ncDepCode:
            res.data.toString(),
        }));
      }
    } catch (err) {
      console.error(
        "Error fetching code",
        err
      );
    }
  };

  /* =========================
      FETCH LIST
  ========================= */

  const fetchNCDepartments =
    async () => {
      try {
        setLoading(true);

        const res =
          await getNCDepartmentMasterList(
            appData?.user
              ?.branch_code
          );

        if (res?.success) {
          const formattedData = (
            res.data || []
          ).map((item: any) => ({
            id: item.ncDepCode,

            ncDepCode:
              item.ncDepCode,

            ncDepName:
              item.ncDepName,

            userid:
              item.userid,

            lastModify:
              item.lastModify,

            branch_Code:
              item.branch_Code,
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

    fetchNCDepartments();
  }, []);

  /* =========================
      SAVE
  ========================= */

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        ncDepCode: Number(
          form.ncDepCode
        ),

        ncDepName:
          form.ncDepName,

        userid:
          appData?.user?.userCode?.toString(),

        lastModify:
          new Date().toISOString(),

        branch_Code:
          appData?.user
            ?.branch_code,
      };

      const res =
        await createNCDepartmentMaster(
          payload
        );

      if (res?.success) {
        toast.success(
          "NC Department Created Successfully ✅"
        );

        setForm({
          ncDepCode: "",
          ncDepName: "",
        });

        await fetchNextCode();

        fetchNCDepartments();
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
    row: NCDepartmentMaster
  ) => {
    setIsEdit(true);

    setForm({
      ncDepCode:
        row.ncDepCode.toString(),

      ncDepName:
        row.ncDepName,
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
          ncDepCode: Number(
            form.ncDepCode
          ),

          ncDepName:
            form.ncDepName,

          userid:
            appData?.user?.userCode?.toString(),

          lastModify:
            new Date().toISOString(),

          branch_Code:
            appData?.user
              ?.branch_code,
        };

        const res =
          await updateNCDepartmentMaster(
            payload
          );

        if (res?.success) {
          toast.success(
            "Updated Successfully ✅"
          );

          setIsEdit(false);

          setForm({
            ncDepCode: "",
            ncDepName: "",
          });

          await fetchNextCode();

          fetchNCDepartments();
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
    row: NCDepartmentMaster
  ) => {
    setDeleteRow(row);
  };

  const confirmDelete =
    async () => {
      if (!deleteRow) return;

      try {
        setLoading(true);

        const res =
          await deleteNCDepartmentMaster(
            deleteRow.ncDepCode,

            appData?.user
              ?.branch_code
          );

        if (res?.success) {
          toast.success(
            "Deleted Successfully ✅"
          );

          await fetchNextCode();

          fetchNCDepartments();
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

  const columns: Column<NCDepartmentMaster>[] =
    [
      {
        header:
          "NC Dep Code",

        accessor:
          "ncDepCode",
      },

      {
        header:
          "NC Dep Name",

        accessor:
          "ncDepName",
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
            NC Department Master
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* CODE */}

            <div className="flex flex-col">

              <label className="text-sm text-gray-600 mb-1">
                NC Dep Code
              </label>

              <input
                name="ncDepCode"
                value={
                  form.ncDepCode
                }
                disabled
                className="border rounded-lg px-3 py-2 text-sm bg-gray-100"
              />
            </div>

            {/* NAME */}

            <div className="flex flex-col">

              <label className="text-sm text-gray-600 mb-1">
                NC Dep Name
              </label>

              <input
                name="ncDepName"
                value={
                  form.ncDepName
                }
                onChange={
                  handleChange
                }
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex gap-3 justify-end mt-6">

            {!isEdit ? (
              <button
                onClick={
                  handleSave
                }
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            ) : (
              <>
                <button
                  onClick={
                    handleUpdate
                  }
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Update
                </button>

                <button
                  onClick={async () => {
                    setIsEdit(
                      false
                    );

                    setForm({
                      ncDepCode:
                        "",

                      ncDepName:
                        "",
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
            NC Department List
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
                    deleteRow.ncDepName
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