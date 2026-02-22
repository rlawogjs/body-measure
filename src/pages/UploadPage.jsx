import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { fileToDataUrl, isImageFile } from "../utils/image";
import { analyzeImage } from "../api/measureApi";

const Card = styled.div`
  background: rgba(17,24,39,0.72);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  padding: 18px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 16px;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`;

const Sub = styled.p`
  margin: 8px 0 0;
`;

const UploadBox = styled.label`
  display: grid;
  place-items: center;
  border: 1.5px dashed rgba(255,255,255,0.22);
  border-radius: 16px;
  height: 340px;
  cursor: pointer;
  transition: 0.2s ease;
  background: rgba(255,255,255,0.02);

  &:hover { border-color: rgba(255,255,255,0.35); }
`;

const HiddenInput = styled.input` display: none; `;

const Preview = styled.img`
  width: 100%;
  border-radius: 14px;
  border: 1px solid var(--line);
  max-height: 340px;
  object-fit: cover;
`;

const Button = styled.button`
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: ${({ variant }) => (variant === "primary" ? "var(--accent)" : "rgba(255,255,255,0.06)")};
  color: var(--text);
  cursor: pointer;
  font-weight: 700;
  transition: 0.2s ease;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
`;

const Tips = styled.ul`
  margin: 10px 0 0;
  padding-left: 18px;
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

      // ✅ 세션에 저장 (간단 MVP 방식)
      sessionStorage.setItem("bm_imageId", analyzed.imageId);
      sessionStorage.setItem("bm_previewUrl", analyzed.previewUrl);
      sessionStorage.setItem("bm_keypoints", JSON.stringify(analyzed.keypoints));

      nav("/calibrate");
    } catch (err) {
      console.error(err);
      alert("분석 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Grid>
      <Card>
        <TitleRow>
          <h1>전신 사진 업로드</h1>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Step 1</span>
        </TitleRow>
        <Sub>전신이 머리끝~발끝까지 보이게 올려주세요. (정면, 1x 권장)</Sub>

        <Row>
          <Button variant="primary" onClick={onAnalyze} disabled={!canNext}>
            {loading ? "분석 중..." : "다음(포즈 분석)"}
          </Button>
          <Button onClick={() => { setFile(null); setPreviewUrl(""); }}>
            초기화
          </Button>
        </Row>

        <h2 style={{ marginTop: 18 }}>촬영 가이드</h2>
        <Tips>
          <li>카메라는 허리~가슴 높이, 정면 자세</li>
          <li>너무 가까운 광각(왜곡) 피하기, 가능하면 3~5m 거리</li>
          <li>배경은 단색/대비가 있으면 더 정확해요</li>
        </Tips>
      </Card>

      <Card>
        <h2>미리보기</h2>
        <div style={{ marginTop: 12 }}>
          {!previewUrl ? (
            <UploadBox>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>클릭해서 이미지 선택</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  JPG / PNG 권장
                </div>
              </div>
              <HiddenInput type="file" accept="image/*" onChange={onPickFile} />
            </UploadBox>
          ) : (
            <>
              <Preview src={previewUrl} alt="preview" />
              <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 13 }}>
                {file?.name}
              </div>
              <UploadBox style={{ height: 56, marginTop: 10 }}>
                <div style={{ fontWeight: 800 }}>다른 사진 선택</div>
                <HiddenInput type="file" accept="image/*" onChange={onPickFile} />
              </UploadBox>
            </>
          )}
        </div>
      </Card>
    </Grid>
  );
}