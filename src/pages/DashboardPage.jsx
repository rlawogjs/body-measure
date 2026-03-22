import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  getMyMeasurements,
  getMyIssues,
  getAllMeasurements,
  getAllIssues,
} from "../api/serverApi";

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [issues, setIssues] = useState([]);
  const [allMeasurements, setAllMeasurements] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin" || user?.role === "logistics";

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const me = await getCurrentUser();
        setUser(me);

        const [myMeasurements, myIssues] = await Promise.all([
          getMyMeasurements(),
          getMyIssues(),
        ]);

        setMeasurements(Array.isArray(myMeasurements) ? myMeasurements : []);
        setIssues(Array.isArray(myIssues) ? myIssues : []);

        if (me?.role === "admin" || me?.role === "logistics") {
          const [adminMeasurements, adminIssues] = await Promise.all([
            getAllMeasurements(),
            getAllIssues(),
          ]);

          setAllMeasurements(
            Array.isArray(adminMeasurements) ? adminMeasurements : []
          );
          setAllIssues(Array.isArray(adminIssues) ? adminIssues : []);
        }
      } catch (err) {
        console.error(err);
        setError("대시보드 정보를 불러오지 못했습니다. 다시 로그인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const latestMeasurement = useMemo(() => {
    if (!measurements.length) return null;
    return [...measurements].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];
  }, [measurements]);

  const latestIssue = useMemo(() => {
    if (!issues.length) return null;
    return [...issues].sort(
      (a, b) =>
        new Date(b.issued_at || b.created_at) -
        new Date(a.issued_at || a.created_at)
    )[0];
  }, [issues]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>오류</h2>
          <p>{error}</p>
          <button style={styles.button} onClick={() => navigate("/login")}>
            로그인으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.mainTitle}>B-MAS 대시보드</h1>
          <p style={styles.subtitle}>
            환영합니다, {user?.name || user?.username}님
          </p>
        </div>
        <div style={styles.badge}>권한: {user?.role || "unknown"}</div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.title}>내 정보</h2>
          <p>
            <strong>이름:</strong> {user?.name || "-"}
          </p>
          <p>
            <strong>아이디:</strong> {user?.username || "-"}
          </p>
          <p>
            <strong>계급:</strong> {user?.rank || "-"}
          </p>
          <p>
            <strong>소속:</strong> {user?.unit || "-"}
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.title}>내 측정 현황</h2>
          <p>
            <strong>총 측정 기록:</strong> {measurements.length}건
          </p>
          {latestMeasurement ? (
            <>
              <p>
                <strong>최근 키:</strong> {latestMeasurement.height_cm ?? "-"} cm
              </p>
              <p>
                <strong>최근 가슴:</strong> {latestMeasurement.chest_cm ?? "-"} cm
              </p>
              <p>
                <strong>최근 허리:</strong> {latestMeasurement.waist_cm ?? "-"} cm
              </p>
              <p>
                <strong>최근 등록일:</strong>{" "}
                {formatDate(latestMeasurement.created_at)}
              </p>
            </>
          ) : (
            <p>아직 측정 기록이 없습니다.</p>
          )}
          <button style={styles.button} onClick={() => navigate("/upload")}>
            새 측정 시작
          </button>
        </div>

        <div style={styles.card}>
          <h2 style={styles.title}>최근 지급 이력</h2>
          <p>
            <strong>총 지급 기록:</strong> {issues.length}건
          </p>
          {latestIssue ? (
            <>
              <p>
                <strong>품목:</strong> {latestIssue.item_name || "-"}
              </p>
              <p>
                <strong>사이즈:</strong> {latestIssue.size || "-"}
              </p>
              <p>
                <strong>수량:</strong> {latestIssue.quantity ?? "-"}
              </p>
              <p>
                <strong>지급일:</strong>{" "}
                {formatDate(latestIssue.issued_at || latestIssue.created_at)}
              </p>
            </>
          ) : (
            <p>지급 이력이 없습니다.</p>
          )}
          <button
            style={styles.secondaryButton}
            onClick={() => navigate("/result")}
          >
            측정 결과 보기
          </button>
        </div>

        {isAdmin && (
          <div style={styles.card}>
            <h2 style={styles.title}>관리자 요약</h2>
            <p>
              <strong>전체 측정 기록:</strong> {allMeasurements.length}건
            </p>
            <p>
              <strong>전체 지급 기록:</strong> {allIssues.length}건
            </p>
            <button style={styles.button} onClick={() => navigate("/admin")}>
              관리자 페이지 이동
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR");
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "32px 20px",
  },
  headerRow: {
    maxWidth: "1200px",
    margin: "0 auto 24px auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  mainTitle: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "700",
    color: "#1f2937",
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#6b7280",
  },
  badge: {
    background: "#e5eefc",
    color: "#1d4ed8",
    padding: "10px 14px",
    borderRadius: "999px",
    fontWeight: "600",
  },
  grid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  },
  title: {
    marginTop: 0,
    marginBottom: "16px",
    fontSize: "20px",
    color: "#111827",
  },
  button: {
    marginTop: "16px",
    width: "100%",
    padding: "12px 14px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },
  secondaryButton: {
    marginTop: "16px",
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#111827",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default DashboardPage;