import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { measureWithCalibration } from "../api/measureApi";

const Card = styled.div`
  background: rgba(17,24,39,0.72);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  padding: 18px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: ${({ variant }) => (variant === "primary" ? "var(--accent)" : "rgba(255,255,255,0.06)")};
  color: var(--text);
  cursor: pointer;
  font-weight: 700;
`;

const Table = styled.div`
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.6fr 0.6fr;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid var(--line);
  align-items: center;

  &:first-child { border-top: 0; background: rgba(255,255,255,0.03); font-weight: 800; }
`;

const Pill = styled.span`
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.04);
  color: var(--muted);
  font-size: 12px;
`;

function mmToCm(mm) {
  return (mm / 10).toFixed(1);
}

export default function ResultPage() {
  const nav = useNavigate();
  const calibrationMm = Number(sessionStorage.getItem("bm_calibrationMm") || "0");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  const ok = useMemo(() => calibrationMm >= 1000, [calibrationMm]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!ok) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await measureWithCalibration({ calibrationMm });
        if (mounted) setResult(res);
      } catch (e) {
        console.error(e);
        alert("측정 중 오류가 발생했어요.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => { mounted = false; };
  }, [ok, calibrationMm]);

  if (!ok) {
    return (
      <Card>
        <h1>결과</h1>
        <p>기준 길이(키) 입력이 없어요. 기준 입력부터 진행해 주세요.</p>
        <Button variant="primary" onClick={() => nav("/calibrate")}>기준 입력으로</Button>
      </Card>
    );
  }

  return (
    <Grid>
      <Card>
        <h1>측정 결과</h1>
        <p>
          현재는 서버가 없어서 “예시 데이터”로 보여줘요. 나중에 AI 서버 연결하면 실제 측정값으로 바뀝니다.
        </p>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Pill>기준: 키 {mmToCm(calibrationMm)} cm</Pill>
          {result?.scaleMmPerPx ? <Pill>스케일(예시): {result.scaleMmPerPx} mm/px</Pill> : null}
        </div>

        <div style={{ marginTop: 14 }}>
          <Table>
            <Row>
              <div>항목</div>
              <div>길이(cm)</div>
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
                  <div style={{ fontWeight: 700 }}>{m.label}</div>
                  <div>{mmToCm(m.mm)}</div>
                  <div>{Math.round(m.confidence * 100)}%</div>
                </Row>
              ))
            )}
          </Table>
        </div>

        <ButtonRow style={{ marginTop: 14 }}>
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
        <h2>다음 단계(구현 예정)</h2>
        <p>
          1) 업로드 이미지 위에 키포인트/측정 선 오버레이 표시<br />
          2) 정면 여부/가림 여부 판단해서 “신뢰도” 자동 조정<br />
          3) 서버 연결: 포즈 추정 → 픽셀 길이 → 스케일 → 부위별 실제 길이
        </p>
      </Card>
    </Grid>
  );
}