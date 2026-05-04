import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
// import {
//   createTax,
//   deleteTax,
//   getTaxList,
//   getNextTaxCode,
//   updateTax,
// } from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { createTaxMaster, deleteTaxMaster, getNextIdCode, getTaxMasterList, updateTaxMaster } from "../api/services/products.service";

type Tax = {
  id: number;
  taxCode: string;
  taxName: string;
  taxPercentage: string;
  isActive: boolean;
  fromDate: string;
  toDate: string;
};

export default function TaxMaster() {
  const { appData } = useAppContext();

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    taxCode: "",
    taxName: "",
    taxPercentage: "",
    isActive: true,
    fromDate: "",
    toDate: "",
  });

  const [data, setData] = useState<Tax[]>([]);
  const [deleteRow, setDeleteRow] = useState<Tax | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /* ================= DELETE ================= */
  const handleDeleteRow = (row: Tax) => {
    setDeleteRow(row);
  };

const confirmDelete = async () => {
  if (!deleteRow) return;

  try {
    setLoading(true);

    const res = await deleteTaxMaster(Number(deleteRow.taxCode));

    if (res?.success) {
      toast.success("Deleted successfully ✅");
        await fetchNextCode();
      fetchTaxes(); // 🔥 refresh table
    } else {
      toast.error(res?.message || "Delete failed ❌");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error deleting ❌");
  } finally {
    setLoading(false);
    setDeleteRow(null);
  }
};

  const cancelDelete = () => setDeleteRow(null);

  /* ================= FETCH ================= */
const fetchTaxes = async () => {
  try {
    setLoading(true);

    const res = await getTaxMasterList(appData?.user?.branch_code); // 🔥 pass branch

    if (res?.success) {
      const formatted = res.data.map((item: any) => ({
        id: item.taxCode,
        taxCode: item.taxCode?.toString(),
        taxName: item.taxName || "",
        taxPercentage: item.taxPercentage?.toString(),
        isActive: item.isActive,
        fromDate: item.fromDate?.split("T")[0] || "", // 👈 fix date
        toDate: item.toDate?.split("T")[0] || "",
      }));

      setData(formatted);
    } else {
      toast.error(res?.message || "Failed ❌");
    }
  } catch (err) {
    toast.error("Error fetching ❌");
  } finally {
    setLoading(false);
  }
};

  const fetchNextCode = async () => {
    try {
     const res = await getNextIdCode({
  tableName: "BillTaxMaster",
  columnName: "TaxCode",
  conditionName: "BranchCode",
  branch: appData?.user?.branch_code,
});

      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          taxCode: res.data.toString(),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNextCode();
    fetchTaxes();
  }, []);

  /* ================= SAVE ================= */
const handleSave = async () => {
  try {
    setLoading(true);

    const payload = {
      taxCode: Number(form.taxCode),
      taxName: form.taxName,
      taxPercentage: Number(form.taxPercentage),
      isActive: form.isActive,
      fromDate: new Date(form.fromDate).toISOString(),
      toDate: form.toDate ? new Date(form.toDate).toISOString() : null,
      userCode: appData?.user?.userCode?.toString(),
      branchCode: appData?.user?.branch_code,
    };

    const res = await createTaxMaster(payload);

    if (res?.success) {
      toast.success("Tax Created ✅");

      // reset form
      setForm({
        taxCode: "",
        taxName: "",
        taxPercentage: "",
        isActive: true,
        fromDate: "",
        toDate: "",
      });

      await fetchNextCode(); // 🔥 new code
      fetchTaxes();          // 🔥 refresh table
    } else {
      toast.error(res?.message || "Failed ❌");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error saving ❌");
  } finally {
    setLoading(false);
  }
};
  /* ================= UPDATE ================= */
const handleUpdate = async () => {
  try {
    setLoading(true);

    const payload = {
      taxCode: Number(form.taxCode),
      taxName: form.taxName,
      taxPercentage: Number(form.taxPercentage),
      isActive: form.isActive,
      fromDate: new Date(form.fromDate).toISOString(),
      toDate: form.toDate ? new Date(form.toDate).toISOString() : null,
      userCode: appData?.user?.userCode?.toString(),
      branchCode: appData?.user?.branch_code,
    };

    const res = await updateTaxMaster(payload);

    if (res?.success) {
      toast.success("Tax Updated ✅");

      setIsEdit(false);

      setForm({
        taxCode: "",
        taxName: "",
        taxPercentage: "",
        isActive: true,
        fromDate: "",
        toDate: "",
      });

      await fetchNextCode();
      fetchTaxes();
    } else {
      toast.error(res?.message || "Update failed ❌");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error updating ❌");
  } finally {
    setLoading(false);
  }
};

  /* ================= EDIT ================= */
  const handleEdit = (row: Tax) => {
    setIsEdit(true);

    setForm({
      taxCode: row.taxCode,
      taxName: row.taxName,
      taxPercentage: row.taxPercentage,
      isActive: row.isActive,
      fromDate: row.fromDate,
      toDate: row.toDate,
    });
  };

  /* ================= TABLE ================= */
  const columns: Column<Tax>[] = [
    { header: "Code", accessor: "taxCode" },
    { header: "Name", accessor: "taxName" },
    { header: "Percentage", accessor: "taxPercentage" },
    { header: "Active", accessor: "isActive" },
    { header: "From", accessor: "fromDate" },
    { header: "To", accessor: "toDate" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50">
      {loading && <Loader />}
      <Header showNeworderButton={false} />

      {/* FORM */}
     <div className="bg-white rounded-xl shadow p-4 md:p-6">
  <h2 className="text-lg font-semibold mb-4">Tax Master</h2>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

    {/* Tax Code */}
    <input
      name="taxCode"
      value={form.taxCode}
      disabled
      className="border p-2 rounded bg-gray-100"
      placeholder="Tax Code"
    />

    {/* Tax Name */}
    <input
      name="taxName"
      value={form.taxName}
      onChange={handleChange}
      className="border p-2 rounded"
      placeholder="Tax Name (Ex: GST 10%)"
    />

    {/* Tax Percentage */}
    <input
      name="taxPercentage"
      type="number"
      value={form.taxPercentage}
      onChange={handleChange}
      className="border p-2 rounded"
      placeholder="Tax %"
    />

    {/* From Date */}
    <input
      type="date"
      name="fromDate"
      value={form.fromDate}
      onChange={handleChange}
      className="border p-2 rounded"
    />

    {/* To Date */}
    <input
      type="date"
      name="toDate"
      value={form.toDate}
      onChange={handleChange}
      className="border p-2 rounded"
    />

    {/* Active Checkbox */}
    <label className="flex items-center gap-2 mt-2">
      <input
        type="checkbox"
        name="isActive"
        checked={form.isActive}
        onChange={handleChange}
      />
      <span>Is Active</span>
    </label>

  </div>

  {/* Buttons */}
  <div className="flex gap-3 mt-6 justify-end">
    <button
      onClick={handleSave}
      disabled={isEdit}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    >
      Save
    </button>

    <button
      onClick={handleUpdate}
      disabled={!isEdit}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
    >
      Update
    </button>
  </div>
</div>

      {/* TABLE */}
      <DataTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDeleteRow} />

      {/* DELETE MODAL */}
      {deleteRow && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <p>Delete {deleteRow.taxName}?</p>
            <div className="flex gap-3 mt-4">
              <button onClick={cancelDelete}>Cancel</button>
              <button onClick={confirmDelete} className="bg-red-500 text-white px-3 py-1 rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


