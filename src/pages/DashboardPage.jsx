import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import {
  fetchMe,
  getLogisticsOptions,
  getMyIssues,
  getMyMeasurements,
  updateProfile,
} from "../api/serverApi";
import { getCurrentUser, isPrivileged } from "../utils/authStorage";
import { formatDateTime } from "../utils/measurementHistory";

const Grid = styled.div`display:grid; gap:18px;`;
const Card = styled.section`
  background:var(--paper);
  border:1.5px solid var(--line);
  border-radius:28px;
  box-shadow:var(--shadow-soft);
  padding:24px;
`;
const Hero = styled(Card)``;
const BadgeRow = styled.div`margin-top:18px; display:flex; gap:10px; flex-wrap:wrap;`;
const Pill = styled.div`
  border:1px solid var(--line);
  background:var(--paper-2);
  padding:8px 12px;
  border-radius:999px;
  font-size:12px;
  color:var(--muted);
  font-weight:700;
`;
const StatGrid = styled.div`
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:16px;
  @media (max-width:980px){grid-template-columns:repeat(2,minmax(0,1fr));}
  @media (max-width:640px){grid-template-columns:1fr;}
`;
const StatCard = styled(Card)`padding:20px;`;
const StatLabel = styled.div`font-size:14px; color:var(--muted); font-weight:700;`;
const StatValue = styled.h2`
  margin-top:10px;
  color:var(--accent);
  font-size:clamp(26px, 4vw, 34px);
  line-height:1.1;
  letter-spacing:-0.03em;
  white-space:normal;
  word-break:break-word;
`;
const StatSub = styled.p`margin-top:8px; font-size:13px; line-height:1.5;`;
const ActionGrid = styled.div`
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:14px;
  margin-top:18px;
  @media (max-width:900px){grid-template-columns:1fr;}
`;
const ActionCard = styled(Link)`
  display:block;
  border:1px solid var(--line-soft);
  background:var(--paper-2);
  border-radius:20px;
  padding:18px;
  transition:transform .15s ease, box-shadow .15s ease;
  &:hover { transform:translateY(-2px); box-shadow:var(--shadow-soft); }
`;
const FieldRow = styled.div`
  display:grid;
  grid-template-columns:minmax(0,1fr) auto;
  gap:12px;
  align-items:end;
  margin-top:14px;
  @media (max-width:720px){grid-template-columns:1fr;}
`;
const Select = styled.select`
  width:100%;
  min-width:0;
  padding:13px 14px;
  border-radius:14px;
  border:1.5px solid var(--line);
  background:#fcfaf6;
  color:var(--text);
`;
const Button = styled.button`
  border:1.5px solid var(--accent);
  background:var(--accent);
  color:#fff;
  padding:11px 16px;
  border-radius:999px;
  font-weight:800;
  cursor:pointer;
  white-space:nowrap;
`;
const List = styled.div`display:grid; gap:12px; margin-top:16px;`;
const ListItem = styled.div`
  border:1px solid var(--line-soft);
  background:var(--paper-2);
  border-radius:18px;
  padding:14px 16px;
`;
const Meta = styled.div`
  margin-top:8px;
  font-size:14px;
  color:var(--text);
  line-height:1.6;
  word-break:break-word;
`;
const Message = styled.p`
  margin-top:12px;
  color:${({ $error }) => ($error ? "var(--danger)" : "var(--ok)")};
  font-weight:700;
`;

function roleLabel(role) {
  if (role === "admin") return "관리자";
  if (role === "chief_logistics") return "대표 군수담당";
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
  const [assignedLogisticsId, setAssignedLogisticsId] = useState(String(getCurrentUser()?.assigned_logistics_id || getCurrentUser()?.manager_user_id || ""));
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
      setAssignedLogisticsId(String(me?.assigned_logistics_id || me?.manager_user_id || ""));
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
  const latestRecordWeight = Number(latestRecord?.weight_kg);
  const canChangeLogistics = user?.role === "soldier" || user?.role === "officer";

  async function onChangeLogistics() {
    setProfileMessage("");
    try {
      const updated = await updateProfile({ manager_user_id: Number(assignedLogisticsId) });
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
        <StatCard>
          <StatLabel>최근 키</StatLabel>
          <StatValue>{latestRecord ? `${mmToCm(latestRecord.height_mm)} cm` : "-"}</StatValue>
          <StatSub>가장 최근 저장된 측정 기록 기준</StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>최근 체중</StatLabel>
          <StatValue>{Number.isFinite(latestRecordWeight) ? `${latestRecordWeight.toFixed(1)} kg` : "-"}</StatValue>
          <StatSub>BMI와 함께 저장되는 기준값</StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>최근 BMI</StatLabel>
          <StatValue>{Number.isFinite(Number(latestRecord?.bmi)) ? Number(latestRecord.bmi).toFixed(2) : "-"}</StatValue>
          <StatSub>신장과 체중 기반 지표</StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>최근 지급 상태</StatLabel>
          <StatValue>{latestIssue?.status || "-"}</StatValue>
          <StatSub>{latestIssue ? `${latestIssue.item_name} · ${latestIssue.size}` : "최근 지급·추천 이력 없음"}</StatSub>
        </StatCard>
      </StatGrid>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>내 프로필 / 담당 군수담당</h2>
        <p style={{ marginTop: 10 }}>
          승인 상태: <strong>{approvalLabel(user?.approval_status)}</strong>
          {user?.assigned_logistics_name ? ` · 현재 담당 군수담당: ${user.assigned_logistics_name}` : " · 담당 군수담당 미지정"}
        </p>

        {canChangeLogistics ? (
          <FieldRow>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 800, color: "var(--text)" }}>
                담당 군수담당 변경
              </label>
              <Select value={assignedLogisticsId} onChange={(e) => setAssignedLogisticsId(e.target.value)}>
                <option value="">담당 군수담당 선택</option>
                {logisticsOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} · {option.rank || "-"} · {option.unit || "-"}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={onChangeLogistics} disabled={!assignedLogisticsId}>변경 요청 저장</Button>
          </FieldRow>
        ) : null}

        {profileMessage ? (
          <Message $error={profileMessage.includes("실패")}>{profileMessage}</Message>
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
          <List>
            {records.slice(0, 5).map((entry) => (
              <ListItem key={entry.id}>
                <strong>{formatDateTime(entry.created_at)}</strong>
                <Meta>키 {mmToCm(entry.height_mm)}cm · 체중 {Number(entry.weight_kg).toFixed(1)}kg · BMI {Number.isFinite(Number(entry.bmi)) ? Number(entry.bmi).toFixed(2) : "-"}</Meta>
              </ListItem>
            ))}
          </List>
        )}
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>최근 지급 / 추천 이력</h2>
        {!issues.length ? <p style={{ marginTop: 12 }}>지급 또는 추천 이력이 없습니다.</p> : (
          <List>
            {issues.slice(0, 5).map((entry) => (
              <ListItem key={entry.id}>
                <strong>{entry.item_name} · {entry.size}</strong>
                <Meta>수량 {entry.quantity} · 상태 {entry.status} · {formatDateTime(entry.issued_at)}</Meta>
              </ListItem>
            ))}
          </List>
        )}
        {latestIssue ? <p style={{ marginTop: 12 }}>가장 최근 품목: <strong>{latestIssue.item_name}</strong></p> : null}
      </Card>
    </Grid>
  );
}
