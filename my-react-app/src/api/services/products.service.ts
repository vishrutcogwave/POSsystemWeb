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
  tableno: string,
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