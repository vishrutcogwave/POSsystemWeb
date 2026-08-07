import type { LoginRequest } from "../../types/types";
import api from "../axios";
export const login = async (data: LoginRequest): Promise<any> => {
  const response = await api.post("/api/POS/BtnSubmitLogin", data);

  console.log("Login API Response:", response.data);

  localStorage.setItem(
    "token",
    response.data.data.user.token
  );

  localStorage.setItem("branch", data.branch_code);

  return response.data;
};