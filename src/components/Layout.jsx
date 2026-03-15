import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const fadeDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const floatIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(26px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Wrap = styled.div`
  min-height: 100vh;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(248, 245, 239, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line-soft);
  animation: ${fadeDown} 0.7s ease;
`;

const HeaderInner = styled.div`
  max-width: var(--max);
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
`;

const BrandWrap = styled.div`
  display: grid;
  gap: 2px;
  cursor: pointer;
`;

const BrandKicker = styled.div`
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
`;

const Brand = styled.div`
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 0.06em;
  color: var(--accent);
`;

const StepWrap = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
`;

const Step = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  color: ${({ active }) => (active ? "var(--accent)" : "var(--muted)")};
  font-weight: ${({ active }) => (active ? 800 : 500)};
`;

const StepDot = styled.div`
  width: 11px;
  height: 11px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: ${({ active }) => (active ? "var(--accent)" : "transparent")};
  box-shadow: ${({ active }) =>
    active ? "0 0 0 5px rgba(108, 88, 71, 0.12)" : "none"};
`;

const Main = styled.main`
  max-width: var(--max);
  margin: 0 auto;
  padding: 28px 20px 44px;
  animation: ${floatIn} 0.8s ease;
`;

const Footer = styled.footer`
  max-width: var(--max);
  margin: 0 auto;
  padding: 0 20px 40px;
  color: var(--muted);
  font-size: 13px;
`;

function getStep(pathname) {
  if (pathname.startsWith("/upload")) return 1;
  if (pathname.startsWith("/calibrate")) return 2;
  if (pathname.startsWith("/result")) return 3;
  return 1;
}

export default function Layout() {
  const nav = useNavigate();
  const loc = useLocation();
  const step = getStep(loc.pathname);

  return (
    <Wrap>
      <Header>
        <HeaderInner>
          <BrandWrap onClick={() => nav("/upload")}>
            <BrandKicker>Body · Measure Assistant Service</BrandKicker>
            <Brand>B-MAS</Brand>
          </BrandWrap>

          <StepWrap>
            <Step active={step >= 1}>
              <StepDot active={step >= 1} />
              업로드
            </Step>
            <Step active={step >= 2}>
              <StepDot active={step >= 2} />
              기준 입력
            </Step>
            <Step active={step >= 3}>
              <StepDot active={step >= 3} />
              결과 확인
            </Step>
          </StepWrap>
        </HeaderInner>
      </Header>

      <Main>
        <Outlet />
      </Main>

      <Footer>
        사진 기반 측정값은 촬영 각도, 거리, 자세, 의류 두께에 따라 오차가 발생할 수 있습니다.
      </Footer>
    </Wrap>
  );
}