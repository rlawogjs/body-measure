import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Grid = styled.div`
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 20px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;
const Card = styled.section`
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 28px;
  box-shadow: var(--shadow);
  padding: 28px;
`;
const Input = styled.input`
  width: 100%;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1.5px solid var(--line);
  background: #fcfaf6;
  color: var(--text);
`;
const ButtonRow = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;
const Button = styled.button.withConfig({ shouldForwardProp: (prop) => prop !== "$primary" })`
  border: 1.5px solid ${({ $primary }) => ($primary ? "var(--accent)" : "var(--line)")};
  background: ${({ $primary }) => ($primary ? "var(--accent)" : "var(--paper-2)")};
  color: ${({ $primary }) => ($primary ? "white" : "var(--text)")};
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
`;
const Preview = styled.img`
  width: 100%;
  border-radius: 18px;
  border: 1px solid var(--line);
  max-height: 460px;
  object-fit: cover;
`;

export default function CalibratePage() {
  const nav = useNavigate();
  const previewUrl = sessionStorage.getItem("bm_previewUrl") || "";
  const [heightCm, setHeightCm] = useState("");
  const heightMm = useMemo(() => {
    const n = Number(heightCm);
    return Number.isFinite(n) ? Math.round(n * 10) : 0;
  }, [heightCm]);
  const canNext = useMemo(() => !!previewUrl && heightMm >= 1000 && heightMm <= 2500, [previewUrl, heightMm]);

  function goNext() {
    sessionStorage.setItem("bm_calibrationMm", String(heightMm));
    nav("/result");
  }

  if (!previewUrl) {
    return (
      <Card>
        <h2 style={{ color: "var(--accent)" }}>기준 입력</h2>
        <p style={{ marginTop: 10 }}>먼저 업로드 단계에서 이미지를 등록해 주세요.</p>
        <ButtonRow><Button $primary onClick={() => nav("/upload")}>업로드로 이동</Button></ButtonRow>
      </Card>
    );
  }

  return (
    <Grid>
      <Card>
        <div style={{ color: "var(--accent-2)", fontSize: 13, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>Calibration</div>
        <h1 style={{ color: "var(--accent)", marginTop: 10 }}>기준 길이 입력</h1>
        <p style={{ marginTop: 12 }}>실제 키를 입력해 측정 스케일을 보정합니다. 저장 시 서버 DB 기준 기록과 추천 사이즈가 함께 계산됩니다.</p>
        <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
          <label style={{ fontWeight: 800 }}>키 (cm)</label>
          <Input inputMode="decimal" placeholder="예: 173" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          <p>허용 범위 100~250cm · 현재값 {heightMm ? `${(heightMm / 10).toFixed(1)} cm` : "-"}</p>
        </div>
        <ButtonRow>
          <Button onClick={() => nav("/upload")}>이전</Button>
          <Button $primary disabled={!canNext} onClick={goNext}>결과 계산</Button>
        </ButtonRow>
      </Card>
      <Card>
        <h2 style={{ color: "var(--accent)" }}>참조 이미지</h2>
        <div style={{ marginTop: 18 }}><Preview src={previewUrl} alt="preview" /></div>
      </Card>
    </Grid>
  );
}
