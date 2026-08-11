
 
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
 
import {
  createInventoryItemCategory,
  deleteInventoryItemCategory,
  getInventoryItemCategoryList,
  getNextIdCode,
  updateInventoryItemCategory,
} from "../api/services/products.service";
 
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
 
type InventoryItemCategoryModel = {
  id: number;
  catCode: number;
  catName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  imageUrl: string;
};
 
export default function InventoryItemCategory() {
  const { appData } = useAppContext();
 
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
 
  const [data, setData] = useState<InventoryItemCategoryModel[]>([]);
 
  const [deleteRow, setDeleteRow] = useState<InventoryItemCategoryModel | null>(
    null,
  );
 
  const [form, setForm] = useState({
    catCode: "",
    catName: "",
  });
 
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
        tableName: "InventoryItemCategory",
        columnName: "CatCode",
        conditionName: "Branch_Code",
        branch: appData?.user?.branch_code,
      });
      console.log(res);
      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          catCode: res.data.toString(),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };
 
  /* =========================
      FETCH LIST
  ========================= */
 
  const fetchInventoryItemCategories = async () => {
    try {
      setLoading(true);
 
      const res = await getInventoryItemCategoryList(
        appData?.user?.branch_code,
      );
 
      if (res?.success) {
        const formattedData: InventoryItemCategoryModel[] = (
          res.data || []
        ).map((item: any) => ({
          id: item.catCode,
          catCode: item.catCode,
          catName: item.catName,
          userCode: item.userCode,
          lastModify: item.lastModify,
          branch_Code: item.branch_Code,
          imageUrl: item.imageUrl,
        }));
 
        setData(formattedData);
      } else {
        toast.error(res?.message || "Failed to load data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading categories");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchNextCode();
    fetchInventoryItemCategories();
  }, []);
 
  const validateForm = () => {
    if (!form.catName.trim()) {
      toast.error("Category Name is required");
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
        catCode: Number(form.catCode),
        catName: form.catName,
        userCode: appData?.user?.userCode?.toString() ?? "",
        lastModify: new Date().toISOString(),
        branch_Code: appData?.user?.branch_code ?? "",
        imageUrl: "",
      };
 
      const res = await createInventoryItemCategory(payload);
 
      if (res?.success) {
        toast.success("Category Created Successfully");
 
        setForm({
          catCode: "",
          catName: "",
        });
 
        await fetchNextCode();
        fetchInventoryItemCategories();
      } else {
        toast.error(res?.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating category");
    } finally {
      setLoading(false);
    }
  };
  /* =========================
      EDIT
  ========================= */
 
  const handleEdit = (row: InventoryItemCategoryModel) => {
    setIsEdit(true);
 
    setForm({
      catCode: row.catCode.toString(),
      catName: row.catName,
    });
  };
 
  /* =========================
      UPDATE
  ========================= */
 
  const handleUpdate = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
 
      const payload = {
        catCode: Number(form.catCode),
        catName: form.catName,
        userCode: appData?.user?.userCode?.toString() ?? "",
        lastModify: new Date().toISOString(),
        branch_Code: appData?.user?.branch_code ?? "",
        imageUrl: "",
      };
 
      const res = await updateInventoryItemCategory(payload);
 
      if (res?.success) {
        toast.success("Updated Successfully");
 
        setIsEdit(false);
 
        setForm({
          catCode: "",
          catName: "",
        });
 
        await fetchNextCode();
        fetchInventoryItemCategories();
      } else {
        toast.error(res?.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating");
    } finally {
      setLoading(false);
    }
  };
 
  /* =========================
      DELETE
  ========================= */
 
  const handleDeleteRow = (row: InventoryItemCategoryModel) => {
    setDeleteRow(row);
  };
 
  const confirmDelete = async () => {
    if (!deleteRow) return;
 
    try {
      setLoading(true);
 
      const res = await deleteInventoryItemCategory(
        deleteRow.catCode,
        appData?.user?.branch_code,
      );
 
      if (res?.success) {
        toast.success("Deleted Successfully");
 
        await fetchNextCode();
        fetchInventoryItemCategories();
      } else {
        toast.error(res?.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeleteRow(null);
      setLoading(false);
    }
  };
 
  /* =========================
      TABLE COLUMNS
  ========================= */
 
  const columns: Column<InventoryItemCategoryModel>[] = [
    {
      header: "Category Code",
      accessor: "catCode",
    },
    {
      header: "Category Name",
      accessor: "catName",
    },
  ];
  return (
    <>
      <Header showNeworderButton={false} />
 
      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}
 
        {/* FORM */}
 
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            Inventory Item Category
          </h2>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Category Code
              </label>
 
              <input
                name="catCode"
                value={form.catCode}
                disabled
                className="border rounded-lg px-3 py-2 text-sm bg-gray-100"
              />
            </div>
 
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Category Name
              </label>
 
              <input
                name="catName"
                value={form.catName}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
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
                      catCode: "",
                      catName: "",
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
          <h2 className="text-lg font-semibold mb-3">
            Inventory Item Category List
          </h2>
 
          <DataTable
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={handleDeleteRow}
          />
        </div>
 
        {/* DELETE MODAL */}
 
        {deleteRow && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm">
              <h2 className="text-lg font-semibold mb-3">Confirm Delete</h2>
 
              <p className="text-sm text-gray-600 mb-5">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteRow.catName}</span>?
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
 
 