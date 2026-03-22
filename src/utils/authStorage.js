import {
  login as serverLogin,
  clearAuth,
  getCurrentUser as getServerCurrentUser,
} from "../api/serverApi";

export async function login(username, password) {
  return serverLogin(username, password);
}

export function logout() {
  clearAuth();
}

export function getStoredUser() {
  return getServerCurrentUser();
}

export function getCurrentUser() {
  return getServerCurrentUser();
}

export function isLoggedIn() {
  return !!getServerCurrentUser();
}

export function isPrivileged() {
  const user = getServerCurrentUser();
  return user?.role === "admin" || user?.role === "logistics";
}