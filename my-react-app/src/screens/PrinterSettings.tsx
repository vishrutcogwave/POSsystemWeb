import { useEffect, useState } from "react";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import {
  deleteCatGroupSettings,
  deleteprintGroupSettings,
  GetCategoryMasterList,
  getOutletList,
  getPrinterSettings,
  GetPrintingMasterList,
  saveOrUpdateCatGroupSettings,
  saveOrUpdatePrinterSettings,
} from "../api/services/products.service";

export default function PrinterSettings() {
  const { appData } = useAppContext();
  const [billingList, setBillingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [printers, setPrinters] = useState<any[]>([]);
  const [cartGroups, setCartGroups] = useState<any[]>([]);
  const [configurations, setConfigurations] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<number | string>("");

  const [form, setForm] = useState({
    printerName: "",
    billType: "",
    printType: "KOT",
    grpCode: "",
  });
const handleDeleteConfiguration = async (grpCode: number) => {
  try {
    setLoading(true);

    const res = await deleteprintGroupSettings(
      grpCode,
      Number(selectedOutlet),
      appData?.user?.branch_code
    );

    if (res?.success) {
      toast.success(res.message || "Deleted successfully");
      fetchPrinterSettings(selectedOutlet);
    } else {
      toast.error(res.message || "Delete failed");
    }
  } catch (error) {
    console.error(error);
    toast.error("Error deleting configuration");
  } finally {
    setLoading(false);
  }
};
  const fetchCategories = async () => {
    try {
      const res = await GetCategoryMasterList(appData?.user?.branch_code);

      if (res?.success) {
        setCategories(res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    }
  };
  const fetchBillingList = async () => {
    try {
      const res = await GetPrintingMasterList(appData?.user?.branch_code);

      if (res?.success) {
        setBillingList(res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load billing list");
    }
  };
  const fetchOutlets = async () => {
    try {
      const res = await getOutletList(appData?.user?.branch_code);

      if (res?.success) {
        setOutlets(res.data || []);

        if (res.data?.length > 0) {
          const defaultOutlet = res.data[0].oltCode;

          setSelectedOutlet(defaultOutlet);

          fetchPrinterSettings(defaultOutlet);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load outlets");
    }
  };
  const fetchPrinterSettings = async (oltCode: number | string) => {
    try {
      setLoading(true);

      const res = await getPrinterSettings(appData?.user?.branch_code, oltCode);

      if (res?.success) {
        setPrinters(res.data?.printers || []);
        setCartGroups(res.data?.cartGroup || []);
        setConfigurations(res.data?.printerConfigurations || []);
      } else {
        toast.error(res?.message || "Failed to fetch settings");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching printer settings");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (appData?.user?.branch_code) {
      fetchOutlets();
      fetchBillingList();
    }
  }, [appData?.user?.branch_code]);

  const handleSave = async () => {
    try {
      if (!form.printerName) {
        toast.error("Please select printer");
        return;
      }

      if (!form.billType) {
        toast.error("Please select billing");
        return;
      }

      if (!form.grpCode) {
        toast.error("Please select category");
        return;
      }

      const payload = {
        printerName: form.printerName,
        billType: form.billType,
        branch_Code: appData?.user?.branch_code,
        oltCode: String(selectedOutlet),
        printType: form.printType,
        grpCode: form.grpCode,
      };

      setLoading(true);

      const res = await saveOrUpdatePrinterSettings(payload);

      if (res?.success) {
        toast.success(res?.message || "Printer settings saved successfully");

        fetchPrinterSettings(selectedOutlet);
      } else {
        toast.error(res?.message || "Failed to save");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving printer settings");
    } finally {
      setLoading(false);
    }
  };
  const handleCategoryToggle = (catCode: number) => {
    setSelectedCategories((prev) =>
      prev.includes(catCode)
        ? prev.filter((id) => id !== catCode)
        : [...prev, catCode],
    );
  };

  const handleSaveCartGroup = async () => {
    try {
      const selectedNames = categories
        .filter((c) => selectedCategories.includes(c.catCode))
        .map((c) => c.catCode)
        .join(",");

      if (!selectedNames) {
        toast.error("Please select at least one category");
        return;
      }

      setLoading(true);

      const payload = {
        rno: 0,
        catGrp: selectedNames,
        grp: 0,
        branch_code: appData?.user?.branch_code,
        oltCode: Number(selectedOutlet),
      };

      const res = await saveOrUpdateCatGroupSettings(payload);

      if (res?.success) {
        toast.success(res?.message || "Cart Group saved successfully");

        fetchPrinterSettings(selectedOutlet);

        setShowCategoryPopup(false);
        setSelectedCategories([]);
      } else {
        toast.error(res?.message || "Failed to save");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving cart group");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteCartGroup = async (grpCode: number) => {
    try {
      const res = await deleteCatGroupSettings(
        grpCode,
        Number(selectedOutlet),
        appData?.user?.branch_code,
      );

      if (res?.success) {
        toast.success(res.message || "Deleted successfully");

        fetchPrinterSettings(selectedOutlet);
      } else {
        toast.error(res.message || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting cart group");
    }
  };
  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
        {loading && <Loader />}
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium mb-2">Outlet</label>

            <select
              value={selectedOutlet}
              onChange={(e) => {
                const outletCode = Number(e.target.value);

                setSelectedOutlet(outletCode);

                fetchPrinterSettings(outletCode);
              }}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {outlets.map((outlet) => (
                <option key={outlet.oltCode} value={outlet.oltCode}>
                  {outlet.oltName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Printer Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Printer */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Select Printer
              </label>

              <select
                value={form.printerName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    printerName: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Printer</option>

                {printers.map((printer, index) => (
                  <option key={index} value={printer.printerName}>
                    {printer.printerName}
                  </option>
                ))}
              </select>
            </div>

            {/* Billing */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Select Billing
              </label>

              <select
                value={form.billType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    billType: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Billing</option>

                {billingList.map((item) => (
                  <option key={item.depCode} value={item.depCode}>
                    {item.depName}
                  </option>
                ))}
              </select>
            </div>

            {/* Print Type */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Print Type
              </label>

              <select
                value={form.printType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    printType: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="KOT">KOT</option>
                <option value="BILL">BILL</option>
              </select>
            </div>

            {/* Cat Type */}

            <div>
              <label className="block text-sm font-medium mb-1">Cat Type</label>

              <select
                value={form.grpCode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    grpCode: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Category</option>

                {cartGroups.map((group) => (
                  <option key={group.rno} value={group.grp}>
                    {group.grp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>

        {/* CART GROUPS */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Cart Groups</h2>

            <button
              onClick={() => {
                fetchCategories();
                setSelectedCategories([]);
                setShowCategoryPopup(true);
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              + Add Cart Group
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Group</th>
                  <th className="border p-2">Categories</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {cartGroups.map((group) => (
                  <tr key={group.rno}>
                    <td className="border p-2 text-center">{group.grp}</td>

                    <td className="border p-2">{group.catGrp}</td>

                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleDeleteCartGroup(group.grp)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRINTER CONFIGURATION */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Printer Configuration</h2>

          <div className="overflow-x-auto">
            <table className="w-full border">
             <thead>
  <tr className="bg-gray-100">
    <th className="border p-2">Printer Name</th>
    <th className="border p-2">Print Type</th>
    <th className="border p-2">Bill Type</th>
    <th className="border p-2">Group Code</th>
    <th className="border p-2">Action</th>
  </tr>
</thead>

           <tbody>
  {configurations.map((config, index) => (
    <tr key={index}>
      <td className="border p-2">{config.printerName}</td>

      <td className="border p-2 text-center">
        {config.printType}
      </td>

      <td className="border p-2 text-center">
        {config.billType}
      </td>

      <td className="border p-2 text-center">
        {config.grpCode}
      </td>

      <td className="border p-2 text-center">
        <button
          onClick={() => handleDeleteConfiguration(config.grpCode)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>
        {showCategoryPopup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-[500px] max-w-[95vw] p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Select Categories</h3>

                <button
                  onClick={() => setShowCategoryPopup(false)}
                  className="text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[350px] overflow-y-auto border rounded-lg p-3">
                {categories.map((cat) => (
                  <label
                    key={cat.catCode}
                    className="flex items-center gap-3 py-2 border-b"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.catCode)}
                      onChange={() => handleCategoryToggle(cat.catCode)}
                    />

                    <span>{cat.catName}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowCategoryPopup(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveCartGroup}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
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
