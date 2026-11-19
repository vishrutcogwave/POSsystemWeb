import { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  getEstimationList,
  getItemGroupList,
  saveEstimation,
  searchPOSItemsDropdown,
  searchInventryItems,
} from "../api/services/products.service";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { Trash2 } from "lucide-react";

type ItemGroup = {
  grpCode: number;
  grpName: string;
  branchCode: string;
  dep: string;
};

type InventoryItem = {
  itemCode: number;
  itemName: string;
  qty?: number | string;
  catCode: number;
  subCatCode: number;
  storeid: string;
  grpCode: string;
  unitCode: number;
  unitName: string;
  purchaseRate: string;
  noofUnits?: number;
  itemRate: number;
  branch_Code: string;
};

type POSItem = {
  itemCode: number;
  itemName: string;
};

export default function Estimation() {
  const { appData } = useAppContext();
  const [groups, setGroups] = useState<ItemGroup[]>([]);
  const [posItems, setPosItems] = useState<POSItem[]>([]);
  const [selectedPOSItem, setSelectedPOSItem] = useState("");
  const [posItemsLoading, setPOSItemsLoading] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [showItemResults, setShowItemResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [estimationLoading, setEstimationLoading] = useState(false);

  useEffect(() => {
    const branchCode = appData?.user?.branch_code;
    if (!branchCode) return;

    const fetchGroups = async () => {
      setLoading(true);
      try {
        const response = await getItemGroupList(branchCode);
        const groupList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];
        setGroups(groupList);
      } catch (error) {
        console.error("Error fetching item groups:", error);
        toast.error("Error fetching item groups");
      } finally {
        setLoading(false);
      }
    };

    void fetchGroups();
  }, [appData?.user?.branch_code]);

  useEffect(() => {
    const branchCode = appData?.user?.branch_code;
    if (!branchCode || !selectedGroup) {
      setPosItems([]);
      setSelectedPOSItem("");
      return;
    }

    let isCurrentRequest = true;
    setPOSItemsLoading(true);
    setPosItems([]);
    setSelectedPOSItem("");

    const fetchPOSItems = async () => {
      try {
        const response = await searchPOSItemsDropdown(
          branchCode,
          Number(selectedGroup),
        );
        const itemList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];
        if (isCurrentRequest) setPosItems(itemList);
      } catch (error) {
        console.error("Error fetching POS items:", error);
        if (isCurrentRequest) toast.error("Error fetching group items");
      } finally {
        if (isCurrentRequest) setPOSItemsLoading(false);
      }
    };

    void fetchPOSItems();
    return () => {
      isCurrentRequest = false;
    };
  }, [appData?.user?.branch_code, selectedGroup]);

  useEffect(() => {
    const branchCode = localStorage.getItem("branch") || "";
    if (!selectedPOSItem || !branchCode) {
      setSelectedItems([]);
      return;
    }

    let isCurrentRequest = true;
    setEstimationLoading(true);
    setSelectedItems([]);

    const fetchEstimation = async () => {
      try {
        const response = await getEstimationList(
          Number(selectedPOSItem),
          branchCode,
        );
        const result = response?.data ?? response;
        const detailRows = Array.isArray(result?.estDetails)
          ? result.estDetails
          : [];

        if (isCurrentRequest) {
          const getField = (row: Record<string, unknown>, field: string) => {
            const matchingKey = Object.keys(row).find(
              (key) => key.toLowerCase() === field.toLowerCase(),
            );
            return matchingKey ? row[matchingKey] : undefined;
          };
          const loadedItems: InventoryItem[] = detailRows.map((detail: any) => {
            const rawQty =
              getField(detail, "qty") ?? getField(detail, "quantity") ?? 0;
            const parsedQty = Number(rawQty);
            const parsedRate = Number(getField(detail, "itemRate")) || 0;
            return {
              itemCode: Number(getField(detail, "inventoryItemCode")),
              itemName: String(getField(detail, "itemName") ?? ""),
              qty: Number.isFinite(parsedQty) ? parsedQty : 0,
              catCode: 0,
              subCatCode: 0,
              storeid: "",
              grpCode: "",
              unitCode: Number(getField(detail, "unitCode")),
              unitName: String(getField(detail, "unitName") ?? ""),
              purchaseRate: "0",
              itemRate: parsedRate,
              branch_Code: String(
                getField(detail, "branch_Code") ?? branchCode,
              ),
            };
          });
          setSelectedItems(loadedItems);
        }
      } catch (error) {
        console.error("Error fetching estimation details:", error);
        if (isCurrentRequest) toast.error("Error fetching estimation details");
      } finally {
        if (isCurrentRequest) setEstimationLoading(false);
      }
    };

    void fetchEstimation();
    return () => {
      isCurrentRequest = false;
    };
  }, [selectedPOSItem]);

  useEffect(() => {
    const branchCode = appData?.user?.branch_code;
    const searchTerm = itemSearch.trim();
    if (!branchCode || !searchTerm) {
      setItems([]);
      setItemsLoading(false);
      return;
    }

    setItems([]);
    let isCurrentRequest = true;
    const fetchItems = async () => {
      setItemsLoading(true);
      try {
        const response = await searchInventryItems(branchCode, searchTerm);
        const itemList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];
        if (isCurrentRequest) setItems(itemList);
      } catch (error) {
        console.error("Error fetching estimation items:", error);
        if (isCurrentRequest) toast.error("Error fetching items");
      } finally {
        if (isCurrentRequest) setItemsLoading(false);
      }
    };

    const timeout = window.setTimeout(() => void fetchItems(), 300);
    return () => {
      isCurrentRequest = false;
      window.clearTimeout(timeout);
    };
  }, [appData?.user?.branch_code, itemSearch]);

  const toggleItem = (item: InventoryItem) => {
    setSelectedItems((current) =>
      current.some((selected) => selected.itemCode === item.itemCode)
        ? current.filter((selected) => selected.itemCode !== item.itemCode)
        : [...current, { ...item, qty: item.qty ?? 0 }],
    );
  };

  const allVisibleItemsSelected =
    items.length > 0 &&
    items.every((item) =>
      selectedItems.some((selected) => selected.itemCode === item.itemCode),
    );

  const toggleAllVisibleItems = () => {
    if (allVisibleItemsSelected) {
      const visibleCodes = new Set(items.map((item) => item.itemCode));
      setSelectedItems((current) =>
        current.filter((item) => !visibleCodes.has(item.itemCode)),
      );
      return;
    }

    setSelectedItems((current) => {
      const selectedCodes = new Set(current.map((item) => item.itemCode));
      return [
        ...current,
        ...items
          .filter((item) => !selectedCodes.has(item.itemCode))
          .map((item) => ({ ...item, qty: item.qty ?? 0 })),
      ];
    });
  };

  const confirmInventoryItemSelection = () => {
    setShowItemResults(false);
    setItemSearch("");
  };

  const updateQuantity = (
    itemCode: number,
    quantity: string,
  ) => {
    const parsedQuantity = quantity === "" ? "" : Number(quantity);
    const limitedQuantity =
      parsedQuantity !== "" && Number.isFinite(parsedQuantity)
        ? parsedQuantity < 0
          ? 0
          : quantity
        : parsedQuantity;
    setSelectedItems((current) =>
      current.map((item) =>
        item.itemCode === itemCode ? { ...item, qty: limitedQuantity } : item,
      ),
    );
  };

  const removeSelectedItem = (itemCode: number) => {
    setSelectedItems((current) =>
      current.filter((item) => item.itemCode !== itemCode),
    );
  };

  const handleSaveEstimation = async () => {
    const branchCode = localStorage.getItem("branch") || "";
    if (!selectedPOSItem) {
      toast.error("Select an item from the group dropdown");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Select at least one inventory item");
      return;
    }
    if (
      selectedItems.some(
        (item) =>
          item.qty === undefined ||
          item.qty === null ||
          (typeof item.qty === "string" && item.qty.trim() === ""),
      )
    ) {
      toast.error("Please enter quantity for all selected items");
      return;
    }

    const rows = selectedItems.map((item) => {
      const qty = Number(item.qty ?? 0);
      const rate = Number(item.itemRate) || 0;
      return {
        proCode: item.itemCode,
        rawItemName: item.itemName,
        qty,
        rate,
        value: qty * rate,
      };
    });

    setSaving(true);
    try {
      const response = await saveEstimation({
        itemCode: Number(selectedPOSItem),
        branchCode,
        rows,
      });
      toast.success(response?.message || "Estimation saved successfully");
      setSelectedGroup("");
      setPosItems([]);
      setSelectedPOSItem("");
      setSelectedItems([]);
      setItemSearch("");
      setItems([]);
      setShowItemResults(false);
    } catch (error: any) {
      console.error("Error saving estimation:", error);
      toast.error(
        error?.response?.data?.message || "Error saving estimation",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header showNeworderButton={false} />
      <div className="h-[calc(100vh-100px)] overflow-y-auto bg-gray-50 p-4 md:p-6">
        {(loading || estimationLoading) && <Loader />}
        <div className="mt-4 rounded-xl bg-white p-4 shadow">
          <h2 className="mb-3 text-lg font-semibold">Estimation</h2>
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex flex-col">
              <label
                htmlFor="estimation-item-group"
                className="mb-1 text-sm text-gray-600"
              >
                Select Item Group
              </label>
              <select
                id="estimation-item-group"
                value={selectedGroup}
                onChange={(event) => setSelectedGroup(event.target.value)}
                className="min-w-[250px] rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Group</option>
                {groups.map((group) => (
                  <option key={group.grpCode} value={group.grpCode}>
                    {group.grpName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="estimation-group-item" className="mb-1 text-sm text-gray-600">
                Select Item
              </label>
              <select
                id="estimation-group-item"
                value={selectedPOSItem}
                onChange={(event) => setSelectedPOSItem(event.target.value)}
                disabled={!selectedGroup || posItemsLoading}
                className="min-w-[250px] rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">
                  {posItemsLoading ? "Loading items..." : "Select Item"}
                </option>
                {posItems.map((item) => (
                  <option key={item.itemCode} value={item.itemCode}>
                    {item.itemName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <section className="mt-6 border-t pt-4">
            <h3 className="mb-3 text-base font-semibold">Item Name</h3>
            <div className="flex flex-col">
              <label htmlFor="estimation-item-search" className="mb-1 text-sm text-gray-600">
                Search Inventory Items
              </label>
              <input
                id="estimation-item-search"
                type="search"
                value={itemSearch}
                onChange={(event) => {
                  setItemSearch(event.target.value);
                  setShowItemResults(true);
                }}
                onFocus={() => setShowItemResults(true)}
                placeholder="Type item name to search..."
                className="min-w-[250px] rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoComplete="off"
              />
              {showItemResults && itemSearch.trim() && (
                <div className="relative">
                  <div className="absolute left-0 top-1 z-20 max-h-64 w-full min-w-[300px] overflow-y-auto rounded-lg border bg-white shadow-lg">
                    {itemsLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Searching items...
                      </div>
                    ) : items.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No items found
                      </div>
                    ) : (
                      <>
                        <label className="flex cursor-pointer items-center gap-2 border-b bg-gray-50 px-3 py-2 text-sm font-medium">
                          <input
                            type="checkbox"
                            checked={allVisibleItemsSelected}
                            onChange={toggleAllVisibleItems}
                          />
                          Select All ({items.length})
                        </label>
                        {items.map((item) => (
                          <label
                            key={item.itemCode}
                            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50"
                          >
                            <input
                              type="checkbox"
                              checked={selectedItems.some(
                                (selected) => selected.itemCode === item.itemCode,
                              )}
                              onChange={() => toggleItem(item)}
                            />
                            <span>{item.itemName}</span>
                          </label>
                        ))}
                        <div className="sticky bottom-0 border-t bg-white p-2 text-right">
                          <button
                            type="button"
                            onClick={confirmInventoryItemSelection}
                            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            OK
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
          <section className="mt-6 border-t pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">Selected Items</h3>
              <button
                type="button"
                onClick={handleSaveEstimation}
                disabled={saving}
                className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Estimation"}
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[700px] border-collapse text-sm">
                <thead className="bg-gray-100 text-left text-gray-700">
                  <tr>
                    <th className="border-b px-3 py-2">Item Name</th>
                    <th className="border-b px-3 py-2">Qty</th>
                    <th className="border-b px-3 py-2">Rate</th>
                    <th className="border-b px-3 py-2">Unit Name</th>
                    <th className="border-b px-3 py-2">Amount</th>
                    <th className="border-b px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-5 text-center text-gray-500">
                        No items selected
                      </td>
                    </tr>
                  ) : (
                    selectedItems.map((item) => {
                      const quantity = Number(item.qty ?? 0);
                      const rate = Number(item.itemRate) || 0;
                      return (
                        <tr key={item.itemCode} className="odd:bg-white even:bg-gray-50">
                          <td className="border-b px-3 py-2">{item.itemName}</td>
                          <td className="border-b px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.qty ?? ""}
                              onChange={(event) =>
                                updateQuantity(
                                  item.itemCode,
                                  event.target.value,
                                )
                              }
                              aria-label={`Quantity for ${item.itemName}`}
                              className="w-24 rounded border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                          </td>
                          <td className="border-b px-3 py-2">{rate.toFixed(2)}</td>
                          <td className="border-b px-3 py-2">{item.unitName}</td>
                          <td className="border-b px-3 py-2">
                            {quantity > 0 ? (quantity * rate).toFixed(2) : ""}
                          </td>
                          <td className="border-b px-3 py-2">
                            <button
                              type="button"
                              onClick={() => removeSelectedItem(item.itemCode)}
                              aria-label={`Delete ${item.itemName}`}
                              title="Delete item"
                              className="rounded p-1 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
