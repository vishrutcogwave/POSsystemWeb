import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  createPropertyDetailsMaster,
  deletePropertyDetailsMaster,
  getPropertyDetailsList,
  updatePropertyDetailsMaster,
} from "../api/services/products.service";
import { DataTable, type Column } from "../components/DataTableForMasters";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

type PropertyMaster = {
  id: number;

  company_code: number;
  company_Name: string;
  address1: string;
  address2: string;
  phone_number: string;
  mob_number: string;
  ownerName: string;
  owner_Number: number;
  fax_number: number;
  email_id: string;
  tin_no: string;
  licence_number: string;
  branch_code: string;
  stdcode: string;
};

export default function PropertyMasterCreation() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [deleteRow, setDeleteRow] =
    useState<PropertyMaster | null>(null);

  const [data, setData] = useState<PropertyMaster[]>([]);

  const [form, setForm] = useState({
    company_code: "",
    company_Name: "",
    address1: "",
    address2: "",
    phone_number: "",
    mob_number: "",
    ownerName: "",
    owner_Number: "",
    fax_number: "",
    email_id: "",
    tin_no: "",
    licence_number: "",
    branch_code: appData?.user?.branch_code || "",
    stdcode: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
const fetchPropertyList = async () => {
  try {
    setLoading(true);

    const res = await getPropertyDetailsList();

    if (res?.success) {
      const formattedData = (res.data || []).map(
        (item: any) => ({
          id: item.company_code, // ✅ required for DataTable

          company_code: item.company_code,
          company_Name: item.company_Name || "",
          address1: item.address1 || "",
          address2: item.address2 || "",
          phone_number: item.phone_number || "",
          mob_number: item.mob_number || "",
          ownerName: item.ownerName || "",
          owner_Number: item.owner_Number || 0,
          fax_number: item.fax_number || 0,
          email_id: item.email_id || "",
          tin_no: item.tin_no || "",
          licence_number:
            item.licence_number || "",
          branch_code: item.branch_code || "",
          stdcode: item.stdcode || "",
        })
      );

      setData(formattedData);
    } else {
      toast.error(
        res?.message || "Failed ❌"
      );
    }
  } catch (error: any) {
    console.error(error);

    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        "Error fetching property details ❌"
    );
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchPropertyList();
  }, []);

  const resetForm = () => {
    setForm({
      company_code: "",
      company_Name: "",
      address1: "",
      address2: "",
      phone_number: "",
      mob_number: "",
      ownerName: "",
      owner_Number: "",
      fax_number: "",
      email_id: "",
      tin_no: "",
      licence_number: "",
      branch_code: appData?.user?.branch_code || "",
      stdcode: "",
    });

    setIsEdit(false);
  };

const handleSave = async () => {
  try {
    setLoading(true);

    const payload = {
      company_code: Number(form.company_code),
      company_Name: form.company_Name,
      startYear: new Date().toISOString(),
      address1: form.address1,
      address2: form.address2,
      phone_number: form.phone_number,
      mob_number: form.mob_number,
      ownerName: form.ownerName,
      owner_Number: Number(form.owner_Number || 0),
      fax_number: Number(form.fax_number || 0),
      email_id: form.email_id,
      tin_no: form.tin_no,
      licence_number: form.licence_number,
      branch_code: form.branch_code,
      stdcode: form.stdcode,
    };

    const res =
      await createPropertyDetailsMaster(payload);

    if (res?.success) {
      toast.success(
        res?.message || "Created Successfully ✅"
      );

      resetForm();
      fetchPropertyList();
    } else {
      toast.error(
        res?.message || "Create failed ❌"
      );
    }
  } catch (error: any) {
    console.error(error);

    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        "Error creating property ❌"
    );
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (row: PropertyMaster) => {
    setIsEdit(true);

    setForm({
      company_code:
        row.company_code?.toString() || "",
      company_Name: row.company_Name || "",
      address1: row.address1 || "",
      address2: row.address2 || "",
      phone_number: row.phone_number || "",
      mob_number: row.mob_number || "",
      ownerName: row.ownerName || "",
      owner_Number:
        row.owner_Number?.toString() || "",
      fax_number:
        row.fax_number?.toString() || "",
      email_id: row.email_id || "",
      tin_no: row.tin_no || "",
      licence_number:
        row.licence_number || "",
      branch_code: row.branch_code || "",
      stdcode: row.stdcode || "",
    });
  };

const handleUpdate = async () => {
  try {
    setLoading(true);

    const payload = {
      company_code: Number(form.company_code),
      company_Name: form.company_Name,
      startYear: new Date().toISOString(),
      address1: form.address1,
      address2: form.address2,
      phone_number: form.phone_number,
      mob_number: form.mob_number,
      ownerName: form.ownerName,
      owner_Number: Number(form.owner_Number || 0),
      fax_number: Number(form.fax_number || 0),
      email_id: form.email_id,
      tin_no: form.tin_no,
      licence_number: form.licence_number,
      branch_code: form.branch_code,
      stdcode: form.stdcode,
    };

    const res =
      await updatePropertyDetailsMaster(payload);

    if (res?.success) {
      toast.success(
        res?.message || "Updated Successfully ✅"
      );

      resetForm();
      fetchPropertyList();
    } else {
      toast.error(
        res?.message || "Update failed ❌"
      );
    }
  } catch (error: any) {
    console.error(error);

    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        "Error updating property ❌"
    );
  } finally {
    setLoading(false);
  }
};
const handleDelete = async () => {
  if (!deleteRow) return;

  try {
    setLoading(true);

    const res =
      await deletePropertyDetailsMaster(
        deleteRow.company_code,
      );

    if (res?.success) {
      toast.success(
        res?.message || "Deleted Successfully ✅"
      );

      fetchPropertyList();
    } else {
      toast.error(
        res?.message || "Delete failed ❌"
      );
    }
  } catch (error: any) {
    console.error(error);

    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        "Error deleting ❌"
    );
  } finally {
    setLoading(false);
    setDeleteRow(null);
  }
};

  const columns: Column<PropertyMaster>[] = [
    {
      header: "Code",
      accessor: "company_code",
    },
    {
      header: "Company Name",
      accessor: "company_Name",
    },
    {
      header: "Phone",
      accessor: "phone_number",
    },
    {
      header: "Owner",
      accessor: "ownerName",
    },
    {
      header: "GST",
      accessor: "tin_no",
    },
  ];

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            Property Master
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ["company_code", "Company Code"],
              ["company_Name", "Company Name"],
              ["address1", "Address 1"],
              ["address2", "Address 2"],
              ["phone_number", "Phone Number"],
              ["mob_number", "Mobile Number"],
              ["ownerName", "Owner Name"],
              ["owner_Number", "Owner Number"],
              ["fax_number", "Fax Number"],
              ["email_id", "Email"],
              ["tin_no", "TIN / GST No"],
              ["licence_number", "Licence Number"],
              ["branch_code", "Branch Code"],
              ["stdcode", "STD Code"],
            ].map(([key, label]) => (
              <div
                key={key}
                className="flex flex-col"
              >
                <label className="text-sm text-gray-600 mb-1">
                  {label}
                </label>

                <input
                  name={key}
                  value={(form as any)[key]}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6 justify-end">
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
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">
            Property List
          </h2>

          <DataTable
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={(row) => setDeleteRow(row)}
          />

          {deleteRow && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm">
                <h2 className="text-lg font-semibold mb-3">
                  Confirm Delete
                </h2>

                <p className="text-sm text-gray-600 mb-5">
                  Delete
                  <span className="font-semibold">
                    {" "}
                    {deleteRow.company_Name}
                  </span>
                  ?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() =>
                      setDeleteRow(null)
                    }
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}