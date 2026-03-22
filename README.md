# B-MAS (Body Measure & Military Apparel System)

군 피복 치수 측정 및 지급 관리 프로토타입입니다.

## 현재 구조
- `src/`: React 프론트엔드
- `backend/`: FastAPI + SQLAlchemy 백엔드
- `src/api/serverApi.js`: 모든 서버 통신 진입점
- `src/api/measureApi.js`: 이미지 분석/측정 모의 엔진

## 실행 방법

### backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### frontend
```bash
cp .env.example .env
npm install
npm start
```

## 기본 계정
- 관리자: `admin1 / 1234`
- 군수담당: `logi1 / 1234`
- 병사: `soldier1 / 1234`

## 정리 사항
- 프론트 데이터 흐름을 `serverApi.js` 기준으로 통일
- 관리자 페이지를 실제 DB 조회/등록 기준으로 변경
- API 주소를 `.env` 기반으로 분리
- 불필요한 가상환경/캐시/임시 파일 제거
