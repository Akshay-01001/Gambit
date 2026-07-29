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

export const loginUser = <T>(url: string, data: object): Promise<AxiosResponse<ApiResponse<T>>> => {
	return api.post(url, data);
}

export const googleLogin = <T>(url: string, data: object): Promise<AxiosResponse<ApiResponse<T>>> => {
	return api.post(url, data);
}

export const registerUser = <T>(url: string, data: object): Promise<AxiosResponse<ApiResponse<T>>> => {
	return api.post(url, data);
}
