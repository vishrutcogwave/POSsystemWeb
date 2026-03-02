import type { User } from "../../types/user.types";
import api from "../axios";


export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>("/users");
  return response.data;
};
