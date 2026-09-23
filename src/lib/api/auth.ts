import { apiClient } from "@/lib/api/client/axios";
import { apiRoutes } from "@/lib/api/routes";
import type { LoginCredentials, LoginResponse } from "@/lib/auth/types";

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(apiRoutes.login, credentials);
  return response.data;
}