import { DataProvider } from "react-admin";
import { httpClient } from "./httpClient";

const apiUrl = "http://localhost:8081/api";

export const pagesDataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 1000 };
    const { field, order } = params.sort || {
      field: "orderIndex",
      order: "ASC",
    };
    const query = new URLSearchParams({
      _page: page.toString(),
      _limit: perPage.toString(),
      _sort: field,
      _order: order,
      ...params.filter,
    }).toString();
    const url = `${apiUrl}/v1/${resource}?${query}`;
    const { json } = await httpClient(url, { method: "GET",headers: {
        "content-Type": 'application/json',
      }  });
    return {
      data: json,
      total: json.length, // Note: Backend should return total count for proper pagination
    };
  },

  getOne: async (resource, params) => {
    const url = `${apiUrl}/v1/${resource}/${params.id}`;
    const { json } = await httpClient(url, {
      method: "GET",
      headers: {
        "content-Type": 'application/json',
      }
    });
    return {
      data: {
        ...json,
        parent: json.parent ? json.parent.id : null,
      },
    };
  },

  getMany: async (resource, params) => {
    const query = new URLSearchParams({
      id: params.ids.join(","),
    }).toString();
    const url = `${apiUrl}/v1/${resource}?${query}`;
    const { json } = await httpClient(url, { method: "GET", headers: {
        "content-Type": 'application/json',
      }  });
    return { data: json };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 1000 };
    const { field, order } = params.sort || {
      field: "orderIndex",
      order: "ASC",
    };
    const query = new URLSearchParams({
      _page: page.toString(),
      _limit: perPage.toString(),
      _sort: field,
      _order: order,
      [params.target]: params.id,
      ...params.filter,
    }).toString();
    const url = `${apiUrl}/v1/${resource}?${query}`;
    const { json } = await httpClient(url, { method: "GET", headers: {
        "content-Type": 'application/json',
      }  });
    return {
      data: json,
      total: json.length, // Adjust if backend provides total
    };
  },

  create: async (resource, params) => {
    const url = `${apiUrl}/v1/${resource}`;
    const body = JSON.stringify({
      ...params.data,
      parent: params.data.parent ? { id: params.data.parent } : null,
    });
    const { json } = await httpClient(url, {
      method: "POST",
      body,
      headers: {
        "content-Type": 'application/json',
      }
    });
    return { data: json };
  },

  update: async (resource, params) => {
    const url = `${apiUrl}/v1/${resource}/${params.id}`;
    const body = JSON.stringify({
      ...params.data,
      parent: params.data.parent ? { id: params.data.parent } : null,
    });
    const { json } = await httpClient(url, {
      method: "PUT",
      body,
      headers: {
        "content-Type": 'application/json',
      }
    });
    return { data: json };
  },

  updateMany: async (resource, params) => {
    const promises = params.ids.map(async (id) => {
      const url = `${apiUrl}/v1/${resource}/${id}`;
      const body = JSON.stringify({
        ...params.data,
        parent: params.data.parent ? { id: params.data.parent } : null,
      });
      const { json } = await httpClient(url, { method: "PUT", body, headers: {
          "content-Type": 'application/json',
        }  });
      return json;
    });
    const results = await Promise.all(promises);
    return { data: results.map((item) => item.id) };
  },

  delete: async (resource, params) => {
    const url = `${apiUrl}/v1/${resource}/${params.id}`;
    await httpClient(url, { method: "DELETE", headers: {
        "content-Type": 'application/json',
      }  });
    return { data: params.previousData! };
  },

  deleteMany: async (resource, params) => {
    const promises = params.ids.map(async (id) => {
      const url = `${apiUrl}/v1/${resource}/${id}`;
      await httpClient(url, { method: "DELETE", headers: {
          "content-Type": 'application/json',
        }  });
      return id;
    });
    const results = await Promise.all(promises);
    return { data: results };
  },

  reorderPage: async (resource, params) => {
    const url = `${apiUrl}/pages/reorder`;
    const promises = params.reorders.map(async (reorder) => {
      const body = JSON.stringify({
        pageId: reorder.pageId,
        parentId: reorder.parentId,
        orderIndex: reorder.orderIndex,
      });
      await httpClient(url, { method: "POST", body, headers: {
          "content-Type": 'application/json',
        }  });
      return reorder.pageId;
    });
    const results = await Promise.all(promises);
    return { data: results };
  },
  reorderPages: async (resource, params) => {
    const url = `${apiUrl}/v1/pages/reorders`;
    const body = JSON.stringify(params.reorders);
    await httpClient(url, {
      method: "POST",
      body,
      headers: {
        "content-Type": 'application/json',
      }
    });
    return { data: params.reorders.map((reorder) => reorder.pageId) };
  },
};
