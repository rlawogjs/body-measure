import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { fetchMe, getLogisticsOptions, getMyIssues, getMyMeasurements, updateProfile } from "../api/serverApi";
import { getCurrentUser, isPrivileged } from "../utils/authStorage";
import { formatDateTime } from "../utils/measurementHistory";

const Grid = styled.div`display:grid; gap:18px;`;
const Card = styled.section`background:var(--paper); border:1.5px solid var(--line); border-radius:28px; box-shadow:var(--shadow-soft); padding:24px;`;
const Hero = styled(Card)``;
const BadgeRow = styled.div`margin-top:18px; display:flex; gap:10px; flex-wrap:wrap;`;
const Pill = styled.div`border:1px solid var(--line); background:var(--paper-2); padding:8px 12px; border-radius:999px; font-size:12px; color:var(--muted); font-weight:700;`;
const StatGrid = styled.div`display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; @media (max-width:980px){grid-template-columns:repeat(2,minmax(0,1fr));} @media (max-width:640px){grid-template-columns:1fr;}`;
const StatCard = styled(Card)``;
const ActionGrid = styled.div`display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; margin-top:18px; @media (max-width:900px){grid-template-columns:1fr;}`;
const ActionCard = styled(Link)`display:block; border:1px solid var(--line-soft); background:var(--paper-2); border-radius:20px; padding:18px;`;
const Select = styled.select`width:100%; padding:13px 14px; border-radius:14px; border:1.5px solid var(--line); background:#fcfaf6; color:var(--text); margin-top:10px;`;
const Button = styled.button`margin-top:14px; border:1.5px solid var(--accent); background:var(--accent); color:#fff; padding:11px 16px; border-radius:999px; font-weight:800; cursor:pointer;`;
const List = styled.div`display:grid; gap:12px; margin-top:16px;`;
const ListItem = styled.div`border:1px solid var(--line-soft); background:var(--paper-2); border-radius:18px; padding:14px 16px;`;

function roleLabel(role) {
  if (role === "admin") return "관리자";
  if (role === "logistics") return "군수담당";
  if (role === "officer") return "간부";
  return "병사";
}
function approvalLabel(status) {
  return status === "approved" ? "승인 완료" : status === "rejected" ? "반려" : "승인 대기";
}
function mmToCm(mm) {
  const n = Number(mm);
  return Number.isFinite(n) ? (n / 10).toFixed(1) : "-";
}

export default function DashboardPage() {
  const [user, setUser] = useState(getCurrentUser());
  const [records, setRecords] = useState([]);
  const [issues, setIssues] = useState([]);
  const [logisticsOptions, setLogisticsOptions] = useState([]);
  const [assignedLogisticsId, setAssignedLogisticsId] = useState(String(getCurrentUser()?.assigned_logistics_id || ""));
  const [profileMessage, setProfileMessage] = useState("");
  const privileged = isPrivileged(user);

  async function load() {
    try {
      const [me, measurementRows, issueRows, logisticsRows] = await Promise.all([
        fetchMe(),
        getMyMeasurements().catch(() => []),
        getMyIssues().catch(() => []),
        getLogisticsOptions().catch(() => []),
      ]);
      setUser(me);
      setAssignedLogisticsId(String(me?.assigned_logistics_id || ""));
      setRecords(Array.isArray(measurementRows) ? measurementRows : []);
      setIssues(Array.isArray(issueRows) ? issueRows : []);
      setLogisticsOptions(Array.isArray(logisticsRows) ? logisticsRows : []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { load(); }, []);

  const latestRecord = useMemo(() => records[0] || null, [records]);
  const latestIssue = useMemo(() => issues[0] || null, [issues]);
  const canChangeLogistics = user?.role === "soldier" || user?.role === "officer";

  async function onChangeLogistics() {
    setProfileMessage("");
    try {
      const updated = await updateProfile({ assigned_logistics_id: Number(assignedLogisticsId) });
      setUser(updated);
      setProfileMessage("군수담당 변경 요청을 저장했습니다. 다시 승인될 때까지 승인 대기 상태가 됩니다.");
    } catch (err) {
      setProfileMessage(err.message || "군수담당 변경에 실패했습니다.");
    }
  }

  return (
    <Grid>
      <Hero>
        <div style={{ color: "var(--accent)", fontWeight: 900, fontSize: 12, letterSpacing: ".08em" }}>● DASHBOARD</div>
        <h1 style={{ marginTop: 12, color: "var(--accent)" }}>B-MAS 개인 대시보드</h1>
        <p style={{ marginTop: 10 }}>
          계정 승인 상태, 담당 군수담당, 최근 측정과 지급 이력을 한눈에 확인합니다.
        </p>
        <BadgeRow>
          <Pill>{user?.name || user?.username || "-"}</Pill>
          <Pill>{roleLabel(user?.role)}</Pill>
          <Pill>{user?.rank || "계급 미입력"}</Pill>
          <Pill>{user?.unit || "소속 미입력"}</Pill>
          <Pill>{approvalLabel(user?.approval_status)}</Pill>
        </BadgeRow>
      </Hero>

      <StatGrid>
        <StatCard><div>최근 키</div><h2 style={{ marginTop: 10, color: "var(--accent)" }}>{latestRecord ? `${mmToCm(latestRecord.height_mm)} cm` : "-"}</h2></StatCard>
        <StatCard><div>최근 체중</div><h2 style={{ marginTop: 10, color: "var(--accent)" }}>{latestRecord ? `${Number(latestRecord.weight_kg).toFixed(1)} kg` : "-"}</h2></StatCard>
        <StatCard><div>측정 기록 수</div><h2 style={{ marginTop: 10, color: "var(--accent)" }}>{records.length}</h2></StatCard>
        <StatCard><div>지급/추천 이력 수</div><h2 style={{ marginTop: 10, color: "var(--accent)" }}>{issues.length}</h2></StatCard>
      </StatGrid>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>계정 승인 및 담당 군수담당</h2>
        <p style={{ marginTop: 10 }}>
          현재 승인 상태: <strong>{approvalLabel(user?.approval_status)}</strong><br />
          담당 군수담당: <strong>{user?.assigned_logistics_name || "미지정"}</strong><br />
          승인 메모: <strong>{user?.approval_note || "-"}</strong>
        </p>
        {canChangeLogistics ? (
          <div style={{ marginTop: 14 }}>
            <Select value={assignedLogisticsId} onChange={(e) => setAssignedLogisticsId(e.target.value)}>
              <option value="">군수담당 선택</option>
              {logisticsOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.name} · {item.rank || "-"} · {item.unit || "-"}</option>
              ))}
            </Select>
            <Button onClick={onChangeLogistics} disabled={!assignedLogisticsId}>군수담당 변경 요청</Button>
            {profileMessage ? <p style={{ marginTop: 10 }}>{profileMessage}</p> : null}
          </div>
        ) : null}
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>빠른 작업</h2>
        <ActionGrid>
          <ActionCard to="/upload"><strong>새 측정 시작</strong><p style={{ marginTop: 8 }}>전신 사진을 다시 업로드해서 측정을 시작합니다.</p></ActionCard>
          <ActionCard to="/result"><strong>최근 결과 보기</strong><p style={{ marginTop: 8 }}>가장 최근 측정 결과와 추천 치수를 봅니다.</p></ActionCard>
          <ActionCard to={privileged ? "/admin" : "/result"}><strong>{privileged ? "승인·관리 페이지" : "내 이력 보기"}</strong><p style={{ marginTop: 8 }}>{privileged ? "승인 대기 계정과 전체 현황을 관리합니다." : "내 최근 지급 이력과 추천 품목을 확인합니다."}</p></ActionCard>
        </ActionGrid>
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>최근 측정 기록</h2>
        {!records.length ? <p style={{ marginTop: 12 }}>저장된 측정 기록이 없습니다.</p> : (
          <List>{records.slice(0, 5).map((entry) => <ListItem key={entry.id}><strong>{formatDateTime(entry.created_at)}</strong><div style={{ marginTop: 8 }}>키 {mmToCm(entry.height_mm)}cm · 체중 {Number(entry.weight_kg).toFixed(1)}kg · BMI {Number(entry.bmi).toFixed(2)}</div></ListItem>)}</List>
        )}
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>최근 지급 / 추천 이력</h2>
        {!issues.length ? <p style={{ marginTop: 12 }}>지급 또는 추천 이력이 없습니다.</p> : (
          <List>{issues.slice(0, 5).map((entry) => <ListItem key={entry.id}><strong>{entry.item_name} · {entry.size}</strong><div style={{ marginTop: 8 }}>수량 {entry.quantity} · 상태 {entry.status} · {formatDateTime(entry.issued_at)}</div></ListItem>)}</List>
        )}
        {latestIssue ? <p style={{ marginTop: 12 }}>가장 최근 품목: <strong>{latestIssue.item_name}</strong></p> : null}
      </Card>
    </Grid>
  );
}
