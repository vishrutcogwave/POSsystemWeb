import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  DataTable,
  type Column,
} from "../components/DataTableForMasters";

import {
  createGroupMaster,
  deleteGroupMaster,
  getGroupMasterList,
  getNextIdCode,
  updateGroupMaster,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

type GroupMaster = {
  id: number;
  grpCode: number;
  grpName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  isuploaded: string;
  dep: string;
};

export default function GroupMaster() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [data, setData] = useState<GroupMaster[]>([]);

  const [deleteRow, setDeleteRow] =
    useState<GroupMaster | null>(null);

  const [form, setForm] = useState({
    grpCode: "",
    grpName: "",
  });

  /* =========================
      HANDLE CHANGE
  ========================= */

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
        tableName: "ItemGroup",
        columnName: "GrpCode",
        conditionName: "Branch_Code",
        branch: appData?.user?.branch_code,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          grpCode: res.data.toString(),
        }));
      }
    } catch (err) {
      console.error(
        "Error fetching group code",
        err
      );
    }
  };

  /* =========================
      FETCH GROUPS
  ========================= */

  const fetchGroups = async () => {
    try {
      setLoading(true);

      const res = await getGroupMasterList(
        appData?.user?.branch_code
      );

      if (res?.success) {
        const formattedData = (
          res.data || []
        ).map((item: any) => ({
          id: item.grpCode,
          grpCode: item.grpCode,
          grpName: item.grpName,
          userCode: item.userCode,
          lastModify: item.lastModify,
          branch_Code: item.branch_Code,
          isuploaded: item.isuploaded,
          dep: item.dep,
        }));

        setData(formattedData);
      } else {
        toast.error(
          res?.message || "Failed ❌"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextCode();
    fetchGroups();
  }, []);

  /* =========================
      SAVE
  ========================= */

  const handleSave = async () => {
    try {
      setLoading(true);

     const payload = {
  grpCode: Number(form.grpCode),
  grpName: form.grpName,
  userCode:
    appData?.user?.userCode?.toString(),

  lastModify: new Date().toISOString(),

  branch_Code:
    appData?.user?.branch_code,

  isuploaded: "0",

  // ✅ first character of grpName
  dep: form.grpName.charAt(0).toUpperCase(),
};

      const res = await createGroupMaster(
        payload
      );

      if (res?.success) {
        toast.success(
          "Group Created Successfully ✅"
        );

        setForm({
          grpCode: "",
          grpName: "",
        });

        await fetchNextCode();
        fetchGroups();
      } else {
        toast.error(
          res?.message ||
            "Failed to create ❌"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating ❌");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      EDIT
  ========================= */

  const handleEdit = (
    row: GroupMaster
  ) => {
    setIsEdit(true);

    setForm({
      grpCode: row.grpCode.toString(),
      grpName: row.grpName,
    });
  };

  /* =========================
      UPDATE
  ========================= */

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const payload = {
        grpCode: Number(form.grpCode),
        grpName: form.grpName,
        userCode:
          appData?.user?.userCode?.toString(),
        lastModify: new Date().toISOString(),
        branch_Code:
          appData?.user?.branch_code,
        isuploaded: "0",
       dep: form.grpName.charAt(0).toUpperCase(),
      };

      const res = await updateGroupMaster(
        payload
      );

      if (res?.success) {
        toast.success(
          "Updated Successfully ✅"
        );

        setIsEdit(false);

        setForm({
          grpCode: "",
          grpName: "",
        });

        await fetchNextCode();
        fetchGroups();
      } else {
        toast.error(
          res?.message ||
            "Update failed ❌"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating ❌");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      DELETE
  ========================= */

  const handleDeleteRow = (
    row: GroupMaster
  ) => {
    setDeleteRow(row);
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;

    try {
      setLoading(true);

      const res = await deleteGroupMaster(
        deleteRow.grpCode,
        appData?.user?.branch_code
      );

      if (res?.success) {
        toast.success(
          "Deleted Successfully ✅"
        );
    await fetchNextCode();
        fetchGroups();
      } else {
        toast.error(
          res?.message ||
            "Delete failed ❌"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting ❌");
    } finally {
      setLoading(false);
      setDeleteRow(null);
    }
  };

  /* =========================
      TABLE COLUMNS
  ========================= */

  const columns: Column<GroupMaster>[] = [
    {
      header: "Group Code",
      accessor: "grpCode",
    },
    {
      header: "Group Name",
      accessor: "grpName",
    },
  ];

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}

        {/* ================= FORM ================= */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            Group Master
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GROUP CODE */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Group Code
              </label>

              <input
                name="grpCode"
                value={form.grpCode}
                disabled
                className="border rounded-lg px-3 py-2 text-sm bg-gray-100"
              />
            </div>

            {/* GROUP NAME */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Group Name
              </label>

              <input
                name="grpName"
                value={form.grpName}
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
                      grpCode: "",
                      grpName: "",
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

        {/* ================= TABLE ================= */}

        <div>
          <h2 className="text-lg font-semibold mb-3">
            Group Master List
          </h2>

          <DataTable
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={handleDeleteRow}
          />
        </div>

        {/* ================= DELETE MODAL ================= */}

        {deleteRow && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm">
              <h2 className="text-lg font-semibold mb-3">
                Confirm Delete
              </h2>

              <p className="text-sm text-gray-600 mb-5">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteRow.grpName}
                </span>
                ?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setDeleteRow(null)
                  }
                  className="px-4 py-2 rounded-lg border text-gray-600"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
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