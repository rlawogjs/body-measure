import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root{
    --bg: #efebe3;
    --paper: #f8f5ef;
    --paper-2: #f3eee6;
    --card: #ece6dc;
    --card-strong: #e3dacd;
    --text: #4b4036;
    --muted: #7d7165;
    --line: #b7ab9d;
    --line-soft: #d5cabd;
    --accent: #6c5847;
    --accent-2: #9a836d;
    --accent-3: #d8c7b2;
    --shadow: 0 10px 24px rgba(88, 70, 52, 0.08);
    --shadow-soft: 0 6px 18px rgba(88, 70, 52, 0.05);
    --radius: 20px;
    --radius-sm: 12px;
    --max: 1080px;
  }

  *{
    box-sizing: border-box;
  }

  html, body, #root{
    margin: 0;
    padding: 0;
    min-height: 100%;
  }

  body{
    font-family: "Pretendard", "Noto Sans KR", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: var(--text);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 18%),
      repeating-linear-gradient(
        -45deg,
        rgba(109, 88, 71, 0.025) 0px,
        rgba(109, 88, 71, 0.025) 4px,
        rgba(255,255,255,0.02) 4px,
        rgba(255,255,255,0.02) 8px
      ),
      var(--bg);
  }

  a{
    color: inherit;
    text-decoration: none;
  }

  button, input, select{
    font: inherit;
  }

  img{
    max-width: 100%;
    display: block;
  }

  h1, h2, h3, h4, p{
    margin: 0;
  }

  h1{
    font-size: clamp(32px, 5vw, 60px);
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  h2{
    font-size: clamp(22px, 3vw, 34px);
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  h3{
    font-size: clamp(18px, 2vw, 24px);
    line-height: 1.2;
  }

  p{
    color: var(--muted);
    line-height: 1.7;
    font-size: 15px;
  }

  ::selection{
    background: rgba(108, 88, 71, 0.18);
  }
`;

export default GlobalStyle;