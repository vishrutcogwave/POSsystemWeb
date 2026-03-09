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

export const getCombinedOltItemList = async (oltCode: string, branchCode: string) => {
  const response = await api.get("/api/POS/GetCombinedOltItemList", {
    params: { oltcode: oltCode, branchcode: branchCode },
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