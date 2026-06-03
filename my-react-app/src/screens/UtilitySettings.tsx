import  {
  useEffect,
  useState,
} from "react";

import Header from "../components/Header";
import Loader from "../components/Loader";

import toast from "react-hot-toast";

import { useAppContext } from "../context/AppContext";

import {
  getHappyHoursSettings,
  getKOTTimerSettings,
  saveOrUpdateHappyHoursSettings,
  saveOrUpdateKOTTimerSettings,
} from "../api/services/products.service";

export default function UtilitySettings() {
  const { appData } = useAppContext();

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState({
    inOrExOfTax: false,
    happyHours: false,
    hhFrom: "",
    hhTo: "",
  });

  const [kotForm, setKotForm] = useState({
  timerRequired: false,
  timerMinute: 0,
});

  /* =========================
        FETCH SETTINGS
  ========================= */

  const fetchHappyHoursSettings =
    async () => {
      try {
        setLoading(true);

        const res =
          await getHappyHoursSettings(
            appData?.user?.branch_code
          );

        if (res?.success) {
          setForm({
            inOrExOfTax:
              res?.data?.inOrExOfTax ||
              false,

            happyHours:
              res?.data?.happyHours ||
              false,

            hhFrom:
              res?.data?.hhFrom || "",

            hhTo:
              res?.data?.hhTo || "",
          });
        }
      } catch (err: any) {
  console.error(err);

  toast.error(
    err?.response?.data?.message ||
    err?.message ||
    "Failed to load settings ❌"
  );
}finally {
        setLoading(false);
      }
    };
    const fetchKOTTimerSettings = async () => {
  try {
    const res = await getKOTTimerSettings(
      appData?.user?.branch_code
    );

    if (res?.success) {
      setKotForm({
        timerRequired:
          res?.data?.timerRequired || false,

        timerMinute:
          res?.data?.timerMinute || 0,
      });
    }
  } catch (err: any) {
    console.error(err);

    toast.error(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to load KOT settings ❌"
    );
  }
};

  useEffect(() => {
    fetchHappyHoursSettings();
    fetchKOTTimerSettings();
  }, []);

  /* =========================
        SAVE
  ========================= */



  const handleHappyHouirsSave = async () => {
    try {
      setLoading(true);

      const payload = {
        inOrExOfTax:
          form.inOrExOfTax,

        happyHours:
          form.happyHours,

       hhFrom: `${form.hhFrom}`,

hhTo: `${form.hhTo}`,

        branchCode:
          appData?.user?.branch_code,
      };

      const res =
        await saveOrUpdateHappyHoursSettings(
          payload
        );

      if (res?.success) {
        toast.success(
          "Settings Saved Successfully ✅"
        );

        fetchHappyHoursSettings();
      } else {
        toast.error(
          res?.message ||
            "Failed to save ❌"
        );
      }
    } catch (err: any) {
  console.error(err);

  toast.error(
    err?.response?.data?.message ||
    err?.message ||
    "Error saving settings ❌"
  );
}finally {
      setLoading(false);
    }
  };
const handleKOTSave = async () => {
  try {
    setLoading(true);

    const payload = {
      timerRequired:
        kotForm.timerRequired,

      timerMinute:
        Number(kotForm.timerMinute),

      branchCode:
        appData?.user?.branch_code,
    };

    const res =
      await saveOrUpdateKOTTimerSettings(
        payload
      );

    if (res?.success) {
      toast.success(
        "KOT Timer Settings Saved Successfully ✅"
      );

      fetchKOTTimerSettings();
    } else {
      toast.error(
        res?.message ||
          "Failed to save KOT settings ❌"
      );
    }
  } catch (err: any) {
    console.error(err);

    toast.error(
      err?.response?.data?.message ||
        err?.message ||
        "Error saving KOT settings ❌"
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto bg-gray-100 p-3 sm:p-4 md:p-6">
        {loading && <Loader />}

        {/* PAGE TITLE */}

        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-800">
            Utility Settings
          </h1>
        </div>

        {/* SECTION GRID */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

          {/* ================= HAPPY HOURS ================= */}

          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">

            {/* HEADER */}

            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800 text-base">
                Happy Hours Settings
              </h2>
            </div>

            {/* BODY */}

            <div className="p-4 space-y-5 min-h-[220px]">

              {/* IN OR EX OF TAX */}

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={
                    form.inOrExOfTax
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      inOrExOfTax:
                        e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />

                In Or Ex Of Tax
              </label>

              {/* HAPPY HOURS */}

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={
                    form.happyHours
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      happyHours:
                        e.target.checked,
                    })
                  }
                  className="w-4 h-4 "
                />

                Happy Hours
              </label>

              {/* FROM TIME */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HH From
                </label>

                <input
                  type="time"
                  value={form.hhFrom}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hhFrom:
                        e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* TO TIME */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HH To
                </label>

                <input
                  type="time"
                  value={form.hhTo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hhTo:
                        e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* SAVE BUTTON */}

              <button
                onClick={handleHappyHouirsSave}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition"
              >
                Save
              </button>
            </div>
          </div>

          {/* EMPTY DIV 2 */}

         {/* ================= KOT TIMER SETTINGS ================= */}

<div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
  {/* HEADER */}

  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
    <h2 className="font-semibold text-gray-800 text-base">
      KOT Timer Settings
    </h2>
  </div>

  {/* BODY */}

  <div className="p-4 space-y-5 min-h-[220px]">
    {/* TIMER REQUIRED */}

    <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
      <input
        type="checkbox"
        checked={kotForm.timerRequired}
        onChange={(e) =>
          setKotForm({
            ...kotForm,
            timerRequired:
              e.target.checked,
          })
        }
        className="w-4 h-4"
      />

      Timer Required
    </label>

    {/* TIMER MINUTE */}

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Timer Minute
      </label>

      <input
        type="number"
        min={0}
        value={kotForm.timerMinute}
        onChange={(e) =>
          setKotForm({
            ...kotForm,
            timerMinute:
              Number(e.target.value),
          })
        }
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
    </div>

    {/* SAVE BUTTON */}

    <button
      onClick={handleKOTSave}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition"
    >
      Save
    </button>
  </div>
</div>

          {/* EMPTY DIV 3 */}

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 min-h-[320px]" />

          {/* EMPTY DIV 4 */}

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 min-h-[320px]" />

          {/* EMPTY DIV 5 */}

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 min-h-[320px]" />

          {/* EMPTY DIV 6 */}

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 min-h-[320px]" />
        </div>
      </div>
    </>
  );
}