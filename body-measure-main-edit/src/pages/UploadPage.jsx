import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { fileToDataUrl, isImageFile } from "../utils/image";
import { analyzeImage } from "../api/measureApi";

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
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

const UploadBox = styled.label`
  margin-top: 18px;
  display: grid;
  place-items: center;
  border: 1.5px dashed var(--line);
  border-radius: 20px;
  min-height: 320px;
  background: var(--paper-2);
  cursor: pointer;
`;

const HiddenInput = styled.input`display:none;`;
const Preview = styled.img`
  width: 100%;
  border-radius: 18px;
  border: 1px solid var(--line);
  max-height: 360px;
  object-fit: cover;
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
  color: ${({ primary }) => (primary ? "white" : "var(--text)")};
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
`;

export default function UploadPage() {
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const canNext = useMemo(() => !!previewUrl && !loading, [previewUrl, loading]);

  async function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!isImageFile(f)) {
      alert("이미지 파일만 업로드할 수 있어요.");
      return;
    }
    setFile(f);
    const url = await fileToDataUrl(f);
    setPreviewUrl(url);
  }

  async function onAnalyze() {
    if (!previewUrl) return;
    setLoading(true);
    try {
      const analyzed = await analyzeImage({ dataUrl: previewUrl });
      sessionStorage.setItem("bm_imageId", analyzed.imageId);
      sessionStorage.setItem("bm_previewUrl", analyzed.previewUrl);
      sessionStorage.setItem("bm_keypoints", JSON.stringify(analyzed.keypoints));
      nav("/calibrate");
    } catch (e) {
      console.error(e);
      alert("분석 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Grid>
      <Card>
        <div style={{ color: "var(--accent-2)", fontSize: 13, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>Uniform Size Capture</div>
        <h1 style={{ color: "var(--accent)", marginTop: 10 }}>군 피복 치수 촬영</h1>
        <p style={{ marginTop: 12 }}>병사 전신 이미지를 촬영하거나 업로드해서 전투복/방한복 사이즈 추천에 필요한 기본 치수를 계산합니다.</p>
        <ButtonRow>
          <Button primary onClick={onAnalyze} disabled={!canNext}>{loading ? "분석 중..." : "다음 단계"}</Button>
          <Button onClick={() => { setFile(null); setPreviewUrl(""); }}>초기화</Button>
        </ButtonRow>
        <div style={{ marginTop: 24 }}>
          <h3>촬영 지침</h3>
          <ul style={{ marginTop: 10, paddingLeft: 18 }}>
            <li>정면에 가깝고 전신이 모두 보이도록 촬영합니다.</li>
            <li>헬멧, 외투, 배낭 등 윤곽을 크게 가리는 물체는 피합니다.</li>
            <li>군 피복 추천은 기준 키 입력과 함께 계산됩니다.</li>
          </ul>
        </div>
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>미리보기</h2>
        {!previewUrl ? (
          <UploadBox>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800 }}>이미지 선택</div>
              <p style={{ marginTop: 8 }}>JPG / PNG 파일을 권장합니다.</p>
            </div>
            <HiddenInput type="file" accept="image/*" onChange={onPickFile} />
          </UploadBox>
        ) : (
          <>
            <div style={{ marginTop: 16 }}><Preview src={previewUrl} alt="preview" /></div>
            <p style={{ marginTop: 12 }}>{file?.name}</p>
            <UploadBox style={{ minHeight: 64, marginTop: 14 }}>
              <strong>다른 이미지 선택</strong>
              <HiddenInput type="file" accept="image/*" onChange={onPickFile} />
            </UploadBox>
          </>
        )}
      </Card>
    </Grid>
  );
}
