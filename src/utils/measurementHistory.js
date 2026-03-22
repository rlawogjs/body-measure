function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function formatDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function measurementRecordToMeasures(record) {
  if (!record) return [];

  const heightMm = Number(record.height_mm) || 0;
  const weightKg = Number(record.weight_kg) || 0;
  const chestCm = Number(record.chest_cm) || 0;
  const waistCm = Number(record.waist_cm) || 0;
  const shoulderWidthMm = Number(record.shoulder_width_mm) || (chestCm ? chestCm * 10 * 0.42 : 0);
  const upperBodyLengthMm = Number(record.upper_body_length_mm) || (heightMm ? heightMm * 0.3 : 0);
  const lowerBodyLengthMm = Number(record.lower_body_length_mm) || (heightMm ? heightMm * 0.52 : 0);
  const waistHeightRatio = Number(record.waist_height_ratio) || (heightMm && waistCm ? (waistCm * 10) / heightMm : 0);
  const shoulderWaistRatio = Number(record.shoulder_waist_ratio) || (waistCm ? shoulderWidthMm / (waistCm * 10) : 0);
  const upperLowerRatio = Number(record.upper_lower_ratio) || (lowerBodyLengthMm ? upperBodyLengthMm / lowerBodyLengthMm : 0);

  return [
    { label: "키(추정)", mm: heightMm, confidence: 1 },
    { label: "어깨너비", mm: shoulderWidthMm, confidence: 0.86 },
    { label: "상체 길이", mm: upperBodyLengthMm, confidence: 0.82 },
    { label: "하체 길이", mm: lowerBodyLengthMm, confidence: 0.8 },
    { label: "체중", mm: weightKg, confidence: 1, unit: "kg" },
    { label: "BMI", mm: Number(record.bmi) || 0, confidence: 1, unit: "bmi" },
    { label: "허리/키 비율", mm: waistHeightRatio, confidence: 0.88, unit: "ratio" },
    { label: "어깨/허리 비율", mm: shoulderWaistRatio, confidence: 0.85, unit: "ratio" },
    { label: "상체/하체 비율", mm: upperLowerRatio, confidence: 0.84, unit: "ratio" },
  ].filter((item) => item.mm || ["BMI", "체중", "키(추정)"].includes(item.label));
}

export function recordToHistorySnapshot(record) {
  return {
    id: record.id,
    imageId: record.image_id,
    createdAt: record.created_at,
    calibrationMm: Number(record.height_mm) || 0,
    scaleMmPerPx: null,
    measures: Object.fromEntries(
      measurementRecordToMeasures(record).map((item) => [
        item.label,
        { mm: item.mm, confidence: item.confidence, unit: item.unit || "mm" },
      ])
    ),
  };
}

export function recordsToHistory(records) {
  return asArray(records).map(recordToHistorySnapshot);
}

export function getMeasureSeries(history, label) {
  return asArray(history)
    .slice()
    .reverse()
    .map((entry, index) => ({
      index: index + 1,
      id: entry?.id || `${label}-${index}`,
      createdAt: entry?.createdAt,
      valueMm: entry?.measures?.[label]?.mm ?? null,
      confidence: entry?.measures?.[label]?.confidence ?? null,
    }))
    .filter((item) => typeof item.valueMm === "number");
}
