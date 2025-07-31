import axios from "axios";

export const httpClient = async (url: string, options: any = {}) => {
  let headers: Record<string, string> = {};

  // Convert Headers instance to plain object if needed
  if (options.headers instanceof Headers) {
    options.headers.forEach((value: string, key: string) => {
      headers[key] = value;
    });
  } else if (typeof options.headers === "object") {
    headers = { ...options.headers };
  }

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  try {
    const response = await axios({
      url,
      method: options.method || "GET",
      headers,
      data: options.body,
      responseType: "json",
      onUploadProgress: options.onUploadProgress,
      timeout: options.timeout,
    });

    return {
      status: response.status,
      headers: response.headers,
      body: response.data,
      json: response.data,
    };
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data?.message || error.response.statusText,
      );
    }
    throw error;
  }
};