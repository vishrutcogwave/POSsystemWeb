import type { LoginRequest, LoginResponse } from "../../types/types";
import api from "../axios";


export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", data);

  // Save token for future API calls
  localStorage.setItem("token", response.data.token);

  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem("token");
};