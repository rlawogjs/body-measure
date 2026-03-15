import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { measureWithCalibration } from "../api/measureApi";
import { getCurrentUser } from "../utils/authStorage";
import HistoryChart from "../components/HistoryChart";
import {
  addMeasurementHistory,
  clearMeasurementHistory,
  createHistorySnapshot,
  formatDateTime,
  getMeasureSeries,
  loadMeasurementHistory,
} from "../utils/measurementHistory";
import { recommendUniformSizes } from "../utils/militaryDb";

const Grid = styled.div`display:grid; gap:18px;`;
const Card = styled.section`
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 24px;
  padding: 24px;
`;
const Table = styled.div`
  margin-top: 16px;
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
`;
const Row = styled.div`
  display:grid;
  grid-template-columns: 1.4fr 0.7fr 0.6fr;
  gap:10px;
  padding: 13px 14px;
  border-top:1px solid var(--line-soft);
  background:${({ header }) => (header ? "var(--paper-2)" : "transparent")};
  font-weight:${({ header }) => (header ? 800 : 500)};
  &:first-child { border-top:0; }
`;
const ControlRow = styled.div`
  margin-top: 16px;
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  align-items:center;
`;
const Input = styled.input`
  padding:11px 14px;
  border-radius:14px;
  border:1.5px solid var(--line);
  background:#fcfaf6;
  color:var(--text);
  width:130px;
`;
const Select = styled.select`
  padding:11px 14px;
  border-radius:14px;
  border:1.5px solid var(--line);
  background:#fcfaf6;
  color:var(--text);
`;
const Button = styled.button`
  border: 1.5px solid ${({ primary }) => (primary ? "var(--accent)" : "var(--line)")};
  background: ${({ primary }) => (primary ? "var(--accent)" : "var(--paper-2)")};
  color: ${({ primary }) => (primary ? "white" : "var(--text)")};
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
`;
const List = styled.div`display:grid; gap:10px; margin-top:16px;`;
const Item = styled.div`
  border:1px solid var(--line-soft);
  background:var(--paper-2);
  border-radius:16px;
  padding:14px 16px;
`;
const Pill = styled.div`
  display:inline-block;
  padding:8px 12px;
  border-radius:999px;
  border:1px solid var(--line);
  background:var(--paper-2);
  color:var(--muted);
  font-size:12px;
  font-weight:700;
`;

function mmToCm(mm) { return (mm / 10).toFixed(1); }
function round2(n) { return Math.round(n * 100) / 100; }
function findMeasureMm(measures, label) { return measures.find((m) => m.label === label)?.mm ?? 0; }
function calculateBMI(heightMm, weightKg) {
  const heightM = heightMm / 1000;
  if (!heightM || !weightKg) return 0;
  return weightKg / (heightM * heightM);
}
function buildEnhancedMeasures(baseMeasures, calibrationMm, weightKg) {
  const next = [...baseMeasures];
  const shoulderMm = findMeasureMm(baseMeasures, "어깨너비");
  const upperBodyMm = findMeasureMm(baseMeasures, "상체 길이");
  const lowerBodyMm = findMeasureMm(baseMeasures, "하체 길이");
  const waistMm = Math.round(calibrationMm * 0.18);
  next.push(
    { label: "체중", mm: round2(weightKg), confidence: 1, unit: "kg" },
    { label: "BMI", mm: round2(calculateBMI(calibrationMm, weightKg)), confidence: 1, unit: "bmi" },
    { label: "허리/키 비율", mm: round2(waistMm / calibrationMm), confidence: 0.88, unit: "ratio" },
    { label: "어깨/허리 비율", mm: round2(shoulderMm / waistMm), confidence: 0.85, unit: "ratio" },
    { label: "상체/하체 비율", mm: round2(upperBodyMm / lowerBodyMm), confidence: 0.84, unit: "ratio" }
  );
  return next;
}
function formatMeasureValue(item) {
  if (!item) return "-";
  if (item.unit === "kg") return `${Number(item.mm).toFixed(1)} kg`;
  if (item.unit === "bmi" || item.unit === "ratio") return Number(item.mm).toFixed(2);
  return `${mmToCm(item.mm)} cm`;
}

export default function ResultPage() {
  const nav = useNavigate();
  const user = getCurrentUser();
  const calibrationMm = Number(sessionStorage.getItem("bm_calibrationMm") || "0");
  const imageId = sessionStorage.getItem("bm_imageId") || "";
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => loadMeasurementHistory());
  const [selectedLabel, setSelectedLabel] = useState("키(추정)");
  const [weightKg, setWeightKg] = useState(() => Number(localStorage.getItem("bm_last_weight_kg") || "70") || 70);
  const savedRef = useRef(false);
  const ok = useMemo(() => calibrationMm >= 1000, [calibrationMm]);

  useEffect(() => { localStorage.setItem("bm_last_weight_kg", String(weightKg)); }, [weightKg]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!ok) { setLoading(false); return; }
      setLoading(true);
      savedRef.current = false;
      try {
        const res = await measureWithCalibration({ calibrationMm });
        if (!mounted) return;
        setResult({ ...res, measures: buildEnhancedMeasures(res.measures || [], calibrationMm, weightKg) });
      } catch (e) {
        console.error(e);
        alert("측정 중 오류가 발생했어요.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [ok, calibrationMm, weightKg]);

  useEffect(() => {
    if (!result || loading || savedRef.current) return;
    const snapshot = createHistorySnapshot({ imageId, calibrationMm, result, user });
    setHistory(addMeasurementHistory(snapshot));
    savedRef.current = true;
  }, [result, loading, imageId, calibrationMm, user]);

  const userHistory = useMemo(() => history.filter((h) => h.userId === user?.id), [history, user]);
  const measureOptions = useMemo(() => {
    const labels = new Set();
    if (result?.measures?.length) result.measures.forEach((m) => labels.add(m.label));
    userHistory.forEach((entry) => Object.keys(entry.measures || {}).forEach((label) => labels.add(label)));
    return Array.from(labels);
  }, [result, userHistory]);

  useEffect(() => {
    if (measureOptions.length && !measureOptions.includes(selectedLabel)) setSelectedLabel(measureOptions[0]);
  }, [measureOptions, selectedLabel]);

  const selectedSeries = useMemo(() => getMeasureSeries(history, selectedLabel, user?.id), [history, selectedLabel, user]);
  const recommendations = useMemo(() => recommendUniformSizes(result?.measures?.reduce((acc, cur) => ({ ...acc, [cur.label]: cur }), {}) || {}), [result]);

  if (!ok) {
    return <Card><h2 style={{ color: "var(--accent)" }}>결과</h2><p style={{ marginTop: 10 }}>기준 길이 입력부터 다시 진행해 주세요.</p><div style={{ marginTop: 16 }}><Button primary onClick={() => nav("/calibrate")}>기준 입력으로</Button></div></Card>;
  }

  return (
    <Grid>
      <Card>
        <div style={{ color: "var(--accent-2)", fontSize: 13, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>Result & Recommendation</div>
        <h1 style={{ color: "var(--accent)", marginTop: 10 }}>측정 결과 및 군 피복 추천</h1>
        <p style={{ marginTop: 12 }}>개인 치수 데이터는 저장되며, 추후 로그인·서버 DB 기반 지급 관리 시스템으로 전환하기 쉬운 구조로 유지합니다.</p>
        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Pill>사용자 {user?.name}</Pill>
          <Pill>기준 키 {mmToCm(calibrationMm)} cm</Pill>
          <Pill>기록 {userHistory.length}건</Pill>
        </div>
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>측정 결과표</h2>
        <ControlRow>
          <div style={{ fontWeight: 800 }}>체중 입력</div>
          <Input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value) || 0)} />
        </ControlRow>
        <Table>
          <Row header><div>항목</div><div>값</div><div>신뢰도</div></Row>
          {loading ? <Row><div>측정 중...</div><div>-</div><div>-</div></Row> : result?.measures?.map((m) => (
            <Row key={m.label}><div style={{ fontWeight: 800 }}>{m.label}</div><div>{formatMeasureValue(m)}</div><div>{Math.round((m.confidence ?? 0) * 100)}%</div></Row>
          ))}
        </Table>
        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button onClick={() => nav("/calibrate")}>이전</Button>
          <Button onClick={() => { sessionStorage.clear(); nav("/upload"); }}>새로 측정</Button>
        </div>
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>군 피복 추천</h2>
        <List>
          {recommendations.map((r) => (
            <Item key={r.item}>
              <strong>{r.item}</strong>
              <div style={{ marginTop: 6, color: "var(--muted)" }}>추천 사이즈 {r.size} · 근거: {r.reason}</div>
            </Item>
          ))}
        </List>
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>변화 그래프</h2>
        <ControlRow>
          <div style={{ fontWeight: 800 }}>그래프 항목</div>
          <Select value={selectedLabel} onChange={(e) => setSelectedLabel(e.target.value)}>
            {measureOptions.map((label) => <option key={label} value={label}>{label}</option>)}
          </Select>
          <Button onClick={() => setHistory(history.filter((h) => h.userId !== user?.id))}>현재 사용자 기록만 화면에서 제거</Button>
          <Button onClick={() => { clearMeasurementHistory(); setHistory([]); }}>전체 기록 삭제</Button>
        </ControlRow>
        <div style={{ marginTop: 16 }}><HistoryChart title={selectedLabel} series={selectedSeries} /></div>
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>최근 기록</h2>
        {!userHistory.length ? <p style={{ marginTop: 12 }}>아직 저장된 측정 기록이 없습니다.</p> : (
          <List>
            {userHistory.slice(0, 6).map((entry) => {
              const raw = entry.measures?.[selectedLabel]?.mm;
              const confidence = entry.measures?.[selectedLabel]?.confidence;
              const isNumberMetric = selectedLabel === "BMI" || selectedLabel === "체중" || selectedLabel.includes("비율");
              let value = `${selectedLabel} 데이터 없음`;
              if (typeof raw === "number") value = isNumberMetric ? `${selectedLabel} ${Number(raw).toFixed(selectedLabel === "체중" ? 1 : 2)}${selectedLabel === "체중" ? " kg" : ""}` : `${selectedLabel} ${mmToCm(raw)} cm`;
              return (
                <Item key={entry.id}>
                  <strong>{formatDateTime(entry.createdAt)}</strong>
                  <div style={{ marginTop: 6, color: "var(--muted)" }}>기준 키 {mmToCm(entry.calibrationMm)} cm · {value}{typeof confidence === "number" ? ` · 신뢰도 ${Math.round(confidence * 100)}%` : ""}</div>
                </Item>
              );
            })}
          </List>
        )}
      </Card>
    </Grid>
  );
}
