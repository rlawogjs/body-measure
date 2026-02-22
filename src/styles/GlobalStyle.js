import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root{
    --bg: #0b0f19;
    --card: #111827;
    --muted: rgba(255,255,255,0.72);
    --text: rgba(255,255,255,0.92);
    --line: rgba(255,255,255,0.12);
    --accent: #7c3aed;
    --accent2: #22c55e;
    --danger: #ef4444;
  }

  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
    background: radial-gradient(1200px 600px at 20% 10%, rgba(124,58,237,0.25), transparent 60%),
                radial-gradient(900px 500px at 90% 0%, rgba(34,197,94,0.18), transparent 60%),
                var(--bg);
    color: var(--text);
  }

  a { color: inherit; text-decoration: none; }
  button, input { font: inherit; }

  /* 반응형 글씨 기본 */
  h1 { font-size: clamp(22px, 2.2vw, 34px); margin: 0; }
  h2 { font-size: clamp(18px, 1.8vw, 26px); margin: 0; }
  p, li { font-size: clamp(14px, 1.2vw, 16px); line-height: 1.55; color: var(--muted); }
`;

export default GlobalStyle;