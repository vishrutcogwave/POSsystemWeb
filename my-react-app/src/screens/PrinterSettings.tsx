import { useEffect, useState } from "react";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import {
  getOutletList,
  getPrinterSettings,
  GetPrintingMasterList,
  saveOrUpdatePrinterSettings,
} from "../api/services/products.service";

export default function PrinterSettings() {
  const { appData } = useAppContext();
  const [billingList, setBillingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
          <h2 className="text-lg font-semibold mb-4">Cart Groups</h2>

          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Group</th>
                  <th className="border p-2">Categories</th>
                </tr>
              </thead>

              <tbody>
                {cartGroups.map((group) => (
                  <tr key={group.rno}>
                    <td className="border p-2 text-center">{group.grp}</td>

                    <td className="border p-2">{group.catGrp}</td>
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

                    <td className="border p-2 text-center">{config.grpCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
