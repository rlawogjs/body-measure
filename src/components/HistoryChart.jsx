import React from "react";
import styled, { keyframes } from "styled-components";

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Wrap = styled.div`
  display: grid;
  gap: 12px;
  animation: ${rise} .6s ease;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Meta = styled.div`
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
  box-shadow: var(--shadow-soft);
  padding: 18px;
`;

const Empty = styled.div`
  border: 1.5px dashed var(--line);
  border-radius: 22px;
  background: var(--paper-2);
  padding: 34px 18px;
  text-align: center;
  color: var(--muted);
`;

function valueText(title, value) {
  const fixed2 = Number(value).toFixed(2);

  if (title === "체중") return `${Number(value).toFixed(1)} kg`;
  if (
    title === "BMI" ||
    title === "허리/키 비율" ||
    title === "어깨/허리 비율" ||
    title === "상체/하체 비율"
  ) {
    return fixed2;
  }
  return `${(value / 10).toFixed(1)}`;
}

export default function HistoryChart({ title, series }) {
  if (!series || series.length === 0) {
    return <Empty>아직 저장된 변화 기록이 없어요.</Empty>;
  }

  const width = 680;
  const height = 280;
  const padding = 34;

  const values = series.map((d) => d.valueMm);
  const min = title === "키(추정)" ? 0 : Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  const points = series.map((item, i) => {
    const x =
      series.length === 1
        ? width / 2
        : padding + (i * (width - padding * 2)) / (series.length - 1);

    const y =
      height -
      padding -
      ((item.valueMm - min) / range) * (height - padding * 2);

    return { x, y, ...item };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const first = series[0];
  const last = series[series.length - 1];
  const diff = last.valueMm - first.valueMm;

  return (
    <Wrap>
      <MetaRow>
        <Meta>{title}</Meta>
        <Meta>최소 {valueText(title, min)}</Meta>
        <Meta>최대 {valueText(title, max)}</Meta>
        <Meta>
          변화량 {diff > 0 ? "+" : ""}
          {valueText(title, diff)}
        </Meta>
      </MetaRow>

      <ChartBox>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`${title} 그래프`}>
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="rgba(108,88,71,0.38)"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="rgba(108,88,71,0.38)"
          />

          {[0, 0.5, 1].map((t) => {
            const y = height - padding - t * (height - padding * 2);
            const value = min + t * range;

            return (
              <g key={t}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="rgba(108,88,71,0.12)"
                  strokeDasharray="4 5"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="rgba(108,88,71,0.72)"
                >
                  {valueText(title, value)}
                </text>
              </g>
            );
          })}

          <polyline
            fill="none"
            stroke="#6c5847"
            strokeWidth="3"
            points={polyline}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((p) => (
            <g key={p.id}>
              <circle cx={p.x} cy={p.y} r="5" fill="#b7926e" />
              <circle cx={p.x} cy={p.y} r="9" fill="rgba(183,146,110,0.12)" />
              <text
                x={p.x}
                y={height - 9}
                textAnchor="middle"
                fontSize="11"
                fill="rgba(108,88,71,0.68)"
              >
                {p.index}
              </text>
            </g>
          ))}
        </svg>
      </ChartBox>
    </Wrap>
  );
}