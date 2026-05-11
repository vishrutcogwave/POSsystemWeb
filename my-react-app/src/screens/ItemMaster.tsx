import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
import {
  getItemMasterList,
  getNextIdCode,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

type ItemMaster = {
  id: number;

  itemCode: number;
  itemName: string;
  catCode: number;
  grpCode: string;
  itemDiscountAllowed: boolean;
  barcode: string;
  isVeg: boolean;
  unit: string;
  itemRate: number;
};

export default function ItemMaster() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState<ItemMaster>({
    id: 0,

    itemCode: 0,
    itemName: "",
    catCode: 0,
    grpCode: "",
    itemDiscountAllowed: false,
    barcode: "",
    isVeg: true,
    unit: "",
    itemRate: 0,
  });

  const [data, setData] = useState<ItemMaster[]>([]);
  const [deleteRow, setDeleteRow] = useState<ItemMaster | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "itemCode" || name === "catCode" || name === "itemRate"
            ? Number(value)
            : value,
    }));
  };

  const columns: Column<ItemMaster>[] = [
    { header: "Code", accessor: "itemCode" },
    { header: "Item Name", accessor: "itemName" },
    { header: "Category", accessor: "catCode" },
    { header: "Group", accessor: "grpCode" },
    {
      header: "Discount",
      accessor: "itemDiscountAllowed",
      cell: (row) => (row.itemDiscountAllowed ? "Yes" : "No"),
    },
    { header: "Barcode", accessor: "barcode" },
    {
      header: "Veg",
      accessor: "isVeg",
      cell: (row) => (row.isVeg ? "Veg" : "Non Veg"),
    },
    { header: "Unit", accessor: "unit" },
    { header: "Rate", accessor: "itemRate" },
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

          itemCode: item.itemCode,
          itemName: item.itemName || "",
          catCode: item.catCode || 0,
          grpCode: item.grpCode || "",
          itemDiscountAllowed: item.itemDiscountAllowed || false,
          barcode: item.barcode || "",
          isVeg: item.isVeg || false,
          unit: item.unit || "",
          itemRate: item.itemRate || 0,
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
  }, []);

  const handleEdit = (row: ItemMaster) => {
    setIsEdit(true);

    setForm({
      id: row.itemCode,

      itemCode: row.itemCode,
      itemName: row.itemName,
      catCode: row.catCode,
      grpCode: row.grpCode,
      itemDiscountAllowed: row.itemDiscountAllowed,
      barcode: row.barcode,
      isVeg: row.isVeg,
      unit: row.unit,
      itemRate: row.itemRate,
    });
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

            <input
              type="number"
              name="catCode"
              value={form.catCode}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Group Code</label>

            <input
              type="text"
              name="grpCode"
              value={form.grpCode}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />
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
            <label className="text-sm mb-1">Unit</label>

            <input
              type="text"
              name="unit"
              value={form.unit}
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
          <button
            disabled={isEdit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Save
          </button>

          <button
            disabled={!isEdit}
            className="bg-green-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Update
          </button>
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
