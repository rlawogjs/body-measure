import React from "react";
import styled from "styled-components";

const Wrap = styled.div`
  display: grid;
  gap: 12px;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Pill = styled.div`
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--line-soft);
  background: var(--paper-2);
  color: var(--muted);
  font-size: 12px;
`;

const ChartBox = styled.div`
  border: 1.5px solid var(--line);
  border-radius: 24px;
  background: linear-gradient(180deg, #faf7f1, #f2ece2);
  padding: 18px;
`;

const Empty = styled.div`
  border: 1.5px dashed var(--line);
  border-radius: 20px;
  background: var(--paper-2);
  padding: 30px 18px;
  text-align: center;
  color: var(--muted);
`;

function valueText(title, value) {
  if (title === "체중") return `${Number(value).toFixed(1)} kg`;
  if (title === "BMI" || title.includes("비율")) return Number(value).toFixed(2);
  return `${(value / 10).toFixed(1)} cm`;
}

export default function HistoryChart({ title, series }) {
  if (!series || series.length === 0) return <Empty>저장된 변화 기록이 없어요.</Empty>;

  const width = 680;
  const height = 280;
  const padding = 34;
  const values = series.map((d) => d.valueMm);
  const min = title === "키(추정)" ? 0 : Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  const points = series.map((item, i) => {
    const x = series.length === 1 ? width / 2 : padding + (i * (width - padding * 2)) / (series.length - 1);
    const y = height - padding - ((item.valueMm - min) / range) * (height - padding * 2);
    return { x, y, ...item };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const diff = series[series.length - 1].valueMm - series[0].valueMm;

  return (
    <Wrap>
      <MetaRow>
        <Pill>{title}</Pill>
        <Pill>최소 {valueText(title, min)}</Pill>
        <Pill>최대 {valueText(title, max)}</Pill>
        <Pill>변화량 {diff > 0 ? "+" : ""}{valueText(title, diff)}</Pill>
      </MetaRow>
      <ChartBox>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`${title} 그래프`}>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(103,82,66,0.35)" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(103,82,66,0.35)" />

          {[0, 0.5, 1].map((t) => {
            const y = height - padding - t * (height - padding * 2);
            const value = min + t * range;
            return (
              <g key={t}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(103,82,66,0.12)" strokeDasharray="4 5" />
                <text x={padding - 8} y={y + 4} textAnchor="end" fontSize="11" fill="rgba(103,82,66,0.72)">{valueText(title, value)}</text>
              </g>
            );
          })}

          <polyline fill="none" stroke="#675242" strokeWidth="3" points={polyline} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p) => (
            <g key={p.id}>
              <circle cx={p.x} cy={p.y} r="5" fill="#b7926e" />
              <text x={p.x} y={height - 10} textAnchor="middle" fontSize="11" fill="rgba(103,82,66,0.7)">{p.index}</text>
            </g>
          ))}
        </svg>
      </ChartBox>
    </Wrap>
  );
}
