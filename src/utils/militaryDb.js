const ISSUE_KEY = "bm_issue_history_v1";
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

/* =========================
   Users
========================= */

export function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  const users = safeParse(raw, []);
  return Array.isArray(users) ? users : [];
}

export function getUsers() {
  return loadUsers();
}

export function readUsers() {
  return loadUsers();
}

export function listUsers() {
  return loadUsers();
}

/* =========================
   Issue / Clothing Records
========================= */

export function ensureIssueDb() {
  const existing = safeParse(localStorage.getItem(ISSUE_KEY), []);
  if (Array.isArray(existing) && existing.length > 0) return existing;

  const seed = [
    {
      id: 1,
      userId: 3,
      itemName: "전투복 상의",
      size: "100",
      quantity: 1,
      status: "issued",
      issuedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      note: "초기 지급",
    },
    {
      id: 2,
      userId: 3,
      itemName: "전투복 하의",
      size: "32",
      quantity: 1,
      status: "issued",
      issuedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      note: "초기 지급",
    },
    {
      id: 3,
      userId: 2,
      itemName: "방한복",
      size: "105",
      quantity: 1,
      status: "issued",
      issuedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      note: "간부 지급 예시",
    },
  ];

  save(ISSUE_KEY, seed);
  return seed;
}

export function getIssueRecords() {
  const list = safeParse(localStorage.getItem(ISSUE_KEY), []);
  return Array.isArray(list) ? list : [];
}

export function loadIssueHistory() {
  return getIssueRecords();
}

export function getIssueHistory() {
  return getIssueRecords();
}

export function readIssueHistory() {
  return getIssueRecords();
}

export function listIssueHistory() {
  return getIssueRecords();
}

export function loadIssues() {
  return getIssueRecords();
}

export function getIssues() {
  return getIssueRecords();
}

export function addIssueRecord(payload) {
  const prev = getIssueRecords();

  const nextItem = {
    id: Date.now(),
    userId: payload?.userId ?? null,
    itemName: payload?.itemName || payload?.item || "피복 항목",
    size: payload?.size || payload?.recommendedSize || "-",
    quantity: Number(payload?.quantity) || 1,
    status: payload?.status || "issued",
    issuedAt: payload?.issuedAt || new Date().toISOString(),
    createdAt: payload?.createdAt || new Date().toISOString(),
    note: payload?.note || "",
  };

  const next = [nextItem, ...prev];
  save(ISSUE_KEY, next);
  return next;
}

/* =========================
   Uniform Recommendation
========================= */

export function recommendUniformSizes(measurements = {}) {
  const heightMm = Number(measurements?.height_mm ?? measurements?.heightMm ?? 0);
  const weightKg = Number(measurements?.weight_kg ?? measurements?.weightKg ?? 0);

  let top = "95";
  let bottom = "30";
  let shoes = "260";

  if (heightMm >= 1750) top = "100";
  if (heightMm >= 1800) top = "105";

  if (weightKg >= 75) bottom = "32";
  if (weightKg >= 85) bottom = "34";

  if (heightMm >= 1750) shoes = "270";
  if (heightMm >= 1820) shoes = "280";

  return [
    {
      itemName: "전투복 상의",
      size: top,
      quantity: 1,
    },
    {
      itemName: "전투복 하의",
      size: bottom,
      quantity: 1,
    },
    {
      itemName: "전투화",
      size: shoes,
      quantity: 1,
    },
  ];
}