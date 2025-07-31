import { DataProvider } from "react-admin";
import { springDataProvider } from "./springDataProvider";
import { httpClient } from "./httpClient";

const apiUrl = import.meta.env.VITE_API_URL;

function addQueryParams(url: string, params: Record<string, any>) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, value.toString());
  });
  return `${url}?${queryParams.toString()}`;
}

export interface DashboardDataProvider extends DataProvider {
  dashboardStats: <T>(resource: string) => Promise<{ data: T }>;
  revenueChart: <T>(
    resource: string,
    params: Partial<{
      pagination: any;
      sort: any;
      filter: any;
    }>,
  ) => Promise<{ data: T }>;
  usersChart: <T>(resource: string) => Promise<{ data: T }>;
}

export const dashboardDataProvider: DataProvider & DashboardDataProvider = {
  ...springDataProvider,
  dashboardStats: async <T>() => {
    const response = await httpClient(`${apiUrl}/v1/test/dashboardStats`, {
      method: "GET",
    });
    return Promise.resolve({ data: response.json as T });
  },
  revenueChart: async <T>(
    _resource: string,
    params: Partial<{
      pagination: any;
      sort: any;
      filter: any;
    }>,
  ) => {
    const response = await httpClient(
      addQueryParams(`${apiUrl}/v1/test/revenueChart`, params),
      {
        method: "GET",
      },
    );
    return Promise.resolve({ data: response.json as T });
  },
  usersChart: async <T>() => {
    const { json } = await httpClient(`${apiUrl}/v1/test/usersChart`, {
      method: "GET",
    });
    return Promise.resolve({ data: json as T });
  },
};
