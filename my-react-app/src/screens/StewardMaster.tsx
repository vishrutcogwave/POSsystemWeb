import React, { useEffect, useState } from "react";

import Header from "../components/Header";

import {
  DataTable,
  type Column,
} from "../components/DataTableForMasters";

import {
  createStewardMaster,
  deleteStewardMaster,
  getNextIdCode,
  getStewardMasterList,
  updateStewardMaster,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";

import toast from "react-hot-toast";
import Loader from "../components/Loader";

type StewardMaster = {
  id: number;

  stwCode: number;

  posCode: string;

  stwName: string;

  userCode: string;

  lastModify: string;

  branch_Code: string;

  mobNo: string;
};

export default function StewardMaster() {
  const { appData } = useAppContext();

  const [loading, setLoading] =
    useState(false);

  const [isEdit, setIsEdit] =
    useState(false);

  const [data, setData] = useState<
    StewardMaster[]
  >([]);

  const [deleteRow, setDeleteRow] =
    useState<StewardMaster | null>(
      null
    );

  const [form, setForm] = useState({
    stwCode: "",
    stwName: "",
    mobNo: "",
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
        tableName: "StewardMaster",
        columnName: "StwCode",
        conditionName: "Branch_Code",
        branch:
          appData?.user?.branch_code,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          stwCode:
            res.data.toString(),
        }));
      }
    } catch (err) {
      console.error(
        "Error fetching steward code",
        err
      );
    }
  };

  /* =========================
      FETCH LIST
  ========================= */

  const fetchStewards =
    async () => {
      try {
        setLoading(true);

        const res =
          await getStewardMasterList(
            appData?.user?.branch_code
          );

        if (res?.success) {
          const formattedData = (
            res.data || []
          ).map((item: any) => ({
            id: item.stwCode,

            stwCode:
              item.stwCode,

            posCode:
              item.posCode,

            stwName:
              item.stwName,

            userCode:
              item.userCode,

            lastModify:
              item.lastModify,

            branch_Code:
              item.branch_Code,

            mobNo: item.mobNo,
          }));

          setData(formattedData);
        } else {
          toast.error(
            res?.message ||
              "Failed to fetch ❌"
          );
        }
      } catch (err) {
        console.error(err);

        toast.error(
          "Error fetching stewards ❌"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchNextCode();
    fetchStewards();
  }, []);

  /* =========================
      SAVE
  ========================= */

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        stwCode: Number(
          form.stwCode
        ),

        posCode: "1",

        stwName: form.stwName,

        userCode:
          appData?.user?.userCode?.toString(),

        lastModify:
          new Date().toISOString(),

        branch_Code:
          appData?.user?.branch_code,

        mobNo: form.mobNo,
      };

      const res =
        await createStewardMaster(
          payload
        );

      if (res?.success) {
        toast.success(
          "Steward Created Successfully ✅"
        );

        setForm({
          stwCode: "",
          stwName: "",
          mobNo: "",
        });

        await fetchNextCode();

        fetchStewards();
      } else {
        toast.error(
          res?.message ||
            "Failed to create ❌"
        );
      }
    } catch (err) {
      console.error(err);

      toast.error(
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
    row: StewardMaster
  ) => {
    setIsEdit(true);

    setForm({
      stwCode:
        row.stwCode.toString(),

      stwName:
        row.stwName,

      mobNo: row.mobNo,
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
          stwCode: Number(
            form.stwCode
          ),

          posCode: "1",

          stwName:
            form.stwName,

          userCode:
            appData?.user?.userCode?.toString(),

          lastModify:
            new Date().toISOString(),

          branch_Code:
            appData?.user
              ?.branch_code,

          mobNo:
            form.mobNo,
        };

        const res =
          await updateStewardMaster(
            payload
          );

        if (res?.success) {
          toast.success(
            "Updated Successfully ✅"
          );

          setIsEdit(false);

          setForm({
            stwCode: "",
            stwName: "",
            mobNo: "",
          });

          await fetchNextCode();

          fetchStewards();
        } else {
          toast.error(
            res?.message ||
              "Update failed ❌"
          );
        }
      } catch (err) {
        console.error(err);

        toast.error(
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
    row: StewardMaster
  ) => {
    setDeleteRow(row);
  };

  const confirmDelete =
    async () => {
      if (!deleteRow) return;

      try {
        setLoading(true);

        const res =
          await deleteStewardMaster(
            deleteRow.stwCode,
            appData?.user
              ?.branch_code
          );

        if (res?.success) {
          toast.success(
            "Deleted Successfully ✅"
          );

          await fetchNextCode();

          fetchStewards();
        } else {
          toast.error(
            res?.message ||
              "Delete failed ❌"
          );
        }
      }  catch (err: any) {
  console.error(err);

  toast.error(
    err?.response?.data?.message ||
    err?.message ||
    "Error deleting ❌"
  );
} finally {
        setLoading(false);

        setDeleteRow(null);
      }
    };

  /* =========================
      TABLE COLUMNS
  ========================= */

  const columns: Column<StewardMaster>[] =
    [
      {
        header: "Steward Code",
        accessor: "stwCode",
      },

      {
        header: "Steward Name",
        accessor: "stwName",
      },

      {
        header: "Mobile Number",
        accessor: "mobNo",
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
            Steward Master
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* CODE */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Steward Code
              </label>

              <input
                name="stwCode"
                value={form.stwCode}
                disabled
                className="border rounded-lg px-3 py-2 text-sm bg-gray-100"
              />
            </div>

            {/* NAME */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Steward Name
              </label>

              <input
                name="stwName"
                value={form.stwName}
                onChange={
                  handleChange
                }
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* MOBILE */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Mobile Number
              </label>

              <input
                name="mobNo"
                value={form.mobNo}
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
                      stwCode: "",
                      stwName: "",
                      mobNo: "",
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
            Steward Master List
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
                    deleteRow.stwName
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