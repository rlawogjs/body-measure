const DEFAULT_API_BASE = "http://127.0.0.1:8000";
export const API_BASE = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  DEFAULT_API_BASE
).replace(/\/$/, "");

const TOKEN_KEY = "bm_token";
const USER_KEY = "bm_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function setAuth(data) {
  if (data?.access_token) localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data?.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!headers.has("Content-Type") && !isFormData && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) clearAuth();
    throw new Error(data?.detail || "요청 실패");
  }
  return data;
}

export function login(username, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  }).then((data) => {
    setAuth(data);
    return data.user;
  });
}

export function register(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMe() {
  const user = await request("/auth/me");
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function updateProfile(payload) {
  return request("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then((user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  });
}

export function getLogisticsOptions() {
  return request("/logistics/options");
}

export function getApprovalQueue() {
  return request("/approvals/queue");
}

export function updateUserApproval(userId, action, note = "") {
  return request(`/approvals/users/${userId}`, {
    method: "POST",
    body: JSON.stringify({ action, note }),
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

export function getAllMeasurements() {
  return request("/measurements");
}

export function updateMeasurement(id, payload) {
  return request(`/measurements/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteMeasurement(id) {
  return request(`/measurements/${id}`, { method: "DELETE" });
}

export function getUsers() {
  return request("/users");
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
