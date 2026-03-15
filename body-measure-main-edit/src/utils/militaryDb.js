const ISSUE_KEY = "bmas_issue_records_v1";

const seedIssues = [
  {
    id: "issue_1",
    userId: "u_soldier_01",
    userName: "김병사",
    item: "전투복 상의",
    size: "100",
    qty: 1,
    status: "지급완료",
    issuedAt: new Date().toISOString(),
  },
  {
    id: "issue_2",
    userId: "u_soldier_01",
    userName: "김병사",
    item: "전투복 하의",
    size: "32",
    qty: 1,
    status: "지급완료",
    issuedAt: new Date().toISOString(),
  },
];

export function ensureIssueDb() {
  const raw = localStorage.getItem(ISSUE_KEY);
  if (!raw) {
    localStorage.setItem(ISSUE_KEY, JSON.stringify(seedIssues));
    return seedIssues;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedIssues;
  } catch {
    localStorage.setItem(ISSUE_KEY, JSON.stringify(seedIssues));
    return seedIssues;
  }
}

export function getIssueRecords() {
  return ensureIssueDb();
}

export function recommendUniformSizes(measures = {}) {
  const h = measures["키(추정)"]?.mm || 1700;
  const shoulder = measures["어깨너비"]?.mm || 400;
  const waistRatio = measures["허리/키 비율"]?.mm || 0.18;

  const top = h >= 1800 ? "105" : h >= 1720 ? "100" : h >= 1650 ? "95" : "90";
  const bottom = waistRatio >= 0.2 ? "34" : waistRatio >= 0.18 ? "32" : "30";
  const cold = shoulder >= 410 ? "L" : "M";

  return [
    { item: "전투복 상의", size: top, reason: "신장 및 어깨너비 기준" },
    { item: "전투복 하의", size: bottom, reason: "허리/키 비율 기준" },
    { item: "방한외피", size: cold, reason: "어깨너비 기준" },
  ];
}
