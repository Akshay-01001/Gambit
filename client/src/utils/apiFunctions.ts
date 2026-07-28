import type { AxiosResponse } from "axios";
import api from "./api";

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}

export const getUserDetails = <T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.get<ApiResponse<T>>(url);
}
