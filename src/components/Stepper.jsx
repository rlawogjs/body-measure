import React from "react";
import styled from "styled-components";

const Bar = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
`;

const Item = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  color: ${({ active }) => (active ? "var(--accent)" : "var(--muted)")};
  font-weight: ${({ active }) => (active ? 800 : 500)};
`;

const Dot = styled.div`
  width: 11px;
  height: 11px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: ${({ active }) => (active ? "var(--accent)" : "transparent")};
`;

export default function Stepper({ step }) {
  return (
    <Bar>
      <Item active={step >= 1}><Dot active={step >= 1} />촬영</Item>
      <Item active={step >= 2}><Dot active={step >= 2} />보정</Item>
      <Item active={step >= 3}><Dot active={step >= 3} />결과</Item>
    </Bar>
  );
}
