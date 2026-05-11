import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
import {

  getNextIdCode,
  getDepartmentList,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

type Department = {
  id: number;
  code: string;
  name: string;
  head: string;
};

export default function DepartmentMaster() {
  const { appData } = useAppContext();
const [deleteRow, setDeleteRow] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    head: "",
  });

  const [data, setData] = useState<Department[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const columns: Column<Department>[] = [
    { header: "Dep Code", accessor: "code" },
    { header: "Department Name", accessor: "name" },
    { header: "Department Head", accessor: "head" },
  ];

  /* =========================
     FETCH LIST
  ========================= */
  
  const fetchDepartments = async () => {
    try {
      setLoading(true);

      const res = await getDepartmentList(appData?.user?.branch_code);

      if (res?.success) {
        const formatted = res.data.map((item: any) => ({
          id: item.depCode,
          code: item.depCode?.toString(),
          name: item.depName,
          head: item.depHead,
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

  /* =========================
     NEXT CODE
  ========================= */
  const fetchNextCode = async () => {
    try {
      const res = await getNextIdCode({
        tableName: "Department",
        columnName: "DepCode",
        conditionName: "Branch_Code",
        branch: appData?.user?.branch_code,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          code: res.data.toString(),
        }));
      }
    } catch (err) {
      console.error("Error fetching code", err);
    }
  };

  /* =========================
     SAVE (TEMP USING COMPANY API)
  ========================= */
 const handleSave = async () => {
  setLoading(true);

  try {
    const payload = {
      depCode: Number(form.code),
      depName: form.name,
      depHead: form.head,
      posCode: "", // keep empty or map later
      branch_code: appData?.user?.branch_code,
    };

    const res = await createDepartment(payload);

    if (res?.success) {
      toast.success("Department Created ✅");

      setIsEdit(false);
      setForm({ code: "", name: "", head: "" });

      await fetchNextCode();
      fetchDepartments();
    } else {
      toast.error(res?.message || "Save failed ❌");
    }
  } catch {
    toast.error("Error saving ❌");
  } finally {
    setLoading(false);
  }
};

  /* =========================
     UPDATE
  ========================= */
const handleUpdate = async () => {
  setLoading(true);

  try {
    const payload = {
      depCode: Number(form.code),
      depName: form.name,
      depHead: form.head,
      posCode: "",
      branch_code: appData?.user?.branch_code,
    };

    const res = await updateDepartment(payload);

    if (res?.success) {
      toast.success("Department Updated ✅");

      setIsEdit(false);
      setForm({ code: "", name: "", head: "" });

      await fetchNextCode();
      fetchDepartments();
    } else {
      toast.error(res?.message || "Update failed ❌");
    }
  } catch {
    toast.error("Error updating ❌");
  } finally {
    setLoading(false);
  }
};

  /* =========================
     EDIT
  ========================= */
  const handleEdit = (row: Department) => {
    setIsEdit(true);

    setForm({
      code: row.code,
      name: row.name,
      head: row.head,
    });
  };

  const handleDeleteRow = (row: Department) => {
  setDeleteRow(row);
};

const confirmDelete = async () => {
  if (!deleteRow) return;

  try {
    setLoading(true);

    const res = await deleteDepartment(Number(deleteRow.code));

    if (res?.success) {
      toast.success("Deleted successfully ✅");
      fetchDepartments();
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

const cancelDelete = () => {
  setDeleteRow(null);
};

  useEffect(() => {
    fetchNextCode();
    fetchDepartments();
  }, []);

  return (
    <>
      <Header showNeworderButton={false} />

    <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
      {loading && <Loader />}

      {/* FORM */}
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Department Master</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ["code", "Department Code"],
            ["name", "Department Name"],
            ["head", "Department Head"],
          ].map(([key, label]) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">{label}</label>
              <input
                name={key}
                value={(form as any)[key]}
                onChange={handleChange}
                disabled={key === "code"}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={isEdit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Save
          </button>

          <button
            onClick={handleUpdate}
            disabled={!isEdit}
            className="bg-green-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Update
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Department List</h2>

       <DataTable
  columns={columns}
  data={data}
  onEdit={handleEdit}
  onDelete={handleDeleteRow}
/>
{deleteRow && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm">
      <h2 className="text-lg font-semibold mb-3">Confirm Delete</h2>

      <p className="text-sm text-gray-600 mb-5">
        Are you sure you want to delete{" "}
        <span className="font-semibold">{deleteRow.name}</span>?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={cancelDelete}
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
    </div></>
  );
}