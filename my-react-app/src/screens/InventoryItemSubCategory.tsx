import { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
import {
  createInventorySubCategoryMaster,
  deleteInventorySubCategoryMaster,
  getInventoryItemCategoryList,
  getNextIdCode,
  updateInventorySubCategoryMaster,
  getInventorySubCategoryMasterList,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

type InventorySubCategoryMaster = {
  id: number;
  catCode: number;
  catName: string;
  subCatCode: number;
  subCatName: string;
  userCode: string;
  trDate: string;
  branch_Code: string;
};

type CategoryOption = {
  catCode: number;
  catName: string;
};

export default function InventoryItemSubCategory() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [data, setData] = useState<InventorySubCategoryMaster[]>([]);

  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [deleteRow, setDeleteRow] = useState<InventorySubCategoryMaster | null>(
    null,
  );

  const [form, setForm] = useState({
    catCode: "",
    catName: "",
    subCatCode: "",
    subCatName: "",
  });

  /* =========================
      FETCH NEXT CODE
  ========================= */

  const fetchNextCode = async () => {
    try {
      const res = await getNextIdCode({
        tableName: "InventoryItemSubCategory",
        columnName: "subCatCode",
        conditionName: "Branch_Code",
        branch: appData?.user?.branch_code,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          subCatCode: res.data.toString(),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
      FETCH CATEGORIES
  ========================= */

  const fetchCategories = async () => {
    try {
      const res = await getInventoryItemCategoryList(
        appData?.user?.branch_code,
      );

      if (res?.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
      FETCH SUB CATEGORIES
  ========================= */

  const fetchSubCategories = async () => {
    try {
      if (loading) return;

      const res = await getInventorySubCategoryMasterList(
        appData?.user?.branch_code,
      );

      if (res?.success) {
        const formattedData = (res.data || []).map((item: any) => ({
          id: item.subCatCode,
          ...item,
        }));

        setData(formattedData);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!appData?.user?.branch_code) return;

    fetchNextCode();
    fetchCategories();
    fetchSubCategories();
  }, [appData?.user?.branch_code]);

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

        subCatCode: Number(form.subCatCode),

        subCatName: form.subCatName,

        userCode: appData?.user?.userCode?.toString(),

        trDate: new Date().toISOString(),

        branch_Code: appData?.user?.branch_code,
      };

      const res = await createInventorySubCategoryMaster(payload);

      if (res?.success) {
        toast.success("Created Successfully ✅");

        setForm({
          catCode: "",
          catName: "",
          subCatCode: "",
          subCatName: "",
        });

        await fetchNextCode();

        await fetchSubCategories();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save sub category.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      EDIT
  ========================= */

  const handleEdit = (row: InventorySubCategoryMaster) => {
    setIsEdit(true);

    const selectedCategory = categories.find(
      (c) => Number(c.catCode) === Number(row.catCode),
    );

    setForm({
      catCode: String(row.catCode),
      catName: selectedCategory?.catName || row.catName,
      subCatCode: String(row.subCatCode),
      subCatName: row.subCatName,
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

        subCatCode: Number(form.subCatCode),

        subCatName: form.subCatName,

        userCode: appData?.user?.userCode?.toString(),

        trDate: new Date().toISOString(),

        branch_Code: appData?.user?.branch_code,
      };

      const res = await updateInventorySubCategoryMaster(payload);

      if (res?.success) {
        toast.success("Updated Successfully ✅");

        setIsEdit(false);

        setForm({
          catCode: "",
          catName: "",
          subCatCode: "",
          subCatName: "",
        });

        await fetchNextCode();

        fetchSubCategories();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update sub category.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      DELETE
  ========================= */

  const confirmDelete = async () => {
    if (!deleteRow) return;

    try {
      setLoading(true);

      const res = await deleteInventorySubCategoryMaster(
        deleteRow.subCatCode,
        appData?.user?.branch_code,
      );

      if (res?.success) {
        toast.success("Deleted Successfully ✅");

        await fetchNextCode();

        await fetchSubCategories();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setDeleteRow(null);
    }
  };

  /* =========================
      TABLE
  ========================= */

  const columns: Column<InventorySubCategoryMaster>[] = [
    {
      header: "SubCat Code",
      accessor: "subCatCode",
    },
    {
      header: "SubCat Name",
      accessor: "subCatName",
    },
    {
      header: "Category",
      accessor: "catName",
    },
  ];
  const validateForm = () => {
    if (!form.subCatName.trim()) {
      toast.error("Sub Category Name is required");
      return false;
    }

    if (!form.catCode) {
      toast.error("Category is required");
      return false;
    }

    return true;
  };
  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}

        {/* FORM */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            Inventory Item Sub Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SUB CAT CODE */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">SubCat Code</label>

              <input
                value={form.subCatCode}
                disabled
                className="border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>

            {/* SUB CAT NAME */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">SubCat Name</label>

              <input
                value={form.subCatName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    subCatName: e.target.value,
                  })
                }
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* CATEGORY */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">Category</label>

              <select
                value={String(form.catCode)}
                onChange={(e) => {
                  const selected = categories.find(
                    (c) => String(c.catCode) === e.target.value,
                  );

                  setForm({
                    ...form,

                    catCode: e.target.value,

                    catName: selected?.catName || "",
                  });
                }}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select Category</option>

                {categories.map((cat) => (
                  <option key={cat.catCode} value={String(cat.catCode)}>
                    {cat.catName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-3 mt-6">
            {!isEdit ? (
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                  Update
                </button>

                <button
                  onClick={async () => {
                    setIsEdit(false);

                    setForm({
                      catCode: "",
                      catName: "",
                      subCatCode: "",
                      subCatName: "",
                    });

                    await fetchNextCode();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* TABLE */}

        <DataTable
          columns={columns}
          data={data}
          onEdit={handleEdit}
          onDelete={(row) => setDeleteRow(row)}
        />

        {/* DELETE MODAL */}

        {deleteRow && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[90%] max-w-sm">
              <h2 className="text-lg font-semibold mb-3">Confirm Delete</h2>

              <p className="mb-5">
                Delete{" "}
                <span className="font-semibold">{deleteRow.subCatName}</span>?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteRow(null)}
                  className="border px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
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
