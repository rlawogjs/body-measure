import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, API_BASE } from "../api/serverApi";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "soldier",
    rank: "",
    unit: "",
    managerUserId: "",
  });

  const [users, setUsers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingManagers(true);
        const res = await fetch(`${API_BASE}/public/managers`);
        const rows = await res.json();
        setUsers(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.error(err);
        setUsers([]);
      } finally {
        setLoadingManagers(false);
      }
    };

    loadUsers();
  }, []);

  const managerOptions = useMemo(() => {
    return users.filter(
      (user) => user.role === "logistics" || user.role === "chief_logistics"
    );
  }, [users]);

  const needsManager = form.role === "soldier" || form.role === "officer";

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
    setSuccess("");

    if (!form.username.trim()) return setError("아이디를 입력해주세요.");
    if (!form.password) return setError("비밀번호를 입력해주세요.");
    if (form.password !== form.confirmPassword) return setError("비밀번호 확인이 일치하지 않습니다.");
    if (!form.name.trim()) return setError("이름을 입력해주세요.");
    if (needsManager && !form.managerUserId) return setError("담당 군수담당을 선택해주세요.");

    setSubmitting(true);

    try {
      await register({
        username: form.username.trim(),
        password: form.password,
        name: form.name.trim(),
        role: form.role,
        rank: form.rank.trim(),
        unit: form.unit.trim(),
        manager_user_id: needsManager ? Number(form.managerUserId) : null,
      });

      setSuccess("회원가입이 완료되었습니다. 승인 후 로그인 가능합니다.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || "회원가입에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Findfit 회원가입</h1>
        <p style={styles.subtitle}>계정을 등록하고 승인 후 이용할 수 있습니다.</p>

        <form onSubmit={onSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>아이디</label>
            <input style={styles.input} name="username" value={form.username} onChange={onChange} />
          </div>

          <div>
            <label style={styles.label}>비밀번호</label>
            <input style={styles.input} type="password" name="password" value={form.password} onChange={onChange} />
          </div>

          <div>
            <label style={styles.label}>비밀번호 확인</label>
            <input style={styles.input} type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} />
          </div>

          <div>
            <label style={styles.label}>이름</label>
            <input style={styles.input} name="name" value={form.name} onChange={onChange} />
          </div>

          <div>
            <label style={styles.label}>계정 유형</label>
            <select style={styles.input} name="role" value={form.role} onChange={onChange}>
              <option value="soldier">병사</option>
              <option value="officer">간부</option>
              <option value="logistics">군수담당</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>계급</label>
            <input style={styles.input} name="rank" value={form.rank} onChange={onChange} />
          </div>

          <div>
            <label style={styles.label}>소속</label>
            <input style={styles.input} name="unit" value={form.unit} onChange={onChange} />
          </div>

          {needsManager && (
            <div>
              <label style={styles.label}>담당 군수담당</label>
              <select
                style={styles.input}
                name="managerUserId"
                value={form.managerUserId}
                onChange={onChange}
                disabled={loadingManagers}
              >
                <option value="">
                  {loadingManagers ? "불러오는 중..." : "담당자 선택"}
                </option>
                {managerOptions.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.username}) / {user.rank || "-"} / {user.unit || "-"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error ? <div style={styles.error}>{error}</div> : null}
          {success ? <div style={styles.success}>{success}</div> : null}

          <button type="submit" style={styles.button} disabled={submitting}>
            {submitting ? "처리 중..." : "회원가입"}
          </button>
        </form>

        <div style={styles.bottomRow}>
          <span>이미 계정이 있나요?</span>
          <button type="button" style={styles.linkButton} onClick={() => navigate("/login")}>
            로그인으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #eef4ff 0%, #f7faff 50%, #eef7ff 100%)", padding: "24px" },
  card: { width: "100%", maxWidth: "560px", background: "#fff", borderRadius: "20px", padding: "32px", boxShadow: "0 16px 40px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" },
  title: { margin: 0, fontSize: "32px", color: "#111827" },
  subtitle: { marginTop: "8px", marginBottom: "24px", color: "#6b7280", lineHeight: 1.6 },
  form: { display: "grid", gap: "16px" },
  label: { display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" },
  input: { width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box", background: "#fff" },
  button: { marginTop: "8px", padding: "12px 14px", border: "none", borderRadius: "10px", background: "#2563eb", color: "#fff", fontWeight: "700", fontSize: "15px", cursor: "pointer" },
  error: { padding: "12px 14px", borderRadius: "10px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", fontSize: "14px" },
  success: { padding: "12px 14px", borderRadius: "10px", background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", fontSize: "14px" },
  bottomRow: { marginTop: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#475569", fontSize: "14px" },
  linkButton: { border: "none", background: "none", color: "#2563eb", fontWeight: "700", cursor: "pointer", fontSize: "14px" },
};

export default RegisterPage;