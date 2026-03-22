import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import Stepper from "./Stepper";
import { getCurrentUser, logout } from "../utils/authStorage";

const fadeDown = keyframes`from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); }`;
const Wrap = styled.div`min-height:100vh;`;
const Header = styled.header`position:sticky; top:0; z-index:20; background:rgba(248,245,239,0.92); backdrop-filter:blur(8px); border-bottom:1px solid var(--line-soft); animation:${fadeDown} .6s ease;`;
const HeaderInner = styled.div`max-width:var(--max); margin:0 auto; padding:16px 20px; display:flex; gap:14px; justify-content:space-between; align-items:center;`;
const BrandWrap = styled.button`border:0; background:transparent; cursor:pointer; display:grid; gap:2px; color:inherit; text-align:left;`;
const Kicker = styled.div`color:var(--muted); font-size:12px; letter-spacing:.14em; text-transform:uppercase;`;
const Brand = styled.div`color:var(--accent); font-weight:900; font-size:34px; letter-spacing:.05em;`;
const Right = styled.div`display:flex; gap:14px; align-items:center; flex-wrap:wrap; justify-content:flex-end;`;
const UserBox = styled.div`display:grid; gap:2px; color:var(--muted); font-size:12px;`;
const Action = styled.button`border:1.5px solid var(--line); background:var(--paper-2); color:var(--text); padding:10px 14px; border-radius:999px; font-weight:800; cursor:pointer;`;
const Main = styled.main`max-width:var(--max); margin:0 auto; padding:26px 20px 40px;`;
const Footer = styled.footer`max-width:var(--max); margin:0 auto; padding:0 20px 40px; color:var(--muted); font-size:13px;`;
function getStep(pathname) { if (pathname.startsWith("/upload")) return 1; if (pathname.startsWith("/calibrate")) return 2; if (pathname.startsWith("/result")) return 3; return 0; }

export default function Layout() {
  const nav = useNavigate();
  const loc = useLocation();
  const user = getCurrentUser();
  const step = getStep(loc.pathname);

  return (
    <Wrap>
      <Header>
        <HeaderInner>
          <BrandWrap onClick={() => nav(user ? "/dashboard" : "/login")}>
            <Kicker>Military Body · Measure & Issue System</Kicker>
            <Brand>B-MAS</Brand>
          </BrandWrap>
          <Right>
            {step > 0 ? <Stepper step={step} /> : null}
            {user ? <>
              <UserBox><strong style={{ color: "var(--text)", fontSize: 13 }}>{user.name} · {user.rank || "-"}</strong><span>{user.unit || "-"}</span></UserBox>
              <Action onClick={() => nav("/dashboard")}>대시보드</Action>
              <Action onClick={() => { logout(); nav("/login"); }}>로그아웃</Action>
            </> : <Action onClick={() => nav("/login")}>로그인</Action>}
          </Right>
        </HeaderInner>
      </Header>
      <Main><Outlet /></Main>
      <Footer>현재 버전은 서버 API와 DB를 기준으로 동작하는 군 피복·치수 관리 프로토타입입니다.</Footer>
    </Wrap>
  );
}
