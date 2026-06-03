import axios, { type AxiosInstance } from "axios";

export function createApiClient(baseURL: string, token?: string): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: Number(process.env.API_GATEWAY_TIMEOUT_MS ?? 15_000),
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export const apiClient = createApiClient(
  process.env.API_GATEWAY_URL ?? "http://localhost:8080",
);
