import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #efebe3;
    --paper: #f8f5ef;
    --paper-2: #f2ece2;
    --card: #ece4d8;
    --text: #4d4035;
    --muted: #7d6f61;
    --line: #c2b5a6;
    --line-soft: #ddd4c8;
    --accent: #675242;
    --accent-2: #8b725d;
    --accent-3: #d7c9b8;
    --ok: #5f775d;
    --warn: #9b6a32;
    --danger: #8d4b42;
    --shadow: 0 14px 32px rgba(96, 76, 56, 0.08);
    --shadow-soft: 0 10px 24px rgba(96, 76, 56, 0.06);
    --max: 1120px;
  }

  * { box-sizing: border-box; min-width: 0; }

  html {
    overflow-x: hidden;
  }

  html, body, #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    overflow-x: hidden;
    font-family: "Pretendard", "Noto Sans KR", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: var(--text);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 18%),
      repeating-linear-gradient(
        -45deg,
        rgba(108, 82, 66, 0.024) 0px,
        rgba(108, 82, 66, 0.024) 5px,
        rgba(255,255,255,0.04) 5px,
        rgba(255,255,255,0.04) 10px
      ),
      var(--bg);
  }

  a { color: inherit; text-decoration: none; }
  button, input, select, textarea { font: inherit; }
  img, svg, canvas { display: block; max-width: 100%; }
  input, select, textarea { max-width: 100%; }

  h1, h2, h3, h4, p { margin: 0; }
  h1 { font-size: clamp(30px, 4vw, 52px); line-height: 1.04; letter-spacing: -0.03em; }
  h2 { font-size: clamp(22px, 2.7vw, 34px); line-height: 1.12; letter-spacing: -0.02em; }
  h3 { font-size: clamp(18px, 2vw, 24px); line-height: 1.15; }
  p, li, span, div { overflow-wrap: anywhere; }
  p, li { color: var(--muted); font-size: 15px; line-height: 1.7; }

  strong, h1, h2, h3, h4 {
    word-break: keep-all;
  }

  @media (max-width: 640px) {
    p, li { font-size: 14px; line-height: 1.6; }
  }

  ::selection { background: rgba(103, 82, 66, 0.18); }
`;

export default GlobalStyle;
