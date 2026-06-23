import { useEffect, useState } from "react";

import Header from "../components/Header";
import Loader from "../components/Loader";

import toast from "react-hot-toast";

import { useAppContext } from "../context/AppContext";

import {
  getBillConfiguration,
  getBillGenerationSettings,
  getDiscountModeSettings,
  getFinancialSettings,
  getHappyHoursSettings,
  getKotConfiguration,
  getKOTTimerSettings,
  getOutletList,
  getSMSSenderSettings,
  getTaxModeSettings,
  saveBillConfiguration,
  saveBillGenerationSettings,
  saveKotConfiguration,
  saveOrUpdateFinancialSettings,
  saveOrUpdateHappyHoursSettings,
  saveOrUpdateKOTTimerSettings,
  saveOrUpdateSMSSenderSettings,
  updateDiscountModeSettings,
  updateTaxModeSettings,
} from "../api/services/products.service";

export default function UtilitySettings() {
  const { appData } = useAppContext();

const [happyHoursLoading, setHappyHoursLoading] = useState(false);
const [billLoading, setBillLoading] = useState(false);
const [kotLoading, setKotLoading] = useState(false);
const [outlets, setOutlets] = useState<any[]>([]);
const [selectedOutlet, setSelectedOutlet] = useState<number>(0);
const [kotType, setKotType] = useState("KOT");
const [kotConfigs, setKotConfigs] = useState<any[]>([]);
const [reqBill, setReqBill] = useState<number>(1);
const [billConfigLoading, setBillConfigLoading] = useState(false);
const fetchOutlets = async () => {
  try {
    const res = await getOutletList(appData?.user?.branch_code);

    if (res?.success) {
      setOutlets(res.data || []);
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchBillConfiguration = async () => {
  try {
    const res = await getBillConfiguration(
      appData?.user?.branch_code
    );

    if (res?.success && res?.data?.length > 0) {
      setReqBill(res.data[0].reqBill);
    }
  } catch (err) {
    console.error(err);
  }
};
const fetchKotConfiguration = async () => {
  try {
    const res = await getKotConfiguration(appData?.user?.branch_code);

    if (res?.success) {
      setKotConfigs(res.data || []);
    }
  } catch (err) {
    console.error(err);
  }
};
const [financialLoading, setFinancialLoading] = useState(false);

const [taxLoading, setTaxLoading] = useState(false);

const [discountLoading, setDiscountLoading] = useState(false);

const [smsLoading, setSmsLoading] = useState(false);

  const [form, setForm] = useState({
    inOrExOfTax: false,
    happyHours: false,
    hhFrom: "",
    hhTo: "",
  });

const [billMode, setBillMode] = useState<
  "Continuous" | "OutletWise" | "DayWise" | ""
>("");
const [dayWiseType, setDayWiseType] = useState("Continuous");
  const [kotForm, setKotForm] = useState({
    timerRequired: false,
    timerMinute: 0,
  });
  const [financialForm, setFinancialForm] = useState({
    finCode: "",
    finFromDate: "",
    finToDate: "",
    finEndYear: 0,
    finalClose: false,
    currentStatus: false,
  });

  const [taxModeForm, setTaxModeForm] = useState({
    groupedTax: false,
    onbillTax: false,
  });

  const [discountModeForm, setDiscountModeForm] = useState({
    onbill: false,
    groupwise: false,
  });

  const [smsForm, setSmsForm] = useState({
    smsId: "",
    smsPwd: "",
    smsSenderId: "",
    smsProvider: "",
    mobileNo: "",
    backUpLocation: "",
    dbName: "",
    isKotPrinter: false,
    isHomeDelivery: false,
    isCustomerEntry: false,
    emailID: "",
    password: "",
    isSMS: false,
    isMail: false,
    isPriceShow: false,
    isDescriptionShow: false,
    dayCloseGraceHour: 0,
  });
  const handleBillConfigurationSave = async () => {
  try {
    setBillConfigLoading(true);

    const res = await saveBillConfiguration({
      reqBill,
      branchCode: appData?.user?.branch_code,
    });

    if (res?.success) {
      toast.success("Bill Configuration Saved ✅");
      fetchBillConfiguration();
    }
  } catch (err: any) {
    toast.error(
      err?.response?.data?.message ||
      err?.message ||
      "Failed to save Bill Configuration"
    );
  } finally {
    setBillConfigLoading(false);
  }
};

const fetchBillGenerationSettings = async () => {
  try {
    setBillLoading(true);

    const res = await getBillGenerationSettings(
      appData?.user?.branch_code
    );

    if (res?.success && res?.data?.length > 0) {
      const data = res.data[0];

      switch (data.billingType) {
        case "C":
          setBillMode("Continuous");
          break;

        case "O":
          setBillMode("OutletWise");
          break;

        case "D":
          setBillMode("DayWise");

          switch (data.subBillingType) {
            case "C":
              setDayWiseType("Continuous");
              break;

            case "O":
              setDayWiseType("OutletWise");
              break;

            case "S":
              setDayWiseType("Start Daily");
              break;

            default:
              setDayWiseType("Continuous");
          }

          break;

        default:
          setBillMode("");
      }
    }
  } catch (err: any) {
    console.error(err);
  } finally {
    setBillLoading(false);
  }
};
  const fetchSMSSenderSettings = async () => {
    try {
    setSmsLoading(true)

      const res = await getSMSSenderSettings(appData?.user?.branch_code);

      if (res?.success) {
        setSmsForm({
          smsId: res?.data?.smsId || "",

          smsPwd: res?.data?.smsPwd || "",

          smsSenderId: res?.data?.smsSenderId || "",

          smsProvider: res?.data?.smsProvider || "",

          mobileNo: res?.data?.mobileNo || "",

          backUpLocation: res?.data?.backUpLocation || "",

          dbName: res?.data?.dbName || "",

          isKotPrinter: res?.data?.isKotPrinter || false,

          isHomeDelivery: res?.data?.isHomeDelivery || false,

          isCustomerEntry: res?.data?.isCustomerEntry || false,

          emailID: res?.data?.emailID || "",

          password: res?.data?.password || "",

          isSMS: res?.data?.isSMS || false,

          isMail: res?.data?.isMail || false,

          isPriceShow: res?.data?.isPriceShow || false,

          isDescriptionShow: res?.data?.isDescriptionShow || false,

          dayCloseGraceHour: res?.data?.dayCloseGraceHour || 0,
        });
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load SMS Sender Settings ❌",
      );
    }finally{
    setSmsLoading(false)

    }
  };
  const fetchDiscountModeSettings = async () => {
    try {
    setDiscountLoading(true)

      const res = await getDiscountModeSettings(appData?.user?.branch_code);

      if (res?.success) {
        const onbill = res?.data?.find(
          (x: any) => x?.discountType?.toLowerCase() === "onbill",
        );

        const groupwise = res?.data?.find(
          (x: any) => x?.discountType?.toLowerCase() === "groupwise",
        );

        setDiscountModeForm({
          onbill: onbill?.discountRequired === true,

          groupwise: groupwise?.discountRequired === true,
        });
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load Discount Mode Settings ❌",
      );
    }finally{
    setDiscountLoading(false)

    }
  };
  const fetchTaxModeSettings = async () => {
    try {
      setTaxLoading(true)
      const res = await getTaxModeSettings(appData?.user?.branch_code);

      if (res?.success) {
        const grouped = res?.data?.find(
          (x: any) => x?.taxType?.toLowerCase() === "groupedtax",
        );

        const onbill = res?.data?.find(
          (x: any) => x?.taxType?.toLowerCase() === "onbilltax",
        );

        setTaxModeForm({
          groupedTax: grouped?.taxRequired === true,

          onbillTax: onbill?.taxRequired === true,
        });
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load Tax Mode Settings ❌",
      );
    }finally{
      setTaxLoading(false)

    }
  };
  const fetchFinancialSettings = async () => {
    try {
      setFinancialLoading(true)
      const res = await getFinancialSettings(appData?.user?.branch_code);

      if (res?.success) {
        setFinancialForm({
          finCode: res?.data?.finCode || "",

          finFromDate: res?.data?.finFromDate?.split("T")[0] || "",

          finToDate: res?.data?.finToDate?.split("T")[0] || "",

          finEndYear: res?.data?.finEndYear || 0,

          finalClose: res?.data?.finalClose === "Y",

          currentStatus: res?.data?.currentStatus === 1,
        });
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load Financial Settings ❌",
      );
    }finally{
      setFinancialLoading(false)

    }
  };

  const handleFinancialSave = async () => {
    try {
     setFinancialLoading(true);

      const payload = {
        finId: 0,

        finFromDate: financialForm.finFromDate,

        finToDate: financialForm.finToDate,

        fincurrentYear: new Date(financialForm.finFromDate).getFullYear(),

        finEndYear: Number(financialForm.finEndYear),

        currentStatus: financialForm.currentStatus ? 1 : 0,

        logUser: appData?.user?.userName || "Admin",

        ipAddress: "192.168.1.10",

        finalClose: financialForm.finalClose ? "Y" : "N",

        finCode: financialForm.finCode,

        branchCode: appData?.user?.branch_code,
      };

      const res = await saveOrUpdateFinancialSettings(payload);

      if (res?.success) {
        toast.success("Financial Settings Saved ✅");

        fetchFinancialSettings();
      } else {
        toast.error(res?.message || "Failed to save ❌");
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error saving Financial Settings ❌",
      );
    }finally {
  setFinancialLoading(false);
}
  };

  /* =========================
        FETCH SETTINGS
  ========================= */

  const fetchHappyHoursSettings = async () => {
    try {
      setHappyHoursLoading(true);

      const res = await getHappyHoursSettings(appData?.user?.branch_code);

      if (res?.success) {
        setForm({
          inOrExOfTax: res?.data?.inOrExOfTax || false,

          happyHours: res?.data?.happyHours || false,

          hhFrom: res?.data?.hhFrom || "",

          hhTo: res?.data?.hhTo || "",
        });
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load settings ❌",
      );
    } finally {
     setHappyHoursLoading(false);
    }
  };
  const fetchKOTTimerSettings = async () => {
    try {
      const res = await getKOTTimerSettings(appData?.user?.branch_code);

      if (res?.success) {
        setKotForm({
          timerRequired: res?.data?.timerRequired || false,

          timerMinute: res?.data?.timerMinute || 0,
        });
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load KOT settings ❌",
      );
    }
  };

  useEffect(() => {
    fetchHappyHoursSettings();
    fetchKOTTimerSettings();
    fetchFinancialSettings();
    fetchTaxModeSettings();
    fetchDiscountModeSettings();
    fetchSMSSenderSettings();
    fetchBillGenerationSettings();
     fetchOutlets();
  fetchKotConfiguration();
  fetchBillConfiguration();
  }, []);

  /* =========================
        SAVE
  ========================= */

  const handleSMSSenderSave = async () => {
    try {
  setSmsLoading(true);

      const payload = {
        ...smsForm,

        branchCode: appData?.user?.branch_code,
      };

      const res = await saveOrUpdateSMSSenderSettings(payload);

      if (res?.success) {
        toast.success("SMS Sender Settings Saved ✅");

        fetchSMSSenderSettings();
      } else {
        toast.error(res?.message || "Failed to save ❌");
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error saving SMS Sender Settings ❌",
      );
    } finally {
      setSmsLoading(false);
    }
  };
  const handleDiscountModeSave = async () => {
    try {
      setDiscountLoading(true);

      const payloads = [
        {
          discId: 1,

          discountRequired: discountModeForm.onbill,

          discountType: "Onbill",

          branchCode: appData?.user?.branch_code,
        },

        {
          discId: 2,

          discountRequired: discountModeForm.groupwise,

          discountType: "Groupwise",

          branchCode: appData?.user?.branch_code,
        },
      ];

      await Promise.all(payloads.map((p) => updateDiscountModeSettings(p)));

      toast.success("Discount Mode Settings Saved ✅");

      fetchDiscountModeSettings();
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error saving Discount Mode Settings ❌",
      );
    } finally {
     setDiscountLoading(false)
    }
  };

  const handleTaxModeSave = async () => {
    try {
   setTaxLoading(true);

      const payloads = [
        {
          taxId: 1,
          taxRequired: taxModeForm.groupedTax,
          taxType: "GroupedTax",
          branchCode: appData?.user?.branch_code,
        },

        {
          taxId: 2,
          taxRequired: taxModeForm.onbillTax,
          taxType: "OnbillTax",
          branchCode: appData?.user?.branch_code,
        },
      ];

      await Promise.all(payloads.map((p) => updateTaxModeSettings(p)));

      toast.success("Tax Mode Settings Saved ✅");

      fetchTaxModeSettings();
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error saving Tax Mode Settings ❌",
      );
    } finally {
      setTaxLoading(false);
    }
  };

  const handleHappyHouirsSave = async () => {
    try {
      setHappyHoursLoading(true);

      const payload = {
        inOrExOfTax: form.inOrExOfTax,

        happyHours: form.happyHours,

        hhFrom: `${form.hhFrom}`,

        hhTo: `${form.hhTo}`,

        branchCode: appData?.user?.branch_code,
      };

      const res = await saveOrUpdateHappyHoursSettings(payload);

      if (res?.success) {
        toast.success("Settings Saved Successfully ✅");

        fetchHappyHoursSettings();
      } else {
        toast.error(res?.message || "Failed to save ❌");
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error saving settings ❌",
      );
    } finally {
      setHappyHoursLoading(false);
    }
  };
  const handleKOTSave = async () => {
    try {
      setKotLoading(true);

      const payload = {
        timerRequired: kotForm.timerRequired,

        timerMinute: Number(kotForm.timerMinute),

        branchCode: appData?.user?.branch_code,
      };

      const res = await saveOrUpdateKOTTimerSettings(payload);

      if (res?.success) {
        toast.success("KOT Timer Settings Saved Successfully ✅");

        fetchKOTTimerSettings();
      } else {
        toast.error(res?.message || "Failed to save KOT settings ❌");
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error saving KOT settings ❌",
      );
    } finally {
      setKotLoading(false);
    }
  };



const handleBillGenerationSave = async () => {
  try {
    setBillLoading(true);

    const payload = {
      branchCode: appData?.user?.branch_code,

      billingType:
        billMode === "Continuous"
          ? "C"
          : billMode === "OutletWise"
          ? "O"
          : "D",

      subBillingType:
        billMode === "DayWise"
          ? dayWiseType === "Continuous"
            ? "C"
            : dayWiseType === "OutletWise"
            ? "O"
            : "S"
          : "",
    };

    const res = await saveBillGenerationSettings(payload);

    if (res?.success) {
      toast.success("Bill Generation Settings Saved ✅");
      fetchBillGenerationSettings();
    } else {
      toast.error(res?.message || "Failed to save ❌");
    }
  } catch (err: any) {
    toast.error(
      err?.response?.data?.message ||
        err?.message ||
        "Error saving Bill Generation Settings ❌"
    );
  } finally {
    setBillLoading(false);
  }
};
const handleKotConfigurationSave = async () => {
  try {
    const res = await saveKotConfiguration({
      oltCode: selectedOutlet,
      branchCode: appData?.user?.branch_code,
      kotType,
    });

    if (res?.success) {
      toast.success("KOT Configuration Saved ✅");
      fetchKotConfiguration();
    }
  } catch (err: any) {
    toast.error(
      err?.response?.data?.message ||
      err?.message ||
      "Failed to save KOT Configuration"
    );
  }
};
  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto bg-gray-100 p-3 sm:p-4 md:p-6">
{(
  happyHoursLoading ||
  kotLoading ||
  financialLoading ||
  taxLoading ||
  discountLoading ||
  smsLoading ||
  billLoading||
  billConfigLoading
) && <Loader />}
        {/* PAGE TITLE */}

        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Utility Settings</h1>
        </div>

        {/* SECTION GRID */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* ================= HAPPY HOURS ================= */}

          {/* EMPTY DIV 2 */}

<div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
    <h2 className="font-semibold text-gray-800 text-base">
      Bill Generation Settings
    </h2>
  </div>

  <div className="p-4 space-y-4 min-h-[220px]">
    <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
      <input
        type="checkbox"
        checked={billMode === "Continuous"}
        onChange={() => setBillMode("Continuous")}
        className="w-4 h-4"
      />
      Continuous
    </label>

    <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
      <input
        type="checkbox"
        checked={billMode === "OutletWise"}
        onChange={() => setBillMode("OutletWise")}
        className="w-4 h-4"
      />
      OutletWise
    </label>

    <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
      <input
        type="checkbox"
        checked={billMode === "DayWise"}
        onChange={() => setBillMode("DayWise")}
        className="w-4 h-4"
      />
      Day Wise
    </label>

    {billMode === "DayWise" && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Day Wise Type
        </label>

        <select
          value={dayWiseType}
          onChange={(e) => setDayWiseType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="Continuous">Continuous</option>
          <option value="OutletWise">OutletWise</option>
          <option value="Start Daily">Start Daily</option>
        </select>
      </div>
    )}

<button
  onClick={handleBillGenerationSave}
  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition"
>
  Save
</button>
  </div>
</div>
<div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
    <h2 className="font-semibold text-gray-800 text-base">
      KOT Configuration
    </h2>
  </div>

  <div className="p-4 space-y-4 min-h-[220px]">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Outlet
      </label>

   <select
  value={selectedOutlet}
  onChange={(e) => {
    const oltCode = Number(e.target.value);

    setSelectedOutlet(oltCode);

    const config = kotConfigs.find(
      (x) => x.oltCode === oltCode
    );

   if (config) {
  setKotType(config.kotType);
} else {
  setKotType("KOT");
}
  }}
  className="w-full border border-gray-300 rounded px-2 py-1"
>
  <option value={0}>Select Outlet</option>

  {outlets.map((outlet) => (
    <option key={outlet.oltCode} value={outlet.oltCode}>
      {outlet.oltName}
    </option>
  ))}
</select>
    </div>
<div className="flex gap-4">
  <label className="flex items-center gap-2">
    <input
      type="radio"
      name="kotType"
      checked={kotType === "KOT"}
      onChange={() => setKotType("KOT")}
    />
    KOT
  </label>

  <label className="flex items-center gap-2">
    <input
      type="radio"
      name="kotType"
      checked={kotType === "BILL"}
      onChange={() => setKotType("BILL")}
    />
    BILL
  </label>
</div>
    <button
      onClick={handleKotConfigurationSave}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
    >
      Save
    </button>
  </div>
</div>
<div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
    <h2 className="font-semibold text-gray-800 text-base">
      Bill Configuration
    </h2>
  </div>

  <div className="p-4">
    <p className="text-orange-600 font-medium text-sm mb-4">
      Current Setting is {reqBill} Bill At a Time
    </p>

    <div className="flex items-end gap-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Req. Bills
        </label>

        <select
          value={reqBill}
          onChange={(e) => setReqBill(Number(e.target.value))}
          className="w-full border border-gray-300 rounded px-2 py-1"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleBillConfigurationSave}
        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded"
      >
        Save
      </button>
    </div>
  </div>
</div>
          {/* ================= KOT TIMER SETTINGS ================= */}

          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
            {/* HEADER */}

            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800 text-base">
                KOT Cancel Timer Settings
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
                      timerRequired: e.target.checked,
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
                      timerMinute: Number(e.target.value),
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

          {/* ================= FINANCIAL SETTINGS ================= */}

          {/* EMPTY DIV 4 */}

          {/* ================= TAX MODE SETTINGS ================= */}

          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
            {/* HEADER */}

            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800 text-base">
                Tax Mode Settings
              </h2>
            </div>

            {/* BODY */}

            <div className="p-4 space-y-5 min-h-[220px]">
              {/* GROUPED TAX */}

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={taxModeForm.groupedTax}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    // prevent both false
                    if (!checked && !taxModeForm.onbillTax) {
                      toast.error("At least one Tax Mode must be enabled");

                      return;
                    }

                    setTaxModeForm({
                      ...taxModeForm,
                      groupedTax: checked,
                    });
                  }}
                  className="w-4 h-4"
                />
                Grouped Tax
              </label>

              {/* ON BILL TAX */}

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={taxModeForm.onbillTax}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    // prevent both false
                    if (!checked && !taxModeForm.groupedTax) {
                      toast.error("At least one Tax Mode must be enabled");

                      return;
                    }

                    setTaxModeForm({
                      ...taxModeForm,
                      onbillTax: checked,
                    });
                  }}
                  className="w-4 h-4"
                />
                On Bill Tax
              </label>

              {/* SAVE BUTTON */}

              <button
                onClick={handleTaxModeSave}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition"
              >
                Save
              </button>
            </div>
          </div>

          {/* EMPTY DIV 5 */}

          {/* ================= DISCOUNT MODE SETTINGS ================= */}

          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
            {/* HEADER */}

            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800 text-base">
                Discount Mode Settings
              </h2>
            </div>

            {/* BODY */}

            <div className="p-4 space-y-5 min-h-[220px]">
              {/* ON BILL */}

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={discountModeForm.onbill}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    if (!checked && !discountModeForm.groupwise) {
                      toast.error("At least one Discount Mode must be enabled");

                      return;
                    }

                    setDiscountModeForm({
                      ...discountModeForm,
                      onbill: checked,
                    });
                  }}
                  className="w-4 h-4"
                />
                On Bill Discount
              </label>

              {/* GROUPWISE */}

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={discountModeForm.groupwise}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    if (!checked && !discountModeForm.onbill) {
                      toast.error("At least one Discount Mode must be enabled");

                      return;
                    }

                    setDiscountModeForm({
                      ...discountModeForm,
                      groupwise: checked,
                    });
                  }}
                  className="w-4 h-4"
                />
                Groupwise Discount
              </label>

              {/* SAVE BUTTON */}

              <button
                onClick={handleDiscountModeSave}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition"
              >
                Save
              </button>
            </div>
          </div>

          {/* EMPTY DIV 6 */}

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
                  checked={form.inOrExOfTax}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      inOrExOfTax: e.target.checked,
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
                  checked={form.happyHours}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      happyHours: e.target.checked,
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
                      hhFrom: e.target.value,
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
                      hhTo: e.target.value,
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

          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
            {/* HEADER */}

            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800 text-base">
                Financial Settings
              </h2>
            </div>

            {/* BODY */}

            <div className="p-4 space-y-5 min-h-[220px]">
              {/* FIN CODE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Financial Code
                </label>

                <input
                  type="text"
                  value={financialForm.finCode}
                  onChange={(e) =>
                    setFinancialForm({
                      ...financialForm,
                      finCode: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* FROM DATE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Financial From Date
                </label>

                <input
                  type="date"
                  value={financialForm.finFromDate}
                  onChange={(e) =>
                    setFinancialForm({
                      ...financialForm,
                      finFromDate: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* TO DATE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Financial End Date
                </label>

                <input
                  type="date"
                  value={financialForm.finToDate}
                  onChange={(e) =>
                    setFinancialForm({
                      ...financialForm,
                      finToDate: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* FIN END YEAR */}
              {/* FIN END YEAR */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Financial End Year
                </label>

                <select
                  value={financialForm.finEndYear}
                  onChange={(e) =>
                    setFinancialForm({
                      ...financialForm,
                      finEndYear: Number(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Select End Year</option>

                  {Array.from(
                    { length: 20 },
                    (_, i) => new Date().getFullYear() + i,
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* FINAL CLOSE */}

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={financialForm.finalClose}
                  onChange={(e) =>
                    setFinancialForm({
                      ...financialForm,
                      finalClose: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                Final Close
              </label>

              {/* CURRENT STATUS */}

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={financialForm.currentStatus}
                  onChange={(e) =>
                    setFinancialForm({
                      ...financialForm,
                      currentStatus: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                Available
              </label>

              {/* SAVE BUTTON */}

              <button
                onClick={handleFinancialSave}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition"
              >
                Save
              </button>
            </div>
          </div>

          {/* ================= SMS SENDER SETTINGS ================= */}

          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
            {/* HEADER */}

            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800 text-base">
                SMS Sender Settings
              </h2>
            </div>

            {/* BODY */}

            <div className="p-4 space-y-4 max-h-[650px] overflow-y-auto">
              {/* SMS ID */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMS ID
                </label>

                <input
                  type="text"
                  value={smsForm.smsId}
                  onChange={(e) =>
                    setSmsForm({
                      ...smsForm,
                      smsId: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* SMS PASSWORD */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMS Password
                </label>

                <input
                  type="text"
                  value={smsForm.smsPwd}
                  onChange={(e) =>
                    setSmsForm({
                      ...smsForm,
                      smsPwd: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              {/* SMS SENDER ID */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMS Sender ID
                </label>

                <input
                  type="text"
                  value={smsForm.smsSenderId}
                  onChange={(e) =>
                    setSmsForm({
                      ...smsForm,
                      smsSenderId: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* SMS PROVIDER */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMS Provider
                </label>

                <input
                  type="text"
                  value={smsForm.smsProvider}
                  onChange={(e) =>
                    setSmsForm({
                      ...smsForm,
                      smsProvider: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              {/* MOBILE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>

                <input
                  type="text"
                  value={smsForm.mobileNo}
                  onChange={(e) =>
                    setSmsForm({
                      ...smsForm,
                      mobileNo: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* EMAIL */}

              {/* PASSWORD */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Password
                </label>

                <input
                  type="password"
                  value={smsForm.password}
                  onChange={(e) =>
                    setSmsForm({
                      ...smsForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* DAY CLOSE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day Close Grace Hour
                </label>

                <input
                  type="number"
                  value={smsForm.dayCloseGraceHour}
                  onChange={(e) =>
                    setSmsForm({
                      ...smsForm,
                      dayCloseGraceHour: Number(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              {/* CHECKBOXES */}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={smsForm.isKotPrinter}
                    onChange={(e) =>
                      setSmsForm({
                        ...smsForm,
                        isKotPrinter: e.target.checked,
                      })
                    }
                  />
                  KOT Printer
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={smsForm.isHomeDelivery}
                    onChange={(e) =>
                      setSmsForm({
                        ...smsForm,
                        isHomeDelivery: e.target.checked,
                      })
                    }
                  />
                  Home Delivery
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={smsForm.isCustomerEntry}
                    onChange={(e) =>
                      setSmsForm({
                        ...smsForm,
                        isCustomerEntry: e.target.checked,
                      })
                    }
                  />
                  Customer Entry
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={smsForm.isSMS}
                    onChange={(e) =>
                      setSmsForm({
                        ...smsForm,
                        isSMS: e.target.checked,
                      })
                    }
                  />
                  SMS
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={smsForm.isMail}
                    onChange={(e) =>
                      setSmsForm({
                        ...smsForm,
                        isMail: e.target.checked,
                      })
                    }
                  />
                  Mail
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={smsForm.isPriceShow}
                    onChange={(e) =>
                      setSmsForm({
                        ...smsForm,
                        isPriceShow: e.target.checked,
                      })
                    }
                  />
                  Price Show
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={smsForm.isDescriptionShow}
                    onChange={(e) =>
                      setSmsForm({
                        ...smsForm,
                        isDescriptionShow: e.target.checked,
                      })
                    }
                  />
                  Description Show
                </label>
              </div>

              {/* SAVE */}

              <button
                onClick={handleSMSSenderSave}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
