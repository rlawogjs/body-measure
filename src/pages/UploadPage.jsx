import React, { useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { fileToDataUrl, isImageFile } from "../utils/image";
import { analyzeImage } from "../api/measureApi";

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: .86; }
  50% { transform: scale(1.04); opacity: 1; }
  100% { transform: scale(1); opacity: .86; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
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
  animation: ${rise} 0.8s ease both;
`;

const Hero = styled(Panel)`
  padding: 28px;
  position: relative;
`;

const HeroTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const Rec = styled.div`
  font-size: 12px;
  color: var(--accent);
  font-weight: 800;
  letter-spacing: 0.08em;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Badge = styled.div`
  border: 1px solid var(--line);
  background: var(--paper-2);
  color: var(--muted);
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
`;

const Kicker = styled.div`
  margin-top: 22px;
  color: var(--accent-2);
  font-size: 14px;
  font-weight: 700;
`;

const BigTitle = styled.h1`
  margin-top: 10px;
  color: var(--accent);
`;

const Subtitle = styled.p`
  margin-top: 12px;
  max-width: 560px;
`;

const PaperImage = styled.div`
  margin-top: 28px;
  background: linear-gradient(180deg, #f4eee5, #e8dece);
  border: 1px solid var(--line);
  min-height: 250px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  overflow: hidden;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceHolder = styled.div`
  padding: 28px;
  text-align: center;
  color: var(--muted);
`;

const BottomLine = styled.div`
  margin-top: 20px;
  border-top: 1px solid var(--line-soft);
  padding-top: 16px;
  display: grid;
  gap: 8px;
`;

const RightPanel = styled(Panel)`
  padding: 24px;
`;

const SectionTitle = styled.h2`
  color: var(--accent);
`;

const SectionDesc = styled.p`
  margin-top: 10px;
`;

const UploadBox = styled.label`
  margin-top: 18px;
  display: grid;
  gap: 12px;
  border: 1.5px dashed var(--line);
  background: var(--paper-2);
  border-radius: 22px;
  padding: 24px;
  cursor: pointer;
  transition: transform .2s ease, border-color .2s ease, background .2s ease;

  &:hover{
    transform: translateY(-2px);
    border-color: var(--accent-2);
    background: #f6f1e9;
  }
`;

const UploadIcon = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: white;
  display: grid;
  place-items: center;
  color: var(--accent);
  font-size: 24px;
  animation: ${pulse} 2.4s ease-in-out infinite;
`;

const HiddenInput = styled.input`
  display: none;
`;

const GuideList = styled.div`
  margin-top: 18px;
  display: grid;
  gap: 10px;
`;

const GuideItem = styled.div`
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid var(--line-soft);
  background: rgba(255,255,255,0.4);
  color: var(--text);
`;

const ButtonRow = styled.div`
  margin-top: 20px;
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
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
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
      alert("이미지 분석 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Grid>
      <Hero>
        <HeroTop>
          <Rec>● REC</Rec>
          <BadgeRow>
            <Badge>HD</Badge>
            <Badge>4K</Badge>
            <Badge>25FPS</Badge>
          </BadgeRow>
        </HeroTop>

        <Kicker>Body · Measure Assistant Service</Kicker>
        <BigTitle>B-MAS</BigTitle>
        <Subtitle>
          AI 기반 의류 사이즈 측정 서비스를 위한 업로드 단계입니다.
          전신이 잘 보이는 사진을 올리면 다음 단계에서 기준 길이를 입력할 수 있어요.
        </Subtitle>

        <PaperImage>
          {previewUrl ? (
            <PreviewImage src={previewUrl} alt="미리보기" />
          ) : (
            <PlaceHolder>
              업로드된 이미지가 여기에 표시됩니다.
              <br />
              정면에 가깝고 전신이 잘 보이는 이미지를 권장합니다.
            </PlaceHolder>
          )}
        </PaperImage>

        <BottomLine>
          <p>현재 선택 파일: {file ? file.name : "없음"}</p>
          <p>배경이 단순하고 신체 윤곽이 잘 보이는 사진일수록 결과가 안정적입니다.</p>
        </BottomLine>
      </Hero>

      <RightPanel>
        <SectionTitle>사진 업로드</SectionTitle>
        <SectionDesc>
          스마트폰 갤러리 또는 촬영한 이미지를 업로드해 주세요.
        </SectionDesc>

        <UploadBox>
          <UploadIcon>↑</UploadIcon>
          <div style={{ fontWeight: 800 }}>이미지 선택</div>
          <p>클릭해서 이미지를 업로드하세요. PNG, JPG, JPEG 파일을 권장합니다.</p>
          <HiddenInput type="file" accept="image/*" onChange={onPickFile} />
        </UploadBox>

        <GuideList>
          <GuideItem>1. 상·하체가 모두 보이는 사진을 사용해 주세요.</GuideItem>
          <GuideItem>2. 몸이 너무 기울거나 과하게 회전된 사진은 피해주세요.</GuideItem>
          <GuideItem>3. 너무 헐렁한 옷은 오차를 키울 수 있습니다.</GuideItem>
          <GuideItem>4. 다음 단계에서 실제 키를 입력해 보정합니다.</GuideItem>
        </GuideList>

        <ButtonRow>
          <Button primary onClick={onAnalyze} disabled={!canNext}>
            {loading ? "분석 중..." : "다음 단계로"}
          </Button>
          <Button
            onClick={() => {
              setFile(null);
              setPreviewUrl("");
            }}
          >
            초기화
          </Button>
        </ButtonRow>
      </RightPanel>
    </Grid>
  );
}