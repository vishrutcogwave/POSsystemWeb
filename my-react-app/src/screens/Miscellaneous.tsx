import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  DataTable,
  type Column,
} from "../components/DataTableForMasters";

import {
  createInventoryMisc,
  deleteInventoryMisc,
  getInventoryMiscList,
  getNextIdCode,
  updateInventoryMisc,
  getTaxMasterList,
} from "../api/services/products.service";

import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

/* =========================
   TYPES
========================= */

type Miscellaneous = {
  id: number;
  chargeId: number;
  chargeName: string;
  taxCode: number;
  taxName: string;
  branch_Code: string;
};

type Tax = {
  taxCode: number;
  taxName: string;
};

export default function Miscellaneous() {
  const { appData } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [data, setData] = useState<Miscellaneous[]>([]);

  const [taxes, setTaxes] = useState<Tax[]>([]);

  const [deleteRow, setDeleteRow] =
    useState<Miscellaneous | null>(null);

  const [form, setForm] = useState({
    chargeId: "",
    chargeName: "",
    taxCode: "",
    taxName: "",
  });

  /* =========================
      HANDLE CHANGE
  ========================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================
      FETCH NEXT CHARGE ID
  ========================= */

  const fetchNextCode = async () => {
    try {
      const res = await getNextIdCode({
        tableName: "MiscCharges",
        columnName: "ChargeId",
        conditionName: "Branch_Code",
        branch: appData?.user?.branch_code,
      });

      if (res?.success) {
        setForm((prev) => ({
          ...prev,
          chargeId: res.data.toString(),
        }));
      }
    } catch (err) {
      console.error(
        "Error fetching miscellaneous charge ID",
        err
      );
    }
  };

  /* =========================
      FETCH TAX LIST
  ========================= */

  const fetchTaxes = async () => {
    try {
      const res = await getTaxMasterList(
        appData?.user?.branch_code
      );

      if (res?.success) {
        setTaxes(res.data || []);
      } else {
        toast.error(
          res?.message || "Failed to fetch tax list"
        );
      }
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to fetch taxes ❌"
      );
    }
  };

  /* =========================
      FETCH MISCELLANEOUS LIST
  ========================= */

  const fetchMiscellaneous = async () => {
    try {
      setLoading(true);

      const res = await getInventoryMiscList(
        appData?.user?.branch_code
      );

      if (res?.success) {
        const formattedData = (res.data || []).map(
          (item: any) => ({
            id: item.chargeId,

            chargeId: item.chargeId,

            chargeName:
              item.chargeName || "",

            taxCode:
              item.taxCode ||
              item.taxcode ||
              0,

            taxName:
              item.taxName ||
              item.taxname ||
              "",

            branch_Code:
              item.branch_Code ||
              item.branchCode ||
              "",
          })
        );

        setData(formattedData);
      } else {
        toast.error(
          res?.message ||
            "Failed to fetch miscellaneous list ❌"
        );
      }
    } catch (err) {
      console.error(err);

      toast.error(
        "Error fetching miscellaneous list ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      INITIAL LOAD
  ========================= */

  useEffect(() => {
    if (appData?.user?.branch_code) {
      fetchNextCode();
      fetchMiscellaneous();
      fetchTaxes();
    }
  }, [appData?.user?.branch_code]);

  /* =========================
      SAVE
  ========================= */

  const handleSave = async () => {
    if (!form.chargeName.trim()) {
      toast.error("Please enter Charge Name");
      return;
    }

    if (!form.taxCode) {
      toast.error("Please select Tax");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        chargeId: Number(form.chargeId),

        chargeName:
          form.chargeName.trim(),

        taxCode:
          Number(form.taxCode),

        taxName:
          form.taxName,

        branch_Code:
          appData?.user?.branch_code,
      };

      console.log(
        "CREATE MISC PAYLOAD",
        payload
      );

      const res =
        await createInventoryMisc(payload);

      if (res?.success) {
        toast.success(
          "Miscellaneous Created Successfully ✅"
        );

        setForm({
          chargeId: "",
          chargeName: "",
          taxCode: "",
          taxName: "",
        });

        await fetchNextCode();
        await fetchMiscellaneous();
      } else {
        toast.error(
          res?.message ||
            "Failed to create miscellaneous ❌"
        );
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          "Error creating miscellaneous ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      EDIT
  ========================= */

  const handleEdit = (
    row: Miscellaneous
  ) => {
    setIsEdit(true);

    setForm({
      chargeId:
        row.chargeId.toString(),

      chargeName:
        row.chargeName,

      taxCode:
        row.taxCode
          ? row.taxCode.toString()
          : "",

      taxName:
        row.taxName || "",
    });
  };

  /* =========================
      UPDATE
  ========================= */

  const handleUpdate = async () => {
    if (!form.chargeName.trim()) {
      toast.error("Please enter Charge Name");
      return;
    }

    if (!form.taxCode) {
      toast.error("Please select Tax");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        chargeId:
          Number(form.chargeId),

        chargeName:
          form.chargeName.trim(),

        taxCode:
          Number(form.taxCode),

        taxName:
          form.taxName,

        branch_Code:
          appData?.user?.branch_code,
      };

      console.log(
        "UPDATE MISC PAYLOAD",
        payload
      );

      const res =
        await updateInventoryMisc(payload);

      if (res?.success) {
        toast.success(
          "Updated Successfully ✅"
        );

        setIsEdit(false);

        setForm({
          chargeId: "",
          chargeName: "",
          taxCode: "",
          taxName: "",
        });

        await fetchNextCode();
        await fetchMiscellaneous();
      } else {
        toast.error(
          res?.message ||
            "Update failed ❌"
        );
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          "Error updating miscellaneous ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      DELETE
  ========================= */

  const handleDeleteRow = (
    row: Miscellaneous
  ) => {
    setDeleteRow(row);
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;

    try {
      setLoading(true);

      const res =
        await deleteInventoryMisc(
          deleteRow.chargeId,
          appData?.user?.branch_code
        );

      if (res?.success) {
        toast.success(
          "Deleted Successfully ✅"
        );

        await fetchNextCode();
        await fetchMiscellaneous();
      } else {
        toast.error(
          res?.message ||
            "Delete failed ❌"
        );
      }
    } catch (err) {
      console.error(err);

      toast.error(
        "Error deleting miscellaneous ❌"
      );
    } finally {
      setLoading(false);
      setDeleteRow(null);
    }
  };

  /* =========================
      TABLE COLUMNS
  ========================= */

  const columns: Column<Miscellaneous>[] = [
    {
      header: "Charge ID",
      accessor: "chargeId",
    },

    {
      header: "Charge Name",
      accessor: "chargeName",
    },

    {
      header: "Tax",
      accessor: "taxCode",
    },
  ];

  /* =========================
      RENDER
  ========================= */

  return (
    <>
      <Header showNeworderButton={false} />

      <div className="h-[calc(100vh-100px)] overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">

        {loading && <Loader />}

        {/* ================= FORM ================= */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">

          <h2 className="text-lg font-semibold mb-4">
            Miscellaneous
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* CHARGE ID */}

            <div className="flex flex-col">

              <label className="text-sm text-gray-600 mb-1">
                Charge ID
              </label>

              <input
                name="chargeId"
                value={form.chargeId}
                disabled
                className="border rounded-lg px-3 py-2 text-sm bg-gray-100"
              />

            </div>

            {/* CHARGE NAME */}

            <div className="flex flex-col">

              <label className="text-sm text-gray-600 mb-1">
                Charge Name
              </label>

              <input
                name="chargeName"
                value={form.chargeName}
                onChange={handleChange}
                placeholder="Enter charge name"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

            </div>

            {/* TAX */}

            <div className="flex flex-col">

              <label className="text-sm text-gray-600 mb-1">
                Tax
              </label>

              <select
                name="taxCode"
                value={form.taxCode}
                onChange={(e) => {

                  const selectedTax =
                    taxes.find(
                      (tax) =>
                        String(
                          tax.taxCode
                        ) ===
                        e.target.value
                    );

                  setForm((prev) => ({
                    ...prev,

                    taxCode:
                      e.target.value,

                    taxName:
                      selectedTax?.taxName ||
                      "",
                  }));

                }}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >

                <option value="">
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

          </div>

          {/* BUTTONS */}

          <div className="flex gap-3 justify-end mt-6">

            {!isEdit ? (

              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>

            ) : (

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
                      chargeId: "",
                      chargeName: "",
                      taxCode: "",
                      taxName: "",
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

        {/* ================= TABLE ================= */}

        <div>

          <h2 className="text-lg font-semibold mb-3">
            Miscellaneous List
          </h2>

          <DataTable
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={handleDeleteRow}
          />

        </div>

        {/* ================= DELETE MODAL ================= */}

        {deleteRow && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm">

              <h2 className="text-lg font-semibold mb-3">
                Confirm Delete
              </h2>

              <p className="text-sm text-gray-600 mb-5">

                Are you sure you want to delete{" "}

                <span className="font-semibold">
                  {deleteRow.chargeName}
                </span>

                ?

              </p>

              <div className="flex justify-end gap-3">

                <button
                  onClick={() =>
                    setDeleteRow(null)
                  }
                  className="px-4 py-2 rounded-lg border text-gray-600"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </>
  );
}