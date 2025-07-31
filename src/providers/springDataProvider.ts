import { DataProvider } from "react-admin";
//import { fetchUtils } from "react-admin";
import { httpClient } from "./httpClient";

const apiUrl = import.meta.env.VITE_API_URL;
//const httpClient = fetchUtils.fetchJson;

export const springDataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination!;
    const { field, order } = params.sort!;

    // Adjust the URL based on your Spring Boot API structure
    const url = `${apiUrl}/${resource}?page=${page - 1}&size=${perPage}&sort=${field},${order.toLowerCase()}`;

    const { json } = await httpClient(url);

    return {
      data: json.content,
      total: parseInt(json.totalElements || 0),
    };
  },

  getOne: async (resource, params) => {
    const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`);
    return { data: json };
  },

  getMany: async (resource, params) => {
    const query = `id=${params.ids.join(",")}`;
    const url = `${apiUrl}/${resource}?${query}`;
    const { json } = await httpClient(url);
    return { data: json };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    const url = `${apiUrl}/${resource}?page=${page - 1}&size=${perPage}&sort=${field},${order.toLowerCase()}&${params.target}=${params.id}`;

    const { json } = await httpClient(url);
    return {
      data: json.content,
      total: parseInt(json.totalElements || 0),
    };
  },

  create: async (resource, params) => {
    const { json } = await httpClient(`${apiUrl}/${resource}`, {
      method: "POST",
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  update: async (resource, params) => {
    const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  updateMany: async (resource, params) => {
    const responses = await Promise.all(
      params.ids.map((id) =>
        httpClient(`${apiUrl}/${resource}/${id}`, {
          method: "PUT",
          body: JSON.stringify(params.data),
        }),
      ),
    );
    return { data: responses.map(({ json }) => json.id) };
  },

  delete: async (resource, params) => {
    await httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "DELETE",
    });
    return { data: params.previousData! };
  },

  deleteMany: async (resource, params) => {
    await Promise.all(
      params.ids.map((id) =>
        httpClient(`${apiUrl}/${resource}/${id}`, {
          method: "DELETE",
        }),
      ),
    );
    return { data: params.ids };
  },
};
