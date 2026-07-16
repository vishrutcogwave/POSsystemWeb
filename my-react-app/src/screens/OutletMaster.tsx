import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { DataTable, type Column } from "../components/DataTableForMasters";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  getOutletList,
  createOutlet,
  updateOutlet,
  deleteOutlet,
  getNextIdCode,
  getTaxMasterList,
} from "../api/services/products.service";

type Outlet = {
  id: number;
  oltCode: number;
  oltName: string;
  posCode: number;
  serviceCharge: number;
  oltAddress1: string;
  oltAddress2: string;
  taxCode: number;
  tinNo: string;
  sbCess: number;
  kkCess: number;
  oltIsRoomService: boolean;
  oltIsParcelService: boolean;
  oltIsFastFood: boolean;
  oltServiceTaxRequired: boolean;
  inExTax: boolean;
    isDirectKOTandBill: false,
  isDirectPaxandStw: false,
    isDirectBill: boolean;
};

export default function OutletMaster() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState<Outlet[]>([]);
  const [deleteRow, setDeleteRow] = useState<Outlet | null>(null);
  const [taxList, setTaxList] = useState<
    { taxCode: number; taxName: string; taxPercentage: number }[]
  >([]);

  const fetchTaxList = async () => {
    try {
      const res = await getTaxMasterList(appData?.user?.branch_code);

      if (res?.success) {
        setTaxList(res.data);
      }
    } catch (err) {
      console.error("Error fetching tax list", err);
    }
  };
  const [form, setForm] = useState({
    oltCode: "",
    oltName: "",
    posCode: "",
    serviceCharge: "",
    oltAddress1: "",
    oltAddress2: "",
    taxCode: "",
    tinNo: "",
    sbCess: "",
    kkCess: "",
    oltIsRoomService: false,
    oltIsParcelService: false,
    oltIsFastFood: false,
    oltServiceTaxRequired: false,
    inExTax: false,
      isDirectKOTandBill: false,
  isDirectPaxandStw: false,
      isDirectBill: false,

  });

  /* ================= FETCH ================= */
  const fetchOutlets = async () => {
    try {
      setLoading(true);
      const res = await getOutletList(appData?.user?.branch_code);

      if (res?.success) {
        const formatted = res.data.map((item: any) => ({
          id: item.oltCode,
          ...item,
        }));
        setData(formatted);
      } else {
        toast.error("Failed ❌");
      }
    } catch {
      toast.error("Error fetching ❌");
    } finally {
      setLoading(false);
    }
  };

  /* ================= NEXT CODE ================= */
  const fetchNextCode = async () => {
    const res = await getNextIdCode({
      tableName: "OutletMaster",
      columnName: "OltCode",
      conditionName: "Branch_Code",
      branch: appData?.user?.branch_code,
    });

    if (res?.success) {
      setForm((prev) => ({
        ...prev,
        oltCode: res.data.toString(),
      }));
    }
  };

  useEffect(() => {
    fetchOutlets();
    fetchNextCode();
    fetchTaxList(); // 👈 ADD THIS
  }, []);

  /* ================= HANDLE CHANGE ================= */
  // 🔥 ONLY showing important updated parts — rest stays same

  // ✅ FIX TYPE

  // ================= HANDLE CHANGE =================
  // ✅ small improvement (supports select also)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };
  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        oltCode: Number(form.oltCode),
        posCode: Number(form.posCode || 0),
        oltName: form.oltName,
        oltIsRoomService: form.oltIsRoomService,
        oltServiceTaxRequired: form.oltServiceTaxRequired,
        oltAddress1: form.oltAddress1,
        oltAddress2: form.oltAddress2,
        taxCode: Number(form.taxCode || 0),
        userCode: Number(appData?.user?.userCode),
        lastModify: new Date().toISOString(),
        serviceCharge: Number(form.serviceCharge || 0),
        branch_Code: appData?.user?.branch_code,
        oltIsParcelService: form.oltIsParcelService,
        isUploaded: "N",
        isModified: "N",
        tinNo: form.tinNo,
        sbCess: Number(form.sbCess || 0),
        kkCess: Number(form.kkCess || 0),
        inExTax: form.inExTax,
        oltIsFastFood: form.oltIsFastFood,
          isDirectKOTandBill: form.isDirectKOTandBill,
  isDirectPaxandStw: form.isDirectPaxandStw,
   isDirectBill: form.isDirectBill,

      };

      const res = await createOutlet(payload);

      if (res?.success) {
        toast.success("Outlet Created ✅");
         setForm({
        oltCode: "",
        oltName: "",
        posCode: "",
        serviceCharge: "",
        oltAddress1: "",
        oltAddress2: "",
        taxCode: "",
        tinNo: "",
        sbCess: "",
        kkCess: "",
        oltIsRoomService: false,
        oltIsParcelService: false,
        oltIsFastFood: false,
        oltServiceTaxRequired: false,
        inExTax: false,
          isDirectKOTandBill: false,
  isDirectPaxandStw: false,
  isDirectBill:false,
      });

        fetchOutlets();
        fetchNextCode();
      } else {
        toast.error(res?.message || "Failed ❌");
      }
    } catch {
      toast.error("Error ❌");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const payload = {
        oltCode: Number(form.oltCode),
        posCode: Number(form.posCode || 0),
        oltName: form.oltName,
        oltIsRoomService: form.oltIsRoomService,
        oltServiceTaxRequired: form.oltServiceTaxRequired,
        oltAddress1: form.oltAddress1,
        oltAddress2: form.oltAddress2,
        taxCode: Number(form.taxCode || 0),
        userCode: Number(appData?.user?.userCode),
        lastModify: new Date().toISOString(),
        serviceCharge: Number(form.serviceCharge || 0),
        branch_Code: appData?.user?.branch_code,
        oltIsParcelService: form.oltIsParcelService,
        isUploaded: "N",
        isModified: "Y",
        tinNo: form.tinNo,
        sbCess: Number(form.sbCess || 0),
        kkCess: Number(form.kkCess || 0),
        inExTax: form.inExTax,
        oltIsFastFood: form.oltIsFastFood,
          isDirectKOTandBill: form.isDirectKOTandBill,
  isDirectPaxandStw: form.isDirectPaxandStw,
   isDirectBill: form.isDirectBill,

      };

      const res = await updateOutlet(payload);

      if (res?.success) {
        toast.success("Outlet Updated ✅");
         setForm({
        oltCode: "",
        oltName: "",
        posCode: "",
        serviceCharge: "",
        oltAddress1: "",
        oltAddress2: "",
        taxCode: "",
        tinNo: "",
        sbCess: "",
        kkCess: "",
        oltIsRoomService: false,
        oltIsParcelService: false,
        oltIsFastFood: false,
        oltServiceTaxRequired: false,
        inExTax: false,
          isDirectKOTandBill: false,
  isDirectPaxandStw: false,
  isDirectBill:false
      });

        setIsEdit(false);
        fetchOutlets();
        fetchNextCode();
      } else {
        toast.error(res?.message || "Update failed ❌");
      }
    } catch {
      toast.error("Error ❌");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (row: Outlet) => {
    setIsEdit(true);
    setForm({
      oltCode: row.oltCode.toString(),
      oltName: row.oltName,
      posCode: row.posCode.toString(),
      serviceCharge: row.serviceCharge.toString(),
      oltAddress1: row.oltAddress1,
      oltAddress2: row.oltAddress2,
      taxCode: row.taxCode.toString(),
      tinNo: row.tinNo,
      sbCess: row.sbCess.toString(),
      kkCess: row.kkCess.toString(),
      oltIsRoomService: row.oltIsRoomService,
      oltIsParcelService: row.oltIsParcelService,
      oltIsFastFood: row.oltIsFastFood,
      oltServiceTaxRequired: row.oltServiceTaxRequired,
      inExTax: row.inExTax,
        isDirectKOTandBill: row.isDirectKOTandBill,
  isDirectPaxandStw: row.isDirectPaxandStw,
    isDirectBill: row.isDirectBill,
    });
  };

  /* ================= DELETE ================= */
  const handleDeleteRow = (row: Outlet) => setDeleteRow(row);

  const confirmDelete = async () => {
    if (!deleteRow) return;

    try {
      setLoading(true);
      const res = await deleteOutlet(deleteRow.oltCode,appData?.user?.branch_code);

      if (res?.success) {
        toast.success("Deleted ✅");
           await fetchNextCode()
        fetchOutlets();
      } else {
        toast.error("Delete failed ❌");
      }
    } catch {
      toast.error("Error ❌");
    } finally {
      setLoading(false);
      setDeleteRow(null);
    }
  };

  const columns: Column<Outlet>[] = [
    { header: "Code", accessor: "oltCode" },
    { header: "Name", accessor: "oltName" },
    { header: "POS", accessor: "posCode" },
    { header: "Service", accessor: "serviceCharge" },
  ];

  return (
    <>
      <Header showNeworderButton={false} />

    <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
      {loading && <Loader />}

      {/* FORM */}
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Outlet Master</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ["oltCode", "Outlet Code"],
            ["oltName", "Outlet Name"],
            ["posCode", "POS Code"],
            ["serviceCharge", "Service Charge"],
            ["oltAddress1", "Address 1"],
            ["oltAddress2", "Address 2"],
            ["tinNo", "TIN No"],
            ["sbCess", "SB Cess"],
            ["kkCess", "KK Cess"],
          ].map(([key, label]) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">{label}</label>
              <input
                name={key}
                value={(form as any)[key]}
                onChange={handleChange}
                disabled={key === "oltCode"}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}

          {/* ✅ TAX DROPDOWN */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Tax</label>

            <select
              name="taxCode"
              value={form.taxCode}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Tax</option>

              {taxList.map((tax) => (
                <option key={tax.taxCode} value={tax.taxCode}>
                  {tax.taxName} ({tax.taxPercentage}%)
                </option>
              ))}
            </select>
          </div>

{[
  ["oltIsRoomService", "Room Service"],
  ["oltIsParcelService", "Parcel Service"],
  ["oltIsFastFood", "Fast Food"],
  ["oltServiceTaxRequired", "Service Tax"],
  ["inExTax", "In/Ex Tax"],
  ["isDirectKOTandBill", "Direct KOT & Bill"],
  ["isDirectPaxandStw", "Direct Pax & Steward"],
  ["isDirectBill", "Direct Bill"],
].map(([key, label]) => (
  <div key={key} className="flex items-center gap-2">
    <input
      type="checkbox"
      name={key}
      checked={(form as any)[key]}
      onChange={handleChange}
    />
    <label className="text-sm">{label}</label>
  </div>
))}
        </div>

        {/* BUTTONS */}
      {/* BUTTONS */}
<div className="flex gap-3 mt-6 justify-end">
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
        onClick={async () => {
          setIsEdit(false);

          setForm({
            oltCode: "",
            oltName: "",
            posCode: "",
            serviceCharge: "",
            oltAddress1: "",
            oltAddress2: "",
            taxCode: "",
            tinNo: "",
            sbCess: "",
            kkCess: "",
            oltIsRoomService: false,
            oltIsParcelService: false,
            oltIsFastFood: false,
            oltServiceTaxRequired: false,
            inExTax: false,
              isDirectKOTandBill: false,
  isDirectPaxandStw: false,
  isDirectBill:false
          });

          await fetchNextCode();
        }}
        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
      >
        Cancel
      </button>
    </>
  )}
</div>
      </div>
      {/* TABLE */}
      <DataTable
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDeleteRow}
      />

      {/* DELETE DIALOG */}
      {deleteRow && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p>Delete {deleteRow.oltName}?</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setDeleteRow(null)}>Cancel</button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div></>
  );
}
