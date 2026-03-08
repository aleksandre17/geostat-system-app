import { DataProvider } from "react-admin";
import { httpClient } from "./httpClient";

const apiUrl = "http://localhost:8081/api";

export const userDataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const { field, order } = params.sort || { field: "id", order: "ASC" };
    const query = new URLSearchParams({
      _page: page.toString(),
      _limit: perPage.toString(),
      _sort: field,
      _order: order,
      ...params.filter,
    }).toString();
    const url = `${apiUrl}/v1/${resource}?${query}`;
    const { json } = await httpClient(url, { method: "GET" });
    return {
      data: json,
      total: json.length, // Note: Backend should return total count for proper pagination
    };
  },

  getOne: async (resource, params) => {
    const url = `${apiUrl}/v1/${resource}/${params.id}`;
    const { json } = await httpClient(url, { method: "GET" });
    if (resource === "roles") {
      // Transform permissions to array of IDs for ReferenceArrayInput
      return {
        data: {
          ...json,
          permissions: json.permissions
            ? json.permissions.map((perm: any) => perm.id)
            : [],
        },
      };
    } else if (resource === "users") {
      // Transform permissions to array of IDs for ReferenceArrayInput
      return {
        data: {
          ...json,
          roles: json.roles
            ? json.roles.map((perm: any) => perm.id)
            : [],
        },
      };
    }
    return { data: json };
  },

  getMany: async (resource, params) => {
    const query = new URLSearchParams({
      id: params.ids.join(","),
    }).toString();
    console.log(`getMany Fetching many reference from: ${query}`);
    const url = `${apiUrl}/v1/${resource}?${query}`;
    const { json } = await httpClient(url, { method: "GET" });
    return { data: json };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const { field, order } = params.sort || { field: "id", order: "ASC" };
    const query = new URLSearchParams({
      _page: page.toString(),
      _limit: perPage.toString(),
      _sort: field,
      _order: order,
      [params.target]: params.id,
      ...params.filter,
    }).toString();
    const url = `${apiUrl}/v1/${resource}?${query}`;
    console.log(`getManyReference Fetching many reference from: ${params}`);
    const { json } = await httpClient(url, { method: "GET" });
    return {
      data: json,
      total: json.length, // Adjust if backend provides total
    };
  },

  create: async (resource, params) => {
    const url = `${apiUrl}/v1/${resource}`;
    const body = JSON.stringify({
      ...params.data,
      roles: params.data.roles
        ? params.data.roles.map((role: any) => ({
            id: role.id,
            name: role.name,
          }))
        : [],
      permissions: params.data.permissions
        ? params.data.permissions.map((perm: any) => ({
            id: perm.id,
            name: perm.name,
          }))
        : [],
    });
    const { json } = await httpClient(url, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" }
    });
    return { data: json };
  },

  update: async (resource, params) => {
    const url = `${apiUrl}/v1/${resource}/${params.id}`;
    const body = JSON.stringify({
      ...params.data,
      roles: params.data.roles
        ? params.data.roles.map((role: any) => ({
            id: role.id,
            name: role.name,
          }))
        : [],
      permissions: params.data.permissions
        ? params.data.permissions.map((perm: any) => ({
            id: perm.id,
            name: perm.name,
          }))
        : [],
    });
    const { json } = await httpClient(url, {
      method: "PUT",
      body,
      headers: { "Content-Type": "application/json" }
    });
    return { data: json };
  },

  updateMany: async (resource, params) => {
    const promises = params.ids.map(async (id) => {
      const url = `${apiUrl}/v1/${resource}/${id}`;
      const body = JSON.stringify({
        ...params.data,
        roles: params.data.roles
          ? params.data.roles.map((role: any) => ({
              id: role.id,
              name: role.name,
            }))
          : [],
        permissions: params.data.permissions
          ? params.data.permissions.map((perm: any) => ({
              id: perm.id,
              name: perm.name,
            }))
          : [],
      });
      const { json } = await httpClient(url, { method: "PUT", body,  headers: { "Content-Type": "application/json" } });
      return json;
    });
    const results = await Promise.all(promises);
    return { data: results.map((item) => item.id) };
  },

  delete: async (resource, params) => {
    const url = `${apiUrl}/v1/${resource}/${params.id}`;
    await httpClient(url, { method: "DELETE",  headers: { "Content-Type": "application/json" } });
    return { data: params.previousData! };
  },

  deleteMany: async (resource, params) => {
    const promises = params.ids.map(async (id) => {
      const url = `${apiUrl}/v1/${resource}/${id}`;
      await httpClient(url, { method: "DELETE",  headers: { "Content-Type": "application/json" } });
      return id;
    });
    const results = await Promise.all(promises);
    return { data: results };
  },
};
