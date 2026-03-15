import React, { useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import * as authStorage from "../utils/authStorage";
import * as measurementHistory from "../utils/measurementHistory";
import * as militaryDb from "../utils/militaryDb";

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
  gap: 18px;
`;

const Hero = styled.section`
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 28px;
  box-shadow: var(--shadow);
  padding: 28px;
  animation: ${rise} 0.8s ease both;
`;

const HeroTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const Rec = styled.div`
  font-size: 12px;
  color: var(--accent);
  font-weight: 900;
  letter-spacing: 0.08em;
`;

const HeroTitle = styled.h1`
  margin-top: 12px;
  color: var(--accent);
`;

const HeroDesc = styled.p`
  margin-top: 10px;
  max-width: 760px;
`;

const BadgeRow = styled.div`
  margin-top: 18px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Pill = styled.div`
  border: 1px solid var(--line);
  background: var(--paper-2);
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--muted);
  font-weight: 700;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.section`
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  padding: 20px;
  animation: ${rise} 0.9s ease both;
`;

const StatLabel = styled.div`
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
`;

const StatValue = styled.div`
  margin-top: 10px;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1;
  font-weight: 900;
  color: var(--accent);
`;

const StatSub = styled.div`
  margin-top: 10px;
  color: var(--muted);
  font-size: 13px;
`;

const Card = styled.section`
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 28px;
  box-shadow: var(--shadow-soft);
  padding: 24px;
  animation: ${rise} 1s ease both;
`;

const SectionTitle = styled.h2`
  color: var(--accent);
`;

const SectionDesc = styled.p`
  margin-top: 10px;
`;

const ActionGrid = styled.div`
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled(Link)`
  display: block;
  border: 1px solid var(--line-soft);
  background: var(--paper-2);
  border-radius: 20px;
  padding: 18px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-soft);
  }
`;

const ActionTitle = styled.div`
  font-weight: 900;
  color: var(--text);
`;

const ActionText = styled.p`
  margin-top: 8px;
`;

const List = styled.div`
  margin-top: 18px;
  display: grid;
  gap: 12px;
`;

const ListItem = styled.div`
  border: 1px solid var(--line-soft);
  background: var(--paper-2);
  border-radius: 18px;
  padding: 14px 16px;
`;

const ListTitle = styled.div`
  font-weight: 800;
  color: var(--text);
`;

const Meta = styled.div`
  margin-top: 6px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  color: var(--muted);
  font-size: 13px;
`;

const EmptyState = styled.div`
  margin-top: 18px;
  border: 1.5px dashed var(--line);
  background: var(--paper-2);
  border-radius: 20px;
  padding: 22px;
  color: var(--muted);
`;

function safeCall(fn, fallback) {
  try {
    const value = typeof fn === "function" ? fn() : fallback;
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === "object" ? value : null;
}

function getCurrentUser() {
  const candidates = [
    authStorage.loadCurrentUser,
    authStorage.getCurrentUser,
    authStorage.readCurrentUser,
  ];

  for (const fn of candidates) {
    const result = safeCall(fn, null);
    if (result && typeof result === "object") return result;
  }

  return null;
}

function getUsers() {
  const candidates = [
    militaryDb.loadUsers,
    militaryDb.getUsers,
    militaryDb.readUsers,
    militaryDb.listUsers,
  ];

  for (const fn of candidates) {
    const result = safeCall(fn, []);
    if (Array.isArray(result)) return result;
  }

  return [];
}

function getIssueHistory() {
  const candidates = [
    militaryDb.loadIssueHistory,
    militaryDb.getIssueHistory,
    militaryDb.readIssueHistory,
    militaryDb.listIssueHistory,
    militaryDb.loadIssues,
    militaryDb.getIssues,
  ];

  for (const fn of candidates) {
    const result = safeCall(fn, []);
    if (Array.isArray(result)) return result;
  }

  return [];
}

function getMeasurementHistory() {
  const candidates = [
    measurementHistory.loadMeasurementHistory,
    measurementHistory.getMeasurementHistory,
    measurementHistory.readMeasurementHistory,
  ];

  for (const fn of candidates) {
    const result = safeCall(fn, []);
    if (Array.isArray(result)) return result;
  }

  return [];
}

function formatDateTime(value) {
  if (!value) return "-";

  try {
    if (typeof measurementHistory.formatDateTime === "function") {
      return measurementHistory.formatDateTime(value);
    }
  } catch {}

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mmToCm(mm) {
  const n = Number(mm);
  if (!Number.isFinite(n)) return "-";
  return (n / 10).toFixed(1);
}

function findMeasure(entry, label) {
  const measures = asObject(entry?.measures);
  const item = measures?.[label];
  if (!item || typeof item !== "object") return null;
  return item;
}

function getRoleLabel(role) {
  switch (role) {
    case "admin":
      return "관리자";
    case "logistics":
    case "logi":
      return "군수담당";
    case "officer":
      return "간부";
    case "soldier":
      return "병사";
    default:
      return role || "사용자";
  }
}

export default function DashboardPage() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const users = useMemo(() => asArray(getUsers()), []);
  const records = useMemo(() => asArray(getMeasurementHistory()), []);
  const issueHistory = useMemo(() => asArray(getIssueHistory()), []);

  const currentUserId = currentUser?.id ?? currentUser?.userId ?? currentUser?.username ?? null;
  const currentRole = currentUser?.role ?? "soldier";

  const myProfile = useMemo(() => {
    if (!currentUserId) return null;

    return (
      users.find((user) => {
        const userId = user?.id ?? user?.userId ?? user?.username;
        return userId === currentUserId;
      }) || null
    );
  }, [users, currentUserId]);

  const myRecords = useMemo(() => {
    if (!currentUserId) return [];

    return records.filter((entry) => {
      const ownerId =
        entry?.userId ??
        entry?.ownerId ??
        entry?.memberId ??
        entry?.username;
      return ownerId === currentUserId;
    });
  }, [records, currentUserId]);

  const myIssueHistory = useMemo(() => {
    if (!currentUserId) return [];

    return issueHistory.filter((entry) => {
      const ownerId =
        entry?.userId ??
        entry?.ownerId ??
        entry?.memberId ??
        entry?.username;
      return ownerId === currentUserId;
    });
  }, [issueHistory, currentUserId]);

  const latestRecord = useMemo(() => {
    return myRecords.length ? myRecords[0] : null;
  }, [myRecords]);

  const latestIssue = useMemo(() => {
    return myIssueHistory.length ? myIssueHistory[0] : null;
  }, [myIssueHistory]);

  const latestHeight = findMeasure(latestRecord, "키(추정)");
  const latestBMI = findMeasure(latestRecord, "BMI");
  const latestWeight = findMeasure(latestRecord, "체중");

  const totalManagedUsers = useMemo(() => {
    if (currentRole === "admin" || currentRole === "logistics" || currentRole === "logi") {
      return users.length;
    }
    return 1;
  }, [users, currentRole]);

  const totalManagedIssues = useMemo(() => {
    if (currentRole === "admin" || currentRole === "logistics" || currentRole === "logi") {
      return issueHistory.length;
    }
    return myIssueHistory.length;
  }, [issueHistory, myIssueHistory, currentRole]);

  return (
    <Grid>
      <Hero>
        <HeroTop>
          <div>
            <Rec>● DASHBOARD</Rec>
            <HeroTitle>B-MAS Military Dashboard</HeroTitle>
            <HeroDesc>
              군 피복·치수 관리 시스템 대시보드입니다. 개인 측정 기록, 최근 지급 이력,
              조직 내 관리 현황을 한 화면에서 확인할 수 있습니다.
            </HeroDesc>
          </div>
        </HeroTop>

        <BadgeRow>
          <Pill>현재 사용자 {currentUser?.name || currentUser?.username || "미로그인"}</Pill>
          <Pill>권한 {getRoleLabel(currentRole)}</Pill>
          <Pill>소속 {myProfile?.unit || myProfile?.company || currentUser?.unit || "-"}</Pill>
          <Pill>계급 {myProfile?.rank || currentUser?.rank || "-"}</Pill>
        </BadgeRow>
      </Hero>

      <CardGrid>
        <StatCard>
          <StatLabel>내 측정 기록 수</StatLabel>
          <StatValue>{myRecords.length}</StatValue>
          <StatSub>서버 연동 전 단계에서는 로컬 저장 기준</StatSub>
        </StatCard>

        <StatCard>
          <StatLabel>최근 키</StatLabel>
          <StatValue>
            {latestHeight ? `${mmToCm(latestHeight.mm)}cm` : "-"}
          </StatValue>
          <StatSub>가장 최근 측정 기준</StatSub>
        </StatCard>

        <StatCard>
          <StatLabel>최근 체중 / BMI</StatLabel>
          <StatValue style={{ fontSize: "28px" }}>
            {latestWeight ? `${Number(latestWeight.mm).toFixed(1)}kg` : "-"}
          </StatValue>
          <StatSub>
            BMI {latestBMI ? Number(latestBMI.mm).toFixed(2) : "-"}
          </StatSub>
        </StatCard>

        <StatCard>
          <StatLabel>관리 가능 인원 / 지급 이력</StatLabel>
          <StatValue style={{ fontSize: "28px" }}>
            {totalManagedUsers} / {totalManagedIssues}
          </StatValue>
          <StatSub>권한에 따라 달라집니다</StatSub>
        </StatCard>
      </CardGrid>

      <Card>
        <SectionTitle>빠른 작업</SectionTitle>
        <SectionDesc>
          자주 사용하는 메뉴로 바로 이동할 수 있습니다.
        </SectionDesc>

        <ActionGrid>
          <ActionCard to="/upload">
            <ActionTitle>새 측정 시작</ActionTitle>
            <ActionText>
              전신 사진 업로드부터 다시 진행해서 측정 결과를 저장합니다.
            </ActionText>
          </ActionCard>

          <ActionCard to="/result">
            <ActionTitle>최근 결과 확인</ActionTitle>
            <ActionText>
              마지막으로 측정한 결과와 그래프를 바로 확인합니다.
            </ActionText>
          </ActionCard>

          <ActionCard to={currentRole === "admin" || currentRole === "logistics" || currentRole === "logi" ? "/admin" : "/result"}>
            <ActionTitle>
              {currentRole === "admin" || currentRole === "logistics" || currentRole === "logi"
                ? "관리자 페이지"
                : "내 기록 보기"}
            </ActionTitle>
            <ActionText>
              권한에 따라 관리 화면 또는 개인 기록 화면으로 이동합니다.
            </ActionText>
          </ActionCard>
        </ActionGrid>
      </Card>

      <Card>
        <SectionTitle>최근 측정 기록</SectionTitle>
        <SectionDesc>
          가장 최근에 저장된 개인 측정 결과입니다.
        </SectionDesc>

        {!myRecords.length ? (
          <EmptyState>저장된 개인 측정 기록이 없습니다.</EmptyState>
        ) : (
          <List>
            {myRecords.slice(0, 5).map((entry) => {
              const height = findMeasure(entry, "키(추정)");
              const bmi = findMeasure(entry, "BMI");
              const weight = findMeasure(entry, "체중");

              return (
                <ListItem key={entry.id || `${entry.createdAt}-${Math.random()}`}>
                  <ListTitle>{formatDateTime(entry.createdAt)}</ListTitle>
                  <Meta>
                    <div>키 {height ? `${mmToCm(height.mm)}cm` : "-"}</div>
                    <div>체중 {weight ? `${Number(weight.mm).toFixed(1)}kg` : "-"}</div>
                    <div>BMI {bmi ? Number(bmi.mm).toFixed(2) : "-"}</div>
                  </Meta>
                </ListItem>
              );
            })}
          </List>
        )}
      </Card>

      <Card>
        <SectionTitle>최근 피복 지급 이력</SectionTitle>
        <SectionDesc>
          개인 기준 최근 지급 또는 추천 이력을 보여줍니다.
        </SectionDesc>

        {!myIssueHistory.length ? (
          <EmptyState>저장된 지급 이력이 없습니다.</EmptyState>
        ) : (
          <List>
            {myIssueHistory.slice(0, 5).map((entry) => (
              <ListItem key={entry.id || `${entry.itemName}-${entry.createdAt}`}>
                <ListTitle>{entry.itemName || entry.item || "피복 항목"}</ListTitle>
                <Meta>
                  <div>사이즈 {entry.size || entry.recommendedSize || "-"}</div>
                  <div>수량 {entry.quantity || 1}</div>
                  <div>날짜 {formatDateTime(entry.createdAt || entry.issuedAt)}</div>
                </Meta>
              </ListItem>
            ))}
          </List>
        )}
      </Card>

      {(currentRole === "admin" || currentRole === "logistics" || currentRole === "logi") && (
        <Card>
          <SectionTitle>관리자 요약</SectionTitle>
          <SectionDesc>
            관리자 또는 군수담당 계정에서만 보이는 전체 현황 요약입니다.
          </SectionDesc>

          {!users.length ? (
            <EmptyState>현재 등록된 사용자 데이터가 없습니다.</EmptyState>
          ) : (
            <List>
              {users.slice(0, 5).map((user) => (
                <ListItem key={user.id || user.username}>
                  <ListTitle>{user.name || user.username || "이름 없음"}</ListTitle>
                  <Meta>
                    <div>계급 {user.rank || "-"}</div>
                    <div>소속 {user.unit || user.company || "-"}</div>
                    <div>권한 {getRoleLabel(user.role)}</div>
                  </Meta>
                </ListItem>
              ))}
            </List>
          )}
        </Card>
      )}

      <Card>
        <SectionTitle>현재 데이터 상태</SectionTitle>
        <SectionDesc>
          아래 숫자가 0이어도 오류는 아닙니다. 아직 저장된 데이터가 없는 상태일 수 있습니다.
        </SectionDesc>

        <List>
          <ListItem>
            <ListTitle>사용자 배열</ListTitle>
            <Meta>
              <div>개수 {users.length}</div>
              <div>상태 {Array.isArray(users) ? "정상" : "비정상"}</div>
            </Meta>
          </ListItem>

          <ListItem>
            <ListTitle>측정 기록 배열</ListTitle>
            <Meta>
              <div>개수 {records.length}</div>
              <div>상태 {Array.isArray(records) ? "정상" : "비정상"}</div>
            </Meta>
          </ListItem>

          <ListItem>
            <ListTitle>지급 이력 배열</ListTitle>
            <Meta>
              <div>개수 {issueHistory.length}</div>
              <div>상태 {Array.isArray(issueHistory) ? "정상" : "비정상"}</div>
            </Meta>
          </ListItem>
        </List>
      </Card>
    </Grid>
  );
}