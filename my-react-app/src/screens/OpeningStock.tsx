import { useEffect, useState } from "react";
import Header from "../components/Header";

import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

import {
  createOpeningStock,
  getInventoryItemStoreList,
  getOpeningStockList,
  updateOpeningStock,
  GetGroupMasterList,
} from "../api/services/products.service";

interface InventoryItem {
  itemCode: number;
  itemName: string;
  storeid: string | number | number[];
  unitCode: number;
  unitName: string;
  itemRate: number;

  // Group ID coming from Inventory Item Store
  grpCode: number;
}

interface Group {
  groupCode: number;
  groupName: string;
}

interface OpeningStock {
  openingStockId: number;
  itemCode: number;
  itemName?: string;
  storeId: number;

  // Backend field
  deptCode: number;

  branch_Code: string;
  stockDate: string;
  openingQty: number;
  unitCode: number;
  unitName: string;
  baseOpeningQty: number;
  baseUnitCode: number;
  baseUnitName: string;
  closingQty: number;
  openingRate: number;
  isActive: boolean;
  createdBy: number;
  modifiedBy: number | null;
  indentOrderQty: number | null;
  indentApprovalQty: number | null;
  issuedQty: number | null;
  issuedReturnQty: number | null;
}

interface OpeningStockForm {
  openingStockId: number;
  itemCode: number;
  itemName: string;
  storeId: number;

  // UI Group
  groupCode: number;
  groupName: string;

  // Backend field
  deptCode: number;

  branch_Code: string;
  stockDate: string;
  openingQty: number;
  unitCode: number;
  unitName: string;
  baseOpeningQty: number;
  baseUnitCode: number;
  baseUnitName: string;
  closingQty: number;
  openingRate: number;
  isActive: boolean;
  createdBy: number;
  modifiedBy: number;
  indentOrderQty: number;
  indentApprovalQty: number;
  issuedQty: number;
  issuedReturnQty: number;
}

const OpeningStock = () => {
  const { appData } = useAppContext();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [openingStocks, setOpeningStocks] = useState<
    OpeningStock[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] =
    useState(false);
  const [editMode, setEditMode] = useState(false);

  const branchCode =
    appData?.user?.branch_code || "";

  const userCode = Number(
    appData?.user?.userCode || 0
  );

  const [form, setForm] =
    useState<OpeningStockForm>({
      openingStockId: 0,

      itemCode: 0,
      itemName: "",

      storeId: 0,

      groupCode: 0,
      groupName: "",

      deptCode: 0,

      branch_Code: "",

      stockDate: new Date()
        .toISOString()
        .split("T")[0],

      openingQty: 0,

      unitCode: 0,
      unitName: "",

      baseOpeningQty: 0,

      baseUnitCode: 0,
      baseUnitName: "",

      closingQty: 0,

      openingRate: 0,

      isActive: true,

      createdBy: 0,
      modifiedBy: 0,

      indentOrderQty: 0,
      indentApprovalQty: 0,
      issuedQty: 0,
      issuedReturnQty: 0,
    });

  // =====================================================
  // FETCH INVENTORY ITEMS
  // =====================================================

  const fetchItems = async () => {
    if (!branchCode) return;

    try {
      setItemsLoading(true);

      const res =
        await getInventoryItemStoreList(
          branchCode
        );

      console.log(
        "Inventory Item Store List:",
        res
      );

      if (res?.success) {
        const formattedItems: InventoryItem[] = (
          res.data || []
        ).map((item: any) => ({
          itemCode:
            Number(item.itemCode) || 0,

          itemName:
            item.itemName || "",

          storeid:
            item.storeid ??
            item.storeId ??
            "",

          unitCode:
            Number(item.unitCode) || 0,

          unitName:
            item.unitName || "",

          itemRate:
            Number(item.itemRate) || 0,

          /*
           * GROUP ID FROM INVENTORY ITEM STORE
           *
           * Your Inventory Item Store uses grpCode.
           */
          grpCode: Number(
            item.grpCode ??
              item.groupCode ??
              item.groupId ??
              item.groupID ??
              0
          ),
        }));

        console.log(
          "Formatted Items:",
          formattedItems
        );

        setItems(formattedItems);
      }
    } catch (error: any) {
      console.error(
        "Error fetching inventory items:",
        error.response?.data ||
          error.message
      );

      toast.error(
        "Failed to load items"
      );
    } finally {
      setItemsLoading(false);
    }
  };

  // =====================================================
  // FETCH GROUP MASTER
  // =====================================================

  const fetchGroups = async () => {
    try {
      const res =
        await GetGroupMasterList(
          branchCode
        );

      console.log(
        res,
        "groups"
      );

      if (res?.success) {
        const formattedGroups: Group[] = (
          res.data || []
        ).map((group: any) => ({
          groupCode: Number(
            group.groupCode ??
              group.groupId ??
              group.id ??
              0
          ),

          groupName:
            group.groupName ??
            group.group_Name ??
            group.name ??
            "",
        }));

        console.log(
          "Formatted Groups:",
          formattedGroups
        );

        setGroups(
          formattedGroups
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to fetch groups"
      );
    }
  };

  // =====================================================
  // FETCH OPENING STOCK
  // =====================================================

  const fetchOpeningStocks =
    async () => {
      if (!branchCode) return;

      try {
        setLoading(true);

        const res =
          await getOpeningStockList(
            branchCode
          );

        console.log(
          "Opening Stock List:",
          res
        );

        const data = res?.data;

        /*
         * API returns one object in data
         */
        if (data) {
          setOpeningStocks([
            data,
          ]);
        } else {
          setOpeningStocks([]);
        }
      } catch (error: any) {
        console.error(
          "Error fetching opening stock:",
          error.response?.data ||
            error.message
        );

        toast.error(
          "Failed to load opening stock"
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!branchCode) return;

    fetchItems();
    fetchGroups();
    fetchOpeningStocks();
  }, [branchCode]);

  // =====================================================
  // GET STORE ID
  // =====================================================

  const getStoreId = (
    storeid: any
  ): number => {
    if (Array.isArray(storeid)) {
      return (
        Number(storeid[0]) || 0
      );
    }

    if (
      typeof storeid === "string"
    ) {
      const stores = storeid
        .split(",")
        .map((value) =>
          Number(value.trim())
        )
        .filter(
          (value) => value > 0
        );

      return stores[0] || 0;
    }

    return Number(storeid) || 0;
  };

  // =====================================================
  // ITEM CHANGE
  // =====================================================

  const handleItemChange = (
    itemCode: number
  ) => {
    const selectedItem =
      items.find(
        (item) =>
          Number(item.itemCode) ===
          Number(itemCode)
      );

    // -----------------------------------------------
    // CLEAR FORM IF NO ITEM
    // -----------------------------------------------

    if (!selectedItem) {
      setForm((prev) => ({
        ...prev,

        itemCode: 0,
        itemName: "",

        storeId: 0,

        groupCode: 0,
        groupName: "",

        deptCode: 0,

        unitCode: 0,
        unitName: "",

        baseUnitCode: 0,
        baseUnitName: "",

        openingRate: 0,
      }));

      return;
    }

    // -----------------------------------------------
    // STORE
    // -----------------------------------------------

    const storeId =
      getStoreId(
        selectedItem.storeid
      );

    // -----------------------------------------------
    // GROUP ID FROM ITEM
    // -----------------------------------------------

    const itemGroupId =
      Number(
        selectedItem.grpCode
      ) || 0;

    // -----------------------------------------------
    // FIND GROUP FROM GROUP MASTER
    // -----------------------------------------------

    const selectedGroup =
      groups.find(
        (group) =>
          Number(
            group.groupCode
          ) === itemGroupId
      );

    console.log(
      "Selected Item:",
      selectedItem
    );

    console.log(
      "Group ID from Item:",
      itemGroupId
    );

    console.log(
      "Matched Group:",
      selectedGroup
    );

    // -----------------------------------------------
    // SET FORM
    // -----------------------------------------------

    setForm((prev) => ({
      ...prev,

      itemCode:
        Number(
          selectedItem.itemCode
        ),

      itemName:
        selectedItem.itemName,

      storeId,

      // UI GROUP
      groupCode:
        selectedGroup?.groupCode ||
        itemGroupId ||
        0,

      groupName:
        selectedGroup?.groupName ||
        "",

      /*
       * Backend Opening Stock API expects deptCode.
       * Group Code is sent through this field.
       */
      deptCode:
        selectedGroup?.groupCode ||
        itemGroupId ||
        0,

      unitCode:
        Number(
          selectedItem.unitCode
        ) || 0,

      unitName:
        selectedItem.unitName || "",

      baseUnitCode:
        Number(
          selectedItem.unitCode
        ) || 0,

      baseUnitName:
        selectedItem.unitName || "",

      openingRate:
        Number(
          selectedItem.itemRate
        ) || 0,
    }));
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        name ===
          "openingQty" ||
        name ===
          "closingQty" ||
        name ===
          "openingRate"
          ? Number(value)
          : value,
    }));
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      openingStockId: 0,

      itemCode: 0,
      itemName: "",

      storeId: 0,

      groupCode: 0,
      groupName: "",

      deptCode: 0,

      branch_Code:
        branchCode,

      stockDate:
        new Date()
          .toISOString()
          .split("T")[0],

      openingQty: 0,

      unitCode: 0,
      unitName: "",

      baseOpeningQty: 0,

      baseUnitCode: 0,
      baseUnitName: "",

      closingQty: 0,

      openingRate: 0,

      isActive: true,

      createdBy:
        userCode,

      modifiedBy:
        userCode,

      indentOrderQty: 0,
      indentApprovalQty: 0,
      issuedQty: 0,
      issuedReturnQty: 0,
    });

    setEditMode(false);
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!form.itemCode) {
      toast.error(
        "Please select an item"
      );
      return false;
    }

    if (!form.storeId) {
      toast.error(
        "Store is not available for selected item"
      );
      return false;
    }

    if (!form.groupCode) {
      toast.error(
        "Group is not available for selected item"
      );
      return false;
    }

    if (
      form.openingQty < 0
    ) {
      toast.error(
        "Opening quantity cannot be negative"
      );
      return false;
    }

    if (
      form.openingRate < 0
    ) {
      toast.error(
        "Opening rate cannot be negative"
      );
      return false;
    }

    return true;
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave =
    async () => {
      if (!validateForm())
        return;

      try {
        setLoading(true);

        const payload = {
          openingStockId:
            editMode
              ? form.openingStockId
              : 0,

          itemCode:
            Number(
              form.itemCode
            ),

          storeId:
            Number(
              form.storeId
            ),

          /*
           * Group Code goes to deptCode
           * because Opening Stock API
           * expects deptCode.
           */
          deptCode:
            Number(
              form.groupCode
            ),

          branch_Code:
            branchCode,

          stockDate:
            new Date(
              form.stockDate
            ).toISOString(),

          openingQty:
            Number(
              form.openingQty
            ),

          unitCode:
            Number(
              form.unitCode
            ),

          unitName:
            form.unitName,

          baseOpeningQty:
            Number(
              form.openingQty
            ),

          baseUnitCode:
            Number(
              form.baseUnitCode
            ),

          baseUnitName:
            form.baseUnitName,

          closingQty:
            Number(
              form.closingQty
            ),

          openingRate:
            Number(
              form.openingRate
            ),

          isActive: true,

          createdBy:
            editMode
              ? form.createdBy
              : userCode,

          modifiedBy:
            userCode,

          indentOrderQty:
            Number(
              form.indentOrderQty
            ),

          indentApprovalQty:
            Number(
              form.indentApprovalQty
            ),

          issuedQty:
            Number(
              form.issuedQty
            ),

          issuedReturnQty:
            Number(
              form.issuedReturnQty
            ),
        };

        console.log(
          "Opening Stock Payload:",
          payload
        );

        if (editMode) {
          await updateOpeningStock(
            payload
          );

          toast.success(
            "Opening stock updated successfully"
          );
        } else {
          await createOpeningStock(
            payload
          );

          toast.success(
            "Opening stock created successfully"
          );
        }

        resetForm();

        await fetchOpeningStocks();
      } catch (error: any) {
        console.error(
          "Error saving opening stock:",
          error.response?.data ||
            error.message
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to save opening stock"
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (
    row: OpeningStock
  ) => {
    const selectedGroup =
      groups.find(
        (group) =>
          Number(
            group.groupCode
          ) ===
          Number(row.deptCode)
      );

    setEditMode(true);

    setForm({
      openingStockId:
        Number(
          row.openingStockId
        ) || 0,

      itemCode:
        Number(
          row.itemCode
        ) || 0,

      itemName:
        row.itemName ||
        items.find(
          (item) =>
            Number(
              item.itemCode
            ) ===
            Number(
              row.itemCode
            )
        )?.itemName ||
        "",

      storeId:
        Number(
          row.storeId
        ) || 0,

      groupCode:
        Number(
          row.deptCode
        ) || 0,

      groupName:
        selectedGroup
          ?.groupName || "",

      deptCode:
        Number(
          row.deptCode
        ) || 0,

      branch_Code:
        row.branch_Code ||
        branchCode,

      stockDate:
        row.stockDate
          ? row.stockDate.split(
              "T"
            )[0]
          : new Date()
              .toISOString()
              .split("T")[0],

      openingQty:
        Number(
          row.openingQty
        ) || 0,

      unitCode:
        Number(
          row.unitCode
        ) || 0,

      unitName:
        row.unitName || "",

      baseOpeningQty:
        Number(
          row.baseOpeningQty
        ) || 0,

      baseUnitCode:
        Number(
          row.baseUnitCode
        ) || 0,

      baseUnitName:
        row.baseUnitName || "",

      closingQty:
        Number(
          row.closingQty
        ) || 0,

      openingRate:
        Number(
          row.openingRate
        ) || 0,

      isActive:
        row.isActive,

      createdBy:
        Number(
          row.createdBy
        ) || 0,

      modifiedBy:
        userCode,

      indentOrderQty:
        Number(
          row.indentOrderQty
        ) || 0,

      indentApprovalQty:
        Number(
          row.indentApprovalQty
        ) || 0,

      issuedQty:
        Number(
          row.issuedQty
        ) || 0,

      issuedReturnQty:
        Number(
          row.issuedReturnQty
        ) || 0,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <Header
        showNeworderButton={false}
      />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6">

        {/* =================================================
            FORM
        ================================================= */}

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-xl font-semibold text-gray-800">
              {editMode
                ? "Update Opening Stock"
                : "Opening Stock"}
            </h2>

            {editMode && (
              <button
                type="button"
                onClick={
                  resetForm
                }
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            )}

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

            {/* ITEM CODE */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Item Code{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                value={
                  form.itemCode ||
                  ""
                }
                onChange={(e) =>
                  handleItemChange(
                    Number(
                      e.target
                        .value
                    )
                  )
                }
                disabled={
                  itemsLoading ||
                  editMode
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">
                  {itemsLoading
                    ? "Loading items..."
                    : "Select Item"}
                </option>

                {items.map(
                  (item) => (
                    <option
                      key={
                        item.itemCode
                      }
                      value={
                        item.itemCode
                      }
                    >
                      {
                        item.itemCode
                      }{" "}
                      -{" "}
                      {
                        item.itemName
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ITEM NAME */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Item Name
              </label>

              <input
                type="text"
                value={
                  form.itemName
                }
                readOnly
                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm"
              />
            </div>

            {/* STORE */}

    

          

            {/* STOCK DATE */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Stock Date
              </label>

              <input
                type="date"
                name="stockDate"
                value={
                  form.stockDate
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* OPENING QTY */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Opening Qty
              </label>

              <input
                type="number"
                name="openingQty"
                min="0"
                value={
                  form.openingQty
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* UNIT */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Unit
              </label>

              <input
                type="text"
                value={
                  form.unitName
                    ? `${form.unitCode} - ${form.unitName}`
                    : ""
                }
                readOnly
                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm"
              />
            </div>

            {/* OPENING RATE */}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Opening Rate
              </label>

              <input
                type="number"
                name="openingRate"
                min="0"
                value={
                  form.openingRate
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

     
          </div>

          {/* BUTTONS */}

          <div className="mt-6 flex justify-end gap-3">

            <button
              type="button"
              onClick={
                resetForm
              }
              className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={
                handleSave
              }
              disabled={
                loading
              }
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editMode
                ? "Update"
                : "Save"}
            </button>

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="rounded-xl bg-white shadow-sm">

          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Opening Stock List
            </h2>
          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200">

              <thead className="bg-gray-50">

                <tr>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    Item Code
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    Item Name
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    Store
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    Group
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    Stock Date
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">
                    Opening Qty
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    Unit
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">
                    Rate
                  </th>

                  

                  <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase text-gray-600">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">

                {loading &&
                openingStocks.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-4 py-10 text-center"
                    >
                      <Loader />
                    </td>
                  </tr>
                ) : openingStocks.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-4 py-10 text-center text-sm text-gray-500"
                    >
                      No opening stock records found
                    </td>
                  </tr>
                ) : (
                  openingStocks.map(
                    (
                      row,
                      index
                    ) => {
                      const itemName =
                        row.itemName ||
                        items.find(
                          (item) =>
                            Number(
                              item.itemCode
                            ) ===
                            Number(
                              row.itemCode
                            )
                        )?.itemName ||
                        "";

                      const group =
                        groups.find(
                          (group) =>
                            Number(
                              group.groupCode
                            ) ===
                            Number(
                              row.deptCode
                            )
                        );

                      return (
                        <tr
                          key={
                            row.openingStockId ||
                            index
                          }
                          className="transition-colors hover:bg-gray-50"
                        >

                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                            {
                              row.itemCode
                            }
                          </td>

                          <td className="px-4 py-3 text-sm text-gray-700">
                            {
                              itemName
                            }
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                            {
                              row.storeId
                            }
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                            {group
                              ? `${group.groupCode} - ${group.groupName}`
                              : row.deptCode ||
                                "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                            {row.stockDate
                              ? new Date(
                                  row.stockDate
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700">
                            {
                              row.openingQty
                            }
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                            {row.unitName
                              ? `${row.unitCode} - ${row.unitName}`
                              : row.unitCode ||
                                "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700">
                            {
                              row.openingRate
                            }
                          </td>


                          <td className="whitespace-nowrap px-4 py-3 text-center">

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  row
                                )
                              }
                              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                              Edit
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
};

export default OpeningStock;