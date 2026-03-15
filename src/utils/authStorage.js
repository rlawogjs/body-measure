const AUTH_KEY = "bm_auth_user_v1";
const USERS_KEY = "bm_auth_users_v1";

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function ensureSeedUsers() {
  const existing = safeParse(localStorage.getItem(USERS_KEY), []);
  if (Array.isArray(existing) && existing.length > 0) return existing;

  const seed = [
    {
      id: 1,
      username: "admin1",
      password: "1234",
      name: "관리자",
      role: "admin",
      rank: "대위",
      unit: "정보통신대대",
    },
    {
      id: 2,
      username: "logi1",
      password: "1234",
      name: "군수담당",
      role: "logistics",
      rank: "중사",
      unit: "보급반",
    },
    {
      id: 3,
      username: "soldier1",
      password: "1234",
      name: "병사1",
      role: "soldier",
      rank: "상병",
      unit: "1중대",
    },
  ];

  save(USERS_KEY, seed);
  return seed;
}

export function getUsers() {
  const users = safeParse(localStorage.getItem(USERS_KEY), []);
  return Array.isArray(users) ? users : [];
}

export function loadUsers() {
  return getUsers();
}

export function readUsers() {
  return getUsers();
}

export function listUsers() {
  return getUsers();
}

export function getCurrentUser() {
  const user = safeParse(localStorage.getItem(AUTH_KEY), null);
  return user && typeof user === "object" ? user : null;
}

export function loadCurrentUser() {
  return getCurrentUser();
}

export function readCurrentUser() {
  return getCurrentUser();
}

export function login(username, password) {
  const users = ensureSeedUsers();
  const found = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!found) return null;

  const safeUser = {
    id: found.id,
    username: found.username,
    name: found.name,
    role: found.role,
    rank: found.rank,
    unit: found.unit,
  };

  save(AUTH_KEY, safeUser);
  return safeUser;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function isPrivileged(user = getCurrentUser()) {
  const role = user?.role;
  return role === "admin" || role === "logistics" || role === "logi";
}