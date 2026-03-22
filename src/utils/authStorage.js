import {
  clearAuth,
  fetchMe,
  getCurrentUser as getStoredUser,
  login as serverLogin,
} from "../api/serverApi";

export function getCurrentUser() {
  return getStoredUser();
}

export function loadCurrentUser() {
  return getCurrentUser();
}

export function readCurrentUser() {
  return getCurrentUser();
}

export async function login(username, password) {
  return serverLogin(username, password);
}

export function logout() {
  clearAuth();
}

export async function hydrateCurrentUser() {
  try {
    return await fetchMe();
  } catch {
    return null;
  }
}

export function isPrivileged(user = getCurrentUser()) {
  const role = user?.role;
  return ["admin", "chief_logistics", "logistics"].includes(role) && user?.approval_status === "approved";
}
