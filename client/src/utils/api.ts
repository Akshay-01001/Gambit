import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./constants";

interface RetryConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

const excluded_requests = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh']

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error?.config as RetryConfig
        if (error?.response?.status !== 401 || excluded_requests.includes(originalRequest.url)) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = api.get('/api/auth/refresh')
                .then(() => { })
                .catch((err) => {
                    throw err;
                })
                .finally(() => {
                    isRefreshing = false;
                    refreshPromise = null;
                })
        }

        await refreshPromise;
        return api(originalRequest);
    }
);

export default api;
