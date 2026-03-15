import React, { useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import * as authStorage from "../utils/authStorage";
import * as militaryDb from "../utils/militaryDb";
import * as measurementHistory from "../utils/measurementHistory";

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

const ControlRow = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const Input = styled.input`
  padding: 11px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--line);
  background: #fcfaf6;
  color: var(--text);
  min-width: 220px;
`;

const Select = styled.select`
  padding: 11px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--line);
  background: #fcfaf6;
  color: var(--text);
`;

const Table = styled.div`
  margin-top: 18px;
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: ${({ template }) => template || "1fr 1fr 1fr 1fr"};
  gap: 10px;
  padding: 14px 16px;
  align-items: center;
  border-top: 1px solid var(--line-soft);
  background: ${({ header }) => (header ? "var(--paper-2)" : "transparent")};
  font-weight: ${({ header }) => (header ? 800 : 500)};

  &:first-child {
    border-top: 0;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
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

function getOwnerId(entry) {
  return (
    entry?.userId ??
    entry?.ownerId ??
    entry?.memberId ??
    entry?.username ??
    null
  );
}

function findMeasure(entry, label) {
  const measures =
    entry?.measures && typeof entry.measures === "object" ? entry.measures : null;
  const item = measures?.[label];
  return item && typeof item === "object" ? item : null;
}

export default function AdminPage() {
  const currentUser = useMemo(() => getCurrentUser(), []);

  const users = useMemo(() => asArray(getUsers()), []);
  const records = useMemo(() => asArray(getMeasurementHistory()), []);
  const issueHistory = useMemo(() => asArray(getIssueHistory()), []);

  const currentRole = currentUser?.role ?? "soldier";
  const canManage = currentRole === "admin" || currentRole === "logistics" || currentRole === "logi";

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const name = String(user?.name ?? "").toLowerCase();
      const username = String(user?.username ?? "").toLowerCase();
      const rank = String(user?.rank ?? "").toLowerCase();
      const unit = String(user?.unit ?? user?.company ?? "").toLowerCase();
      const role = String(user?.role ?? "");

      const matchesSearch =
        !keyword ||
        name.includes(keyword) ||
        username.includes(keyword) ||
        rank.includes(keyword) ||
        unit.includes(keyword);

      const matchesRole = roleFilter === "all" || role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalUsers = users.length;
  const totalRecords = records.length;
  const totalIssues = issueHistory.length;

  const soldiersCount = useMemo(() => {
    return users.filter((user) => (user?.role ?? "") === "soldier").length;
  }, [users]);

  const adminCount = useMemo(() => {
    return users.filter((user) => {
      const role = user?.role ?? "";
      return role === "admin" || role === "logistics" || role === "logi";
    }).length;
  }, [users]);

  const enrichedUsers = useMemo(() => {
    return filteredUsers.map((user) => {
      const userId = user?.id ?? user?.userId ?? user?.username ?? null;

      const userRecords = records.filter((entry) => getOwnerId(entry) === userId);
      const userIssues = issueHistory.filter((entry) => getOwnerId(entry) === userId);

      const latestRecord = userRecords.length ? userRecords[0] : null;
      const latestHeight = findMeasure(latestRecord, "키(추정)");
      const latestBMI = findMeasure(latestRecord, "BMI");

      return {
        ...user,
        recordCount: userRecords.length,
        issueCount: userIssues.length,
        latestHeightText: latestHeight ? `${mmToCm(latestHeight.mm)}cm` : "-",
        latestBMIText: latestBMI ? Number(latestBMI.mm).toFixed(2) : "-",
      };
    });
  }, [filteredUsers, records, issueHistory]);

  const recentRecords = useMemo(() => {
    return records.slice(0, 8);
  }, [records]);

  const recentIssues = useMemo(() => {
    return issueHistory.slice(0, 8);
  }, [issueHistory]);

  if (!canManage) {
    return (
      <Grid>
        <Card>
          <SectionTitle>접근 제한</SectionTitle>
          <SectionDesc>
            이 페이지는 관리자 또는 군수담당 계정만 접근할 수 있습니다.
          </SectionDesc>
          <EmptyState>
            현재 계정 권한: {getRoleLabel(currentRole)}
          </EmptyState>
        </Card>
      </Grid>
    );
  }

  return (
    <Grid>
      <Hero>
        <HeroTop>
          <div>
            <Rec>● ADMIN CONSOLE</Rec>
            <HeroTitle>B-MAS Military Admin</HeroTitle>
            <HeroDesc>
              병력 계정, 측정 기록, 피복 지급 이력을 통합해서 확인하는 관리자 페이지입니다.
              현재는 로컬 데이터 기반 프로토타입이며, 나중에 서버 DB 구조로 확장하기 쉽게 구성되어 있습니다.
            </HeroDesc>
          </div>
        </HeroTop>

        <BadgeRow>
          <Pill>현재 사용자 {currentUser?.name || currentUser?.username || "-"}</Pill>
          <Pill>권한 {getRoleLabel(currentRole)}</Pill>
          <Pill>총 사용자 {totalUsers}명</Pill>
          <Pill>총 측정 기록 {totalRecords}건</Pill>
          <Pill>총 지급 이력 {totalIssues}건</Pill>
        </BadgeRow>
      </Hero>

      <CardGrid>
        <StatCard>
          <StatLabel>전체 사용자 수</StatLabel>
          <StatValue>{totalUsers}</StatValue>
          <StatSub>현재 저장된 계정 기준</StatSub>
        </StatCard>

        <StatCard>
          <StatLabel>병사 계정 수</StatLabel>
          <StatValue>{soldiersCount}</StatValue>
          <StatSub>role = soldier</StatSub>
        </StatCard>

        <StatCard>
          <StatLabel>관리 계정 수</StatLabel>
          <StatValue>{adminCount}</StatValue>
          <StatSub>관리자 / 군수담당 포함</StatSub>
        </StatCard>

        <StatCard>
          <StatLabel>측정 / 지급 데이터</StatLabel>
          <StatValue style={{ fontSize: "28px" }}>
            {totalRecords} / {totalIssues}
          </StatValue>
          <StatSub>측정 기록 / 지급 이력</StatSub>
        </StatCard>
      </CardGrid>

      <Card>
        <SectionTitle>사용자 검색 및 필터</SectionTitle>
        <SectionDesc>
          이름, 아이디, 계급, 소속으로 검색하고 역할별로 필터링할 수 있습니다.
        </SectionDesc>

        <ControlRow>
          <Input
            type="text"
            placeholder="이름, 아이디, 계급, 소속 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">전체 역할</option>
            <option value="soldier">병사</option>
            <option value="officer">간부</option>
            <option value="logistics">군수담당</option>
            <option value="logi">군수담당</option>
            <option value="admin">관리자</option>
          </Select>
        </ControlRow>

        {!enrichedUsers.length ? (
          <EmptyState>조건에 맞는 사용자가 없습니다.</EmptyState>
        ) : (
          <Table>
            <Row header template="1.2fr 0.8fr 0.9fr 0.8fr 0.8fr 0.8fr">
              <div>이름 / 아이디</div>
              <div>권한</div>
              <div>소속</div>
              <div>측정 수</div>
              <div>최근 키</div>
              <div>최근 BMI</div>
            </Row>

            {enrichedUsers.map((user) => (
              <Row
                key={user?.id || user?.username || `${user?.name}-${Math.random()}`}
                template="1.2fr 0.8fr 0.9fr 0.8fr 0.8fr 0.8fr"
              >
                <div>
                  <strong>{user?.name || "이름 없음"}</strong>
                  <br />
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>
                    {user?.username || "-"} / {user?.rank || "-"}
                  </span>
                </div>
                <div>{getRoleLabel(user?.role)}</div>
                <div>{user?.unit || user?.company || "-"}</div>
                <div>{user?.recordCount ?? 0}</div>
                <div>{user?.latestHeightText || "-"}</div>
                <div>{user?.latestBMIText || "-"}</div>
              </Row>
            ))}
          </Table>
        )}
      </Card>

      <Card>
        <SectionTitle>최근 측정 기록</SectionTitle>
        <SectionDesc>
          최근 저장된 측정 데이터를 시간순으로 보여줍니다.
        </SectionDesc>

        {!recentRecords.length ? (
          <EmptyState>최근 측정 기록이 없습니다.</EmptyState>
        ) : (
          <List>
            {recentRecords.map((entry) => {
              const height = findMeasure(entry, "키(추정)");
              const bmi = findMeasure(entry, "BMI");
              const ownerId = getOwnerId(entry);

              return (
                <ListItem key={entry?.id || `${ownerId}-${entry?.createdAt}`}>
                  <ListTitle>{formatDateTime(entry?.createdAt)}</ListTitle>
                  <Meta>
                    <div>사용자 {ownerId || "-"}</div>
                    <div>키 {height ? `${mmToCm(height.mm)}cm` : "-"}</div>
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
          최근 저장된 피복 지급 또는 추천 이력을 보여줍니다.
        </SectionDesc>

        {!recentIssues.length ? (
          <EmptyState>최근 지급 이력이 없습니다.</EmptyState>
        ) : (
          <List>
            {recentIssues.map((entry) => (
              <ListItem key={entry?.id || `${entry?.itemName}-${entry?.createdAt}`}>
                <ListTitle>{entry?.itemName || entry?.item || "피복 항목"}</ListTitle>
                <Meta>
                  <div>사용자 {getOwnerId(entry) || "-"}</div>
                  <div>사이즈 {entry?.size || entry?.recommendedSize || "-"}</div>
                  <div>수량 {entry?.quantity || 1}</div>
                  <div>날짜 {formatDateTime(entry?.createdAt || entry?.issuedAt)}</div>
                </Meta>
              </ListItem>
            ))}
          </List>
        )}
      </Card>

      <Card>
        <SectionTitle>데이터 상태 점검</SectionTitle>
        <SectionDesc>
          null 대신 배열로 안전하게 불러왔는지 확인하는 디버그용 요약입니다.
        </SectionDesc>

        <List>
          <ListItem>
            <ListTitle>users</ListTitle>
            <Meta>
              <div>개수 {users.length}</div>
              <div>배열 여부 {Array.isArray(users) ? "정상" : "비정상"}</div>
            </Meta>
          </ListItem>

          <ListItem>
            <ListTitle>records</ListTitle>
            <Meta>
              <div>개수 {records.length}</div>
              <div>배열 여부 {Array.isArray(records) ? "정상" : "비정상"}</div>
            </Meta>
          </ListItem>

          <ListItem>
            <ListTitle>issueHistory</ListTitle>
            <Meta>
              <div>개수 {issueHistory.length}</div>
              <div>배열 여부 {Array.isArray(issueHistory) ? "정상" : "비정상"}</div>
            </Meta>
          </ListItem>
        </List>
      </Card>
    </Grid>
  );
}