import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Card = styled.div`
  background: rgba(17,24,39,0.72);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  padding: 18px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 16px;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;

const Preview = styled.img`
  width: 100%;
  border-radius: 14px;
  border: 1px solid var(--line);
  max-height: 420px;
  object-fit: cover;
`;

const Field = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 12px;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 80px;
  gap: 10px;
`;

const Input = styled.input`
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.06);
  color: var(--text);
  outline: none;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 14px;
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
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export default function CalibratePage() {
  const nav = useNavigate();
  const previewUrl = sessionStorage.getItem("bm_previewUrl") || "";
  const [heightCm, setHeightCm] = useState("");
  const heightMm = useMemo(() => {
    const n = Number(heightCm);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 10); // cm -> mm
  }, [heightCm]);

  const canNext = useMemo(() => previewUrl && heightMm >= 1000 && heightMm <= 2500, [previewUrl, heightMm]);

  function goNext() {
    sessionStorage.setItem("bm_calibrationMm", String(heightMm));
    nav("/result");
  }

  if (!previewUrl) {
    return (
      <Card>
        <h1>기준 입력</h1>
        <p>업로드된 사진이 없어요. 먼저 사진을 업로드해 주세요.</p>
        <Button variant="primary" onClick={() => nav("/upload")}>업로드로</Button>
      </Card>
    );
  }

  return (
    <Grid>
      <Card>
        <h1>기준 길이 입력</h1>
        <p>스케일(비례율)을 만들기 위해 “실제 길이”가 확실한 값을 입력해요. (MVP는 키 입력)</p>

        <Field>
          <label style={{ fontWeight: 800 }}>키(신장)</label>
          <InputRow>
            <Input
              inputMode="decimal"
              placeholder="예: 173"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />
            <div style={{ display: "grid", placeItems: "center", color: "var(--muted)" }}>cm</div>
          </InputRow>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            허용 범위: 100~250cm (현재: {heightMm ? `${(heightMm / 10).toFixed(1)}cm` : "-"})
          </div>
        </Field>

        <ButtonRow>
          <Button onClick={() => nav("/upload")}>이전</Button>
          <Button variant="primary" onClick={goNext} disabled={!canNext}>
            다음(측정 결과)
          </Button>
        </ButtonRow>

        <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
          <h2>정확도 팁</h2>
          <p>정면/거리/렌즈(1x)에 따라 오차가 크게 바뀝니다. 결과 화면에서 신뢰도도 함께 제공할 예정이에요.</p>
        </div>
      </Card>

      <Card>
        <h2>미리보기</h2>
        <div style={{ marginTop: 12 }}>
          <Preview src={previewUrl} alt="preview" />
        </div>
        <p style={{ marginTop: 10 }}>
          다음 단계에서 “측정 오버레이(선/점)”를 여기에 그려서 사용자 신뢰도를 올릴 수 있어요.
        </p>
      </Card>
    </Grid>
  );
}