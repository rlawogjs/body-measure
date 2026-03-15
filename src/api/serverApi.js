const API_BASE = "http://localhost:8000";

export function getToken() {
  return localStorage.getItem("bm_token") || "";
}

export function setAuth(data) {
  localStorage.setItem("bm_token", data.access_token);
  localStorage.setItem("bm_user", JSON.stringify(data.user));
}

export function clearAuth() {
  localStorage.removeItem("bm_token");
  localStorage.removeItem("bm_user");
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("bm_user") || "null");
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.detail || "요청 실패");
  }

  return data;
}

export function login(username, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function register(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveMeasurement(payload) {
  return request("/measurements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyMeasurements() {
  return request("/measurements/me");
}

export function updateMeasurement(id, payload) {
  return request(`/measurements/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteMeasurement(id) {
  return request(`/measurements/${id}`, {
    method: "DELETE",
  });
}

export function getUsers() {
  return request("/users");
}

export function getAllMeasurements() {
  return request("/measurements");
}

export function createIssue(payload) {
  return request("/issues", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyIssues() {
  return request("/issues/me");
}

export function getAllIssues() {
  return request("/issues");
}