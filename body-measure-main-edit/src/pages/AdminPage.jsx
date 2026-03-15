import React, { useMemo } from "react";
import styled from "styled-components";
import { getCurrentUser, getUsers } from "../utils/authStorage";
import { loadMeasurementHistory, formatDateTime } from "../utils/measurementHistory";
import { getIssueRecords } from "../utils/militaryDb";

const Grid = styled.div`
  display: grid;
  gap: 18px;
`;

const Card = styled.section`
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 24px;
  padding: 24px;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  @media (max-width: 900px) { grid-template-columns: 1fr 1fr; }
`;

const Stat = styled.div`
  border: 1px solid var(--line-soft);
  background: var(--paper-2);
  border-radius: 18px;
  padding: 16px;
`;

const Table = styled.div`
  margin-top: 16px;
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: ${({ cols }) => cols || "1fr 1fr 1fr 1fr"};
  gap: 10px;
  padding: 13px 14px;
  align-items: center;
  border-top: 1px solid var(--line-soft);
  background: ${({ header }) => (header ? "var(--paper-2)" : "transparent")};
  font-weight: ${({ header }) => (header ? 800 : 500)};

  &:first-child { border-top: 0; }
`;

export default function AdminPage() {
  const user = getCurrentUser();
  const users = getUsers();
  const history = loadMeasurementHistory();
  const issues = getIssueRecords();

  const monthCount = useMemo(() => {
    const month = new Date().getMonth();
    return history.filter((h) => new Date(h.createdAt).getMonth() === month).length;
  }, [history]);

  const avgBmi = useMemo(() => {
    const values = history.map((h) => h.measures?.BMI?.mm).filter((v) => typeof v === "number");
    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }, [history]);

  if (!user || (user.role !== "admin" && user.role !== "logistics")) {
    return (
      <Card>
        <h2 style={{ color: "var(--accent)" }}>접근 제한</h2>
        <p style={{ marginTop: 10 }}>관리자 또는 군수담당 계정만 접근할 수 있습니다.</p>
      </Card>
    );
  }

  return (
    <Grid>
      <Card>
        <h1 style={{ color: "var(--accent)" }}>관리 페이지</h1>
        <p style={{ marginTop: 10 }}>군 피복·치수 관리 시스템의 프론트엔드 관리자 시안입니다.</p>

        <StatGrid style={{ marginTop: 18 }}>
          <Stat><strong>등록 사용자</strong><h2 style={{ marginTop: 10 }}>{users.length}</h2></Stat>
          <Stat><strong>총 측정 기록</strong><h2 style={{ marginTop: 10 }}>{history.length}</h2></Stat>
          <Stat><strong>총 지급 건수</strong><h2 style={{ marginTop: 10 }}>{issues.length}</h2></Stat>
          <Stat><strong>평균 BMI</strong><h2 style={{ marginTop: 10 }}>{avgBmi ? avgBmi.toFixed(2) : "-"}</h2></Stat>
        </StatGrid>
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>사용자 목록</h2>
        <Table>
          <Row header cols="1fr 0.8fr 1.1fr 1.2fr 0.8fr">
            <div>이름</div><div>권한</div><div>부대</div><div>소속</div><div>계급</div>
          </Row>
          {users.map((u) => (
            <Row key={u.id} cols="1fr 0.8fr 1.1fr 1.2fr 0.8fr">
              <div>{u.name}</div><div>{u.role}</div><div>{u.unit}</div><div>{u.company} / {u.platoon}</div><div>{u.rank}</div>
            </Row>
          ))}
        </Table>
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>최근 측정 기록</h2>
        <p style={{ marginTop: 8 }}>이번 달 측정 건수: {monthCount}건</p>
        <Table>
          <Row header cols="1fr 1fr 1fr 1fr">
            <div>일시</div><div>사용자</div><div>부대</div><div>BMI</div>
          </Row>
          {history.slice(0, 8).map((h) => (
            <Row key={h.id} cols="1fr 1fr 1fr 1fr">
              <div>{formatDateTime(h.createdAt)}</div>
              <div>{h.userName}</div>
              <div>{h.unit} / {h.company}</div>
              <div>{typeof h.measures?.BMI?.mm === "number" ? Number(h.measures.BMI.mm).toFixed(2) : "-"}</div>
            </Row>
          ))}
        </Table>
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>피복 지급 이력</h2>
        <Table>
          <Row header cols="1fr 1fr 0.8fr 0.6fr 0.8fr">
            <div>사용자</div><div>품목</div><div>사이즈</div><div>수량</div><div>상태</div>
          </Row>
          {issues.map((r) => (
            <Row key={r.id} cols="1fr 1fr 0.8fr 0.6fr 0.8fr">
              <div>{r.userName}</div><div>{r.item}</div><div>{r.size}</div><div>{r.qty}</div><div>{r.status}</div>
            </Row>
          ))}
        </Table>
      </Card>
    </Grid>
  );
}
