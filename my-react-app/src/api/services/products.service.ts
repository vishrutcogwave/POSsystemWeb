import toast from "react-hot-toast";
import api from "../axios";
const token = localStorage.getItem("token");
export const getBranchesByUser = async (username: string) => {
  const response = await api.get("/api/POS/GetBranchesByUser", {
    params: { username },
  });

  return response.data;
};
export const getCombinedOutletAndTableMasterList = async (
  branchcode: string,
  usercode: number,
) => {
  const response = await api.get(
    "/api/POS/GetCombinedOutletandtablemasterList",
    {
      params: { usercode, branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getStewardList = async (branchcode: string) => {
  const response = await api.get("/api/POS/GetStewardList", {
    params: { branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getItemCategoryList = async (branchcode: string) => {
  const response = await api.get("/api/POS/GetItemCategoryList", {
    params: { branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getCombinedOltItemList = async (
  oltCode: string,
  branchCode: string,
  grpCode: number,
) => {
  const response = await api.get("/api/POS/GetCombinedOltItemList", {
    params: { oltcode: oltCode, branchcode: branchCode, grpcode: grpCode },
  });
  return response.data;
};

export const createOrder = async (orderData: any) => {
  try {
    const response = await api.post("api/POS/BtnSubmitposorder", orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating order:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getSubTables = async (
  outlet: string,
  tableno: string,
  branchcode: string,
) => {
  const response = await api.get("/api/POS/getsubtables", {
    params: {
      outlet,
      tableno,
      branchcode,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getOldCart = async (
  tableno: string | null,
  outlet: string,
  subtable: string,
  branchCode: any,
) => {
  const response = await api.get("/api/POS/GetOldCart", {
    params: {
      tableno,
      outlet,
      subtable,
      branchCode,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getNCKOT = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POS/getnckot", {
    params: {
      branchcode,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getSpecialInfo = async () => {
  const response = await api.get("/api/POS/GetSpecialInfo", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getBill = async (billData: any) => {
  try {
    const response = await api.post("/api/POS/GetBill", billData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching bill:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
export const postBill = async (billData: any) => {
  try {
    const response = await api.post("/api/POS/Postbill", billData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching bill:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getTaxSettings = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POS/GetTaxSettings", {
    params: { branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getCompanyInfo = async (branchcode: string) => {
  const token = localStorage.getItem("token");
  const companyCode = Number(localStorage.getItem("company_code") ?? 0);

  console.log(companyCode);
  const response = await api.get("/api/POS/GetCompanyInfo", {
    params: { branchcode, companyCode },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getFastfoodDetails = async (
  outlet: string,
  branchcode: string,
) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POS/GetFastfoodDetails", {
    params: { outlet, branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getItemGroupList = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POS/GetItemGroupList", {
    params: { branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getDailySalesReport = async (
  fromdate: string,
  todate: string,
  outlet: number | string,
) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POSReports/Dailysales", {
    params: {
      fromdate,
      todate,
      outlet,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getChanceSheetReport = async (
  fromdate: string,
  todate: string,
  outlet: string,
  branchcode: string,
) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POSReports/Chancesheet", {
    params: {
      fromdate,
      todate,
      outlet,
      branchcode,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getVoidKOTReport = async (
  fromdate: string,
  todate: string,
  outlet: number | string,
) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POSReports/Voidkot", {
    params: {
      fromdate,
      todate,
      outlet,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getNCKOTReport = async (
  fromdate: string,
  todate: string,
  outlet: number | string,
) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POSReports/Nckot", {
    params: {
      fromdate,
      todate,
      outlet,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getItemSalesReport = async (
  fromdate: string,
  todate: string,
  outlet: string | number,
) => {
  try {
    const response = await api.get("/api/POSReports/Itemsales", {
      params: { fromdate, todate, outlet },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching item sales report:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getPaymentModeMaster = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POS/GetPaymentModeMaster", {
    params: { branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getUnbillDetails = async (
  billno: number,
  tblno: string,
  outlet: string | number,
  branchcode: string,
) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POS/GetUnbillDetails", {
    params: {
      billno,
      tblno,
      outlet,
      branchcode,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const settleBill = async (payload: any) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/POS/SettleBill", // ✅ your endpoint
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error settling bill:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getDiscountModeMaster = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POS/GetDiscountModeMaster", {
    params: { branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getKotTransferType = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POS/GetKotTransfertype", {
    params: { branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const postKotTransferTable = async (payload: {
  oldOutlet: string;
  oldTableNo: string;
  oldSubTable: string;
  newOutlet: string;
  newTable: string;
  newSubTable: string | null;
  userCode: string;
  branch: string;
  transferType: string;
  kotNo: string[];
  itemCode: number[];
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/POS/Kottransfertable", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error in KOT transfer:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
export const postKotToNcKot = async (payload: {
  kotId: number[];
  tableNo: string;
  subTable: string;
  branch: string;
  ncCode: number;
  ncRemarks: string;
  actionType: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/POS/kot2nckot", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error in KOT → NC KOT:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getFilteredBillDetails = async (params: {
  fromDate: string;
  toDate: string;
  branchCode: string;
  outlet: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/POS/GetFilteredBillDetails", {
      params: {
        fromDate: params.fromDate,
        toDate: params.toDate,
        Branch_Code: params.branchCode,
        OltCode: params.outlet,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching filtered bill details:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getReprintBill = async (payload: {
  guestName?: string;
  gstNo?: string;
  address?: string;
  stateCode?: number;
  billno: number;
  oltcode: string | number;
  billDate?: string;
  branchcode: string;
}) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POS/GetReprintBill", {
    params: {
      guestName: payload.guestName,
      gstNo: payload.gstNo,
      address: payload.address,
      stateCode: payload.stateCode,
      billno: payload.billno,
      oltcode: payload.oltcode,
      billDate: payload.billDate,
      branchcode: payload.branchcode,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getOpenDayDetails = async (
  userid: number | string,
  branchCode: string,
) => {
  const response = await api.post("/api/KOT/GetOpenDayDetais", null, {
    params: { userid, branchCode }, // ✅ IMPORTANT FIX
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.data;
};

export const dayClose = async (payload: {
  userId: number;
  systemTime: string;
  posEntryDate: string;
  branchCode: string;
}) => {
  try {
    const response = await api.post("/api/KOT/Dayclose", payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error in Day Close:", error.response?.data || error.message);
    throw error;
  }
};
export const dayOpen = async (payload: {
  userId: number;
  systemTime: string;
  systemDate: string;
  branchCode: string;
}) => {
  try {
    const response = await api.post("/api/KOT/Dayopen", payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error in Day Open:", error.response?.data || error.message);
    throw error;
  }
};

export const getNextIdCode = async ({
  tableName,
  columnName,
  conditionName,
  branch,
}: {
  tableName: string;
  columnName: string;
  conditionName: string;
  branch: string;
}) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/Master/GetFindnextnumber", {
    params: {
      table_name: tableName,
      column_name: columnName,
      condition_name: conditionName,
      branch,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createCompany = async (payload: {
  companyCode: number;
  companyName: string;
  contactPerson: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  gstNo: string;
  userCode: string;
  lastModify: string;
  branch_code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/Master/CreateCompany", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating company:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getCompanyList = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/Master/GetCompanieslist", {
    params: { branchcode }, // ✅ dynamic
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateCompany = async (payload: {
  companyCode: number;
  companyName: string;
  contactPerson: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  gstNo: string;
  userCode: string;
  lastModify: string;
  branch_code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put("/api/Master/UpdateCompany", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating company:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const deleteCompany = async (id: number, branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteCompany", {
      params: { id, branchcode }, // ✅ query param
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting company:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getTaxMasterList = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/Master/GetTaxMasterlist", {
    params: { branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createTaxMaster = async (payload: {
  taxCode: number;
  taxName: string;
  taxPercentage: number;
  isActive: boolean;
  fromDate: string;
  toDate: string | null;
  userCode: string;
  branchCode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/Master/CreateTaxMaster", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error creating tax:", error.response?.data || error.message);
    throw error;
  }
};

export const updateTaxMaster = async (payload: {
  taxCode: number;
  taxName: string;
  taxPercentage: number;
  isActive: boolean;
  fromDate: string;
  toDate: string | null;
  userCode: string;
  branchCode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/Master/UpdateTaxMaster", // 🔥 changed endpoint
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating tax:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteTaxMaster = async (id: number, branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteTaxMaster", {
      params: { id, branchcode }, // 🔥 query param
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting tax:", error.response?.data || error.message);
    throw error;
  }
};

export const getTaxDescriptionList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetTaxDescriptionlist", {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching tax description list:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const createTaxDescription = async (payload: {
  taxCode: number;
  taxDescription: string;
  taxPercentage: number;
  isActive: boolean;
  userCode: string;
  branchCode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/Master/CreateTaxDescription",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating tax description:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const updateTaxDescription = async (payload: {
  taxCode: number;
  taxDescription: string;
  taxPercentage: number;
  isActive: boolean;
  userCode: string;
  branchCode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/Master/UpdateTaxDescription", // ✅ PUT API
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating tax description:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const deleteTaxDescription = async (id: number, branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteTaxDescription", {
      params: { id, branchcode }, // ✅ query param
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting tax description:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getDepartmentList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetDepartmentList", {
      params: { branchcode }, // 👈 same as ?branchcode=DEROY
      headers: {
        Authorization: `Bearer ${token}`, // remove if not required
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching department list:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const createDepartment = async (payload: {
  depCode: number;
  depName: string;
  depHead: string;
  posCode: string;
  branch_code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/Master/CreateDepartment", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating department:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const updateDepartment = async (payload: {
  depCode: number;
  depName: string;
  depHead: string;
  posCode: string;
  branch_code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put("/api/Master/UpdateDepartment", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating department:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const deleteDepartment = async (id: number, branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteDepartment", {
      params: { id, branchcode }, // 👈 ?id=6
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting department:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
export const getOutletList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetOutletList", {
      params: { branchcode }, // 👈 same as ?branchcode=DEROY
      headers: {
        Authorization: `Bearer ${token}`, // remove if not needed
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching outlet list:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const createOutlet = async (payload: any) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/Master/CreateOutlet", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating outlet:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const updateOutlet = async (payload: any) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put("/api/Master/UpdateOutlet", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating outlet:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const deleteOutlet = async (id: number, branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteOutlet", {
      params: { id, branchcode }, // 👉 this creates ?id=89
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting outlet:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
export const getOutletItemList = async (
  branchcode: string,
  oltcode: number,
  isavaliable: boolean,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetOutletItemList", {
      params: {
        branchcode,
        oltcode,
        isavaliable,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching outlet item list:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const bulkIncrementItems = async (payload: {
  amount: number | null;
  percentage: number | null;
  grpCode: number;
  items: any[];
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/Master/bulkincrement", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error in bulk increment:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const createOltItemMaster = async (payload: {
  oltCode: string;
  branchCode: string;
  userCode: string;
  isTaxIncluded: boolean;
  taxCode: string;
  taxName: string;
  itemGroup: string;
  oltDetails: {
    itemCode: number;
    itemName: string;
    oidRate: number;
    oidAvailable: boolean;
    discount: number;
    freeItemCode: string;
    freeItemName: string;
    freeItemQty: string;
    isHappyHour: boolean;
    grpCode: number;
  }[];
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/Master/CreateOltItemMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating outlet item master:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getItemMasterList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetItemMasterList", {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`, // remove if API doesn't need token
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching item master list:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const GetCategoryMasterList = async (branchcode: string) => {
  const response = await api.get("/api/Master/GetCategoryMasterList", {
    params: { branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  return response.data;
};

export const GetSubCategoryMasterList = async (branchcode: string) => {
  const response = await api.get("/api/Master/GetSubCategoryMasterList", {
    params: { branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  return response.data;
};

export const GetGroupMasterList = async (branchcode: string) => {
  const response = await api.get("/api/Master/GetGroupMasterList", {
    params: { branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  return response.data;
};

export const GetUnitMasterList = async (branchcode: string) => {
  const response = await api.get("/api/Master/GetUnitMasterList", {
    params: { branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  return response.data;
};

export const GetPrintingMasterList = async (branchcode: string) => {
  const response = await api.get("/api/Master/GetPrintingMasterList", {
    params: { branchcode },
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  return response.data;
};


export const createItemMaster = async (payload: {
  itemCode: number;
  itemName: string;
  catCode: string;
  subCatCode: string;
  grpCode: string;
  itemDiscountAllowed: boolean;
  itemRate: number;
  userCode: string;
  lastModify: string;
  unitCode: number;
  unitName: string;
  dep: string;
  depCode: string;
  taxCode: number;
  taxName: string;
  printDepartment: string;
  branchCode: string;
  sacCode: string;
  thumb: string;
  barcode: string;
  isVeg: boolean;
  oltCodes: any[];
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/Master/CreateItemMaster", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating item master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateItemMaster = async (payload: {
  itemCode: number;
  itemName: string;
  catCode: string;
  subCatCode: string;
  grpCode: string;
  itemDiscountAllowed: boolean;
  itemRate: number;
  userCode: string;
  lastModify: string;
  unitCode: number;
  unitName: string;
  dep: string;
  depCode: string;
  taxCode: number;
  taxName: string;
  printDepartment: string;
  branchCode: string;
  sacCode: string;
  thumb: string;
  barcode: string;
  isVeg: boolean;
  oltCodes: any[];
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put("/api/Master/UpdateItemMaster", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating item master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteItemMaster = async (
  id: number,
  branchcode: string,
  outlets: number[],
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteItemMaster", {
      params: {
        id,
        branchcode,
      },

      // ✅ body data
      data: outlets,

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting item master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const downloadItemMasterExcel = async (branchCode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/ItemMasterDownloadExcel", {
      params: {
        BranchCode: branchCode,
      },

      responseType: "blob",

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    // ✅ create download url
    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");

    link.href = url;

    // ✅ file name
    link.setAttribute("download", "ItemImport.xlsx");

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    return true;
  } catch (error: any) {
    console.error(
      "Error downloading excel:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const uploadItemMasterExcel = async (file: File, BranchCode: string) => {
  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
      `/api/Master/uploadItemMasterFromExcel?BranchCode=${BranchCode}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error uploading excel:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
export const importItemMasterFromExcel = async (
  items: any[],
  userCode: string,
  branchCode: string,
  oltCodes: number[],
) => {
  try {
    const token = localStorage.getItem("token");

    const payload = {
      items,
      userCode,
      branchCode,
      oltCodes,
    };

    const response = await api.post(
      "/api/Master/ImportItemMasterFromExcel",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error importing item master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
export const createItemMasterWithImage = async (image: File) => {
  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();

    // "Image" should match API parameter name
    formData.append("Image", image);

    const response = await api.post(
      "/api/Master/CreateItemMasterWithImage",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error uploading image:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getUnitMasterList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetUnitMasterList", {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching unit master list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const createUnitMaster = async (payload: {
  unitCode: number;
  unitName: string;
  unitSymbol: string;
  branch_Code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/Master/CreateUnitMaster", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating unit master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateUnitMaster = async (payload: {
  unitCode: number;
  unitName: string;
  unitSymbol: string;
  branch_Code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put("/api/Master/UpdateUnitMaster", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating unit master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteUnitMaster = async (id: number, branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteUnitMaster", {
      params: { id, branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting unit master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getGroupMasterList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetGroupMasterList", {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching group master list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const createGroupMaster = async (payload: {
  grpCode: number;
  grpName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  isuploaded: string;
  dep: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/Master/CreateGroupMaster", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating group master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateGroupMaster = async (payload: {
  grpCode: number;
  grpName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  isuploaded: string;
  dep: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put("/api/Master/UpdateGroupMaster", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating group master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteGroupMaster = async (id: number, branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteGroupMaster", {
      params: { id, branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting group master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getCategoryMasterList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetCategoryMasterList", {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching category master list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const createCategoryMaster = async (payload: {
  catCode: number;
  catName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  subCat: string;
  imageUrl: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/Master/CreateCategoryMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating category master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateCategoryMaster = async (payload: {
  catCode: number;
  catName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  subCat: string;
  imageUrl: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/Master/UpdateCategoryMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating category master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteCategoryMaster = async (id: number, branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteCategoryMaster", {
      params: { id, branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting category master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getSubCategoryMasterList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetSubCategoryMasterList", {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching sub category list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const createSubCategoryMaster = async (payload: {
  catCode: number;
  catName: string;
  subCatCode: number;
  subCatName: string;
  userCode: string;
  trDate: string;
  branch_Code: string;
  subCat: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/Master/CreateSubCategoryMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating sub category:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateSubCategoryMaster = async (payload: {
  catCode: number;
  catName: string;
  subCatCode: number;
  subCatName: string;
  userCode: string;
  trDate: string;
  branch_Code: string;
  subCat: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/Master/UpdateSubCategoryMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating sub category:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteSubCategoryMaster = async (
  id: number,
  branchcode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteSubCategoryMaster", {
      params: { id, branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting sub category:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getStewardMasterList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetStewardMasterList", {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching steward master list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const createStewardMaster = async (payload: {
  stwCode: number;
  posCode: string;
  stwName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  mobNo: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/Master/CreateStewardMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating steward master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateStewardMaster = async (payload: {
  stwCode: number;
  posCode: string;
  stwName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  mobNo: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put("/api/Master/UpdateStewardMaster", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating steward master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteStewardMaster = async (id: number, branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteStewardMaster", {
      params: {
        id,
        branchcode,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting steward master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getNCDepartmentMasterList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetNCDepartmentMasterList", {
      params: { branchcode },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching NC Department list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const createNCDepartmentMaster = async (payload: {
  ncDepCode: number;
  ncDepName: string;
  userid: string;
  lastModify: string;
  branch_Code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/Master/CreateNCDepartmentMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",

          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating NC Department:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateNCDepartmentMaster = async (payload: {
  ncDepCode: number;
  ncDepName: string;
  userid: string;
  lastModify: string;
  branch_Code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/Master/UpdateNCDepartmentMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",

          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating NC Department:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteNCDepartmentMaster = async (
  id: number,
  branchcode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteNCDepartmentMaster", {
      params: {
        id,
        branchcode,
      },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting NC Department:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getPrintingMasterList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetPrintingMasterList", {
      params: { branchcode },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching printing master list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const createPrintingMaster = async (payload: {
  depCode: number;
  depName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  isUploaded: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/Master/CreatePrintingMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",

          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating printing master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updatePrintingMaster = async (payload: {
  depCode: number;
  depName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  isUploaded: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/Master/UpdatePrintingMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",

          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating printing master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deletePrintingMaster = async (id: number, branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeletePrintingMaster", {
      params: {
        id,
        branchcode,
      },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting printing master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getTableMasterList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetTableMasterList", {
      params: { branchcode },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching table master list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const createTableMaster = async (payload: {
  tblCode: number;
  oltCode: string;
  tblNo: string;
  tblSeatCount: number;
  userCode: string;
  lastModify: string;
  poscode: string;
  branch_Code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/Master/CreateTableMaster", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating table master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateTableMaster = async (payload: {
  tblCode: number;
  oltCode: string;
  tblNo: string;
  tblSeatCount: number;
  userCode: string;
  lastModify: string;
  poscode: string;
  branch_Code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put("/api/Master/UpdateTableMaster", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating table master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteTableMaster = async (id: number, branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteTableMaster", {
      params: { id, branchcode },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting table master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= PROPERTY DETAILS MASTER =================

export const getPropertyDetailsList = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetPropertyDetailsList", {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching property details list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const createPropertyDetailsMaster = async (payload: {
  company_Name: string;
  company_code: number;
  startYear: string;
  address1: string;
  address2: string;
  phone_number: string;
  mob_number: string;
  ownerName: string;
  owner_Number: number;
  fax_number: number;
  email_id: string;
  tin_no: string;
  licence_number: string;
  branch_code: string;
  stdcode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/Master/CreatePropertyDetailsMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating property details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updatePropertyDetailsMaster = async (payload: {
  company_Name: string;
  company_code: number;
  startYear: string;
  address1: string;
  address2: string;
  phone_number: string;
  mob_number: string;
  ownerName: string;
  owner_Number: number;
  fax_number: number;
  email_id: string;
  tin_no: string;
  licence_number: string;
  branch_code: string;
  stdcode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/Master/UpdatePropertyDetailsMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating property details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deletePropertyDetailsMaster = async (id: number) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/Master/DeletePropertyDetailsMaster",
      {
        params: {
          id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting property details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= BRANCH DETAILS MASTER =================

export const getBranchDetailsList = async (propertyid: number) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetBranchDetailsList", {
      params: { propertyid },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching branch details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const createBranchDetailsMaster = async (payload: {
  brId: number;
  company_code: number;
  branch_code: string;
  branch_name: string;
  address1: string;
  address2: string;
  phone_number: number;
  mob_number: number;
  fax_number: number;
  email_id: string;
  tin_no: string;
  licence_number: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/Master/CreateBranchDetailsMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating branch details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateBranchDetailsMaster = async (payload: {
  brId: number;
  company_code: number;
  branch_code: string;
  branch_name: string;
  address1: string;
  address2: string;
  phone_number: number;
  mob_number: number;
  fax_number: number;
  email_id: string;
  tin_no: string;
  licence_number: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/Master/UpdateBranchDetailsMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating branch details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteBranchDetailsMaster = async (id: number) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/Master/DeleteBranchDetailsMaster", {
      params: {
        id,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting branch details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= USER ACCESS MASTER =================

export const getUserDetailsList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/UserAccess/GetUserDetailsList", {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching user details list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const createUserDetailsMaster = async (payload: {
  userCode: number;
  userName: string;
  userPassword: string;
  userPrivilege: string;
  enteredBy: string;
  lastModify: string;
  branch_code: string;
  storeid: number;
  disPercent: number;
  disAmount: number;
  roleId: number;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/UserAccess/CreateUserDetailsMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating user details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateUserDetailsMaster = async (payload: {
  userCode: number;
  userName: string;
  userPassword: string;
  userPrivilege: string;
  enteredBy: string;
  lastModify: string;
  branch_code: string;
  storeid: number;
  disPercent: number;
  disAmount: number;
  roleId: number;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/UserAccess/UpdateUserDetailsMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating user details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteUserDetailsMaster = async (
  id: number,
  branchcode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/UserAccess/DeleteUserDetailsMaster",
      {
        params: {
          id,
          branchcode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting user details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= ROLE MASTER =================

export const getRoleMasterList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/UserAccess/GetRoleMasterList", {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching role master list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= USER PERMISSION ACCESS =================

export const getUserPermissionAccessList = async (
  branchcode: string,
  usercode: number,
  roleId: number,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/UserAccess/GetUserPermissionAccessList",
      {
        params: {
          branchcode,
          usercode,
          roleId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching user permission access list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const insertUserPermissionAccessMaster = async (
  payload: {
    userCode: number;
    userName: string;
    roleId: number;
    roleName: string;
    mainMenuId: number;
    menuName: string;
    menuPermission: boolean;
    subMenuId: number;
    subMenuName: string;
    isPermission: boolean;
    branchCode: string;
  }[],
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/UserAccess/InsertUserPermissionAccessMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error inserting user permission access:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getKotCancellationReport = async (params: {
  BranchCode: string;
  IsAsOnDate: boolean;
  IsBetweenDates: boolean;
  Date: any;
  FromDate: string;
  ToDate: string;
  BillingType: string;
  OutletCode: number | string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/POSReports/KotCancellation", {
      params: {
        BranchCode: params.BranchCode,
        IsAsOnDate: params.IsAsOnDate,
        IsBetweenDates: params.IsBetweenDates,
        Date: params.Date,
        FromDate: params.FromDate,
        ToDate: params.ToDate,
        BillingType: params.BillingType,
        OutletCode: params.OutletCode,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching KOT cancellation report:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getBillCancellationReport = async (params: {
  BranchCode: string;
  IsAsOnDate: boolean;
  IsBetweenDates: boolean;
  Date: any;
  FromDate: string;
  ToDate: string;
  BillingType: string;
  OutletCode: number | string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/POSReports/BillCancellation", {
      params: {
        BranchCode: params.BranchCode,
        IsAsOnDate: params.IsAsOnDate,
        IsBetweenDates: params.IsBetweenDates,
        Date: params.Date,
        FromDate: params.FromDate,
        ToDate: params.ToDate,
        BillingType: params.BillingType,
        OutletCode: params.OutletCode,
      },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching Bill cancellation report:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getDailySaleCategoryWiseReport = async (params: {
  BranchCode: string;
  IsAsOnDate: boolean;
  IsBetweenDates: boolean;
  Date: any;
  FromDate: string;
  ToDate: string;
  BillingType: string;
  OutletCode: number | string;
  CatCode: any;
  SubCatCode: any;
  IsSubCategory: boolean;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/POSReports/DailysaleCategorywise", {
      params: {
        BranchCode: params.BranchCode,
        IsAsOnDate: params.IsAsOnDate,
        IsBetweenDates: params.IsBetweenDates,
        Date: params.Date,
        FromDate: params.FromDate,
        ToDate: params.ToDate,
        BillingType: params.BillingType,
        OutletCode: params.OutletCode,
        CatCode: params.CatCode,
        SubCatCode: params.SubCatCode,
        IsSubCategory: params.IsSubCategory,
      },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching Daily Sale Category Wise report:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getKotRegisterReport = async (params: {
  BranchCode: string;
  IsAsOnDate: boolean;
  IsBetweenDates: boolean;
  Date: any;
  FromDate: string;
  ToDate: string;
  BillingType: string;
  OutletCode: number | string;
  TableNo: number | string;
  IsPendingkot: boolean;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/POSReports/KotRegister", {
      params: {
        BranchCode: params.BranchCode,
        IsAsOnDate: params.IsAsOnDate,
        IsBetweenDates: params.IsBetweenDates,
        Date: params.Date,
        FromDate: params.FromDate,
        ToDate: params.ToDate,
        BillingType: params.BillingType,
        OutletCode: params.OutletCode,
        TableNo: params.TableNo,
        IsPendingkot: params.IsPendingkot,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching KOT register report:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= HAPPY HOURS SETTINGS =================

export const getHappyHoursSettings = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/UtilitySetting/GetHappyHoursSettings",
      {
        params: { branchcode },

        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching happy hours settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const saveOrUpdateHappyHoursSettings = async (payload: {
  inOrExOfTax: boolean;
  happyHours: boolean;

  hhFrom: string;

  hhTo: string;

  branchCode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/UtilitySetting/SaveorUpdateHappyHoursSettings",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving happy hours settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= KOT TIMER SETTINGS =================

export const getKOTTimerSettings = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/UtilitySetting/GetKOTTimerSettings", {
      params: { branchcode },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching KOT timer settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const saveOrUpdateKOTTimerSettings = async (payload: {
  timerRequired: boolean;
  timerMinute: number;
  branchCode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/UtilitySetting/SaveorUpdateKOTTimerSettings",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving KOT timer settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= PHONEPE DQR PAYMENT =================

export const sendPaymentRequestDQRDevice = async (
  amount: number,
  transNo: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/PhonePeDQRDevice/SendPaymentRequestDQRDevice",
      null,
      {
        params: {
          amount,
          TransNo: transNo,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error sending payment request:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getPaymentStatusRequestDQRDevice = async (transNo: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      `/api/PhonePeDQRDevice/PaymentStatusRequestDQRDevice/${transNo}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error getting payment status:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= FINANCIAL SETTINGS =================

export const getFinancialSettings = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/UtilitySetting/GetFinancialSettings", {
      params: { branchcode },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching financial settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const saveOrUpdateFinancialSettings = async (payload: {
  finId: number;
  finFromDate: string;
  finToDate: string;
  fincurrentYear: number;
  finEndYear: number;
  currentStatus: number;
  logUser: string;
  ipAddress: string;
  finalClose: string;
  finCode: string;
  branchCode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/UtilitySetting/SaveOrUpdateFinancialSettings",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving financial settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= TAX MODE SETTINGS =================

export const getTaxModeSettings = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/UtilitySetting/GetTaxModeSettings", {
      params: { branchcode },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching tax mode settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateTaxModeSettings = async (payload: {
  taxId: number;
  taxRequired: boolean;
  taxType: string;
  branchCode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/UtilitySetting/UpdateTaxModeSettings",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating tax mode settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= DISCOUNT MODE SETTINGS =================

export const getDiscountModeSettings = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/UtilitySetting/GetDiscountModeSettings",
      {
        params: { branchcode },

        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching discount mode settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateDiscountModeSettings = async (payload: {
  discId: number;
  discountRequired: boolean;
  discountType: string;
  branchCode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/UtilitySetting/UpdateDiscountModeSettings",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating discount mode settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= SMS SENDER SETTINGS =================

export const getSMSSenderSettings = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/UtilitySetting/GetSMSSenderSettings", {
      params: { branchcode },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching SMS sender settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const saveOrUpdateSMSSenderSettings = async (payload: {
  smsId: string;
  smsPwd: string;
  smsSenderId: string;
  smsProvider: string;
  mobileNo: string;
  backUpLocation: string;
  dbName: string;
  isKotPrinter: boolean;
  isHomeDelivery: boolean;
  isCustomerEntry: boolean;
  emailID: string;
  password: string;
  isSMS: boolean;
  isMail: boolean;
  isPriceShow: boolean;
  isDescriptionShow: boolean;
  dayCloseGraceHour: number;
  branchCode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/UtilitySetting/SaveOrUpdateSMSSenderSettings",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving SMS sender settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= BILL DETAILS =================

export const getBillDetails = async (
  OutletCode: number,
  BranchCode: string,
  FromDate: string,
  ToDate: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/POS/GetBillDetails", {
      params: {
        OutletCode,
        BranchCode,
        FromDate,
        ToDate,
      },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching bill details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= CANCEL BILL =================

export const cancelBill = async (payload: {
  outlet: number;
  billNo: number;
  branch: string;
  billDate: string;
  userId: number;
  reason: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/POS/CancelBill", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error cancelling bill:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getItemWiseAddOnDetailsList = async (
  BranchCode: string,
  Itemcode: number,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/Master/GetItemWiseAddOnDetailsList", {
      params: {
        BranchCode,
        Itemcode,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching item wise add-on details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ================= ADDON DETAILS =================

export const getAdditionalAddonDetailsList = async (
  Itemcode: number,
  BranchCode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/Master/GetAdditionalAddonDetailsList",
      {
        params: {
          Itemcode,
          BranchCode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching addon details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const insertorUpdateAddOnDetails = async (
  payload: {
    itemCode: number;
    addOnItemCode: number;
    addOnName: string;
    itemRate: number;
    isActive: boolean;
    userCode: string;
    branchCode: string;
  }[],
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/Master/InsertorUpdateAddOnDetails",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving addon details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const saveMenuWithSubMenu = async (payload: {
  mainMenuId: number;
  menuName: string;
  menuPermission: boolean;
  subMenuId: number;
  subMenuName: string;
  subMenuPermission: boolean;
  branchCode: string;
  isExistingMainMenu: boolean;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/UserAccess/SaveMenuWithSubMenu",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving menu/submenu:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getMainMenuList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/UserAccess/GetMainMenuList", {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching main menu list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteMainMenuDetail = async (
  mainMenuId: number,
  branchcode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/UserAccess/DeleteMainMenuDetail", {
      params: {
        MainMenuId: mainMenuId,
        branchcode,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting main menu:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteSubMenuDetail = async (
  subMenuId: number,
  branchcode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/UserAccess/DeleteSubMenuDetail", {
      params: {
        SubMenuId: subMenuId,
        branchcode,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting submenu:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export interface SettlementBillModifyRequest {
  oltCode: number;
  outletName: string;
  userCode: number;
  billId: number;
  billNo: number;
  tableNo: string;
  subTableNo: string;
  discount: number;
  taxAmount: number;
  tips: number;
  changeAmount: number;
  grandAmount: number;
  refNo: string;
  cardName: string;
  billDate: string;
  branchCode: string;
  guestCode: string;
  guestName: string;
  checkInNo: string;
  paymentDetails: {
    mode: string;
    subMode: string;
    amount: number;
    remarks: string;
  }[];
}

export const settlementBillModify = async (
  payload: SettlementBillModifyRequest,
) => {
  const response = await api.post("/api/POS/SettlementBillModify", payload, {
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
  });

  return response.data;
};

export const getCompanyTransferBills = async (
  companyCode: number,
  branchCode: string,
) => {
  const response = await api.get("/api/POS/GetcompanyTransferbills", {
    params: {
      companyCode,
      branchCode,
    },
    headers: {
      accept: "*/*",
    },
  });

  return response.data;
};

export const getChargesDetails = async (branchCode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/POS/GetChargesDetails", {
      params: {
        branchCode,
      },

      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching charges details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const saveCompanyBillSettlement = async (payload: {
  companyCode: number;

  payingAmount: number;

  settleDate: string;

  bankName: string;

  branchName: string;

  chDDNo: string;

  userCode: string;

  paymentMode: string;

  ccno: string;

  refNo: string;

  validDate: string;

  branch_Code: string;

  isFullSettlement: boolean;

  isChargesApplied: boolean;

  // NEW
  fullChargesDetails: {
    chargesType: string;

    chargesAmount: number;
  }[];

  bills: {
    btId: number;

    billNo: number;

    billAmount: number;

    amountPaid: number;

    partialpay: number | string;

    individualChargesApplied: boolean;

    // NEW ARRAY
    individualCharges: {
      chargesType: string;

      chargesAmount: number;
    }[];
  }[];
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/POS/SaveCompanyBillSettlement",

      payload,

      {
        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",

          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving company bill settlement:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const sendPaymentRequestOwnDevice = async (
  amount: number,
  transno: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/PhonePeDQRDevice/SendPaymentRequestOwnDevice",
      null,
      {
        params: {
          Amount: amount,
          Transno: transno,
        },
        headers: {
          Authorization: `Bearer ${token}`, // remove if API doesn't require auth
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error sending payment request:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const checkOwnDevicePaymentStatus = async (transno: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/PhonePeDQRDevice/CheckOwnDevicePaymentStatus",
      {
        params: {
          transno,
        },
        headers: {
          Authorization: `Bearer ${token}`, // remove if not required
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error checking payment status:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getModifyBillData = async (
  KOTId: number | string,
  oltcode: number | string,
  billno: number | string,
  branchcode: string | null,
  settledDate: string,
) => {
  try {
    const response = await api.get("/api/POS/GetModifyBillData", {
      params: {
        KOTId,
        oltcode,
        billno,
        branchcode,
        settledDate,
      },
      headers: {
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching modify bill data:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const deleteModifyBillItem = async (
  KOTId: number,
  itemcode: number,
  Branch: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete("/api/POS/ModifyUnsettledKotBillDelete", {
      params: {
        KOTId,
        itemcode,
        Branch,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting bill item:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getPrinterSettings = async (
  branchcode: string,
  OltCode: number | string,
) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/UtilitySetting/GetPrinterSettings", {
    params: {
      branchcode,
      OltCode,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  return response.data;
};

export const saveOrUpdateCatGroupSettings = async (payload: {
  rno: number;
  catGrp: string;
  grp: number;
  branch_code: string;
  oltCode: number;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/UtilitySetting/SaveOrUpdateCatGroupSettings",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving category group settings:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const modifyBillCalculation = async (payload: any) => {
  const token = localStorage.getItem("token");

  const response = await api.post("/api/POS/ModifyBillCalculation", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      accept: "*/*",
    },
  });

  return response.data;
};

export const modifyBillCreateUpdate = async (payload: any) => {
  const token = localStorage.getItem("token");

  const response = await api.post("/api/POS/ModifyBillCreateUpdate", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      accept: "*/*",
    },
  });

  return response.data;
};

export const saveOrUpdatePrinterSettings = async (payload: {
  printerName: string;
  billType: string;
  branch_Code: string;
  oltCode: string;
  printType: string;
  grpCode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/UtilitySetting/SaveOrUpdatePrinterSettings",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving printer settings:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const deleteCatGroupSettings = async (
  grpCode: number,
  oltCode: number,
  branchcode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/UtilitySetting/DeleteCatGroupSettings",
      {
        params: {
          GrpCode: grpCode,
          OltCode: oltCode,
          Branchcode: branchcode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting cart group:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const deleteprintGroupSettings = async (
  grpCode: number,
  oltCode: number,
  branchcode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/UtilitySetting/DeletePrinterSettings",
      {
        params: {
          GrpCode: grpCode,
          OltCode: oltCode,
          Branchcode: branchcode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting cart group:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const saveBillGenerationSettings = async (payload: {
  branchCode: string;
  billingType: string;
  subBillingType: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/UtilitySetting/BillGeneration",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving Bill Generation Settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getBillGenerationSettings = async (branchCode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/UtilitySetting/GetBillGenerationData",
      {
        params: {
          Branch_Code: branchCode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching Bill Generation Settings:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const saveKotConfiguration = async (payload: {
  oltCode: number;
  branchCode: string;
  kotType: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/UtilitySetting/KotConfiguration",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving KOT Configuration:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getKotConfiguration = async (branchCode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/UtilitySetting/GetKotConfiguration", {
      params: {
        Branch_Code: branchCode,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching KOT Configuration:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getBillConfiguration = async (branchCode: string) => {
  const response = await api.get("/api/UtilitySetting/GetBillConfiguration", {
    params: { Branch_Code: branchCode },
  });

  return response.data;
};
export const saveBillConfiguration = async (payload: {
  reqBill: number;
  branchCode: string;
}) => {
  const response = await api.post(
    "/api/UtilitySetting/BillConfiguration",
    payload,
  );

  return response.data;
};

export const getOnlinePaymentType = async () => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/KOT/OnlinePaymentType", {
    headers: {
      Authorization: `Bearer ${token}`, // Remove if the API doesn't require auth
      accept: "*/*",
    },
  });

  return response.data;
};

export const validateDay = async (payload: {
  posEntryDate: string;
  branchcode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/POS/validateday", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message);
  }
};

export const getAdjustmentLoadData = async (payload: {
  branchCode: string;
  oltCode: string;
  fromDate: string;
  toDate: string;
  paymentMode: string;
  excludedBills: string[];
  rankByType: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/POS/GetAdjustmentLoadData", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error loading adjustment data:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getCalculateRankAmount = async (
  rankId: number,
  totalAmount: number,
  branchCode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/POS/GetCalculateRankAmount", {
      params: {
        RankId: rankId,
        TotalAmount: totalAmount,
        BranchCode: branchCode,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error calculating rank amount:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const newBiddingCheck = async (
  rankId: number,
  bidAmount: number,
  branchCode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/POS/NewbiddingCheck", null, {
      params: {
        RankId: rankId,
        BidAmount: bidAmount,
        BranchCode: branchCode,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error checking bidding:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const saveBidChanges = async (payload: {
  branchCode: string;
  oltCode: string;
  fromDate: string;
  toDate: string;
  finalSaleAmount: number;
  rankByType: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/POS/SaveBidChanges", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving bid changes:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getTableListForRoomService = async (
  oltCode: string | number,
  branchCode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/POS/GetTableListForRoomService", {
      params: {
        Oltcode: oltCode,
        Branchcode: branchCode,
      },
      headers: {
        Authorization: `Bearer ${token}`, // Remove if API doesn't require auth
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching room service table list:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getDashboardData = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/POSReports/GetDashboardData", {
      params: {
        Branchcode: branchcode,
      },
      headers: {
        Authorization: `Bearer ${token}`, // Remove if this API doesn't require auth
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching dashboard data:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// ================= PRODUCT LICENCE =================

export const getProductLicenceKey = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/ProductLicence/GetProductLicenceKey", {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`, // Remove if API doesn't require token
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching product licence:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const saveProductLicenceKey = async (payload: {
  serialKey: string;
  productKey: string;
  trDate: string;
  validDate: string;
  clientName: string;
  branchCode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/ProductLicence/SaveProductLicenceKey",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving product licence:",
      error.response?.data || error.message,
    );

    // Return API response instead of throwing
    return (
      error.response?.data || {
        success: false,
        message: "Something went wrong.",
        data: null,
      }
    );
  }
};

export const getRoomInActive = async (RoomNo: string, BillNo: number) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POS/GetRoomInActive", {
    params: {
      RoomNo,
      BillNo,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  return response.data;
};
export const getUnsettledKOTDetails = async (
  fromdate: string,
  todate: string,
  branchcode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/POS/GetUnsettledKOTDetails", {
      params: {
        fromdate,
        todate,
        Branchcode: branchcode,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching unsettled KOT details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateUnsettledKOT = async (
  payload: {
    kotId: string;
    oltCode: string;
    kotDate: string;
    branchcode: string;
  }[],
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post("/api/POS/UpdateUnsettledKOT", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating unsettled KOT:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getUnsettledBillDetails = async (
  fromdate: string,
  todate: string,
  Branchcode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/api/POS/GetUnsettledBillDetails", {
      params: {
        fromdate,
        todate,
        Branchcode,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching unsettled bill details:",
      error.response?.data || error.message,
    );

    throw error;
  }
};


 
export const getSupplierList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");
 
    const response = await api.get("/api/InventoryMaster/GetSupplierList", {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });
    console.log("Supplier List Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching supplier list:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
 
export const createSupplier = async (payload: any) => {
  const response = await api.post(
    "/api/InventoryMaster/CreateSupplier",
    payload,
  );
 
  return response.data;
};
 
export const updateSupplier = async (payload: any) => {
  const response = await api.put(
    "/api/InventoryMaster/UpdateSupplier",
    payload,
  );
 
  return response.data;
};
 
export const deleteSupplier = async (id: number, branchcode: string) => {
  const response = await api.delete("/api/InventoryMaster/DeleteSupplier", {
    params: {
      id,
      branchcode,
    },
  });
 
  return response.data;
};
 
export const getInventoryItemCategoryList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");
 
    const response = await api.get(
      "/api/InventoryMaster/GetInventoryCategoryMasterList",
      {
        params: { branchcode },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching category master list:",
      error.response?.data || error.message,
    );
 
    throw error;
  }
};
 
export const createInventoryItemCategory = async (payload: {
  catCode: number;
  catName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  imageUrl: string;
}) => {
  try {
    const token = localStorage.getItem("token");
 
    const response = await api.post(
      "/api/InventoryMaster/CreateInventoryCategoryMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );
 
    return response.data;
  } catch (error: any) {
    console.log("Status:", error.response?.status);
    console.log("Response:", error.response?.data);
    throw error;
  }
};
export const updateInventoryItemCategory = async (payload: {
  catCode: number;
  catName: string;
  userCode: string;
  lastModify: string;
  branch_Code: string;
  imageUrl: string;
}) => {
  const token = localStorage.getItem("token");
 
  const response = await api.put(
    "/api/InventoryMaster/UpdateInventoryCategoryMaster",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
    },
  );
 
  return response.data;
};
 
export const deleteInventoryItemCategory = async (
  id: number,
  branchcode: string,
) => {
  try {
    const token = localStorage.getItem("token");
 
    const response = await api.delete(
      "/api/InventoryMaster/DeleteInventoryCategoryMaster",
      {
        params: { id, branchcode },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );
 
    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting category master:",
      error.response?.data || error.message,
    );
 
    throw error;
  }
};
 
export const getInventorySubCategoryMasterList = async (branchcode: string) => {
  const token = localStorage.getItem("token");
  const response = await api.get(
    "/api/InventoryMaster/GetInventorySubCategoryMasterList",
    {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    },
  );
 
  return response.data;
};
 
export const createInventorySubCategoryMaster = async (payload: {
  catCode: number;
  catName: string;
  subCatCode: number;
  subCatName: string;
  userCode: string;
  trDate: string;
  branch_Code: string;
}) => {
  try {
    const token = localStorage.getItem("token");
 
    const response = await api.post(
      "/api/InventoryMaster/CreateInventorySubCategoryMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );
 
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating sub category:",
      error.response?.data || error.message,
    );
 
    throw error;
  }
};
 
export const updateInventorySubCategoryMaster = async (payload: {
  catCode: number;
  catName: string;
  subCatCode: number;
  subCatName: string;
  userCode: string;
  trDate: string;
  branch_Code: string;
}) => {
  
  try {
    const token = localStorage.getItem("token");
 
    const response = await api.put(
      "/api/InventoryMaster/UpdateInventorySubCategoryMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );
 
    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating sub category:",
      error.response?.data || error.message,
    );
 
    throw error;
  }
};
 
export const deleteInventorySubCategoryMaster = async (
  id: number,
  branchcode: string,
) => {
  try {
    const token = localStorage.getItem("token");
 
    const response = await api.delete(
      "/api/InventoryMaster/DeleteInventorySubCategoryMaster",
      {
        params: { id, branchcode },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );
 
    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting sub category:",
      error.response?.data || error.message,
    );
 
    throw error;
  }
};
 
/* ===========================
      GET STORE LIST
=========================== */
 
export const getStoreMasterList = async (branch: string) => {
  
  try {
    const token = localStorage.getItem("token");
 
    const response = await api.get(
      "/api/InventoryMaster/GetInventoryStoreMasterList",
      {
        params: { branch },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );
 
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching store master list:",
      error.response?.data || error.message,
    );
 
    throw error;
  }
};
 
/* ===========================
      CREATE STORE
=========================== */
 
export const createStoreMaster = async (payload: {
  storeId: number;
  storeName: string;
  storeLocation: string;
  storeIncharge: string;
  branch_Code: string;
}) => {
  try {
    const token = localStorage.getItem("token");
 
    const response = await api.post(
      "/api/InventoryMaster/CreateInventoryStoreMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );
 
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating store:",
      error.response?.data || error.message,
    );
 
    throw error;
  }
};
 
/* ===========================
      UPDATE STORE
=========================== */
 
export const updateStoreMaster = async (payload: {
  storeId: number;
  storeName: string;
  storeLocation: string;
  storeIncharge: string;
  branch_Code: string;
}) => {
  try {
    
    const token = localStorage.getItem("token");
 
    const response = await api.put(
      "/api/InventoryMaster/UpdateInventoryStoreMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );
 
    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating store:",
      error.response?.data || error.message,
    );
 
    throw error;
  }
};
 
/* ===========================
      DELETE STORE
=========================== */
 
export const deleteStoreMaster = async (storeId: number, branch: string) => {
  
  try {
    const token = localStorage.getItem("token");
 
    const response = await api.delete(
      "/api/InventoryMaster/DeleteInventoryStoreMaster",
      {
        params: {
          storeId,
          branch,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );
 
    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting store:",
      error.response?.data || error.message,
    );
 
    throw error;
  }
};
 

export const getInventoryItemStoreList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/InventoryMaster/InventoryItemStoreGetList",
      {
        params: {
          branchcode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching inventory item store list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};


export const getItemStoreListByStoreId = async (
  branchcode: string,
  Storeid: string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/InventoryPurchase/ItemStoreGetListByStoreId",
      {
        params: {
          branchcode,
          Storeid,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching item store list:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const createInventoryItemStore = async (payload: {
  itemCode: number;
  itemName: string;
  catCode: number;
  subCatCode: number;
  storeid: string;
  grpCode: string;
  unitCode: number;
  unitName: string;
  purchaseRate: string;
  noofUnits: number;
  itemRate: number;
  itemOpStock: number;
  itemOpRate: number;
  itemROQ: number;
  itemROL: number;
  barCode: string;
  taxCode: number;
  taxName: string;
  picture: string;
  userCode: string;
  lastModify: string;
  mostRunningItemSrNo: string;
  branch_Code: string;
  firstUnit: number;
  firstUnitDesc: string;
  finalUnit: number;
  finalUnitDesc: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/InventoryMaster/InventoryItemStoreCreate",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating inventory item store:",
      error.response?.data || error.message,
    );

    throw error;
  }
};


export const updateInventoryItemStore = async (payload: {
  itemCode: number;
  itemName: string;
  catCode: number;
  subCatCode: number;
  storeid: string;
  grpCode: string;
  unitCode: number;
  unitName: string;
  purchaseRate: string;
  noofUnits: number;
  itemRate: number;
  itemOpStock: number;
  itemOpRate: number;
  itemROQ: number;
  itemROL: number;
  barCode: string;
  taxCode: number;
  taxName: string;
  picture: string;
  userCode: string;
  lastModify: string;
  mostRunningItemSrNo: string;
  branch_Code: string;
  firstUnit: number;
  firstUnitDesc: string;
  finalUnit: number;
  finalUnitDesc: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/InventoryMaster/InventoryItemStoreUpdate",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating inventory item store:",
      error.response?.data || error.message,
    );

    throw error;
  }
};


export const deleteInventoryItemStore = async (
  id: number,
  branchcode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/InventoryMaster/InventoryItemStoreDelete",
      {
        params: {
          id,
          branchcode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting inventory item store:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const getInventoryMiscList = async (branch: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/InventoryMaster/GetInventoryMiscList",
      {
        params: {
          branch,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching inventory misc list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};


export const createInventoryMisc = async (payload: {
  chargeId: number;
  chargeName: string;
  branch_Code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/InventoryMaster/CreateInventoryMisc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating inventory misc:",
      error.response?.data || error.message,
    );

    throw error;
  }
};


export const updateInventoryMisc = async (payload: {
  chargeId: number;
  chargeName: string;
  branch_Code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/InventoryMaster/UpdateInventoryMisc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating inventory misc:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
export const deleteInventoryMisc = async (
  chargeId: number,
  branch: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/InventoryMaster/DeleteInventoryMisc",
      {
        params: {
          chargeId,
          branch,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting inventory misc:",
      error.response?.data || error.message,
    );

    throw error;
  }
};


export const getInventoryGRNMiscList = async (branch: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/InventoryMaster/GetInventoryGRNMiscList",
      {
        params: {
          branch,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching Inventory GRN Misc list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};


export const createInventoryGRNMisc = async (payload: {
  grnId:number
  pno: number;
  chargeId: number;
  chargeAmt: number;
  branch_Code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/InventoryMaster/CreateInventoryGRNMisc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating Inventory GRN Misc:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateInventoryGRNMisc = async (payload: {
  grnId:number;
  pno: number;
  chargeId: number;
  chargeAmt: number;
  branch_Code: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/InventoryMaster/UpdateInventoryGRNMisc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating Inventory GRN Misc:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteInventoryGRNMisc = async (
  GRNId: number,
  branch: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/InventoryMaster/DeleteInventoryGRNMisc",
      {
        params: {
          GRNId,
          branch,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting Inventory GRN Misc:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const downloadInventoryItemStoreExcel = async (
  branchCode: string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/InventoryMaster/DownloadExcelInventoryItemMaster",
      {
        params: {
          BranchCode: branchCode,
        },

        responseType: "blob",

        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    // Create download URL
    const url = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link = document.createElement("a");

    link.href = url;

    // File name from API response
    link.setAttribute(
      "download",
      "InventoryItemImport.xlsx"
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    return true;
  } catch (error: any) {
    console.error(
      "Error downloading Inventory Item Store excel:",
      error.response?.data || error.message
    );

    throw error;
  }
};


export const uploadInventoryItemStoreExcel = async (
  file: File,
  BranchCode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
      `/api/InventoryMaster/UploadFromExcelInventoryItemMaster?BranchCode=${BranchCode}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error uploading Inventory Item Store excel:",
      error.response?.data || error.message,
    );

    throw error;
  }
};


export const importInventoryItemStoreExcel = async (
  items: any[],
  userCode: string,
  branchCode: string,
  storeids: number[],
) => {
  try {
    const token = localStorage.getItem("token");

    const payload = {
      items,
      userCode,
      branchCode,
      storeids,
    };

    const response = await api.post(
      "/api/InventoryMaster/ImportFromExcelInventoryItemMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error importing Inventory Item Store:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const purchaseOrderCalculation = async (payload: {
  poNo: number;
  storeId: number;
  branch: string;
  discount: number;
  discountIn: string;

  poDetail: {
    itemCode: number;
    poItemQty: number;
    poItemRate: number;
    unit: string;
    poItemSuplyQty: number;
    cpoItemQty: number;
  }[];

  poMiscDetail: {
    miscCharge: number;
    miscChargeCode: number;
    miscTaxCode: string;
  }[];
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/InventoryPurchase/PurchaseOrderCalculation",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error calculating purchase order:",
      error.response?.data || error.message,
    );

    throw error;
  }
};



// ================= SECOND USER ACCESS MASTER =================

export const getSecoundUserAccessMaster = async (branchCode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/UserAccess/GetSecoundUserAccessMaster",
      {
        params: {
          BranchCode: branchCode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching second user access master:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateSecoundUserAccessDetail = async (payload: {
  secoundUserId: number;
  secondUserPassword: string;
  branchCode: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/UserAccess/UpdateSecoundUserAccessDetail",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating second user access detail:",
      error.response?.data || error.message,
    );

    throw error;
  }
};


export const getAdminAccessMaster = async (branchCode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/UserAccess/GetAdminAccessMaster",
      {
        params: {
          BranchCode: branchCode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching admin access master:",
      error.response?.data || error.message
    );

    throw error;
  }
};


// ================= PURCHASE ORDER =================

export const createPurchaseOrder = async (payload: any) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/InventoryPurchase/CreatePurchaseOrder",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating purchase order:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const printPurchaseOrder = async (
  poNo: number,
  branchCode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/InventoryPurchase/PrintPurchaseOrder",
      {
        params: {
          poNo,
          branchCode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error printing purchase order:",
      error.response?.data || error.message,
    );

    throw error;
  }
};













// ================= INVENTORY UNIT CONVERSION =================

export const getInventoryUnitConversionList = async (
  branch: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/InventoryMaster/GetInventoryUnitConversionList",
      {
        params: { branch },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching inventory unit conversion list:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const createInventoryUnitConversion = async (payload: {
  
  unitCode: number;
  unitName: string;
  qty: number;
  isActive: boolean;
  branch_Code: string;
  createdBy: string;
  createdDate: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/InventoryMaster/CreateInventoryUnitConversion",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating inventory unit conversion:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateInventoryUnitConversion = async (payload: {
  
  unitCode: number;
  unitName: string;
  qty: number;
  isActive: boolean;
  branch_Code: string;
  createdBy: string;
  createdDate: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/InventoryMaster/UpdateInventoryUnitConversion",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating inventory unit conversion:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteInventoryUnitConversion = async (
  UnitCode: number,
  branch: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/InventoryMaster/DeleteInventoryUnitConversion",
      {
        params: {
          UnitCode,
          branch,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting inventory unit conversion:",
      error.response?.data || error.message,
    );

    throw error;
  }
};


export const getPurchaseOrderList = async (branchCode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/InventoryPurchase/GetPurchaseOrderList",
      {
        params: {
          branchCode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching purchase order list:",
      error.response?.data || error.message
    );

    throw error;
  }
};


export const createPurchaseOrderApproval = async (
  payload: any
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/InventoryPurchase/CreatePurchaseOrderApproval",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating purchase order approval:",
      error.response?.data || error.message
    );

    throw error;
  }
};


export const getPurchaseOrderApprovalPrint = async (
  poNo: number,
  branchCode: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/InventoryPurchase/GetPurchaseOrderApprovalPrint",
      {
        params: {
          poNo,
          branchCode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching purchase order approval print:",
      error.response?.data || error.message,
    );

    throw error;
  }
};








export const deletePurchaseOrder = async (
  poNo: number,
  branchCode: string,
  reasonDelete: string,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/InventoryPurchase/DeletePurchaseOrder",
      {
        params: {
          poNo,
          branchCode,
          reasonDelete,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting purchase order:",
      error.response?.data || error.message,
    );

    throw error;
  }
};