import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/lib/api/routes";
import type { ApiError } from "@/lib/api/types";
import { clearStoredSession, getAccessToken } from "@/lib/auth/session";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      clearStoredSession();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-expired"));
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export function normalizeApiError(error: AxiosError<ApiError>): ApiError {
  return {
    message:
      error.response?.data?.message ?? error.message ?? "Something went wrong.",
    status: error.response?.status,
    code: error.code,
  };
}