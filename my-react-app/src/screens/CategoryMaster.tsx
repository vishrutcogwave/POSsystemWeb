import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  DataTable,
  type Column,
} from "../components/DataTableForMasters";

import {
  createCategoryMaster,
  deleteCategoryMaster,
  getCategoryMasterList,
  getNextIdCode,
  updateCategoryMaster,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

type CategoryMaster = {
  id: number;
  catCode: number;
  catName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  subCat: string;
  imageUrl: string;
};

export default function CategoryMaster() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [data, setData] = useState<
    CategoryMaster[]
  >([]);

  const [deleteRow, setDeleteRow] =
    useState<CategoryMaster | null>(null);

const [form, setForm] = useState({
  catCode: "",
  catName: "",
  subCat: "Restaurant",
});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
        tableName: "ItemCategory",
        columnName: "CatCode",
        conditionName: "Branch_Code",
        branch: appData?.user?.branch_code,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          catCode: res.data.toString(),
        }));
      }
    } catch (err) {
      console.error(
        "Error fetching category code",
        err
      );
    }
  };

  /* =========================
      FETCH LIST
  ========================= */

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res =
        await getCategoryMasterList(
          appData?.user?.branch_code
        );

      if (res?.success) {
        const formattedData = (
          res.data || []
        ).map((item: any) => ({
          id: item.catCode,
          catCode: item.catCode,
          catName: item.catName,
          userCode: item.userCode,
          lastModify: item.lastModify,
          branch_Code: item.branch_Code,
          subCat: item.subCat,
          imageUrl: item.imageUrl,
        }));

        setData(formattedData);
      } else {
        toast.error(
          res?.message || "Failed ❌"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(
        "Error fetching categories ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextCode();
    fetchCategories();
  }, []);

  /* =========================
      SAVE
  ========================= */

  const handleSave = async () => {
    try {
      setLoading(true);

   const payload = {
  catCode: Number(form.catCode),
  catName: form.catName,

  userCode:
    appData?.user?.userCode?.toString(),

  lastModify:
    new Date().toISOString(),

  branch_Code:
    appData?.user?.branch_code,

  // ✅ selected dropdown value
  subCat: form.subCat,

  imageUrl: "",
};
      const res =
        await createCategoryMaster(
          payload
        );

      if (res?.success) {
        toast.success(
          "Category Created Successfully ✅"
        );

  setForm({
  catCode: "",
  catName: "",
  subCat: "Restaurant",
});

        await fetchNextCode();
        fetchCategories();
      } else {
        toast.error(
          res?.message ||
            "Failed to create ❌"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating ❌");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      EDIT
  ========================= */

const handleEdit = (
  row: CategoryMaster
) => {
  setIsEdit(true);

  setForm({
    catCode: row.catCode.toString(),
    catName: row.catName,
    subCat:
      row.subCat || "Restaurant",
  });
};

  /* =========================
      UPDATE
  ========================= */

  const handleUpdate = async () => {
    try {
      setLoading(true);

   const payload = {
  catCode: Number(form.catCode),
  catName: form.catName,

  userCode:
    appData?.user?.userCode?.toString(),

  lastModify:
    new Date().toISOString(),

  branch_Code:
    appData?.user?.branch_code,

  // ✅ selected dropdown value
  subCat: form.subCat,

  imageUrl: "",
};

      const res =
        await updateCategoryMaster(
          payload
        );

      if (res?.success) {
        toast.success(
          "Updated Successfully ✅"
        );

        setIsEdit(false);
setForm({
  catCode: "",
  catName: "",
  subCat: "Restaurant",
});
        await fetchNextCode();
        fetchCategories();
      } else {
        toast.error(
          res?.message ||
            "Update failed ❌"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating ❌");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      DELETE
  ========================= */

  const handleDeleteRow = (
    row: CategoryMaster
  ) => {
    setDeleteRow(row);
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;

    try {
      setLoading(true);

      const res =
        await deleteCategoryMaster(
          deleteRow.catCode
        );

      if (res?.success) {
        toast.success(
          "Deleted Successfully ✅"
        );

        await fetchNextCode();

        fetchCategories();
      } else {
        toast.error(
          res?.message ||
            "Delete failed ❌"
        );
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

  const columns: Column<CategoryMaster>[] =
    [
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
            Category Master
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            {/* CATEGORY TYPE */}

<div className="flex flex-col">
  <label className="text-sm text-gray-600 mb-1">
    Category Type
  </label>

  <select
    name="subCat"
    value={form.subCat}
    onChange={(e) =>
      setForm({
        ...form,
        subCat: e.target.value,
      })
    }
    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    <option value="Restaurant">
      Restaurant
    </option>

    <option value="Store">
      Store
    </option>
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
  catCode: "",
  catName: "",
  subCat: "Restaurant",
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
            Category Master List
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
              <h2 className="text-lg font-semibold mb-3">
                Confirm Delete
              </h2>

              <p className="text-sm text-gray-600 mb-5">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteRow.catName}
                </span>
                ?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setDeleteRow(null)
                  }
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