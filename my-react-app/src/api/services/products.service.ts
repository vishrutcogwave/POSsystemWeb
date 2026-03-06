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