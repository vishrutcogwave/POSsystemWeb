import type { LoginRequest } from "../../types/types";
import api from "../axios";

export const login = async (data: LoginRequest): Promise<any> => {
  const response = await api.post<any>("/api/POS/BtnSubmitLogin", data);

  // Save token for future API calls
  localStorage.setItem("token", response.data.user.token);
    localStorage.setItem("branch", data.branch_code);

  return response.data;
};

