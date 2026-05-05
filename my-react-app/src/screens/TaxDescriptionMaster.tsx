import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

import {
  getTaxDescriptionList,
  getTaxMasterList,

  createTaxDescription,
  updateTaxDescription,
  deleteTaxDescription,
} from "../api/services/products.service";

type TaxDescription = {
  taxDescId:string,
  id: number;
  taxCode: string;
  taxName: string;
  taxDescription: string;
  taxPercentage: string;
  isActive: boolean;
};

export default function TaxDescriptionMaster() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    taxDescId:"",
    taxCode: "",
    taxName: "",
    taxDescription: "",
    taxPercentage: "",
    maxTaxPercentage: 0, // 🔥 for validation
    isActive: true,
  });

  const [data, setData] = useState<TaxDescription[]>([]);
  const [taxOptions, setTaxOptions] = useState<
    { taxCode: string; taxName: string; taxPercentage: number }[]
  >([]);

  const [deleteRow, setDeleteRow] = useState<TaxDescription | null>(null);

  /* ================= CHANGE ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // 🔥 VALIDATION
    if (name === "taxPercentage") {
      const entered = Number(value);

      if (entered > form.maxTaxPercentage) {
        toast.error(
          `Tax % cannot be greater than ${form.maxTaxPercentage}% ❌`
        );
        return;
      }
    }

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /* ================= DROPDOWN ================= */
  const handleTaxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;

    const selectedTax = taxOptions.find(
      (t) => t.taxName === selectedName
    );

    setForm({
      ...form,
      taxName: selectedName,
      taxCode: selectedTax?.taxCode || "",
      maxTaxPercentage: selectedTax?.taxPercentage || 0,
      taxPercentage: "", // reset
    });
  };

  /* ================= FETCH TAX OPTIONS ================= */
  const fetchTaxOptions = async () => {
    try {
      const res = await getTaxMasterList(appData?.user?.branch_code);

      if (res?.success) {
        const formatted = res.data.map((item: any) => ({
          taxCode: item.taxCode?.toString(),
          taxName: item.taxName,
          taxPercentage: Number(item.taxPercentage),
        }));

        setTaxOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching tax options", err);
    }
  };

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getTaxDescriptionList(
        appData?.user?.branch_code
      );

      if (res?.success) {
        const formatted = res.data.map((item: any) => ({
          id: item.taxCode,
          taxDescId:item.taxDescId,
          taxCode: item.taxCode?.toString(),
          taxName: item.taxName || "",
          taxDescription: item.taxDescription,
          taxPercentage: item.taxPercentage?.toString(),
          isActive: item.isActive,
        }));

        setData(formatted);
      } else {
        toast.error(res?.message || "Failed ❌");
      }
    } catch {
      toast.error("Error fetching ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTaxOptions();
  }, []);

  /* ================= SAVE ================= */

const handleSave = async () => {
  if (!form.taxCode) return toast.error("Select Tax ❌");

  try {
    setLoading(true);

    const payload = {
      taxCode: Number(form.taxCode),
      taxDescription: form.taxDescription,
      taxPercentage: Number(form.taxPercentage),
      isActive: form.isActive,
      userCode: appData?.user?.userCode?.toString(),
      branchCode: appData?.user?.branch_code,
    };

    const res = await createTaxDescription(payload); // ✅ CORRECT API

    if (res?.success) {
      toast.success("Tax Description Created ✅");

      setForm({
        taxDescId:"",
        taxCode: "",
        taxName: "",
        taxDescription: "",
        taxPercentage: "",
        maxTaxPercentage: 0,
        isActive: true,
      });

      fetchData(); // 🔥 refresh table
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
      taxDescId:Number(form.taxDescId),
      taxCode: Number(form.taxCode),
      taxDescription: form.taxDescription,
      taxPercentage: Number(form.taxPercentage),
      isActive: form.isActive,
      userCode: appData?.user?.userCode?.toString(),
      branchCode: appData?.user?.branch_code,
    };

    const res = await updateTaxDescription(payload); // ✅ FIXED

    if (res?.success) {
      toast.success("Updated ✅");

      setIsEdit(false);
      setForm({
        taxDescId:"",
        taxCode: "",
        taxName: "",
        taxDescription: "",
        taxPercentage: "",
        maxTaxPercentage: 0,
        isActive: true,
      });

      fetchData();
    } else {
      toast.error("Update failed ❌");
    }
  } catch {
    toast.error("Error updating ❌");
  } finally {
    setLoading(false);
  }
};

  /* ================= DELETE ================= */
  const handleDeleteRow = (row: TaxDescription) => {
    setDeleteRow(row);
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;

    try {
      setLoading(true);

     
    const res = await deleteTaxDescription(Number(deleteRow.taxCode)); // ✅ FIXED


      if (res?.success) {
        toast.success("Deleted ✅");
        fetchData();
      }
    } catch {
      toast.error("Error deleting ❌");
    } finally {
      setLoading(false);
      setDeleteRow(null);
    }
  };

  /* ================= EDIT ================= */
const handleEdit = (row: TaxDescription) => {
  setIsEdit(true);

  // 🔥 FIND USING taxCode (correct way)
  const selectedTax = taxOptions.find(
    (t) => t.taxCode === row.taxCode
  );

  setForm({
    taxDescId:row.taxDescId,
    taxCode: row.taxCode,
    taxName: selectedTax?.taxName || "", // 🔥 bind from dropdown
    taxDescription: row.taxDescription,
    taxPercentage: row.taxPercentage,
    maxTaxPercentage: selectedTax?.taxPercentage || 0,
    isActive: row.isActive,
  });
};

  /* ================= TABLE ================= */
  const columns: Column<TaxDescription>[] = [
    { header: "Code", accessor: "taxCode" },
    { header: "Description", accessor: "taxDescription" },
    { header: "Percentage", accessor: "taxPercentage" },
    { header: "Active", accessor: "isActive" },
  ];

  return (
  <div className="h-screen overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
      {loading && <Loader />}
      <Header showNeworderButton={false} />

      {/* FORM */}
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">
          Tax Description Master
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Tax Name */}
          <select
            value={form.taxName}
            onChange={handleTaxChange}
            className="border p-2 rounded"
          >
            <option value="">Select Tax</option>
            {taxOptions.map((tax) => (
              <option key={tax.taxCode} value={tax.taxName}>
                {tax.taxName}
              </option>
            ))}
          </select>

          {/* Tax Code */}
          <input
            value={form.taxCode}
            disabled
            className="border p-2 rounded bg-gray-100"
            placeholder="Tax Code"
          />

          {/* Description */}
          <input
            name="taxDescription"
            value={form.taxDescription}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Tax Description"
          />

          {/* Percentage */}
     <div>
  <input
    name="taxPercentage"
    type="number"
    value={form.taxPercentage}
    onChange={handleChange}
    className="border p-2 rounded w-full"
    placeholder="Tax %"
  />
  {form.maxTaxPercentage > 0 && (
    <p className="text-sm text-gray-500">
      Max Allowed: {form.maxTaxPercentage}%
    </p>
  )}
</div>

          {/* Active */}
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              name="isActive"
            />
            <span>Is Active</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={handleSave}
            disabled={isEdit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>

          <button
            onClick={handleUpdate}
            disabled={!isEdit}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Update
          </button>
        </div>
      </div>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDeleteRow}
      />

      {/* DELETE MODAL */}
      {deleteRow && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <p>Delete {deleteRow.taxDescription}?</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteRow(null)}>Cancel</button>
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
  );
}