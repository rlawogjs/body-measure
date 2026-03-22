import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getLogisticsOptions, register } from "../api/serverApi";
import { getCurrentUser, login } from "../utils/authStorage";

const Grid = styled.div`display:grid; grid-template-columns:1.05fr .95fr; gap:20px; @media (max-width: 960px){grid-template-columns:1fr;}`;
const Card = styled.section`background:var(--paper); border:1.5px solid var(--line); border-radius:28px; box-shadow:var(--shadow); padding:28px;`;
const Kicker = styled.div`color:var(--accent-2); font-size:13px; font-weight:800; letter-spacing:.12em; text-transform:uppercase;`;
const TabRow = styled.div`display:flex; gap:10px; margin-top:18px; flex-wrap:wrap;`;
const Tab = styled.button`border:1.5px solid ${({$active})=>$active?"var(--accent)":"var(--line)"}; background:${({$active})=>$active?"var(--accent)":"var(--paper-2)"}; color:${({$active})=>$active?"#fff":"var(--text)"}; border-radius:999px; padding:10px 16px; font-weight:800; cursor:pointer;`;
const Form = styled.form`display:grid; gap:14px; margin-top:18px;`;
const Label = styled.label`display:grid; gap:8px; font-weight:700; color:var(--text);`;
const Input = styled.input`width:100%; padding:14px 16px; border-radius:16px; border:1.5px solid var(--line); background:#fcfaf6; color:var(--text);`;
const Select = styled.select`width:100%; padding:14px 16px; border-radius:16px; border:1.5px solid var(--line); background:#fcfaf6; color:var(--text);`;
const Button = styled.button`border:1.5px solid var(--accent); background:var(--accent); color:#fff; padding:13px 18px; border-radius:999px; font-weight:800; cursor:pointer;`;
const Note = styled.div`border:1px solid var(--line-soft); border-radius:18px; background:var(--paper-2); padding:14px 16px; color:var(--muted); line-height:1.7;`;
const Error = styled.div`padding:12px 14px; border-radius:16px; background:#fff1ef; color:var(--danger); border:1px solid #e7b4ac;`;
const Success = styled.div`padding:12px 14px; border-radius:16px; background:#eef6ee; color:var(--ok); border:1px solid #c9dac8;`;

const initialRegister = {
  username: "",
  password: "",
  name: "",
  role: "soldier",
  rank: "",
  unit: "",
  assigned_logistics_id: "",
};

function roleLabel(role) {
  if (role === "logistics") return "군수담당";
  if (role === "officer") return "간부";
  return "병사";
}

export default function LoginPage() {
  const nav = useNavigate();
  const current = getCurrentUser();
  const [mode, setMode] = useState("login");
  const [logistics, setLogistics] = useState([]);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (current) nav("/dashboard");
  }, [current, nav]);

  useEffect(() => {
    getLogisticsOptions().then((rows) => {
      setLogistics(Array.isArray(rows) ? rows : []);
    }).catch(() => setLogistics([]));
  }, []);

  async function onLogin(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await login(loginForm.username.trim(), loginForm.password);
      nav("/dashboard");
    } catch (err) {
      setError(err.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const payload = {
        ...registerForm,
        username: registerForm.username.trim(),
        assigned_logistics_id:
          registerForm.role === "soldier" || registerForm.role === "officer"
            ? (registerForm.assigned_logistics_id ? Number(registerForm.assigned_logistics_id) : null)
            : null,
      };
      await register(payload);
      setMessage(
        payload.role === "logistics"
          ? "회원가입이 완료되었습니다. 대표 군수담당 승인 후 로그인할 수 있습니다."
          : "회원가입이 완료되었습니다. 선택한 군수담당 승인 후 로그인할 수 있습니다."
      );
      setRegisterForm(initialRegister);
      setMode("login");
    } catch (err) {
      setError(err.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const needLogistics = registerForm.role === "soldier" || registerForm.role === "officer";

  return (
    <Grid>
      <Card>
        <Kicker>Vercel Front · Separate Backend Ready</Kicker>
        <h1 style={{ color: "var(--accent)", marginTop: 10 }}>군 피복·치수 관리 시스템</h1>
        <p style={{ marginTop: 12 }}>
          프론트는 Vercel에 배포하고, 백엔드는 별도 FastAPI 서버로 연결하는 구조를 기준으로 정리했습니다.
          병사·간부는 군수담당을 선택해 가입하고, 군수담당은 대표 군수담당 승인을 받아야 사용 가능합니다.
        </p>
        <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
          <Note>
            <strong>초기 계정</strong><br />
            관리자: admin1 / 1234<br />
            대표 군수담당: chieflogi / 1234
          </Note>
          <Note>
            <strong>승인 흐름</strong><br />
            병사·간부 → 선택한 군수담당 승인 필요<br />
            군수담당 → 대표 군수담당 또는 관리자 승인 필요
          </Note>
        </div>
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>접속 / 회원가입</h2>
        <TabRow>
          <Tab $active={mode === "login"} onClick={() => setMode("login")}>로그인</Tab>
          <Tab $active={mode === "register"} onClick={() => setMode("register")}>회원가입</Tab>
        </TabRow>

        {error ? <Error style={{ marginTop: 16 }}>{error}</Error> : null}
        {message ? <Success style={{ marginTop: 16 }}>{message}</Success> : null}

        {mode === "login" ? (
          <Form onSubmit={onLogin}>
            <Label>아이디<Input value={loginForm.username} onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))} /></Label>
            <Label>비밀번호<Input type="password" value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} /></Label>
            <Button type="submit" disabled={loading}>{loading ? "접속 중..." : "로그인"}</Button>
          </Form>
        ) : (
          <Form onSubmit={onRegister}>
            <Label>이름<Input value={registerForm.name} onChange={(e) => setRegisterForm((p) => ({ ...p, name: e.target.value }))} /></Label>
            <Label>아이디<Input value={registerForm.username} onChange={(e) => setRegisterForm((p) => ({ ...p, username: e.target.value }))} /></Label>
            <Label>비밀번호<Input type="password" value={registerForm.password} onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))} /></Label>
            <Label>역할
              <Select value={registerForm.role} onChange={(e) => setRegisterForm((p) => ({ ...p, role: e.target.value, assigned_logistics_id: "" }))}>
                <option value="soldier">병사</option>
                <option value="officer">간부</option>
                <option value="logistics">군수담당</option>
              </Select>
            </Label>
            <Label>계급<Input value={registerForm.rank} onChange={(e) => setRegisterForm((p) => ({ ...p, rank: e.target.value }))} /></Label>
            <Label>소속<Input value={registerForm.unit} onChange={(e) => setRegisterForm((p) => ({ ...p, unit: e.target.value }))} /></Label>
            {needLogistics ? (
              <Label>담당 군수담당 선택
                <Select value={registerForm.assigned_logistics_id} onChange={(e) => setRegisterForm((p) => ({ ...p, assigned_logistics_id: e.target.value }))}>
                  <option value="">선택 안 함</option>
                  {logistics.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} · {item.rank || "-"} · {item.unit || "-"}</option>
                  ))}
                </Select>
              </Label>
            ) : null}
            <Button type="submit" disabled={loading}>{loading ? "가입 중..." : `${roleLabel(registerForm.role)} 계정 생성`}</Button>
          </Form>
        )}
      </Card>
    </Grid>
  );
}
