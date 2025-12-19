const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function getHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function fetchTasks() {
  const response = await fetch(`${API_URL}/task`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return response.json();
}

export async function createTask(data: any) {
  const response = await fetch(`${API_URL}/task`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create task");
  return response.json();
}

export async function updateTask(id: string, data: any) {
  const response = await fetch(`${API_URL}/task/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update task");
  return response.json();
}

export async function deleteTask(id: string) {
  const response = await fetch(`${API_URL}/task/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete task");
  return response.json();
}

export async function fetchUsers() {
  const response = await fetch(`${API_URL}/user`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to login");
  }
  const data = await response.json();
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export async function register(
  email: string,
  password: string,
  username?: string
) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, username }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to register");
  }
  const data = await response.json();
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export async function logout() {
  const token = getToken();
  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: getHeaders(),
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("accessToken");
}
