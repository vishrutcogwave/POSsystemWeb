import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
 
import {
  createStoreMaster,
  updateStoreMaster,
  deleteStoreMaster,
  getStoreMasterList,
  getNextIdCode,
} from "../api/services/products.service";
 
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
 
/* =========================
      MODEL
========================= */
 
type StoreMasterModel = {
  id: number;
  storeId: number;
  storeName: string;
  storeLocation: string;
  storeIncharge: string;
  branch_Code: string;
};
 
export default function InventoryStore() {
  const { appData } = useAppContext();
 
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
 
  const [data, setData] = useState<StoreMasterModel[]>([]);
  const [deleteRow, setDeleteRow] = useState<StoreMasterModel | null>(null);
 
  const [form, setForm] = useState({
    storeId: "",
    storeName: "",
    storeLocation: "",
    storeIncharge: "",
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
        FETCH NEXT ID
  ========================= */
 
  const fetchNextCode = async () => {
    try {
      const res = await getNextIdCode({
        tableName: "StoreMaster",
        columnName: "StoreId",
        conditionName: "Branch_Code",
        branch: appData?.user?.branch_code,
      });
 
      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          storeId: res.data.toString(),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };
 
  /* =========================
        FETCH STORE LIST
  ========================= */
 
  const fetchStores = async () => {
    try {
      setLoading(true);
 
      const res = await getStoreMasterList(appData?.user?.branch_code);
 
      if (res?.success) {
        const formattedData: StoreMasterModel[] = (res.data || []).map(
          (item: any) => ({
            id: item.storeId,
            storeId: item.storeId,
            storeName: item.storeName,
            storeLocation: item.storeLocation,
            storeIncharge: item.storeIncharge,
            branch_Code: item.branch_Code,
          }),
        );
 
        setData(formattedData);
      } else {
        toast.error(res?.message || "Failed to load stores");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading stores");
    } finally {
      setLoading(false);
    }
  };
 
  /* =========================
        PAGE LOAD
  ========================= */
 
  useEffect(() => {
    fetchNextCode();
    fetchStores();
  }, []);
 
  /* =========================
        VALIDATION
  ========================= */
 
  const validateForm = () => {
    if (!form.storeName.trim()) {
      toast.error("Store Name is required");
      return false;
    }
 
    if (!form.storeLocation.trim()) {
      toast.error("Store Location is required");
      return false;
    }
 
    if (!form.storeIncharge.trim()) {
      toast.error("Store Incharge is required");
      return false;
    }
 
    return true;
  };
  /* =========================
        SAVE
  ========================= */
 
  const handleSave = async () => {
    if (!validateForm()) return;
 
    try {
      setLoading(true);
 
      const payload = {
        storeId: Number(form.storeId),
        storeName: form.storeName,
        storeLocation: form.storeLocation,
        storeIncharge: form.storeIncharge,
        branch_Code: appData?.user?.branch_code ?? "",
      };
 
      const res = await createStoreMaster(payload);
 
      if (res?.success) {
        toast.success("Store Created Successfully");
 
        setForm({
          storeId: "",
          storeName: "",
          storeLocation: "",
          storeIncharge: "",
        });
 
        await fetchNextCode();
        fetchStores();
      } else {
        toast.error(res?.message || "Failed to create store");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating store");
    } finally {
      setLoading(false);
    }
  };
 
  /* =========================
        EDIT
  ========================= */
 
  const handleEdit = (row: StoreMasterModel) => {
    setIsEdit(true);
 
    setForm({
      storeId: row.storeId.toString(),
      storeName: row.storeName,
      storeLocation: row.storeLocation,
      storeIncharge: row.storeIncharge,
    });
  };
 
  /* =========================
        UPDATE
  ========================= */
 
  const handleUpdate = async () => {
    debugger
    if (!validateForm()) return;
 
    try {
      setLoading(true);
 
      const payload = {
        storeId: Number(form.storeId),
        storeName: form.storeName,
        storeLocation: form.storeLocation,
        storeIncharge: form.storeIncharge,
        branch_Code: appData?.user?.branch_code ?? "",
      };
 
      const res = await updateStoreMaster(payload);
 
      if (res?.success) {
        toast.success("Store Updated Successfully");
 
        setIsEdit(false);
 
        setForm({
          storeId: "",
          storeName: "",
          storeLocation: "",
          storeIncharge: "",
        });
 
        await fetchNextCode();
        fetchStores();
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating store");
    } finally {
      setLoading(false);
    }
  };
 
  /* =========================
        DELETE
  ========================= */
 
  const handleDeleteRow = (row: StoreMasterModel) => {
    setDeleteRow(row);
  };
 
  const confirmDelete = async () => {
    if (!deleteRow) return;
 
    try {
      setLoading(true);
 
      const res = await deleteStoreMaster(
        deleteRow.storeId,
        appData?.user?.branch_code,
      );
 
      if (res?.success) {
        toast.success("Store Deleted Successfully");
 
        setDeleteRow(null);
 
        await fetchNextCode();
        fetchStores();
      } else {
        toast.error(res?.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting store");
    } finally {
      setLoading(false);
      setDeleteRow(null);
    }
  };
 
  /* =========================
        TABLE COLUMNS
  ========================= */
 
  const columns: Column<StoreMasterModel>[] = [
    {
      header: "Store ID",
      accessor: "storeId",
    },
    {
      header: "Store Name",
      accessor: "storeName",
    },
    {
      header: "Store Location",
      accessor: "storeLocation",
    },
    {
      header: "Store Incharge",
      accessor: "storeIncharge",
    },
  ];
  return (
    <>
      <Header showNeworderButton={false} />
 
      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}
 
        {/* =========================
              STORE FORM
        ========================= */}
 
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Store Master</h2>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store ID */}
 
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Store ID</label>
 
              <input
                type="text"
                name="storeId"
                value={form.storeId}
                disabled
                className="border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>
 
            {/* Store Name */}
 
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Store Name</label>
 
              <input
                type="text"
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {/* Store Incharge */}
 
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Store Incharge
              </label>
 
              <input
                type="text"
                name="storeIncharge"
                value={form.storeIncharge}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {/* Store Location */}
 
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Store Location
              </label>
 
              <input
                type="text"
                name="storeLocation"
                value={form.storeLocation}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
 
          {/* =========================
                BUTTONS
          ========================= */}
 
          <div className="flex justify-end gap-3 mt-6">
            {!isEdit ? (
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
              >
                Save
              </button>
            ) : (
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
 
                    setForm({
                      storeId: "",
                      storeName: "",
                      storeLocation: "",
                      storeIncharge: "",
                    });
 
                    await fetchNextCode();
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
 
        {/* =========================
              STORE TABLE
        ========================= */}
 
        <div>
          <h2 className="text-lg font-semibold mb-3">Store List</h2>
 
          <DataTable
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={handleDeleteRow}
          />
        </div>
 
        {/* =========================
              DELETE MODAL
        ========================= */}
 
        {deleteRow && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm">
              <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
 
              <p className="text-gray-600 mb-5">
                Are you sure you want to delete
                <span className="font-semibold"> {deleteRow.storeName}</span>?
              </p>
 
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteRow(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
 
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
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
 
 