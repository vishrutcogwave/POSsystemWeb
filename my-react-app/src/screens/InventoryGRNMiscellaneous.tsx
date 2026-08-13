    import React, { useEffect, useState } from "react";
    import Header from "../components/Header";
    import {
    DataTable,
    type Column,
    } from "../components/DataTableForMasters";

    import {
    createInventoryGRNMisc,
    deleteInventoryGRNMisc,
    getInventoryGRNMiscList,
    getInventoryMiscList,
    getNextIdCode,
    updateInventoryGRNMisc,
    } from "../api/services/products.service";

    import { useAppContext } from "../context/AppContext";
    import toast from "react-hot-toast";
    import Loader from "../components/Loader";

    type MiscCharge = {
    id: number;
    chargeId: number;
    chargeName: string;
    branch_Code: string;
    };

    type InventoryGRNMisc = {
    id: number;
    grnId: number;
    pno: number;
    chargeId: number;
    chargeAmt: string;
    branch_Code: string;
    };

    export default function InventoryGRNMiscellaneous() {
    const { appData } = useAppContext();

    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [data, setData] = useState<InventoryGRNMisc[]>([]);
    const [miscellaneous, setMiscellaneous] = useState<MiscCharge[]>([]);

    const [deleteRow, setDeleteRow] =
        useState<InventoryGRNMisc | null>(null);

    // Keep pno internally for UPDATE only.
    // It is not shown in the UI.

    const [form, setForm] = useState({
        grnId: "",
        chargeId: "",
        chargeAmt: "",
    });

    /* =========================
        HANDLE CHANGE
    ========================= */

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setForm((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    /* =========================
        FETCH MISCELLANEOUS
        DROPDOWN
    ========================= */

    const fetchMiscellaneous = async () => {
        try {
        const res = await getInventoryMiscList(
            appData?.user?.branch_code
        );

        if (res?.success) {
            const formattedData = (res.data || []).map(
            (item: any) => ({
                id: Number(item.chargeId),
                chargeId: Number(item.chargeId),
                chargeName: item.chargeName,
                branch_Code: item.branch_Code,
            })
            );

            setMiscellaneous(formattedData);

            return formattedData;
        } else {
            toast.error(
            res?.message ||
                "Failed to fetch miscellaneous list ❌"
            );

            return [];
        }
        } catch (err) {
        console.error(err);

        toast.error(
            "Error fetching miscellaneous list ❌"
        );

        return [];
        }
    };

    /* =========================
        FETCH INVENTORY GRN MISC
    ========================= */

    const fetchInventoryGRNMisc = async () => {
        try {
        setLoading(true);

        const res = await getInventoryGRNMiscList(
            appData?.user?.branch_code
        );

        if (res?.success) {
            const formattedData = (res.data || []).map(
            (item: any) => ({
                id: Number(item.grnId),
                grnId: Number(item.grnId),
                pno: Number(item.pno),
                chargeId: Number(item.chargeId),
                chargeAmt: String(item.chargeAmt ?? ""),
                branch_Code: item.branch_Code,
            })
            );

            setData(formattedData);
        } else {
            toast.error(
            res?.message ||
                "Failed to fetch Inventory GRN Miscellaneous ❌"
            );
        }
        } catch (err) {
        console.error(err);

        toast.error(
            "Error fetching Inventory GRN Miscellaneous ❌"
        );
        } finally {
        setLoading(false);
        }
    };

    /* =========================
        FETCH NEXT GRN ID
    ========================= */

    const fetchNextCode = async () => {
        try {
        const res = await getNextIdCode({
            tableName: "Tbl_GRNMISC",
            columnName: "GRNId",
            conditionName: "Branch_Code",
            branch: appData?.user?.branch_code,
        });

        if (res?.success) {
            setForm((prev) => ({
            ...prev,
            grnId: res.data.toString(),
            }));
        }
        } catch (err) {
        console.error(
            "Error fetching Inventory GRN Misc GRN ID",
            err
        );
        }
    };

    /* =========================
        INITIAL LOAD
    ========================= */

    useEffect(() => {
        const loadData = async () => {
        if (!appData?.user?.branch_code) return;

        setLoading(true);

        try {
            await fetchMiscellaneous();
            await fetchInventoryGRNMisc();
            await fetchNextCode();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
        };

        loadData();
    }, [appData?.user?.branch_code]);

    /* =========================
        SAVE / CREATE
    ========================= */

    const handleSave = async () => {
        if (!form.chargeId) {
        toast.error("Please select Charge");
        return;
        }

        if (!form.chargeAmt.trim()) {
        toast.error("Please enter Charge Amount");
        return;
        }

        try {
        setLoading(true);

        const payload = {
            // Always 0 while creating
            grnId:Number(form.grnId),
            pno: 0,

            chargeId: Number(form.chargeId),

            chargeAmt: Number(form.chargeAmt.trim()),

            branch_Code: appData?.user?.branch_code,
        };

        console.log(
            "Create Inventory GRN Misc Payload:",
            payload
        );

        const res = await createInventoryGRNMisc(payload);

        if (res?.success) {
            toast.success(
            "Inventory GRN Miscellaneous Created Successfully ✅"
            );

            setIsEdit(false);

            setForm({
            grnId: "",
            chargeId: "",
            chargeAmt: "",
            });

            await fetchNextCode();
            await fetchInventoryGRNMisc();
        } else {
            toast.error(
            res?.message ||
                "Failed to create Inventory GRN Miscellaneous ❌"
            );
        }
        } catch (err) {
        console.error(err);

        toast.error(
            "Error creating Inventory GRN Miscellaneous ❌"
        );
        } finally {
        setLoading(false);
        }
    };

    /* =========================
        EDIT
    ========================= */

 const handleEdit = (row: InventoryGRNMisc) => {
  console.log("EDIT ROW:", row);
  console.log("EDIT CHARGE ID:", row.chargeId);

  setIsEdit(true);

  // Keep pno internally for update

  setForm({
    grnId: String(row.grnId),
    chargeId: String(row.chargeId), // important
    chargeAmt: String(row.chargeAmt),
  });
};

    /* =========================
        UPDATE
    ========================= */

    const handleUpdate = async () => {
        if (!form.chargeId) {
        toast.error("Please select Charge");
        return;
        }

        if (!form.chargeAmt.trim()) {
        toast.error("Please enter Charge Amount");
        return;
        }

        try {
        setLoading(true);

        const payload = {
            // Existing pno is used internally for update
            grnId: Number(form.grnId),

            pno:0,

            chargeId: Number(form.chargeId),

            chargeAmt: Number(form.chargeAmt.trim()),

            branch_Code: appData?.user?.branch_code,
        };

        console.log(
            "Update Inventory GRN Misc Payload:",
            payload
        );

        const res = await updateInventoryGRNMisc(payload);

        if (res?.success) {
            toast.success(
            "Inventory GRN Miscellaneous Updated Successfully ✅"
            );

            setIsEdit(false);

            setForm({
            grnId: "",
            chargeId: "",
            chargeAmt: "",
            });

            await fetchNextCode();
            await fetchInventoryGRNMisc();
        } else {
            toast.error(
            res?.message ||
                "Update failed ❌"
            );
        }
        } catch (err) {
        console.error(err);

        toast.error(
            "Error updating Inventory GRN Miscellaneous ❌"
        );
        } finally {
        setLoading(false);
        }
    };

    /* =========================
        DELETE
    ========================= */

    const handleDeleteRow = (
        row: InventoryGRNMisc
    ) => {
        setDeleteRow(row);
    };

    const confirmDelete = async () => {
        if (!deleteRow) return;

        try {
        setLoading(true);

        const res = await deleteInventoryGRNMisc(
            deleteRow.grnId,
            appData?.user?.branch_code
        );

        if (res?.success) {
            toast.success(
            "Inventory GRN Miscellaneous Deleted Successfully ✅"
            );

            await fetchNextCode();
            await fetchInventoryGRNMisc();
        } else {
            toast.error(
            res?.message ||
                "Delete failed ❌"
            );
        }
        } catch (err) {
        console.error(err);

        toast.error(
            "Error deleting Inventory GRN Miscellaneous ❌"
        );
        } finally {
        setLoading(false);
        setDeleteRow(null);
        }
    };

    /* =========================
        CANCEL EDIT
    ========================= */

    const handleCancel = async () => {
        setIsEdit(false);

        setForm({
        grnId: "",
        chargeId: "",
        chargeAmt: "",
        });

        await fetchNextCode();
    };

    /* =========================
        GET CHARGE NAME
    ========================= */

    const getChargeName = (
        chargeId: number | string
    ) => {
        const charge = miscellaneous.find(
        (item) =>
            Number(item.chargeId) ===
            Number(chargeId)
        );

        return charge?.chargeName || "-";
    };

    /* =========================
        TABLE COLUMNS
    ========================= */

 /* =========================
   TABLE COLUMNS
========================= */

const columns: Column<InventoryGRNMisc>[] = [
  {
    header: "GRN ID",
    accessor: "grnId",
  },
  {
    header: "Charge ID",
    accessor: "chargeId",
  },
  {
    header: "Charge",
    accessor: "chargeId",
    cell: (row) => getChargeName(row.chargeId),
  },
  {
    header: "Charge Amount",
    accessor: "chargeAmt",
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
                Inventory GRN Miscellaneous
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* GRN ID */}

                <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                    GRN ID
                </label>

                <input
                    name="grnId"
                    value={form.grnId}
                    disabled
                    className="border rounded-lg px-3 py-2 text-sm bg-gray-100"
                />
                </div>

                {/* CHARGE */}

                <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                    Charge
                </label>

                <select
                    name="chargeId"
                    value={form.chargeId}
                    onChange={handleChange}
                    className="border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <option value="">
                    Select Charge
                    </option>

                    {miscellaneous.map((item) => (
                    <option
                        key={item.chargeId}
                        value={String(item.chargeId)}
                    >
                        {item.chargeName}
                    </option>
                    ))}
                </select>
                </div>

                {/* CHARGE AMOUNT */}

                <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                    Charge Amount
                </label>

                <input
                    type="text"
                    name="chargeAmt"
                    value={form.chargeAmt}
                    onChange={handleChange}
                    placeholder="Enter charge amount"
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
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
                    onClick={handleCancel}
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
                Inventory GRN Miscellaneous List
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
                    Are you sure you want to delete this
                    miscellaneous charge?
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