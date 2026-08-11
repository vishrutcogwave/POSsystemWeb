import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
import Loader from "../components/Loader";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

import {
  getSupplierList,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getNextIdCode,
} from "../api/services/products.service";

type Supplier = {
  id: number;
  supCode: number;
  supName: string;
  supCPerson: string;
  supAdd1: string;
  supAdd2: string;
  supAdd3: string;
  supPhone: string;
  supFax: string;
  supMobile: string;
  supLSTNo: string;
  supLSTDate: string;
  supCSTNo: string;
  supCSTDate: string;
  acGroupCode: number;
  acCode: number;
  email: string;
  branchCode: string;
  suspPincode: string;
  supCity: string;
  gstNo: string;
  tinNo: string;
};

export default function SupplierMaster() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [data, setData] = useState<Supplier[]>([]);
  const [deleteRow, setDeleteRow] = useState<Supplier | null>(null);

  const emptyForm = {
    supCode: "",
    supName: "",
    supCPerson: "",
    supAdd1: "",
    supPhone: "",
    supFax: "",
    supMobile: "",
    supLSTNo: "",
    supLSTDate: "",
    supCSTNo: "",
    supCSTDate: "",
    acGroupCode: "",
    acCode: "",
    email: "",
    branchCode: "",
    suspPincode: "",
    supCity: "",
    gstNo: "",
    tinNo: "",
  };

  const [form, setForm] = useState(emptyForm);

  /* ================= FETCH SUPPLIERS ================= */

  const fetchSuppliers = async () => {
    if (!appData?.user?.branch_code) return;

    try {
      setLoading(true);

      const res = await getSupplierList(appData.user.branch_code);

      if (res.success) {
        const formatted = res.data.map((item: any) => ({
          id: item.supCode,
          ...item,
        }));

        setData(formatted);
      } else {
        toast.error("Failed to load suppliers");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading suppliers");
    } finally {
      setLoading(false);
    }
  };

  /* ================= NEXT SUPPLIER CODE ================= */

  const fetchNextCode = async () => {
    if (!appData?.user?.branch_code) return;

    try {
      const res = await getNextIdCode({
        tableName: "Supplier",
        columnName: "SupCode",
        conditionName: "Branch_Code",
        branch: appData.user.branch_code,
      });

      if (res.success) {
        setForm((prev) => ({
          ...prev,
          supCode: res.data.toString(),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= CLEAR FORM ================= */

  const clearForm = async () => {
    setForm(emptyForm);
    await fetchNextCode();
  };

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    if (!appData?.user?.branch_code) return;

    fetchSuppliers();
    fetchNextCode();
  }, [appData?.user?.branch_code]);

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    if (!form.supName.trim()) {
      toast.error("Supplier Name is required");
      return false;
    }

    if (!form.supCPerson.trim()) {
      toast.error("Contact Person is required");
      return false;
    }

    if (!form.supPhone.trim()) {
      toast.error("Phone Number is required");
      return false;
    }

    return true;
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        supCode: Number(form.supCode),
        supName: form.supName,
        supCPerson: form.supCPerson,
        supAdd1: form.supAdd1,
        supAdd2: null,
        supAdd3: null,
        supPhone: form.supPhone,
        supFax: form.supFax,
        supMobile: form.supMobile,
        supLSTNo: form.supLSTNo,
        supLSTDate: form.supLSTDate || null,
        supCSTNo: form.supCSTNo,
        supCSTDate: form.supCSTDate || null,
        acGroupCode: Number(form.acGroupCode || 0),
        acCode: Number(form.acCode || 0),
        email: form.email,
        branchCode: appData?.user?.branch_code,
        suspPincode: form.suspPincode,
        supCity: form.supCity,
        gstNo: form.gstNo,
        tinNo: form.tinNo,
      };

      const res = await createSupplier(payload);

      if (res?.success) {
        toast.success("Supplier Created Successfully");

        await clearForm();
        fetchSuppliers();
      } else {
        toast.error(res?.message || "Failed");
      }
    } catch {
      toast.error("Error while saving");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        supCode: Number(form.supCode),
        supName: form.supName,
        supCPerson: form.supCPerson,
        supAdd1: form.supAdd1,
        supAdd2: null,
        supAdd3: null,
        supPhone: form.supPhone,
        supFax: form.supFax,
        supMobile: form.supMobile,
        supLSTNo: form.supLSTNo,
        supLSTDate: form.supLSTDate || null,
        supCSTNo: form.supCSTNo,
        supCSTDate: form.supCSTDate || null,
        acGroupCode: Number(form.acGroupCode || 0),
        acCode: Number(form.acCode || 0),
        email: form.email,
        branchCode: appData?.user?.branch_code,
        suspPincode: form.suspPincode,
        supCity: form.supCity,
        gstNo: form.gstNo,
        tinNo: form.tinNo,
      };

      const res = await updateSupplier(payload);

      if (res?.success) {
        toast.success("Supplier Updated Successfully");

        setIsEdit(false);

        await clearForm();
        fetchSuppliers();
      } else {
        toast.error(res?.message || "Update Failed");
      }
    } catch {
      toast.error("Error while updating");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = (row: Supplier) => {
    setIsEdit(true);

    setForm({
      supCode: row.supCode.toString(),
      supName: row.supName ?? "",
      supCPerson: row.supCPerson ?? "",
      supAdd1: row.supAdd1 ?? "",
      supPhone: row.supPhone ?? "",
      supFax: row.supFax ?? "",
      supMobile: row.supMobile ?? "",
      supLSTNo: row.supLSTNo ?? "",
      supLSTDate: row.supLSTDate ? row.supLSTDate.substring(0, 10) : "",
      supCSTNo: row.supCSTNo ?? "",
      supCSTDate: row.supCSTDate ? row.supCSTDate.substring(0, 10) : "",
      acGroupCode: row.acGroupCode?.toString() ?? "",
      acCode: row.acCode?.toString() ?? "",
      email: row.email ?? "",
      branchCode: row.branchCode ?? "",
      suspPincode: row.suspPincode ?? "",
      supCity: row.supCity ?? "",
      gstNo: row.gstNo ?? "",
      tinNo: row.tinNo ?? "",
    });
  };

  /* ================= DELETE ================= */

  const handleDeleteRow = (row: Supplier) => {
    setDeleteRow(row);
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;

    try {
      setLoading(true);

      const res = await deleteSupplier(
        deleteRow.supCode,
        appData?.user?.branch_code,
      );

      if (res?.success) {
        toast.success("Supplier Deleted");

        await fetchNextCode();
        fetchSuppliers();
      } else {
        toast.error(res?.message || "Delete Failed");
      }
    } catch {
      toast.error("Error while deleting");
    } finally {
      setLoading(false);
      setDeleteRow(null);
    }
  };

  /* ================= TABLE COLUMNS ================= */

  const columns: Column<Supplier>[] = [
    {
      header: "Code",
      accessor: "supCode",
    },
    {
      header: "Supplier Name",
      accessor: "supName",
    },
    {
      header: "Contact Person",
      accessor: "supCPerson",
    },
    {
      header: "Phone",
      accessor: "supPhone",
    },
    {
      header: "City",
      accessor: "supCity",
    },
    {
      header: "GST No",
      accessor: "gstNo",
    },
  ];
  const fields: [string, string, boolean?][] = [
    ["supCode", "Supplier Code", true],
    ["supName", "Supplier Name"],
    ["supCPerson", "Contact Person"],
    ["supPhone", "Phone"],
    ["supMobile", "Mobile"],
    ["supFax", "Fax"],
    ["email", "Email"],
    ["supCity", "City"],
    ["suspPincode", "Pincode"],
    ["gstNo", "GST No"],
    ["tinNo", "TIN No"],
    ["supLSTNo", "LST No"],
    ["supCSTNo", "CST No"],
    ["acGroupCode", "A/C Group Code"],
    ["acCode", "A/C Code"],
  ];
  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}

        {/* ================= FORM ================= */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-5">Supplier Master</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map(([key, label, disabled]) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">{label}</label>

                <input
                  type="text"
                  name={key}
                  value={form[key as keyof typeof form]}
                  onChange={handleChange}
                  disabled={disabled ?? false}
                  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            ))}

            {/* LST Date */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">LST Date</label>

              <input
                type="date"
                name="supLSTDate"
                value={form.supLSTDate}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* CST Date */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">CST Date</label>

              <input
                type="date"
                name="supCSTDate"
                value={form.supCSTDate}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* Address 1 */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Address 1</label>

              <textarea
                rows={1}
                name="supAdd1"
                value={form.supAdd1}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* ================= BUTTONS ================= */}

          <div className="flex justify-end gap-3 mt-6">
            {!isEdit && (
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
              >
                Save
              </button>
            )}

            {isEdit && (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
                >
                  Update
                </button>

                <button
                  onClick={async () => {
                    setIsEdit(false);
                    await clearForm();
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg"
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

        {/* ================= DELETE DIALOG ================= */}

        {deleteRow && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[350px]">
              <h3 className="text-lg font-semibold">Delete Supplier</h3>

              <p className="mt-3">
                Are you sure you want to delete
                <strong> {deleteRow.supName}</strong> ?
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeleteRow(null)}
                  className="px-4 py-2 rounded bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded bg-red-600 text-white"
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
