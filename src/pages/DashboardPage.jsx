import React, { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { getAllIssues, getAllMeasurements, getMyIssues, getMyMeasurements, getUsers } from "../api/serverApi";
import { getCurrentUser, isPrivileged } from "../utils/authStorage";
import { formatDateTime } from "../utils/measurementHistory";

const rise = keyframes`from {opacity:0; transform:translateY(22px);} to {opacity:1; transform:translateY(0);} `;
const Grid = styled.div`display:grid; gap:18px;`;
const Hero = styled.section`background:var(--paper); border:1.5px solid var(--line); border-radius:28px; box-shadow:var(--shadow); padding:28px; animation:${rise} .8s ease both;`;
const HeroTop = styled.div`display:flex; justify-content:space-between; gap:14px; align-items:flex-start; flex-wrap:wrap;`;
const Rec = styled.div`font-size:12px; color:var(--accent); font-weight:900; letter-spacing:.08em;`;
const HeroTitle = styled.h1`margin-top:12px; color:var(--accent);`;
const HeroDesc = styled.p`margin-top:10px; max-width:760px;`;
const BadgeRow = styled.div`margin-top:18px; display:flex; gap:10px; flex-wrap:wrap;`;
const Pill = styled.div`border:1px solid var(--line); background:var(--paper-2); padding:8px 12px; border-radius:999px; font-size:12px; color:var(--muted); font-weight:700;`;
const CardGrid = styled.div`display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; @media (max-width:980px){grid-template-columns:repeat(2,minmax(0,1fr));} @media (max-width:640px){grid-template-columns:1fr;}`;
const StatCard = styled.section`background:var(--paper); border:1.5px solid var(--line); border-radius:24px; box-shadow:var(--shadow-soft); padding:20px; animation:${rise} .9s ease both;`;
const StatLabel = styled.div`color:var(--muted); font-size:13px; font-weight:700;`;
const StatValue = styled.div`margin-top:10px; font-size:clamp(28px,4vw,42px); line-height:1; font-weight:900; color:var(--accent);`;
const StatSub = styled.div`margin-top:10px; color:var(--muted); font-size:13px;`;
const Card = styled.section`background:var(--paper); border:1.5px solid var(--line); border-radius:28px; box-shadow:var(--shadow-soft); padding:24px; animation:${rise} 1s ease both;`;
const SectionTitle = styled.h2`color:var(--accent);`;
const SectionDesc = styled.p`margin-top:10px;`;
const ActionGrid = styled.div`margin-top:18px; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; @media (max-width:900px){grid-template-columns:1fr;}`;
const ActionCard = styled(Link)`display:block; border:1px solid var(--line-soft); background:var(--paper-2); border-radius:20px; padding:18px; transition:transform .18s ease, box-shadow .18s ease; &:hover{transform:translateY(-2px); box-shadow:var(--shadow-soft);} `;
const ActionTitle = styled.div`font-weight:900; color:var(--text);`;
const ActionText = styled.p`margin-top:8px;`;
const List = styled.div`margin-top:18px; display:grid; gap:12px;`;
const ListItem = styled.div`border:1px solid var(--line-soft); background:var(--paper-2); border-radius:18px; padding:14px 16px;`;
const ListTitle = styled.div`font-weight:800; color:var(--text);`;
const Meta = styled.div`margin-top:6px; display:flex; gap:10px; flex-wrap:wrap; color:var(--muted); font-size:13px;`;
const EmptyState = styled.div`margin-top:18px; border:1.5px dashed var(--line); background:var(--paper-2); border-radius:20px; padding:22px; color:var(--muted);`;

function mmToCm(mm) { const n = Number(mm); return Number.isFinite(n) ? (n / 10).toFixed(1) : "-"; }
function getRoleLabel(role) { return role === "admin" ? "관리자" : role === "logistics" ? "군수담당" : "병사"; }

export default function DashboardPage() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const privileged = isPrivileged(currentUser);
  const [records, setRecords] = useState([]);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const tasks = privileged
          ? [getAllMeasurements(), getAllIssues(), getUsers()]
          : [getMyMeasurements(), getMyIssues(), Promise.resolve([currentUser])];
        const [measurementRows, issueRows, userRows] = await Promise.all(tasks);
        setRecords(Array.isArray(measurementRows) ? measurementRows : []);
        setIssues(Array.isArray(issueRows) ? issueRows : []);
        setUsers(Array.isArray(userRows) ? userRows : []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [privileged, currentUser]);

  const latestRecord = records[0] || null;
  const latestIssue = issues[0] || null;

  return (
    <Grid>
      <Hero>
        <HeroTop>
          <div>
            <Rec>● DASHBOARD</Rec>
            <HeroTitle>B-MAS Military Dashboard</HeroTitle>
            <HeroDesc>개인 측정 기록, 최근 지급 이력, 관리 현황을 서버 DB 기준으로 확인하는 대시보드입니다.</HeroDesc>
          </div>
        </HeroTop>
        <BadgeRow>
          <Pill>현재 사용자 {currentUser?.name || currentUser?.username || "-"}</Pill>
          <Pill>권한 {getRoleLabel(currentUser?.role)}</Pill>
          <Pill>소속 {currentUser?.unit || "-"}</Pill>
          <Pill>계급 {currentUser?.rank || "-"}</Pill>
        </BadgeRow>
      </Hero>

      <CardGrid>
        <StatCard><StatLabel>{privileged ? "관리 중 사용자" : "내 측정 기록 수"}</StatLabel><StatValue>{privileged ? users.length : records.length}</StatValue><StatSub>DB 저장 기준</StatSub></StatCard>
        <StatCard><StatLabel>최근 키</StatLabel><StatValue>{latestRecord ? `${mmToCm(latestRecord.height_mm)}cm` : "-"}</StatValue><StatSub>가장 최근 측정 기준</StatSub></StatCard>
        <StatCard><StatLabel>최근 체중 / BMI</StatLabel><StatValue style={{ fontSize: "28px" }}>{latestRecord ? `${Number(latestRecord.weight_kg).toFixed(1)}kg` : "-"}</StatValue><StatSub>BMI {latestRecord ? Number(latestRecord.bmi).toFixed(2) : "-"}</StatSub></StatCard>
        <StatCard><StatLabel>{privileged ? "전체 지급 이력" : "내 지급 이력"}</StatLabel><StatValue style={{ fontSize: "28px" }}>{issues.length}</StatValue><StatSub>{privileged ? "관리자 기준 전체 건수" : "내 지급/추천 기록"}</StatSub></StatCard>
      </CardGrid>

      <Card>
        <SectionTitle>빠른 작업</SectionTitle>
        <SectionDesc>자주 사용하는 메뉴로 바로 이동할 수 있습니다.</SectionDesc>
        <ActionGrid>
          <ActionCard to="/upload"><ActionTitle>새 측정 시작</ActionTitle><ActionText>전신 사진 업로드부터 다시 진행해서 새 측정 기록을 저장합니다.</ActionText></ActionCard>
          <ActionCard to="/result"><ActionTitle>최근 결과 확인</ActionTitle><ActionText>가장 최근 측정 결과와 변화 그래프를 확인합니다.</ActionText></ActionCard>
          <ActionCard to={privileged ? "/admin" : "/result"}><ActionTitle>{privileged ? "관리자 페이지" : "내 기록 보기"}</ActionTitle><ActionText>{privileged ? "전체 사용자, 측정, 지급 이력을 통합 관리합니다." : "내 기록과 추천 사이즈를 확인합니다."}</ActionText></ActionCard>
        </ActionGrid>
      </Card>

      <Card>
        <SectionTitle>최근 측정 기록</SectionTitle>
        <SectionDesc>{privileged ? "전체 시스템 기준 최근 측정 기록입니다." : "내 최근 측정 기록입니다."}</SectionDesc>
        {!records.length ? <EmptyState>저장된 측정 기록이 없습니다.</EmptyState> : (
          <List>
            {records.slice(0, 5).map((entry) => (
              <ListItem key={entry.id}>
                <ListTitle>{formatDateTime(entry.created_at)}</ListTitle>
                <Meta>
                  <div>키 {mmToCm(entry.height_mm)}cm</div>
                  <div>체중 {Number(entry.weight_kg).toFixed(1)}kg</div>
                  <div>BMI {Number(entry.bmi).toFixed(2)}</div>
                </Meta>
              </ListItem>
            ))}
          </List>
        )}
      </Card>

      <Card>
        <SectionTitle>최근 피복 지급/추천</SectionTitle>
        <SectionDesc>{privileged ? "전체 지급 및 추천 이력입니다." : "내 최근 지급 및 추천 이력입니다."}</SectionDesc>
        {!issues.length ? <EmptyState>지급 이력이 없습니다.</EmptyState> : (
          <List>
            {issues.slice(0, 5).map((entry) => (
              <ListItem key={entry.id}>
                <ListTitle>{entry.item_name} · {entry.size}</ListTitle>
                <Meta>
                  <div>수량 {entry.quantity}</div>
                  <div>상태 {entry.status}</div>
                  <div>{formatDateTime(entry.issued_at)}</div>
                </Meta>
              </ListItem>
            ))}
          </List>
        )}
      </Card>
    </Grid>
  );
}
