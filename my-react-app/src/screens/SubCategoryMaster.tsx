import  {
  useEffect,
  useState,
} from "react";

import Header from "../components/Header";

import {
  DataTable,
  type Column,
} from "../components/DataTableForMasters";

import {
  createSubCategoryMaster,
  deleteSubCategoryMaster,
  getCategoryMasterList,
  getNextIdCode,
  getSubCategoryMasterList,
  updateSubCategoryMaster,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";

import toast from "react-hot-toast";
import Loader from "../components/Loader";

type SubCategoryMaster = {
  id: number;
  catCode: number;
  catName: string;
  subCatCode: number;
  subCatName: string;
  userCode: string;
  trDate: string;
  branch_Code: string;
  subCat: string;
};

type CategoryOption = {
  catCode: number;
  catName: string;
};

export default function SubCategoryMaster() {
  const { appData } = useAppContext();

  const [loading, setLoading] =
    useState(false);

  const [isEdit, setIsEdit] =
    useState(false);

  const [data, setData] = useState<
    SubCategoryMaster[]
  >([]);

  const [categories, setCategories] =
    useState<CategoryOption[]>([]);

  const [deleteRow, setDeleteRow] =
    useState<SubCategoryMaster | null>(
      null
    );

  const [form, setForm] = useState({
    catCode: "",
    catName: "",
    subCatCode: "",
    subCatName: "",
    subCat: "Restaurant",
  });

  /* =========================
      FETCH NEXT CODE
  ========================= */

  const fetchNextCode = async () => {
    try {
      const res = await getNextIdCode({
        tableName: "ItemSubCategory",
        columnName: "subCatCode",
        conditionName: "Branch_Code",
        branch:
          appData?.user?.branch_code,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          subCatCode:
            res.data.toString(),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
      FETCH CATEGORIES
  ========================= */

  const fetchCategories =
    async () => {
      try {
        const res =
          await getCategoryMasterList(
            appData?.user?.branch_code
          );

        if (res?.success) {
          setCategories(
            res.data || []
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

  /* =========================
      FETCH SUB CATEGORIES
  ========================= */

  const fetchSubCategories =
    async () => {
      try {
        setLoading(true);

        const res =
          await getSubCategoryMasterList(
            appData?.user?.branch_code
          );

        if (res?.success) {
          const formattedData = (
            res.data || []
          ).map((item: any) => ({
            id: item.subCatCode,
            ...item,
          }));

          setData(formattedData);
        }
      } catch (err) {
        console.error(err);
        toast.error(
          "Error fetching ❌"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchNextCode();
    fetchCategories();
    fetchSubCategories();
  }, []);

  /* =========================
      SAVE
  ========================= */

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        catCode:
          Number(form.catCode),

        catName: form.catName,

        subCatCode: Number(
          form.subCatCode
        ),

        subCatName:
          form.subCatName,

        userCode:
          appData?.user?.userCode?.toString(),

        trDate:
          new Date().toISOString(),

        branch_Code:
          appData?.user?.branch_code,

        subCat:
  form.subCat === "Store"
    ? "1"
    : "0",
      };

      const res =
        await createSubCategoryMaster(
          payload
        );

      if (res?.success) {
        toast.success(
          "Created Successfully ✅"
        );

        setForm({
          catCode: "",
          catName: "",
          subCatCode: "",
          subCatName: "",
          subCat: "Restaurant",
        });

        await fetchNextCode();

        fetchSubCategories();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error ❌");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      EDIT
  ========================= */

const handleEdit = (
  row: SubCategoryMaster
) => {
  setIsEdit(true);

  const selectedCategory =
    categories.find(
      (c) =>
        Number(c.catCode) ===
        Number(row.catCode)
    );

  setForm({
    catCode:
      String(row.catCode),

    // ✅ bind properly
    catName:
      selectedCategory?.catName ||
      row.catName,

    subCatCode:
      String(row.subCatCode),

    subCatName:
      row.subCatName,

    // ✅ API returns 0 / 1
    subCat:
      row.subCat === "1"
        ? "Store"
        : "Restaurant",
  });
};

  /* =========================
      UPDATE
  ========================= */

  const handleUpdate =
    async () => {
      try {
        setLoading(true);

        const payload = {
          catCode:
            Number(form.catCode),

          catName:
            form.catName,

          subCatCode: Number(
            form.subCatCode
          ),

          subCatName:
            form.subCatName,

          userCode:
            appData?.user?.userCode?.toString(),

          trDate:
            new Date().toISOString(),

          branch_Code:
            appData?.user
              ?.branch_code,

          subCat:
            form.subCat,
        };

        const res =
          await updateSubCategoryMaster(
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
            subCatCode: "",
            subCatName: "",
            subCat:
              "Restaurant",
          });

          await fetchNextCode();

          fetchSubCategories();
        }
      } catch (err) {
        console.error(err);
        toast.error(
          "Error updating ❌"
        );
      } finally {
        setLoading(false);
      }
    };

  /* =========================
      DELETE
  ========================= */

  const confirmDelete =
    async () => {
      if (!deleteRow) return;

      try {
        setLoading(true);

        const res =
          await deleteSubCategoryMaster(
            deleteRow.subCatCode
          );

        if (res?.success) {
          toast.success(
            "Deleted Successfully ✅"
          );

          await fetchNextCode();

          fetchSubCategories();
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

  const columns: Column<SubCategoryMaster>[] =
    [
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

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}

        {/* FORM */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            Sub Category Master
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

            {/* SUB CAT CODE */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                SubCat Code
              </label>

              <input
                value={
                  form.subCatCode
                }
                disabled
                className="border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>

            {/* SUB CAT NAME */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                SubCat Name
              </label>

              <input
                value={
                  form.subCatName
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    subCatName:
                      e.target.value,
                  })
                }
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* CATEGORY */}

           {/* CATEGORY */}

<div className="flex flex-col">
  <label className="text-sm mb-1">
    Category
  </label>

  <select
    value={String(form.catCode)}
    onChange={(e) => {
      const selected =
        categories.find(
          (c) =>
            String(c.catCode) ===
            e.target.value
        );

      setForm({
        ...form,

        catCode:
          e.target.value,

        catName:
          selected?.catName ||
          "",
      });
    }}
    className="border rounded-lg px-3 py-2"
  >
    <option value="">
      Select Category
    </option>

    {categories.map((cat) => (
      <option
        key={cat.catCode}
        value={String(cat.catCode)}
      >
        {cat.catName}
      </option>
    ))}
  </select>
</div>

            {/* TYPE */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Type
              </label>

              <select
                value={
                  form.subCat
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    subCat:
                      e.target.value,
                  })
                }
                className="border rounded-lg px-3 py-2"
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

          <div className="flex justify-end gap-3 mt-6">
            {!isEdit ? (
              <button
                onClick={
                  handleSave
                }
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            ) : (
              <>
                <button
                  onClick={
                    handleUpdate
                  }
                  className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                  Update
                </button>

                <button
                  onClick={async () => {
                    setIsEdit(
                      false
                    );

                    setForm({
                      catCode: "",
                      catName: "",
                      subCatCode:
                        "",
                      subCatName:
                        "",
                      subCat:
                        "Restaurant",
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
          onDelete={(
            row
          ) =>
            setDeleteRow(
              row
            )
          }
        />

        {/* DELETE MODAL */}

        {deleteRow && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[90%] max-w-sm">
              <h2 className="text-lg font-semibold mb-3">
                Confirm Delete
              </h2>

              <p className="mb-5">
                Delete{" "}
                <span className="font-semibold">
                  {
                    deleteRow.subCatName
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
                  className="border px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    confirmDelete
                  }
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