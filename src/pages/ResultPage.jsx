import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { measureWithCalibration } from "../api/measureApi";
import HistoryChart from "../components/HistoryChart";
import { createIssue, getMyIssues, getMyMeasurements, saveMeasurement } from "../api/serverApi";
import { recommendUniformSizes } from "../utils/militaryDb";
import {
  formatDateTime,
  getMeasureSeries,
  measurementRecordToMeasures,
  recordsToHistory,
} from "../utils/measurementHistory";

const rise = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: translateY(0); }
`;
const Grid = styled.div`display:grid; gap:18px;`;
const Hero = styled.section`background:var(--paper); border:1.5px solid var(--line); border-radius:28px; box-shadow:var(--shadow); padding:28px; animation:${rise} 0.8s ease both;`;
const HeroTop = styled.div`display:flex; justify-content:space-between; gap:14px; align-items:flex-start; flex-wrap:wrap;`;
const Rec = styled.div`font-size:12px; color:var(--accent); font-weight:900; letter-spacing:0.08em;`;
const HeroTitle = styled.h1`margin-top:12px; color:var(--accent);`;
const HeroDesc = styled.p`margin-top:10px; max-width:760px;`;
const BadgeRow = styled.div`margin-top:18px; display:flex; gap:10px; flex-wrap:wrap;`;
const Pill = styled.div`border:1px solid var(--line); background:var(--paper-2); padding:8px 12px; border-radius:999px; font-size:12px; color:var(--muted); font-weight:700;`;
const Card = styled.section`background:var(--paper); border:1.5px solid var(--line); border-radius:28px; box-shadow:var(--shadow-soft); padding:24px; animation:${rise} 1s ease both;`;
const SectionTitle = styled.h2`color:var(--accent);`;
const SectionDesc = styled.p`margin-top:10px;`;
const Table = styled.div`margin-top:18px; border:1px solid var(--line); border-radius:20px; overflow:hidden; width:100%;`;
const TableScroller = styled.div`overflow-x:auto;`; 
const Row = styled.div.withConfig({ shouldForwardProp: (prop) => prop !== "$header" })`
  display:grid;
  grid-template-columns:minmax(120px,1.5fr) minmax(90px,0.8fr) minmax(90px,0.7fr);
  gap:10px;
  padding:14px 16px;
  align-items:center;
  border-top:1px solid var(--line-soft);
  background:${({ $header }) => ($header ? "var(--paper-2)" : "transparent")};
  font-weight:${({ $header }) => ($header ? 800 : 500)};
  &:first-child { border-top:0; }
  @media (max-width:900px) { grid-template-columns:1fr; }
`;
const ControlRow = styled.div`margin-top:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;`;
const Input = styled.input`padding:11px 14px; border-radius:14px; border:1.5px solid var(--line); background:#fcfaf6; color:var(--text); width:min(180px, 100%);`; 
const Select = styled.select`padding:11px 14px; border-radius:14px; border:1.5px solid var(--line); background:#fcfaf6; color:var(--text);`;
const ButtonRow = styled.div`margin-top:18px; display:flex; gap:10px; flex-wrap:wrap;`;
const Button = styled.button.withConfig({ shouldForwardProp: (prop) => prop !== "$primary" })`
  border:1.5px solid ${({ $primary }) => ($primary ? "var(--accent)" : "var(--line)")};
  background:${({ $primary }) => ($primary ? "var(--accent)" : "var(--paper-2)")};
  color:${({ $primary }) => ($primary ? "#fff" : "var(--text)")};
  padding:12px 18px; border-radius:999px; font-weight:800; cursor:pointer;
`;
const HistoryList = styled.div`margin-top:18px; display:grid; gap:12px;`;
const HistoryItem = styled.div`border:1px solid var(--line-soft); background:var(--paper-2); border-radius:18px; padding:14px 16px;`;
const HistoryMeta = styled.div`margin-top:6px; display:flex; gap:10px; flex-wrap:wrap; color:var(--muted); font-size:13px;`;
const EmptyState = styled.div`margin-top:18px; border:1.5px dashed var(--line); background:var(--paper-2); border-radius:20px; padding:22px; color:var(--muted);`;
const RecommendGrid = styled.div`margin-top:18px; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; @media (max-width:900px){grid-template-columns:1fr;}`;
const RecommendCard = styled.div`border:1px solid var(--line-soft); background:var(--paper-2); border-radius:18px; padding:16px; min-width:0;`;
const ValueCell = styled.div`font-variant-numeric: tabular-nums; word-break: break-word;`; 

function asArray(value) { return Array.isArray(value) ? value : []; }
function mmToCm(mm) { const n = Number(mm); return Number.isFinite(n) ? (n / 10).toFixed(1) : "-"; }
function round2(n) { const value = Number(n); return Number.isFinite(value) ? Math.round(value * 100) / 100 : 0; }
function calculateBMI(heightMm, weightKg) { const heightM = heightMm / 1000; return heightM && weightKg ? weightKg / (heightM * heightM) : 0; }
function findMeasureMm(measures, label) { return Number(asArray(measures).find((m) => m?.label === label)?.mm) || 0; }
function buildEnhancedMeasures(baseMeasures, calibrationMm, weightKg) {
  const shoulderMm = findMeasureMm(baseMeasures, "어깨너비");
  const upperBodyMm = findMeasureMm(baseMeasures, "상체 길이");
  const lowerBodyMm = findMeasureMm(baseMeasures, "하체 길이");
  const waistMm = findMeasureMm(baseMeasures, "허리너비") || Math.round(calibrationMm * 0.18);
  const bmi = calculateBMI(calibrationMm, weightKg);
  return [
    ...asArray(baseMeasures),
    { label: "체중", mm: round2(weightKg), confidence: 1, unit: "kg" },
    { label: "BMI", mm: round2(bmi), confidence: 1, unit: "bmi" },
    { label: "허리/키 비율", mm: round2(calibrationMm ? waistMm / calibrationMm : 0), confidence: 0.88, unit: "ratio" },
    { label: "어깨/허리 비율", mm: round2(waistMm ? shoulderMm / waistMm : 0), confidence: 0.85, unit: "ratio" },
    { label: "상체/하체 비율", mm: round2(lowerBodyMm ? upperBodyMm / lowerBodyMm : 0), confidence: 0.84, unit: "ratio" },
  ];
}
function formatMeasureValue(item) {
  if (!item) return "-";
  const value = Number(item.mm);
  if (!Number.isFinite(value)) return "-";
  if (item.unit === "kg") return `${value.toFixed(1)} kg`;
  if (item.unit === "bmi" || item.unit === "ratio") return value.toFixed(2);
  return `${mmToCm(value)} cm`;
}

export default function ResultPage() {
  const nav = useNavigate();
  const calibrationMm = Number(sessionStorage.getItem("bm_calibrationMm") || "0");
  const imageId = sessionStorage.getItem("bm_imageId") || "";
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState("키(추정)");
  const [weightKg, setWeightKg] = useState(() => {
    const saved = Number(localStorage.getItem("bm_last_weight_kg") || "70");
    return Number.isFinite(saved) && saved > 0 ? saved : 70;
  });
  const [serverSaveMessage, setServerSaveMessage] = useState("");
  const serverSavedRef = useRef(false);
  const ok = useMemo(() => calibrationMm >= 1000, [calibrationMm]);

  useEffect(() => { localStorage.setItem("bm_last_weight_kg", String(weightKg)); }, [weightKg]);

  useEffect(() => {
    async function loadExisting() {
      try {
        const [measurementRows, issueRows] = await Promise.all([getMyMeasurements(), getMyIssues()]);
        setRecords(asArray(measurementRows));
        setIssues(asArray(issueRows));

        if (!ok && asArray(measurementRows).length) {
          const latest = measurementRows[0];
          setResult({ scaleMmPerPx: null, measures: measurementRecordToMeasures(latest) });
          setWeightKg(Number(latest.weight_kg) || 70);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ok) setLoading(false);
      }
    }
    loadExisting();
  }, [ok]);

  useEffect(() => {
    let mounted = true;
    async function runMeasurement() {
      if (!ok) return;
      setLoading(true);
      serverSavedRef.current = false;
      setServerSaveMessage("");
      try {
        const res = await measureWithCalibration({ calibrationMm });
        if (!mounted) return;
        setResult({ ...res, measures: buildEnhancedMeasures(res?.measures || [], calibrationMm, weightKg) });
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    runMeasurement();
    return () => { mounted = false; };
  }, [ok, calibrationMm, weightKg]);

  useEffect(() => {
    async function saveToServer() {
      if (!ok || !result || loading || serverSavedRef.current) return;
      const getValue = (label) => Number(asArray(result?.measures).find((m) => m?.label === label)?.mm) || 0;
      try {
        const saved = await saveMeasurement({
          height_mm: calibrationMm,
          weight_kg: weightKg,
          chest_cm: Number((getValue("어깨너비") / 10 / 0.42).toFixed(1)) || null,
          waist_cm: Number((calibrationMm * getValue("허리/키 비율") / 10).toFixed(1)) || null,
          bmi: getValue("BMI"),
        });

        const recommendations = recommendUniformSizes({ heightMm: calibrationMm, weightKg });
        const existingRecommendedKeys = new Set(
          asArray(issues)
            .filter((item) => item?.status === "recommended")
            .map((item) => `${item.item_name}:${item.size}`)
        );

        const createdIssues = [];
        for (const item of recommendations) {
          const key = `${item.itemName}:${item.size}`;
          if (existingRecommendedKeys.has(key)) continue;
          try {
            const created = await createIssue({
              user_id: saved.user_id,
              item_name: item.itemName,
              size: item.size,
              quantity: item.quantity || 1,
              status: "recommended",
              note: "측정 결과 기반 자동 추천",
            });
            createdIssues.push(created);
          } catch (issueErr) {
            console.error(issueErr);
          }
        }

        setRecords((prev) => [saved, ...prev]);
        setIssues((prev) => [...createdIssues, ...prev]);
        setServerSaveMessage("서버 DB 저장 및 추천 반영 완료");
        serverSavedRef.current = true;
      } catch (err) {
        console.error(err);
        setServerSaveMessage(err.message || "서버 저장 실패");
      }
    }
    saveToServer();
  }, [ok, result, loading, imageId, calibrationMm, weightKg, issues]);

  const history = useMemo(() => recordsToHistory(records), [records]);
  const measureOptions = useMemo(() => {
    const labels = new Set();
    asArray(result?.measures).forEach((m) => m?.label && labels.add(m.label));
    history.forEach((entry) => Object.keys(entry?.measures || {}).forEach((label) => labels.add(label)));
    return Array.from(labels);
  }, [result, history]);

  useEffect(() => {
    if (measureOptions.length && !measureOptions.includes(selectedLabel)) {
      setSelectedLabel(measureOptions[0]);
    }
  }, [measureOptions, selectedLabel]);

  const selectedSeries = useMemo(() => getMeasureSeries(history, selectedLabel), [history, selectedLabel]);
  const recommendations = useMemo(() => {
    if (ok) return recommendUniformSizes({ heightMm: calibrationMm, weightKg });
    const latest = records[0];
    return latest ? recommendUniformSizes({ heightMm: latest.height_mm, weightKg: latest.weight_kg }) : [];
  }, [ok, calibrationMm, weightKg, records]);
  const recentHistory = useMemo(() => history.slice(0, 8), [history]);

  if (!ok && !records.length && !result) {
    return (
      <Card>
        <SectionTitle>결과</SectionTitle>
        <SectionDesc>기준 길이 입력이 아직 없고 저장된 서버 기록도 없습니다.</SectionDesc>
        <ButtonRow><Button $primary onClick={() => nav("/upload")}>새 측정 시작</Button></ButtonRow>
      </Card>
    );
  }

  return (
    <Grid>
      <Hero>
        <HeroTop>
          <div>
            <Rec>● RESULT SHEET</Rec>
            <HeroTitle>B-MAS Analysis</HeroTitle>
            <HeroDesc>측정 결과, 비율 지표, 추천 사이즈, 누적 변화 그래프를 서버 DB 기준으로 확인합니다.</HeroDesc>
          </div>
        </HeroTop>
        <BadgeRow>
          {ok ? <Pill>기준 키 {mmToCm(calibrationMm)} cm</Pill> : <Pill>최근 저장 기록 보기</Pill>}
          {result?.scaleMmPerPx ? <Pill>스케일 {result.scaleMmPerPx} mm/px</Pill> : null}
          <Pill>저장된 기록 {records.length}개</Pill>
          <Pill>{serverSaveMessage || "서버 동기화 완료"}</Pill>
        </BadgeRow>
      </Hero>

      <Card>
        <SectionTitle>측정 결과표</SectionTitle>
        <SectionDesc>길이 항목과 보조 건강/체형 지표를 함께 보여줍니다.</SectionDesc>
        {ok ? (
          <ControlRow>
            <div style={{ fontWeight: 800 }}>체중 입력</div>
            <Input type="number" min="1" step="0.1" value={weightKg} onChange={(e) => setWeightKg(Math.max(Number(e.target.value) || 0, 0))} />
          </ControlRow>
        ) : null}
        <TableScroller>
          <Table>
            <Row $header><div>항목</div><ValueCell>값</ValueCell><ValueCell>신뢰도</ValueCell></Row>
            {loading ? <Row><div>측정 중...</div><ValueCell>-</ValueCell><ValueCell>-</ValueCell></Row> : asArray(result?.measures).map((m) => (
              <Row key={m.label}><div style={{ fontWeight: 800 }}>{m.label}</div><ValueCell>{formatMeasureValue(m)}</ValueCell><ValueCell>{Math.round((m.confidence ?? 0) * 100)}%</ValueCell></Row>
            ))}
          </Table>
        </TableScroller>
        <ButtonRow>
          <Button onClick={() => nav("/calibrate")}>이전</Button>
          <Button onClick={() => { sessionStorage.clear(); nav("/upload"); }}>새로 측정</Button>
        </ButtonRow>
      </Card>

      <Card>
        <SectionTitle>군 피복 추천</SectionTitle>
        <SectionDesc>현재 측정값 기준 추천 사이즈입니다.</SectionDesc>
        {!recommendations.length ? <EmptyState>추천 결과가 없습니다.</EmptyState> : (
          <RecommendGrid>
            {recommendations.map((item, idx) => (
              <RecommendCard key={`${item.itemName}-${idx}`}>
                <div style={{ fontWeight: 900 }}>{item.itemName}</div>
                <HistoryMeta><div>추천 사이즈 {item.size}</div><div>수량 {item.quantity || 1}</div></HistoryMeta>
              </RecommendCard>
            ))}
          </RecommendGrid>
        )}
      </Card>

      <Card>
        <SectionTitle>변화 그래프</SectionTitle>
        <SectionDesc>서버에 저장된 개인 기록 기반 변화 추이입니다.</SectionDesc>
        <ControlRow>
          <div style={{ fontWeight: 800 }}>그래프 항목</div>
          <Select value={selectedLabel} onChange={(e) => setSelectedLabel(e.target.value)}>
            {measureOptions.map((label) => <option key={label} value={label}>{label}</option>)}
          </Select>
        </ControlRow>
        <div style={{ marginTop: 18 }}><HistoryChart title={selectedLabel} series={selectedSeries} /></div>
      </Card>

      <Card>
        <SectionTitle>최근 저장 기록</SectionTitle>
        <SectionDesc>서버 DB에 저장된 개인 측정 이력입니다.</SectionDesc>
        {!recentHistory.length ? <EmptyState>저장된 기록이 없습니다.</EmptyState> : (
          <HistoryList>
            {recentHistory.map((entry) => (
              <HistoryItem key={entry.id}>
                <div style={{ fontWeight: 900 }}>{formatDateTime(entry.createdAt)}</div>
                <HistoryMeta>
                  <div>키 {mmToCm(entry.measures?.["키(추정)"]?.mm)} cm</div>
                  <div>체중 {Number(entry.measures?.["체중"]?.mm || 0).toFixed(1)} kg</div>
                  <div>BMI {Number(entry.measures?.["BMI"]?.mm || 0).toFixed(2)}</div>
                </HistoryMeta>
              </HistoryItem>
            ))}
          </HistoryList>
        )}
      </Card>
    </Grid>
  );
}
