import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  DataTable,
  type Column,
} from "../components/DataTableForMasters";

import {
  createUnitMaster,
  deleteUnitMaster,
  getNextIdCode,
  getUnitMasterList,
  updateUnitMaster,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

type UnitMaster = {
  id: number; // ✅ ADD THIS
  unitCode: number;
  unitName: string;
  unitSymbol: string;
  branch_Code: string;
};

export default function UnitMaster() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [data, setData] = useState<UnitMaster[]>([]);

  const [deleteRow, setDeleteRow] =
    useState<UnitMaster | null>(null);

  const [form, setForm] = useState({
    unitCode: "",
    unitName: "",
    unitSymbol: "",
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
        tableName: "UnitMaster",
        columnName: "UnitCode",
        conditionName: "Branch_Code",
        branch: appData?.user?.branch_code,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          unitCode: res.data.toString(),
        }));
      }
    } catch (err) {
      console.error(
        "Error fetching unit code",
        err
      );
    }
  };

  /* =========================
      FETCH LIST
  ========================= */

 const fetchUnits = async () => {
  try {
    setLoading(true);

    const res = await getUnitMasterList(
      appData?.user?.branch_code
    );

    if (res?.success) {

      const formattedData = (res.data || []).map(
        (item: any) => ({
          id: item.unitCode, // ✅ IMPORTANT
          unitCode: item.unitCode,
          unitName: item.unitName,
          unitSymbol: item.unitSymbol,
          branch_Code: item.branch_Code,
        })
      );

      setData(formattedData);

    } else {
      toast.error(
        res?.message || "Failed to fetch ❌"
      );
    }
  } catch (err) {
    console.error(err);
    toast.error("Error fetching units ❌");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchNextCode();
    fetchUnits();
  }, []);

  /* =========================
      SAVE
  ========================= */

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        unitCode: Number(form.unitCode),
        unitName: form.unitName,
        unitSymbol: form.unitSymbol,
        branch_Code:
          appData?.user?.branch_code,
      };

      const res = await createUnitMaster(
        payload
      );

      if (res?.success) {
        toast.success(
          "Unit Created Successfully ✅"
        );

        setForm({
          unitCode: "",
          unitName: "",
          unitSymbol: "",
        });

        await fetchNextCode();
        fetchUnits();
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
    row: UnitMaster
  ) => {
    setIsEdit(true);

    setForm({
      unitCode: row.unitCode.toString(),
      unitName: row.unitName,
      unitSymbol: row.unitSymbol,
    });
  };

  /* =========================
      UPDATE
  ========================= */

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const payload = {
        unitCode: Number(form.unitCode),
        unitName: form.unitName,
        unitSymbol: form.unitSymbol,
        branch_Code:
          appData?.user?.branch_code,
      };

      const res = await updateUnitMaster(
        payload
      );

      if (res?.success) {
        toast.success("Updated Successfully ✅");

        setIsEdit(false);

        setForm({
          unitCode: "",
          unitName: "",
          unitSymbol: "",
        });

        await fetchNextCode();
        fetchUnits();
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
    row: UnitMaster
  ) => {
    setDeleteRow(row);
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;

    try {
      setLoading(true);

      const res = await deleteUnitMaster(
        deleteRow.unitCode
      );

      if (res?.success) {
        toast.success(
          "Deleted Successfully ✅"
        );
    await fetchNextCode();

        fetchUnits();
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

  const columns: Column<UnitMaster>[] = [
    {
      header: "Unit Code",
      accessor: "unitCode",
    },
    {
      header: "Unit Name",
      accessor: "unitName",
    },
    {
      header: "Unit Symbol",
      accessor: "unitSymbol",
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
            Unit Master
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* UNIT CODE */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Unit Code
              </label>

              <input
                name="unitCode"
                value={form.unitCode}
                disabled
                className="border rounded-lg px-3 py-2 text-sm bg-gray-100"
              />
            </div>

            {/* UNIT NAME */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Unit Name
              </label>

              <input
                name="unitName"
                value={form.unitName}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* UNIT SYMBOL */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Unit Symbol
              </label>

              <input
                name="unitSymbol"
                value={form.unitSymbol}
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
                      unitCode: "",
                      unitName: "",
                      unitSymbol: "",
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
            Unit Master List
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
                  {deleteRow.unitName}
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