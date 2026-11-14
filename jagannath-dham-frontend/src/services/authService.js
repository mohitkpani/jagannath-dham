import api from "./api";

const authService = {
  async login(email, password) {
    const response = await api.post("/users/login", {
      email,
      password,
    });

    const data = response.data;

    localStorage.setItem("token", data.token);
    localStorage.setItem("tokenType", data.tokenType);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("fullName", data.fullName);
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);

    return data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
  },

  getCurrentUser() {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    return {
      userId: localStorage.getItem("userId"),
      fullName: localStorage.getItem("fullName"),
      email: localStorage.getItem("email"),
      role: localStorage.getItem("role"),
    };
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem("token"));
  },
};

export default authService;
