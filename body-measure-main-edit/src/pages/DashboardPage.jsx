import React, { useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, isPrivileged } from "../utils/authStorage";
import { loadMeasurementHistory, formatDateTime } from "../utils/measurementHistory";
import { getIssueRecords } from "../utils/militaryDb";

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
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Card = styled.section`
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 24px;
  padding: 22px;
`;

const ButtonRow = styled.div`
  margin-top: 18px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  border: 1.5px solid ${({ primary }) => (primary ? "var(--accent)" : "var(--line)")};
  background: ${({ primary }) => (primary ? "var(--accent)" : "var(--paper-2)")};
  color: ${({ primary }) => (primary ? "white" : "var(--text)")};
  padding: 12px 16px;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
`;

const Record = styled.div`
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--paper-2);
  border: 1px solid var(--line-soft);
  margin-top: 10px;
`;

function mmToCm(mm) {
  return (mm / 10).toFixed(1);
}

export default function DashboardPage() {
  const nav = useNavigate();
  const user = getCurrentUser();
  const allHistory = loadMeasurementHistory();
  const issues = getIssueRecords();

  const userHistory = useMemo(() => {
    if (!user) return [];
    return allHistory.filter((h) => h.userId === user.id);
  }, [allHistory, user]);

  const userIssues = useMemo(() => {
    if (!user) return [];
    return issues.filter((i) => i.userId === user.id);
  }, [issues, user]);

  const lastHeight = userHistory[0]?.measures?.["키(추정)"]?.mm;
  const lastBmi = userHistory[0]?.measures?.BMI?.mm;

  return (
    <Grid>
      <Hero>
        <div style={{ color: "var(--accent-2)", fontSize: 13, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>Operations Dashboard</div>
        <h1 style={{ color: "var(--accent)", marginTop: 10 }}>{user?.name}님, 반갑습니다.</h1>
        <p style={{ marginTop: 12 }}>
          {user?.unit} / {user?.company} / {user?.platoon} 기준으로 개인 치수 기록과 군 피복 지급 상태를 확인할 수 있습니다.
        </p>
        <ButtonRow>
          <Button primary onClick={() => nav("/upload")}>새 치수 측정</Button>
          {isPrivileged(user) ? <Button onClick={() => nav("/admin")}>관리 페이지</Button> : null}
        </ButtonRow>
      </Hero>

      <CardGrid>
        <Card>
          <h3 style={{ color: "var(--accent)" }}>최근 신장</h3>
          <h2 style={{ color: "var(--text)", marginTop: 12 }}>{lastHeight ? `${mmToCm(lastHeight)} cm` : "-"}</h2>
          <p style={{ marginTop: 8 }}>가장 최근 저장된 기준 길이입니다.</p>
        </Card>
        <Card>
          <h3 style={{ color: "var(--accent)" }}>최근 BMI</h3>
          <h2 style={{ color: "var(--text)", marginTop: 12 }}>{typeof lastBmi === "number" ? Number(lastBmi).toFixed(2) : "-"}</h2>
          <p style={{ marginTop: 8 }}>기록 저장과 함께 자동 계산된 값입니다.</p>
        </Card>
        <Card>
          <h3 style={{ color: "var(--accent)" }}>지급 품목 수</h3>
          <h2 style={{ color: "var(--text)", marginTop: 12 }}>{userIssues.length}건</h2>
          <p style={{ marginTop: 8 }}>현재 사용자 기준 피복 지급 기록 수입니다.</p>
        </Card>
      </CardGrid>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>최근 측정 기록</h2>
        {userHistory.length === 0 ? (
          <p style={{ marginTop: 12 }}>아직 기록이 없습니다. 새 치수 측정을 진행해 주세요.</p>
        ) : (
          userHistory.slice(0, 4).map((entry) => (
            <Record key={entry.id}>
              <strong>{formatDateTime(entry.createdAt)}</strong>
              <div style={{ marginTop: 6, color: "var(--muted)" }}>
                키 {entry.measures?.["키(추정)"] ? `${mmToCm(entry.measures["키(추정)"].mm)} cm` : "-"}
                {" · "}
                BMI {typeof entry.measures?.BMI?.mm === "number" ? Number(entry.measures.BMI.mm).toFixed(2) : "-"}
              </div>
            </Record>
          ))
        )}
      </Card>
    </Grid>
  );
}
