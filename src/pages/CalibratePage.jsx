import React, { useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

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
  grid-template-columns: 0.95fr 1.05fr;
  gap: 20px;

  @media (max-width: 900px){
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 28px;
  box-shadow: var(--shadow);
  overflow: hidden;
  animation: ${rise} 0.75s ease both;
`;

const Left = styled(Panel)`
  padding: 24px;
`;

const Right = styled(Panel)`
  padding: 28px;
`;

const Bubble = styled.div`
  display: inline-grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 999px;
  background: #eee6c8;
  border: 1px solid var(--line);
  color: var(--accent);
  font-weight: 900;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  color: var(--accent);
`;

const Desc = styled.p`
  margin-top: 10px;
`;

const InputWrap = styled.div`
  margin-top: 22px;
  display: grid;
  gap: 10px;
`;

const Label = styled.div`
  font-weight: 800;
  color: var(--text);
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1.5px solid var(--line);
  background: #fcfaf6;
  color: var(--text);
  font-size: 18px;
  outline: none;

  &:focus{
    border-color: var(--accent);
    box-shadow: 0 0 0 5px rgba(108, 88, 71, 0.08);
  }
`;

const Tips = styled.div`
  margin-top: 20px;
  display: grid;
  gap: 10px;
`;

const Tip = styled.div`
  border: 1px solid var(--line-soft);
  background: var(--paper-2);
  border-radius: 16px;
  padding: 14px 16px;
`;

const ButtonRow = styled.div`
  margin-top: 22px;
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

  &:disabled{
    opacity: .5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ImageBox = styled.div`
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: linear-gradient(180deg, #f5efe7, #e9dfd0);
  min-height: 420px;
  display: grid;
  place-items: center;
`;

const Preview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export default function CalibratePage() {
  const nav = useNavigate();
  const previewUrl = sessionStorage.getItem("bm_previewUrl") || "";
  const [heightCm, setHeightCm] = useState("");

  const heightMm = useMemo(() => {
    const n = Number(heightCm);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 10);
  }, [heightCm]);

  const canNext = useMemo(() => {
    return !!previewUrl && heightMm >= 1000 && heightMm <= 2500;
  }, [previewUrl, heightMm]);

  function goNext() {
    sessionStorage.setItem("bm_calibrationMm", String(heightMm));
    nav("/result");
  }

  if (!previewUrl) {
    return (
      <Left>
        <Title>기준 입력</Title>
        <Desc>업로드된 이미지가 없어 먼저 업로드 단계로 이동해야 합니다.</Desc>
        <ButtonRow>
          <Button primary onClick={() => nav("/upload")}>업로드로 이동</Button>
        </ButtonRow>
      </Left>
    );
  }

  return (
    <Grid>
      <Left>
        <Bubble>02</Bubble>
        <Title>기준 길이 입력</Title>
        <Desc>
          사진만으로는 실제 길이를 알 수 없기 때문에 사용자의 키를 입력해서
          전체 측정값을 보정합니다.
        </Desc>

        <InputWrap>
          <Label>키 입력 (cm)</Label>
          <Input
            inputMode="decimal"
            placeholder="예: 173"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
          />
          <p>
            허용 범위: 100 ~ 250cm
            {" · "}
            현재값: {heightMm ? `${(heightMm / 10).toFixed(1)} cm` : "-"}
          </p>
        </InputWrap>

        <Tips>
          <Tip>신발을 신지 않은 실제 키에 가까운 값을 넣는 것이 좋습니다.</Tip>
          <Tip>사진 속 자세가 과하게 구부정하면 보정이 달라질 수 있습니다.</Tip>
          <Tip>이 단계가 끝나면 결과표와 변화 그래프를 확인할 수 있습니다.</Tip>
        </Tips>

        <ButtonRow>
          <Button onClick={() => nav("/upload")}>이전 단계</Button>
          <Button primary disabled={!canNext} onClick={goNext}>
            결과 보러가기
          </Button>
        </ButtonRow>
      </Left>

      <Right>
        <Title>참조 이미지</Title>
        <Desc>현재 보정에 사용되는 업로드 이미지입니다.</Desc>

        <div style={{ marginTop: 18 }}>
          <ImageBox>
            <Preview src={previewUrl} alt="업로드 이미지" />
          </ImageBox>
        </div>
      </Right>
    </Grid>
  );
}