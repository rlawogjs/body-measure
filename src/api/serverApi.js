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
  if (data?.access_token) {
    localStorage.setItem(TOKEN_KEY, data.access_token);
  }
  if (data?.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!headers.has("Content-Type") && !isFormData && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
    }
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

/**
 * 병사/간부가 로그인 후 담당 군수담당을 변경할 때 사용
 * backend: PUT /users/me/manager
 */
export async function updateProfile(payload) {
  const user = await request("/users/me/manager", {
    method: "PUT",
    body: JSON.stringify({
      manager_user_id: payload.manager_user_id,
    }),
  });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

/**
 * 회원가입 화면에서 보여줄 공개 군수담당 목록
 * backend: GET /public/managers
 */
export function getLogisticsOptions() {
  return request("/public/managers");
}

/**
 * 관리자/군수담당 승인 대기 목록
 * backend: GET /users/pending
 */
export function getApprovalQueue() {
  return request("/users/pending");
}

/**
 * 승인 처리
 * backend: POST /users/{user_id}/approve
 * 현재 백엔드는 approved 필드보다 approved_by 기록 중심이라
 * action은 approve일 때만 사용한다고 보면 됨
 */
export function updateUserApproval(userId, action, note = "") {
  if (action !== "approve") {
    throw new Error("현재 백엔드는 승인만 지원합니다.");
  }

  return request(`/users/${userId}/approve`, {
    method: "POST",
    body: JSON.stringify({
      approved: true,
      note,
    }),
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
  return request(`/measurements/${id}`, {
    method: "DELETE",
  });
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