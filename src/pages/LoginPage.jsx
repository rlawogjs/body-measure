import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, login } from "../utils/authStorage";

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 20px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;
const Card = styled.section`
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 28px;
  box-shadow: var(--shadow);
  padding: 28px;
`;
const Kicker = styled.div`
  color: var(--accent-2);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
`;
const InputWrap = styled.div`
  margin-top: 18px;
  display: grid;
  gap: 10px;
`;
const Input = styled.input`
  width: 100%;
  padding: 15px 16px;
  border-radius: 16px;
  border: 1.5px solid var(--line);
  background: #fcfaf6;
  color: var(--text);
`;
const Button = styled.button`
  margin-top: 16px;
  border: 1.5px solid var(--accent);
  background: var(--accent);
  color: white;
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;
const Demo = styled.div`
  margin-top: 16px;
  display: grid;
  gap: 10px;
`;
const DemoItem = styled.div`
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  background: var(--paper-2);
  padding: 14px 16px;
`;

export default function LoginPage() {
  const nav = useNavigate();
  const current = getCurrentUser();
  const [username, setUsername] = useState("soldier1");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (current) nav("/dashboard");
  }, [current, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      nav("/dashboard");
    } catch (err) {
      setError(err.message || "계정 정보가 맞지 않습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Grid>
      <Card>
        <Kicker>Military Clothing & Measurement</Kicker>
        <h1 style={{ color: "var(--accent)", marginTop: 10 }}>군 피복·치수 관리 시스템</h1>
        <p style={{ marginTop: 12 }}>
          병사 개인 치수 기록, 군 피복 사이즈 추천, 보급 및 지급 이력 관리를 서버 DB 기반으로 통합한 버전입니다.
        </p>
        <div style={{ marginTop: 28, borderTop: "1px solid var(--line-soft)", paddingTop: 18 }}>
          <h3>적용 방향</h3>
          <p style={{ marginTop: 10 }}>측정 데이터를 개인 기록으로만 두지 않고 피복 추천과 지급 이력까지 연결해서 군수 행정을 보조합니다.</p>
        </div>
      </Card>

      <Card as="form" onSubmit={onSubmit}>
        <h2 style={{ color: "var(--accent)" }}>로그인</h2>
        <p style={{ marginTop: 10 }}>백엔드 DB에 저장된 계정으로 로그인합니다.</p>

        <InputWrap>
          <label>아이디</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </InputWrap>

        <InputWrap>
          <label>비밀번호</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </InputWrap>

        {error ? <p style={{ marginTop: 12, color: "var(--danger)" }}>{error}</p> : null}
        <Button type="submit" disabled={loading}>{loading ? "접속 중..." : "시스템 접속"}</Button>

        <Demo>
          <DemoItem><strong>병사</strong><br />soldier1 / 1234</DemoItem>
          <DemoItem><strong>군수담당</strong><br />logi1 / 1234</DemoItem>
          <DemoItem><strong>관리자</strong><br />admin1 / 1234</DemoItem>
        </Demo>
      </Card>
    </Grid>
  );
}
