import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
import {
  createCompany,
  deleteCompany,
  getCompanyList,
  getNextIdCode,
  updateCompany,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

/* =========================
   Reusable Table Component
========================= */

/* =========================
   Main Component
========================= */

type Company = {
  id: number;
  code: string;
  name: string;
  contact: string;
  address: string;
  city: string;
  pin: string;
  phone: string;
  gst: string;
  email: string;
};

export default function CompanyCreation() {
  const { appData } = useAppContext();
  console.log("appData", appData);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    contact: "",
    address: "",
    city: "",
    pin: "",
    phone: "",
    gst: "",
    email: "",
  });

  const [data, setData] = useState<Company[]>([]);
  const [deleteRow, setDeleteRow] = useState<Company | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDeleteRow = (row: Company) => {
    setDeleteRow(row); // open dialog
  };
  const confirmDelete = async () => {
    if (!deleteRow) return;

    try {
      const res = await deleteCompany(Number(deleteRow.code),appData?.user?.branch_code);

      if (res?.success) {
        toast.success("Deleted successfully ✅");
            await fetchNextCode();

        fetchCompanies(); // refresh
      } else {
        toast.error(res?.message || "Delete failed ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting ❌");
    }

    setDeleteRow(null);
  };
  const cancelDelete = () => {
    setDeleteRow(null);
  };
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = {
        companyCode: Number(form.code),
        companyName: form.name,
        contactPerson: form.contact,
        address: form.address,
        city: form.city,
        pincode: form.pin,
        phone: form.phone,
        email: form.email,
        gstNo: form.gst,
        userCode: appData?.user?.userCode?.toString(),
        lastModify: new Date().toISOString(),
        branch_code: appData?.user?.branch_code,
      };

      const res = await updateCompany(payload);

      if (res?.success) {
        toast.success("Company Updated ✅");
        setIsEdit(false);
   setForm({
        code: "",
        name: "",
        contact: "",
        address: "",
        city: "",
        pin: "",
        phone: "",
        gst: "",
        email: "",
      });
  await fetchNextCode();    // ✅ then fetch new code
        fetchCompanies(); // refresh table
      } else {
        toast.error(res?.message || "Update failed ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating company ❌");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (row: Company) => {
    setIsEdit(true); // ✅ enable update mode

    setForm({
      code: row.code,
      name: row.name,
      contact: row.contact,
      address: row.address,
      city: row.city,
      pin: row.pin,
      phone: row.phone,
      gst: row.gst,
      email: row.email,
    });
  };
  const columns: Column<Company>[] = [
    { header: "Code", accessor: "code" },
    { header: "Company Name", accessor: "name" },
    { header: "Contact", accessor: "contact" },
    { header: "City", accessor: "city" },
    { header: "Phone", accessor: "phone" },
    { header: "Email", accessor: "email" },
  ];

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      const res = await getCompanyList(appData?.user?.branch_code);

      if (res?.success) {
        const formatted = res.data.map((item: any) => ({
          id: item.companyCode,
          code: item.companyCode?.toString() || "",
          name: item.companyName || "",
          contact: item.contactPerson || "",
          address: item.address || "",
          city: item.city || "",
          pin: item.pincode?.toString() || "",
          phone: item.phone || "",
          gst: item.gstNo ?? "",
          email: item.email || "",
        }));

        setData(formatted);
      } else {
        toast.error(res?.message || "Failed ❌");
      }
    } catch (err) {
      toast.error("Error fetching ❌");
    } finally {
      setLoading(false); // ✅ important
    }
  };
const fetchNextCode = async () => {
  try {
   const res = await getNextIdCode({
  tableName: "CompanyMaster",
  columnName: "CompanyCode",
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
    console.error("Error fetching company code", err);
  }
};
  useEffect(() => {
    fetchNextCode();
    fetchCompanies();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        companyCode: Number(form.code),
        companyName: form.name,
        contactPerson: form.contact,
        address: form.address,
        city: form.city,
        pincode: form.pin,
        phone: form.phone,
        email: form.email,
        gstNo: form.gst,
        userCode: appData?.user?.userCode?.toString(),
        lastModify: new Date().toISOString(),
        branch_code: appData?.user?.branch_code,
      };

      const res = await createCompany(payload);

      if (res?.success) {
        toast.success("Company Created Successfully ✅");
              setIsEdit(false);
   setForm({
        code: "",
        name: "",
        contact: "",
        address: "",
        city: "",
        pin: "",
        phone: "",
        gst: "",
        email: "",
      });
      await fetchNextCode();
        fetchCompanies();
      } else {
        toast.error(res?.message || "Something went wrong ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create company ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header showNeworderButton={false} />

    <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
      {/* FORM */}
      {loading && <Loader />}

      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Company Creation</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ["code", "Company Code"],
            ["name", "Company Name"],
            ["contact", "Contact Person"],
            ["address", "Address"],
            ["city", "City"],
            ["pin", "Pin Code"],
            ["phone", "Phone"],
            ["gst", "GST No"],
            ["email", "Email"],
          ].map(([key, label]) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">{label}</label>
              <input
                name={key}
                value={(form as any)[key]}
                onChange={handleChange}
                disabled={key === "code"} // 👈 disable only Company Code
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
        </div>

     <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-end">
  {!isEdit && (
    <button
      onClick={handleSave}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
      Save
    </button>
  )}

  {isEdit && (
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
            code: "",
            name: "",
            contact: "",
            address: "",
            city: "",
            pin: "",
            phone: "",
            gst: "",
            email: "",
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
        <h2 className="text-lg font-semibold mb-3">Company List</h2>

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
