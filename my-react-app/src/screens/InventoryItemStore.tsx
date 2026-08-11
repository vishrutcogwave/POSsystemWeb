import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
import {
  createInventoryItemStore,
  deleteInventoryItemStore,
  getInventoryItemStoreList,
  updateInventoryItemStore,
  getInventoryItemCategoryList,
  getInventorySubCategoryMasterList,
  GetGroupMasterList,
  GetUnitMasterList,
  getNextIdCode,
  getStoreMasterList,
  getTaxMasterList,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

type InventoryItemStore = {
  id: number;

  itemCode: number;
  itemName: string;

  catCode: number;
  subCatCode: number;

  storeid: string;
  grpCode: string;

  unitCode: number;
  unitName: string;

  purchaseRate: string;
  noofUnits: number;

  itemRate: number;

  itemOpStock: number;
  itemOpRate: number;

  itemROQ: number;
  itemROL: number;

  barCode: string;

  taxCode: number;
  taxName: string;

  picture: string;

  userCode: string;
  lastModify: string;

  mostRunningItemSrNo: string;

  branch_Code: string;

  firstUnit: number;
  firstUnitDesc: string;

  finalUnit: number;
  finalUnitDesc: string;
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

type StoreMasterModel = {
  id: string;
  storeId: string;
  storeName: string;
  storeLocation: string;
  storeIncharge: string;
  branch_Code: string;
};

type TaxMasterModel = {
  taxCode: number;
  taxName: string;
};

export default function InventoryItemStore() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [data, setData] = useState<InventoryItemStore[]>([]);

  const [deleteRow, setDeleteRow] =
    useState<InventoryItemStore | null>(null);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [subCategories, setSubCategories] =
    useState<SubCategory[]>([]);

  const [groups, setGroups] =
    useState<Group[]>([]);

  const [units, setUnits] =
    useState<Unit[]>([]);

  const [stores, setStores] =
    useState<StoreMasterModel[]>([]);

  const [taxes, setTaxes] =
    useState<TaxMasterModel[]>([]);

  const [form, setForm] = useState<InventoryItemStore>({
    id: 0,

    itemCode: 0,
    itemName: "",

    catCode: 0,
    subCatCode: 0,

    storeid: "",
    grpCode: "",

    unitCode: 0,
    unitName: "",

    purchaseRate: "",
    noofUnits: 0,

    itemRate: 0,

    itemOpStock: 0,
    itemOpRate: 0,

    itemROQ: 0,
    itemROL: 0,

    barCode: "",

    taxCode: 0,
    taxName: "",

    picture: "",

    userCode: "",
    lastModify: "",

    mostRunningItemSrNo: "",

    branch_Code: "",

    firstUnit: 0,
    firstUnitDesc: "",

    finalUnit: 0,
    finalUnitDesc: "",
  });

  // =========================================================
  // GET NEXT ITEM CODE
  // =========================================================

  const fetchNextCode = async () => {
    try {
      const res = await getNextIdCode({
        tableName: "InventoryItemMaster",
        columnName: "ItemCode",
        conditionName: "Branch_Code",
        branch: appData?.user?.branch_code,
      });

      console.log("Next Item Code:", res);

      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          itemCode: Number(res.data),
        }));
      }
    } catch (err) {
      console.error(
        "Error fetching next item code:",
        err
      );
    }
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    if (!form.itemName.trim()) {
      toast.error("Please enter Item Name");
      return false;
    }

    if (!form.storeid.trim()) {
      toast.error("Please select Store");
      return false;
    }

    if (!form.catCode) {
      toast.error("Please select Category");
      return false;
    }

    if (!form.subCatCode) {
      toast.error("Please select Sub Category");
      return false;
    }

    if (!form.grpCode) {
      toast.error("Please select Group");
      return false;
    }

    if (!form.unitCode) {
      toast.error("Please select Unit");
      return false;
    }

    if (form.itemRate <= 0) {
      toast.error("Please enter a valid Item Rate");
      return false;
    }

    if (form.itemOpStock < 0) {
      toast.error("Opening Stock cannot be negative");
      return false;
    }

    if (form.itemROQ < 0) {
      toast.error("ROQ cannot be negative");
      return false;
    }

    if (form.itemROL < 0) {
      toast.error("ROL cannot be negative");
      return false;
    }

    return true;
  };

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    const numberFields = [
      "itemCode",
      "catCode",
      "subCatCode",
      "unitCode",
      "noofUnits",
      "itemRate",
      "itemOpStock",
      "itemOpRate",
      "itemROQ",
      "itemROL",
      "taxCode",
      "firstUnit",
      "finalUnit",
    ];

    setForm((prev) => ({
      ...prev,
      [name]: numberFields.includes(name)
        ? Number(value)
        : value,
    }));
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns: Column<InventoryItemStore>[] = [
    {
      header: "Code",
      accessor: "itemCode",
    },
    {
      header: "Item Name",
      accessor: "itemName",
    },
    {
      header: "Store",
      accessor: "storeid",
    },
    {
      header: "Category",
      accessor: "catCode",
    },
    {
      header: "Sub Category",
      accessor: "subCatCode",
    },
    {
      header: "Group",
      accessor: "grpCode",
    },
    {
      header: "Unit",
      accessor: "unitName",
    },
    {
      header: "Purchase Rate",
      accessor: "purchaseRate",
    },
    {
      header: "Item Rate",
      accessor: "itemRate",
    },
    {
      header: "Opening Stock",
      accessor: "itemOpStock",
    },
    {
      header: "ROQ",
      accessor: "itemROQ",
    },
    {
      header: "ROL",
      accessor: "itemROL",
    },
    {
      header: "Barcode",
      accessor: "barCode",
    },
    {
      header: "Tax",
      accessor: "taxName",
    },
  ];

  // =========================================================
  // FETCH INVENTORY ITEMS
  // =========================================================

  const fetchItems = async () => {
    try {
      setLoading(true);

      const res =
        await getInventoryItemStoreList(
          appData?.user?.branch_code
        );

      console.log(
        "Inventory Item Store List:",
        res
      );

      if (res?.success) {
        const formatted = (
          res.data || []
        ).map((item: any) => ({
          id:
            item.itemCode ||
            item.id ||
            0,

          itemCode:
            Number(item.itemCode) || 0,

          itemName:
            item.itemName || "",

          catCode:
            Number(item.catCode) || 0,

          subCatCode:
            Number(item.subCatCode) || 0,

          storeid:
            item.storeid || "",

          grpCode:
            item.grpCode || "",

          unitCode:
            Number(item.unitCode) || 0,

          unitName:
            item.unitName || "",

          purchaseRate:
            item.purchaseRate || "",

          noofUnits:
            Number(item.noofUnits) || 0,

          itemRate:
            Number(item.itemRate) || 0,

          itemOpStock:
            Number(item.itemOpStock) || 0,

          itemOpRate:
            Number(item.itemOpRate) || 0,

          itemROQ:
            Number(item.itemROQ) || 0,

          itemROL:
            Number(item.itemROL) || 0,

          barCode:
            item.barCode || "",

          taxCode:
            Number(item.taxCode) || 0,

          taxName:
            item.taxName || "",

          picture: "",

          userCode:
            item.userCode || "",

          lastModify:
            item.lastModify || "",

          mostRunningItemSrNo:
            item.mostRunningItemSrNo || "",

          branch_Code:
            item.branch_Code ||
            item.branchCode ||
            appData?.user?.branch_code ||
            "",

          firstUnit:
            Number(item.firstUnit) || 0,

          firstUnitDesc:
            item.firstUnitDesc || "",

          finalUnit:
            Number(item.finalUnit) || 0,

          finalUnitDesc:
            item.finalUnitDesc || "",
        }));

        setData(formatted);
      } else {
        toast.error(
          res?.message ||
            "Failed to fetch inventory items"
        );
      }
    } catch (err) {
      console.error(err);

      toast.error(
        "Error fetching inventory items"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  const fetchCategories = async () => {
    try {
      const res =
        await getInventoryItemCategoryList(
          appData?.user?.branch_code
        );

      if (res?.success) {
        setCategories(res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed to fetch categories"
      );
    }
  };

  // =========================================================
  // FETCH SUB CATEGORIES
  // =========================================================

  const fetchSubCategories = async () => {
    try {
      const res =
        await getInventorySubCategoryMasterList(
          appData?.user?.branch_code
        );

      if (res?.success) {
        setSubCategories(res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed to fetch sub categories"
      );
    }
  };

  // =========================================================
  // FETCH GROUPS
  // =========================================================

  const fetchGroups = async () => {
    try {
      const res =
        await GetGroupMasterList(
          appData?.user?.branch_code
        );

      if (res?.success) {
        setGroups(res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed to fetch groups"
      );
    }
  };

  // =========================================================
  // FETCH STORES
  // =========================================================

  const fetchStores = async () => {
    try {
      setLoading(true);

      const res = await getStoreMasterList(
        appData?.user?.branch_code
      );

      console.log("Store Master List:", res);

      if (res?.success) {
        const formattedData: StoreMasterModel[] = (
          res.data || []
        ).map((item: any) => ({
          id: String(item.storeId),
          storeId: String(item.storeId),
          storeName: item.storeName || "",
          storeLocation: item.storeLocation || "",
          storeIncharge: item.storeIncharge || "",
          branch_Code:
            item.branch_Code ||
            item.branchCode ||
            appData?.user?.branch_code ||
            "",
        }));

        setStores(formattedData);
      } else {
        toast.error(
          res?.message || "Failed to load stores"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading stores");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH TAXES
  // =========================================================

  const fetchTaxes = async () => {
    try {
      const res = await getTaxMasterList(
        appData?.user?.branch_code
      );

      console.log("Tax Master List:", res);

      if (res?.success) {
        setTaxes(res.data || []);
      } else {
        toast.error(
          res?.message || "Failed to fetch taxes"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch taxes");
    }
  };

  // =========================================================
  // FETCH UNITS
  // =========================================================

  const fetchUnits = async () => {
    try {
      const res =
        await GetUnitMasterList(
          appData?.user?.branch_code
        );

      if (res?.success) {
        setUnits(res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed to fetch units"
      );
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!appData?.user?.branch_code) {
      return;
    }

    fetchNextCode();
    fetchItems();
    fetchCategories();
    fetchSubCategories();
    fetchGroups();
    fetchUnits();
    fetchStores();
    fetchTaxes();
  }, [appData?.user?.branch_code]);

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (
    row: InventoryItemStore
  ) => {
    console.log(
      "Inventory item edit:",
      row
    );

    setIsEdit(true);

    setForm({
      id: row.itemCode,

      itemCode: row.itemCode,
      itemName: row.itemName,

      catCode: row.catCode,
      subCatCode: row.subCatCode,

      storeid: row.storeid,
      grpCode: row.grpCode,

      unitCode: row.unitCode,
      unitName: row.unitName,

      purchaseRate:
        row.purchaseRate,

      noofUnits:
        row.noofUnits,

      itemRate:
        row.itemRate,

      itemOpStock:
        row.itemOpStock,

      itemOpRate:
        row.itemOpRate,

      itemROQ:
        row.itemROQ,

      itemROL:
        row.itemROL,

      barCode:
        row.barCode,

      taxCode:
        row.taxCode,

      taxName:
        row.taxName,

      picture:
        "",

      userCode:
        row.userCode,

      lastModify:
        row.lastModify,

      mostRunningItemSrNo:
        row.mostRunningItemSrNo,

      branch_Code:
        row.branch_Code,

      firstUnit:
        row.firstUnit,

      firstUnitDesc:
        row.firstUnitDesc,

      finalUnit:
        row.finalUnit,

      finalUnitDesc:
        row.finalUnitDesc,
    });
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const handleReset = async () => {
    setIsEdit(false);

    setForm({
      id: 0,

      itemCode: 0,
      itemName: "",

      catCode: 0,
      subCatCode: 0,

      storeid: "",
      grpCode: "",

      unitCode: 0,
      unitName: "",

      purchaseRate: "",
      noofUnits: 0,

      itemRate: 0,

      itemOpStock: 0,
      itemOpRate: 0,

      itemROQ: 0,
      itemROL: 0,

      barCode: "",

      taxCode: 0,
      taxName: "",

      picture: "",

      userCode: "",
      lastModify: "",

      mostRunningItemSrNo: "",

      branch_Code:
        appData?.user?.branch_code ||
        "",

      firstUnit: 0,
      firstUnitDesc: "",

      finalUnit: 0,
      finalUnitDesc: "",
    });

    await fetchNextCode();
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDeleteRow = (
    row: InventoryItemStore
  ) => {
    setDeleteRow(row);
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;

    try {
      setLoading(true);

      const res =
        await deleteInventoryItemStore(
          deleteRow.itemCode,
          appData?.user?.branch_code
        );

      if (res?.success) {
        toast.success(
          res?.message ||
            "Deleted successfully"
        );

        await fetchItems();
        await fetchNextCode();

        if (
          isEdit &&
          form.itemCode ===
            deleteRow.itemCode
        ) {
          await handleReset();
        }
      } else {
        toast.error(
          res?.message ||
            "Delete failed"
        );
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          "Error deleting item"
      );
    } finally {
      setLoading(false);
      setDeleteRow(null);
    }
  };

  const cancelDelete = () => {
    setDeleteRow(null);
  };

  // =========================================================
  // CREATE
  // =========================================================

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const selectedUnit =
        units.find(
          (u) =>
            Number(u.unitCode) ===
            Number(form.unitCode)
        );

      const payload = {
        itemCode:
          form.itemCode,

        itemName:
          form.itemName,

        catCode:
          form.catCode,

        subCatCode:
          form.subCatCode,

        storeid:
          form.storeid,

        grpCode:
          form.grpCode,

        unitCode:
          form.unitCode,

        unitName:
          selectedUnit?.unitName ||
          form.unitName,

        purchaseRate:
          form.purchaseRate,

        noofUnits:
          form.noofUnits,

        itemRate:
          form.itemRate,

        itemOpStock:
          form.itemOpStock,

        itemOpRate:
          form.itemOpRate,

        itemROQ:
          form.itemROQ,

        itemROL:
          form.itemROL,

        barCode:
          form.barCode,

        taxCode:
          form.taxCode,

        taxName:
          form.taxName,

        picture: "",

        userCode:
          String(
            appData?.user?.userCode ||
              ""
          ),

        lastModify:
          new Date().toISOString(),

        mostRunningItemSrNo:
          form.mostRunningItemSrNo,

        branch_Code:
          appData?.user?.branch_code ||
          "",

        firstUnit:
          form.firstUnit,

        firstUnitDesc:
          form.firstUnitDesc,

        finalUnit:
          form.finalUnit,

        finalUnitDesc:
          form.finalUnitDesc,
      };

      console.log(
        "CREATE INVENTORY ITEM STORE PAYLOAD:",
        payload
      );

      const res =
        await createInventoryItemStore(
          payload
        );

      if (res?.success) {
        toast.success(
          res?.message ||
            "Inventory item created successfully"
        );

        await fetchItems();
        await fetchNextCode();

        setIsEdit(false);

        setForm((prev) => ({
          ...prev,

          itemName: "",
          catCode: 0,
          subCatCode: 0,
          storeid: "",
          grpCode: "",
          unitCode: 0,
          unitName: "",
          purchaseRate: "",
          noofUnits: 0,
          itemRate: 0,
          itemOpStock: 0,
          itemOpRate: 0,
          itemROQ: 0,
          itemROL: 0,
          barCode: "",
          taxCode: 0,
          taxName: "",
          picture: "",
          userCode: "",
          lastModify: "",
          mostRunningItemSrNo: "",
          branch_Code:
            appData?.user?.branch_code ||
            "",
          firstUnit: 0,
          firstUnitDesc: "",
          finalUnit: 0,
          finalUnitDesc: "",
        }));
      } else {
        toast.error(
          res?.message ||
            "Failed to create inventory item"
        );
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          "Error creating inventory item"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UPDATE
  // =========================================================

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const selectedUnit =
        units.find(
          (u) =>
            Number(u.unitCode) ===
            Number(form.unitCode)
        );

      const payload = {
        itemCode:
          form.itemCode,

        itemName:
          form.itemName,

        catCode:
          form.catCode,

        subCatCode:
          form.subCatCode,

        storeid:
          form.storeid,

        grpCode:
          form.grpCode,

        unitCode:
          form.unitCode,

        unitName:
          selectedUnit?.unitName ||
          form.unitName,

        purchaseRate:
          form.purchaseRate,

        noofUnits:
          form.noofUnits,

        itemRate:
          form.itemRate,

        itemOpStock:
          form.itemOpStock,

        itemOpRate:
          form.itemOpRate,

        itemROQ:
          form.itemROQ,

        itemROL:
          form.itemROL,

        barCode:
          form.barCode,

        taxCode:
          form.taxCode,

        taxName:
          form.taxName,

        picture:
          "",

        userCode:
          String(
            appData?.user?.userCode ||
              ""
          ),

        lastModify:
          new Date().toISOString(),

        mostRunningItemSrNo:
          form.mostRunningItemSrNo,

        branch_Code:
          appData?.user?.branch_code ||
          "",

        firstUnit:
          form.firstUnit,

        firstUnitDesc:
          form.firstUnitDesc,

        finalUnit:
          form.finalUnit,

        finalUnitDesc:
          form.finalUnitDesc,
      };

      console.log(
        "UPDATE INVENTORY ITEM STORE PAYLOAD:",
        payload
      );

      const res =
        await updateInventoryItemStore(
          payload
        );

      if (res?.success) {
        toast.success(
          res?.message ||
            "Inventory item updated successfully"
        );

        await fetchItems();
        await fetchNextCode();

        setIsEdit(false);

        setForm((prev) => ({
          ...prev,

          itemCode: Number(
            prev.itemCode
          ),
          itemName: "",
          catCode: 0,
          subCatCode: 0,
          storeid: "",
          grpCode: "",
          unitCode: 0,
          unitName: "",
          purchaseRate: "",
          noofUnits: 0,
          itemRate: 0,
          itemOpStock: 0,
          itemOpRate: 0,
          itemROQ: 0,
          itemROL: 0,
          barCode: "",
          taxCode: 0,
          taxName: "",
          picture: "",
          userCode: "",
          lastModify: "",
          mostRunningItemSrNo: "",
          branch_Code:
            appData?.user?.branch_code ||
            "",
          firstUnit: 0,
          firstUnitDesc: "",
          finalUnit: 0,
          finalUnitDesc: "",
        }));
      } else {
        toast.error(
          res?.message ||
            "Failed to update inventory item"
        );
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          "Error updating inventory item"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}

        {/* HEADER */}

        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Inventory Item Store
            </h1>

            <p className="text-sm text-gray-500">
              Manage inventory item store details
            </p>
          </div>
        </div>

        {/* FORM */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">
            Inventory Item Store
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* ITEM CODE */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Item Code
              </label>

              <input
                type="number"
                name="itemCode"
                value={form.itemCode}
                disabled
                className="border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>

            {/* ITEM NAME */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Item Name
              </label>

              <input
                type="text"
                name="itemName"
                value={form.itemName}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* STORE */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Store
              </label>

              <select
                name="storeid"
                value={form.storeid}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">
                  Select Store
                </option>

                {stores.map((store) => (
                  <option
                    key={store.storeId}
                    value={store.storeId}
                  >
                    {store.storeName}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Category
              </label>

              <select
                name="catCode"
                value={form.catCode}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              >
                <option value={0}>
                  Select Category
                </option>

                {categories.map((cat) => (
                  <option
                    key={cat.catCode}
                    value={cat.catCode}
                  >
                    {cat.catName}
                  </option>
                ))}
              </select>
            </div>

            {/* SUB CATEGORY */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Sub Category
              </label>

              <select
                name="subCatCode"
                value={form.subCatCode}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              >
                <option value={0}>
                  Select Sub Category
                </option>

                {subCategories.map((sub) => (
                  <option
                    key={sub.subCatCode}
                    value={sub.subCatCode}
                  >
                    {sub.subCatName}
                  </option>
                ))}
              </select>
            </div>

            {/* GROUP */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Group
              </label>

              <select
                name="grpCode"
                value={form.grpCode}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">
                  Select Group
                </option>

                {groups.map((grp) => (
                  <option
                    key={grp.grpCode}
                    value={grp.grpCode}
                  >
                    {grp.grpName}
                  </option>
                ))}
              </select>
            </div>

            {/* BARCODE */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Barcode
              </label>

              <input
                type="text"
                name="barCode"
                value={form.barCode}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* UNIT */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Unit
              </label>

              <select
                name="unitCode"
                value={form.unitCode}
                onChange={(e) => {
                  const unitCode = Number(
                    e.target.value
                  );

                  const unit = units.find(
                    (u) =>
                      Number(u.unitCode) ===
                      unitCode
                  );

                  setForm((prev) => ({
                    ...prev,
                    unitCode,
                    unitName:
                      unit?.unitName || "",
                    firstUnitDesc:
                      unit?.unitName || "",
                  }));
                }}
                className="border rounded-lg px-3 py-2"
              >
                <option value={0}>
                  Select Unit
                </option>

                {units.map((unit) => (
                  <option
                    key={unit.unitCode}
                    value={unit.unitCode}
                  >
                    {unit.unitName}
                  </option>
                ))}
              </select>
            </div>

            {/* PURCHASE RATE */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Purchase Rate
              </label>

              <input
                type="text"
                name="purchaseRate"
                value={form.purchaseRate}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* NO OF UNITS */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                No. of Units
              </label>

              <input
                type="number"
                name="noofUnits"
                value={form.noofUnits}
                onChange={(e) => {
                  const value = Number(
                    e.target.value
                  );

                  setForm((prev) => ({
                    ...prev,
                    noofUnits: value,
                    firstUnit: value,
                  }));
                }}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* ITEM RATE */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Item Rate
              </label>

              <input
                type="number"
                name="itemRate"
                value={form.itemRate}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* OPENING STOCK */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Opening Stock
              </label>

              <input
                type="number"
                name="itemOpStock"
                value={form.itemOpStock}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* OPENING RATE */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Opening Rate
              </label>

              <input
                type="number"
                name="itemOpRate"
                value={form.itemOpRate}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* ROQ */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Reorder Quantity (ROQ)
              </label>

              <input
                type="number"
                name="itemROQ"
                value={form.itemROQ}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* ROL */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Reorder Level (ROL)
              </label>

              <input
                type="number"
                name="itemROL"
                value={form.itemROL}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* TAX */}

            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Tax
              </label>

              <select
                name="taxCode"
                value={form.taxCode}
                onChange={(e) => {
                  const taxCode = Number(e.target.value);

                  const selectedTax = taxes.find(
                    (tax) =>
                      Number(tax.taxCode) === taxCode
                  );

                  setForm((prev) => ({
                    ...prev,
                    taxCode,
                    taxName:
                      selectedTax?.taxName || "",
                  }));
                }}
                className="border rounded-lg px-3 py-2"
              >
                <option value={0}>
                  Select Tax
                </option>

                {taxes.map((tax) => (
                  <option
                    key={tax.taxCode}
                    value={tax.taxCode}
                  >
                    {tax.taxName}
                  </option>
                ))}
              </select>
            </div>

            {/* TAX NAME IS STORED AUTOMATICALLY */}

         

            {/* MOST RUNNING ITEM SR NO */}

         

            {/* ================================================= */}
            {/* ENTER UNITS */}
            {/* ================================================= */}

      {/* ========================================================= */}
{/* ENTER UNITS */}
{/* ========================================================= */}

<div className="flex flex-col">
  <fieldset className="border border-gray-300 rounded-md px-2 pb-2 pt-1">
    <legend className="px-1 text-sm text-gray-700">
      Enter Units
    </legend>

    <div className="space-y-2">

      {/* FIRST UNIT */}
      <div className="flex items-center gap-1">

        <input
          type="number"
          name="firstUnit"
          value={form.firstUnit}
          disabled
          className="w-[55px] h-[30px] border border-gray-300 rounded-sm px-2 text-sm bg-gray-100 text-gray-600 text-center"
        />

        <span className="text-gray-500 font-medium px-1">
          =
        </span>

        <input
          type="text"
          name="firstUnitDesc"
          value={form.firstUnitDesc}
          disabled
          className="flex-1 h-[30px] border border-gray-300 rounded-sm px-2 text-sm bg-gray-100 text-gray-600"
        />

      </div>

      {/* FINAL UNIT */}
      <div className="flex items-center gap-1">

        <input
          type="number"
          name="finalUnit"
          value={form.finalUnit}
          onChange={handleChange}
          className="w-[55px] h-[30px] border border-gray-300 rounded-sm px-2 text-sm text-center"
        />

        <span className="text-gray-500 font-medium px-1">
          =
        </span>

        <select
          name="finalUnitDesc"
          value={form.finalUnitDesc}
          onChange={handleChange}
          className="flex-1 h-[30px] border border-gray-300 rounded-sm px-2 text-sm bg-white"
        >
          <option value="">
            Select Unit
          </option>

          {units.map((unit) => (
            <option
              key={unit.unitCode}
              value={unit.unitName}
            >
              {unit.unitName}
            </option>
          ))}
        </select>

      </div>

    </div>
  </fieldset>
</div>
          </div>

          {/* BUTTONS */}

          <div className="flex gap-3 justify-end mt-6">

            {!isEdit && (
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            )}

            {isEdit && (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Update
                </button>

                <button
                  onClick={handleReset}
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
            Inventory Item Store List
          </h2>

          <DataTable
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={handleDeleteRow}
          />

          {/* DELETE MODAL */}

          {deleteRow && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

              <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm">

                <h2 className="text-lg font-semibold mb-3">
                  Confirm Delete
                </h2>

                <p className="text-sm text-gray-600 mb-5">
                  Are you sure you want to
                  delete{" "}
                  <span className="font-semibold">
                    {deleteRow.itemName}
                  </span>
                  ?
                </p>

                <div className="flex justify-end gap-3">

                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmDelete}
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
