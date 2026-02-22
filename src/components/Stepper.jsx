import React from "react";
import styled from "styled-components";

const Bar = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ active }) => (active ? "var(--accent)" : "rgba(255,255,255,0.25)")};
  box-shadow: ${({ active }) => (active ? "0 0 0 6px rgba(124,58,237,0.22)" : "none")};
`;

const Label = styled.div`
  font-size: 13px;
  color: var(--muted);
  white-space: nowrap;
`;

export default function Stepper({ step }) {
  return (
    <Bar>
      <Dot active={step >= 1} />
      <Label>업로드</Label>
      <Dot active={step >= 2} />
      <Label>기준 입력</Label>
      <Dot active={step >= 3} />
      <Label>결과</Label>
    </Bar>
  );
}