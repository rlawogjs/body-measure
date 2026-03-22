import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../utils/authStorage";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(form.username.trim(), form.password);

      if (user?.approved === false) {
        setError("아직 승인되지 않은 계정입니다. 담당자 승인 후 이용 가능합니다.");
        return;
      }

      if (user?.role === "admin" || user?.role === "logistics") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Findfit 로그인</h1>
        <p style={styles.subtitle}>AI 기반 의류 사이즈 추천 및 피복 관리 시스템</p>

        <form onSubmit={onSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>아이디</label>
            <input
              style={styles.input}
              type="text"
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="아이디 입력"
              autoComplete="username"
            />
          </div>

          <div>
            <label style={styles.label}>비밀번호</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="비밀번호 입력"
              autoComplete="current-password"
            />
          </div>

          {error ? <div style={styles.error}>{error}</div> : null}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div style={styles.signupBox}>
          <span>계정이 없나요?</span>
          <button
            type="button"
            style={styles.signupBtn}
            onClick={() => navigate("/register")}
          >
            회원가입
          </button>
        </div>

        <div style={styles.demoBox}>
          <div><strong>테스트 계정</strong></div>
          <div>관리자: admin1 / 1234</div>
          <div>대표 군수담당: chieflogi / 1234</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #e8f0ff 0%, #f7faff 50%, #eef4ff 100%)",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111827",
  },
  subtitle: {
    marginTop: "8px",
    marginBottom: "24px",
    color: "#6b7280",
  },
  form: {
    display: "grid",
    gap: "16px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  button: {
    marginTop: "4px",
    padding: "12px 14px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
  },
  error: {
    padding: "12px 14px",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    fontSize: "14px",
  },
  signupBox: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
    color: "#475569",
  },
  signupBtn: {
    border: "none",
    background: "none",
    color: "#2563eb",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
  },
  demoBox: {
    marginTop: "20px",
    padding: "14px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "14px",
    lineHeight: 1.7,
  },
};

export default LoginPage;