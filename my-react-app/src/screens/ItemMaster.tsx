import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
import {
  createItemMaster,
  GetCategoryMasterList,
  getDepartmentList,
  GetGroupMasterList,
  getItemMasterList,
  getNextIdCode,
  GetPrintingMasterList,
  GetSubCategoryMasterList,
  getTaxMasterList,
  GetUnitMasterList,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

type ItemMaster = {
  id: number;

  itemCode: number;
  itemName: string;

  catCode: string;
  subCatCode: string;
  grpCode: string;

  itemDiscountAllowed: boolean;
  itemRate: number;

  unitName: string;
  dep: string;
  taxName: string;

  printDepartment: string;
  sacCode: string;
  barcode: string;

  isVeg: boolean;
  mostRunningItemSrNo?: string;
  qpb?: number;
  picture?: string;
};
type Category = {
  catCode: number;
  catName: string;
};
type SubCategory = {
  subCatCode: number;
  subCatName: string;
};
type Group = {
  grpCode: number;
  grpName: string;
};
type Unit = {
  unitCode: number;
  unitName: string;
};
type Department = {
  depCode: number;
  depName: string;
};
type Tax = {
  taxCode: number;
  taxName: string;
};
type PrintingDepartment = {
  depCode: number;
  depName: string;
};
export default function ItemMaster() {
  const { appData } = useAppContext();
  console.log("appData", appData);

  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [printingDepartments, setPrintingDepartments] = useState<
    PrintingDepartment[]
  >([]);
  const [form, setForm] = useState<ItemMaster>({
    id: 0,

    itemCode: 0,
    itemName: "",

    catCode: "",
    subCatCode: "",
    grpCode: "",

    itemDiscountAllowed: false,
    itemRate: 0,

    unitName: "",
    dep: "",
    taxName: "",

    printDepartment: "",
    sacCode: "",
    barcode: "",

    isVeg: true,
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [data, setData] = useState<ItemMaster[]>([]);
  const [deleteRow, setDeleteRow] = useState<ItemMaster | null>(null);

  const fetchPrintingDepartments = async () => {
    try {
      const res = await GetPrintingMasterList(appData?.user?.branch_code);

      if (res?.success) {
        setPrintingDepartments(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch printing departments");
    }
  };
  const fetchTaxes = async () => {
    try {
      const res = await getTaxMasterList(appData?.user?.branch_code);

      if (res?.success) {
        setTaxes(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch taxes");
    }
  };
  const fetchDepartments = async () => {
    try {
      const res = await getDepartmentList(appData?.user?.branch_code);

      if (res?.success) {
        setDepartments(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch departments");
    }
  };
  const fetchUnits = async () => {
    try {
      const res = await GetUnitMasterList(appData?.user?.branch_code);

      if (res?.success) {
        setUnits(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch units");
    }
  };
  const fetchGroups = async () => {
    try {
      const res = await GetGroupMasterList(appData?.user?.branch_code);

      if (res?.success) {
        setGroups(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch groups");
    }
  };
  const fetchSubCategories = async () => {
    try {
      const res = await GetSubCategoryMasterList(appData?.user?.branch_code);

      if (res?.success) {
        setSubCategories(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch sub categories");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await GetCategoryMasterList(appData?.user?.branch_code);

      if (res?.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "itemCode" || name === "itemRate"
            ? Number(value)
            : value,
    }));
  };

  const columns: Column<ItemMaster>[] = [
    { header: "Code", accessor: "itemCode" },
    { header: "Item Name", accessor: "itemName" },
    { header: "Category", accessor: "catCode" },
    { header: "Sub Category", accessor: "qpb" },
    { header: "Group", accessor: "grpCode" },

    {
      header: "Discount",
      accessor: "itemDiscountAllowed",
      cell: (row) => (row.itemDiscountAllowed ? "Yes" : "No"),
    },

    { header: "Rate", accessor: "itemRate" },
    { header: "Unit", accessor: "unitName" },
    { header: "Department", accessor: "dep" },
    { header: "Print Dept", accessor: "mostRunningItemSrNo" },
    { header: "SAC Code", accessor: "picture" },
    { header: "Barcode", accessor: "barcode" },

    {
      header: "Veg",
      accessor: "isVeg",
    },
  ];

  const fetchNextCode = async () => {
    try {
      const res = await getNextIdCode({
        tableName: "ItemMaster",
        columnName: "ItemCode",
        conditionName: "Branch_Code",
        branch: appData?.user?.branch_code,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          itemCode: Number(res.data),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);

      const res = await getItemMasterList(appData?.user?.branch_code);

      if (res?.success) {
        const formatted = res.data.map((item: any) => ({
          id: item.itemCode,

          itemCode: item.itemCode || 0,
          itemName: item.itemName || "",

          catCode: item.catCode || "",
          subCatCode: item.subCatCode || "",
          grpCode: item.grpCode || "",

          itemDiscountAllowed: item.itemDiscountAllowed || false,
          itemRate: item.itemRate || 0,

          unitName: item.unit || "",
          dep: item.dep || "",
          depCode: item.depCode || "",
          taxName: item.taxName || "",

          printDepartment: item.printDepartment || "",
          sacCode: item.sacCode || "",
          barcode: item.barcode || "",

          isVeg: item.isVeg || false,
          qpb: item.qpb || 0,
          mostRunningItemSrNo: item.mostRunningItemSrNo || "",
          picture: item.picture || "",
        }));

        setData(formatted);
      } else {
        toast.error(res?.message || "Failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching items");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchNextCode();
    fetchItems();
    fetchCategories();
    fetchSubCategories();
    fetchGroups();
    fetchUnits();
    fetchDepartments();
    fetchTaxes();
    fetchPrintingDepartments();
  }, []);
const handleEdit = (row: any) => {
  setIsEdit(true);

  const selectedCategory = categories.find(
    (c) => String(c.catCode) === String(row.catCode)
  );

  const selectedSubCategory = subCategories.find(
    (s) => String(s.subCatCode) === String(row.qpb)
  );

  const selectedGroup = groups.find(
    (g) => String(g.grpCode) === String(row.grpCode)
  );

  const selectedDepartment = departments.find(
    (d) => String(d.depCode) === String(row.depCode)
  );

  const selectedPrintDepartment = printingDepartments.find(
    (p) => String(p.depCode) === String(row.mostRunningItemSrNo)
  );

  setForm({
    id: row.itemCode,

    itemCode: row.itemCode,
    itemName: row.itemName,

    catCode: String(selectedCategory?.catCode || ""),
    subCatCode: String(selectedSubCategory?.subCatCode || ""),
    grpCode: String(selectedGroup?.grpCode || ""),

    itemDiscountAllowed: row.itemDiscountAllowed,
    itemRate: row.itemRate,

    unitName: row.unitName,

    dep: selectedDepartment?.depName || "",

    taxName: row.taxName || "",

    printDepartment: selectedPrintDepartment?.depName || "",

    sacCode: row.picture || "",
    barcode: row.barcode || "",

    isVeg: row.isVeg,
  });
};

  const handleSave = async () => {
    try {
      setLoading(true);

      const selectedUnit = units.find((u) => u.unitName === form.unitName);

      const selectedDepartment = departments.find(
        (d) => d.depName === form.dep,
      );

      const selectedTax = taxes.find((t) => t.taxName === form.taxName);
      const selectedPrintDepartment = printingDepartments.find(
        (p) => p.depName === form.printDepartment,
      );
      const payload = {
        itemCode: form.itemCode,
        itemName: form.itemName,

        catCode: form.catCode,
        subCatCode: form.subCatCode,
        grpCode: form.grpCode,

        itemDiscountAllowed: form.itemDiscountAllowed,
        itemRate: form.itemRate,

        userCode: String(appData?.user?.userCode) || "",
        lastModify: new Date().toISOString(),

        unitCode: selectedUnit?.unitCode || 0,
        unitName: form.unitName,

        dep: form.dep,
        depCode: String(selectedDepartment?.depCode || ""),

        taxCode: selectedTax?.taxCode || 0,
        taxName: form.taxName,
        printDepartment: String(selectedPrintDepartment?.depCode || ""),
        branchCode: appData?.user?.branch_code || "",

        sacCode: form.sacCode,
        thumb: "",

        barcode: form.barcode,
        isVeg: form.isVeg,
      };

      const res = await createItemMaster(payload);

      if (res?.success) {
        toast.success(res.message || "Item created successfully");

        fetchItems();
        fetchNextCode();

        setForm({
          id: 0,

          itemCode: 0,
          itemName: "",

          catCode: "",
          subCatCode: "",
          grpCode: "",

          itemDiscountAllowed: false,
          itemRate: 0,

          unitName: "",
          dep: "",
          taxName: "",

          printDepartment: "",
          sacCode: "",
          barcode: "",

          isVeg: true,
        });
      } else {
        toast.error(res?.message || "Failed to create item");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error creating item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}

        {/* FORM */}
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Item Master</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm mb-1">Item Code</label>

              <input
                type="number"
                name="itemCode"
                value={form.itemCode}
                disabled
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Item Name</label>

              <input
                type="text"
                name="itemName"
                value={form.itemName}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Category Code</label>

              <select
                name="catCode"
                value={form.catCode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    catCode: e.target.value,
                  }))
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select Category</option>

                {categories.map((cat) => (
                  <option key={cat.catCode} value={cat.catCode}>
                    {cat.catName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Sub Category Code</label>

              <select
                name="subCatCode"
                value={form.subCatCode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    subCatCode: e.target.value,
                  }))
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select Sub Category</option>

                {subCategories.map((sub) => (
                  <option key={sub.subCatCode} value={sub.subCatCode}>
                    {sub.subCatName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Group Code</label>

              <select
                name="grpCode"
                value={form.grpCode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    grpCode: e.target.value,
                  }))
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select Group</option>

                {groups.map((grp) => (
                  <option key={grp.grpCode} value={grp.grpCode}>
                    {grp.grpName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Barcode</label>

              <input
                type="text"
                name="barcode"
                value={form.barcode}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Unit Name</label>

              <select
                name="unitName"
                value={form.unitName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    unitName: e.target.value,
                  }))
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select Unit</option>

                {units.map((unit) => (
                  <option key={unit.unitCode} value={unit.unitName}>
                    {unit.unitName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Department</label>

              <select
                name="dep"
                value={form.dep}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dep: e.target.value,
                  }))
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select Department</option>

                {departments.map((dep) => (
                  <option key={dep.depCode} value={dep.depName}>
                    {dep.depName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Tax Name</label>

              <select
                name="taxName"
                value={form.taxName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    taxName: e.target.value,
                  }))
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select Tax</option>

                {taxes.map((tax) => (
                  <option key={tax.taxCode} value={tax.taxName}>
                    {tax.taxName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Print Department</label>
              <select
                name="printDepartment"
                value={form.printDepartment}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    printDepartment: e.target.value,
                  }))
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select Print Department</option>

                {printingDepartments.map((dep) => (
                  <option key={dep.depCode} value={dep.depName}>
                    {dep.depName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">SAC Code</label>

              <input
                type="text"
                name="sacCode"
                value={form.sacCode}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Item Rate</label>

              <input
                type="number"
                name="itemRate"
                value={form.itemRate}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                name="itemDiscountAllowed"
                checked={form.itemDiscountAllowed}
                onChange={handleChange}
              />

              <label>Discount Allowed</label>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                name="isVeg"
                checked={form.isVeg}
                onChange={handleChange}
              />

              <label>Veg</label>
            </div>
          </div>

       <div className="flex gap-3 justify-end mt-6">
  {!isEdit && (
    <button
      onClick={handleSave}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
    >
      Save
    </button>
  )}

  {isEdit && (
    <>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded-lg"
      >
        Update
      </button>

      <button
        onClick={async () => {
          setIsEdit(false);

          setForm({
            id: 0,

            itemCode: 0,
            itemName: "",

            catCode: "",
            subCatCode: "",
            grpCode: "",

            itemDiscountAllowed: false,
            itemRate: 0,

            unitName: "",
            dep: "",
            taxName: "",

            printDepartment: "",
            sacCode: "",
            barcode: "",

            isVeg: true,
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
        <div>
          <h2 className="text-lg font-semibold mb-3">Item List</h2>

          <DataTable
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={(row) => setDeleteRow(row)}
          />

          {deleteRow && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm">
                <h2 className="text-lg font-semibold mb-3">Confirm Delete</h2>

                <p className="text-sm text-gray-600 mb-5">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{deleteRow.itemName}</span>?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteRow(null)}
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => setDeleteRow(null)}
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
