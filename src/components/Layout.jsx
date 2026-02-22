import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Stepper from "./Stepper";
import { theme } from "../styles/theme";

const Wrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(11,15,25,0.6);
  border-bottom: 1px solid var(--line);
`;

const HeaderInner = styled.div`
  max-width: ${theme.maxWidth}px;
  margin: 0 auto;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
`;

const Brand = styled.button`
  background: transparent;
  border: 0;
  color: var(--text);
  font-weight: 800;
  letter-spacing: -0.02em;
  font-size: 16px;
  cursor: pointer;
`;

const Main = styled.main`
  width: 100%;
  max-width: ${theme.maxWidth}px;
  margin: 0 auto;
  padding: 18px 16px 40px;
`;

const Footer = styled.footer`
  max-width: ${theme.maxWidth}px;
  width: 100%;
  margin: 0 auto;
  padding: 18px 16px 30px;
  border-top: 1px solid var(--line);
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
  const loc = useLocation();
  const nav = useNavigate();
  const step = getStep(loc.pathname);

  return (
    <Wrap>
      <Header>
        <HeaderInner>
          <Brand onClick={() => nav("/upload")}>BodyMeasure</Brand>
          <Stepper step={step} />
        </HeaderInner>
      </Header>

      <Main>
        <Outlet />
      </Main>

      <Footer>
        사진 기반 측정은 촬영 각도/거리/자세에 따라 오차가 발생할 수 있어요. 결과는 참고용입니다.
      </Footer>
    </Wrap>
  );
}