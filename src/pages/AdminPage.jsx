import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  createIssue,
  getAllIssues,
  getAllMeasurements,
  getApprovalQueue,
  getUsers,
  updateUserApproval,
} from "../api/serverApi";
import { getCurrentUser, isPrivileged } from "../utils/authStorage";
import { formatDateTime } from "../utils/measurementHistory";

const Grid = styled.div`display:grid; gap:18px;`;
const Card = styled.section`background:var(--paper); border:1.5px solid var(--line); border-radius:28px; box-shadow:var(--shadow-soft); padding:24px;`;
const Row = styled.div`display:grid; grid-template-columns:1.2fr .9fr .9fr .9fr auto; gap:10px; padding:14px 0; border-top:1px solid var(--line-soft); align-items:center; @media (max-width:900px){grid-template-columns:1fr;}`;
const Select = styled.select`padding:12px 14px; border-radius:14px; border:1.5px solid var(--line); background:#fcfaf6; min-width:170px;`;
const Input = styled.input`padding:12px 14px; border-radius:14px; border:1.5px solid var(--line); background:#fcfaf6; min-width:140px;`;
const Button = styled.button`border:1.5px solid ${({$muted})=>$muted?"var(--line)":"var(--accent)"}; background:${({$muted})=>$muted?"var(--paper-2)":"var(--accent)"}; color:${({$muted})=>$muted?"var(--text)":"#fff"}; padding:10px 14px; border-radius:999px; font-weight:800; cursor:pointer;`;
const Info = styled.div`border:1px solid var(--line-soft); background:var(--paper-2); border-radius:18px; padding:14px 16px;`;

function roleLabel(role) {
  if (role === "admin") return "관리자";
  if (role === "logistics") return "군수담당";
  if (role === "officer") return "간부";
  return "병사";
}
function statusLabel(status) {
  return status === "approved" ? "승인 완료" : status === "rejected" ? "반려" : "승인 대기";
}

export default function AdminPage() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const canManage = isPrivileged(currentUser);
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [issues, setIssues] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [issueForm, setIssueForm] = useState({ user_id: "", item_name: "전투복 상의", size: "100", quantity: 1, status: "issued", note: "" });
  const [message, setMessage] = useState("");
  const [approvalNotes, setApprovalNotes] = useState({});

  async function loadAll() {
    try {
      const [userRows, measurementRows, issueRows, pendingRows] = await Promise.all([
        getUsers(),
        getAllMeasurements(),
        getAllIssues(),
        getApprovalQueue(),
      ]);
      setUsers(Array.isArray(userRows) ? userRows : []);
      setRecords(Array.isArray(measurementRows) ? measurementRows : []);
      setIssues(Array.isArray(issueRows) ? issueRows : []);
      setPendingUsers(Array.isArray(pendingRows) ? pendingRows : []);
      setIssueForm((prev) => ({ ...prev, user_id: prev.user_id || String(userRows?.find((u) => ["soldier", "officer"].includes(u.role))?.id || "") }));
    } catch (err) {
      setMessage(err.message || "관리 데이터를 불러오지 못했습니다.");
    }
  }

  useEffect(() => { if (canManage) loadAll(); }, [canManage]);

  async function handleApproval(userId, action) {
    setMessage("");
    try {
      await updateUserApproval(userId, action, approvalNotes[userId] || "");
      setMessage(action === "approve" ? "승인 처리했습니다." : "반려 처리했습니다.");
      await loadAll();
    } catch (err) {
      setMessage(err.message || "승인 처리에 실패했습니다.");
    }
  }

  async function handleCreateIssue(e) {
    e.preventDefault();
    setMessage("");
    try {
      await createIssue({
        user_id: Number(issueForm.user_id),
        item_name: issueForm.item_name,
        size: issueForm.size,
        quantity: Number(issueForm.quantity) || 1,
        status: issueForm.status,
        note: issueForm.note,
      });
      setMessage("지급 이력을 저장했습니다.");
      await loadAll();
    } catch (err) {
      setMessage(err.message || "지급 이력 저장 실패");
    }
  }

  if (!canManage) {
    return <Card>이 페이지는 승인된 관리자 또는 군수담당만 접근할 수 있습니다.</Card>;
  }

  return (
    <Grid>
      <Card>
        <div style={{ color: "var(--accent)", fontWeight: 900, fontSize: 12, letterSpacing: ".08em" }}>● APPROVAL & ISSUE</div>
        <h1 style={{ marginTop: 12, color: "var(--accent)" }}>승인·지급 관리</h1>
        <p style={{ marginTop: 10 }}>
          현재 사용자: <strong>{currentUser?.name}</strong> · {roleLabel(currentUser?.role)}
          {currentUser?.is_primary_logistics ? " · 대표 군수담당" : ""}
        </p>
        {message ? <Info style={{ marginTop: 14 }}>{message}</Info> : null}
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>승인 대기 계정</h2>
        {!pendingUsers.length ? <p style={{ marginTop: 12 }}>현재 처리할 승인 대기 계정이 없습니다.</p> : (
          <div>
            {pendingUsers.map((user) => (
              <Row key={user.id}>
                <div>
                  <strong>{user.name}</strong><br />
                  {user.username} · {roleLabel(user.role)} · {user.rank || "계급 미입력"}<br />
                  소속 {user.unit || "-"}<br />
                  담당 군수담당 {user.assigned_logistics_name || "미지정"}
                </div>
                <div>{statusLabel(user.approval_status)}</div>
                <Input placeholder="승인 메모" value={approvalNotes[user.id] || ""} onChange={(e) => setApprovalNotes((prev) => ({ ...prev, [user.id]: e.target.value }))} />
                <Button onClick={() => handleApproval(user.id, "approve")}>승인</Button>
                <Button $muted onClick={() => handleApproval(user.id, "reject")}>반려</Button>
              </Row>
            ))}
          </div>
        )}
      </Card>

      <Card as="form" onSubmit={handleCreateIssue}>
        <h2 style={{ color: "var(--accent)" }}>지급 이력 등록</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <Select value={issueForm.user_id} onChange={(e) => setIssueForm((p) => ({ ...p, user_id: e.target.value }))}>
            {users.filter((u) => u.role === "soldier" || u.role === "officer").map((user) => (
              <option key={user.id} value={user.id}>{user.name} · {roleLabel(user.role)}</option>
            ))}
          </Select>
          <Input value={issueForm.item_name} onChange={(e) => setIssueForm((p) => ({ ...p, item_name: e.target.value }))} />
          <Input value={issueForm.size} onChange={(e) => setIssueForm((p) => ({ ...p, size: e.target.value }))} />
          <Input type="number" min="1" value={issueForm.quantity} onChange={(e) => setIssueForm((p) => ({ ...p, quantity: e.target.value }))} />
          <Select value={issueForm.status} onChange={(e) => setIssueForm((p) => ({ ...p, status: e.target.value }))}>
            <option value="issued">지급 완료</option>
            <option value="recommended">추천</option>
            <option value="pending">대기</option>
          </Select>
        </div>
        <Input style={{ marginTop: 12, width: "100%" }} placeholder="비고" value={issueForm.note} onChange={(e) => setIssueForm((p) => ({ ...p, note: e.target.value }))} />
        <Button type="submit" style={{ marginTop: 14 }}>지급 이력 저장</Button>
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>사용자 현황</h2>
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {users.slice(0, 12).map((user) => (
            <Info key={user.id}>
              <strong>{user.name}</strong> · {roleLabel(user.role)} · {statusLabel(user.approval_status)}<br />
              아이디 {user.username} · 소속 {user.unit || "-"} · 담당 군수담당 {user.assigned_logistics_name || "미지정"}
            </Info>
          ))}
        </div>
      </Card>

      <Card>
        <h2 style={{ color: "var(--accent)" }}>최근 시스템 기록</h2>
        <p style={{ marginTop: 10 }}>최근 측정 {records.length}건 / 최근 지급 {issues.length}건</p>
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {records.slice(0, 5).map((record) => (
            <Info key={`m-${record.id}`}>측정 #{record.id} · 사용자 {record.user_id} · {formatDateTime(record.created_at)}</Info>
          ))}
          {issues.slice(0, 5).map((issue) => (
            <Info key={`i-${issue.id}`}>{issue.item_name} · {issue.size} · {formatDateTime(issue.issued_at)}</Info>
          ))}
        </div>
      </Card>
    </Grid>
  );
}
