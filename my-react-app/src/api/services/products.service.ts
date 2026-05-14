import api from "../axios";
  const token = localStorage.getItem("token");

export const getBranchesByUser = async (username: string) => {
  const response = await api.get("/api/POS/GetBranchesByUser", {
    params: { username },
  });

  return response.data;
};
export const getCombinedOutletAndTableMasterList = async (branchcode: string) => {

  const response = await api.get(
    "/api/POS/GetCombinedOutletandtablemasterList",
    {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  

  return response.data;
};

export const getStewardList = async (branchcode: string) => {
  const response = await api.get(
    "/api/POS/GetStewardList",
    {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


export const getItemCategoryList = async (branchcode: string) => {
  const response = await api.get(
    "/api/POS/GetItemCategoryList",
    {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getCombinedOltItemList = async (oltCode: string, branchCode: string, grpCode: number) => {
  const response = await api.get("/api/POS/GetCombinedOltItemList", {
    params: { oltcode: oltCode, branchcode: branchCode ,grpcode:grpCode },
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
    console.error("Error creating order:", error.response?.data || error.message);
    throw error;
  }
};

export const getSubTables = async (outlet: string, tableno: string) => {
  const response = await api.get(
    "/api/POS/getsubtables",
    {
      params: {
        outlet,
        tableno,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getOldCart = async (
  tableno: string | null,
  outlet: string,
  subtable: string
) => {
  const response = await api.get("/api/POS/GetOldCart", {
    params: {
      tableno,
      outlet,
      subtable,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getNCKOT = async () => {
  const response = await api.get(
    "/api/POS/getnckot",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

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
    const response = await api.post(
      "/api/POS/GetBill",
      billData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching bill:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const postBill = async (billData: any) => {
  try {
    const response = await api.post(
      "/api/POS/Postbill",
      billData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching bill:",
      error.response?.data || error.message
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

  const response = await api.get(
    "/api/POS/GetCompanyInfo",
    {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getFastfoodDetails = async (
  outlet: string,
  branchcode: string
) => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "/api/POS/GetFastfoodDetails",
    {
      params: { outlet, branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


export const getItemGroupList = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "/api/POS/GetItemGroupList",
    {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getDailySalesReport = async (
  fromdate: string,
  todate: string,
  outlet: number | string
) => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "/api/POSReports/Dailysales",
    {
      params: {
        fromdate,
        todate,
        outlet,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};




export const getChanceSheetReport = async (
  fromdate: string,
  todate: string,
  outlet: number | string
) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/POSReports/Chancesheet", {
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


export const getVoidKOTReport = async (
  fromdate: string,
  todate: string,
  outlet: number | string
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
  outlet: number | string
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
  outlet: string | number
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
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getPaymentModeMaster = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "/api/POS/GetPaymentModeMaster",
    {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


export const getUnbillDetails = async (
  billno: number,
  tblno: string,
  outlet: string | number,
  branchcode: string
) => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "/api/POS/GetUnbillDetails",
    {
      params: {
        billno,
        tblno,
        outlet,
        branchcode,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const settleBill = async (payload: any) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/POS/SettleBill",   // ✅ your endpoint
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error settling bill:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getDiscountModeMaster = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "/api/POS/GetDiscountModeMaster",
    {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getKotTransferType = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "/api/POS/GetKotTransfertype",
    {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

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

    const response = await api.post(
      "/api/POS/Kottransfertable",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error in KOT transfer:",
      error.response?.data || error.message
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

    const response = await api.post(
      "/api/POS/kot2nckot",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error in KOT → NC KOT:",
      error.response?.data || error.message
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

    const response = await api.get(
      "/api/POS/GetFilteredBillDetails",
      {
        params: {
          fromDate: params.fromDate,
          toDate: params.toDate,
          branchCode: params.branchCode,
          outlet: params.outlet,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching filtered bill details:",
      error.response?.data || error.message
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


export const getOpenDayDetails = async (userid: number | string) => {
  const response = await api.post(
    "/api/KOT/GetOpenDayDetais",
    null,
    {
      params: { userid }, // ✅ IMPORTANT FIX
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return response.data;
};

export const dayClose = async (payload: {
  userId: number;
  systemTime: string;
  posEntryDate: string;
  branchCode: string;
}) => {
  try {
    const response = await api.post(
      "/api/KOT/Dayclose",
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error in Day Close:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const dayOpen = async (payload: {
  userId: number;
  systemTime: string;
  systemDate: string;
}) => {
  try {
    const response = await api.post(
      "/api/KOT/Dayopen",
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error in Day Open:",
      error.response?.data || error.message
    );
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

  const response = await api.get(
    "/api/Master/GetFindnextnumber",
    {
      params: {
        table_name: tableName,
        column_name: columnName,
        condition_name: conditionName,
        branch,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

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

    const response = await api.post(
      "/api/Master/CreateCompany",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating company:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getCompanyList = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "/api/Master/GetCompanieslist",
    {
      params: { branchcode }, // ✅ dynamic
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

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

    const response = await api.put(
      "/api/Master/UpdateCompany",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating company:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const deleteCompany = async (id: number) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/Master/DeleteCompany",
      {
        params: { id }, // ✅ query param
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting company:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getTaxMasterList = async (branchcode: string) => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "/api/Master/GetTaxMasterlist",
    {
      params: { branchcode },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

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

    const response = await api.post(
      "/api/Master/CreateTaxMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating tax:",
      error.response?.data || error.message
    );
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating tax:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteTaxMaster = async (id: number) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/Master/DeleteTaxMaster",
      {
        params: { id }, // 🔥 query param
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting tax:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getTaxDescriptionList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/Master/GetTaxDescriptionlist",
      {
        params: { branchcode },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching tax description list:",
      error.response?.data || error.message
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating tax description:",
      error.response?.data || error.message
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating tax description:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteTaxDescription = async (id: number) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/Master/DeleteTaxDescription",
      {
        params: { id }, // ✅ query param
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting tax description:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const getDepartmentList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/Master/GetDepartmentList",
      {
        params: { branchcode }, // 👈 same as ?branchcode=DEROY
        headers: {
          Authorization: `Bearer ${token}`, // remove if not required
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching department list:",
      error.response?.data || error.message
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

    const response = await api.post(
      "/api/Master/CreateDepartment",
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
      "Error creating department:",
      error.response?.data || error.message
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

    const response = await api.put(
      "/api/Master/UpdateDepartment",
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
      "Error updating department:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteDepartment = async (id: number) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/Master/DeleteDepartment",
      {
        params: { id }, // 👈 ?id=6
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting department:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const getOutletList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/Master/GetOutletList",
      {
        params: { branchcode }, // 👈 same as ?branchcode=DEROY
        headers: {
          Authorization: `Bearer ${token}`, // remove if not needed
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching outlet list:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const createOutlet = async (payload: any) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/Master/CreateOutlet",
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
      "Error creating outlet:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateOutlet = async (payload: any) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/Master/UpdateOutlet",
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
      "Error updating outlet:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteOutlet = async (id: number) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/Master/DeleteOutlet",
      {
        params: { id }, // 👉 this creates ?id=89
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting outlet:",
      error.response?.data || error.message
    );
    throw error;
  }
};  export const getOutletItemList = async (
  branchcode: string,
  oltcode: number,
  isavaliable: boolean
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/Master/GetOutletItemList",
      {
        params: {
          branchcode,
          oltcode,
          isavaliable,
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
      "Error fetching outlet item list:",
      error.response?.data || error.message
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

    const response = await api.post(
      "/api/Master/bulkincrement",
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
      "Error in bulk increment:",
      error.response?.data || error.message
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating outlet item master:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getItemMasterList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/Master/GetItemMasterList",
      {
        params: { branchcode },
        headers: {
          Authorization: `Bearer ${token}`, // remove if API doesn't need token
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching item master list:",
      error.response?.data || error.message
    );
    throw error;
  }
};



  export const GetCategoryMasterList = async (branchcode: string) => {
    const response = await api.get(
      "/api/Master/GetCategoryMasterList",
      {
        params: { branchcode },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  };


  export const GetSubCategoryMasterList = async (branchcode: string) => {
    const response = await api.get(
      "/api/Master/GetSubCategoryMasterList",
      {
        params: { branchcode },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  };

    export const GetGroupMasterList = async (branchcode: string) => {
    const response = await api.get(
      "/api/Master/GetGroupMasterList",
      {
        params: { branchcode },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  };

     export const GetUnitMasterList = async (branchcode: string) => {
    const response = await api.get(
      "/api/Master/GetUnitMasterList",
      {
        params: { branchcode },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  };

     export const GetPrintingMasterList = async (branchcode: string) => {
    const response = await api.get(
      "/api/Master/GetPrintingMasterList",
      {
        params: { branchcode },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

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
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
      "/api/Master/CreateItemMaster",
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
      "Error creating item master:",
      error.response?.data || error.message
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
}) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      "/api/Master/UpdateItemMaster",
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
      "Error updating item master:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteItemMaster = async (
  id: number,
  branchcode: string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/Master/DeleteItemMaster",
      {
        params: {
          id,
          branchcode,
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
      "Error deleting item master:",
      error.response?.data || error.message
    );
    throw error;
  }
};