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
const companyCode = Number(localStorage.getItem("company_code") ?? 0);

console.log(companyCode);
    const response = await api.get(
      "/api/POS/GetCompanyInfo",
      {
        params: { branchcode,companyCode},
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

  //   export const createItemMaster = async (payload: {
  //   itemCode: number;
  //   itemName: string;
  //   catCode: string;
  //   subCatCode: string;
  //   grpCode: string;
  //   itemDiscountAllowed: boolean;
  //   itemRate: number;
  //   userCode: string;
  //   lastModify: string;
  //   unitCode: number;
  //   unitName: string;
  //   dep: string;
  //   depCode: string;
  //   taxCode: number;
  //   taxName: string;
  //   printDepartment: string;
  //   branchCode: string;
  //   sacCode: string;
  //   thumb: string;
  //   barcode: string;
  //   isVeg: boolean;
  // }) => {
  //   try {
  //     const token = localStorage.getItem("token");

  //     const response = await api.post(
  //       "/api/Master/CreateItemMaster",
  //       payload,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //           accept: "*/*",
  //         },
  //       }
  //     );

  //     return response.data;
  //   } catch (error: any) {
  //     console.error(
  //       "Error creating item master:",
  //       error.response?.data || error.message
  //     );
  //     throw error;
  //   }
  // };

  // export const updateItemMaster = async (payload: {
  //   itemCode: number;
  //   itemName: string;
  //   catCode: string;
  //   subCatCode: string;
  //   grpCode: string;
  //   itemDiscountAllowed: boolean;
  //   itemRate: number;
  //   userCode: string;
  //   lastModify: string;
  //   unitCode: number;
  //   unitName: string;
  //   dep: string;
  //   depCode: string;
  //   taxCode: number;
  //   taxName: string;
  //   printDepartment: string;
  //   branchCode: string;
  //   sacCode: string;
  //   thumb: string;
  //   barcode: string;
  //   isVeg: boolean;
  // }) => {
  //   try {
  //     const token = localStorage.getItem("token");

  //     const response = await api.put(
  //       "/api/Master/UpdateItemMaster",
  //       payload,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //           accept: "*/*",
  //         },
  //       }
  //     );

  //     return response.data;
  //   } catch (error: any) {
  //     console.error(
  //       "Error updating item master:",
  //       error.response?.data || error.message
  //     );
  //     throw error;
  //   }
  // };

  // export const deleteItemMaster = async (
  //   id: number,
  //   branchcode: string
  // ) => {
  //   try {
  //     const token = localStorage.getItem("token");

  //     const response = await api.delete(
  //       "/api/Master/DeleteItemMaster",
  //       {
  //         params: {
  //           id,
  //           branchcode,
  //         },
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           accept: "*/*",
  //         },
  //       }
  //     );

  //     return response.data;
  //   } catch (error: any) {
  //     console.error(
  //       "Error deleting item master:",
  //       error.response?.data || error.message
  //     );
  //     throw error;
  //   }
  // };

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
  oltCodes: any[];
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
  branchcode: string,
  outlets: number[]
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

        // ✅ body data
        data: outlets,

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
      "Error deleting item master:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const downloadItemMasterExcel = async (
  branchCode: string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/Master/ItemMasterDownloadExcel",
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

    // ✅ create download url
    const url = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link = document.createElement("a");

    link.href = url;

    // ✅ file name
    link.setAttribute(
      "download",
      "ItemImport.xlsx"
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    return true;
  } catch (error: any) {
    console.error(
      "Error downloading excel:",
      error.response?.data || error.message
    );

    throw error;
  }
};

  export const uploadItemMasterExcel = async (
    file: File,
    BranchCode: string
  ) => {
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
            "Content-Type":
              "multipart/form-data",
            accept: "*/*",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error uploading excel:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };
export const importItemMasterFromExcel = async (
  items: any[],
  userCode: string,
  branchCode: string,
  oltCodes: number[]
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error importing item master:",
      error.response?.data || error.message
    );

    throw error;
  }
};
    export const createItemMasterWithImage = async (
    image: File
  ) => {
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
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error uploading image:",
        error.response?.data || error.message
      );

      throw error;
    }
  };









  export const getUnitMasterList = async (
    branchcode: string
  ) => {
    try {
      const token = localStorage.getItem("token");

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
    } catch (error: any) {
      console.error(
        "Error fetching unit master list:",
        error.response?.data || error.message
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

      const response = await api.post(
        "/api/Master/CreateUnitMaster",
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
        "Error creating unit master:",
        error.response?.data || error.message
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

      const response = await api.put(
        "/api/Master/UpdateUnitMaster",
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
        "Error updating unit master:",
        error.response?.data || error.message
      );

      throw error;
    }
  };

  export const deleteUnitMaster = async (
    id: number
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(
        "/api/Master/DeleteUnitMaster",
        {
          params: { id },
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error deleting unit master:",
        error.response?.data || error.message
      );

      throw error;
    }
  };







  export const getGroupMasterList = async (
    branchcode: string
  ) => {
    try {
      const token = localStorage.getItem("token");

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
    } catch (error: any) {
      console.error(
        "Error fetching group master list:",
        error.response?.data || error.message
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

      const response = await api.post(
        "/api/Master/CreateGroupMaster",
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
        "Error creating group master:",
        error.response?.data || error.message
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

      const response = await api.put(
        "/api/Master/UpdateGroupMaster",
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
        "Error updating group master:",
        error.response?.data || error.message
      );

      throw error;
    }
  };

  export const deleteGroupMaster = async (
    id: number
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(
        "/api/Master/DeleteGroupMaster",
        {
          params: { id },
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error deleting group master:",
        error.response?.data || error.message
      );

      throw error;
    }
  };










  export const getCategoryMasterList = async (
    branchcode: string
  ) => {
    try {
      const token = localStorage.getItem("token");

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
    } catch (error: any) {
      console.error(
        "Error fetching category master list:",
        error.response?.data || error.message
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
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error creating category master:",
        error.response?.data || error.message
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
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error updating category master:",
        error.response?.data || error.message
      );

      throw error;
    }
  };

  export const deleteCategoryMaster = async (
    id: number
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(
        "/api/Master/DeleteCategoryMaster",
        {
          params: { id },
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error deleting category master:",
        error.response?.data || error.message
      );

      throw error;
    }
  };











  export const getSubCategoryMasterList =
    async (branchcode: string) => {
      try {
        const token =
          localStorage.getItem("token");

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
      } catch (error: any) {
        console.error(
          "Error fetching sub category list:",
          error.response?.data ||
            error.message
        );

        throw error;
      }
    };

  export const createSubCategoryMaster =
    async (payload: {
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
        const token =
          localStorage.getItem("token");

        const response = await api.post(
          "/api/Master/CreateSubCategoryMaster",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
              accept: "*/*",
            },
          }
        );

        return response.data;
      } catch (error: any) {
        console.error(
          "Error creating sub category:",
          error.response?.data ||
            error.message
        );

        throw error;
      }
    };

  export const updateSubCategoryMaster =
    async (payload: {
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
        const token =
          localStorage.getItem("token");

        const response = await api.put(
          "/api/Master/UpdateSubCategoryMaster",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
              accept: "*/*",
            },
          }
        );

        return response.data;
      } catch (error: any) {
        console.error(
          "Error updating sub category:",
          error.response?.data ||
            error.message
        );

        throw error;
      }
    };

  export const deleteSubCategoryMaster =
    async (id: number) => {
      try {
        const token =
          localStorage.getItem("token");

        const response = await api.delete(
          "/api/Master/DeleteSubCategoryMaster",
          {
            params: { id },
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "*/*",
            },
          }
        );

        return response.data;
      } catch (error: any) {
        console.error(
          "Error deleting sub category:",
          error.response?.data ||
            error.message
        );

        throw error;
      }
    };







    export const getStewardMasterList = async (
    branchcode: string
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(
        "/api/Master/GetStewardMasterList",
        {
          params: { branchcode },
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching steward master list:",
        error.response?.data || error.message
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
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error creating steward master:",
        error.response?.data || error.message
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

      const response = await api.put(
        "/api/Master/UpdateStewardMaster",
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
        "Error updating steward master:",
        error.response?.data || error.message
      );

      throw error;
    }
  };

  export const deleteStewardMaster = async (
    id: number,
    branchcode: string
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(
        "/api/Master/DeleteStewardMaster",
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
        "Error deleting steward master:",
        error.response?.data || error.message
      );

      throw error;
    }
  };












  export const getNCDepartmentMasterList =
    async (branchcode: string) => {
      try {
        const token =
          localStorage.getItem("token");

        const response = await api.get(
          "/api/Master/GetNCDepartmentMasterList",
          {
            params: { branchcode },

            headers: {
              Authorization: `Bearer ${token}`,
              accept: "*/*",
            },
          }
        );

        return response.data;
      } catch (error: any) {
        console.error(
          "Error fetching NC Department list:",
          error.response?.data ||
            error.message
        );

        throw error;
      }
    };

  export const createNCDepartmentMaster =
    async (payload: {
      ncDepCode: number;
      ncDepName: string;
      userid: string;
      lastModify: string;
      branch_Code: string;
    }) => {
      try {
        const token =
          localStorage.getItem("token");

        const response = await api.post(
          "/api/Master/CreateNCDepartmentMaster",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",

              accept: "*/*",
            },
          }
        );

        return response.data;
      } catch (error: any) {
        console.error(
          "Error creating NC Department:",
          error.response?.data ||
            error.message
        );

        throw error;
      }
    };

  export const updateNCDepartmentMaster =
    async (payload: {
      ncDepCode: number;
      ncDepName: string;
      userid: string;
      lastModify: string;
      branch_Code: string;
    }) => {
      try {
        const token =
          localStorage.getItem("token");

        const response = await api.put(
          "/api/Master/UpdateNCDepartmentMaster",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",

              accept: "*/*",
            },
          }
        );

        return response.data;
      } catch (error: any) {
        console.error(
          "Error updating NC Department:",
          error.response?.data ||
            error.message
        );

        throw error;
      }
    };

  export const deleteNCDepartmentMaster =
    async (
      id: number,
      branchcode: string
    ) => {
      try {
        const token =
          localStorage.getItem("token");

        const response = await api.delete(
          "/api/Master/DeleteNCDepartmentMaster",
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
          "Error deleting NC Department:",
          error.response?.data ||
            error.message
        );

        throw error;
      }
    };













    export const getPrintingMasterList =
  async (branchcode: string) => {
    try {
      const token =
        localStorage.getItem("token");

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
    } catch (error: any) {
      console.error(
        "Error fetching printing master list:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };

export const createPrintingMaster =
  async (payload: {
    depCode: number;
    depName: string;
    userCode: string;
    lastModify: string;
    branch_Code: string;
    isUploaded: string;
  }) => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await api.post(
        "/api/Master/CreatePrintingMaster",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",

            accept: "*/*",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error creating printing master:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };

export const updatePrintingMaster =
  async (payload: {
    depCode: number;
    depName: string;
    userCode: string;
    lastModify: string;
    branch_Code: string;
    isUploaded: string;
  }) => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await api.put(
        "/api/Master/UpdatePrintingMaster",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",

            accept: "*/*",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error updating printing master:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };

export const deletePrintingMaster =
  async (
    id: number,
    branchcode: string
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await api.delete(
        "/api/Master/DeletePrintingMaster",
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
        "Error deleting printing master:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };









  export const getTableMasterList = async (
  branchcode: string
) => {
  try {
    const token =
      localStorage.getItem("token");

    const response = await api.get(
      "/api/Master/GetTableMasterList",
      {
        params: { branchcode },

        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching table master list:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
};

export const createTableMaster = async (
  payload: {
    tblCode: number;
    oltCode: string;
    tblNo: string;
    tblSeatCount: number;
    userCode: string;
    lastModify: string;
    poscode: string;
    branch_Code: string;
  }
) => {
  try {
    const token =
      localStorage.getItem("token");

    const response = await api.post(
      "/api/Master/CreateTableMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":
            "application/json",
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating table master:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
};

export const updateTableMaster = async (
  payload: {
    tblCode: number;
    oltCode: string;
    tblNo: string;
    tblSeatCount: number;
    userCode: string;
    lastModify: string;
    poscode: string;
    branch_Code: string;
  }
) => {
  try {
    const token =
      localStorage.getItem("token");

    const response = await api.put(
      "/api/Master/UpdateTableMaster",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":
            "application/json",
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating table master:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
};

export const deleteTableMaster = async (
  id: number
) => {
  try {
    const token =
      localStorage.getItem("token");

    const response = await api.delete(
      "/api/Master/DeleteTableMaster",
      {
        params: { id },

        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting table master:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
};




// ================= PROPERTY DETAILS MASTER =================

export const getPropertyDetailsList = async (
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/Master/GetPropertyDetailsList",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching property details list:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const createPropertyDetailsMaster = async (
  payload: {
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
  }
) => {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating property details:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const updatePropertyDetailsMaster = async (
  payload: {
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
  }
) => {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating property details:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const deletePropertyDetailsMaster = async (
  id: number,
) => {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting property details:",
      error.response?.data || error.message
    );

    throw error;
  }
};


// ================= BRANCH DETAILS MASTER =================

export const getBranchDetailsList = async (
  propertyid: number
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/Master/GetBranchDetailsList",
      {
        params: { propertyid },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching branch details:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const createBranchDetailsMaster = async (
  payload: {
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
  }
) => {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating branch details:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const updateBranchDetailsMaster = async (
  payload: {
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
  }
) => {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating branch details:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const deleteBranchDetailsMaster = async (
  id: number,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/Master/DeleteBranchDetailsMaster",
      {
        params: {
          id,
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
      "Error deleting branch details:",
      error.response?.data || error.message
    );

    throw error;
  }
};




// ================= USER ACCESS MASTER =================

export const getUserDetailsList = async (
  branchcode: string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/UserAccess/GetUserDetailsList",
      {
        params: { branchcode },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching user details list:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const createUserDetailsMaster = async (
  payload: {
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
  }
) => {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating user details:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const updateUserDetailsMaster = async (
  payload: {
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
  }
) => {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating user details:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const deleteUserDetailsMaster = async (
  id: number,
  branchcode: string
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error deleting user details:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ================= ROLE MASTER =================

export const getRoleMasterList = async (
  branchcode: string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/UserAccess/GetRoleMasterList",
      {
        params: { branchcode },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching role master list:",
      error.response?.data || error.message
    );

    throw error;
  }
};




// ================= USER PERMISSION ACCESS =================

export const getUserPermissionAccessList = async (
  branchcode: string,
  usercode: number,
  roleId:number
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/UserAccess/GetUserPermissionAccessList",
      {
        params: {
          branchcode,
          usercode,
          roleId
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
      "Error fetching user permission access list:",
      error.response?.data || error.message
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
  }[]
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error inserting user permission access:",
      error.response?.data || error.message
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

    const response = await api.get(
      "/api/POSReports/KotCancellation",
      {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching KOT cancellation report:",
      error.response?.data || error.message
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

    const response = await api.get(
      "/api/POSReports/BillCancellation",
      {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching Bill cancellation report:",
      error.response?.data ||
        error.message
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

    const response = await api.get(
      "/api/POSReports/DailysaleCategorywise",
      {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching Daily Sale Category Wise report:",
      error.response?.data ||
        error.message
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

    const response = await api.get(
      "/api/POSReports/KotRegister",
      {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching KOT register report:",
      error.response?.data || error.message
    );

    throw error;
  }
};
















// ================= HAPPY HOURS SETTINGS =================

export const getHappyHoursSettings = async (
  branchcode: string
) => {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching happy hours settings:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const saveOrUpdateHappyHoursSettings =
  async (payload: {
    inOrExOfTax: boolean;
    happyHours: boolean;

    hhFrom:string;

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
            "Content-Type":
              "application/json",
            accept: "*/*",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error saving happy hours settings:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };



  // ================= KOT TIMER SETTINGS =================

export const getKOTTimerSettings = async (
  branchcode: string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/UtilitySetting/GetKOTTimerSettings",
      {
        params: { branchcode },

        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching KOT timer settings:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const saveOrUpdateKOTTimerSettings =
  async (payload: {
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
            "Content-Type":
              "application/json",
            accept: "*/*",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error saving KOT timer settings:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };


  // ================= PHONEPE DQR PAYMENT =================

export const sendPaymentRequestDQRDevice = async (
  amount: number,
  transNo: string
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error sending payment request:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const getPaymentStatusRequestDQRDevice = async (
  transNo: string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      `/api/PhonePeDQRDevice/PaymentStatusRequestDQRDevice/${transNo}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error getting payment status:",
      error.response?.data || error.message
    );

    throw error;
  }
};



// ================= FINANCIAL SETTINGS =================

export const getFinancialSettings = async (
  branchcode: string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/UtilitySetting/GetFinancialSettings",
      {
        params: { branchcode },

        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching financial settings:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const saveOrUpdateFinancialSettings = async (
  payload: {
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
  }
) => {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving financial settings:",
      error.response?.data || error.message
    );

    throw error;
  }
};







// ================= TAX MODE SETTINGS =================

export const getTaxModeSettings = async (
  branchcode: string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/UtilitySetting/GetTaxModeSettings",
      {
        params: { branchcode },

        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching tax mode settings:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const updateTaxModeSettings = async (
  payload: {
    taxId: number;
    taxRequired: boolean;
    taxType: string;
    branchCode: string;
  }
) => {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating tax mode settings:",
      error.response?.data || error.message
    );

    throw error;
  }
};



// ================= DISCOUNT MODE SETTINGS =================

export const getDiscountModeSettings =
  async (branchcode: string) => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await api.get(
        "/api/UtilitySetting/GetDiscountModeSettings",
        {
          params: { branchcode },

          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching discount mode settings:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };

export const updateDiscountModeSettings =
  async (payload: {
    discId: number;
    discountRequired: boolean;
    discountType: string;
    branchCode: string;
  }) => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await api.post(
        "/api/UtilitySetting/UpdateDiscountModeSettings",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
            accept: "*/*",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error updating discount mode settings:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };









  // ================= SMS SENDER SETTINGS =================

export const getSMSSenderSettings =
  async (branchcode: string) => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await api.get(
        "/api/UtilitySetting/GetSMSSenderSettings",
        {
          params: { branchcode },

          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching SMS sender settings:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };

export const saveOrUpdateSMSSenderSettings =
  async (payload: {
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
      const token =
        localStorage.getItem("token");

      const response = await api.post(
        "/api/UtilitySetting/SaveOrUpdateSMSSenderSettings",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
            accept: "*/*",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Error saving SMS sender settings:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };









  // ================= BILL DETAILS =================

export const getBillDetails = async (
  OutletCode: number,
  BranchCode: string,
  FromDate: string,
  ToDate: string
) => {
  try {
    const token =
      localStorage.getItem("token");

    const response = await api.get(
      "/api/POS/GetBillDetails",
      {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching bill details:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
};

// ================= CANCEL BILL =================

export const cancelBill = async (
  payload: {
    outlet: number;
    billNo: number;
    branch: string;
    billDate: string;
    userId: number;
    reason: string;
  }
) => {
  try {
    const token =
      localStorage.getItem("token");

    const response = await api.post(
      "/api/POS/CancelBill",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":
            "application/json",
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error cancelling bill:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
};


export const getItemWiseAddOnDetailsList = async (
  BranchCode: string,
  Itemcode: number
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/Master/GetItemWiseAddOnDetailsList",
      {
        params: {
          BranchCode,
          Itemcode,
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
      "Error fetching item wise add-on details:",
      error.response?.data || error.message
    );

    throw error;
  }
};



// ================= ADDON DETAILS =================

export const getAdditionalAddonDetailsList = async (
  Itemcode: number,
  BranchCode: string
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching addon details:",
      error.response?.data || error.message
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
  }[]
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving addon details:",
      error.response?.data || error.message
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving menu/submenu:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const getMainMenuList = async (branchcode: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/UserAccess/GetMainMenuList",
      {
        params: { branchcode },
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching main menu list:",
      error.response?.data || error.message
    );

    throw error;
  }
};


export const deleteMainMenuDetail = async (
  mainMenuId: number,
  branchcode: string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/UserAccess/DeleteMainMenuDetail",
      {
        params: {
          MainMenuId: mainMenuId,
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
      "Error deleting main menu:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const deleteSubMenuDetail = async (
  subMenuId: number,
  branchcode: string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      "/api/UserAccess/DeleteSubMenuDetail",
      {
        params: {
          SubMenuId: subMenuId,
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
      "Error deleting submenu:",
      error.response?.data || error.message
    );

    throw error;
  }
};





export interface SettlementBillModifyRequest {
  branch: string;
  userCode: number;
  companyCode: number;
  companyName: string;
  guestCode: number;
  guestName: string;
  checkInNo: string;
  remarks: string;
  outletCode: number;
  outletName: string;
  roomNo: string;
  subBillingType: string;
  payMode: string;
  bill: {
    oltCode: number;
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
    paymentDetails: {
      mode: string;
      subMode: string;
      amount: number;
      remarks: string;
    }[];
  };
}

export const settlementBillModify = async (
  payload: SettlementBillModifyRequest
) => {
  const response = await api.post(
    "/api/POS/SettlementBillModify",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
    }
  );

  return response.data;
};

export const getCompanyTransferBills = async (
  companyCode: number,
  branchCode: string
) => {
  const response = await api.get(
    "/api/POS/GetcompanyTransferbills",
    {
      params: {
        companyCode,
        branchCode,
      },
      headers: {
        accept: "*/*",
      },
    }
  );

  return response.data;
};


export const getChargesDetails = async (
  branchCode: string
) => {
  try {
    const token =
      localStorage.getItem("token");

    const response = await api.get(
      "/api/POS/GetChargesDetails",
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
      "Error fetching charges details:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
};



export const saveCompanyBillSettlement = async (
  payload: {

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
  }
) => {
  try {

    const token =
      localStorage.getItem(
        "token"
      );

    const response =
      await api.post(
        "/api/POS/SaveCompanyBillSettlement",

        payload,

        {
          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",

            accept: "*/*",
          },
        }
      );

    return response.data;

  } catch (error: any) {

    console.error(
      "Error saving company bill settlement:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
};





export const sendPaymentRequestOwnDevice = async (
  amount: number,
  transno: string
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error sending payment request:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const checkOwnDevicePaymentStatus = async (
  transno: string
) => {
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
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error checking payment status:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const getModifyBillData = async (
  KOTId: number | string,
  oltcode: number | string
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      "/api/POS/GetModifyBillData",
      {
        params: {
          KOTId,
          oltcode,
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
      "Error fetching modify bill data:",
      error.response?.data || error.message
    );
    throw error;
  }
};