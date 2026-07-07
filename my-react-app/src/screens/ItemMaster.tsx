import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
import {
  createItemMaster,
  createItemMasterWithImage,
  deleteItemMaster,
  downloadItemMasterExcel,
  getAdditionalAddonDetailsList,
  GetCategoryMasterList,
  getDepartmentList,
  GetGroupMasterList,
  getItemMasterList,
  getNextIdCode,
  getOutletList,
  GetPrintingMasterList,
  GetSubCategoryMasterList,
  getTaxMasterList,
  GetUnitMasterList,
  insertorUpdateAddOnDetails,
  updateItemMaster,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

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
  isDirectKOTandBill: boolean;
  isDirectPaxandStw: boolean;
  printDepartment: string;
  sacCode: string;
  barcode: string;
  thumb?: string;
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
  const navigate = useNavigate();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
const [outlets, setOutlets] = useState<any[]>([]);
const [selectedOltCodes, setSelectedOltCodes] =
  useState<string[]>([]);
const [showOutletDropdown, setShowOutletDropdown] =
  useState(false);
  const [printingDepartments, setPrintingDepartments] = useState<
    PrintingDepartment[]
  >([]);
  const [changedAddons, setChangedAddons] =
  useState<any[]>([]);
useEffect(() => {
 console.log("changedAddons",changedAddons);
 
}, [changedAddons])


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
     isDirectKOTandBill: false,
  isDirectPaxandStw: false,
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [data, setData] = useState<ItemMaster[]>([]);
  const [deleteRow, setDeleteRow] = useState<ItemMaster | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [showAddonModal, setShowAddonModal] =
  useState(false);

const [addonList, setAddonList] = useState<any[]>(
  []
);
const [addonSearch, setAddonSearch] =
  useState("");

const [selectedAddons, setSelectedAddons] =
  useState<any[]>([]);

const fetchAddonList = async (
  itemCode: number
) => {
  try {
    const res =
      await getAdditionalAddonDetailsList(
        itemCode,
        appData?.user?.branch_code
      );

    if (res?.success) {
      const data = res.data || [];

      setAddonList([...data]);

      const activeAddons = data.filter(
        (item: any) =>
          item.isActive === true
      );

      // IMPORTANT
      setSelectedAddons([
        ...activeAddons,
      ]);

      console.log(
        "ACTIVE ADDONS",
        activeAddons
      );
    }
  } catch (err) {
    console.log(err);

    toast.error(
      "Failed to fetch addons"
    );
  }
};
const handleSaveAddons = async () => {
  try {
    setLoading(true);

    // SEND ALL ADDONS
  const payload = changedAddons.map(
  (item: any) => ({
    itemCode: form.itemCode,

    addOnItemCode:
      item.itemCode || 0,

    addOnName: item.addOnName,

    itemRate: item.itemRate,

    // TRUE OR FALSE
    isActive: item.isActive,

    userCode: String(
      appData?.user?.userCode
    ),

    branchCode:
      appData?.user?.branch_code,
      thumb:item.thumb
  })
);

    console.log(
      "ADDON PAYLOAD",
      payload
    );

    const res =
      await insertorUpdateAddOnDetails(
        payload
      );

    if (res?.success) {
      toast.success(
        "Addons updated successfully"
      );

      setShowAddonModal(false);
    } else {
      toast.error(
        res?.message || "Failed"
      );
    }
  } catch (err: any) {
    console.log(err);

    toast.error(
      err?.response?.data?.message ||
        "Error saving addons"
    );
  } finally {
    setLoading(false);
  }
};

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

  itemDiscountAllowed:
    item.itemDiscountAllowed || false,

  itemRate: item.itemRate || 0,

  unitName: item.unit || "",
  dep: item.dep || "",
  depCode: item.depCode || "",

  taxName: item.taxName || "",

  printDepartment:
    item.printDepartment || "",

  sacCode: item.sacCode || "",

  barcode: item.barcode || "",

  thumb: item.thumb || "",

  isVeg: item.isVeg || false,

  qpb: item.qpb || 0,

  mostRunningItemSrNo:
    item.mostRunningItemSrNo || "",

  picture: item.picture || "",

  // ✅ ADD THIS
  oltCode: item.oltCode || "",
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

async function getOuletList() {
  try {
    const res = await getOutletList(
      appData?.user?.branch_code
    );

    console.log("outletList", res);

    if (res?.success) {
      setOutlets(res.data || []);
    }
  } catch (e) {
    console.log(e);
  }
}

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
    getOuletList();
  }, []);

  const handleDeleteRow = (row: ItemMaster) => {
    setDeleteRow(row);
  };

const confirmDelete = async () => {
  if (!deleteRow) return;

  try {
    setLoading(true);

    // ✅ convert string[] -> number[]
    const outletCodes = selectedOltCodes.map(Number);

    const res = await deleteItemMaster(
      deleteRow.itemCode,
      appData?.user?.branch_code,
      outletCodes
    );

    if (res?.success) {
      toast.success("Deleted successfully ✅");

      await fetchNextCode();
      await fetchItems();

      if (isEdit && form.itemCode === deleteRow.itemCode) {
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
          isDirectKOTandBill:false,
          isDirectPaxandStw:false
        });

        setSelectedOltCodes([]);

        await fetchNextCode();
      }
    } else {
      toast.error(res?.message || "Delete failed ❌");
    }
  } catch (err: any) {
    console.error(err);

    toast.error(
      err?.response?.data?.message ||
        "Error deleting ❌"
    );
  } finally {
    setLoading(false);
    setDeleteRow(null);
  }
};
  const cancelDelete = () => {
    setDeleteRow(null);
  };

  const handleEdit = (row: any) => {
    console.log("rowinthe edit", row);

    setIsEdit(true);

const selectedOutlets = row.oltCode
  ? row.oltCode
      .split(",")
      .map((id: string) => id.trim())
  : [];

console.log("selectedOutlets", selectedOutlets);

setSelectedOltCodes(selectedOutlets);
    const selectedCategory = categories.find(
      (c) => String(c.catCode) === String(row.catCode),
    );

    const selectedSubCategory = subCategories.find(
      (s) => String(s.subCatCode) === String(row.qpb),
    );

    const selectedGroup = groups.find(
      (g) => String(g.grpCode) === String(row.grpCode),
    );

    const selectedDepartment = departments.find(
      (d) => String(d.depCode) === String(row.depCode),
    );

    const selectedPrintDepartment = printingDepartments.find(
      (p) => String(p.depCode) === String(row.mostRunningItemSrNo),
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

      // ✅ THIS IS IMPORTANT
      thumb: row.thumb || "",

      isVeg: row.isVeg,
      isDirectKOTandBill:row.isDirectKOTandBill,
      isDirectPaxandStw:row.isDirectPaxandStw
    });

    // ✅ clear selected image
    setSelectedImage(null);

    // ✅ show image name in edit mode
  };
  const handleSave = async () => {
    try {
      setLoading(true);
          if (selectedOltCodes.length === 0) {
      toast.error(
        "Please select at least one outlet"
      );

      setLoading(false);
      return;
    }

      const selectedUnit = units.find((u) => u.unitName === form.unitName);

      const selectedDepartment = departments.find(
        (d) => d.depName === form.dep,
      );

      const selectedTax = taxes.find((t) => t.taxName === form.taxName);

      const selectedPrintDepartment = printingDepartments.find(
        (p) => p.depName === form.printDepartment,
      );

      let thumbUrl = "";

      // ✅ Upload image first
      if (selectedImage) {
        const imageRes = await createItemMasterWithImage(selectedImage);

        if (imageRes?.success) {
          const baseUrl = localStorage.getItem("baseUrl") || "";

          // remove last slash if exists
          const cleanBaseUrl = baseUrl.endsWith("/")
            ? baseUrl.slice(0, -1)
            : baseUrl;

          // get only filename
          const fileName = imageRes.data.split("/").pop();

          // final thumb url
          thumbUrl = `${cleanBaseUrl}/Images/${fileName}`;
        }
      }

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

        // ✅ send uploaded image path
        thumb: thumbUrl,

        barcode: form.barcode,
        isVeg: form.isVeg,
        oltCodes: selectedOltCodes,
        isDirectKOTandBill:form.isDirectKOTandBill,
        isDirectPaxandStw:form.isDirectPaxandStw

      };

      const res = await createItemMaster(payload);

    if (res?.success) {
  // ✅ SAVE ADDONS AFTER ITEM SAVE SUCCESS
  if (changedAddons.length > 0) {
    await handleSaveAddons();
  }

  toast.success(res.message || "Item created successfully");

  fetchItems();
  fetchNextCode();

  setSelectedImage(null);

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }

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
    isDirectKOTandBill:false,
    isDirectPaxandStw:false
  });

  setSelectedOltCodes([]);
  setShowOutletDropdown(false);
}else {
        toast.error(res?.message || "Failed to create item");
      }
    } catch (err: any) {
      console.error(err);

      toast.error(err?.response?.data?.message || "Error creating item");
    } finally {
      setLoading(false);
    }
  };


  const handleUpdate = async () => {
    try {
      setLoading(true);
          if (selectedOltCodes.length === 0) {
      toast.error(
        "Please select at least one outlet"
      );

      setLoading(false);
      return;
    }

      const selectedUnit = units.find((u) => u.unitName === form.unitName);

      const selectedDepartment = departments.find(
        (d) => d.depName === form.dep,
      );

      const selectedTax = taxes.find((t) => t.taxName === form.taxName);

      const selectedPrintDepartment = printingDepartments.find(
        (p) => p.depName === form.printDepartment,
      );

      // ✅ keep old thumb if no new image
      let thumbUrl = form.thumb || "";

      // ✅ upload new image if selected
      if (selectedImage && selectedImage instanceof File) {
        const imageRes = await createItemMasterWithImage(selectedImage);

        if (imageRes?.success) {
          const baseUrl = localStorage.getItem("baseUrl") || "";

          const cleanBaseUrl = baseUrl.endsWith("/")
            ? baseUrl.slice(0, -1)
            : baseUrl;

          const fileName = imageRes.data.split("/").pop();

          thumbUrl = `${cleanBaseUrl}/Images/${fileName}`;
        }
      }

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

        // ✅ updated image path
        thumb: thumbUrl,

        barcode: form.barcode,
        isVeg: form.isVeg,
        oltCodes: selectedOltCodes,
          isDirectKOTandBill: form.isDirectKOTandBill,
  isDirectPaxandStw: form.isDirectPaxandStw
      };

      const res = await updateItemMaster(payload);

     if (res?.success) {

  // ✅ SAVE ADDONS AFTER UPDATE SUCCESS
  if (changedAddons.length > 0) {
    await handleSaveAddons();
  }

  toast.success(res.message || "Item updated successfully");

  fetchItems();
  fetchNextCode();

  setIsEdit(false);

  setSelectedImage(null);

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }

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
    thumb: "",
    isVeg: true,
    isDirectKOTandBill:false,
    isDirectPaxandStw:false,
  });

  setSelectedOltCodes([]);
  setShowOutletDropdown(false);
} else {
        toast.error(res?.message || "Failed to update item");
      }
    } catch (err: any) {
      console.error(err);

      toast.error(err?.response?.data?.message || "Error updating item");
    } finally {
      setLoading(false);
    }
  };
       const filteredAddons =
  addonList.filter((item: any) =>
    item.addOnName
      ?.toLowerCase()
      .includes(
        addonSearch.toLowerCase()
      )
  );
  return (
    <>
      <Header showNeworderButton={false} />


      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}

        {/* FORM */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* LEFT SIDE */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Item Master
            </h1>

            <p className="text-sm text-gray-500">
              Manage item details and download/import excel template
            </p>
          </div>

          {/* RIGHT SIDE BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* DOWNLOAD BUTTON */}
            <button
              onClick={async () => {
                try {
                  setLoading(true);

                  await downloadItemMasterExcel(appData?.user?.branch_code);

                  toast.success("Excel downloaded successfully ✅");
                } catch (err) {
                  console.error(err);

                  toast.error("Failed to download excel ❌");
                } finally {
                  setLoading(false);
                }
              }}
              className="
        w-full sm:w-auto
        bg-purple-600 hover:bg-purple-700
        text-white
        px-4 md:px-5
        py-2.5
        rounded-xl
        font-medium
        transition-all
        duration-200
        shadow-sm
        flex items-center justify-center gap-2
      "
            >
              <span>⬇</span>
              <span>Download Excel</span>
            </button>

            {/* IMPORT BUTTON */}
            <button
              onClick={() => navigate("/item-master-import")}
              className="
    w-full sm:w-auto
    bg-green-600 hover:bg-green-700
    text-white
    px-4 md:px-5
    py-2.5
    rounded-xl
    font-medium
    transition-all
    duration-200
    shadow-sm
    flex items-center justify-center gap-2
  "
            >
              <span>⬆</span>
              <span>Import Excel</span>
            </button>
          </div>
        </div>
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
            {/* <div className="flex flex-col">
              <label className="text-sm mb-1">Item Image</label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    setSelectedImage(file);
                  }
                }}
                className="border rounded-lg px-3 py-2"
              />

              {selectedImage && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="text-gray-700">{selectedImage.name}</span>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                    }}
                    className="text-red-500 font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div> */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">Item Image</label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    // ✅ Restrict max size to 100KB
                    const maxSize = 100 * 1024;

                    if (file.size > maxSize) {
                      toast.error("Image size must be less than 100 KB");

                      // clear input
                      e.target.value = "";

                      return;
                    }

                    setSelectedImage(file);
                  }
                }}
                className="border rounded-lg px-3 py-2"
              />

              {/* ✅ New uploaded image */}
              {selectedImage instanceof File && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);

                      // clear file input
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="text-red-500 text-sm mt-1"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* ✅ Existing thumb image in edit mode */}
              {!selectedImage && form.thumb && (
                <div className="mt-2">
                  <img
                    src={form.thumb}
                    alt="Thumb"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        thumb: "",
                      }));

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="text-red-500 text-sm mt-1"
                  >
                    Remove
                  </button>
                </div>
              )}
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
<div className="flex flex-col relative">
  <label className="text-sm mb-1">
    Outlets
  </label>

  {/* SELECT STYLE BOX */}
  <div
    onClick={() =>
      setShowOutletDropdown(
        !showOutletDropdown
      )
    }
    className="
      border rounded-lg px-3 py-2
      bg-white cursor-pointer
      h-[42px]
      flex items-center justify-between
    "
  >
    <span
      className={`truncate ${
        selectedOltCodes.length === 0
          ? "text-gray-500"
          : "text-black"
      }`}
    >
      {selectedOltCodes.length > 0
        ? selectedOltCodes.join(", ")
        : "Select Outlets"}
    </span>

    {/* SAME DROPDOWN ARROW */}
    <svg
      className="w-4 h-4 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>

  {/* DROPDOWN */}
  {showOutletDropdown && (
    <div
      className="
        absolute top-full left-0 mt-1
        w-full bg-white border rounded-lg
        shadow-lg z-50 max-h-60 overflow-y-auto
      "
    >
      {/* SELECT ALL */}
      <label
        className="
          flex items-center gap-2
          px-3 py-2 border-b
          hover:bg-gray-100 cursor-pointer
        "
      >
        <input
          type="checkbox"
          checked={
            outlets.length > 0 &&
            selectedOltCodes.length ===
              outlets.length
          }
          onChange={(e) => {
            if (e.target.checked) {
             setSelectedOltCodes(
  outlets.map((o) =>
    String(o.oltCode)
  )
);
            } else {
              setSelectedOltCodes([]);
            }
          }}
        />

        Select All
      </label>

      {/* OUTLETS */}
      {outlets.map((outlet) => (
        <label
          key={outlet.oltCode}
          className="
            flex items-center gap-2
            px-3 py-2
            hover:bg-gray-100
            cursor-pointer
          "
        >
          <input
            type="checkbox"
           checked={selectedOltCodes.includes(String(outlet.oltCode))}
        onChange={(e) => {
  const value = String(outlet.oltCode);

  if (e.target.checked) {
    setSelectedOltCodes((prev) => [
      ...prev,
      value,
    ]);
  } else {
    setSelectedOltCodes((prev) =>
      prev.filter((id) => id !== value)
    );
  }
}}
          />

          {outlet.oltName}
        </label>
      ))}
    </div>
  )}
</div>

            <div className="flex flex-col">
              <label className="text-sm mb-1">Category</label>

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
              <label className="text-sm mb-1">Sub Category</label>

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
              <label className="text-sm mb-1">Group</label>

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
            <div className="col-span-1 flex items-end">
  <button
    type="button"
    onClick={() => {
      fetchAddonList(form.itemCode);

      setShowAddonModal(true);
    }}
    className="flex w-full items-center justify-center gap-3 rounded-xl border border-green-200 bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
      +
    </div>

    <div className="flex flex-col items-start">
      <span className="text-sm font-semibold">
        Add Addons
      </span>

      <span className="text-xs text-white/80">
        Select extra items for this product
      </span>
    </div>
  </button>
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
            <div className="flex items-center gap-2 mt-6">
  <input
    type="checkbox"
    name="isDirectKOTandBill"
    checked={form.isDirectKOTandBill}
    onChange={handleChange}
  />
  <label>Direct KOT & Bill</label>
</div>

<div className="flex items-center gap-2 mt-6">
  <input
    type="checkbox"
    name="isDirectPaxandStw"
    checked={form.isDirectPaxandStw}
    onChange={handleChange}
  />
  <label>Direct Pax & Steward</label>
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
                  onClick={handleUpdate}
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
isDirectKOTandBill:false,
isDirectPaxandStw:false,
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
            onDelete={handleDeleteRow}
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
        {showAddonModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="w-[500px] max-w-[95%] rounded-2xl bg-white p-5 shadow-2xl">
      
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Add Addons
        </h2>
        {/* SEARCH */}
<div className="mb-4">
  <div className="relative">
    <input
      type="text"
      placeholder="Search addons..."
      value={addonSearch}
      onChange={(e) =>
        setAddonSearch(e.target.value)
      }
      className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-200"
    />

    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
      🔍
    </div>
  </div>
</div>

        <button
          onClick={() =>
            setShowAddonModal(false)
          }
          className="text-xl font-bold text-red-500"
        >
          ✕
        </button>
      </div>

      {/* MULTI SELECT */}
      <div className="max-h-[400px] overflow-y-auto rounded-xl border p-3">
        <div className="grid grid-cols-2 gap-3">
         {filteredAddons.map(
  (addon: any, index: number) => {
    const checked =
      selectedAddons.some(
        (x) =>
          x.addOnName?.trim() ===
            addon.addOnName?.trim() &&
          Number(x.itemRate) ===
            Number(addon.itemRate)
      );

 
    return (
      <label
        key={index}
        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
          checked
            ? "border-green-500 bg-green-50"
            : "border-gray-200 hover:bg-gray-50"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
        onChange={(e) => {
  const isChecked =
    e.target.checked;

  // selected addons UI
  if (isChecked) {
    setSelectedAddons((prev) => [
      ...prev,
      addon,
    ]);
  } else {
    setSelectedAddons((prev) =>
      prev.filter(
        (x) =>
          !(
            x.addOnName?.trim() ===
              addon.addOnName?.trim() &&
            Number(x.itemRate) ===
              Number(addon.itemRate)
          )
      )
    );
  }

  // track only manipulated items
  setChangedAddons((prev) => {
    const exists = prev.find(
      (x) =>
        x.addOnName?.trim() ===
          addon.addOnName?.trim() &&
        Number(x.itemRate) ===
          Number(addon.itemRate)
    );

    const updatedItem = {
      ...addon,
      isActive: isChecked,
    };

    if (exists) {
      return prev.map((x) =>
        x.addOnName?.trim() ===
          addon.addOnName?.trim() &&
        Number(x.itemRate) ===
          Number(addon.itemRate)
          ? updatedItem
          : x
      );
    }

    return [...prev, updatedItem];
  });
}}
          className="h-4 w-4 accent-green-600"
        />

        <div className="flex flex-1 items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {addon.addOnName}
            </p>

            <p className="text-xs text-gray-500">
              Addon Item
            </p>
          </div>

          <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
            ₹ {addon.itemRate}
          </div>
        </div>
      </label>
    );
  }
)}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-5 flex justify-end gap-3">
        <button
          onClick={() =>
            setShowAddonModal(false)
          }
          className="rounded-lg border px-4 py-2"
        >
          Cancel
        </button>

        <button
   onClick={() => setShowAddonModal(false)}
          className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </>
  );
}
