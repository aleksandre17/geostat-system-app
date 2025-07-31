import { AuthProvider } from "react-admin";
import { jwtDecode } from "jwt-decode";

const apiUrl = import.meta.env.VITE_API_SIGN_URL;

export const signProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: new Headers({ "Content-Type": "application/json" }),
      });

      if (response.ok) {
        const { token, refreshToken } = await response.json();

        // Store tokens
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);

        // Store user data from token
        const decodedToken = jwtDecode(token);
        localStorage.setItem("user", JSON.stringify(decodedToken));

        return Promise.resolve();
      }

      throw new Error("Login failed");
    } catch (error) {
      return Promise.reject(error);
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    return Promise.resolve();
  },

  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  checkAuth: () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return Promise.reject();
    }

    // Check if token is expired
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
        return refreshAccessToken();
      }
    } catch {
      return Promise.reject();
    }

    return Promise.resolve();
  },

  getPermissions: () => {
    const user = localStorage.getItem("user");
    if (!user) return Promise.reject();
    const { roles } = JSON.parse(user);
    const permissions = roles.roles.flatMap(
      (role: { permissions: never }) => role.permissions,
    );
    return Promise.resolve(permissions);
  },

  getIdentity: () => {
    const user = localStorage.getItem("user");
    if (!user) return Promise.reject();

    const userData = JSON.parse(user);
    return Promise.resolve({
      id: userData.sub,
      fullName: userData.name,
      avatar: userData.avatar,
    });
  },
};

// Token refresh function
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    return Promise.reject();
  }

  try {
    const response = await fetch(`${apiUrl}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (response.ok) {
      const { token: newToken, refreshToken } = await response.json();

      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", refreshToken);

      const decodedToken = jwtDecode(newToken);
      localStorage.setItem("user", JSON.stringify(decodedToken));

      return Promise.resolve();
    }

    throw new Error("Token refresh failed");
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    return Promise.reject();
  }
};
