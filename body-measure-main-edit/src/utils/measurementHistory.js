const STORAGE_KEY = "bm_measure_history_v2";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function loadMeasurementHistory() {
  return safeParse(localStorage.getItem(STORAGE_KEY), []);
}

export function saveMeasurementHistory(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function createHistorySnapshot({ imageId, calibrationMm, result, user }) {
  const measuresMap = {};
  for (const item of result?.measures || []) {
    measuresMap[item.label] = {
      mm: item.mm,
      confidence: item.confidence,
      unit: item.unit || "mm",
    };
  }

  return {
    id: `${imageId || "img"}_${Date.now()}`,
    imageId: imageId || null,
    userId: user?.id || null,
    userName: user?.name || "미확인",
    role: user?.role || "guest",
    unit: user?.unit || "-",
    company: user?.company || "-",
    platoon: user?.platoon || "-",
    createdAt: new Date().toISOString(),
    calibrationMm,
    scaleMmPerPx: result?.scaleMmPerPx ?? null,
    measures: measuresMap,
  };
}

export function addMeasurementHistory(snapshot) {
  const prev = loadMeasurementHistory();
  const next = [snapshot, ...prev].slice(0, 100);
  saveMeasurementHistory(next);
  return next;
}

export function clearMeasurementHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getMeasureSeries(history, label, userId) {
  return history
    .filter((entry) => !userId || entry.userId === userId)
    .slice()
    .reverse()
    .map((entry, index) => ({
      index: index + 1,
      id: entry.id,
      createdAt: entry.createdAt,
      valueMm: entry.measures?.[label]?.mm ?? null,
      confidence: entry.measures?.[label]?.confidence ?? null,
    }))
    .filter((item) => typeof item.valueMm === "number");
}

export function formatDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
