import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";

import {
  createUserDetailsMaster,
  deleteUserDetailsMaster,
  getNextIdCode,
  getRoleMasterList,
  getUserDetailsList,
  updateUserDetailsMaster,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

type UserMasterType = {
  id: number;
  userCode: number;
  userName: string;
  userPassword: string;
  branch_code: string;
  disPercent: number;
  disAmount: number;
  roleId: number;
};

type RoleType = {
  roleId: number;
  roleName: string;
};
export default function UserMaster() {
  const { appData } = useAppContext();
const [roles, setRoles] = useState<RoleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [data, setData] = useState<UserMasterType[]>([]);

  const [deleteRow, setDeleteRow] = useState<UserMasterType | null>(null);

  const [form, setForm] = useState({
    userCode: "",
    userName: "",
    userPassword: "",
    disPercent: "",
    disAmount: "",
    roleId: "",
  });

  /* =========================
      HANDLE CHANGE
  ========================= */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        tableName: "UserMaster",
        columnName: "UserCode",
        conditionName: "Branch_Code",
        branch: appData?.user?.branch_code,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          userCode: res.data.toString(),
          branch_code: appData?.user?.branch_code || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching user code", err);
    }
  };

  /* =========================
      FETCH USERS
  ========================= */

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await getUserDetailsList(appData?.user?.branch_code);

      if (res?.success) {
const formattedData = (res.data || [])
  .filter(
    (item: any) =>
      !["admin", "cogwave"].includes(
        item.userName?.toLowerCase()
      )
  )
  .map((item: any) => ({
    id: item.userCode,
    userCode: item.userCode,
    userName: item.userName,
    userPassword: item.userPassword,
    branch_code: item.branch_code,
    disPercent: item.disPercent,
    disAmount: item.disAmount,
    roleId: item.roleId,
  }));

setData(formattedData);
        setData(formattedData);
      } else {
        toast.error(res?.message || "Failed to fetch ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching users ❌");
    } finally {
      setLoading(false);
    }
  };
  const fetchRoles = async () => {
  try {
    const res = await getRoleMasterList(
      appData?.user?.branch_code
    );

    if (res?.success) {
      setRoles(res.data || []);
    }
  } catch (err) {
    console.error("Error fetching roles", err);
  }
};

useEffect(() => {
  fetchNextCode();
  fetchUsers();
  fetchRoles();
}, []);

  /* =========================
      SAVE
  ========================= */

  const validateForm = () => {
  if (!form.userName.trim()) {
    toast.error("User Name is required");
    return false;
  }

  if (!form.userPassword.trim()) {
    toast.error("Password is required");
    return false;
  }

  if (!form.roleId) {
    toast.error("Please select Role");
    return false;
  }

  if (
    form.disPercent &&
    Number(form.disPercent) < 0
  ) {
    toast.error(
      "Discount % cannot be negative"
    );
    return false;
  }

  if (
    form.disAmount &&
    Number(form.disAmount) < 0
  ) {
    toast.error(
      "Discount Amount cannot be negative"
    );
    return false;
  }

  return true;
};

  const handleSave = async () => {
      if (!validateForm()) return;
    try {
      setLoading(true);

      const payload = {
        userCode: Number(form.userCode),
        userName: form.userName,
        userPassword: form.userPassword,
        userPrivilege: "0",
        enteredBy: appData?.user?.userCode?.toString() || "0",
        lastModify: new Date().toLocaleString(),
        branch_code: appData?.user?.branch_code || "",
        storeid: 0,
        disPercent: Number(form.disPercent || 0),
        disAmount: Number(form.disAmount || 0),
        roleId: Number(form.roleId || 0),
      };

      const res = await createUserDetailsMaster(payload);

      if (res?.success) {
        toast.success("User Created Successfully ✅");

        setForm({
          userCode: "",
          userName: "",
          userPassword: "",

          disPercent: "",
          disAmount: "",
          roleId: "",
        });

        await fetchNextCode();

        fetchUsers();
      } else {
        toast.error(res?.message || "Failed to create ❌");
      }
    }catch (err: any) {
  console.error(err);

  toast.error(
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong ❌"
  );
}finally {
      setLoading(false);
    }
  };

  /* =========================
      EDIT
  ========================= */

const handleEdit = (row: UserMasterType) => {
  setIsEdit(true);

  setForm({
    userCode: row.userCode.toString(),
    userName: row.userName,
    userPassword: row.userPassword,

    disPercent: row.disPercent.toString(),
    disAmount: row.disAmount.toString(),

    // ✅ FIX
    roleId: String(row.roleId),
  });
};

  /* =========================
      UPDATE
  ========================= */

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const payload = {
        userCode: Number(form.userCode),
        userName: form.userName,
        userPassword: form.userPassword,
        userPrivilege: "0",
        enteredBy: appData?.user?.userCode?.toString() || "0",
        lastModify: new Date().toLocaleString(),
        branch_code: appData?.user?.branch_code || "",
        storeid: 0,
        disPercent: Number(form.disPercent || 0),
        disAmount: Number(form.disAmount || 0),
        roleId: Number(form.roleId || 0),
      };

      const res = await updateUserDetailsMaster(payload);

      if (res?.success) {
        toast.success("Updated Successfully ✅");

        setIsEdit(false);

        setForm({
          userCode: "",
          userName: "",
          userPassword: "",

          disPercent: "",
          disAmount: "",
          roleId: "",
        });

        await fetchNextCode();

        fetchUsers();
      } else {
        toast.error(res?.message || "Update failed ❌");
      }
    }catch (err: any) {
  console.error(err);

  toast.error(
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong ❌"
  );
} finally {
      setLoading(false);
    }
  };

  /* =========================
      DELETE
  ========================= */

  const handleDeleteRow = (row: UserMasterType) => {
    setDeleteRow(row);
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;

    try {
      setLoading(true);

      const res = await deleteUserDetailsMaster(
        deleteRow.userCode,
        deleteRow.branch_code,
      );

      if (res?.success) {
        toast.success("Deleted Successfully ✅");

        await fetchNextCode();

        fetchUsers();
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

  /* =========================
      TABLE COLUMNS
  ========================= */

  const columns: Column<UserMasterType>[] = [
    {
      header: "User Code",
      accessor: "userCode",
    },
    {
      header: "User Name",
      accessor: "userName",
    },
    {
      header: "Branch",
      accessor: "branch_code",
    },
    {
      header: "Discount %",
      accessor: "disPercent",
    },
    {
      header: "Discount Amount",
      accessor: "disAmount",
    },
    {
      header: "Role Id",
      accessor: "roleId",
    },
  ];

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}

        {/* ================= FORM ================= */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">User Master</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* USER CODE */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">User Code</label>

              <input
                name="userCode"
                value={form.userCode}
                disabled
                className="border rounded-lg px-3 py-2 text-sm bg-gray-100"
              />
            </div>

            {/* USER NAME */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">User Name</label>

              <input
                name="userName"
                value={form.userName}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* PASSWORD */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Password</label>

              <input
                name="userPassword"
                value={form.userPassword}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* DISCOUNT % */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Discount %</label>

              <input
                type="number"
                name="disPercent"
                value={form.disPercent}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* DISCOUNT AMOUNT */}

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Discount Amount
              </label>

              <input
                type="number"
                name="disAmount"
                value={form.disAmount}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* ROLE ID */}

          {/* ROLE */}

<div className="flex flex-col">
  <label className="text-sm text-gray-600 mb-1">
    Role
  </label>

  <select
    name="roleId"
    value={form.roleId}
    onChange={(e) =>
      setForm({
        ...form,
        roleId: e.target.value,
      })
    }
    className="border rounded-lg px-3 py-2 text-sm"
  >
    <option value="">
      Select Role
    </option>

    {roles.map((role) => (
    <option
  key={role.roleId}
  value={String(role.roleId)}
>
  {role.roleId} - {role.roleName}
</option>
    ))}
  </select>
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
                      userCode: "",
                      userName: "",
                      userPassword: "",

                      disPercent: "",
                      disAmount: "",
                      roleId: "",
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
          <h2 className="text-lg font-semibold mb-3">User Master List</h2>

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
              <h2 className="text-lg font-semibold mb-3">Confirm Delete</h2>

              <p className="text-sm text-gray-600 mb-5">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteRow.userName}</span>?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteRow(null)}
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
