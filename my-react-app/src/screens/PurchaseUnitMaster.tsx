import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  DataTable,
  type Column,
} from "../components/DataTableForMasters";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

import {
  createInventoryUnitConversion,
  deleteInventoryUnitConversion,
  getInventoryUnitConversionList,
  getNextIdCode,
  updateInventoryUnitConversion,
} from "../api/services/products.service";

type PurchaseUnit = {
  // Required by DataTableForMasters
  id: number;

  // Actual API fields
  unitCode: string;
  unitName: string;
  qty: number;
  isActive: boolean;
  branch_Code: string;
  createdBy: string;
  createdDate: string;
};

export default function PurchaseUnitMaster() {
  const { appData } = useAppContext();

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    unitCode: "",
    unitName: "",
    qty: "",
    isActive: true,
  });

  const [data, setData] = useState<PurchaseUnit[]>([]);
  const [deleteRow, setDeleteRow] =
    useState<PurchaseUnit | null>(null);

  /* ================= CHANGE ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ================= FETCH LIST ================= */

  const fetchPurchaseUnits = async () => {
    try {
      setLoading(true);

      const branch = appData?.user?.branch_code;

      if (!branch) return;

      const res =
        await getInventoryUnitConversionList(branch);

      if (res?.success) {
        const formatted: PurchaseUnit[] =
          (res.data || []).map((item: any) => ({
            // DataTable requires id
            // API does not return id
            id: Number(item.unitCode),

            unitCode:
              item.unitCode?.toString() || "",

            unitName:
              item.unitName || "",

            qty:
              Number(item.qty) || 0,

            isActive:
              item.isActive ?? true,

            branch_Code:
              item.branch_Code || "",

            createdBy:
              item.createdBy || "",

            createdDate:
              item.createdDate
                ? item.createdDate.split("T")[0]
                : "",
          }));

        setData(formatted);
      } else {
        toast.error(
          res?.message ||
            "Failed to fetch purchase units ❌",
        );
      }
    } catch (error) {
      console.error(
        "Error fetching purchase units:",
        error,
      );

      toast.error(
        "Error fetching purchase units ❌",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= NEXT UNIT CODE ================= */

  const fetchNextId = async () => {
    try {
      const branch =
        appData?.user?.branch_code;

      if (!branch) return;

      const res = await getNextIdCode({
        tableName: "InventoryUnitMaster",
        columnName: "UnitCode",
        conditionName: "Branch_Code",
        branch,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          unitCode:
            res.data?.toString() || "",
        }));
      }
    } catch (error) {
      console.error(
        "Error fetching next Unit Code:",
        error,
      );
    }
  };

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    if (appData?.user?.branch_code) {
      fetchNextId();
      fetchPurchaseUnits();
    }
  }, [appData?.user?.branch_code]);

  /* ================= SAVE ================= */

  const handleSave = async () => {
    try {
      if (!form.unitCode.trim()) {
        toast.error("Please enter Unit Code");
        return;
      }

      if (!form.unitName.trim()) {
        toast.error("Please enter Unit Name");
        return;
      }

      if (
        !form.qty ||
        Number(form.qty) <= 0
      ) {
        toast.error(
          "Please enter valid Quantity",
        );
        return;
      }

      setLoading(true);

      const payload = {
        unitCode: Number(form.unitCode),
        unitName: form.unitName,
        qty: Number(form.qty),
        isActive: form.isActive,
        branch_Code:
          appData?.user?.branch_code || "",
        createdBy:
          appData?.user?.userCode?.toString() ||
          "",
        createdDate:
          new Date().toISOString(),
      };

      const res =
        await createInventoryUnitConversion(
          payload,
        );

      if (res?.success) {
        toast.success(
          "Purchase Unit Created ✅",
        );

        resetForm();

        await fetchNextId();
        await fetchPurchaseUnits();
      } else {
        toast.error(
          res?.message ||
            "Create failed ❌",
        );
      }
    } catch (error) {
      console.error(
        "Error saving purchase unit:",
        error,
      );

      toast.error(
        "Error saving purchase unit ❌",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    try {
      if (!form.unitCode.trim()) {
        toast.error("Please enter Unit Code");
        return;
      }

      if (!form.unitName.trim()) {
        toast.error("Please enter Unit Name");
        return;
      }

      if (
        !form.qty ||
        Number(form.qty) <= 0
      ) {
        toast.error(
          "Please enter valid Quantity",
        );
        return;
      }

      setLoading(true);

      const payload = {
        unitCode:Number(form.unitCode),
        unitName: form.unitName,
        qty: Number(form.qty),
        isActive: form.isActive,
        branch_Code:
          appData?.user?.branch_code || "",
        createdBy:
          appData?.user?.userCode?.toString() ||
          "",
        createdDate:
          new Date().toISOString(),
      };

      const res =
        await updateInventoryUnitConversion(
          payload,
        );

      if (res?.success) {
        toast.success(
          "Purchase Unit Updated ✅",
        );

        setIsEdit(false);

        resetForm();

        await fetchNextId();
        await fetchPurchaseUnits();
      } else {
        toast.error(
          res?.message ||
            "Update failed ❌",
        );
      }
    } catch (error) {
      console.error(
        "Error updating purchase unit:",
        error,
      );

      toast.error(
        "Error updating purchase unit ❌",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = (
    row: PurchaseUnit,
  ) => {
    setIsEdit(true);

    setForm({
      unitCode: row.unitCode,
      unitName: row.unitName,
      qty: row.qty.toString(),
      isActive: row.isActive,
    });
  };

  /* ================= DELETE ================= */

  const handleDeleteRow = (
    row: PurchaseUnit,
  ) => {
    setDeleteRow(row);
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;

    try {
      setLoading(true);

      const branch =
        appData?.user?.branch_code;

      if (!branch) {
        toast.error("Branch not found");
        return;
      }

      // API DELETE uses unitCode as id
      const res =
        await deleteInventoryUnitConversion(
          Number(deleteRow.unitCode),
          branch,
        );

      if (res?.success) {
        toast.success(
          "Deleted successfully ✅",
        );

        await fetchNextId();
        await fetchPurchaseUnits();
      } else {
        toast.error(
          res?.message ||
            "Delete failed ❌",
        );
      }
    } catch (error) {
      console.error(
        "Error deleting purchase unit:",
        error,
      );

      toast.error(
        "Error deleting purchase unit ❌",
      );
    } finally {
      setLoading(false);
      setDeleteRow(null);
    }
  };

  /* ================= RESET ================= */

  const resetForm = () => {
    setForm({
      unitCode: "",
      unitName: "",
      qty: "",
      isActive: true,
    });
  };

  /* ================= CANCEL ================= */

  const handleCancel = async () => {
    setIsEdit(false);

    resetForm();

    await fetchNextId();
  };

  /* ================= TABLE ================= */

  const columns: Column<PurchaseUnit>[] = [
    {
      header: "Unit Code",
      accessor: "unitCode",
    },
    {
      header: "Unit Name",
      accessor: "unitName",
    },
    {
      header: "Quantity",
      accessor: "qty",
    },
    {
      header: "Active",
      accessor: "isActive",
    },
    {
      header: "Created By",
      accessor: "createdBy",
    },
    {
      header: "Created Date",
      accessor: "createdDate",
    },
  ];

  return (
    <>
      <Header
        showNeworderButton={false}
      />

      <div className="h-screen overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">

        {loading && <Loader />}

        {/* ================= FORM ================= */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">

          <h2 className="text-lg font-semibold mb-4">
            Purchase Unit Master
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* UNIT CODE */}

            <input
              name="unitCode"
              disabled
              value={form.unitCode}
              className="border p-2 rounded bg-gray-100"
              placeholder="Unit Code"
            />

            {/* UNIT NAME */}

            <input
              name="unitName"
              value={form.unitName}
              onChange={handleChange}
              className="border p-2 rounded"
              placeholder="Unit Name"
            />

            {/* QUANTITY */}

            <input
              name="qty"
              type="number"
              value={form.qty}
              onChange={handleChange}
              className="border p-2 rounded"
              placeholder="Quantity"
              min="1"
            />

            {/* ACTIVE */}

            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />

              <span>
                Is Active
              </span>
            </label>

          </div>

          {/* ================= BUTTONS ================= */}

          <div className="flex gap-3 mt-6 justify-end">

            {!isEdit && (
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            )}

            {isEdit && (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Update
                </button>

                <button
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </>
            )}

          </div>
        </div>

        {/* ================= TABLE ================= */}

        <DataTable
          columns={columns}
          data={data}
          onEdit={handleEdit}
          onDelete={handleDeleteRow}
        />

        {/* ================= DELETE MODAL ================= */}

        {deleteRow && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

            <div className="bg-white p-6 rounded-lg">

              <p>
                Delete{" "}
                <strong>
                  {deleteRow.unitName}
                </strong>
                ?
              </p>

              <div className="flex gap-3 mt-4">

                <button
                  onClick={() =>
                    setDeleteRow(null)
                  }
                  className="px-3 py-1"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  className="bg-red-500 text-white px-3 py-1 rounded"
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