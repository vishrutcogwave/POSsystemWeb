import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  createBranchDetailsMaster,
  deleteBranchDetailsMaster,
  getBranchDetailsList,
  getPropertyDetailsList,
  updateBranchDetailsMaster,
} from "../api/services/products.service";
import {
  DataTable,
  type Column,
} from "../components/DataTableForMasters";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

type BranchMaster = {
  id: number;

  brId: number;
  company_code: number;

  branch_code: string;
  branch_name: string;

  address1: string;
  address2: string;

  phone_number: number;
  mob_number: number;
  fax_number: number;

  email_id: string;
  tin_no: string;
  licence_number: string;
};

export default function BranchMaster() {
  const [loading, setLoading] =
    useState(false);

  const [isEdit, setIsEdit] =
    useState(false);

  const [propertyList, setPropertyList] =
    useState<any[]>([]);

  const [data, setData] = useState<
    BranchMaster[]
  >([]);

  const [deleteRow, setDeleteRow] =
    useState<BranchMaster | null>(null);

  const [form, setForm] = useState({
    brId: "",

    company_code: "",

    branch_code: "",
    branch_name: "",

    address1: "",
    address2: "",

    phone_number: "",
    mob_number: "",
    fax_number: "",

    email_id: "",
    tin_no: "",
    licence_number: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const fetchBranchList = async (
    propertyId: number
  ) => {
    try {
      setLoading(true);

      const res =
        await getBranchDetailsList(
          propertyId
        );

      if (res?.success) {
        const formattedData = (
          res.data || []
        ).map((item: any) => ({
          id: item.brId,

          brId: item.brId,
          company_code:
            item.company_code,

          branch_code:
            item.branch_code || "",

          branch_name:
            item.branch_name || "",

          address1:
            item.address1 || "",

          address2:
            item.address2 || "",

          phone_number:
            item.phone_number || 0,

          mob_number:
            item.mob_number || 0,

          fax_number:
            item.fax_number || 0,

          email_id:
            item.email_id || "",

          tin_no:
            item.tin_no || "",

          licence_number:
            item.licence_number || "",
        }));

        setData(formattedData);
      } else {
        toast.error(res?.message);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Error fetching branches"
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchProperties = async () => {
    try {
      const res =
        await getPropertyDetailsList();

      if (res?.success) {
        setPropertyList(res.data || []);
        fetchBranchList(res?.data[0]?.company_code||0)
      } else {
        toast.error(res?.message);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Error fetching properties"
      );
    }
  };



  useEffect(() => {
    fetchProperties();
  }, []);

  const resetForm = () => {
    setForm({
      brId: "",

      company_code: "",

      branch_code: "",
      branch_name: "",

      address1: "",
      address2: "",

      phone_number: "",
      mob_number: "",
      fax_number: "",

      email_id: "",
      tin_no: "",
      licence_number: "",
    });

    setIsEdit(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        brId: Number(form.brId || 0),

        company_code: Number(
propertyList[0]?.company_code),

        branch_code:
          form.branch_code,

        branch_name:
          form.branch_name,

        address1: form.address1,

        address2: form.address2,

        phone_number: Number(
          form.phone_number || 0
        ),

        mob_number: Number(
          form.mob_number || 0
        ),

        fax_number: Number(
          form.fax_number || 0
        ),

        email_id: form.email_id,

        tin_no: form.tin_no,

        licence_number:
          form.licence_number,
      };

      const res =
        await createBranchDetailsMaster(
          payload
        );

      if (res?.success) {
        toast.success(
          res?.message ||
            "Created Successfully"
        );

        fetchBranchList(
          Number(propertyList[0]?.company_code)
        );

        resetForm();
      } else {
        toast.error(res?.message);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Error creating branch"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (
    row: BranchMaster
  ) => {
    setIsEdit(true);

    setForm({
      brId: row.brId.toString(),

      company_code:
        row.company_code.toString(),

      branch_code:
        row.branch_code,

      branch_name:
        row.branch_name,

      address1: row.address1,

      address2: row.address2,

      phone_number:
        row.phone_number.toString(),

      mob_number:
        row.mob_number.toString(),

      fax_number:
        row.fax_number.toString(),

      email_id: row.email_id,

      tin_no: row.tin_no,

      licence_number:
        row.licence_number,
    });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const payload = {
        brId: Number(form.brId || 0),

        company_code: Number(
          form.company_code
        ),

        branch_code:
          form.branch_code,

        branch_name:
          form.branch_name,

        address1: form.address1,

        address2: form.address2,

        phone_number: Number(
          form.phone_number || 0
        ),

        mob_number: Number(
          form.mob_number || 0
        ),

        fax_number: Number(
          form.fax_number || 0
        ),

        email_id: form.email_id,

        tin_no: form.tin_no,

        licence_number:
          form.licence_number,
      };

      const res =
        await updateBranchDetailsMaster(
          payload
        );

      if (res?.success) {
        toast.success(
          res?.message ||
            "Updated Successfully"
        );

        fetchBranchList(
          Number(propertyList[0]?.company_code)
        );

        resetForm();
      } else {
        toast.error(res?.message);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Error updating branch"
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
        await deleteBranchDetailsMaster(
          deleteRow.brId,
        );

      if (res?.success) {
        toast.success(
          res?.message ||
            "Deleted Successfully"
        );

        fetchBranchList(
        propertyList[0]?.company_code
        );
      } else {
        toast.error(res?.message);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Error deleting branch"
      );
    } finally {
      setLoading(false);
      setDeleteRow(null);
    }
  };

  const columns: Column<BranchMaster>[] =
    [
      {
        header: "Branch Code",
        accessor: "branch_code",
      },
      {
        header: "Branch Name",
        accessor: "branch_name",
      },
      {
        header: "Phone",
        accessor: "phone_number",
      },
      {
        header: "Email",
        accessor: "email_id",
      },
    ];

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            Branch Master
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* PROPERTY */}
          <div className="flex flex-col">
  <label className="text-sm text-gray-600 mb-1">
    Property
  </label>

  <input
    value={
      propertyList[0]?.company_Name || ""
    }
    disabled
    className="border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
  />
</div>

            {[
              ["brId", "Branch Id"],
              [
                "branch_code",
                "Branch Code",
              ],
              [
                "branch_name",
                "Branch Name",
              ],
              ["address1", "Address 1"],
              ["address2", "Address 2"],
              [
                "phone_number",
                "Phone Number",
              ],
              [
                "mob_number",
                "Mobile Number",
              ],
              [
                "fax_number",
                "Fax Number",
              ],
              ["email_id", "Email"],
              [
                "tin_no",
                "TIN / GST No",
              ],
              [
                "licence_number",
                "Licence Number",
              ],
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
                  onChange={
                    handleChange
                  }
                    disabled={
    isEdit && key === "branch_code"
  }
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
                  onClick={
                    handleUpdate
                  }
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
            Branch List
          </h2>

          <DataTable
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={(row) =>
              setDeleteRow(row)
            }
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
                    {
                      deleteRow.branch_name
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
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={
                      handleDelete
                    }
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