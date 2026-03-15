const USERS_KEY = "bmas_users_v1";
const SESSION_KEY = "bmas_current_user_v1";

const demoUsers = [
  {
    id: "u_soldier_01",
    username: "soldier1",
    password: "1234",
    name: "김병사",
    role: "soldier",
    unit: "36사단",
    company: "정보통신대대",
    platoon: "1소대",
    rank: "상병",
  },
  {
    id: "u_log_01",
    username: "logi1",
    password: "1234",
    name: "이군수",
    role: "logistics",
    unit: "36사단",
    company: "보급중대",
    platoon: "군수과",
    rank: "중사",
  },
  {
    id: "u_admin_01",
    username: "admin1",
    password: "1234",
    name: "박관리",
    role: "admin",
    unit: "36사단",
    company: "본부중대",
    platoon: "행정반",
    rank: "대위",
  },
];

export function ensureSeedUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
    return demoUsers;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
      return demoUsers;
    }
    return parsed;
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
    return demoUsers;
  }
}

export function getUsers() {
  return ensureSeedUsers();
}

export function login(username, password) {
  const users = ensureSeedUsers();
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return null;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isPrivileged(user) {
  return user && (user.role === "admin" || user.role === "logistics");
}
