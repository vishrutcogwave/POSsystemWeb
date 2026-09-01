import { useEffect, useState } from "react";
import { CalendarDays, KeyRound, Lock } from "lucide-react";
import toast from "react-hot-toast";


// import { useAppContext } from "../context/AppContext"; // update path
import { getProductLicenceKey, saveProductLicenceKey } from "../api/services/products.service";
import Loader from "./Loader";

const License = () => {
  // const { appData } = useAppContext();

  const branchCode = localStorage.getItem("branch") || "";

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    serialKey: "",
    productKey: "",
    trDate: "",
    validDate: "",
    clientName: "",
  });

  useEffect(() => {
    fetchLicence();
  }, []);

const fetchLicence = async () => {
  setLoading(true);
  

  try {
    const res = await getProductLicenceKey(branchCode);

    console.log("Licence Response:", res);

    // Check API success
    if (!res || !res.success) {
      toast.error(res?.message || "Failed to fetch licence");
      return;
    }

    // Check if data exists
    if (!res.data) {
      toast.error(res.message || "No licence found");
      return;
    }

    const licence = res.data;
const serialkey =localStorage.getItem("serialKey")
    setForm({
      serialKey: serialkey?? "",
      productKey:"",
      trDate: "",
      validDate:  "",
      clientName: licence.clientName ?? "",
    });

    // Show success only after data is loaded
    // toast.success(res.message || "Licence loaded successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to load licence");
  } finally {
    setLoading(false);
  }
};

  const handleRegister = async () => {
    if (!form.productKey.trim()) {
      toast.error("Please enter Product Key");
      return;
    }

    setLoading(true);

    try {
   const res = await saveProductLicenceKey({
  serialKey: form.serialKey,
  productKey: form.productKey,
  trDate: new Date(form.trDate).toISOString(),
  validDate: new Date(form.validDate).toISOString(),
  clientName: form.clientName,
  branchCode,
});

if (res?.success) {
  toast.success(res.message || "Software Registered Successfully");
  fetchLicence(); // Refresh latest data
} else {
  toast.error(res?.message || "Registration Failed");
}

    } catch (err: any) {
      toast.error(err?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
    <div className="flex items-center justify-center py-4 px-3">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">

        <div className="bg-[#0576B2] px-4 py-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Lock size={16} className="text-white" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              Software Registration
            </h2>
            <p className="text-[11px] text-blue-100">
              Register your software
            </p>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-[#0576B2]/10 flex items-center justify-center">
              <Lock size={28} className="text-[#0576B2]" />
            </div>
          </div>

          <div className="space-y-3">

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                <KeyRound size={14} />
                Serial Key
              </label>

           <input
  value={form.serialKey}
  onChange={(e) =>
    setForm({ ...form, serialKey: e.target.value })
  }
  placeholder="Enter Serial Key"
  className="w-full h-9 rounded-md border px-3 text-sm focus:border-[#0576B2] focus:ring-1 focus:ring-[#0576B2]/30 outline-none"
/>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                <KeyRound size={14} />
                Product Key
              </label>

              <input
                value={form.productKey}
                onChange={(e) =>
                  setForm({ ...form, productKey: e.target.value })
                }
                placeholder="Enter Product Key"
                className="w-full h-9 rounded-md border px-3 text-sm focus:border-[#0576B2] focus:ring-1 focus:ring-[#0576B2]/30 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                  <CalendarDays size={14} />
                  Start Date
                </label>

                <input
                  type="date"
                  value={form.trDate}
                  onChange={(e) =>
                    setForm({ ...form, trDate: e.target.value })
                  }
                  className="w-full h-9 rounded-md border px-2 text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                  <CalendarDays size={14} />
                  Valid Till
                </label>

                <input
                  type="date"
                  value={form.validDate}
                  onChange={(e) =>
                    setForm({ ...form, validDate: e.target.value })
                  }
                  className="w-full h-9 rounded-md border px-2 text-sm"
                />
              </div>

            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleRegister}
                disabled={loading}
                className="bg-[#0576B2] hover:bg-[#046294] text-white h-9 px-5 rounded-md flex items-center gap-2 text-sm transition disabled:opacity-50"
              >
                <Lock size={14} />
                {loading ? "Registering..." : "Register"}
              </button>
            </div>

          </div>
        </div>

        <div className="bg-gray-50 border-t py-2 text-center">
          <p className="text-[11px] text-gray-500">
            © 2026 Cogwave Software Technologies Pvt. Ltd.
          </p>
        </div>

      </div>
    </div></>
  );
};

export default License;