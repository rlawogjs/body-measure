import React, { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { createIssue, getAllIssues, getAllMeasurements, getUsers } from "../api/serverApi";
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
const StatCard = styled.section`background:var(--paper); border:1.5px solid var(--line); border-radius:24px; box-shadow:var(--shadow-soft); padding:20px;`;
const StatLabel = styled.div`color:var(--muted); font-size:13px; font-weight:700;`;
const StatValue = styled.div`margin-top:10px; font-size:clamp(28px,4vw,42px); line-height:1; font-weight:900; color:var(--accent);`;
const StatSub = styled.div`margin-top:10px; color:var(--muted); font-size:13px;`;
const Card = styled.section`background:var(--paper); border:1.5px solid var(--line); border-radius:28px; box-shadow:var(--shadow-soft); padding:24px;`;
const SectionTitle = styled.h2`color:var(--accent);`;
const SectionDesc = styled.p`margin-top:10px;`;
const ControlRow = styled.div`margin-top:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;`;
const Input = styled.input`padding:11px 14px; border-radius:14px; border:1.5px solid var(--line); background:#fcfaf6; color:var(--text); min-width:220px;`;
const Select = styled.select`padding:11px 14px; border-radius:14px; border:1.5px solid var(--line); background:#fcfaf6; color:var(--text); min-width:180px;`;
const Button = styled.button.withConfig({ shouldForwardProp: (prop) => prop !== "$primary" })`
  border:1.5px solid ${({ $primary }) => ($primary ? "var(--accent)" : "var(--line)")};
  background:${({ $primary }) => ($primary ? "var(--accent)" : "var(--paper-2)")};
  color:${({ $primary }) => ($primary ? "#fff" : "var(--text)")};
  padding:12px 18px; border-radius:999px; font-weight:800; cursor:pointer;`;
const Table = styled.div`margin-top:18px; border:1px solid var(--line); border-radius:20px; overflow:hidden;`;
const Row = styled.div.withConfig({ shouldForwardProp: (prop) => !["$header", "$template"].includes(prop) })`
  display:grid; grid-template-columns:${({ $template }) => $template || "1fr 1fr 1fr 1fr"}; gap:10px; padding:14px 16px; align-items:center;
  border-top:1px solid var(--line-soft); background:${({ $header }) => ($header ? "var(--paper-2)" : "transparent")}; font-weight:${({ $header }) => ($header ? 800 : 500)};
  &:first-child{border-top:0;} @media (max-width:900px){grid-template-columns:1fr;}
`;
const EmptyState = styled.div`margin-top:18px; border:1.5px dashed var(--line); background:var(--paper-2); border-radius:20px; padding:22px; color:var(--muted);`;

function mmToCm(mm) {
  const n = Number(mm);
  return Number.isFinite(n) ? (n / 10).toFixed(1) : "-";
}

function roleLabel(role) {
  return role === "admin" ? "관리자" : role === "logistics" ? "군수담당" : "병사";
}

function statusLabel(status) {
  if (status === "issued") return "지급 완료";
  if (status === "recommended") return "추천";
  if (status === "pending") return "대기";
  return status || "-";
}

export default function AdminPage() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const canManage = isPrivileged(currentUser);

  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [issueForm, setIssueForm] = useState({
    user_id: "",
    item_name: "전투복 상의",
    size: "100",
    quantity: 1,
    status: "issued",
    note: "",
  });
  const [issueMessage, setIssueMessage] = useState("");

  async function loadAll() {
    try {
      const [userRows, measurementRows, issueRows] = await Promise.all([
        getUsers(),
        getAllMeasurements(),
        getAllIssues(),
      ]);

      setUsers(Array.isArray(userRows) ? userRows : []);
      setRecords(Array.isArray(measurementRows) ? measurementRows : []);
      setIssues(Array.isArray(issueRows) ? issueRows : []);
      setIssueForm((prev) => ({
        ...prev,
        user_id: prev.user_id || String(userRows?.[0]?.id || ""),
      }));
    } catch (err) {
      setIssueMessage(err.message || "데이터를 불러오지 못했습니다.");
    }
  }

  useEffect(() => {
    if (canManage) loadAll();
  }, [canManage]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const haystack = [user.name, user.username, user.rank, user.unit]
        .join(" ")
        .toLowerCase();
      return matchesRole && (!keyword || haystack.includes(keyword));
    });
  }, [users, search, roleFilter]);

  const userMap = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user])),
    [users]
  );

  const latestByUser = useMemo(() => {
    const map = {};
    records.forEach((record) => {
      if (!map[record.user_id]) map[record.user_id] = record;
    });
    return map;
  }, [records]);

  async function onCreateIssue(e) {
    e.preventDefault();
    setIssueMessage("");

    try {
      await createIssue({
        user_id: Number(issueForm.user_id),
        item_name: issueForm.item_name,
        size: issueForm.size,
        quantity: Number(issueForm.quantity) || 1,
        status: issueForm.status,
        note: issueForm.note,
      });
      setIssueMessage("지급 이력을 저장했습니다.");
      await loadAll();
    } catch (err) {
      setIssueMessage(err.message || "지급 이력 저장 실패");
    }
  }

  if (!canManage) {
    return (
      <Grid>
        <Card>
          <SectionTitle>접근 제한</SectionTitle>
          <SectionDesc>
            이 페이지는 관리자 또는 군수담당 계정만 접근할 수 있습니다.
          </SectionDesc>
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
              사용자, 측정 기록, 피복 지급 이력을 실제 서버 DB 기준으로 통합 관리하는 관리자 페이지입니다.
            </HeroDesc>
          </div>
        </HeroTop>

        <BadgeRow>
          <Pill>현재 사용자 {currentUser?.name || currentUser?.username || "-"}</Pill>
          <Pill>권한 {roleLabel(currentUser?.role)}</Pill>
          <Pill>총 사용자 {users.length}명</Pill>
          <Pill>총 측정 기록 {records.length}건</Pill>
          <Pill>총 지급 이력 {issues.length}건</Pill>
        </BadgeRow>
      </Hero>

      <CardGrid>
        <StatCard>
          <StatLabel>전체 사용자 수</StatLabel>
          <StatValue>{users.length}</StatValue>
          <StatSub>DB 저장 계정 기준</StatSub>
        </StatCard>

        <StatCard>
          <StatLabel>병사 계정 수</StatLabel>
          <StatValue>{users.filter((u) => u.role === "soldier").length}</StatValue>
          <StatSub>role = soldier</StatSub>
        </StatCard>

        <StatCard>
          <StatLabel>관리 계정 수</StatLabel>
          <StatValue>{users.filter((u) => u.role !== "soldier").length}</StatValue>
          <StatSub>관리자 / 군수담당 포함</StatSub>
        </StatCard>

        <StatCard>
          <StatLabel>측정 / 지급 데이터</StatLabel>
          <StatValue style={{ fontSize: "28px" }}>
            {records.length} / {issues.length}
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
            placeholder="이름, 아이디, 계급, 소속 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">전체 역할</option>
            <option value="soldier">병사</option>
            <option value="logistics">군수담당</option>
            <option value="admin">관리자</option>
          </Select>
        </ControlRow>

        {!filteredUsers.length ? (
          <EmptyState>조건에 맞는 사용자가 없습니다.</EmptyState>
        ) : (
          <Table>
            <Row $header $template="1.1fr 0.9fr 0.8fr 1.2fr 1fr 1fr">
              <div>사용자</div>
              <div>역할</div>
              <div>계급</div>
              <div>소속</div>
              <div>최근 키</div>
              <div>측정 건수</div>
            </Row>

            {filteredUsers.map((user) => {
              const latest = latestByUser[user.id];
              const count = records.filter((record) => record.user_id === user.id).length;

              return (
                <Row key={user.id} $template="1.1fr 0.9fr 0.8fr 1.2fr 1fr 1fr">
                  <div>
                    <strong>{user.name}</strong>
                    <div>{user.username}</div>
                  </div>
                  <div>{roleLabel(user.role)}</div>
                  <div>{user.rank || "-"}</div>
                  <div>{user.unit || "-"}</div>
                  <div>{latest ? `${mmToCm(latest.height_mm)}cm` : "-"}</div>
                  <div>{count}</div>
                </Row>
              );
            })}
          </Table>
        )}
      </Card>

      <Card as="form" onSubmit={onCreateIssue}>
        <SectionTitle>지급 이력 등록</SectionTitle>
        <SectionDesc>
          선택한 사용자에게 실제 지급 또는 수동 추천 이력을 저장합니다.
        </SectionDesc>

        <ControlRow>
          <Select
            value={issueForm.user_id}
            onChange={(e) =>
              setIssueForm((prev) => ({ ...prev, user_id: e.target.value }))
            }
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.username})
              </option>
            ))}
          </Select>

          <Input
            value={issueForm.item_name}
            onChange={(e) =>
              setIssueForm((prev) => ({ ...prev, item_name: e.target.value }))
            }
          />

          <Input
            value={issueForm.size}
            onChange={(e) =>
              setIssueForm((prev) => ({ ...prev, size: e.target.value }))
            }
            style={{ minWidth: 120 }}
          />

          <Input
            type="number"
            min="1"
            value={issueForm.quantity}
            onChange={(e) =>
              setIssueForm((prev) => ({ ...prev, quantity: e.target.value }))
            }
            style={{ minWidth: 90 }}
          />

          <Select
            value={issueForm.status}
            onChange={(e) =>
              setIssueForm((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="issued">지급 완료</option>
            <option value="recommended">추천</option>
            <option value="pending">대기</option>
          </Select>
        </ControlRow>

        <ControlRow>
          <Input
            placeholder="비고"
            value={issueForm.note}
            onChange={(e) =>
              setIssueForm((prev) => ({ ...prev, note: e.target.value }))
            }
            style={{ minWidth: 320 }}
          />
          <Button $primary type="submit">
            지급 이력 저장
          </Button>
        </ControlRow>

        {issueMessage ? <p style={{ marginTop: 12 }}>{issueMessage}</p> : null}
      </Card>

      <Card>
        <SectionTitle>최근 측정 기록</SectionTitle>
        <SectionDesc>전체 시스템 기준 최근 측정 기록입니다.</SectionDesc>

        {!records.length ? (
          <EmptyState>측정 기록이 없습니다.</EmptyState>
        ) : (
          <Table>
            <Row $header $template="1fr 1fr 1fr 1fr 1fr">
              <div>사용자</div>
              <div>측정 시각</div>
              <div>키</div>
              <div>체중</div>
              <div>BMI</div>
            </Row>

            {records.slice(0, 10).map((record) => (
              <Row key={record.id} $template="1fr 1fr 1fr 1fr 1fr">
                <div>{userMap[record.user_id]?.name || record.user_id}</div>
                <div>{formatDateTime(record.created_at)}</div>
                <div>{mmToCm(record.height_mm)}cm</div>
                <div>{Number(record.weight_kg).toFixed(1)}kg</div>
                <div>{Number(record.bmi).toFixed(2)}</div>
              </Row>
            ))}
          </Table>
        )}
      </Card>

      <Card>
        <SectionTitle>최근 지급 이력</SectionTitle>
        <SectionDesc>전체 시스템 기준 최근 지급 및 추천 이력입니다.</SectionDesc>

        {!issues.length ? (
          <EmptyState>지급 이력이 없습니다.</EmptyState>
        ) : (
          <Table>
            <Row $header $template="1fr 1fr 0.8fr 0.8fr 0.8fr 1.2fr">
              <div>사용자</div>
              <div>품목</div>
              <div>사이즈</div>
              <div>수량</div>
              <div>상태</div>
              <div>지급 시각</div>
            </Row>

            {issues.slice(0, 10).map((issue) => (
              <Row key={issue.id} $template="1fr 1fr 0.8fr 0.8fr 0.8fr 1.2fr">
                <div>{userMap[issue.user_id]?.name || issue.user_id}</div>
                <div>{issue.item_name}</div>
                <div>{issue.size}</div>
                <div>{issue.quantity}</div>
                <div>{statusLabel(issue.status)}</div>
                <div>{formatDateTime(issue.issued_at)}</div>
              </Row>
            ))}
          </Table>
        )}
      </Card>
    </Grid>
  );
}