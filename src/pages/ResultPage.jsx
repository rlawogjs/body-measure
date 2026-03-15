import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { measureWithCalibration } from "../api/measureApi";
import HistoryChart from "../components/HistoryChart";
import {
  addMeasurementHistory,
  clearMeasurementHistory,
  createHistorySnapshot,
  formatDateTime,
  getMeasureSeries,
  loadMeasurementHistory,
} from "../utils/measurementHistory";

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 18px;
`;

const Hero = styled.section`
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 28px;
  box-shadow: var(--shadow);
  padding: 28px;
  animation: ${rise} .8s ease both;
`;

const HeroTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const Rec = styled.div`
  font-size: 12px;
  color: var(--accent);
  font-weight: 900;
  letter-spacing: 0.08em;
`;

const HeroTitle = styled.h1`
  margin-top: 12px;
  color: var(--accent);
`;

const HeroDesc = styled.p`
  margin-top: 10px;
  max-width: 760px;
`;

const BadgeRow = styled.div`
  margin-top: 18px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Pill = styled.div`
  border: 1px solid var(--line);
  background: var(--paper-2);
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--muted);
  font-weight: 700;
`;

const Card = styled.section`
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 28px;
  box-shadow: var(--shadow-soft);
  padding: 24px;
  animation: ${rise} .9s ease both;
`;

const SectionTitle = styled.h2`
  color: var(--accent);
`;

const SectionDesc = styled.p`
  margin-top: 10px;
`;

const Table = styled.div`
  margin-top: 18px;
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 0.8fr 0.7fr;
  gap: 10px;
  padding: 14px 16px;
  align-items: center;
  border-top: 1px solid var(--line-soft);
  background: ${({ header }) => (header ? "var(--paper-2)" : "transparent")};
  font-weight: ${({ header }) => (header ? 800 : 500)};

  &:first-child{
    border-top: 0;
  }
`;

const ControlRow = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const Input = styled.input`
  padding: 11px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--line);
  background: #fcfaf6;
  color: var(--text);
  width: 130px;
`;

const Select = styled.select`
  padding: 11px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--line);
  background: #fcfaf6;
  color: var(--text);
`;

const ButtonRow = styled.div`
  margin-top: 18px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  border: 1.5px solid ${({ primary }) => (primary ? "var(--accent)" : "var(--line)")};
  background: ${({ primary }) => (primary ? "var(--accent)" : "var(--paper-2)")};
  color: ${({ primary }) => (primary ? "#fff" : "var(--text)")};
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
  transition: transform .18s ease, opacity .18s ease;

  &:hover{
    transform: translateY(-2px);
  }
`;

const HistoryList = styled.div`
  margin-top: 18px;
  display: grid;
  gap: 10px;
`;

const HistoryItem = styled.div`
  border: 1px solid var(--line-soft);
  background: var(--paper-2);
  border-radius: 18px;
  padding: 14px 16px;
`;

const HistoryMeta = styled.div`
  margin-top: 6px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  color: var(--muted);
  font-size: 13px;
`;

const EmptyState = styled.div`
  margin-top: 18px;
  border: 1.5px dashed var(--line);
  background: var(--paper-2);
  border-radius: 20px;
  padding: 22px;
  color: var(--muted);
`;

function mmToCm(mm) {
  return (mm / 10).toFixed(1);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function findMeasureMm(measures, label) {
  const found = measures.find((m) => m.label === label);
  return found?.mm ?? 0;
}

function calculateBMI(heightMm, weightKg) {
  const heightM = heightMm / 1000;
  if (!heightM || !weightKg) return 0;
  return weightKg / (heightM * heightM);
}

function buildEnhancedMeasures(baseMeasures, calibrationMm, weightKg) {
  const next = [...baseMeasures];

  const heightMm = calibrationMm;
  const shoulderMm = findMeasureMm(baseMeasures, "어깨너비");
  const upperBodyMm = findMeasureMm(baseMeasures, "상체 길이");
  const lowerBodyMm = findMeasureMm(baseMeasures, "하체 길이");
  const waistMm =
    findMeasureMm(baseMeasures, "허리너비") || Math.round(calibrationMm * 0.18);

  const bmi = calculateBMI(heightMm, weightKg);
  const waistHeightRatio = heightMm ? waistMm / heightMm : 0;
  const shoulderWaistRatio = waistMm ? shoulderMm / waistMm : 0;
  const upperLowerRatio = lowerBodyMm ? upperBodyMm / lowerBodyMm : 0;

  next.push(
    { label: "체중", mm: round2(weightKg), confidence: 1, unit: "kg" },
    { label: "BMI", mm: round2(bmi), confidence: 1, unit: "bmi" },
    { label: "허리/키 비율", mm: round2(waistHeightRatio), confidence: 0.88, unit: "ratio" },
    { label: "어깨/허리 비율", mm: round2(shoulderWaistRatio), confidence: 0.85, unit: "ratio" },
    { label: "상체/하체 비율", mm: round2(upperLowerRatio), confidence: 0.84, unit: "ratio" }
  );

  return next;
}

function formatMeasureValue(item) {
  if (!item) return "-";
  if (item.unit === "kg") return `${Number(item.mm).toFixed(1)} kg`;
  if (item.unit === "bmi") return Number(item.mm).toFixed(2);
  if (item.unit === "ratio") return Number(item.mm).toFixed(2);
  return `${mmToCm(item.mm)} cm`;
}

export default function ResultPage() {
  const nav = useNavigate();
  const calibrationMm = Number(sessionStorage.getItem("bm_calibrationMm") || "0");
  const imageId = sessionStorage.getItem("bm_imageId") || "";

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => loadMeasurementHistory());
  const [selectedLabel, setSelectedLabel] = useState("키(추정)");
  const [weightKg, setWeightKg] = useState(() => {
    const saved = Number(localStorage.getItem("bm_last_weight_kg") || "70");
    return Number.isFinite(saved) && saved > 0 ? saved : 70;
  });

  const savedRef = useRef(false);
  const ok = useMemo(() => calibrationMm >= 1000, [calibrationMm]);

  useEffect(() => {
    localStorage.setItem("bm_last_weight_kg", String(weightKg));
  }, [weightKg]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!ok) {
        setLoading(false);
        return;
      }

      setLoading(true);
      savedRef.current = false;

      try {
        const res = await measureWithCalibration({ calibrationMm });
        if (!mounted) return;

        const enhancedMeasures = buildEnhancedMeasures(
          res?.measures || [],
          calibrationMm,
          weightKg
        );

        setResult({
          ...res,
          measures: enhancedMeasures,
        });
      } catch (e) {
        console.error(e);
        alert("측정 중 오류가 발생했어요.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();

    return () => {
      mounted = false;
    };
  }, [ok, calibrationMm, weightKg]);

  useEffect(() => {
    if (!result || loading || savedRef.current) return;

    const snapshot = createHistorySnapshot({
      imageId,
      calibrationMm,
      result,
    });

    const nextHistory = addMeasurementHistory(snapshot);
    setHistory(nextHistory);
    savedRef.current = true;
  }, [result, loading, imageId, calibrationMm]);

  const measureOptions = useMemo(() => {
    const labels = new Set();

    if (result?.measures?.length) {
      result.measures.forEach((m) => labels.add(m.label));
    }

    history.forEach((entry) => {
      Object.keys(entry.measures || {}).forEach((label) => labels.add(label));
    });

    return Array.from(labels);
  }, [result, history]);

  useEffect(() => {
    if (!measureOptions.length) return;
    if (!measureOptions.includes(selectedLabel)) {
      setSelectedLabel(measureOptions[0]);
    }
  }, [measureOptions, selectedLabel]);

  const selectedSeries = useMemo(() => {
    return getMeasureSeries(history, selectedLabel);
  }, [history, selectedLabel]);

  if (!ok) {
    return (
      <Card>
        <SectionTitle>결과</SectionTitle>
        <SectionDesc>기준 길이 입력이 없어 먼저 이전 단계를 완료해야 합니다.</SectionDesc>
        <ButtonRow>
          <Button primary onClick={() => nav("/calibrate")}>기준 입력으로</Button>
        </ButtonRow>
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
            <HeroDesc>
              측정 결과, 보조 지표, 기록 기반 변화 그래프를 한 화면에서 확인할 수 있습니다.
              체중을 입력하면 BMI와 비율 지표도 함께 저장됩니다.
            </HeroDesc>
          </div>
        </HeroTop>

        <BadgeRow>
          <Pill>기준 키 {mmToCm(calibrationMm)} cm</Pill>
          {result?.scaleMmPerPx ? <Pill>스케일 {result.scaleMmPerPx} mm/px</Pill> : null}
          <Pill>기록 수 {history.length}개</Pill>
        </BadgeRow>
      </Hero>

      <Card>
        <SectionTitle>측정 결과표</SectionTitle>
        <SectionDesc>길이 항목과 보조 건강/체형 지표를 함께 보여줍니다.</SectionDesc>

        <ControlRow>
          <div style={{ fontWeight: 800 }}>체중 입력</div>
          <Input
            type="number"
            min="1"
            step="0.1"
            value={weightKg}
            onChange={(e) => {
              const next = Number(e.target.value);
              setWeightKg(Number.isFinite(next) && next > 0 ? next : 0);
            }}
          />
        </ControlRow>

        <Table>
          <Row header>
            <div>항목</div>
            <div>값</div>
            <div>신뢰도</div>
          </Row>

          {loading ? (
            <Row>
              <div>측정 중...</div>
              <div>-</div>
              <div>-</div>
            </Row>
          ) : (
            result?.measures?.map((m) => (
              <Row key={m.label}>
                <div style={{ fontWeight: 800 }}>{m.label}</div>
                <div>{formatMeasureValue(m)}</div>
                <div>{Math.round((m.confidence ?? 0) * 100)}%</div>
              </Row>
            ))
          )}
        </Table>

        <ButtonRow>
          <Button onClick={() => nav("/calibrate")}>이전</Button>
          <Button
            onClick={() => {
              sessionStorage.clear();
              nav("/upload");
            }}
          >
            새로 측정
          </Button>
        </ButtonRow>
      </Card>

      <Card>
        <SectionTitle>변화 그래프</SectionTitle>
        <SectionDesc>선택한 항목의 누적 기록을 기반으로 변화 추이를 확인합니다.</SectionDesc>

        <ControlRow>
          <div style={{ fontWeight: 800 }}>그래프 항목</div>
          <Select
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
          >
            {measureOptions.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </Select>

          <Button
            onClick={() => {
              clearMeasurementHistory();
              setHistory([]);
            }}
          >
            기록 전체 삭제
          </Button>
        </ControlRow>

        <div style={{ marginTop: 16 }}>
          <HistoryChart title={selectedLabel} series={selectedSeries} />
        </div>
      </Card>

      <Card>
        <SectionTitle>최근 기록</SectionTitle>

        {!history.length ? (
          <EmptyState>아직 저장된 기록이 없습니다.</EmptyState>
        ) : (
          <HistoryList>
            {history.map((entry) => {
              const raw = entry.measures?.[selectedLabel]?.mm;
              const confidence = entry.measures?.[selectedLabel]?.confidence;

              const isNumberMetric =
                selectedLabel === "BMI" ||
                selectedLabel === "체중" ||
                selectedLabel === "허리/키 비율" ||
                selectedLabel === "어깨/허리 비율" ||
                selectedLabel === "상체/하체 비율";

              let displayValue = `${selectedLabel} 데이터 없음`;

              if (typeof raw === "number") {
                if (selectedLabel === "체중") {
                  displayValue = `${selectedLabel} ${raw.toFixed(1)} kg`;
                } else if (isNumberMetric) {
                  displayValue = `${selectedLabel} ${raw.toFixed(2)}`;
                } else {
                  displayValue = `${selectedLabel} ${mmToCm(raw)} cm`;
                }
              }

              return (
                <HistoryItem key={entry.id}>
                  <div style={{ fontWeight: 800 }}>{formatDateTime(entry.createdAt)}</div>
                  <HistoryMeta>
                    <div>기준 키 {mmToCm(entry.calibrationMm)} cm</div>
                    <div>{displayValue}</div>
                    {typeof confidence === "number" ? (
                      <div>신뢰도 {Math.round(confidence * 100)}%</div>
                    ) : null}
                  </HistoryMeta>
                </HistoryItem>
              );
            })}
          </HistoryList>
        )}
      </Card>
    </Grid>
  );
}